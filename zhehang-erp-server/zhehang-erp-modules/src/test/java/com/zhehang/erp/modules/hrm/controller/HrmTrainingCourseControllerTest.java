package com.zhehang.erp.modules.hrm.controller;

import com.baomidou.mybatisplus.core.MybatisConfiguration;
import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.file.domain.entity.FileInfo;
import com.zhehang.erp.modules.file.service.IFileInfoService;
import com.zhehang.erp.modules.hrm.domain.entity.HrmTrainingCourse;
import com.zhehang.erp.modules.hrm.domain.entity.HrmTrainingLearningRecord;
import com.zhehang.erp.modules.hrm.domain.entity.HrmTrainingMaterial;
import com.zhehang.erp.modules.hrm.domain.entity.HrmTrainingPathCourse;
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
import com.zhehang.erp.modules.org.mapper.OrgEmployeeMapper;
import org.apache.ibatis.builder.MapperBuilderAssistant;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.lang.reflect.Method;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class HrmTrainingCourseControllerTest {

    @BeforeAll
    static void initializeMybatisMetadata() {
        TableInfoHelper.initTableInfo(
                new MapperBuilderAssistant(new MybatisConfiguration(), ""), HrmTrainingCourse.class);
        TableInfoHelper.initTableInfo(
                new MapperBuilderAssistant(new MybatisConfiguration(), ""), HrmTrainingMaterial.class);
    }

    @Mock private HrmTrainingCourseMapper courseMapper;
    @Mock private HrmTrainingMaterialMapper materialMapper;
    @Mock private HrmTrainingExamQuestionMapper questionMapper;
    @Mock private HrmTrainingLearningRecordMapper learningMapper;
    @Mock private HrmTrainingLearningStepMapper learningStepMapper;
    @Mock private HrmTrainingExamRecordMapper examMapper;
    @Mock private HrmTrainingAnswerMapper answerMapper;
    @Mock private HrmTrainingHomeworkMapper homeworkMapper;
    @Mock private HrmTrainingHomeworkSubmissionMapper homeworkSubmissionMapper;
    @Mock private HrmTrainingPathMapper pathMapper;
    @Mock private HrmTrainingPathCourseMapper pathCourseMapper;
    @Mock private HrmTrainingCertificationMapper certificationMapper;
    @Mock private HrmTrainingSkillMapper skillMapper;
    @Mock private HrmTrainingSkillCourseMapper skillCourseMapper;
    @Mock private HrmTrainingCreditLogMapper creditLogMapper;
    @Mock private HrmSopMapper sopMapper;
    @Mock private OrgEmployeeMapper employeeMapper;
    @Mock private IFileInfoService fileInfoService;
    @Mock private DataScopeHelper dataScopeHelper;
    @Mock private HrmTrainingLearningProgressService learningProgressService;
    @Mock private HrmTrainingNotificationService trainingNotificationService;
    @Mock private HrmTrainingVideoUploadService trainingVideoUploadService;
    @Mock private HrmTrainingVideoPlaybackService trainingVideoPlaybackService;
    @Mock private ObjectMapper objectMapper;

    @InjectMocks private HrmTrainingCourseController controller;

    @Test
    void firstDayCourseIsAvailableImmediately() {
        HrmTrainingLearningRecord record = learningRecord();
        when(dataScopeHelper.currentEmployeeId()).thenReturn(10L);
        when(learningMapper.selectById(1L)).thenReturn(record);
        when(pathCourseMapper.selectList(any())).thenReturn(List.of(pathRule(1)));

        controller.startLearning(1L);

        assertEquals("学习中", record.getStatus());
        assertEquals(30, record.getProgressPercent());
    }

    @Test
    void laterDayCourseStaysLockedUntilItsDay() {
        HrmTrainingLearningRecord record = learningRecord();
        when(dataScopeHelper.currentEmployeeId()).thenReturn(10L);
        when(learningMapper.selectById(1L)).thenReturn(record);
        when(pathCourseMapper.selectList(any())).thenReturn(List.of(pathRule(2)));

        BusinessException error = assertThrows(BusinessException.class, () -> controller.startLearning(1L));

        assertEquals("该课程将在路径第2天解锁（" + record.getAssignedTime().plusDays(1).format(
                java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")) + "）", error.getMessage());
    }

    @Test
    void managerCannotCompleteLearningForAnotherEmployee() {
        HrmTrainingLearningRecord record = learningRecord();
        when(dataScopeHelper.currentEmployeeId()).thenReturn(99L);
        when(learningMapper.selectById(1L)).thenReturn(record);

        BusinessException error = assertThrows(BusinessException.class, () -> controller.startLearning(1L));

        assertEquals("只能学习和提交自己的培训任务", error.getMessage());
    }

    @Test
    void managerCannotWriteProgressForAnotherEmployee() {
        HrmTrainingLearningRecord record = learningRecord();
        when(dataScopeHelper.currentEmployeeId()).thenReturn(99L);
        when(learningMapper.selectById(1L)).thenReturn(record);

        BusinessException error = assertThrows(BusinessException.class,
                () -> controller.saveLearningProgress(1L,
                        new HrmTrainingCourseController.LearningProgressRequest()));

        assertEquals("只能学习和提交自己的培训任务", error.getMessage());
        verifyNoInteractions(learningProgressService);
    }

    @Test
    void finishLearningPassesServerProgressGateBeforeChangingStatus() {
        HrmTrainingLearningRecord record = learningRecord();
        record.setPathId(null);
        record.setStatus("学习中");
        HrmTrainingCourse course = new HrmTrainingCourse();
        course.setId(20L);
        when(dataScopeHelper.currentEmployeeId()).thenReturn(10L);
        when(learningMapper.selectById(1L)).thenReturn(record);
        when(courseMapper.selectById(20L)).thenReturn(course);
        when(materialMapper.selectList(any())).thenReturn(List.of());

        controller.finishLearning(1L);

        verify(learningProgressService).requireAllRequiredCompleted(eq(record), eq(course), eq(List.of()));
        assertEquals("已学完", record.getStatus());
        assertEquals(100, record.getProgressPercent());
    }

    @Test
    void reminderUsesStableEventIdAndEmployeeRecipient() {
        HrmTrainingLearningRecord record = learningRecord();
        record.setEmployeeUserId(21L);
        record.setCourseTitle("客户资料收集");
        record.setStatus("学习中");
        record.setReminderCount(1);
        when(dataScopeHelper.isManagerOrAdmin()).thenReturn(true);
        when(dataScopeHelper.getVisibleUserIds()).thenReturn(null);
        when(learningMapper.selectById(1L)).thenReturn(record);

        controller.remindLearning(1L);

        verify(trainingNotificationService).publish(
                eq("training.learning.1.reminder.2"),
                eq("training.reminder"),
                eq("training.learning"),
                eq(1L),
                eq(List.of(21L)),
                eq("培训任务提醒：客户资料收集"),
                eq("请尽快完成。当前状态：学习中"),
                eq("学习中"),
                eq("继续学习"),
                eq("/training/learning?recordId=1"),
                eq(true));
    }

    @Test
    @SuppressWarnings("unchecked")
    void thinkingAndHomeworkReviewNotifyManagerAndAssignerWithoutEmployee() throws Exception {
        HrmTrainingLearningRecord record = learningRecord();
        record.setEmployeeUserId(21L);
        record.setAssignerId(23L);
        com.zhehang.erp.modules.org.domain.entity.OrgEmployee employee =
                new com.zhehang.erp.modules.org.domain.entity.OrgEmployee();
        employee.setManagerId(22L);
        when(employeeMapper.selectById(10L)).thenReturn(employee);
        Method method = HrmTrainingCourseController.class.getDeclaredMethod(
                "reviewRecipientIds", HrmTrainingLearningRecord.class);
        method.setAccessible(true);

        List<Long> recipients = (List<Long>) method.invoke(controller, record);

        assertEquals(List.of(22L, 23L), recipients);
    }

    @Test
    void pptNamedMaterialHidesOriginalFileEvenWhenTypeWasMisconfigured() throws Exception {
        HrmTrainingMaterial material = new HrmTrainingMaterial();
        material.setMaterialType("ARTICLE");
        material.setMaterialName("A01_公司介绍_全员必修.pptx");
        material.setFileId(88L);
        material.setFileName("protected-source.bin");
        Method method = HrmTrainingCourseController.class.getDeclaredMethod(
                "hideProtectedMaterialFile", HrmTrainingMaterial.class);
        method.setAccessible(true);

        method.invoke(controller, material);

        assertNull(material.getFileId());
        assertNull(material.getFileName());
    }

    @Test
    void attachedVideoFileIsMarkedAsProtectedCourseware() throws Exception {
        HrmTrainingMaterial material = new HrmTrainingMaterial();
        material.setMaterialType("VIDEO");
        material.setFileId(89L);
        FileInfo file = new FileInfo();
        file.setId(89L);
        file.setOriginalName("新人交接.mp4");
        file.setFileType("mp4");
        file.setMimeType("video/mp4");
        file.setAccessScope("NORMAL");
        when(fileInfoService.getById(89L)).thenReturn(file);
        Method method = HrmTrainingCourseController.class.getDeclaredMethod(
                "protectVideoSourceFile", HrmTrainingMaterial.class);
        method.setAccessible(true);

        method.invoke(controller, material);

        assertEquals("TRAINING_VIDEO", file.getAccessScope());
        verify(fileInfoService).updateById(file);
    }

    @Test
    void editingExistingMaterialKeepsItsStableId() throws Exception {
        HrmTrainingMaterial existing = new HrmTrainingMaterial();
        existing.setId(71L);
        existing.setCourseId(20L);
        HrmTrainingCourseController.MaterialPayload payload = new HrmTrainingCourseController.MaterialPayload();
        payload.setId(71L);
        payload.setMaterialType("ARTICLE");
        payload.setMaterialName("更新后的章节标题");
        payload.setMaterialContent("动作、标准与检查表");
        payload.setRequiredMaterial(true);
        payload.setEnabled(true);
        when(materialMapper.selectList(any())).thenReturn(List.of(existing));
        Method method = HrmTrainingCourseController.class.getDeclaredMethod(
                "saveCourseMaterials", Long.class, List.class);
        method.setAccessible(true);

        method.invoke(controller, 20L, List.of(payload));

        verify(materialMapper).update(isNull(), any());
        verify(materialMapper, never()).insert(any());
        verify(materialMapper, never()).deleteById(71L);
    }

    private HrmTrainingLearningRecord learningRecord() {
        HrmTrainingLearningRecord record = new HrmTrainingLearningRecord();
        record.setId(1L);
        record.setEmployeeId(10L);
        record.setCourseId(20L);
        record.setCourseVersion("v1.0");
        record.setPathId(30L);
        record.setStatus("未开始");
        record.setPassed(false);
        record.setProgressPercent(0);
        record.setAssignedTime(LocalDateTime.now().withNano(0));
        record.setTenantId(1L);
        return record;
    }

    private HrmTrainingPathCourse pathRule(int unlockDay) {
        HrmTrainingPathCourse rule = new HrmTrainingPathCourse();
        rule.setPathId(30L);
        rule.setCourseId(20L);
        rule.setUnlockDay(unlockDay);
        return rule;
    }
}
