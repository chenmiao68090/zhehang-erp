package com.zhehang.erp.modules.hrm.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.file.domain.entity.FileInfo;
import com.zhehang.erp.modules.file.service.IFileInfoService;
import com.zhehang.erp.modules.hrm.domain.entity.HrmSop;
import com.zhehang.erp.modules.hrm.domain.entity.HrmTrainingAnswer;
import com.zhehang.erp.modules.hrm.domain.entity.HrmTrainingCertification;
import com.zhehang.erp.modules.hrm.domain.entity.HrmTrainingCourse;
import com.zhehang.erp.modules.hrm.domain.entity.HrmTrainingCreditLog;
import com.zhehang.erp.modules.hrm.domain.entity.HrmTrainingExamQuestion;
import com.zhehang.erp.modules.hrm.domain.entity.HrmTrainingExamRecord;
import com.zhehang.erp.modules.hrm.domain.entity.HrmTrainingHomework;
import com.zhehang.erp.modules.hrm.domain.entity.HrmTrainingHomeworkSubmission;
import com.zhehang.erp.modules.hrm.domain.entity.HrmTrainingLearningRecord;
import com.zhehang.erp.modules.hrm.domain.entity.HrmTrainingLearningStep;
import com.zhehang.erp.modules.hrm.domain.entity.HrmTrainingMaterial;
import com.zhehang.erp.modules.hrm.domain.entity.HrmTrainingPath;
import com.zhehang.erp.modules.hrm.domain.entity.HrmTrainingPathCourse;
import com.zhehang.erp.modules.hrm.domain.entity.HrmTrainingSkill;
import com.zhehang.erp.modules.hrm.domain.entity.HrmTrainingSkillCourse;
import com.zhehang.erp.modules.hrm.mapper.HrmSopMapper;
import com.zhehang.erp.modules.hrm.mapper.HrmTrainingAnswerMapper;
import com.zhehang.erp.modules.hrm.mapper.HrmTrainingCertificationMapper;
import com.zhehang.erp.modules.hrm.mapper.HrmTrainingCourseMapper;
import com.zhehang.erp.modules.hrm.mapper.HrmTrainingCreditLogMapper;
import com.zhehang.erp.modules.hrm.mapper.HrmTrainingExamQuestionMapper;
import com.zhehang.erp.modules.hrm.mapper.HrmTrainingExamRecordMapper;
import com.zhehang.erp.modules.hrm.mapper.HrmTrainingHomeworkMapper;
import com.zhehang.erp.modules.hrm.mapper.HrmTrainingHomeworkSubmissionMapper;
import com.zhehang.erp.modules.hrm.mapper.HrmTrainingLearningRecordMapper;
import com.zhehang.erp.modules.hrm.mapper.HrmTrainingLearningStepMapper;
import com.zhehang.erp.modules.hrm.mapper.HrmTrainingMaterialMapper;
import com.zhehang.erp.modules.hrm.mapper.HrmTrainingPathCourseMapper;
import com.zhehang.erp.modules.hrm.mapper.HrmTrainingPathMapper;
import com.zhehang.erp.modules.hrm.mapper.HrmTrainingSkillCourseMapper;
import com.zhehang.erp.modules.hrm.mapper.HrmTrainingSkillMapper;
import com.zhehang.erp.modules.hrm.service.HrmTrainingLearningProgressService;
import com.zhehang.erp.modules.hrm.service.HrmTrainingNotificationService;
import com.zhehang.erp.modules.hrm.service.HrmTrainingVideoPlaybackService;
import com.zhehang.erp.modules.hrm.service.HrmTrainingVideoUploadService;
import com.zhehang.erp.modules.org.domain.entity.OrgEmployee;
import com.zhehang.erp.modules.org.mapper.OrgEmployeeMapper;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.File;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/hrm/training/courseware")
@RequiredArgsConstructor
@Slf4j
public class HrmTrainingCourseController {
    private static final Set<String> SAFE_INLINE_MIME_TYPES = Set.of(
            "image/jpeg", "image/png", "image/gif", "image/webp");

    private static final String STATUS_NOT_STARTED = "未开始";
    private static final String STATUS_LEARNING = "学习中";
    private static final String STATUS_LEARNED = "已学完";
    private static final String STATUS_PENDING_HOMEWORK = "待作业";
    private static final String STATUS_PENDING_REVIEW = "待人工评分";
    private static final String STATUS_PASSED = "已通过";
    private static final String STATUS_FAILED = "未通过";
    private static final String STATUS_RETRAIN = "复训中";

    private static final String REVIEW_NONE = "无需评分";
    private static final String REVIEW_PENDING = "待评分";
    private static final String REVIEW_DONE = "已评分";

    private static final String HOMEWORK_TODO = "待提交";
    private static final String HOMEWORK_REVIEW = "待评分";
    private static final String HOMEWORK_PASSED = "已通过";
    private static final String HOMEWORK_FAILED = "未通过";

    private static final String TYPE_SINGLE = "SINGLE";
    private static final String TYPE_MULTIPLE = "MULTIPLE";
    private static final String TYPE_JUDGE = "JUDGE";
    private static final String TYPE_THINKING = "THINKING";

    private final HrmTrainingCourseMapper courseMapper;
    private final HrmTrainingMaterialMapper materialMapper;
    private final HrmTrainingExamQuestionMapper questionMapper;
    private final HrmTrainingLearningRecordMapper learningMapper;
    private final HrmTrainingLearningStepMapper learningStepMapper;
    private final HrmTrainingExamRecordMapper examMapper;
    private final HrmTrainingAnswerMapper answerMapper;
    private final HrmTrainingHomeworkMapper homeworkMapper;
    private final HrmTrainingHomeworkSubmissionMapper homeworkSubmissionMapper;
    private final HrmTrainingPathMapper pathMapper;
    private final HrmTrainingPathCourseMapper pathCourseMapper;
    private final HrmTrainingCertificationMapper certificationMapper;
    private final HrmTrainingSkillMapper skillMapper;
    private final HrmTrainingSkillCourseMapper skillCourseMapper;
    private final HrmTrainingCreditLogMapper creditLogMapper;
    private final HrmSopMapper sopMapper;
    private final OrgEmployeeMapper employeeMapper;
    private final IFileInfoService fileInfoService;
    private final DataScopeHelper dataScopeHelper;
    private final HrmTrainingLearningProgressService learningProgressService;
    private final HrmTrainingNotificationService trainingNotificationService;
    private final HrmTrainingVideoUploadService trainingVideoUploadService;
    private final HrmTrainingVideoPlaybackService trainingVideoPlaybackService;
    private final ObjectMapper objectMapper;

    @GetMapping("/courses")
    public R<IPage<HrmTrainingCourse>> courses(@RequestParam(defaultValue = "1") Integer pageNum,
                                               @RequestParam(defaultValue = "20") Integer pageSize,
                                               @RequestParam(required = false) String keyword,
                                               @RequestParam(required = false) String position,
                                               @RequestParam(required = false) String scenario,
                                               @RequestParam(required = false) String category,
                                               @RequestParam(required = false) String stage,
                                               @RequestParam(required = false) String courseStatus,
                                               @RequestParam(required = false) Boolean enabled,
                                               @RequestParam(required = false) Boolean requiredCourse) {
        LambdaQueryWrapper<HrmTrainingCourse> wrapper = new LambdaQueryWrapper<HrmTrainingCourse>()
                .and(StringUtils.hasText(keyword), w -> w.like(HrmTrainingCourse::getCourseTitle, keyword)
                        .or()
                        .like(HrmTrainingCourse::getCourseCode, keyword)
                        .or()
                        .like(HrmTrainingCourse::getSopTitle, keyword)
                        .or()
                        .like(HrmTrainingCourse::getSummary, keyword))
                .like(StringUtils.hasText(position), HrmTrainingCourse::getApplicablePositions, position)
                .eq(StringUtils.hasText(scenario), HrmTrainingCourse::getBusinessScenario, scenario)
                .eq(StringUtils.hasText(category), HrmTrainingCourse::getCourseCategory, category)
                .eq(StringUtils.hasText(stage), HrmTrainingCourse::getApplicableStage, stage)
                .eq(StringUtils.hasText(courseStatus), HrmTrainingCourse::getCourseStatus, courseStatus)
                .eq(enabled != null, HrmTrainingCourse::getEnabled, enabled)
                .eq(requiredCourse != null, HrmTrainingCourse::getRequiredCourse, requiredCourse)
                .eq(!canManage(), HrmTrainingCourse::getEnabled, true)
                .ne(!canManage(), HrmTrainingCourse::getCourseStatus, "草稿")
                .ne(!canManage(), HrmTrainingCourse::getCourseStatus, "已下架")
                .orderByDesc(HrmTrainingCourse::getUpdateTime)
                .orderByDesc(HrmTrainingCourse::getId);
        return R.ok(courseMapper.selectPage(new Page<>(pageNum, pageSize), wrapper));
    }

    @GetMapping("/courses/quality")
    public R<List<Map<String, Object>>> courseQuality(@RequestParam(required = false) String courseIds) {
        List<Long> ids = parseIds(courseIds);
        LambdaQueryWrapper<HrmTrainingCourse> wrapper = new LambdaQueryWrapper<HrmTrainingCourse>()
                .in(!ids.isEmpty(), HrmTrainingCourse::getId, ids)
                .eq(!canManage(), HrmTrainingCourse::getEnabled, true)
                .orderByDesc(HrmTrainingCourse::getUpdateTime);
        if (ids.isEmpty()) {
            wrapper.last("LIMIT 200");
        }
        List<HrmTrainingCourse> courses = courseMapper.selectList(wrapper);
        return R.ok(courses.stream().map(this::courseQualityMap).toList());
    }

    @GetMapping("/courses/{id}")
    @Transactional(rollbackFor = Exception.class)
    public R<Map<String, Object>> courseDetail(@PathVariable Long id) {
        HrmTrainingCourse course = requireCourse(id);
        if (!canManage() && !Boolean.TRUE.equals(course.getEnabled())) {
            throw new BusinessException("课程已停用");
        }
        if (!canManage()) {
            markCourseUsed(id);
            course = requireCourse(id);
        }
        return R.ok(buildCourseDetail(course, !canManage()));
    }

    @PostMapping("/courses")
    @Transactional(rollbackFor = Exception.class)
    @Log(module = "课件培训系统", type = Log.OperationType.INSERT)
    public R<Long> addCourse(@RequestBody CoursePayload request) {
        requireContentManage();
        HrmTrainingCourse course = buildCourse(request);
        course.setId(null);
        courseMapper.insert(course);
        saveCourseMaterials(course.getId(), request.getMaterials());
        saveCourseQuestions(course.getId(), request.getQuestions());
        return R.ok(course.getId());
    }

    @PutMapping("/courses")
    @Transactional(rollbackFor = Exception.class)
    @Log(module = "课件培训系统", type = Log.OperationType.UPDATE)
    public R<Long> editCourse(@RequestBody CoursePayload request) {
        requireContentManage();
        if (request == null || request.getId() == null) {
            throw new BusinessException("课程 ID 不能为空");
        }
        requireCourse(request.getId());
        HrmTrainingCourse course = buildCourse(request);
        course.setId(request.getId());
        courseMapper.updateById(course);
        questionMapper.delete(new LambdaQueryWrapper<HrmTrainingExamQuestion>().eq(HrmTrainingExamQuestion::getCourseId, request.getId()));
        saveCourseMaterials(request.getId(), request.getMaterials());
        saveCourseQuestions(request.getId(), request.getQuestions());
        return R.ok(request.getId());
    }

    @DeleteMapping("/courses/{id}")
    @Transactional(rollbackFor = Exception.class)
    @Log(module = "课件培训系统", type = Log.OperationType.DELETE)
    public R<Void> removeCourse(@PathVariable Long id) {
        requireContentManage();
        requireCourse(id);
        long learningCount = learningMapper.selectCount(new LambdaQueryWrapper<HrmTrainingLearningRecord>()
                .eq(HrmTrainingLearningRecord::getCourseId, id));
        if (learningCount > 0) {
            throw new BusinessException("课程已有学习记录，不能删除；请改为下架以保留员工档案");
        }
        long pathCount = pathCourseMapper.selectCount(new LambdaQueryWrapper<HrmTrainingPathCourse>()
                .eq(HrmTrainingPathCourse::getCourseId, id));
        if (pathCount > 0) {
            throw new BusinessException("课程仍在岗位路径中，请先从路径移除后再删除");
        }
        long skillCount = skillCourseMapper.selectCount(new LambdaQueryWrapper<HrmTrainingSkillCourse>()
                .eq(HrmTrainingSkillCourse::getCourseId, id));
        if (skillCount > 0) {
            throw new BusinessException("课程仍被岗位能力关联，请先解除关联后再删除");
        }
        courseMapper.deleteById(id);
        materialMapper.delete(new LambdaQueryWrapper<HrmTrainingMaterial>().eq(HrmTrainingMaterial::getCourseId, id));
        questionMapper.delete(new LambdaQueryWrapper<HrmTrainingExamQuestion>().eq(HrmTrainingExamQuestion::getCourseId, id));
        homeworkMapper.delete(new LambdaQueryWrapper<HrmTrainingHomework>().eq(HrmTrainingHomework::getCourseId, id));
        return R.ok();
    }

    @PostMapping("/courses/{id}/self-enroll")
    @Transactional(rollbackFor = Exception.class)
    @Log(module = "课件培训系统", type = Log.OperationType.INSERT)
    public R<Map<String, Integer>> selfEnroll(@PathVariable Long id) {
        HrmTrainingCourse course = requireCourse(id);
        if (!Boolean.TRUE.equals(course.getEnabled()) || !"已发布".equals(course.getCourseStatus())) {
            throw new BusinessException("课程尚未发布");
        }
        if (Boolean.TRUE.equals(course.getRequiredCourse())) {
            throw new BusinessException("必修课程由主管或培训管理员统一分配");
        }
        Long employeeId = requireCurrentEmployeeId();
        Long existing = learningMapper.selectCount(new LambdaQueryWrapper<HrmTrainingLearningRecord>()
                .eq(HrmTrainingLearningRecord::getEmployeeId, employeeId)
                .eq(HrmTrainingLearningRecord::getCourseId, id));
        if (existing != null && existing > 0) {
            Map<String, Integer> result = new HashMap<>();
            result.put("assigned", 0);
            result.put("skipped", 1);
            return R.ok(result);
        }
        return R.ok(assignCourseRecords(List.of(employeeId), List.of(course), null, null));
    }

    @PostMapping("/assign")
    @Transactional(rollbackFor = Exception.class)
    @Log(module = "课件培训系统", type = Log.OperationType.INSERT)
    public R<Map<String, Integer>> assignCourses(@RequestBody AssignCourseRequest request) {
        requireManage();
        if (request == null || request.getEmployeeIds() == null || request.getEmployeeIds().isEmpty()) {
            throw new BusinessException("请选择要学习的员工");
        }
        if (request.getCourseIds() == null || request.getCourseIds().isEmpty()) {
            throw new BusinessException("请选择课程");
        }
        if (request.getDueTime() != null && request.getDueTime().isBefore(LocalDateTime.now())) {
            throw new BusinessException("截止时间不能早于当前时间");
        }
        List<HrmTrainingCourse> courses = courseMapper.selectList(new LambdaQueryWrapper<HrmTrainingCourse>()
                .in(HrmTrainingCourse::getId, request.getCourseIds())
                .eq(HrmTrainingCourse::getEnabled, true));
        if (courses.size() != request.getCourseIds().stream().filter(Objects::nonNull).distinct().count()) {
            throw new BusinessException("部分课程不存在或已停用，请刷新课程列表后重试");
        }
        return R.ok(assignCourseRecords(request.getEmployeeIds(), courses, request.getDueTime(), null));
    }

    @GetMapping("/learning-records")
    public R<IPage<HrmTrainingLearningRecord>> learningRecords(@RequestParam(defaultValue = "1") Integer pageNum,
                                                               @RequestParam(defaultValue = "20") Integer pageSize,
                                                               @RequestParam(required = false) Long employeeId,
                                                               @RequestParam(required = false) Long courseId,
                                                               @RequestParam(required = false) String status,
                                                               @RequestParam(required = false) Boolean passed,
                                                               @RequestParam(required = false) String dueRisk,
                                                               @RequestParam(required = false) String keyword) {
        boolean manager = canManage();
        boolean dueRiskFilter = "OVERDUE".equalsIgnoreCase(dueRisk) || "DUE_SOON".equalsIgnoreCase(dueRisk);
        LocalDateTime now = LocalDateTime.now();
        LambdaQueryWrapper<HrmTrainingLearningRecord> wrapper = new LambdaQueryWrapper<HrmTrainingLearningRecord>()
                .eq(employeeId != null && manager, HrmTrainingLearningRecord::getEmployeeId, employeeId)
                .eq(courseId != null, HrmTrainingLearningRecord::getCourseId, courseId)
                .eq(StringUtils.hasText(status), HrmTrainingLearningRecord::getStatus, status)
                .eq(passed != null, HrmTrainingLearningRecord::getPassed, passed)
                .in(dueRiskFilter, HrmTrainingLearningRecord::getStatus,
                        STATUS_NOT_STARTED, STATUS_LEARNING, STATUS_LEARNED, STATUS_PENDING_HOMEWORK,
                        STATUS_PENDING_REVIEW, STATUS_RETRAIN)
                .lt("OVERDUE".equalsIgnoreCase(dueRisk), HrmTrainingLearningRecord::getDueTime, now)
                .ge("DUE_SOON".equalsIgnoreCase(dueRisk), HrmTrainingLearningRecord::getDueTime, now)
                .le("DUE_SOON".equalsIgnoreCase(dueRisk), HrmTrainingLearningRecord::getDueTime, now.plusDays(2))
                .and(StringUtils.hasText(keyword), w -> w.like(HrmTrainingLearningRecord::getEmployeeName, keyword)
                        .or()
                        .like(HrmTrainingLearningRecord::getCourseTitle, keyword)
                        .or()
                        .like(HrmTrainingLearningRecord::getSopTitle, keyword)
                        .or()
                        .like(HrmTrainingLearningRecord::getPathName, keyword))
                .orderByAsc(HrmTrainingLearningRecord::getPassed)
                .orderByDesc(HrmTrainingLearningRecord::getRetrainRequired)
                .orderByAsc(HrmTrainingLearningRecord::getDueTime)
                .orderByDesc(HrmTrainingLearningRecord::getId);
        if (manager) {
            applyLearningScope(wrapper);
        } else {
            wrapper.eq(HrmTrainingLearningRecord::getEmployeeId, requireCurrentEmployeeId());
        }
        return R.ok(learningMapper.selectPage(new Page<>(pageNum, pageSize), wrapper));
    }

    @PostMapping("/learning-records/{id}/start")
    @Transactional(rollbackFor = Exception.class)
    @Log(module = "课件培训系统", type = Log.OperationType.UPDATE)
    public R<Void> startLearning(@PathVariable Long id) {
        HrmTrainingLearningRecord record = requireLearning(id);
        requireOwnLearningAccess(record);
        ensurePathUnlocked(record);
        if (Boolean.TRUE.equals(record.getPassed())) {
            throw new BusinessException("已通过的课程无需重新学习");
        }
        if (STATUS_FAILED.equals(record.getStatus())) {
            throw new BusinessException("该课程已达到最大考试次数，请联系主管处理");
        }
        if (!List.of(STATUS_NOT_STARTED, STATUS_LEARNING, STATUS_RETRAIN).contains(record.getStatus())) {
            throw new BusinessException("当前任务状态不能开始学习");
        }
        if (record.getStartedTime() == null) {
            record.setStartedTime(LocalDateTime.now());
        }
        record.setStatus(STATUS_LEARNING);
        record.setProgressPercent(Math.max(nvl(record.getProgressPercent()), 30));
        learningMapper.updateById(record);
        markCourseUsed(record.getCourseId());
        return R.ok();
    }

    @GetMapping("/learning-records/{id}/progress")
    public R<HrmTrainingLearningProgressService.ProgressSnapshot> learningProgress(@PathVariable Long id) {
        HrmTrainingLearningRecord record = requireLearning(id);
        requireOwnLearningAccess(record);
        ensurePathUnlocked(record);
        HrmTrainingCourse course = requireCourse(record.getCourseId());
        return R.ok(learningProgressService.snapshot(record, course, enabledMaterials(course.getId())));
    }

    @PostMapping("/learning-records/{id}/progress")
    @Transactional(rollbackFor = Exception.class)
    public R<HrmTrainingLearningProgressService.ProgressSnapshot> saveLearningProgress(
            @PathVariable Long id, @RequestBody LearningProgressRequest request) {
        HrmTrainingLearningRecord record = requireLearning(id);
        requireOwnLearningAccess(record);
        ensurePathUnlocked(record);
        HrmTrainingCourse course = requireCourse(record.getCourseId());
        List<HrmTrainingLearningProgressService.StepInput> steps = request == null || request.getSteps() == null
                ? null
                : request.getSteps().stream()
                .map(item -> item == null ? null
                        : new HrmTrainingLearningProgressService.StepInput(item.getMaterialId(), item.getStepIndex(),
                        item.getCompleted(), item.getPositionSeconds(), item.getDurationSeconds(),
                        item.getEventType(), item.getPlaybackSessionId(), item.getPlaybackRate(),
                        item.getDeviceType()))
                .toList();
        return R.ok(learningProgressService.saveProgress(record, course, enabledMaterials(course.getId()),
                steps, request == null ? null : request.getSource()));
    }

