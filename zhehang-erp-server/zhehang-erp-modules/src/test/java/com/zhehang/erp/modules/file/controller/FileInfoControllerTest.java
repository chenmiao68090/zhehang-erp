package com.zhehang.erp.modules.file.controller;

import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.file.domain.entity.FileInfo;
import com.zhehang.erp.modules.file.mapper.FileInfoMapper;
import com.zhehang.erp.modules.file.service.IFileInfoService;
import com.zhehang.erp.modules.hrm.domain.entity.HrmTrainingMaterial;
import com.zhehang.erp.modules.hrm.mapper.HrmTrainingMaterialMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FileInfoControllerTest {

    @Mock private IFileInfoService fileInfoService;
    @Mock private FileInfoMapper fileInfoMapper;
    @Mock private DataScopeHelper dataScopeHelper;
    @Mock private HrmTrainingMaterialMapper trainingMaterialMapper;

    @InjectMocks private FileInfoController controller;

    @Test
    void employeeCannotDownloadVideoBeforeCourseRelationIsSaved() {
        FileInfo file = new FileInfo();
        file.setId(12L);
        file.setAccessScope("TRAINING_VIDEO");
        when(fileInfoService.getById(12L)).thenReturn(file);

        BusinessException error = assertThrows(BusinessException.class, () -> controller.download(12L));

        assertEquals("培训课件原文件已保护，请在培训中心系统内学习", error.getMessage());
        verify(fileInfoService, never()).downloadFile(12L);
        verify(trainingMaterialMapper, never()).selectList(any());
    }

    @Test
    void employeeCannotPreviewVideoLinkedByTrainingMaterial() {
        FileInfo file = new FileInfo();
        file.setId(13L);
        file.setAccessScope("NORMAL");
        HrmTrainingMaterial material = new HrmTrainingMaterial();
        material.setFileId(13L);
        material.setMaterialType("VIDEO");
        material.setEnabled(true);
        when(fileInfoService.getById(13L)).thenReturn(file);
        when(trainingMaterialMapper.selectList(any())).thenReturn(List.of(material));

        assertThrows(BusinessException.class, () -> controller.preview(13L));

        verify(fileInfoService, never()).previewFile(13L);
    }

    @Test
    void employeeCannotDownloadOffboardingSopFromGenericFileEndpoint() {
        FileInfo file = new FileInfo();
        file.setId(15L);
        file.setAccessScope("OFFBOARDING_SOP");
        when(fileInfoService.getById(15L)).thenReturn(file);

        BusinessException error = assertThrows(BusinessException.class, () -> controller.download(15L));

        assertEquals("离职交接附件仅人事、老板或管理员可访问", error.getMessage());
        verify(fileInfoService, never()).downloadFile(15L);
        verify(trainingMaterialMapper, never()).selectList(any());
    }

    @Test
    void employeeCannotUseRecycleRestoreAsProtectedFileBypass() {
        FileInfo file = new FileInfo();
        file.setId(16L);
        file.setAccessScope("OFFBOARDING_SOP");
        file.setDeleted(1);
        when(fileInfoMapper.selectIncludingDeletedById(16L)).thenReturn(file);

        BusinessException error = assertThrows(BusinessException.class, () -> controller.restore(16L));

        assertEquals("离职交接附件仅人事、老板或管理员可访问", error.getMessage());
        verify(fileInfoService, never()).restoreFile(16L);
    }

    @Test
    void ordinaryRecycleFileKeepsExistingRestoreBehavior() {
        FileInfo file = new FileInfo();
        file.setId(18L);
        file.setAccessScope("NORMAL");
        file.setDeleted(1);
        when(fileInfoMapper.selectIncludingDeletedById(18L)).thenReturn(file);

        controller.restore(18L);

        verify(fileInfoService).restoreFile(18L);
    }

    @Test
    void hrOrBossCanRestoreRecycleFileForMaintenance() {
        controller.restore(17L);

        verify(fileInfoService).restoreFile(17L);
        verify(fileInfoMapper).selectIncludingDeletedById(17L);
    }

    @Test
    void hrOrBossCanUseGenericPreviewForCoursewareMaintenance() {
        when(dataScopeHelper.isHrAdminOrBoss()).thenReturn(true);
        when(fileInfoService.previewFile(14L)).thenReturn(Map.of("id", 14L));

        controller.preview(14L);

        verify(fileInfoService).previewFile(14L);
        verify(fileInfoService, never()).getById(14L);
        verify(trainingMaterialMapper, never()).selectList(any());
    }
}
