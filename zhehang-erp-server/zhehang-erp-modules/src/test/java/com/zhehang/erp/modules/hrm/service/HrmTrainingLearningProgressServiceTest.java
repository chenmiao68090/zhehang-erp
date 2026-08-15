package com.zhehang.erp.modules.hrm.service;

import com.baomidou.mybatisplus.core.MybatisConfiguration;
import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.hrm.domain.entity.HrmTrainingCourse;
import com.zhehang.erp.modules.hrm.domain.entity.HrmTrainingLearningRecord;
import com.zhehang.erp.modules.hrm.domain.entity.HrmTrainingLearningStep;
import com.zhehang.erp.modules.hrm.domain.entity.HrmTrainingMaterial;
import com.zhehang.erp.modules.hrm.mapper.HrmTrainingLearningRecordMapper;
import com.zhehang.erp.modules.hrm.mapper.HrmTrainingLearningStepMapper;
import org.apache.ibatis.builder.MapperBuilderAssistant;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class HrmTrainingLearningProgressServiceTest {

    @BeforeAll
    static void initializeMybatisMetadata() {
        TableInfoHelper.initTableInfo(
                new MapperBuilderAssistant(new MybatisConfiguration(), ""), HrmTrainingLearningStep.class);
    }

    @Mock private HrmTrainingLearningStepMapper stepMapper;
    @Mock private HrmTrainingLearningRecordMapper learningMapper;

    private HrmTrainingLearningProgressService service;

    @BeforeEach
    void setUp() {
        ObjectMapper objectMapper = new ObjectMapper();
        service = new HrmTrainingLearningProgressService(stepMapper, learningMapper, objectMapper,
                new HrmTrainingVideoProgressService(objectMapper));
    }

    @Test
    void snapshotCountsRequiredSlidesAndRestoresLastValidPosition() {
        HrmTrainingLearningRecord record = record();
        HrmTrainingCourse course = course();
        HrmTrainingMaterial ppt = ppt(11L, true, 3);
        HrmTrainingMaterial optional = article(12L, false);
        HrmTrainingLearningStep firstSlide = step(1L, 11L, 0, LocalDateTime.now().minusMinutes(2));
        HrmTrainingLearningStep optionalStep = step(2L, 12L, 0, LocalDateTime.now().minusMinutes(1));
        HrmTrainingLearningStep invalidPage = step(3L, 11L, 99, LocalDateTime.now());
        when(stepMapper.selectList(any())).thenReturn(List.of(firstSlide, optionalStep, invalidPage));

        HrmTrainingLearningProgressService.ProgressSnapshot snapshot =
                service.snapshot(record, course, List.of(ppt, optional));

        assertThat(snapshot.requiredStepCount()).isEqualTo(3);
        assertThat(snapshot.completedRequiredStepCount()).isEqualTo(1);
        assertThat(snapshot.progressPercent()).isEqualTo(33);
        assertThat(snapshot.steps()).hasSize(2);
        assertThat(snapshot.lastPosition()).isEqualTo(
                new HrmTrainingLearningProgressService.Position(12L, 0));
    }

    @Test
    void saveRejectsForeignMaterialAndForgedPageNumber() {
        HrmTrainingLearningRecord record = record();
        HrmTrainingCourse course = course();
        HrmTrainingMaterial ppt = ppt(11L, true, 2);

        assertThatThrownBy(() -> service.saveProgress(record, course, List.of(ppt),
                List.of(new HrmTrainingLearningProgressService.StepInput(99L, 0, true, null)), "INTERACTION"))
                .isInstanceOf(BusinessException.class)
                .hasMessage("课件不属于当前课程或已停用");
        assertThatThrownBy(() -> service.saveProgress(record, course, List.of(ppt),
                List.of(new HrmTrainingLearningProgressService.StepInput(11L, 2, true, null)), "INTERACTION"))
                .isInstanceOf(BusinessException.class)
                .hasMessage("课件页码超出有效范围");
    }

    @Test
    void duplicateStepsUpsertOnceAndRaiseProgressMonotonically() {
        HrmTrainingLearningRecord record = record();
        HrmTrainingCourse course = course();
        HrmTrainingMaterial ppt = ppt(11L, true, 2);
        when(stepMapper.selectList(any())).thenReturn(List.of(step(1L, 11L, 0, LocalDateTime.now())));

        HrmTrainingLearningProgressService.ProgressSnapshot snapshot = service.saveProgress(
                record, course, List.of(ppt),
                List.of(new HrmTrainingLearningProgressService.StepInput(11L, 0, true, null),
                        new HrmTrainingLearningProgressService.StepInput(11L, 0, true, null)),
                "LEGACY_LOCAL");

        ArgumentCaptor<HrmTrainingLearningStep> captor = ArgumentCaptor.forClass(HrmTrainingLearningStep.class);
        verify(stepMapper, times(1)).upsert(captor.capture());
        assertThat(captor.getValue().getStudyCycle()).isEqualTo(1);
        assertThat(captor.getValue().getSource()).isEqualTo("LEGACY_LOCAL");
        assertThat(captor.getValue().getTenantId()).isEqualTo(7L);
        assertThat(captor.getValue().getValidWatchedSeconds()).isZero();
        assertThat(captor.getValue().getCoveragePercent()).isZero();
        assertThat(snapshot.progressPercent()).isEqualTo(50);
        verify(learningMapper).raiseLearningProgress(1L, 10L, 7L, 50);
    }

    @Test
    void finishGateRequiresEveryRequiredPageButIgnoresOptionalMaterial() {
        HrmTrainingLearningRecord record = record();
        HrmTrainingCourse course = course();
        HrmTrainingMaterial ppt = ppt(11L, true, 2);
        HrmTrainingMaterial optional = article(12L, false);
        when(stepMapper.selectList(any()))
                .thenReturn(List.of(step(1L, 11L, 0, LocalDateTime.now())))
                .thenReturn(List.of(step(1L, 11L, 0, LocalDateTime.now()),
                        step(2L, 11L, 1, LocalDateTime.now())));

        assertThatThrownBy(() -> service.requireAllRequiredCompleted(record, course, List.of(ppt, optional)))
                .isInstanceOf(BusinessException.class)
                .hasMessage("还有1项必学内容未完成，请继续学习");
        assertDoesNotThrow(() -> service.requireAllRequiredCompleted(record, course, List.of(ppt, optional)));
    }

    @Test
    void retrainingUsesASeparateStudyCycle() {
        HrmTrainingLearningRecord record = record();
        record.setCurrentAttempt(2);
        when(stepMapper.selectList(any())).thenReturn(List.of());

        HrmTrainingLearningProgressService.ProgressSnapshot snapshot =
                service.snapshot(record, course(), List.of(article(12L, true)));

        assertThat(snapshot.studyCycle()).isEqualTo(3);
        assertThat(snapshot.completedRequiredStepCount()).isZero();
    }

    @Test
    void partialVideoRestoresSecondsWithoutCountingAsCompleted() {
        HrmTrainingMaterial video = article(13L, true);
        video.setMaterialType("LINK");
        video.setMaterialUrl("https://training.example/internal/lesson.mp4?token=protected");
        HrmTrainingLearningStep partial = step(1L, 13L, 0, LocalDateTime.now());
        partial.setStepType("VIDEO");
        partial.setCompleted(false);
        partial.setCompletedTime(null);
        partial.setPositionSeconds(42);
        when(stepMapper.selectList(any())).thenReturn(List.of(partial));

        HrmTrainingLearningProgressService.ProgressSnapshot snapshot =
                service.snapshot(record(), course(), List.of(video));

        assertThat(snapshot.requiredStepCount()).isEqualTo(1);
        assertThat(snapshot.completedRequiredStepCount()).isZero();
        assertThat(snapshot.allRequiredCompleted()).isFalse();
        assertThat(snapshot.lastPosition()).isEqualTo(
                new HrmTrainingLearningProgressService.Position(13L, 0));
        assertThat(snapshot.steps().get(0).positionSeconds()).isEqualTo(42);
        assertThat(snapshot.steps().get(0).completed()).isFalse();
    }

    @Test
    void rejectsImpossibleVideoPosition() {
        HrmTrainingMaterial video = article(13L, true);
        video.setMaterialType("VIDEO");
        video.setDurationSeconds(120);

        assertThatThrownBy(() -> service.saveProgress(record(), course(), List.of(video),
                List.of(new HrmTrainingLearningProgressService.StepInput(13L, 0, false, 86_401)),
                "INTERACTION"))
                .isInstanceOf(BusinessException.class)
                .hasMessage("视频播放位置超出有效范围");
    }

    @Test
    void videoLinkIsStoredAsIncompleteVideoUntilFinished() {
        HrmTrainingMaterial video = article(13L, true);
        video.setMaterialType("LINK");
        video.setMaterialUrl("https://training.example/internal/lesson.webm#chapter-1");
        video.setDurationSeconds(120);
        video.setAllowSpeed(true);
        when(stepMapper.selectForUpdate(7L, 1L, 1, "v1.0", 13L, 0)).thenReturn(null);
        when(stepMapper.selectList(any())).thenReturn(List.of());

        service.saveProgress(record(), course(), List.of(video),
                List.of(new HrmTrainingLearningProgressService.StepInput(13L, 0, false, 12,
                        120, "PLAY", "session_one", 1.0, "DESKTOP")),
                "INTERACTION");

        ArgumentCaptor<HrmTrainingLearningStep> captor = ArgumentCaptor.forClass(HrmTrainingLearningStep.class);
        verify(stepMapper).upsert(captor.capture());
        assertThat(captor.getValue().getStepType()).isEqualTo("VIDEO");
        assertThat(captor.getValue().getCompleted()).isFalse();
        assertThat(captor.getValue().getPositionSeconds()).isEqualTo(12);
    }

    private HrmTrainingLearningRecord record() {
        HrmTrainingLearningRecord record = new HrmTrainingLearningRecord();
        record.setId(1L);
        record.setEmployeeId(10L);
        record.setEmployeeUserId(20L);
        record.setCourseId(30L);
        record.setCourseVersion("v1.0");
        record.setCurrentAttempt(0);
        record.setProgressPercent(30);
        record.setStatus("学习中");
        record.setTenantId(7L);
        return record;
    }

    private HrmTrainingCourse course() {
        HrmTrainingCourse course = new HrmTrainingCourse();
        course.setId(30L);
        course.setVersionNo("v2.0");
        return course;
    }

    private HrmTrainingMaterial ppt(Long id, boolean required, int slides) {
        HrmTrainingMaterial material = article(id, required);
        material.setMaterialType("PPT");
        material.setMaterialContent("{\"slides\":[" + "{}".repeat(slides).replace("}{", "},{") + "]}");
        return material;
    }

    private HrmTrainingMaterial article(Long id, boolean required) {
        HrmTrainingMaterial material = new HrmTrainingMaterial();
        material.setId(id);
        material.setCourseId(30L);
        material.setMaterialType("ARTICLE");
        material.setRequiredMaterial(required);
        material.setEnabled(true);
        return material;
    }

    private HrmTrainingLearningStep step(Long id, Long materialId, int stepIndex, LocalDateTime seenAt) {
        HrmTrainingLearningStep step = new HrmTrainingLearningStep();
        step.setId(id);
        step.setLearningRecordId(1L);
        step.setMaterialId(materialId);
        step.setStepIndex(stepIndex);
        step.setStepType("MATERIAL");
        step.setCompleted(true);
        step.setCompletedTime(seenAt);
        step.setLastSeenTime(seenAt);
        return step;
    }
}