    @PostMapping("/learning-records/{id}/finish")
    @Transactional(rollbackFor = Exception.class)
    @Log(module = "课件培训系统", type = Log.OperationType.UPDATE)
    public R<Void> finishLearning(@PathVariable Long id) {
        HrmTrainingLearningRecord record = requireLearning(id);
        requireOwnLearningAccess(record);
        ensurePathUnlocked(record);
        if (Boolean.TRUE.equals(record.getPassed())) {
            throw new BusinessException("已通过的课程无需重复标记学完");
        }
        if (!STATUS_LEARNING.equals(record.getStatus())) {
            throw new BusinessException("请先开始学习并完成全部必学课件");
        }
        HrmTrainingCourse course = requireCourse(record.getCourseId());
        learningProgressService.requireAllRequiredCompleted(record, course, enabledMaterials(course.getId()));
        LocalDateTime now = LocalDateTime.now();
        if (record.getStartedTime() == null) {
            record.setStartedTime(now);
        }
        record.setCompletedTime(now);
        record.setProgressPercent(100);
        record.setStatus(STATUS_LEARNED);
        record.setRetrainRequired(false);
        learningMapper.updateById(record);
        markCourseUsed(record.getCourseId());
        return R.ok();
    }

    @GetMapping("/learning-records/{id}/exam")
    public R<Map<String, Object>> learningExam(@PathVariable Long id) {
        HrmTrainingLearningRecord record = requireLearning(id);
        requireOwnLearningAccess(record);
        ensurePathUnlocked(record);
        HrmTrainingCourse course = requireCourse(record.getCourseId());
        List<HrmTrainingExamQuestion> questions = enabledQuestions(course.getId());
        questions.forEach(this::hideQuestionAnswer);
        Map<String, Object> data = new HashMap<>();
        data.put("record", record);
        data.put("course", course);
        List<HrmTrainingMaterial> materials = enabledMaterials(course.getId());
        data.put("learningProgress", learningProgressService.snapshot(record, course, materials));
        if (!canManage()) {
            materials.forEach(this::hideProtectedMaterialFile);
        }
        data.put("materials", materials);
        data.put("homeworks", homeworkMapper.selectList(new LambdaQueryWrapper<HrmTrainingHomework>()
                .eq(HrmTrainingHomework::getCourseId, course.getId())
                .eq(!canManage(), HrmTrainingHomework::getEnabled, true)
                .orderByAsc(HrmTrainingHomework::getSortOrder)
                .orderByAsc(HrmTrainingHomework::getId)));
        data.put("questions", questions);
        HrmTrainingExamRecord lastExam = record.getLastExamRecordId() == null
                ? null
                : examMapper.selectById(record.getLastExamRecordId());
        data.put("lastExam", lastExam);
        data.put("wrongQuestions", lastExam == null
                ? new ArrayList<>()
                : readWrongQuestions(lastExam.getWrongQuestionsJson()));
        return R.ok(data);
    }

    @GetMapping("/materials/{id}/inline")
    public ResponseEntity<Resource> inlineMaterial(@PathVariable Long id) {
        HrmTrainingMaterial material = materialMapper.selectById(id);
        if (material == null || !Boolean.TRUE.equals(material.getEnabled())) {
            throw new BusinessException("课件材料不存在或已停用");
        }
        HrmTrainingCourse course = requireCourse(material.getCourseId());
        requireMaterialAccess(course);
        if (!canManage() && (isPptMaterial(material) || isVideoMaterial(material))) {
            throw new BusinessException("员工端不提供课件原文件预览或下载，请在系统内完成学习");
        }
        if (material.getFileId() == null) {
            throw new BusinessException("该课件没有可预览文件");
        }
        return inlineFileResponse(fileInfoService.readFile(material.getFileId()));
    }

    @PostMapping("/video/uploads/init")
    @Log(module = "课件培训系统", type = Log.OperationType.INSERT)
    public R<HrmTrainingVideoUploadService.UploadSession> initVideoUpload(
            @RequestBody HrmTrainingVideoUploadService.InitRequest request) {
        requireContentManage();
        return R.ok(trainingVideoUploadService.init(request));
    }

    @PostMapping(value = "/video/uploads/{uploadToken}/chunks/{chunkIndex}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public R<HrmTrainingVideoUploadService.UploadSession> uploadVideoChunk(
            @PathVariable String uploadToken,
            @PathVariable Integer chunkIndex,
            @RequestPart("chunk") MultipartFile chunk) {
        requireContentManage();
        return R.ok(trainingVideoUploadService.uploadChunk(uploadToken, chunkIndex, chunk));
    }

    @PostMapping("/video/uploads/{uploadToken}/complete")
    @Log(module = "课件培训系统", type = Log.OperationType.INSERT)
    public R<HrmTrainingVideoUploadService.CompletedUpload> completeVideoUpload(
            @PathVariable String uploadToken) {
        requireContentManage();
        return R.ok(trainingVideoUploadService.complete(uploadToken));
    }

    @DeleteMapping("/video/uploads/{uploadToken}")
    public R<Void> cancelVideoUpload(@PathVariable String uploadToken) {
        requireContentManage();
        trainingVideoUploadService.cancel(uploadToken);
        return R.ok();
    }

    @GetMapping("/materials/{id}/video-play")
    public R<HrmTrainingVideoPlaybackService.PlaybackTicket> videoPlayback(
            @PathVariable Long id,
            @RequestParam(required = false) Long learningRecordId,
            HttpServletRequest request) {
        HrmTrainingMaterial material = materialMapper.selectById(id);
        if (material == null || !Boolean.TRUE.equals(material.getEnabled()) || !isVideoMaterial(material)) {
            throw new BusinessException("视频课件不存在或已停用");
        }
        if (canManage()) {
            requireCourse(material.getCourseId());
        } else {
            if (learningRecordId == null) {
                throw new BusinessException("请选择对应的学习任务");
            }
            HrmTrainingLearningRecord learning = requireLearning(learningRecordId);
            requireOwnLearningAccess(learning);
            ensurePathUnlocked(learning);
            if (!Objects.equals(learning.getCourseId(), material.getCourseId())) {
                throw new BusinessException("视频课件与学习任务不匹配");
            }
        }
        if (material.getFileId() != null && !"EXTERNAL".equalsIgnoreCase(material.getMediaProvider())) {
            return R.ok(trainingVideoPlaybackService.issueLocal(material, learningRecordId,
                    fileInfoService.readFile(material.getFileId()), request.getHeader(HttpHeaders.USER_AGENT)));
        }
        if (StringUtils.hasText(material.getMaterialUrl())) {
            return R.ok(trainingVideoPlaybackService.issueExternal(material));
        }
        if ("ALIYUN_VOD".equalsIgnoreCase(material.getMediaProvider())) {
            throw new BusinessException("云点播尚未完成播放配置，请联系系统管理员");
        }
        throw new BusinessException("视频课件尚未上传可播放文件");
    }

    @GetMapping("/video/stream/{materialId}")
    public void streamVideo(@PathVariable Long materialId,
                            @RequestParam String ticket,
                            @RequestHeader(value = HttpHeaders.RANGE, required = false) String range,
                            HttpServletRequest request,
                            HttpServletResponse response) {
        trainingVideoPlaybackService.stream(materialId, ticket, range,
                request.getHeader(HttpHeaders.USER_AGENT), response);
    }

    @PostMapping("/learning-records/{id}/submit-exam")
    @Transactional(rollbackFor = Exception.class)
    @Log(module = "课件培训系统", type = Log.OperationType.INSERT)
    public R<Map<String, Object>> submitExam(@PathVariable Long id, @RequestBody SubmitExamRequest request) {
        HrmTrainingLearningRecord learning = requireLearning(id);
        requireOwnLearningAccess(learning);
        ensurePathUnlocked(learning);
        if (!STATUS_LEARNED.equals(learning.getStatus())) {
            throw new BusinessException("请先完成课件学习后再进入考核");
        }
        HrmTrainingCourse course = requireCourse(learning.getCourseId());
        ensureCanAttempt(course, learning);
        List<HrmTrainingExamQuestion> questions = enabledQuestions(course.getId());
        if (questions.isEmpty()) {
            throw new BusinessException("该课程尚未配置考核题");
        }
        Map<Long, SubmitAnswerPayload> answerMap = request == null || request.getAnswers() == null
                ? new HashMap<>()
                : request.getAnswers().stream()
                .filter(item -> item.getQuestionId() != null)
                .collect(Collectors.toMap(SubmitAnswerPayload::getQuestionId, Function.identity(), (a, b) -> b));
        validateAllQuestionsAnswered(questions, answerMap);

        int attemptNo = nvl(learning.getCurrentAttempt()) + 1;
        HrmTrainingExamRecord exam = new HrmTrainingExamRecord();
        exam.setLearningRecordId(learning.getId());
        exam.setEmployeeId(learning.getEmployeeId());
        exam.setEmployeeName(learning.getEmployeeName());
        exam.setCourseId(course.getId());
        exam.setCourseTitle(course.getCourseTitle());
        exam.setCourseVersion(course.getVersionNo());
        exam.setAttemptNo(attemptNo);
        exam.setObjectiveScore(0);
        exam.setThinkingScore(0);
        exam.setTotalScore(0);
        exam.setPassScore(defaultInt(course.getPassScore(), 80));
        exam.setPassed(false);
        exam.setSubmittedTime(LocalDateTime.now());
        exam.setManualReviewStatus(REVIEW_NONE);
        exam.setStatus("已提交");
        examMapper.insert(exam);

        int objectiveScore = 0;
        boolean hasThinking = false;
        List<Map<String, Object>> wrongQuestions = new ArrayList<>();
        for (HrmTrainingExamQuestion question : questions) {
            SubmitAnswerPayload submitted = answerMap.get(question.getId());
            String answerJson = submitted == null ? null : answerToJson(submitted);
            HrmTrainingAnswer answer = new HrmTrainingAnswer();
            answer.setExamRecordId(exam.getId());
            answer.setQuestionId(question.getId());
            answer.setQuestionType(question.getQuestionType());
            answer.setQuestionTitle(question.getQuestionTitle());
            answer.setAnswerJson(answerJson);
            answer.setStandardAnswerJson(question.getAnswerJson());
            answer.setMaxScore(defaultInt(question.getScore(), 0));
            answer.setScore(0);
            if (TYPE_THINKING.equals(question.getQuestionType())) {
                hasThinking = true;
                answer.setCorrectFlag(null);
            } else {
                boolean correct = isObjectiveCorrect(question, answerJson);
                answer.setCorrectFlag(correct);
                answer.setScore(correct ? defaultInt(question.getScore(), 0) : 0);
                objectiveScore += answer.getScore();
                if (!correct) {
                    wrongQuestions.add(wrongQuestion(question, answerJson, answer.getScore()));
                }
            }
            answerMapper.insert(answer);
        }

        exam.setObjectiveScore(objectiveScore);
        exam.setTotalScore(objectiveScore);
        if (hasThinking) {
            exam.setManualReviewStatus(REVIEW_PENDING);
            exam.setStatus("待评分");
            exam.setWrongQuestionsJson(writeJson(wrongQuestions));
            examMapper.updateById(exam);
            learning.setStatus(STATUS_PENDING_REVIEW);
            learning.setCurrentAttempt(attemptNo);
            learning.setLastExamRecordId(exam.getId());
            learning.setBestScore(maxScore(learning.getBestScore(), objectiveScore));
            learningMapper.updateById(learning);
            publishTrainingNotification(
                    "training.exam." + exam.getId() + ".review_pending",
                    "training.exam.review_pending", "training.exam", exam.getId(),
                    reviewRecipientIds(learning),
                    "待评分思考题：" + course.getCourseTitle(),
                    learning.getEmployeeName() + " 已完成考试，请评分思考题并填写改进意见。",
                    STATUS_PENDING_REVIEW, "去评分", "/training/home?tab=reviews", true);
        } else {
            boolean passed = objectiveScore >= defaultInt(course.getPassScore(), 80);
            exam.setPassed(passed);
            exam.setWrongQuestionsJson(writeJson(wrongQuestions));
            examMapper.updateById(exam);
            finalizeLearning(learning, course, exam, wrongQuestions, passed, defaultImprovement(passed, wrongQuestions));
            publishTrainingNotification(
                    "training.exam." + exam.getId() + ".result",
                    "training.exam.result", "training.exam", exam.getId(),
                    trainingRecipient(learning.getEmployeeUserId()),
                    "培训考核结果：" + course.getCourseTitle(),
                    passed
                            ? "本次得分 " + objectiveScore + " 分，考核已通过。"
                            : "本次得分 " + objectiveScore + " 分。" + (STATUS_RETRAIN.equals(learning.getStatus())
                            ? "请重新学习错题章节后参加复训。"
                            : "已达到最大考试次数，请联系主管处理。"),
                    learning.getStatus(), passed ? "查看结果" : "重新学习",
                    learningUrl(learning.getId()), !passed);
        }

        Map<String, Object> data = new HashMap<>();
        data.put("exam", exam);
        data.put("record", learning);
        data.put("needManualReview", hasThinking);
        data.put("wrongQuestions", wrongQuestions);
        return R.ok(data);
    }

    @GetMapping("/exam-records")
    public R<IPage<HrmTrainingExamRecord>> examRecords(@RequestParam(defaultValue = "1") Integer pageNum,
                                                       @RequestParam(defaultValue = "20") Integer pageSize,
                                                       @RequestParam(required = false) Long employeeId,
                                                       @RequestParam(required = false) Long courseId,
                                                       @RequestParam(required = false) String manualReviewStatus,
                                                       @RequestParam(required = false) Boolean passed,
                                                       @RequestParam(required = false) String keyword) {
        boolean manager = canManage();
        LambdaQueryWrapper<HrmTrainingExamRecord> wrapper = new LambdaQueryWrapper<HrmTrainingExamRecord>()
                .eq(employeeId != null && manager, HrmTrainingExamRecord::getEmployeeId, employeeId)
                .eq(courseId != null, HrmTrainingExamRecord::getCourseId, courseId)
                .eq(StringUtils.hasText(manualReviewStatus), HrmTrainingExamRecord::getManualReviewStatus, manualReviewStatus)
                .eq(passed != null, HrmTrainingExamRecord::getPassed, passed)
                .and(StringUtils.hasText(keyword), w -> w.like(HrmTrainingExamRecord::getEmployeeName, keyword)
                        .or()
                        .like(HrmTrainingExamRecord::getCourseTitle, keyword)
                        .or()
                        .like(HrmTrainingExamRecord::getImprovement, keyword))
                .orderByAsc(HrmTrainingExamRecord::getManualReviewStatus)
                .orderByDesc(HrmTrainingExamRecord::getSubmittedTime)
                .orderByDesc(HrmTrainingExamRecord::getId);
        if (manager) {
            applyExamScope(wrapper);
        } else {
            wrapper.eq(HrmTrainingExamRecord::getEmployeeId, requireCurrentEmployeeId());
        }
        return R.ok(examMapper.selectPage(new Page<>(pageNum, pageSize), wrapper));
    }

    @GetMapping("/exam-records/{id}")
    public R<Map<String, Object>> examDetail(@PathVariable Long id) {
        HrmTrainingExamRecord exam = requireExam(id);
        if (canManage()) {
            requireEmployeeVisible(exam.getEmployeeId());
        } else if (!requireCurrentEmployeeId().equals(exam.getEmployeeId())) {
            throw new BusinessException("只能查看自己的考试记录");
        }
        List<HrmTrainingAnswer> answers = answerMapper.selectList(new LambdaQueryWrapper<HrmTrainingAnswer>()
                .eq(HrmTrainingAnswer::getExamRecordId, id)
                .orderByAsc(HrmTrainingAnswer::getId));
        List<Long> questionIds = answers.stream().map(HrmTrainingAnswer::getQuestionId).filter(Objects::nonNull).toList();
        List<HrmTrainingExamQuestion> questions = questionIds.isEmpty()
                ? new ArrayList<>()
                : questionMapper.selectList(new LambdaQueryWrapper<HrmTrainingExamQuestion>().in(HrmTrainingExamQuestion::getId, questionIds));
        if (!canManage()) {
            questions.forEach(this::hideQuestionAnswer);
            answers.forEach(answer -> answer.setStandardAnswerJson(null));
        }
        Map<String, Object> data = new HashMap<>();
        data.put("exam", exam);
        data.put("answers", answers);
        data.put("questions", questions);
        return R.ok(data);
    }

    @PostMapping("/exam-records/{id}/review")
    @Transactional(rollbackFor = Exception.class)
    @Log(module = "课件培训系统", type = Log.OperationType.UPDATE)
    public R<Void> reviewThinking(@PathVariable Long id, @RequestBody ManualReviewRequest request) {
        requireManage();
        HrmTrainingExamRecord exam = requireExam(id);
        requireEmployeeVisible(exam.getEmployeeId());
        if (!REVIEW_PENDING.equals(exam.getManualReviewStatus())) {
            throw new BusinessException("该考试不在待评分状态");
        }
        HrmTrainingLearningRecord learning = requireLearning(exam.getLearningRecordId());
        HrmTrainingCourse course = requireCourse(exam.getCourseId());
        Map<Long, ManualAnswerScore> scoreMap = request == null || request.getAnswers() == null
                ? new HashMap<>()
                : request.getAnswers().stream()
                .filter(item -> item.getAnswerId() != null)
                .collect(Collectors.toMap(ManualAnswerScore::getAnswerId, Function.identity(), (a, b) -> b));

        List<HrmTrainingAnswer> answers = answerMapper.selectList(new LambdaQueryWrapper<HrmTrainingAnswer>()
                .eq(HrmTrainingAnswer::getExamRecordId, id)
                .orderByAsc(HrmTrainingAnswer::getId));
        int objectiveScore = 0;
        int thinkingScore = 0;
        for (HrmTrainingAnswer answer : answers) {
            if (TYPE_THINKING.equals(answer.getQuestionType())) {
                ManualAnswerScore score = scoreMap.get(answer.getId());
                int manualScore = clamp(score == null ? 0 : defaultInt(score.getScore(), 0), 0, defaultInt(answer.getMaxScore(), 0));
                answer.setScore(manualScore);
                answer.setReviewerComment(score == null ? null : score.getReviewerComment());
                answerMapper.updateById(answer);
                thinkingScore += manualScore;
            } else {
                objectiveScore += defaultInt(answer.getScore(), 0);
            }
        }

        Map<Long, HrmTrainingExamQuestion> questionMap = questionMapper.selectList(new LambdaQueryWrapper<HrmTrainingExamQuestion>()
                        .in(HrmTrainingExamQuestion::getId, answers.stream().map(HrmTrainingAnswer::getQuestionId).filter(Objects::nonNull).toList()))
                .stream()
                .collect(Collectors.toMap(HrmTrainingExamQuestion::getId, Function.identity(), (a, b) -> a));
        List<Map<String, Object>> wrongQuestions = buildWrongQuestionsAfterReview(answers, questionMap);
        int totalScore = objectiveScore + thinkingScore;
        boolean passed = totalScore >= defaultInt(exam.getPassScore(), 80);
        if (!passed && (request == null || !StringUtils.hasText(request.getImprovement()))) {
            throw new BusinessException("考核未通过时必须填写具体需改进问题");
        }
        exam.setObjectiveScore(objectiveScore);
        exam.setThinkingScore(thinkingScore);
        exam.setTotalScore(totalScore);
        exam.setPassed(passed);
        exam.setManualReviewStatus(REVIEW_DONE);
        exam.setStatus("已评分");
        exam.setReviewedTime(LocalDateTime.now());
        exam.setReviewerId(SecurityUtils.getCurrentUserId());
        exam.setReviewerName(SecurityUtils.getCurrentUsername());
        exam.setImprovement(request == null ? null : request.getImprovement());
        exam.setWrongQuestionsJson(writeJson(wrongQuestions));
        examMapper.updateById(exam);
        finalizeLearning(learning, course, exam, wrongQuestions, passed,
                StringUtils.hasText(exam.getImprovement()) ? exam.getImprovement() : defaultImprovement(passed, wrongQuestions));
        String resultText = STATUS_PENDING_HOMEWORK.equals(learning.getStatus())
                ? "考试已通过，请继续提交实操作业"
                : passed
                ? "考核已通过，成绩已进入培训档案"
                : STATUS_RETRAIN.equals(learning.getStatus())
                ? "本次未通过，请根据改进意见重新学习并参加复训"
                : "本次未通过且已达到最大考试次数，请联系主管处理";
        publishTrainingNotification(
                "training.exam." + exam.getId() + ".result",
                "training.exam.result", "training.exam", exam.getId(),
                trainingRecipient(learning.getEmployeeUserId()),
                "培训考核结果：" + course.getCourseTitle(),
                "最终得分 " + totalScore + " 分。" + resultText,
                learning.getStatus(), passed ? "查看结果" : "重新学习",
                learningUrl(learning.getId()), !passed);
        return R.ok();
    }

