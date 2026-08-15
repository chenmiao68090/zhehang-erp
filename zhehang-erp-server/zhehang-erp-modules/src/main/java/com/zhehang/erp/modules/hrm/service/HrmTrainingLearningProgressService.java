package com.zhehang.erp.modules.hrm.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.hrm.domain.entity.HrmTrainingCourse;
import com.zhehang.erp.modules.hrm.domain.entity.HrmTrainingLearningRecord;
import com.zhehang.erp.modules.hrm.domain.entity.HrmTrainingLearningStep;
import com.zhehang.erp.modules.hrm.domain.entity.HrmTrainingMaterial;
import com.zhehang.erp.modules.hrm.mapper.HrmTrainingLearningRecordMapper;
import com.zhehang.erp.modules.hrm.mapper.HrmTrainingLearningStepMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class HrmTrainingLearningProgressService {

    private static final String STATUS_LEARNING = "学习中";
    private static final int MAX_STEPS_PER_REQUEST = 500;
    private static final Pattern PPT_SEPARATOR = Pattern.compile(
            "(?m)^\\s*=+\\s*第\\s*\\d+\\s*页\\s*=+\\s*$");
    private static final Pattern PPT_PAGE_TITLE = Pattern.compile(
            "(?m)^\\s*第\\s*\\d+\\s*页[：:].*$");
    private static final Pattern VIDEO_EXTENSION = Pattern.compile(
            "(?i)\\.(mp4|webm|ogg)(?:[?#].*)?$");

    private final HrmTrainingLearningStepMapper stepMapper;
    private final HrmTrainingLearningRecordMapper learningMapper;
    private final ObjectMapper objectMapper;
    private final HrmTrainingVideoProgressService videoProgressService;

    public ProgressSnapshot snapshot(HrmTrainingLearningRecord record,
                                     HrmTrainingCourse course,
                                     List<HrmTrainingMaterial> materials) {
        requireContext(record, course);
        List<HrmTrainingMaterial> safeMaterials = enabledMaterials(materials);
        int studyCycle = studyCycle(record);
        String courseVersion = courseVersion(record, course);
        Map<Long, HrmTrainingMaterial> materialMap = materialMap(safeMaterials);
        Map<Long, Integer> stepCounts = materialStepCounts(safeMaterials);

        List<HrmTrainingLearningStep> stored = stepMapper.selectList(
                new LambdaQueryWrapper<HrmTrainingLearningStep>()
                        .eq(HrmTrainingLearningStep::getLearningRecordId, record.getId())
                        .eq(HrmTrainingLearningStep::getEmployeeId, record.getEmployeeId())
                        .eq(HrmTrainingLearningStep::getCourseId, course.getId())
                        .eq(HrmTrainingLearningStep::getStudyCycle, studyCycle)
                        .eq(HrmTrainingLearningStep::getCourseVersion, courseVersion)
                        .orderByAsc(HrmTrainingLearningStep::getLastSeenTime)
                        .orderByAsc(HrmTrainingLearningStep::getId));

        List<HrmTrainingLearningStep> validStored = stored.stream()
                .filter(step -> validStoredStep(step, materialMap, stepCounts))
                .toList();
        Set<String> completed = validStored.stream()
                .filter(step -> Boolean.TRUE.equals(step.getCompleted()))
                .map(step -> key(step.getMaterialId(), step.getStepIndex()))
                .collect(java.util.stream.Collectors.toCollection(LinkedHashSet::new));
        Set<String> required = requiredStepKeys(safeMaterials, stepCounts);
        long requiredDone = required.stream().filter(completed::contains).count();
        int progressPercent = required.isEmpty()
                ? 30
                : Math.min(99, Math.max(30, (int) Math.round(requiredDone * 100.0 / required.size())));

        Position lastPosition = validStored.stream()
                .max(Comparator.comparing(HrmTrainingLearningStep::getLastSeenTime,
                                Comparator.nullsFirst(Comparator.naturalOrder()))
                        .thenComparing(HrmTrainingLearningStep::getId,
                                Comparator.nullsFirst(Comparator.naturalOrder())))
                .map(step -> new Position(step.getMaterialId(), step.getStepIndex()))
                .orElse(null);
        List<StepView> steps = validStored.stream()
                .map(step -> new StepView(step.getMaterialId(), step.getStepIndex(), step.getStepType(),
                        Boolean.TRUE.equals(step.getCompleted()), step.getPositionSeconds(),
                        step.getDurationSeconds(), step.getValidWatchedSeconds(), step.getCoveragePercent(),
                        step.getPlaybackRate(), step.getDeviceType(),
                        step.getCompletedTime(), step.getLastSeenTime()))
                .toList();

        return new ProgressSnapshot(record.getId(), course.getId(), courseVersion, studyCycle,
                required.size(), (int) requiredDone, !required.isEmpty() && requiredDone == required.size(),
                progressPercent, lastPosition, steps);
    }

    public ProgressSnapshot saveProgress(HrmTrainingLearningRecord record,
                                         HrmTrainingCourse course,
                                         List<HrmTrainingMaterial> materials,
                                         List<StepInput> requestedSteps,
                                         String requestedSource) {
        requireContext(record, course);
        if (!STATUS_LEARNING.equals(record.getStatus())) {
            throw new BusinessException("当前学习任务不能记录课件进度");
        }
        if (requestedSteps == null || requestedSteps.isEmpty()) {
            throw new BusinessException("请选择要记录的学习步骤");
        }
        if (requestedSteps.size() > MAX_STEPS_PER_REQUEST) {
            throw new BusinessException("单次最多记录500个学习步骤");
        }
        List<HrmTrainingMaterial> safeMaterials = enabledMaterials(materials);
        Map<Long, HrmTrainingMaterial> materialMap = materialMap(safeMaterials);
        Map<Long, Integer> stepCounts = materialStepCounts(safeMaterials);
        String source = "LEGACY_LOCAL".equalsIgnoreCase(requestedSource)
                ? "LEGACY_LOCAL" : "INTERACTION";
        String courseVersion = courseVersion(record, course);
        int studyCycle = studyCycle(record);
        LinkedHashMap<String, StepInput> normalized = new LinkedHashMap<>();
        for (StepInput step : requestedSteps) {
            validateStep(step, materialMap, stepCounts);
            normalized.put(key(step.materialId(), step.stepIndex()), step);
        }

        LocalDateTime now = LocalDateTime.now();
        for (StepInput input : normalized.values()) {
            HrmTrainingMaterial material = materialMap.get(input.materialId());
            HrmTrainingLearningStep step = new HrmTrainingLearningStep();
            step.setLearningRecordId(record.getId());
            step.setEmployeeId(record.getEmployeeId());
            step.setEmployeeUserId(record.getEmployeeUserId());
            step.setCourseId(course.getId());
            step.setCourseVersion(courseVersion);
            step.setStudyCycle(studyCycle);
            step.setMaterialId(input.materialId());
            step.setStepIndex(input.stepIndex());
            step.setStepType(stepType(material));
            step.setSource(source);
            if ("VIDEO".equals(step.getStepType())) {
                HrmTrainingLearningStep stored = stepMapper.selectForUpdate(record.getTenantId(), record.getId(),
                        studyCycle, courseVersion, input.materialId(), input.stepIndex());
                videoProgressService.apply(step, stored, material, input, now);
            } else {
                step.setCompleted(true);
                step.setPositionSeconds(null);
                step.setValidWatchedSeconds(0);
                step.setCoveragePercent(0);
                step.setCompletedTime(now);
            }
            step.setLastSeenTime(now);
            step.setCreateTime(now);
            step.setUpdateTime(now);
            step.setCreateBy(record.getEmployeeUserId());
            step.setUpdateBy(record.getEmployeeUserId());
            step.setTenantId(record.getTenantId());
            stepMapper.upsert(step);
        }

        ProgressSnapshot snapshot = snapshot(record, course, safeMaterials);
        learningMapper.raiseLearningProgress(record.getId(), record.getEmployeeId(), record.getTenantId(),
                snapshot.progressPercent());
        record.setProgressPercent(Math.max(value(record.getProgressPercent()), snapshot.progressPercent()));
        return snapshot;
    }

    public void requireAllRequiredCompleted(HrmTrainingLearningRecord record,
                                            HrmTrainingCourse course,
                                            List<HrmTrainingMaterial> materials) {
        ProgressSnapshot snapshot = snapshot(record, course, materials);
        if (snapshot.requiredStepCount() == 0) {
            throw new BusinessException("课程尚未配置必学课件，请联系培训管理员");
        }
        if (!snapshot.allRequiredCompleted()) {
            int remaining = snapshot.requiredStepCount() - snapshot.completedRequiredStepCount();
            throw new BusinessException("还有" + remaining + "项必学内容未完成，请继续学习");
        }
    }

    private void requireContext(HrmTrainingLearningRecord record, HrmTrainingCourse course) {
        if (record == null || record.getId() == null || record.getEmployeeId() == null
                || record.getTenantId() == null) {
            throw new BusinessException("学习记录信息不完整");
        }
        if (course == null || course.getId() == null || !Objects.equals(record.getCourseId(), course.getId())) {
            throw new BusinessException("学习记录与课程不匹配");
        }
    }

    private List<HrmTrainingMaterial> enabledMaterials(List<HrmTrainingMaterial> materials) {
        if (materials == null) {
            return new ArrayList<>();
        }
        return materials.stream()
                .filter(Objects::nonNull)
                .filter(item -> item.getId() != null && Boolean.TRUE.equals(item.getEnabled()))
                .toList();
    }

    private Map<Long, HrmTrainingMaterial> materialMap(List<HrmTrainingMaterial> materials) {
        Map<Long, HrmTrainingMaterial> result = new LinkedHashMap<>();
        materials.forEach(item -> result.put(item.getId(), item));
        return result;
    }

    private Map<Long, Integer> materialStepCounts(List<HrmTrainingMaterial> materials) {
        Map<Long, Integer> result = new LinkedHashMap<>();
        materials.forEach(item -> result.put(item.getId(), stepCount(item)));
        return result;
    }

    private boolean validStoredStep(HrmTrainingLearningStep step,
                                    Map<Long, HrmTrainingMaterial> materialMap,
                                    Map<Long, Integer> stepCounts) {
        if (step == null || step.getMaterialId() == null || step.getStepIndex() == null) {
            return false;
        }
        HrmTrainingMaterial material = materialMap.get(step.getMaterialId());
        return material != null && step.getStepIndex() >= 0
                && step.getStepIndex() < stepCounts.getOrDefault(material.getId(), 1);
    }

    private void validateStep(StepInput step,
                              Map<Long, HrmTrainingMaterial> materialMap,
                              Map<Long, Integer> stepCounts) {
        if (step == null || step.materialId() == null || step.stepIndex() == null) {
            throw new BusinessException("学习步骤信息不完整");
        }
        HrmTrainingMaterial material = materialMap.get(step.materialId());
        if (material == null) {
            throw new BusinessException("课件不属于当前课程或已停用");
        }
        if (step.stepIndex() < 0 || step.stepIndex() >= stepCounts.getOrDefault(material.getId(), 1)) {
            throw new BusinessException("课件页码超出有效范围");
        }
        validatePositionSeconds(step.positionSeconds());
    }

    private Set<String> requiredStepKeys(List<HrmTrainingMaterial> materials,
                                         Map<Long, Integer> stepCounts) {
        Set<String> result = new LinkedHashSet<>();
        for (HrmTrainingMaterial material : materials) {
            if (Boolean.FALSE.equals(material.getRequiredMaterial())) {
                continue;
            }
            for (int index = 0; index < stepCounts.getOrDefault(material.getId(), 1); index++) {
                result.add(key(material.getId(), index));
            }
        }
        return result;
    }

    private int studyCycle(HrmTrainingLearningRecord record) {
        return Math.max(1, value(record.getCurrentAttempt()) + 1);
    }

    private String courseVersion(HrmTrainingLearningRecord record, HrmTrainingCourse course) {
        if (StringUtils.hasText(record.getCourseVersion())) {
            return record.getCourseVersion().trim();
        }
        return StringUtils.hasText(course.getVersionNo()) ? course.getVersionNo().trim() : "v1.0";
    }

    private String stepType(HrmTrainingMaterial material) {
        if (isPpt(material)) {
            return "PPT_SLIDE";
        }
        return isVideo(material) ? "VIDEO" : "MATERIAL";
    }

    private int stepCount(HrmTrainingMaterial material) {
        if (!isPpt(material)) {
            return 1;
        }
        String raw = material.getMaterialContent() == null ? "" : material.getMaterialContent().trim();
        if (!StringUtils.hasText(raw)) {
            return 1;
        }
        try {
            JsonNode root = objectMapper.readTree(raw);
            JsonNode slides = root == null ? null : root.get("slides");
            if (slides != null && slides.isArray() && !slides.isEmpty()) {
                return clampStepCount(slides.size());
            }
        } catch (Exception ignored) {
            // 旧课件是分隔文本，继续按页标题统计。
        }
        int separated = countMatches(PPT_SEPARATOR.matcher(raw));
        if (separated > 0) {
            return clampStepCount(separated);
        }
        int titled = countMatches(PPT_PAGE_TITLE.matcher(raw));
        return clampStepCount(Math.max(titled, 1));
    }

    private boolean isPpt(HrmTrainingMaterial material) {
        String type = String.valueOf(material.getMaterialType()).toUpperCase();
        String fileName = String.valueOf(material.getFileName()).toLowerCase();
        String materialName = String.valueOf(material.getMaterialName()).toLowerCase();
        return "PPT".equals(type)
                || fileName.endsWith(".ppt") || fileName.endsWith(".pptx")
                || materialName.endsWith(".ppt") || materialName.endsWith(".pptx");
    }

    private boolean isVideo(HrmTrainingMaterial material) {
        if ("VIDEO".equalsIgnoreCase(material.getMaterialType())) {
            return true;
        }
        return VIDEO_EXTENSION.matcher(String.valueOf(material.getFileName())).find()
                || VIDEO_EXTENSION.matcher(String.valueOf(material.getMaterialName())).find()
                || VIDEO_EXTENSION.matcher(String.valueOf(material.getMaterialUrl())).find();
    }

    private int countMatches(Matcher matcher) {
        int count = 0;
        while (matcher.find() && count < MAX_STEPS_PER_REQUEST) {
            count++;
        }
        return count;
    }

    private int clampStepCount(int count) {
        return Math.max(1, Math.min(MAX_STEPS_PER_REQUEST, count));
    }

    private String key(Long materialId, Integer stepIndex) {
        return materialId + ":" + stepIndex;
    }

    private int value(Integer value) {
        return value == null ? 0 : value;
    }

    private Integer validatePositionSeconds(Integer positionSeconds) {
        if (positionSeconds == null) {
            return null;
        }
        if (positionSeconds < 0 || positionSeconds > 86_400) {
            throw new BusinessException("视频播放位置超出有效范围");
        }
        return positionSeconds;
    }

    public record StepInput(Long materialId,
                            Integer stepIndex,
                            Boolean completed,
                            Integer positionSeconds,
                            Integer durationSeconds,
                            String eventType,
                            String playbackSessionId,
                            Double playbackRate,
                            String deviceType) {
        public StepInput(Long materialId,
                         Integer stepIndex,
                         Boolean completed,
                         Integer positionSeconds) {
            this(materialId, stepIndex, completed, positionSeconds,
                    null, null, null, null, null);
        }
    }

    public record Position(Long materialId, Integer stepIndex) { }

    public record StepView(Long materialId,
                           Integer stepIndex,
                           String stepType,
                           Boolean completed,
                           Integer positionSeconds,
                           Integer durationSeconds,
                           Integer validWatchedSeconds,
                           Integer coveragePercent,
                           java.math.BigDecimal playbackRate,
                           String deviceType,
                           LocalDateTime completedTime,
                           LocalDateTime lastSeenTime) { }

    public record ProgressSnapshot(Long learningRecordId,
                                   Long courseId,
                                   String courseVersion,
                                   Integer studyCycle,
                                   Integer requiredStepCount,
                                   Integer completedRequiredStepCount,
                                   Boolean allRequiredCompleted,
                                   Integer progressPercent,
                                   Position lastPosition,
                                   List<StepView> steps) { }
}