    @PostMapping("/learning-records/{id}/remind")
    @Transactional(rollbackFor = Exception.class)
    @Log(module = "课件培训系统", type = Log.OperationType.UPDATE)
    public R<Void> remindLearning(@PathVariable Long id) {
        requireManage();
        HrmTrainingLearningRecord record = requireLearning(id);
        requireLearningAccess(record);
        if (Boolean.TRUE.equals(record.getPassed())) {
            throw new BusinessException("该培训任务已经完成，无需再次提醒");
        }
        learningMapper.update(null, new LambdaUpdateWrapper<HrmTrainingLearningRecord>()
                .eq(HrmTrainingLearningRecord::getId, id)
                .setSql("reminder_count = IFNULL(reminder_count, 0) + 1"));
        String dueText = record.getDueTime() == null
                ? "请尽快完成"
                : "截止时间 " + record.getDueTime().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
        int reminderNo = nvl(record.getReminderCount()) + 1;
        publishTrainingNotification(
                "training.learning." + record.getId() + ".reminder." + reminderNo,
                "training.reminder", "training.learning", record.getId(),
                trainingRecipient(record.getEmployeeUserId()),
                "培训任务提醒：" + record.getCourseTitle(),
                dueText + "。当前状态：" + record.getStatus(),
                record.getStatus(), "继续学习", learningUrl(record.getId()), true);
        return R.ok();
    }

    @GetMapping("/paths")
    public R<List<Map<String, Object>>> paths(@RequestParam(required = false) String position,
                                              @RequestParam(required = false) Boolean enabled) {
        LambdaQueryWrapper<HrmTrainingPath> wrapper = new LambdaQueryWrapper<HrmTrainingPath>()
                .eq(StringUtils.hasText(position), HrmTrainingPath::getApplicablePosition, position)
                .eq(enabled != null, HrmTrainingPath::getEnabled, enabled)
                .eq(!canManage(), HrmTrainingPath::getEnabled, true)
                .orderByAsc(HrmTrainingPath::getApplicablePosition)
                .orderByDesc(HrmTrainingPath::getUpdateTime);
        List<HrmTrainingPath> paths = pathMapper.selectList(wrapper);
        if (paths.isEmpty()) {
            return R.ok(new ArrayList<>());
        }
        List<Long> pathIds = paths.stream().map(HrmTrainingPath::getId).toList();
        Map<Long, List<HrmTrainingPathCourse>> courseMap = pathCourseMapper.selectList(new LambdaQueryWrapper<HrmTrainingPathCourse>()
                        .in(HrmTrainingPathCourse::getPathId, pathIds)
                        .orderByAsc(HrmTrainingPathCourse::getSortOrder))
                .stream()
                .collect(Collectors.groupingBy(HrmTrainingPathCourse::getPathId, LinkedHashMap::new, Collectors.toList()));
        List<Map<String, Object>> result = new ArrayList<>();
        for (HrmTrainingPath path : paths) {
            Map<String, Object> item = new HashMap<>();
            item.put("path", path);
            item.put("courses", courseMap.getOrDefault(path.getId(), new ArrayList<>()));
            result.add(item);
        }
        return R.ok(result);
    }

    @PostMapping("/paths")
    @Transactional(rollbackFor = Exception.class)
    @Log(module = "课件培训系统", type = Log.OperationType.INSERT)
    public R<Void> addPath(@RequestBody PathPayload request) {
        requireContentManage();
        HrmTrainingPath path = buildPath(request);
        path.setId(null);
        pathMapper.insert(path);
        savePathCourses(path.getId(), request.getCourseIds(), request.getCourseRules());
        return R.ok();
    }

    @PutMapping("/paths")
    @Transactional(rollbackFor = Exception.class)
    @Log(module = "课件培训系统", type = Log.OperationType.UPDATE)
    public R<Void> editPath(@RequestBody PathPayload request) {
        requireContentManage();
        if (request == null || request.getId() == null) {
            throw new BusinessException("路径 ID 不能为空");
        }
        requirePath(request.getId());
        HrmTrainingPath path = buildPath(request);
        path.setId(request.getId());
        pathMapper.updateById(path);
        pathCourseMapper.delete(new LambdaQueryWrapper<HrmTrainingPathCourse>().eq(HrmTrainingPathCourse::getPathId, request.getId()));
        savePathCourses(request.getId(), request.getCourseIds(), request.getCourseRules());
        return R.ok();
    }

    @DeleteMapping("/paths/{id}")
    @Transactional(rollbackFor = Exception.class)
    @Log(module = "课件培训系统", type = Log.OperationType.DELETE)
    public R<Void> removePath(@PathVariable Long id) {
        requireContentManage();
        requirePath(id);
        long learningCount = learningMapper.selectCount(new LambdaQueryWrapper<HrmTrainingLearningRecord>()
                .eq(HrmTrainingLearningRecord::getPathId, id));
        if (learningCount > 0) {
            throw new BusinessException("路径已有员工学习记录，不能删除；请停用路径以保留培训档案");
        }
        pathMapper.deleteById(id);
        pathCourseMapper.delete(new LambdaQueryWrapper<HrmTrainingPathCourse>().eq(HrmTrainingPathCourse::getPathId, id));
        return R.ok();
    }

    @PostMapping("/paths/{id}/assign")
    @Transactional(rollbackFor = Exception.class)
    @Log(module = "课件培训系统", type = Log.OperationType.INSERT)
    public R<Map<String, Integer>> assignPath(@PathVariable Long id, @RequestBody AssignPathRequest request) {
        requireManage();
        if (request == null || request.getEmployeeIds() == null || request.getEmployeeIds().isEmpty()) {
            throw new BusinessException("请选择员工");
        }
        HrmTrainingPath path = requirePath(id);
        if (!Boolean.TRUE.equals(path.getEnabled())) {
            throw new BusinessException("岗位路径已停用");
        }
        if (request.getDueTime() != null && request.getDueTime().isBefore(LocalDateTime.now())) {
            throw new BusinessException("截止时间不能早于当前时间");
        }
        List<HrmTrainingPathCourse> pathCourses = pathCourseMapper.selectList(new LambdaQueryWrapper<HrmTrainingPathCourse>()
                .eq(HrmTrainingPathCourse::getPathId, id)
                .orderByAsc(HrmTrainingPathCourse::getSortOrder));
        if (pathCourses.isEmpty()) {
            throw new BusinessException("该岗位路径尚未配置课程");
        }
        int maxUnlockDay = pathCourses.stream().mapToInt(item -> Math.max(0, defaultInt(item.getUnlockDay(), 0))).max().orElse(0);
        int lastUnlockOffset = Math.max(0, maxUnlockDay - 1);
        if (request.getDueTime() != null && request.getDueTime().isBefore(LocalDateTime.now().plusDays(lastUnlockOffset))) {
            throw new BusinessException("截止时间早于最后一门课程的解锁时间，请延后截止时间");
        }
        List<Long> courseIds = pathCourses.stream().map(HrmTrainingPathCourse::getCourseId).toList();
        List<HrmTrainingCourse> courses = courseMapper.selectList(new LambdaQueryWrapper<HrmTrainingCourse>()
                .in(HrmTrainingCourse::getId, courseIds)
                .eq(HrmTrainingCourse::getEnabled, true));
        if (courses.size() != courseIds.stream().filter(Objects::nonNull).distinct().count()) {
            throw new BusinessException("路径包含已停用或不存在的课程，请先维护岗位路径");
        }
        PathSnapshot snapshot = new PathSnapshot(path.getId(), path.getPathName());
        return R.ok(assignCourseRecords(request.getEmployeeIds(), courses, request.getDueTime(), snapshot));
    }

    @GetMapping("/certifications")
    public R<IPage<HrmTrainingCertification>> certifications(@RequestParam(defaultValue = "1") Integer pageNum,
                                                             @RequestParam(defaultValue = "20") Integer pageSize,
                                                             @RequestParam(required = false) Long employeeId,
                                                             @RequestParam(required = false) String status,
                                                             @RequestParam(required = false) String keyword) {
        boolean manager = canManage();
        LambdaQueryWrapper<HrmTrainingCertification> wrapper = new LambdaQueryWrapper<HrmTrainingCertification>()
                .eq(employeeId != null && manager, HrmTrainingCertification::getEmployeeId, employeeId)
                .eq(StringUtils.hasText(status), HrmTrainingCertification::getStatus, status)
                .and(StringUtils.hasText(keyword), w -> w.like(HrmTrainingCertification::getEmployeeName, keyword)
                        .or()
                        .like(HrmTrainingCertification::getCourseTitle, keyword)
                        .or()
                        .like(HrmTrainingCertification::getPathName, keyword)
                        .or()
                        .like(HrmTrainingCertification::getCertificationName, keyword))
                .orderByDesc(HrmTrainingCertification::getCertifiedTime)
                .orderByDesc(HrmTrainingCertification::getId);
        if (manager) {
            applyCertificationScope(wrapper);
        } else {
            wrapper.eq(HrmTrainingCertification::getEmployeeId, requireCurrentEmployeeId());
        }
        return R.ok(certificationMapper.selectPage(new Page<>(pageNum, pageSize), wrapper));
    }

    @GetMapping("/dashboard")
    public R<Map<String, Object>> dashboard() {
        requireManage();
        long courseTotal = courseMapper.selectCount(new LambdaQueryWrapper<>());
        long enabledCourseTotal = courseMapper.selectCount(new LambdaQueryWrapper<HrmTrainingCourse>().eq(HrmTrainingCourse::getEnabled, true));
        long learningTotal = countLearningScoped(new LambdaQueryWrapper<>());
        long incompleteCount = countLearningScoped(new LambdaQueryWrapper<HrmTrainingLearningRecord>()
                .in(HrmTrainingLearningRecord::getStatus, STATUS_NOT_STARTED, STATUS_LEARNING, STATUS_LEARNED, STATUS_PENDING_HOMEWORK, STATUS_PENDING_REVIEW));
        long failedCount = countLearningScoped(new LambdaQueryWrapper<HrmTrainingLearningRecord>()
                .eq(HrmTrainingLearningRecord::getStatus, STATUS_FAILED));
        long retrainCount = countLearningScoped(new LambdaQueryWrapper<HrmTrainingLearningRecord>()
                .eq(HrmTrainingLearningRecord::getStatus, STATUS_RETRAIN));
        long pendingHomeworkCount = countHomeworkScoped(new LambdaQueryWrapper<HrmTrainingHomeworkSubmission>()
                .eq(HrmTrainingHomeworkSubmission::getStatus, HOMEWORK_REVIEW));
        LocalDateTime now = LocalDateTime.now();
        long overdueCount = countLearningScoped(new LambdaQueryWrapper<HrmTrainingLearningRecord>()
                .in(HrmTrainingLearningRecord::getStatus, STATUS_NOT_STARTED, STATUS_LEARNING, STATUS_LEARNED, STATUS_PENDING_HOMEWORK, STATUS_PENDING_REVIEW, STATUS_RETRAIN)
                .lt(HrmTrainingLearningRecord::getDueTime, now));
        long dueSoonCount = countLearningScoped(new LambdaQueryWrapper<HrmTrainingLearningRecord>()
                .in(HrmTrainingLearningRecord::getStatus, STATUS_NOT_STARTED, STATUS_LEARNING, STATUS_LEARNED, STATUS_PENDING_HOMEWORK, STATUS_PENDING_REVIEW, STATUS_RETRAIN)
                .ge(HrmTrainingLearningRecord::getDueTime, now)
                .le(HrmTrainingLearningRecord::getDueTime, now.plusDays(2)));
        long passedCount = countLearningScoped(new LambdaQueryWrapper<HrmTrainingLearningRecord>()
                .eq(HrmTrainingLearningRecord::getPassed, true));
        long finishedExamCount = countExamScoped(new LambdaQueryWrapper<HrmTrainingExamRecord>()
                .ne(HrmTrainingExamRecord::getManualReviewStatus, REVIEW_PENDING));
        long passedExamCount = countExamScoped(new LambdaQueryWrapper<HrmTrainingExamRecord>()
                .ne(HrmTrainingExamRecord::getManualReviewStatus, REVIEW_PENDING)
                .eq(HrmTrainingExamRecord::getPassed, true));

        List<HrmTrainingLearningRecord> pendingLearning = scopedLearningList(new LambdaQueryWrapper<HrmTrainingLearningRecord>()
                .in(HrmTrainingLearningRecord::getStatus, STATUS_NOT_STARTED, STATUS_LEARNING, STATUS_LEARNED, STATUS_PENDING_HOMEWORK, STATUS_PENDING_REVIEW)
                .orderByAsc(HrmTrainingLearningRecord::getDueTime)
                .last("LIMIT 10"));
        List<HrmTrainingLearningRecord> failedRecords = scopedLearningList(new LambdaQueryWrapper<HrmTrainingLearningRecord>()
                .in(HrmTrainingLearningRecord::getStatus, STATUS_FAILED, STATUS_RETRAIN)
                .orderByDesc(HrmTrainingLearningRecord::getRetrainTime)
                .last("LIMIT 10"));
        List<HrmTrainingCourse> topCourses = courseMapper.selectList(new LambdaQueryWrapper<HrmTrainingCourse>()
                .orderByDesc(HrmTrainingCourse::getUsageCount)
                .orderByDesc(HrmTrainingCourse::getLastUsedTime)
                .last("LIMIT 8"));
        List<HrmTrainingExamRecord> pendingManual = scopedExamList(new LambdaQueryWrapper<HrmTrainingExamRecord>()
                .eq(HrmTrainingExamRecord::getManualReviewStatus, REVIEW_PENDING)
                .orderByDesc(HrmTrainingExamRecord::getSubmittedTime)
                .last("LIMIT 10"));

        Map<String, Object> data = new HashMap<>();
        data.put("courseTotal", courseTotal);
        data.put("enabledCourseTotal", enabledCourseTotal);
        data.put("learningTotal", learningTotal);
        data.put("incompleteCount", incompleteCount);
        data.put("failedCount", failedCount);
        data.put("retrainCount", retrainCount);
        data.put("pendingHomeworkCount", pendingHomeworkCount);
        data.put("overdueCount", overdueCount);
        data.put("dueSoonCount", dueSoonCount);
        data.put("passedCount", passedCount);
        data.put("passRate", finishedExamCount == 0 ? 0 : Math.round(passedExamCount * 100.0 / finishedExamCount));
        data.put("pendingLearning", pendingLearning);
        data.put("failedRecords", failedRecords);
        data.put("topCourses", topCourses);
        data.put("pendingManual", pendingManual);
        data.put("wrongQuestions", highFrequencyWrongQuestions());
        data.put("notReadyCourses", notReadyCourses());
        data.put("videoLearning", videoLearningMetrics());
        return R.ok(data);
    }

    @GetMapping("/portal")
    public R<Map<String, Object>> portal() {
        Long employeeId = requireCurrentEmployeeId();
        List<HrmTrainingLearningRecord> records = learningMapper.selectList(new LambdaQueryWrapper<HrmTrainingLearningRecord>()
                .eq(HrmTrainingLearningRecord::getEmployeeId, employeeId)
                .orderByAsc(HrmTrainingLearningRecord::getPassed)
                .orderByAsc(HrmTrainingLearningRecord::getDueTime)
                .orderByDesc(HrmTrainingLearningRecord::getId)
                .last("LIMIT 80"));
        List<HrmTrainingHomeworkSubmission> homeworks = homeworkSubmissionMapper.selectList(new LambdaQueryWrapper<HrmTrainingHomeworkSubmission>()
                .eq(HrmTrainingHomeworkSubmission::getEmployeeId, employeeId)
                .orderByAsc(HrmTrainingHomeworkSubmission::getPassed)
                .orderByDesc(HrmTrainingHomeworkSubmission::getUpdateTime)
                .last("LIMIT 30"));
        List<HrmTrainingCertification> certs = certificationMapper.selectList(new LambdaQueryWrapper<HrmTrainingCertification>()
                .eq(HrmTrainingCertification::getEmployeeId, employeeId)
                .orderByDesc(HrmTrainingCertification::getCertifiedTime)
                .last("LIMIT 12"));
        List<HrmTrainingCreditLog> credits = creditLogMapper.selectList(new LambdaQueryWrapper<HrmTrainingCreditLog>()
                .eq(HrmTrainingCreditLog::getEmployeeId, employeeId)
                .orderByDesc(HrmTrainingCreditLog::getGrantTime)
                .last("LIMIT 20"));

        Map<String, Object> stats = new HashMap<>();
        long assigned = records.size();
        long completed = records.stream().filter(item -> Boolean.TRUE.equals(item.getPassed())).count();
        long required = records.stream().filter(item -> Boolean.TRUE.equals(item.getRequiredCourse())).count();
        long requiredDone = records.stream().filter(item -> Boolean.TRUE.equals(item.getRequiredCourse()) && Boolean.TRUE.equals(item.getPassed())).count();
        long examPassed = records.stream().filter(item -> defaultInt(item.getBestScore(), -1) >= 0 && Boolean.TRUE.equals(item.getPassed())).count();
        long examTaken = records.stream().filter(item -> defaultInt(item.getCurrentAttempt(), 0) > 0).count();
        stats.put("assignedCourses", assigned);
        stats.put("completedCourses", completed);
        stats.put("requiredCompletionRate", required == 0 ? 0 : Math.round(requiredDone * 100.0 / required));
        stats.put("examPassRate", examTaken == 0 ? 0 : Math.round(examPassed * 100.0 / examTaken));
        stats.put("credit", creditSum(employeeId));
        stats.put("certificateCount", certs.size());
        stats.put("pendingLearning", records.stream().filter(item -> !Boolean.TRUE.equals(item.getPassed())).count());
        stats.put("pendingHomework", homeworks.stream().filter(item -> !Boolean.TRUE.equals(item.getPassed())).count());

        Map<Long, Map<String, Object>> recordViews = decorateLearningRecords(records).stream()
                .collect(Collectors.toMap(item -> ((Number) item.get("id")).longValue(), Function.identity(), (a, b) -> a));
        Map<String, Object> data = new HashMap<>();
        data.put("stats", stats);
        data.put("todoLearning", records.stream()
                .filter(item -> !Boolean.TRUE.equals(item.getPassed()))
                .limit(10)
                .map(item -> recordViews.get(item.getId()))
                .toList());
        data.put("continueLearning", records.stream()
                .filter(item -> STATUS_LEARNING.equals(item.getStatus()) || STATUS_RETRAIN.equals(item.getStatus()))
                .limit(8)
                .map(item -> recordViews.get(item.getId()))
                .toList());
        data.put("todoExam", records.stream()
                .filter(this::canRecordEnterExam)
                .limit(8)
                .map(item -> recordViews.get(item.getId()))
                .toList());
        data.put("todoHomework", homeworks.stream().filter(item -> !Boolean.TRUE.equals(item.getPassed())).limit(8).toList());
        data.put("certifications", certs);
        data.put("credits", credits);
        data.put("assignedCourseIds", records.stream().map(HrmTrainingLearningRecord::getCourseId).filter(Objects::nonNull).distinct().toList());
        data.put("paths", pathProgressForEmployee(employeeId));
        return R.ok(data);
    }

    @GetMapping("/archives")
    public R<List<Map<String, Object>>> archives(@RequestParam(required = false) String keyword) {
        requireManage();
        List<Long> visibleIds = visibleEmployeeIdsForTraining();
        LambdaQueryWrapper<OrgEmployee> wrapper = new LambdaQueryWrapper<OrgEmployee>()
                .in(OrgEmployee::getStatus, 1, 2)
                .and(StringUtils.hasText(keyword), w -> w.like(OrgEmployee::getName, keyword)
                        .or()
                        .like(OrgEmployee::getPhone, keyword)
                        .or()
                        .like(OrgEmployee::getEmpCode, keyword))
                .orderByAsc(OrgEmployee::getStatus)
                .orderByDesc(OrgEmployee::getId)
                .last("LIMIT 300");
        if (visibleIds != null) {
            wrapper.in(OrgEmployee::getId, safeIds(visibleIds));
        }
        return R.ok(employeeMapper.selectList(wrapper).stream().map(this::archiveOf).toList());
    }

    @GetMapping("/homeworks")
    public R<IPage<HrmTrainingHomework>> homeworks(@RequestParam(defaultValue = "1") Integer pageNum,
                                                   @RequestParam(defaultValue = "50") Integer pageSize,
                                                   @RequestParam(required = false) Long courseId,
                                                   @RequestParam(required = false) String keyword,
                                                   @RequestParam(required = false) Boolean enabled) {
        LambdaQueryWrapper<HrmTrainingHomework> wrapper = new LambdaQueryWrapper<HrmTrainingHomework>()
                .eq(courseId != null, HrmTrainingHomework::getCourseId, courseId)
                .and(StringUtils.hasText(keyword), w -> w.like(HrmTrainingHomework::getHomeworkName, keyword)
                        .or()
                        .like(HrmTrainingHomework::getSubmitInstruction, keyword))
                .eq(enabled != null, HrmTrainingHomework::getEnabled, enabled)
                .eq(!canManage(), HrmTrainingHomework::getEnabled, true)
                .orderByAsc(HrmTrainingHomework::getCourseId)
                .orderByAsc(HrmTrainingHomework::getSortOrder)
                .orderByDesc(HrmTrainingHomework::getId);
        return R.ok(homeworkMapper.selectPage(new Page<>(pageNum, pageSize), wrapper));
    }

    @PostMapping("/homeworks")
    @Transactional(rollbackFor = Exception.class)
    @Log(module = "课件培训系统", type = Log.OperationType.INSERT)
    public R<Void> addHomework(@RequestBody HomeworkPayload request) {
        requireContentManage();
        HrmTrainingHomework homework = buildHomework(request);
        homework.setId(null);
        homeworkMapper.insert(homework);
        createHomeworkSubmissionsForExistingLearning(homework);
        return R.ok();
    }

    @PutMapping("/homeworks")
    @Transactional(rollbackFor = Exception.class)
    @Log(module = "课件培训系统", type = Log.OperationType.UPDATE)
    public R<Void> editHomework(@RequestBody HomeworkPayload request) {
        requireContentManage();
        if (request == null || request.getId() == null) {
            throw new BusinessException("作业 ID 不能为空");
        }
        HrmTrainingHomework exists = requireHomework(request.getId());
        HrmTrainingHomework homework = buildHomework(request);
        homework.setId(exists.getId());
        homeworkMapper.updateById(homework);
        if (Boolean.TRUE.equals(homework.getEnabled())) {
            createHomeworkSubmissionsForExistingLearning(homework);
        }
        return R.ok();
    }

    @DeleteMapping("/homeworks/{id}")
    @Transactional(rollbackFor = Exception.class)
    @Log(module = "课件培训系统", type = Log.OperationType.DELETE)
    public R<Void> removeHomework(@PathVariable Long id) {
        requireContentManage();
        requireHomework(id);
        long submissionCount = homeworkSubmissionMapper.selectCount(new LambdaQueryWrapper<HrmTrainingHomeworkSubmission>()
                .eq(HrmTrainingHomeworkSubmission::getHomeworkId, id));
        if (submissionCount > 0) {
            throw new BusinessException("作业已有员工提交记录，不能删除；请停用作业以保留考评档案");
        }
        homeworkMapper.deleteById(id);
        return R.ok();
    }

    @GetMapping("/homework-submissions")
    public R<IPage<Map<String, Object>>> homeworkSubmissions(@RequestParam(defaultValue = "1") Integer pageNum,
                                                             @RequestParam(defaultValue = "80") Integer pageSize,
                                                             @RequestParam(required = false) Long employeeId,
                                                             @RequestParam(required = false) Long courseId,
                                                             @RequestParam(required = false) String status,
                                                             @RequestParam(required = false) String keyword) {
        LambdaQueryWrapper<HrmTrainingHomeworkSubmission> wrapper = new LambdaQueryWrapper<HrmTrainingHomeworkSubmission>()
                .eq(employeeId != null && canManage(), HrmTrainingHomeworkSubmission::getEmployeeId, employeeId)
                .eq(courseId != null, HrmTrainingHomeworkSubmission::getCourseId, courseId)
                .eq(StringUtils.hasText(status), HrmTrainingHomeworkSubmission::getStatus, status)
                .and(StringUtils.hasText(keyword), w -> w.like(HrmTrainingHomeworkSubmission::getEmployeeName, keyword)
                        .or()
                        .like(HrmTrainingHomeworkSubmission::getSubmitContent, keyword))
                .orderByAsc(HrmTrainingHomeworkSubmission::getPassed)
                .orderByAsc(HrmTrainingHomeworkSubmission::getStatus)
                .orderByDesc(HrmTrainingHomeworkSubmission::getUpdateTime);
        applyHomeworkSubmissionScope(wrapper);
        IPage<HrmTrainingHomeworkSubmission> page = homeworkSubmissionMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
        Set<Long> courseIds = page.getRecords().stream().map(HrmTrainingHomeworkSubmission::getCourseId).filter(Objects::nonNull).collect(Collectors.toSet());
        Set<Long> homeworkIds = page.getRecords().stream().map(HrmTrainingHomeworkSubmission::getHomeworkId).filter(Objects::nonNull).collect(Collectors.toSet());
        Map<Long, String> courseTitles = courseIds.isEmpty()
                ? new HashMap<>()
                : courseMapper.selectBatchIds(courseIds).stream().collect(Collectors.toMap(HrmTrainingCourse::getId, HrmTrainingCourse::getCourseTitle, (a, b) -> a));
        Map<Long, String> homeworkNames = homeworkIds.isEmpty()
                ? new HashMap<>()
                : homeworkMapper.selectBatchIds(homeworkIds).stream().collect(Collectors.toMap(HrmTrainingHomework::getId, HrmTrainingHomework::getHomeworkName, (a, b) -> a));
        return R.ok(page.convert(submission -> {
            Map<String, Object> item = objectMapper.convertValue(submission,
                    new TypeReference<LinkedHashMap<String, Object>>() { });
            item.put("courseTitle", courseTitles.get(submission.getCourseId()));
            item.put("homeworkName", homeworkNames.get(submission.getHomeworkId()));
            return item;
        }));
    }

    @PostMapping("/homework-submissions/{id}/submit")
    @Transactional(rollbackFor = Exception.class)
    @Log(module = "课件培训系统", type = Log.OperationType.UPDATE)
    public R<Void> submitHomework(@PathVariable Long id, @RequestBody HomeworkSubmitRequest request) {
        HrmTrainingHomeworkSubmission submission = requireHomeworkSubmission(id);
        requireHomeworkSubmitAccess(submission);
        if (HOMEWORK_REVIEW.equals(submission.getStatus())) {
            throw new BusinessException("作业已提交，正在等待主管批改");
        }
        if (HOMEWORK_PASSED.equals(submission.getStatus())) {
            throw new BusinessException("作业已通过，无需重复提交");
        }
        if (request == null || (!StringUtils.hasText(request.getSubmitContent()) && request.getAttachmentFileId() == null)) {
            throw new BusinessException("请填写实操作业内容或上传结果附件");
        }
        submission.setSubmitContent(request == null ? null : request.getSubmitContent());
        submission.setAttachmentFileId(request == null ? null : request.getAttachmentFileId());
        submission.setAttachmentName(request == null ? null : trim(request.getAttachmentName()));
        submission.setStatus(HOMEWORK_REVIEW);
        submission.setPassed(false);
        submission.setSubmittedTime(LocalDateTime.now());
        homeworkSubmissionMapper.updateById(submission);
        HrmTrainingHomework homework = requireHomework(submission.getHomeworkId());
        HrmTrainingLearningRecord learning = requireLearning(submission.getLearningRecordId());
        publishTrainingNotification(
                "training.homework." + submission.getId() + ".submitted." + submissionCycle(submission),
                "training.homework.submitted", "training.homework", submission.getId(),
                reviewRecipientIds(learning),
                "待批改实操作业：" + homework.getHomeworkName(),
                submission.getEmployeeName() + " 已提交作业，请检查实操结果并评分。",
                HOMEWORK_REVIEW, "去批改", "/training/home?tab=reviews", true);
        return R.ok();
    }

    @PostMapping("/homework-submissions/{id}/review")
    @Transactional(rollbackFor = Exception.class)
    @Log(module = "课件培训系统", type = Log.OperationType.UPDATE)
    public R<Void> reviewHomework(@PathVariable Long id, @RequestBody HomeworkReviewRequest request) {
        requireManage();
        HrmTrainingHomeworkSubmission submission = requireHomeworkSubmission(id);
        requireHomeworkReviewAccess(submission);
        if (!HOMEWORK_REVIEW.equals(submission.getStatus())) {
            throw new BusinessException("只有待评分的作业可以批改");
        }
        HrmTrainingHomework homework = requireHomework(submission.getHomeworkId());
        int score = clamp(request == null ? 0 : defaultInt(request.getScore(), 0), 0, 100);
        boolean passed = request != null && request.getPassed() != null
                ? request.getPassed()
                : score >= defaultInt(homework.getPassScore(), 80);
        if (!passed && (request == null || !StringUtils.hasText(request.getReviewerComment()))) {
            throw new BusinessException("作业不通过时必须填写具体改进意见");
        }
        submission.setScore(score);
        submission.setPassed(passed);
        submission.setStatus(passed ? HOMEWORK_PASSED : HOMEWORK_FAILED);
        submission.setReviewerId(SecurityUtils.getCurrentUserId());
        submission.setReviewerName(SecurityUtils.getCurrentUsername());
        submission.setReviewerComment(request == null ? null : request.getReviewerComment());
        submission.setReviewedTime(LocalDateTime.now());
        homeworkSubmissionMapper.updateById(submission);
        if (passed) {
            grantCreditIfAbsent(submission.getEmployeeId(), submission.getEmployeeName(), "HOMEWORK", submission.getId(),
                    homework.getHomeworkName(), defaultInt(homework.getCredit(), 1), "作业通过");
            completeLearningAfterHomeworkIfReady(submission.getLearningRecordId());
        }
        publishTrainingNotification(
                "training.homework." + submission.getId() + ".result." + submissionCycle(submission),
                "training.homework.result", "training.homework", submission.getId(),
                trainingRecipient(submission.getEmployeeUserId()),
                "实操作业批改结果：" + homework.getHomeworkName(),
                passed
                        ? "作业已通过，得分 " + score + " 分。"
                        : "作业未通过，得分 " + score + " 分。请根据主管意见修改后重新提交。"
                        + (StringUtils.hasText(submission.getReviewerComment()) ? " 主管意见：" + submission.getReviewerComment() : ""),
                submission.getStatus(), passed ? "查看结果" : "修改作业",
                learningUrl(submission.getLearningRecordId()), !passed);
        return R.ok();
    }

    @GetMapping("/credits")
    public R<Map<String, Object>> credits(@RequestParam(required = false) Long employeeId) {
        Long targetEmployeeId = employeeId != null && canManage() ? employeeId : requireCurrentEmployeeId();
        requireEmployeeVisible(targetEmployeeId);
        List<HrmTrainingCreditLog> logs = creditLogMapper.selectList(new LambdaQueryWrapper<HrmTrainingCreditLog>()
                .eq(HrmTrainingCreditLog::getEmployeeId, targetEmployeeId)
                .orderByDesc(HrmTrainingCreditLog::getGrantTime)
                .last("LIMIT 100"));
        List<HrmTrainingCertification> certs = certificationMapper.selectList(new LambdaQueryWrapper<HrmTrainingCertification>()
                .eq(HrmTrainingCertification::getEmployeeId, targetEmployeeId)
                .orderByDesc(HrmTrainingCertification::getCertifiedTime));
        Map<String, Object> data = new HashMap<>();
        data.put("credit", logs.stream().mapToInt(item -> defaultInt(item.getCredit(), 0)).sum());
        data.put("logs", logs);
        data.put("certifications", certs);
        return R.ok(data);
    }

    @GetMapping("/skills")
    public R<List<Map<String, Object>>> skills(@RequestParam(required = false) String position) {
        LambdaQueryWrapper<HrmTrainingSkill> wrapper = new LambdaQueryWrapper<HrmTrainingSkill>()
                .eq(StringUtils.hasText(position), HrmTrainingSkill::getApplicablePosition, position)
                .eq(!canManage(), HrmTrainingSkill::getEnabled, true)
                .orderByAsc(HrmTrainingSkill::getApplicablePosition)
                .orderByAsc(HrmTrainingSkill::getSortOrder);
        List<HrmTrainingSkill> skills = skillMapper.selectList(wrapper);
        if (skills.isEmpty()) {
            return R.ok(new ArrayList<>());
        }
        List<Long> ids = skills.stream().map(HrmTrainingSkill::getId).toList();
        Map<Long, List<HrmTrainingSkillCourse>> courses = skillCourseMapper.selectList(new LambdaQueryWrapper<HrmTrainingSkillCourse>()
                        .in(HrmTrainingSkillCourse::getSkillId, ids)
                        .orderByAsc(HrmTrainingSkillCourse::getSortOrder))
                .stream()
                .collect(Collectors.groupingBy(HrmTrainingSkillCourse::getSkillId));
        return R.ok(skills.stream().map(skill -> {
            Map<String, Object> item = new HashMap<>();
            item.put("skill", skill);
            item.put("courses", courses.getOrDefault(skill.getId(), new ArrayList<>()));
            item.put("progress", skillProgress(skill, courses.getOrDefault(skill.getId(), new ArrayList<>())));
            return item;
        }).toList());
    }

    @PostMapping("/skills")
    @Transactional(rollbackFor = Exception.class)
    @Log(module = "课件培训系统", type = Log.OperationType.INSERT)
    public R<Void> saveSkill(@RequestBody SkillPayload request) {
        requireContentManage();
        HrmTrainingSkill skill = buildSkill(request);
        if (request == null || request.getId() == null) {
            skillMapper.insert(skill);
        } else {
            skill.setId(request.getId());
            skillMapper.updateById(skill);
            skillCourseMapper.delete(new LambdaQueryWrapper<HrmTrainingSkillCourse>().eq(HrmTrainingSkillCourse::getSkillId, skill.getId()));
        }
        saveSkillCourses(skill.getId(), request == null ? new ArrayList<>() : request.getCourseIds());
        return R.ok();
    }

    @GetMapping("/supervision")
    public R<Map<String, Object>> supervision(@RequestParam(required = false) String keyword) {
        requireManage();
        List<Map<String, Object>> archives = archives(keyword).getData();
        Map<String, Object> data = new HashMap<>();
        data.put("archives", archives);
        data.put("pendingLearning", scopedLearningList(new LambdaQueryWrapper<HrmTrainingLearningRecord>()
                .in(HrmTrainingLearningRecord::getStatus, STATUS_NOT_STARTED, STATUS_LEARNING, STATUS_LEARNED, STATUS_PENDING_HOMEWORK, STATUS_PENDING_REVIEW, STATUS_RETRAIN)
                .orderByAsc(HrmTrainingLearningRecord::getDueTime)
                .last("LIMIT 80")));
        data.put("pendingHomework", scopedHomeworkList(new LambdaQueryWrapper<HrmTrainingHomeworkSubmission>()
                .in(HrmTrainingHomeworkSubmission::getStatus, HOMEWORK_TODO, HOMEWORK_REVIEW, HOMEWORK_FAILED)
                .orderByAsc(HrmTrainingHomeworkSubmission::getStatus)
                .orderByDesc(HrmTrainingHomeworkSubmission::getUpdateTime)
                .last("LIMIT 80")));
        data.put("pendingManual", scopedExamList(new LambdaQueryWrapper<HrmTrainingExamRecord>()
                .eq(HrmTrainingExamRecord::getManualReviewStatus, REVIEW_PENDING)
                .orderByDesc(HrmTrainingExamRecord::getSubmittedTime)
                .last("LIMIT 80")));
        return R.ok(data);
    }

    @GetMapping("/materials/library")
    public R<List<Map<String, Object>>> materialLibrary(@RequestParam(required = false) String keyword,
                                                        @RequestParam(required = false) String materialType) {
        List<HrmTrainingCourse> visibleCourses = courseMapper.selectList(new LambdaQueryWrapper<HrmTrainingCourse>()
                .eq(!canManage(), HrmTrainingCourse::getEnabled, true)
                .ne(!canManage(), HrmTrainingCourse::getCourseStatus, "草稿")
                .ne(!canManage(), HrmTrainingCourse::getCourseStatus, "已下架")
                .last("LIMIT 500"));
        if (visibleCourses.isEmpty()) {
            return R.ok(new ArrayList<>());
        }
        Map<Long, HrmTrainingCourse> courseMap = visibleCourses.stream()
                .collect(Collectors.toMap(HrmTrainingCourse::getId, Function.identity(), (a, b) -> a));
        List<HrmTrainingMaterial> materials = materialMapper.selectList(new LambdaQueryWrapper<HrmTrainingMaterial>()
                .in(HrmTrainingMaterial::getCourseId, courseMap.keySet())
                .eq(StringUtils.hasText(materialType), HrmTrainingMaterial::getMaterialType, materialType)
                .and(StringUtils.hasText(keyword), w -> w.like(HrmTrainingMaterial::getMaterialName, keyword)
                        .or()
                        .like(HrmTrainingMaterial::getMaterialContent, keyword))
                .eq(!canManage(), HrmTrainingMaterial::getEnabled, true)
                .orderByDesc(HrmTrainingMaterial::getUpdateTime)
                .last("LIMIT 300"));
        if (!canManage()) {
            materials.forEach(this::hideProtectedMaterialFile);
        }
        return R.ok(materials.stream().map(material -> {
            Map<String, Object> item = new HashMap<>();
            item.put("material", material);
            item.put("course", courseMap.get(material.getCourseId()));
            return item;
        }).toList());
    }

    @GetMapping("/training-records")
    public R<Map<String, Object>> trainingRecords(@RequestParam(required = false) Long employeeId) {
        Long targetEmployeeId = employeeId != null && canManage() ? employeeId : requireCurrentEmployeeId();
        requireEmployeeVisible(targetEmployeeId);
        Map<String, Object> data = new HashMap<>();
        data.put("archive", archiveOf(requireEmployee(targetEmployeeId)));
        data.put("learning", learningMapper.selectList(new LambdaQueryWrapper<HrmTrainingLearningRecord>()
                .eq(HrmTrainingLearningRecord::getEmployeeId, targetEmployeeId)
                .orderByDesc(HrmTrainingLearningRecord::getAssignedTime)));
        data.put("exams", examMapper.selectList(new LambdaQueryWrapper<HrmTrainingExamRecord>()
                .eq(HrmTrainingExamRecord::getEmployeeId, targetEmployeeId)
                .orderByDesc(HrmTrainingExamRecord::getSubmittedTime)));
        data.put("homeworks", homeworkSubmissionMapper.selectList(new LambdaQueryWrapper<HrmTrainingHomeworkSubmission>()
                .eq(HrmTrainingHomeworkSubmission::getEmployeeId, targetEmployeeId)
                .orderByDesc(HrmTrainingHomeworkSubmission::getUpdateTime)));
        data.put("certifications", certificationMapper.selectList(new LambdaQueryWrapper<HrmTrainingCertification>()
                .eq(HrmTrainingCertification::getEmployeeId, targetEmployeeId)
                .orderByDesc(HrmTrainingCertification::getCertifiedTime)));
        data.put("credits", creditLogMapper.selectList(new LambdaQueryWrapper<HrmTrainingCreditLog>()
                .eq(HrmTrainingCreditLog::getEmployeeId, targetEmployeeId)
                .orderByDesc(HrmTrainingCreditLog::getGrantTime)));
        return R.ok(data);
    }

    private Map<String, Object> buildCourseDetail(HrmTrainingCourse course, boolean hideAnswers) {
        Map<String, Object> data = new HashMap<>();
        data.put("course", course);
        List<HrmTrainingMaterial> materials = materialMapper.selectList(new LambdaQueryWrapper<HrmTrainingMaterial>()
                .eq(HrmTrainingMaterial::getCourseId, course.getId())
                .orderByAsc(HrmTrainingMaterial::getSortOrder)
                .orderByAsc(HrmTrainingMaterial::getId));
        if (hideAnswers) {
            materials.forEach(this::hideProtectedMaterialFile);
        }
        data.put("materials", materials);
        List<HrmTrainingExamQuestion> questions = questionMapper.selectList(new LambdaQueryWrapper<HrmTrainingExamQuestion>()
                .eq(HrmTrainingExamQuestion::getCourseId, course.getId())
                .orderByAsc(HrmTrainingExamQuestion::getSortOrder)
                .orderByAsc(HrmTrainingExamQuestion::getId));
        if (hideAnswers) {
            questions.forEach(this::hideQuestionAnswer);
        }
        data.put("questions", questions);
        data.put("homeworks", homeworkMapper.selectList(new LambdaQueryWrapper<HrmTrainingHomework>()
                .eq(HrmTrainingHomework::getCourseId, course.getId())
                .eq(hideAnswers, HrmTrainingHomework::getEnabled, true)
                .orderByAsc(HrmTrainingHomework::getSortOrder)
                .orderByAsc(HrmTrainingHomework::getId)));
        data.put("quality", courseQualityMap(course));
        return data;
    }

    private HrmTrainingCourse buildCourse(CoursePayload request) {
        if (request == null) {
            throw new BusinessException("课程信息不能为空");
        }
        HrmTrainingCourse course = new HrmTrainingCourse();
        course.setCourseCode(trim(request.getCourseCode()));
        course.setCourseTitle(trim(request.getCourseTitle()));
        course.setCourseCategory(StringUtils.hasText(request.getCourseCategory()) ? trim(request.getCourseCategory()) : "全员");
        course.setSopId(request.getSopId());
        course.setApplicablePositions(trim(request.getApplicablePositions()));
        course.setApplicableStage(StringUtils.hasText(request.getApplicableStage()) ? trim(request.getApplicableStage()) : "长期");
        course.setBusinessScenario(trim(request.getBusinessScenario()));
        course.setCourseType(StringUtils.hasText(request.getCourseType()) ? request.getCourseType() : "MIXED");
        course.setSummary(request.getSummary());
        course.setLearningMinutesRequired(defaultInt(request.getLearningMinutesRequired(), 30));
        course.setCredit(defaultInt(request.getCredit(), 1));
        course.setRequiredCourse(request.getRequiredCourse() == null || request.getRequiredCourse());
        course.setPassScore(defaultInt(request.getPassScore(), 80));
        course.setExamDurationMinutes(defaultInt(request.getExamDurationMinutes(), 30));
        course.setAllowRetake(request.getAllowRetake() == null || request.getAllowRetake());
        course.setMaxRetakeTimes(defaultInt(request.getMaxRetakeTimes(), 2));
        course.setCertificationEnabled(Boolean.TRUE.equals(request.getCertificationEnabled()));
        course.setCertificationName(trim(request.getCertificationName()));
        course.setOwnerId(request.getOwnerId());
        course.setLecturerName(trim(request.getLecturerName()));
        course.setVersionNo(StringUtils.hasText(request.getVersionNo()) ? request.getVersionNo() : "v1.0");
        course.setCourseStatus(StringUtils.hasText(request.getCourseStatus()) ? trim(request.getCourseStatus()) : (Boolean.FALSE.equals(request.getEnabled()) ? "已下架" : "已发布"));
        course.setEnabled(!"草稿".equals(course.getCourseStatus()) && !"已下架".equals(course.getCourseStatus()) && (request.getEnabled() == null || request.getEnabled()));
        course.setUsageCount(defaultInt(request.getUsageCount(), 0));
        if (!StringUtils.hasText(course.getCourseTitle())) {
            throw new BusinessException("课程标题不能为空");
        }
        if (course.getSopId() != null) {
            HrmSop sop = sopMapper.selectById(course.getSopId());
            if (sop == null) {
                throw new BusinessException("关联 SOP 不存在");
            }
            course.setSopTitle(sop.getSopTitle());
            course.setSopVersion(sop.getVersionNo());
            if (!StringUtils.hasText(course.getApplicablePositions())) {
                course.setApplicablePositions(sop.getApplicablePositions());
            }
            if (!StringUtils.hasText(course.getBusinessScenario())) {
                course.setBusinessScenario(sop.getBusinessScenario());
            }
        } else {
            course.setSopTitle(trim(request.getSopTitle()));
            course.setSopVersion(trim(request.getSopVersion()));
        }
        if (!StringUtils.hasText(course.getApplicablePositions())) {
            throw new BusinessException("请选择适用岗位");
        }
        if (!StringUtils.hasText(course.getBusinessScenario())) {
            throw new BusinessException("请选择业务场景");
        }
        if (course.getOwnerId() != null) {
            OrgEmployee owner = employeeMapper.selectById(course.getOwnerId());
            if (owner != null) {
                course.setOwnerName(owner.getName());
                if (!StringUtils.hasText(course.getLecturerName())) {
                    course.setLecturerName(owner.getName());
                }
            }
        }
        if (Boolean.TRUE.equals(course.getCertificationEnabled()) && !StringUtils.hasText(course.getCertificationName())) {
            course.setCertificationName(course.getCourseTitle() + "认证");
        }
        return course;
    }

    private void saveCourseMaterials(Long courseId, List<MaterialPayload> materials) {
        List<HrmTrainingMaterial> existing = materialMapper.selectList(
                new LambdaQueryWrapper<HrmTrainingMaterial>()
                        .eq(HrmTrainingMaterial::getCourseId, courseId));
        Map<Long, HrmTrainingMaterial> existingById = existing.stream()
                .filter(item -> item.getId() != null)
                .collect(Collectors.toMap(HrmTrainingMaterial::getId, Function.identity(), (a, b) -> a));
        Set<Long> retainedIds = new HashSet<>();
        int index = 1;
        for (MaterialPayload item : materials == null ? List.<MaterialPayload>of() : materials) {
            if (item == null || !StringUtils.hasText(item.getMaterialName())) {
                continue;
            }
            HrmTrainingMaterial material = buildCourseMaterial(courseId, item, index);
            if (item.getId() == null) {
                materialMapper.insert(material);
            } else {
                if (!existingById.containsKey(item.getId())) {
                    throw new BusinessException("课程章节已变化，请刷新后重新编辑");
                }
                material.setId(item.getId());
                updateCourseMaterial(material);
                retainedIds.add(item.getId());
            }
            index++;
        }
        existing.stream()
                .map(HrmTrainingMaterial::getId)
                .filter(Objects::nonNull)
                .filter(id -> !retainedIds.contains(id))
                .forEach(id -> materialMapper.deleteById(id));
    }

    private HrmTrainingMaterial buildCourseMaterial(Long courseId, MaterialPayload item, int index) {
        HrmTrainingMaterial material = new HrmTrainingMaterial();
        material.setCourseId(courseId);
        material.setMaterialType(StringUtils.hasText(item.getMaterialType()) ? item.getMaterialType() : "ARTICLE");
        material.setMaterialName(trim(item.getMaterialName()));
        material.setMaterialUrl(trim(item.getMaterialUrl()));
        material.setFileId(item.getFileId());
        material.setFileName(trim(item.getFileName()));
        material.setMaterialContent(item.getMaterialContent());
        material.setDurationMinutes(defaultInt(item.getDurationMinutes(), 0));
        material.setSortOrder(defaultInt(item.getSortOrder(), index));
        material.setRequiredMaterial(item.getRequiredMaterial() == null || item.getRequiredMaterial());
        material.setEnabled(item.getEnabled() == null || item.getEnabled());
        boolean video = isVideoMaterial(material);
        String requestedProvider = defaultText(item.getMediaProvider(), "EXTERNAL").toUpperCase();
        String mediaProvider = material.getFileId() != null ? "LOCAL"
                : "ALIYUN_VOD".equals(requestedProvider) ? "ALIYUN_VOD" : "EXTERNAL";
        material.setMediaProvider(video ? mediaProvider : "NONE");
        material.setProviderMediaId(trim(item.getProviderMediaId()));
        String transcodeStatus = defaultText(item.getTranscodeStatus(), "READY").toUpperCase();
        if (!Set.of("UPLOADING", "PROCESSING", "READY", "FAILED").contains(transcodeStatus)) {
            throw new BusinessException("视频处理状态无效");
        }
        material.setTranscodeStatus(video && material.getFileId() == null ? transcodeStatus : "READY");
        material.setDurationSeconds(video
                ? positiveInt(item.getDurationSeconds(), defaultInt(item.getDurationMinutes(), 0) * 60)
                : null);
        material.setCoverUrl(trim(item.getCoverUrl()));
        material.setSubtitleUrl(trim(item.getSubtitleUrl()));
        material.setMinWatchPercent(video ? clamp(defaultInt(item.getMinWatchPercent(), 90), 50, 100) : 90);
        material.setAllowSpeed(item.getAllowSpeed() == null || item.getAllowSpeed());
        material.setWatermarkEnabled(item.getWatermarkEnabled() == null || item.getWatermarkEnabled());
        material.setPlaybackPolicy(video && material.getFileId() == null
                ? "EXTERNAL_REFERENCE" : "SECURE");
        validateVideoMaterial(material);
        protectVideoSourceFile(material);
        return material;
    }

    private void updateCourseMaterial(HrmTrainingMaterial material) {
        materialMapper.update(null, new LambdaUpdateWrapper<HrmTrainingMaterial>()
                .eq(HrmTrainingMaterial::getId, material.getId())
                .eq(HrmTrainingMaterial::getCourseId, material.getCourseId())
                .set(HrmTrainingMaterial::getMaterialType, material.getMaterialType())
                .set(HrmTrainingMaterial::getMaterialName, material.getMaterialName())
                .set(HrmTrainingMaterial::getMaterialUrl, material.getMaterialUrl())
                .set(HrmTrainingMaterial::getFileId, material.getFileId())
                .set(HrmTrainingMaterial::getFileName, material.getFileName())
                .set(HrmTrainingMaterial::getMaterialContent, material.getMaterialContent())
                .set(HrmTrainingMaterial::getDurationMinutes, material.getDurationMinutes())
                .set(HrmTrainingMaterial::getSortOrder, material.getSortOrder())
                .set(HrmTrainingMaterial::getRequiredMaterial, material.getRequiredMaterial())
                .set(HrmTrainingMaterial::getEnabled, material.getEnabled())
                .set(HrmTrainingMaterial::getMediaProvider, material.getMediaProvider())
                .set(HrmTrainingMaterial::getProviderMediaId, material.getProviderMediaId())
                .set(HrmTrainingMaterial::getTranscodeStatus, material.getTranscodeStatus())
                .set(HrmTrainingMaterial::getDurationSeconds, material.getDurationSeconds())
                .set(HrmTrainingMaterial::getCoverUrl, material.getCoverUrl())
                .set(HrmTrainingMaterial::getSubtitleUrl, material.getSubtitleUrl())
                .set(HrmTrainingMaterial::getMinWatchPercent, material.getMinWatchPercent())
                .set(HrmTrainingMaterial::getAllowSpeed, material.getAllowSpeed())
                .set(HrmTrainingMaterial::getWatermarkEnabled, material.getWatermarkEnabled())
                .set(HrmTrainingMaterial::getPlaybackPolicy, material.getPlaybackPolicy())
                .set(HrmTrainingMaterial::getUpdateTime, LocalDateTime.now())
                .set(HrmTrainingMaterial::getUpdateBy, SecurityUtils.getCurrentUserId()));
    }

    private void saveCourseQuestions(Long courseId, List<QuestionPayload> questions) {
        if (questions == null || questions.isEmpty()) {
            return;
        }
        int index = 1;
        Set<String> types = Set.of(TYPE_SINGLE, TYPE_MULTIPLE, TYPE_JUDGE, TYPE_THINKING);
        for (QuestionPayload item : questions) {
            if (item == null || !StringUtils.hasText(item.getQuestionTitle())) {
                continue;
            }
            String type = StringUtils.hasText(item.getQuestionType()) ? item.getQuestionType() : TYPE_SINGLE;
            if (!types.contains(type)) {
                throw new BusinessException("不支持的题型:" + type);
            }
            if (!TYPE_THINKING.equals(type) && !StringUtils.hasText(item.getAnswerJson())) {
                throw new BusinessException("客观题必须配置标准答案");
            }
            HrmTrainingExamQuestion question = new HrmTrainingExamQuestion();
            question.setCourseId(courseId);
            question.setQuestionPosition(trim(item.getQuestionPosition()));
            question.setQuestionType(type);
            question.setDifficulty(StringUtils.hasText(item.getDifficulty()) ? item.getDifficulty() : "中");
            question.setQuestionTitle(trim(item.getQuestionTitle()));
            question.setOptionsJson(item.getOptionsJson());
            question.setAnswerJson(item.getAnswerJson());
            question.setAnalysis(item.getAnalysis());
            question.setScore(defaultInt(item.getScore(), 10));
            question.setScoringStandard(item.getScoringStandard());
            question.setSortOrder(defaultInt(item.getSortOrder(), index));
            question.setEnabled(item.getEnabled() == null || item.getEnabled());
            questionMapper.insert(question);
            index++;
        }
    }

    private Map<String, Integer> assignCourseRecords(List<Long> employeeIds,
                                                     List<HrmTrainingCourse> courses,
                                                     LocalDateTime dueTime,
                                                     PathSnapshot pathSnapshot) {
        if (courses == null || courses.isEmpty()) {
            throw new BusinessException("选中的课程不存在或已停用");
        }
        ensureCoursesReadyForAssignment(courses);
        if (canManage() && !canViewAllTraining()) {
            List<Long> visibleIds = visibleEmployeeIdsForTraining();
            if (visibleIds != null && employeeIds.stream().anyMatch(id -> !visibleIds.contains(id))) {
                throw new BusinessException("只能给当前管理范围内的员工分配培训");
            }
        }
        List<OrgEmployee> employees = employeeMapper.selectList(new LambdaQueryWrapper<OrgEmployee>()
                .in(OrgEmployee::getId, employeeIds)
                .in(OrgEmployee::getStatus, 1, 2));
        if (employees.isEmpty()) {
            throw new BusinessException("选中的员工不存在");
        }
        long expectedEmployees = employeeIds.stream().filter(Objects::nonNull).distinct().count();
        if (employees.size() != expectedEmployees) {
            throw new BusinessException("部分员工不存在或已不可用，请刷新员工名单后重试");
        }
        List<String> withoutAccount = employees.stream()
                .filter(employee -> employee.getUserId() == null)
                .map(OrgEmployee::getName)
                .filter(StringUtils::hasText)
                .toList();
        if (!withoutAccount.isEmpty()) {
            throw new BusinessException("以下员工尚未开通系统账号，无法接收培训任务："
                    + withoutAccount.stream().limit(5).collect(Collectors.joining("、")));
        }
        int assigned = 0;
        int skipped = 0;
        LocalDateTime now = LocalDateTime.now();
        Long assignerId = SecurityUtils.getCurrentUserId();
        String assignerName = SecurityUtils.getCurrentUsername();
        Map<Long, List<String>> assignedCourseNames = new LinkedHashMap<>();
        Map<Long, List<Long>> assignedLearningIds = new LinkedHashMap<>();
        for (OrgEmployee employee : employees) {
            for (HrmTrainingCourse course : courses) {
                Long exists = learningMapper.selectCount(new LambdaQueryWrapper<HrmTrainingLearningRecord>()
                        .eq(HrmTrainingLearningRecord::getEmployeeId, employee.getId())
                        .eq(HrmTrainingLearningRecord::getCourseId, course.getId())
                        .eq(HrmTrainingLearningRecord::getPassed, false));
                if (exists != null && exists > 0) {
                    skipped++;
                    continue;
                }
                HrmTrainingLearningRecord record = new HrmTrainingLearningRecord();
                record.setEmployeeId(employee.getId());
                record.setEmployeeName(employee.getName());
                record.setEmployeeUserId(employee.getUserId());
                record.setCourseId(course.getId());
                record.setCourseTitle(course.getCourseTitle());
                record.setCourseVersion(course.getVersionNo());
                record.setSopId(course.getSopId());
                record.setSopTitle(course.getSopTitle());
                record.setSopVersion(course.getSopVersion());
                if (pathSnapshot != null) {
                    record.setPathId(pathSnapshot.id());
                    record.setPathName(pathSnapshot.name());
                }
                record.setStatus(STATUS_NOT_STARTED);
                record.setProgressPercent(0);
                record.setAssignedTime(now);
                record.setDueTime(dueTime);
                record.setRequiredCourse(course.getRequiredCourse());
                record.setCertificationRequired(course.getCertificationEnabled());
                record.setCurrentAttempt(0);
                record.setPassed(false);
                record.setRetrainRequired(false);
                record.setReminderCount(0);
                record.setAssignerId(assignerId);
                record.setAssignerName(assignerName);
                learningMapper.insert(record);
                createHomeworkSubmissions(record, course);
                markCourseUsed(course.getId());
                if (employee.getUserId() != null) {
                    assignedCourseNames.computeIfAbsent(employee.getUserId(), key -> new ArrayList<>()).add(course.getCourseTitle());
                    assignedLearningIds.computeIfAbsent(employee.getUserId(), key -> new ArrayList<>()).add(record.getId());
                }
                assigned++;
            }
        }
        String dueText = dueTime == null
                ? "请按岗位要求及时完成"
                : "请在 " + dueTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")) + " 前完成";
        assignedCourseNames.forEach((userId, titles) -> {
            String preview = titles.stream().limit(3).collect(Collectors.joining("、"));
            String suffix = titles.size() > 3 ? "等 " + titles.size() + " 门课程" : "";
            List<Long> recordIds = assignedLearningIds.getOrDefault(userId, List.of());
            String eventId = "training.assignment." + recordIds.get(0)
                    + (recordIds.size() > 1 ? "." + recordIds.get(recordIds.size() - 1) : "");
            publishTrainingNotification(
                    eventId, "training.assignment", "training.learning", recordIds.get(0),
                    List.of(userId),
                    "你有新的培训任务",
                    "已分配「" + preview + suffix + "」。" + dueText + "。",
                    STATUS_NOT_STARTED, "开始学习", learningUrl(recordIds.get(0)), false);
        });
        Map<String, Integer> result = new HashMap<>();
        result.put("assigned", assigned);
        result.put("skipped", skipped);
        return result;
    }

    private void ensureCanAttempt(HrmTrainingCourse course, HrmTrainingLearningRecord learning) {
        if (Boolean.TRUE.equals(learning.getPassed())) {
            throw new BusinessException("该课程已通过,无需再次考试");
        }
        int currentAttempt = nvl(learning.getCurrentAttempt());
        int maxAttempts = 1 + defaultInt(course.getMaxRetakeTimes(), 0);
        if (currentAttempt > 0 && !Boolean.TRUE.equals(course.getAllowRetake())) {
            throw new BusinessException("该课程不允许重考");
        }
        if (currentAttempt >= maxAttempts) {
            throw new BusinessException("已达到最大考试次数");
        }
    }

    private void ensureCoursesReadyForAssignment(List<HrmTrainingCourse> courses) {
        for (HrmTrainingCourse course : courses) {
            List<String> blockingIssues = courseBlockingIssues(course);
            if (!blockingIssues.isEmpty()) {
                throw new BusinessException("课程「" + course.getCourseTitle() + "」还不能分配:" + String.join("、", blockingIssues));
            }
        }
    }

    private List<String> courseBlockingIssues(HrmTrainingCourse course) {
        List<String> issues = new ArrayList<>();
        if (!Boolean.TRUE.equals(course.getEnabled())) {
            issues.add("课程未启用");
        }
        List<HrmTrainingMaterial> materials = enabledMaterials(course.getId());
        if (materials.isEmpty()) {
            issues.add("没有启用课件");
        } else if (materials.stream().noneMatch(item -> !Boolean.FALSE.equals(item.getRequiredMaterial()))) {
            issues.add("没有启用必学课件");
        }
        for (HrmTrainingMaterial material : materials) {
            if (!isVideoMaterial(material)) {
                continue;
            }
            if (!"READY".equalsIgnoreCase(defaultText(material.getTranscodeStatus(), "READY"))) {
                issues.add("视频尚未处理完成");
                break;
            }
            if (material.getDurationSeconds() == null || material.getDurationSeconds() <= 0) {
                issues.add("视频时长未配置");
                break;
            }
            if (Boolean.TRUE.equals(material.getRequiredMaterial()) && material.getFileId() == null) {
                issues.add("必学视频未上传到系统受保护存储");
                break;
            }
        }
        List<HrmTrainingExamQuestion> questions = enabledQuestions(course.getId());
        if (questions.isEmpty()) {
            issues.add("没有启用考核题");
        } else {
            int totalScore = questions.stream().mapToInt(item -> defaultInt(item.getScore(), 0)).sum();
            if (totalScore < defaultInt(course.getPassScore(), 80)) {
                issues.add("题目总分低于及格分");
            }
            boolean hasObjective = questions.stream().anyMatch(item -> !TYPE_THINKING.equals(item.getQuestionType()));
            if (!hasObjective) {
                issues.add("至少需要一道客观题");
            }
        }
        return issues;
    }

    private Map<String, Object> courseQualityMap(HrmTrainingCourse course) {
        List<HrmTrainingMaterial> materials = enabledMaterials(course.getId());
        List<HrmTrainingExamQuestion> questions = enabledQuestions(course.getId());
        long homeworkCount = homeworkMapper.selectCount(new LambdaQueryWrapper<HrmTrainingHomework>()
                .eq(HrmTrainingHomework::getCourseId, course.getId())
                .eq(HrmTrainingHomework::getEnabled, true));
        int objectiveCount = (int) questions.stream().filter(item -> !TYPE_THINKING.equals(item.getQuestionType())).count();
        int thinkingCount = (int) questions.stream().filter(item -> TYPE_THINKING.equals(item.getQuestionType())).count();
        int totalScore = questions.stream().mapToInt(item -> defaultInt(item.getScore(), 0)).sum();
        List<String> blockingIssues = courseBlockingIssues(course);
        List<String> suggestions = new ArrayList<>();
        if (course.getSopId() == null) {
            suggestions.add("建议关联 SOP,方便标准更新可追溯");
        }
        if (!Boolean.TRUE.equals(course.getCertificationEnabled())) {
            suggestions.add("关键岗位课程建议开启上岗认证");
        }
        if (defaultInt(course.getLearningMinutesRequired(), 0) <= 0) {
            suggestions.add("建议设置学习分钟数");
        }
        Map<String, Object> data = new HashMap<>();
        data.put("courseId", course.getId());
        data.put("ready", blockingIssues.isEmpty());
        data.put("blockingIssues", blockingIssues);
        data.put("suggestions", suggestions);
        data.put("materialCount", materials.size());
        data.put("homeworkCount", homeworkCount);
        data.put("questionCount", questions.size());
        data.put("objectiveCount", objectiveCount);
        data.put("thinkingCount", thinkingCount);
        data.put("totalScore", totalScore);
        data.put("passScore", defaultInt(course.getPassScore(), 80));
        return data;
    }

    private List<Map<String, Object>> notReadyCourses() {
        return courseMapper.selectList(new LambdaQueryWrapper<HrmTrainingCourse>()
                        .eq(HrmTrainingCourse::getEnabled, true)
                        .orderByDesc(HrmTrainingCourse::getUpdateTime)
                        .last("LIMIT 50"))
                .stream()
                .map(course -> {
                    Map<String, Object> quality = courseQualityMap(course);
                    quality.put("courseTitle", course.getCourseTitle());
                    return quality;
                })
                .filter(item -> !Boolean.TRUE.equals(item.get("ready")))
                .limit(8)
                .toList();
    }

    private void validateAllQuestionsAnswered(List<HrmTrainingExamQuestion> questions, Map<Long, SubmitAnswerPayload> answerMap) {
        List<String> missing = new ArrayList<>();
        for (HrmTrainingExamQuestion question : questions) {
            if (isAnswerBlank(answerMap.get(question.getId()))) {
                missing.add(question.getQuestionTitle());
            }
        }
        if (!missing.isEmpty()) {
            String preview = missing.stream().limit(3).collect(Collectors.joining("、"));
            throw new BusinessException("还有题目未作答:" + preview + (missing.size() > 3 ? "等" : ""));
        }
    }

    private boolean isAnswerBlank(SubmitAnswerPayload submitted) {
        if (submitted == null) {
            return true;
        }
        if (StringUtils.hasText(submitted.getAnswerJson())) {
            return jsonToStringList(submitted.getAnswerJson()).isEmpty();
        }
        Object answer = submitted.getAnswer();
        if (answer instanceof List<?> list) {
            return list.isEmpty() || list.stream().allMatch(item -> item == null || !StringUtils.hasText(String.valueOf(item)));
        }
        if (answer != null) {
            return !StringUtils.hasText(String.valueOf(answer));
        }
        return !StringUtils.hasText(submitted.getAnswerText());
    }

    private boolean hasRemainingAttempt(HrmTrainingCourse course, int attemptNo) {
        if (!Boolean.TRUE.equals(course.getAllowRetake())) {
            return false;
        }
        return attemptNo < 1 + defaultInt(course.getMaxRetakeTimes(), 0);
    }

    private void finalizeLearning(HrmTrainingLearningRecord learning,
                                  HrmTrainingCourse course,
                                  HrmTrainingExamRecord exam,
                                  List<Map<String, Object>> wrongQuestions,
                                  boolean passed,
                                  String improvement) {
        learning.setCurrentAttempt(defaultInt(exam.getAttemptNo(), nvl(learning.getCurrentAttempt())));
        learning.setLastExamRecordId(exam.getId());
        learning.setBestScore(maxScore(learning.getBestScore(), exam.getTotalScore()));
        learning.setPassed(passed);
        learning.setImprovement(improvement);
        if (passed) {
            if (hasPendingRequiredHomework(learning)) {
                learning.setStatus(STATUS_PENDING_HOMEWORK);
                learning.setProgressPercent(95);
                learning.setPassed(false);
                learning.setRetrainRequired(false);
                learning.setRetrainTime(null);
            } else {
                markLearningPassed(learning, course, exam);
            }
        } else if (hasRemainingAttempt(course, defaultInt(exam.getAttemptNo(), 1))) {
            learning.setStatus(STATUS_RETRAIN);
            learning.setProgressPercent(0);
            learning.setStartedTime(null);
            learning.setCompletedTime(null);
            learning.setRetrainRequired(true);
            learning.setRetrainTime(LocalDateTime.now());
        } else {
            learning.setStatus(STATUS_FAILED);
            learning.setRetrainRequired(false);
        }
        if (!passed && !StringUtils.hasText(learning.getImprovement())) {
            learning.setImprovement(defaultImprovement(false, wrongQuestions));
        }
        learningMapper.updateById(learning);
    }

    private void markLearningPassed(HrmTrainingLearningRecord learning, HrmTrainingCourse course, HrmTrainingExamRecord exam) {
        learning.setStatus(STATUS_PASSED);
        learning.setProgressPercent(100);
        learning.setPassed(true);
        learning.setPassTime(LocalDateTime.now());
        learning.setRetrainRequired(false);
        learning.setRetrainTime(null);
        generateCertificationIfNeeded(learning, course, exam);
        tryGeneratePathCertification(learning, exam);
        grantCreditIfAbsent(learning.getEmployeeId(), learning.getEmployeeName(), "COURSE", learning.getId(),
                course.getCourseTitle(), defaultInt(course.getCredit(), 1), "课程通过");
    }

    private void generateCertificationIfNeeded(HrmTrainingLearningRecord learning, HrmTrainingCourse course, HrmTrainingExamRecord exam) {
        if (!Boolean.TRUE.equals(course.getCertificationEnabled())) {
            return;
        }
        HrmTrainingCertification certification = certificationMapper.selectOne(new LambdaQueryWrapper<HrmTrainingCertification>()
                .eq(HrmTrainingCertification::getEmployeeId, learning.getEmployeeId())
                .eq(HrmTrainingCertification::getCourseId, course.getId())
                .last("LIMIT 1"));
        if (certification == null) {
            certification = new HrmTrainingCertification();
            certification.setEmployeeId(learning.getEmployeeId());
            certification.setEmployeeName(learning.getEmployeeName());
            certification.setCourseId(course.getId());
            certification.setCourseTitle(course.getCourseTitle());
            certification.setPathId(learning.getPathId());
            certification.setPathName(learning.getPathName());
            certification.setCertificationName(StringUtils.hasText(course.getCertificationName())
                    ? course.getCertificationName()
                    : course.getCourseTitle() + "认证");
            certification.setStatus("已认证");
            certification.setCertifiedTime(LocalDateTime.now());
            certification.setBestScore(exam.getTotalScore());
            certificationMapper.insert(certification);
        } else {
            certification.setStatus("已认证");
            certification.setCertifiedTime(LocalDateTime.now());
            certification.setBestScore(maxScore(certification.getBestScore(), exam.getTotalScore()));
            certificationMapper.updateById(certification);
        }
    }

    private void tryGeneratePathCertification(HrmTrainingLearningRecord learning, HrmTrainingExamRecord exam) {
        if (learning.getPathId() == null) {
            return;
        }
        List<HrmTrainingLearningRecord> pathRecords = learningMapper.selectList(new LambdaQueryWrapper<HrmTrainingLearningRecord>()
                .eq(HrmTrainingLearningRecord::getEmployeeId, learning.getEmployeeId())
                .eq(HrmTrainingLearningRecord::getPathId, learning.getPathId()));
        if (pathRecords.isEmpty() || pathRecords.stream().anyMatch(item -> !Boolean.TRUE.equals(item.getPassed()))) {
            return;
        }
        HrmTrainingCertification certification = certificationMapper.selectOne(new LambdaQueryWrapper<HrmTrainingCertification>()
                .eq(HrmTrainingCertification::getEmployeeId, learning.getEmployeeId())
                .eq(HrmTrainingCertification::getPathId, learning.getPathId())
                .isNull(HrmTrainingCertification::getCourseId)
                .last("LIMIT 1"));
        if (certification == null) {
            certification = new HrmTrainingCertification();
            certification.setEmployeeId(learning.getEmployeeId());
            certification.setEmployeeName(learning.getEmployeeName());
            certification.setPathId(learning.getPathId());
            certification.setPathName(learning.getPathName());
            certification.setCertificationName((StringUtils.hasText(learning.getPathName()) ? learning.getPathName() : "学习路径") + "认证");
            certification.setStatus("已认证");
            certification.setCertifiedTime(LocalDateTime.now());
            certification.setBestScore(exam == null ? learning.getBestScore() : exam.getTotalScore());
            certificationMapper.insert(certification);
        }
        grantCreditIfAbsent(learning.getEmployeeId(), learning.getEmployeeName(), "PATH", learning.getPathId(),
                certification.getCertificationName(), Math.max(1, pathRecords.size()), "路径完成");
    }

    private void createHomeworkSubmissions(HrmTrainingLearningRecord record, HrmTrainingCourse course) {
        List<HrmTrainingHomework> homeworks = homeworkMapper.selectList(new LambdaQueryWrapper<HrmTrainingHomework>()
                .eq(HrmTrainingHomework::getCourseId, course.getId())
                .eq(HrmTrainingHomework::getEnabled, true)
                .orderByAsc(HrmTrainingHomework::getSortOrder));
        for (HrmTrainingHomework homework : homeworks) {
            createHomeworkSubmissionIfMissing(record, homework);
        }
    }

    private void createHomeworkSubmissionsForExistingLearning(HrmTrainingHomework homework) {
        List<HrmTrainingLearningRecord> records = learningMapper.selectList(new LambdaQueryWrapper<HrmTrainingLearningRecord>()
                .eq(HrmTrainingLearningRecord::getCourseId, homework.getCourseId())
                .eq(HrmTrainingLearningRecord::getPassed, false));
        for (HrmTrainingLearningRecord record : records) {
            createHomeworkSubmissionIfMissing(record, homework);
        }
    }

    private void createHomeworkSubmissionIfMissing(HrmTrainingLearningRecord record, HrmTrainingHomework homework) {
        Long exists = homeworkSubmissionMapper.selectCount(new LambdaQueryWrapper<HrmTrainingHomeworkSubmission>()
                .eq(HrmTrainingHomeworkSubmission::getLearningRecordId, record.getId())
                .eq(HrmTrainingHomeworkSubmission::getHomeworkId, homework.getId()));
        if (exists != null && exists > 0) {
            return;
        }
        HrmTrainingHomeworkSubmission submission = new HrmTrainingHomeworkSubmission();
        submission.setHomeworkId(homework.getId());
        submission.setCourseId(record.getCourseId());
        submission.setLearningRecordId(record.getId());
        submission.setEmployeeId(record.getEmployeeId());
        submission.setEmployeeName(record.getEmployeeName());
        submission.setEmployeeUserId(record.getEmployeeUserId());
        submission.setStatus(HOMEWORK_TODO);
        submission.setPassed(false);
        homeworkSubmissionMapper.insert(submission);
    }

    private boolean hasPendingRequiredHomework(HrmTrainingLearningRecord learning) {
        List<HrmTrainingHomework> homeworks = homeworkMapper.selectList(new LambdaQueryWrapper<HrmTrainingHomework>()
                .eq(HrmTrainingHomework::getCourseId, learning.getCourseId())
                .eq(HrmTrainingHomework::getEnabled, true));
        if (homeworks.isEmpty()) {
            return false;
        }
        for (HrmTrainingHomework homework : homeworks) {
            createHomeworkSubmissionIfMissing(learning, homework);
        }
        List<Long> homeworkIds = homeworks.stream().map(HrmTrainingHomework::getId).toList();
        Long pending = homeworkSubmissionMapper.selectCount(new LambdaQueryWrapper<HrmTrainingHomeworkSubmission>()
                .eq(HrmTrainingHomeworkSubmission::getLearningRecordId, learning.getId())
                .in(HrmTrainingHomeworkSubmission::getHomeworkId, homeworkIds)
                .ne(HrmTrainingHomeworkSubmission::getStatus, HOMEWORK_PASSED));
        return pending != null && pending > 0;
    }

    private void completeLearningAfterHomeworkIfReady(Long learningRecordId) {
        if (learningRecordId == null) {
            return;
        }
        HrmTrainingLearningRecord learning = learningMapper.selectById(learningRecordId);
        if (learning == null || Boolean.TRUE.equals(learning.getPassed()) || hasPendingRequiredHomework(learning)) {
            return;
        }
        HrmTrainingExamRecord exam = learning.getLastExamRecordId() == null
                ? null
                : examMapper.selectById(learning.getLastExamRecordId());
        if (exam == null || !Boolean.TRUE.equals(exam.getPassed())) {
            return;
        }
        HrmTrainingCourse course = requireCourse(learning.getCourseId());
        markLearningPassed(learning, course, exam);
        learningMapper.updateById(learning);
    }

    private HrmTrainingHomework buildHomework(HomeworkPayload request) {
        if (request == null) {
            throw new BusinessException("作业信息不能为空");
        }
        HrmTrainingCourse course = requireCourse(request.getCourseId());
        HrmTrainingHomework homework = new HrmTrainingHomework();
        homework.setCourseId(course.getId());
        homework.setHomeworkName(trim(request.getHomeworkName()));
        homework.setHomeworkType(StringUtils.hasText(request.getHomeworkType()) ? trim(request.getHomeworkType()) : "实操");
        homework.setSubmitInstruction(request.getSubmitInstruction());
        homework.setAttachmentFileId(request.getAttachmentFileId());
        homework.setAttachmentName(trim(request.getAttachmentName()));
        homework.setPassScore(defaultInt(request.getPassScore(), 80));
        homework.setCredit(defaultInt(request.getCredit(), 1));
        homework.setEnabled(request.getEnabled() == null || request.getEnabled());
        homework.setSortOrder(defaultInt(request.getSortOrder(), 1));
        if (!StringUtils.hasText(homework.getHomeworkName())) {
            homework.setHomeworkName(course.getCourseTitle() + "实操作业");
        }
        return homework;
    }

    private HrmTrainingSkill buildSkill(SkillPayload request) {
        if (request == null) {
            throw new BusinessException("能力信息不能为空");
        }
        HrmTrainingSkill skill = new HrmTrainingSkill();
        skill.setSkillName(trim(request.getSkillName()));
        skill.setApplicablePosition(StringUtils.hasText(request.getApplicablePosition()) ? trim(request.getApplicablePosition()) : "全员");
        skill.setSkillCategory(trim(request.getSkillCategory()));
        skill.setRequiredLevel(StringUtils.hasText(request.getRequiredLevel()) ? trim(request.getRequiredLevel()) : "掌握");
        skill.setDescription(request.getDescription());
        skill.setEnabled(request.getEnabled() == null || request.getEnabled());
        skill.setSortOrder(defaultInt(request.getSortOrder(), 1));
        if (!StringUtils.hasText(skill.getSkillName())) {
            throw new BusinessException("能力名称不能为空");
        }
        return skill;
    }

    private void saveSkillCourses(Long skillId, List<Long> courseIds) {
        if (courseIds == null || courseIds.isEmpty()) {
            return;
        }
        List<HrmTrainingCourse> courses = courseMapper.selectList(new LambdaQueryWrapper<HrmTrainingCourse>()
                .in(HrmTrainingCourse::getId, courseIds));
        Map<Long, HrmTrainingCourse> courseMap = courses.stream()
                .collect(Collectors.toMap(HrmTrainingCourse::getId, Function.identity(), (a, b) -> a));
        int index = 1;
        for (Long courseId : courseIds) {
            HrmTrainingCourse course = courseMap.get(courseId);
            if (course == null) {
                continue;
            }
            HrmTrainingSkillCourse skillCourse = new HrmTrainingSkillCourse();
            skillCourse.setSkillId(skillId);
            skillCourse.setCourseId(course.getId());
            skillCourse.setCourseTitle(course.getCourseTitle());
            skillCourse.setRequiredCourse(course.getRequiredCourse());
            skillCourse.setSortOrder(index++);
            skillCourseMapper.insert(skillCourse);
        }
    }

    private Map<String, Object> skillProgress(HrmTrainingSkill skill, List<HrmTrainingSkillCourse> courses) {
        Map<String, Object> progress = new HashMap<>();
        Long employeeId = dataScopeHelper.currentEmployeeId();
        int total = courses.size();
        int done = 0;
        if (employeeId != null && total > 0) {
            List<Long> courseIds = courses.stream().map(HrmTrainingSkillCourse::getCourseId).filter(Objects::nonNull).toList();
            done = courseIds.isEmpty() ? 0 : Math.toIntExact(learningMapper.selectCount(new LambdaQueryWrapper<HrmTrainingLearningRecord>()
                    .eq(HrmTrainingLearningRecord::getEmployeeId, employeeId)
                    .in(HrmTrainingLearningRecord::getCourseId, courseIds)
                    .eq(HrmTrainingLearningRecord::getPassed, true)));
        }
        progress.put("position", skill.getApplicablePosition());
        progress.put("total", total);
        progress.put("done", done);
        progress.put("percent", total == 0 ? 0 : Math.round(done * 100.0 / total));
        return progress;
    }

    private void grantCreditIfAbsent(Long employeeId, String employeeName, String sourceType, Long sourceId, String sourceTitle, Integer credit, String remark) {
        if (employeeId == null || sourceId == null || defaultInt(credit, 0) <= 0) {
            return;
        }
        Long exists = creditLogMapper.selectCount(new LambdaQueryWrapper<HrmTrainingCreditLog>()
                .eq(HrmTrainingCreditLog::getEmployeeId, employeeId)
                .eq(HrmTrainingCreditLog::getSourceType, sourceType)
                .eq(HrmTrainingCreditLog::getSourceId, sourceId));
        if (exists != null && exists > 0) {
            return;
        }
        HrmTrainingCreditLog log = new HrmTrainingCreditLog();
        log.setEmployeeId(employeeId);
        log.setEmployeeName(employeeName);
        log.setSourceType(sourceType);
        log.setSourceId(sourceId);
        log.setSourceTitle(sourceTitle);
        log.setCredit(defaultInt(credit, 0));
        log.setGrantTime(LocalDateTime.now());
        log.setRemark(remark);
        creditLogMapper.insert(log);
    }

    private void publishTrainingNotification(String eventId,
                                             String eventType,
                                             String businessType,
                                             Long businessId,
                                             List<Long> recipientIds,
                                             String title,
                                             String content,
                                             String currentStatus,
                                             String actionLabel,
                                             String actionUrl,
                                             boolean important) {
        trainingNotificationService.publish(eventId, eventType, businessType, businessId,
                recipientIds, title, content, currentStatus, actionLabel, actionUrl, important);
    }

    private List<Long> reviewRecipientIds(HrmTrainingLearningRecord learning) {
        if (learning == null) {
            return List.of();
        }
        LinkedHashSet<Long> recipients = new LinkedHashSet<>();
        OrgEmployee employee = learning.getEmployeeId() == null
                ? null
                : employeeMapper.selectById(learning.getEmployeeId());
        if (employee != null && employee.getManagerId() != null) {
            recipients.add(employee.getManagerId());
        }
        if (learning.getAssignerId() != null) {
            recipients.add(learning.getAssignerId());
        }
        recipients.remove(learning.getEmployeeUserId());
        return new ArrayList<>(recipients);
    }

    private List<Long> trainingRecipient(Long userId) {
        return userId == null ? List.of() : List.of(userId);
    }

    private String learningUrl(Long learningRecordId) {
        return learningRecordId == null
                ? "/training/learning"
                : "/training/learning?recordId=" + learningRecordId;
    }

    private String submissionCycle(HrmTrainingHomeworkSubmission submission) {
        LocalDateTime submittedTime = submission == null ? null : submission.getSubmittedTime();
        return submittedTime == null
                ? "0"
                : submittedTime.format(DateTimeFormatter.ofPattern("yyyyMMddHHmmssSSS"));
    }

    private int creditSum(Long employeeId) {
        return creditLogMapper.selectList(new LambdaQueryWrapper<HrmTrainingCreditLog>()
                        .eq(HrmTrainingCreditLog::getEmployeeId, employeeId))
                .stream()
                .mapToInt(item -> defaultInt(item.getCredit(), 0))
                .sum();
    }

    private List<Map<String, Object>> decorateLearningRecords(List<HrmTrainingLearningRecord> records) {
        if (records == null || records.isEmpty()) {
            return new ArrayList<>();
        }
        Map<Long, PathUnlockState> states = pathUnlockStates(records);
        return records.stream().map(record -> {
            Map<String, Object> view = objectMapper.convertValue(record,
                    new TypeReference<LinkedHashMap<String, Object>>() { });
            PathUnlockState state = states.getOrDefault(record.getId(), PathUnlockState.unlocked());
            view.put("locked", state.locked());
            view.put("lockReason", state.reason());
            view.put("unlockTime", state.unlockTime());
            view.put("prerequisiteTitle", state.prerequisiteTitle());
            return view;
        }).toList();
    }

    private Map<Long, PathUnlockState> pathUnlockStates(List<HrmTrainingLearningRecord> records) {
        Map<Long, PathUnlockState> result = new HashMap<>();
        if (records == null || records.isEmpty()) {
            return result;
        }
        records.forEach(record -> result.put(record.getId(), PathUnlockState.unlocked()));
        List<HrmTrainingLearningRecord> pathRecords = records.stream()
                .filter(record -> record.getId() != null && record.getPathId() != null && record.getCourseId() != null)
                .toList();
        if (pathRecords.isEmpty()) {
            return result;
        }

        Set<Long> pathIds = pathRecords.stream().map(HrmTrainingLearningRecord::getPathId).collect(Collectors.toSet());
        Set<Long> courseIds = pathRecords.stream().map(HrmTrainingLearningRecord::getCourseId).collect(Collectors.toSet());
        List<HrmTrainingPathCourse> rules = pathCourseMapper.selectList(new LambdaQueryWrapper<HrmTrainingPathCourse>()
                .in(HrmTrainingPathCourse::getPathId, pathIds)
                .in(HrmTrainingPathCourse::getCourseId, courseIds));
        Map<String, HrmTrainingPathCourse> ruleMap = rules.stream()
                .collect(Collectors.toMap(
                        rule -> pathCourseKey(rule.getPathId(), rule.getCourseId()),
                        Function.identity(),
                        (a, b) -> a));
        Set<Long> prerequisiteIds = rules.stream()
                .map(HrmTrainingPathCourse::getPrerequisiteCourseId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        Set<Long> employeeIds = pathRecords.stream()
                .map(HrmTrainingLearningRecord::getEmployeeId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        Set<String> passedKeys = new HashSet<>();
        if (!prerequisiteIds.isEmpty() && !employeeIds.isEmpty()) {
            learningMapper.selectList(new LambdaQueryWrapper<HrmTrainingLearningRecord>()
                            .in(HrmTrainingLearningRecord::getEmployeeId, employeeIds)
                            .in(HrmTrainingLearningRecord::getCourseId, prerequisiteIds)
                            .eq(HrmTrainingLearningRecord::getPassed, true))
                    .forEach(record -> passedKeys.add(employeeCourseKey(record.getEmployeeId(), record.getCourseId())));
        }
        Map<Long, String> prerequisiteTitles = prerequisiteIds.isEmpty()
                ? new HashMap<>()
                : courseMapper.selectBatchIds(prerequisiteIds).stream()
                .collect(Collectors.toMap(HrmTrainingCourse::getId, HrmTrainingCourse::getCourseTitle, (a, b) -> a));

        LocalDateTime now = LocalDateTime.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        for (HrmTrainingLearningRecord record : pathRecords) {
            HrmTrainingPathCourse rule = ruleMap.get(pathCourseKey(record.getPathId(), record.getCourseId()));
            if (rule == null) {
                continue;
            }
            int unlockDay = Math.max(0, defaultInt(rule.getUnlockDay(), 0));
            LocalDateTime unlockTime = unlockDay > 1 && record.getAssignedTime() != null
                    ? record.getAssignedTime().plusDays(unlockDay - 1L)
                    : null;
            if (unlockTime != null && unlockTime.isAfter(now)) {
                result.put(record.getId(), new PathUnlockState(true,
                        "该课程将在路径第" + unlockDay + "天解锁（" + unlockTime.format(formatter) + "）",
                        unlockTime,
                        null));
                continue;
            }
            Long prerequisiteId = rule.getPrerequisiteCourseId();
            if (prerequisiteId != null
                    && !passedKeys.contains(employeeCourseKey(record.getEmployeeId(), prerequisiteId))) {
                String prerequisiteTitle = prerequisiteTitles.getOrDefault(prerequisiteId, "前置课程");
                result.put(record.getId(), new PathUnlockState(true,
                        "请先通过前置课程「" + prerequisiteTitle + "」",
                        unlockTime,
                        prerequisiteTitle));
            }
        }
        return result;
    }

    private void ensurePathUnlocked(HrmTrainingLearningRecord record) {
        PathUnlockState state = pathUnlockStates(List.of(record)).getOrDefault(record.getId(), PathUnlockState.unlocked());
        if (state.locked()) {
            throw new BusinessException(state.reason());
        }
    }

    private String pathCourseKey(Long pathId, Long courseId) {
        return String.valueOf(pathId) + ":" + courseId;
    }

    private String employeeCourseKey(Long employeeId, Long courseId) {
        return String.valueOf(employeeId) + ":" + courseId;
    }

    private List<Map<String, Object>> pathProgressForEmployee(Long employeeId) {
        List<HrmTrainingLearningRecord> records = learningMapper.selectList(new LambdaQueryWrapper<HrmTrainingLearningRecord>()
                .eq(HrmTrainingLearningRecord::getEmployeeId, employeeId)
                .isNotNull(HrmTrainingLearningRecord::getPathId));
        Map<Long, Map<String, Object>> recordViews = decorateLearningRecords(records).stream()
                .collect(Collectors.toMap(item -> ((Number) item.get("id")).longValue(), Function.identity(), (a, b) -> a));
        return records.stream()
                .collect(Collectors.groupingBy(HrmTrainingLearningRecord::getPathId, LinkedHashMap::new, Collectors.toList()))
                .values()
                .stream()
                .map(list -> {
                    HrmTrainingLearningRecord first = list.get(0);
                    long done = list.stream().filter(item -> Boolean.TRUE.equals(item.getPassed())).count();
                    Map<String, Object> item = new HashMap<>();
                    item.put("pathId", first.getPathId());
                    item.put("pathName", first.getPathName());
                    item.put("total", list.size());
                    item.put("done", done);
                    item.put("percent", list.isEmpty() ? 0 : Math.round(done * 100.0 / list.size()));
                    item.put("records", list.stream().map(record -> recordViews.get(record.getId())).toList());
                    return item;
                })
                .toList();
    }

    private Map<String, Object> archiveOf(OrgEmployee employee) {
        Long employeeId = employee.getId();
        List<HrmTrainingLearningRecord> records = learningMapper.selectList(new LambdaQueryWrapper<HrmTrainingLearningRecord>()
                .eq(HrmTrainingLearningRecord::getEmployeeId, employeeId));
        List<HrmTrainingExamRecord> exams = examMapper.selectList(new LambdaQueryWrapper<HrmTrainingExamRecord>()
                .eq(HrmTrainingExamRecord::getEmployeeId, employeeId)
                .ne(HrmTrainingExamRecord::getManualReviewStatus, REVIEW_PENDING));
        long assigned = records.size();
        long completed = records.stream().filter(item -> Boolean.TRUE.equals(item.getPassed())).count();
        long required = records.stream().filter(item -> Boolean.TRUE.equals(item.getRequiredCourse())).count();
        long requiredDone = records.stream().filter(item -> Boolean.TRUE.equals(item.getRequiredCourse()) && Boolean.TRUE.equals(item.getPassed())).count();
        long passedExam = exams.stream().filter(item -> Boolean.TRUE.equals(item.getPassed())).count();
        long homeworkPassed = homeworkSubmissionMapper.selectCount(new LambdaQueryWrapper<HrmTrainingHomeworkSubmission>()
                .eq(HrmTrainingHomeworkSubmission::getEmployeeId, employeeId)
                .eq(HrmTrainingHomeworkSubmission::getPassed, true));
        Map<String, Object> item = new HashMap<>();
        item.put("employee", employee);
        item.put("assignedCourses", assigned);
        item.put("completedCourses", completed);
        item.put("requiredCompletionRate", required == 0 ? 0 : Math.round(requiredDone * 100.0 / required));
        item.put("examPassRate", exams.isEmpty() ? 0 : Math.round(passedExam * 100.0 / exams.size()));
        item.put("averageScore", exams.isEmpty() ? 0 : Math.round(exams.stream().mapToInt(e -> defaultInt(e.getTotalScore(), 0)).average().orElse(0)));
        item.put("homeworkPassed", homeworkPassed);
        item.put("certificationCount", certificationMapper.selectCount(new LambdaQueryWrapper<HrmTrainingCertification>()
                .eq(HrmTrainingCertification::getEmployeeId, employeeId)));
        item.put("credit", creditSum(employeeId));
        item.put("pendingTasks", records.stream().filter(record -> !Boolean.TRUE.equals(record.getPassed())).count());
        item.put("paths", pathProgressForEmployee(employeeId));
        return item;
    }

    private boolean canRecordEnterExam(HrmTrainingLearningRecord record) {
        return STATUS_LEARNED.equals(record.getStatus());
    }

    private HrmTrainingPath buildPath(PathPayload request) {
        if (request == null) {
            throw new BusinessException("路径信息不能为空");
        }
        HrmTrainingPath path = new HrmTrainingPath();
        path.setPathName(trim(request.getPathName()));
        path.setApplicablePosition(trim(request.getApplicablePosition()));
        path.setDescription(request.getDescription());
        path.setRequiredPath(request.getRequiredPath() == null || request.getRequiredPath());
        path.setEnabled(request.getEnabled() == null || request.getEnabled());
        path.setOwnerId(request.getOwnerId());
        path.setVersionNo(StringUtils.hasText(request.getVersionNo()) ? request.getVersionNo() : "v1.0");
        if (!StringUtils.hasText(path.getPathName())) {
            throw new BusinessException("路径名称不能为空");
        }
        if (!StringUtils.hasText(path.getApplicablePosition())) {
            throw new BusinessException("请选择适用岗位");
        }
        if (path.getOwnerId() != null) {
            OrgEmployee owner = employeeMapper.selectById(path.getOwnerId());
            if (owner != null) {
                path.setOwnerName(owner.getName());
            }
        }
        return path;
    }

    private void savePathCourses(Long pathId, List<Long> courseIds, List<PathCourseRulePayload> courseRules) {
        if (courseIds == null || courseIds.isEmpty()) {
            return;
        }
        if (courseIds.stream().filter(Objects::nonNull).distinct().count() != courseIds.size()) {
            throw new BusinessException("岗位路径不能重复配置同一门课程");
        }
        List<HrmTrainingCourse> courses = courseMapper.selectList(new LambdaQueryWrapper<HrmTrainingCourse>()
                .in(HrmTrainingCourse::getId, courseIds));
        if (courses.size() != courseIds.size()) {
            throw new BusinessException("岗位路径包含不存在的课程，请刷新后重试");
        }
        Map<Long, HrmTrainingCourse> courseMap = courses.stream()
                .collect(Collectors.toMap(HrmTrainingCourse::getId, Function.identity(), (a, b) -> a));
        Map<Long, PathCourseRulePayload> ruleMap = courseRules == null
                ? new HashMap<>()
                : courseRules.stream()
                .filter(rule -> rule != null && rule.getCourseId() != null)
                .collect(Collectors.toMap(PathCourseRulePayload::getCourseId, Function.identity(), (a, b) -> b));
        int index = 1;
        Long previousCourseId = null;
        Set<Long> previousCourseIds = new HashSet<>();
        for (Long courseId : courseIds) {
            HrmTrainingCourse course = courseMap.get(courseId);
            if (course == null) {
                continue;
            }
            HrmTrainingPathCourse pathCourse = new HrmTrainingPathCourse();
            pathCourse.setPathId(pathId);
            pathCourse.setCourseId(course.getId());
            pathCourse.setCourseTitle(course.getCourseTitle());
            PathCourseRulePayload rule = ruleMap.get(courseId);
            Long prerequisiteCourseId = rule == null ? previousCourseId : rule.getPrerequisiteCourseId();
            if (prerequisiteCourseId != null && !previousCourseIds.contains(prerequisiteCourseId)) {
                throw new BusinessException("前置课程必须排在当前课程之前：" + course.getCourseTitle());
            }
            pathCourse.setPrerequisiteCourseId(prerequisiteCourseId);
            pathCourse.setSortOrder(index++);
            pathCourse.setUnlockDay(clamp(defaultInt(rule == null ? null : rule.getUnlockDay(), 0), 0, 365));
            pathCourse.setRequiredCourse(rule != null && rule.getRequiredCourse() != null
                    ? rule.getRequiredCourse()
                    : course.getRequiredCourse());
            pathCourseMapper.insert(pathCourse);
            previousCourseId = course.getId();
            previousCourseIds.add(course.getId());
        }
    }

    private List<HrmTrainingMaterial> enabledMaterials(Long courseId) {
        return materialMapper.selectList(new LambdaQueryWrapper<HrmTrainingMaterial>()
                .eq(HrmTrainingMaterial::getCourseId, courseId)
                .eq(HrmTrainingMaterial::getEnabled, true)
                .orderByAsc(HrmTrainingMaterial::getSortOrder)
                .orderByAsc(HrmTrainingMaterial::getId));
    }

    private List<HrmTrainingExamQuestion> enabledQuestions(Long courseId) {
        return questionMapper.selectList(new LambdaQueryWrapper<HrmTrainingExamQuestion>()
                .eq(HrmTrainingExamQuestion::getCourseId, courseId)
                .eq(HrmTrainingExamQuestion::getEnabled, true)
                .orderByAsc(HrmTrainingExamQuestion::getSortOrder)
                .orderByAsc(HrmTrainingExamQuestion::getId));
    }

    private boolean isObjectiveCorrect(HrmTrainingExamQuestion question, String answerJson) {
        if (!StringUtils.hasText(question.getAnswerJson())) {
            return false;
        }
        if (TYPE_MULTIPLE.equals(question.getQuestionType())) {
            List<String> standard = jsonToStringList(question.getAnswerJson());
            List<String> actual = jsonToStringList(answerJson);
            return new HashSet<>(standard).equals(new HashSet<>(actual));
        }
        return Objects.equals(jsonToScalar(question.getAnswerJson()), jsonToScalar(answerJson));
    }

    private List<String> jsonToStringList(String json) {
        if (!StringUtils.hasText(json)) {
            return new ArrayList<>();
        }
        try {
            Object value = objectMapper.readValue(json, Object.class);
            if (value instanceof List<?> list) {
                return list.stream().map(String::valueOf).map(String::trim).filter(StringUtils::hasText).sorted().toList();
            }
            String scalar = String.valueOf(value).trim();
            return StringUtils.hasText(scalar) ? List.of(scalar) : new ArrayList<>();
        } catch (Exception ex) {
            String scalar = json.trim();
            return StringUtils.hasText(scalar) ? List.of(scalar) : new ArrayList<>();
        }
    }

    private String jsonToScalar(String json) {
        if (!StringUtils.hasText(json)) {
            return "";
        }
        try {
            Object value = objectMapper.readValue(json, Object.class);
            if (value instanceof List<?> list) {
                return list.isEmpty() ? "" : String.valueOf(list.get(0)).trim();
            }
            return String.valueOf(value).trim();
        } catch (Exception ex) {
            return json.trim();
        }
    }

    private String answerToJson(SubmitAnswerPayload submitted) {
        if (StringUtils.hasText(submitted.getAnswerJson())) {
            return submitted.getAnswerJson();
        }
        Object answer = submitted.getAnswer();
        if (answer == null && StringUtils.hasText(submitted.getAnswerText())) {
            answer = submitted.getAnswerText();
        }
        if (answer == null) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(answer);
        } catch (JsonProcessingException ex) {
            return String.valueOf(answer);
        }
    }

    private List<Map<String, Object>> buildWrongQuestionsAfterReview(List<HrmTrainingAnswer> answers,
                                                                     Map<Long, HrmTrainingExamQuestion> questionMap) {
        List<Map<String, Object>> wrongQuestions = new ArrayList<>();
        for (HrmTrainingAnswer answer : answers) {
            HrmTrainingExamQuestion question = questionMap.get(answer.getQuestionId());
            if (TYPE_THINKING.equals(answer.getQuestionType())) {
                if (defaultInt(answer.getScore(), 0) < defaultInt(answer.getMaxScore(), 0)) {
                    wrongQuestions.add(wrongQuestion(question, answer.getAnswerJson(), answer.getScore()));
                }
            } else if (!Boolean.TRUE.equals(answer.getCorrectFlag())) {
                wrongQuestions.add(wrongQuestion(question, answer.getAnswerJson(), answer.getScore()));
            }
        }
        return wrongQuestions;
    }

    private Map<String, Object> wrongQuestion(HrmTrainingExamQuestion question, String answerJson, Integer score) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("questionId", question == null ? null : question.getId());
        item.put("questionTitle", question == null ? "" : question.getQuestionTitle());
        item.put("questionType", question == null ? "" : question.getQuestionType());
        item.put("answer", answerJson);
        item.put("standardAnswer", question == null ? null : question.getAnswerJson());
        item.put("analysis", question == null ? null : question.getAnalysis());
        item.put("score", defaultInt(score, 0));
        item.put("maxScore", question == null ? 0 : defaultInt(question.getScore(), 0));
        return item;
    }

    private List<Map<String, Object>> highFrequencyWrongQuestions() {
        List<HrmTrainingAnswer> answers = answerMapper.selectList(new LambdaQueryWrapper<HrmTrainingAnswer>()
                .and(w -> w.eq(HrmTrainingAnswer::getCorrectFlag, false)
                        .or()
                        .apply("question_type = 'THINKING' AND IFNULL(score,0) < IFNULL(max_score,0)"))
                .orderByDesc(HrmTrainingAnswer::getUpdateTime)
                .last("LIMIT 500"));
        Map<Long, List<HrmTrainingAnswer>> grouped = answers.stream()
                .filter(item -> item.getQuestionId() != null)
                .collect(Collectors.groupingBy(HrmTrainingAnswer::getQuestionId));
        return grouped.entrySet().stream()
                .map(entry -> {
                    HrmTrainingAnswer first = entry.getValue().get(0);
                    Map<String, Object> item = new HashMap<>();
                    item.put("questionId", entry.getKey());
                    item.put("questionTitle", first.getQuestionTitle());
                    item.put("questionType", first.getQuestionType());
                    item.put("wrongCount", entry.getValue().size());
                    return item;
                })
                .sorted((a, b) -> Integer.compare((Integer) b.get("wrongCount"), (Integer) a.get("wrongCount")))
                .limit(8)
                .toList();
    }

    private Map<String, Object> videoLearningMetrics() {
        List<HrmTrainingMaterial> videoMaterials = materialMapper.selectList(
                new LambdaQueryWrapper<HrmTrainingMaterial>()
                        .eq(HrmTrainingMaterial::getMaterialType, "VIDEO")
                        .eq(HrmTrainingMaterial::getEnabled, true));
        Set<Long> videoCourseIds = videoMaterials.stream()
                .map(HrmTrainingMaterial::getCourseId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        List<HrmTrainingLearningRecord> visibleRecords = scopedLearningList(
                new LambdaQueryWrapper<HrmTrainingLearningRecord>()
                        .select(HrmTrainingLearningRecord::getId,
                                HrmTrainingLearningRecord::getEmployeeId,
                                HrmTrainingLearningRecord::getCourseId));
        List<Long> recordIds = visibleRecords.stream()
                .map(HrmTrainingLearningRecord::getId)
                .filter(Objects::nonNull)
                .toList();
        List<HrmTrainingLearningStep> steps = recordIds.isEmpty()
                ? new ArrayList<>()
                : learningStepMapper.selectList(new LambdaQueryWrapper<HrmTrainingLearningStep>()
                .in(HrmTrainingLearningStep::getLearningRecordId, recordIds)
                .eq(HrmTrainingLearningStep::getStepType, "VIDEO"));

        Set<String> startedLessons = steps.stream()
                .map(step -> step.getLearningRecordId() + ":" + step.getMaterialId())
                .collect(Collectors.toSet());
        Set<String> completedLessons = steps.stream()
                .filter(step -> Boolean.TRUE.equals(step.getCompleted()))
                .map(step -> step.getLearningRecordId() + ":" + step.getMaterialId())
                .collect(Collectors.toSet());
        Set<Long> startedLearners = steps.stream()
                .map(HrmTrainingLearningStep::getEmployeeId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        Set<Long> completedLearners = steps.stream()
                .filter(step -> Boolean.TRUE.equals(step.getCompleted()))
                .map(HrmTrainingLearningStep::getEmployeeId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        int averageCoverage = steps.isEmpty() ? 0 : (int) Math.round(steps.stream()
                .mapToInt(step -> defaultInt(step.getCoveragePercent(), 0))
                .average().orElse(0));
        long validWatchSeconds = steps.stream()
                .mapToLong(step -> defaultInt(step.getValidWatchedSeconds(), 0))
                .sum();

        Map<Long, HrmTrainingCourse> courseMap = videoCourseIds.isEmpty()
                ? Map.of()
                : courseMapper.selectBatchIds(videoCourseIds).stream()
                .collect(Collectors.toMap(HrmTrainingCourse::getId, Function.identity(), (a, b) -> a));
        List<Map<String, Object>> courseQuality = steps.stream()
                .filter(step -> step.getCourseId() != null)
                .collect(Collectors.groupingBy(HrmTrainingLearningStep::getCourseId))
                .entrySet().stream()
                .map(entry -> {
                    List<HrmTrainingLearningStep> courseSteps = entry.getValue();
                    Set<String> courseStarts = courseSteps.stream()
                            .map(step -> step.getLearningRecordId() + ":" + step.getMaterialId())
                            .collect(Collectors.toSet());
                    Set<String> courseCompleted = courseSteps.stream()
                            .filter(step -> Boolean.TRUE.equals(step.getCompleted()))
                            .map(step -> step.getLearningRecordId() + ":" + step.getMaterialId())
                            .collect(Collectors.toSet());
                    int coverage = (int) Math.round(courseSteps.stream()
                            .mapToInt(step -> defaultInt(step.getCoveragePercent(), 0))
                            .average().orElse(0));
                    Map<String, Object> item = new LinkedHashMap<>();
                    HrmTrainingCourse course = courseMap.get(entry.getKey());
                    item.put("courseId", entry.getKey());
                    item.put("courseTitle", course == null ? "课程已调整" : course.getCourseTitle());
                    item.put("startedLessons", courseStarts.size());
                    item.put("completedLessons", courseCompleted.size());
                    item.put("completionRate", courseStarts.isEmpty() ? 0
                            : Math.round(courseCompleted.size() * 100.0 / courseStarts.size()));
                    item.put("averageCoverage", coverage);
                    return item;
                })
                .sorted(Comparator
                        .comparingInt((Map<String, Object> item) -> (Integer) item.get("completionRate"))
                        .thenComparingInt(item -> (Integer) item.get("averageCoverage")))
                .limit(8)
                .toList();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("videoCourseCount", videoCourseIds.size());
        result.put("videoMaterialCount", videoMaterials.size());
        result.put("startedLearners", startedLearners.size());
        result.put("completedLearners", completedLearners.size());
        result.put("startedLessons", startedLessons.size());
        result.put("completedLessons", completedLessons.size());
        result.put("completionRate", startedLessons.isEmpty() ? 0
                : Math.round(completedLessons.size() * 100.0 / startedLessons.size()));
        result.put("averageCoverage", averageCoverage);
        result.put("validWatchMinutes", Math.round(validWatchSeconds / 60.0));
        result.put("riskCourses", courseQuality);
        return result;
    }

    private List<Map<String, Object>> readWrongQuestions(String value) {
        if (!StringUtils.hasText(value)) {
            return new ArrayList<>();
        }
        try {
            return objectMapper.readValue(value, new TypeReference<List<Map<String, Object>>>() { });
        } catch (Exception e) {
            log.warn("解析培训错题记录失败", e);
            return new ArrayList<>();
        }
    }

    private String writeJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException ex) {
            return "[]";
        }
    }

    private void hideQuestionAnswer(HrmTrainingExamQuestion question) {
        question.setAnswerJson(null);
        question.setAnalysis(null);
        question.setScoringStandard(null);
    }

    private void hideProtectedMaterialFile(HrmTrainingMaterial material) {
        if (isPptMaterial(material) || isVideoMaterial(material)) {
            material.setFileId(null);
            if (isPptMaterial(material)) {
                material.setFileName(null);
            }
        }
    }

    private boolean isPptMaterial(HrmTrainingMaterial material) {
        String type = String.valueOf(material.getMaterialType()).toUpperCase();
        String fileName = String.valueOf(material.getFileName()).toLowerCase();
        String materialName = String.valueOf(material.getMaterialName()).toLowerCase();
        return "PPT".equals(type)
                || fileName.endsWith(".ppt") || fileName.endsWith(".pptx")
                || materialName.endsWith(".ppt") || materialName.endsWith(".pptx");
    }

    private boolean isVideoMaterial(HrmTrainingMaterial material) {
        String type = String.valueOf(material.getMaterialType()).toUpperCase();
        String source = (String.valueOf(material.getFileName()) + " "
                + String.valueOf(material.getMaterialName()) + " "
                + String.valueOf(material.getMaterialUrl())).toLowerCase();
        return "VIDEO".equals(type) || source.matches(".*\\.(mp4|webm|ogg)(?:[?#].*)?.*");
    }

    private void validateVideoMaterial(HrmTrainingMaterial material) {
        if (!isVideoMaterial(material)) {
            return;
        }
        if (material.getDurationSeconds() == null || material.getDurationSeconds() <= 0
                || material.getDurationSeconds() > 86_400) {
            throw new BusinessException("视频课件必须包含有效时长");
        }
        if (material.getFileId() == null && !StringUtils.hasText(material.getMaterialUrl())
                && !StringUtils.hasText(material.getProviderMediaId())) {
            throw new BusinessException("视频课件必须上传文件或配置可播放地址");
        }
        if (material.getFileId() == null && StringUtils.hasText(material.getMaterialUrl())
                && !material.getMaterialUrl().matches("(?i)^https?://.+")) {
            throw new BusinessException("外部视频地址必须使用 http 或 https");
        }
        if (Boolean.TRUE.equals(material.getRequiredMaterial()) && material.getFileId() == null) {
            throw new BusinessException("外部视频无法保护原文件，不能设为必学；请上传到系统或改为选修参考");
        }
    }

    private void protectVideoSourceFile(HrmTrainingMaterial material) {
        if (!isVideoMaterial(material) || material.getFileId() == null) {
            return;
        }
        FileInfo file = fileInfoService.getById(material.getFileId());
        if (file == null) {
            throw new BusinessException("视频课件原文件不存在，请重新上传");
        }
        String extension = String.valueOf(file.getFileType()).trim().toLowerCase();
        String name = String.valueOf(file.getOriginalName()).trim().toLowerCase();
        String mime = String.valueOf(file.getMimeType()).trim().toLowerCase();
        boolean videoFile = Set.of("mp4", "webm", "ogg").contains(extension)
                || name.matches(".*\\.(mp4|webm|ogg)$")
                || mime.startsWith("video/");
        if (!videoFile) {
            throw new BusinessException("上传的文件不是受支持的视频格式");
        }
        if (!"TRAINING_VIDEO".equalsIgnoreCase(file.getAccessScope())) {
            file.setAccessScope("TRAINING_VIDEO");
            fileInfoService.updateById(file);
        }
    }

    private void requireMaterialAccess(HrmTrainingCourse course) {
        if (canManage()) {
            return;
        }
        Long employeeId = requireCurrentEmployeeId();
        Long count = learningMapper.selectCount(new LambdaQueryWrapper<HrmTrainingLearningRecord>()
                .eq(HrmTrainingLearningRecord::getCourseId, course.getId())
                .eq(HrmTrainingLearningRecord::getEmployeeId, employeeId));
        if (count == null || count <= 0) {
            throw new BusinessException("只能查看分配给自己的学习课件");
        }
    }

    private ResponseEntity<Resource> inlineFileResponse(Map<String, Object> result) {
        String filePath = (String) result.get("filePath");
        String fileName = (String) result.get("fileName");
        String mimeType = (String) result.get("mimeType");
        File file = new File(filePath);
        if (!file.exists()) {
            return ResponseEntity.notFound().build();
        }
        boolean safeInline = StringUtils.hasText(mimeType)
                && SAFE_INLINE_MIME_TYPES.contains(mimeType.toLowerCase(Locale.ROOT));
        MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;
        if (safeInline) {
            try {
                mediaType = MediaType.parseMediaType(mimeType);
            } catch (Exception ignored) {
                mediaType = MediaType.APPLICATION_OCTET_STREAM;
                safeInline = false;
            }
        }
        String encodedName = URLEncoder.encode(fileName, StandardCharsets.UTF_8).replace("+", "%20");
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        (safeInline ? "inline" : "attachment") + "; filename*=UTF-8''" + encodedName)
                .header(HttpHeaders.CACHE_CONTROL, "no-store")
                .header("X-Content-Type-Options", "nosniff")
                .header("Content-Security-Policy", "default-src 'none'; sandbox")
                .header("Cross-Origin-Resource-Policy", "same-origin")
                .contentType(safeInline ? mediaType : MediaType.APPLICATION_OCTET_STREAM)
                .body(new FileSystemResource(file));
    }

    private void markCourseUsed(Long courseId) {
        courseMapper.update(null, new LambdaUpdateWrapper<HrmTrainingCourse>()
                .eq(HrmTrainingCourse::getId, courseId)
                .setSql("usage_count = IFNULL(usage_count, 0) + 1")
                .set(HrmTrainingCourse::getLastUsedTime, LocalDateTime.now()));
    }

    private boolean canViewAllTraining() {
        return dataScopeHelper.isHrAdminOrBoss();
    }

    private boolean canManage() {
        return dataScopeHelper.isHrAdminOrBoss() || dataScopeHelper.isManagerOrAdmin() || canManageContent();
    }

    private boolean canManageContent() {
        // boss 在全局鉴权中按管理员放行，但培训产品侧默认只读；
        // 内容维护只授予人事、系统/超级管理员及其复制角色。
        return SecurityUtils.hasAnyRole("hr", "super_admin", "sys_admin", "admin")
                || Long.valueOf(1L).equals(SecurityUtils.getCurrentUserId());
    }

    private void requireManage() {
        if (!canManage()) {
            throw new BusinessException("只有老板、人事或主管可以处理培训任务与考评");
        }
    }

    private void requireContentManage() {
        if (!canManageContent()) {
            throw new BusinessException("只有人事或培训管理员可以维护课程、题库与岗位方案");
        }
    }

    private void requireLearningAccess(HrmTrainingLearningRecord record) {
        if (canViewAllTraining()) {
            return;
        }
        if (canManage() && employeeVisible(record.getEmployeeId())) {
            return;
        }
        if (!requireCurrentEmployeeId().equals(record.getEmployeeId())) {
            throw new BusinessException("只能操作自己的学习任务");
        }
    }

    private void requireOwnLearningAccess(HrmTrainingLearningRecord record) {
        if (!requireCurrentEmployeeId().equals(record.getEmployeeId())) {
            throw new BusinessException("只能学习和提交自己的培训任务");
        }
    }

    private void requireEmployeeVisible(Long employeeId) {
        if (employeeId == null) {
            throw new BusinessException("员工 ID 不能为空");
        }
        if (canViewAllTraining()) {
            return;
        }
        if (!employeeVisible(employeeId)) {
            throw new BusinessException("无权查看该员工培训数据");
        }
    }

    private boolean employeeVisible(Long employeeId) {
        List<Long> visibleIds = visibleEmployeeIdsForTraining();
        return visibleIds == null || visibleIds.contains(employeeId);
    }

    private List<Long> visibleEmployeeIdsForTraining() {
        if (canViewAllTraining()) {
            return null;
        }
        List<Long> userIds = dataScopeHelper.getVisibleUserIds();
        if (userIds == null) {
            return null;
        }
        if (userIds.isEmpty()) {
            return List.of(-1L);
        }
        List<Long> ids = employeeMapper.selectList(new LambdaQueryWrapper<OrgEmployee>()
                        .select(OrgEmployee::getId)
                        .in(OrgEmployee::getUserId, userIds))
                .stream()
                .map(OrgEmployee::getId)
                .toList();
        return ids.isEmpty() ? List.of(-1L) : ids;
    }

    private List<Long> safeIds(List<Long> ids) {
        return ids == null ? null : (ids.isEmpty() ? List.of(-1L) : ids);
    }

    private List<Long> activeVisibleEmployeeIdsForTraining() {
        List<Long> visibleIds = visibleEmployeeIdsForTraining();
        LambdaQueryWrapper<OrgEmployee> wrapper = new LambdaQueryWrapper<OrgEmployee>()
                .select(OrgEmployee::getId)
                .in(OrgEmployee::getStatus, 1, 2);
        if (visibleIds != null) {
            wrapper.in(OrgEmployee::getId, safeIds(visibleIds));
        }
        List<Long> ids = employeeMapper.selectList(wrapper).stream()
                .map(OrgEmployee::getId)
                .toList();
        return ids.isEmpty() ? List.of(-1L) : ids;
    }

    private void applyLearningScope(LambdaQueryWrapper<HrmTrainingLearningRecord> wrapper) {
        wrapper.in(HrmTrainingLearningRecord::getEmployeeId, activeVisibleEmployeeIdsForTraining());
    }

    private void applyExamScope(LambdaQueryWrapper<HrmTrainingExamRecord> wrapper) {
        wrapper.in(HrmTrainingExamRecord::getEmployeeId, activeVisibleEmployeeIdsForTraining());
    }

    private void applyCertificationScope(LambdaQueryWrapper<HrmTrainingCertification> wrapper) {
        wrapper.in(HrmTrainingCertification::getEmployeeId, activeVisibleEmployeeIdsForTraining());
    }

    private void applyHomeworkSubmissionScope(LambdaQueryWrapper<HrmTrainingHomeworkSubmission> wrapper) {
        wrapper.in(HrmTrainingHomeworkSubmission::getEmployeeId, activeVisibleEmployeeIdsForTraining());
    }

    private List<HrmTrainingLearningRecord> scopedLearningList(LambdaQueryWrapper<HrmTrainingLearningRecord> wrapper) {
        applyLearningScope(wrapper);
        return learningMapper.selectList(wrapper);
    }

    private long countLearningScoped(LambdaQueryWrapper<HrmTrainingLearningRecord> wrapper) {
        applyLearningScope(wrapper);
        Long count = learningMapper.selectCount(wrapper);
        return count == null ? 0 : count;
    }

    private List<HrmTrainingExamRecord> scopedExamList(LambdaQueryWrapper<HrmTrainingExamRecord> wrapper) {
        applyExamScope(wrapper);
        return examMapper.selectList(wrapper);
    }

    private long countExamScoped(LambdaQueryWrapper<HrmTrainingExamRecord> wrapper) {
        applyExamScope(wrapper);
        Long count = examMapper.selectCount(wrapper);
        return count == null ? 0 : count;
    }

    private long countHomeworkScoped(LambdaQueryWrapper<HrmTrainingHomeworkSubmission> wrapper) {
        applyHomeworkSubmissionScope(wrapper);
        Long count = homeworkSubmissionMapper.selectCount(wrapper);
        return count == null ? 0 : count;
    }

    private List<HrmTrainingHomeworkSubmission> scopedHomeworkList(LambdaQueryWrapper<HrmTrainingHomeworkSubmission> wrapper) {
        applyHomeworkSubmissionScope(wrapper);
        return homeworkSubmissionMapper.selectList(wrapper);
    }

    private void requireHomeworkSubmitAccess(HrmTrainingHomeworkSubmission submission) {
        if (!requireCurrentEmployeeId().equals(submission.getEmployeeId())) {
            throw new BusinessException("只能提交自己的作业");
        }
    }

    private void requireHomeworkReviewAccess(HrmTrainingHomeworkSubmission submission) {
        requireEmployeeVisible(submission.getEmployeeId());
    }

    private Long requireCurrentEmployeeId() {
        Long employeeId = dataScopeHelper.currentEmployeeId();
        if (employeeId == null) {
            throw new BusinessException("当前账号尚未关联员工档案");
        }
        return employeeId;
    }

    private HrmTrainingCourse requireCourse(Long id) {
        if (id == null) {
            throw new BusinessException("课程 ID 不能为空");
        }
        HrmTrainingCourse course = courseMapper.selectById(id);
        if (course == null) {
            throw new BusinessException("课程不存在");
        }
        return course;
    }

    private HrmTrainingLearningRecord requireLearning(Long id) {
        if (id == null) {
            throw new BusinessException("学习记录 ID 不能为空");
        }
        HrmTrainingLearningRecord record = learningMapper.selectById(id);
        if (record == null) {
            throw new BusinessException("学习记录不存在");
        }
        return record;
    }

    private HrmTrainingExamRecord requireExam(Long id) {
        if (id == null) {
            throw new BusinessException("考试记录 ID 不能为空");
        }
        HrmTrainingExamRecord exam = examMapper.selectById(id);
        if (exam == null) {
            throw new BusinessException("考试记录不存在");
        }
        return exam;
    }

    private HrmTrainingPath requirePath(Long id) {
        if (id == null) {
            throw new BusinessException("岗位路径 ID 不能为空");
        }
        HrmTrainingPath path = pathMapper.selectById(id);
        if (path == null) {
            throw new BusinessException("岗位路径不存在");
        }
        return path;
    }

    private HrmTrainingHomework requireHomework(Long id) {
        if (id == null) {
            throw new BusinessException("作业 ID 不能为空");
        }
        HrmTrainingHomework homework = homeworkMapper.selectById(id);
        if (homework == null) {
            throw new BusinessException("作业不存在");
        }
        return homework;
    }

    private HrmTrainingHomeworkSubmission requireHomeworkSubmission(Long id) {
        if (id == null) {
            throw new BusinessException("作业提交 ID 不能为空");
        }
        HrmTrainingHomeworkSubmission submission = homeworkSubmissionMapper.selectById(id);
        if (submission == null) {
            throw new BusinessException("作业提交记录不存在");
        }
        return submission;
    }

    private OrgEmployee requireEmployee(Long id) {
        OrgEmployee employee = employeeMapper.selectById(id);
        if (employee == null) {
            throw new BusinessException("员工档案不存在");
        }
        return employee;
    }

    private int defaultInt(Integer value, int fallback) {
        return value == null ? fallback : value;
    }

    private int positiveInt(Integer value, int fallback) {
        return value != null && value > 0 ? value : fallback;
    }

    private String defaultText(String value, String fallback) {
        return StringUtils.hasText(value) ? value.trim() : fallback;
    }

    private int nvl(Integer value) {
        return value == null ? 0 : value;
    }

    private int maxScore(Integer oldScore, Integer newScore) {
        return Math.max(defaultInt(oldScore, 0), defaultInt(newScore, 0));
    }

    private int clamp(int value, int min, int max) {
        return Math.max(min, Math.min(max, value));
    }

    private String trim(String value) {
        return value == null ? null : value.trim();
    }

    private List<Long> parseIds(String value) {
        if (!StringUtils.hasText(value)) {
            return new ArrayList<>();
        }
        List<Long> ids = new ArrayList<>();
        for (String part : value.split(",")) {
            if (!StringUtils.hasText(part)) {
                continue;
            }
            try {
                ids.add(Long.parseLong(part.trim()));
            } catch (NumberFormatException ignored) {
                // 忽略前端异常传值,不让一个坏ID影响整次体检。
            }
        }
        return ids;
    }

    private String defaultImprovement(boolean passed, List<Map<String, Object>> wrongQuestions) {
        if (passed) {
            return null;
        }
        if (wrongQuestions == null || wrongQuestions.isEmpty()) {
            return "未达到及格分,请重新学习课件后再考核。";
        }
        return "未通过:请重点复习错题对应的 SOP 步骤和检查标准。";
    }

    private record PathSnapshot(Long id, String name) {
    }

    private record PathUnlockState(boolean locked,
                                   String reason,
                                   LocalDateTime unlockTime,
                                   String prerequisiteTitle) {
        private static PathUnlockState unlocked() {
            return new PathUnlockState(false, null, null, null);
        }
    }

    @Data
    public static class CoursePayload {
        private Long id;
        private String courseCode;
        private String courseTitle;
        private String courseCategory;
        private Long sopId;
        private String sopTitle;
        private String sopVersion;
        private String applicablePositions;
        private String applicableStage;
        private String businessScenario;
        private String courseType;
        private String summary;
        private Integer learningMinutesRequired;
        private Integer credit;
        private Boolean requiredCourse;
        private Integer passScore;
        private Integer examDurationMinutes;
        private Boolean allowRetake;
        private Integer maxRetakeTimes;
        private Boolean certificationEnabled;
        private String certificationName;
        private Long ownerId;
        private String lecturerName;
        private String versionNo;
        private Boolean enabled;
        private String courseStatus;
        private Integer usageCount;
        private List<MaterialPayload> materials = new ArrayList<>();
        private List<QuestionPayload> questions = new ArrayList<>();
    }

    @Data
    public static class MaterialPayload {
        private Long id;
        private String materialType;
        private String materialName;
        private String materialUrl;
        private Long fileId;
        private String fileName;
        private String materialContent;
        private Integer durationMinutes;
        private Integer sortOrder;
        private Boolean requiredMaterial;
        private Boolean enabled;
        private String mediaProvider;
        private String providerMediaId;
        private String transcodeStatus;
        private Integer durationSeconds;
        private String coverUrl;
        private String subtitleUrl;
        private Integer minWatchPercent;
        private Boolean allowSpeed;
        private Boolean watermarkEnabled;
        private String playbackPolicy;
    }

    @Data
    public static class QuestionPayload {
        private String questionPosition;
        private String questionType;
        private String difficulty;
        private String questionTitle;
        private String optionsJson;
        private String answerJson;
        private String analysis;
        private Integer score;
        private String scoringStandard;
        private Integer sortOrder;
        private Boolean enabled;
    }

    @Data
    public static class AssignCourseRequest {
        private List<Long> employeeIds = new ArrayList<>();
        private List<Long> courseIds = new ArrayList<>();
        private LocalDateTime dueTime;
    }

    @Data
    public static class LearningProgressRequest {
        private List<LearningProgressStepPayload> steps = new ArrayList<>();
        private String source;
    }

    @Data
    public static class LearningProgressStepPayload {
        private Long materialId;
        private Integer stepIndex;
        private Boolean completed;
        private Integer positionSeconds;
        private Integer durationSeconds;
        private String eventType;
        private String playbackSessionId;
        private Double playbackRate;
        private String deviceType;
    }

    @Data
    public static class SubmitExamRequest {
        private List<SubmitAnswerPayload> answers = new ArrayList<>();
    }

    @Data
    public static class SubmitAnswerPayload {
        private Long questionId;
        private Object answer;
        private String answerText;
        private String answerJson;
    }

    @Data
    public static class ManualReviewRequest {
        private List<ManualAnswerScore> answers = new ArrayList<>();
        private String improvement;
    }

    @Data
    public static class ManualAnswerScore {
        private Long answerId;
        private Integer score;
        private String reviewerComment;
    }

    @Data
    public static class PathPayload {
        private Long id;
        private String pathName;
        private String applicablePosition;
        private String description;
        private Boolean requiredPath;
        private Boolean enabled;
        private Long ownerId;
        private String versionNo;
        private List<Long> courseIds = new ArrayList<>();
        private List<PathCourseRulePayload> courseRules = new ArrayList<>();
    }

    @Data
    public static class PathCourseRulePayload {
        private Long courseId;
        private Long prerequisiteCourseId;
        private Integer unlockDay;
        private Boolean requiredCourse;
    }

    @Data
    public static class AssignPathRequest {
        private List<Long> employeeIds = new ArrayList<>();
        private LocalDateTime dueTime;
    }

    @Data
    public static class HomeworkPayload {
        private Long id;
        private Long courseId;
        private String homeworkName;
        private String homeworkType;
        private String submitInstruction;
        private Long attachmentFileId;
        private String attachmentName;
        private Integer passScore;
        private Integer credit;
        private Boolean enabled;
        private Integer sortOrder;
    }

    @Data
    public static class HomeworkSubmitRequest {
        private String submitContent;
        private Long attachmentFileId;
        private String attachmentName;
    }

    @Data
    public static class HomeworkReviewRequest {
        private Integer score;
        private Boolean passed;
        private String reviewerComment;
    }

    @Data
    public static class SkillPayload {
        private Long id;
        private String skillName;
        private String applicablePosition;
        private String skillCategory;
        private String requiredLevel;
        private String description;
        private Boolean enabled;
        private Integer sortOrder;
        private List<Long> courseIds = new ArrayList<>();
    }
}
