package com.zhehang.erp.modules.hrm.service.impl;

import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.file.domain.entity.FileInfo;
import com.zhehang.erp.modules.file.service.IFileInfoService;
import com.zhehang.erp.modules.hrm.domain.entity.HrmResignHandover;
import com.zhehang.erp.modules.hrm.mapper.HrmResignHandoverMapper;
import com.zhehang.erp.modules.org.domain.entity.OrgEmployee;
import com.zhehang.erp.modules.org.mapper.OrgEmployeeMapper;
import com.zhehang.erp.modules.system.domain.entity.SysUser;
import com.zhehang.erp.modules.system.mapper.SysUserMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class HrmResignHandoverServiceImplTest {

    @Mock
    private HrmResignHandoverMapper handoverMapper;
    @Mock
    private OrgEmployeeMapper employeeMapper;
    @Mock
    private SysUserMapper userMapper;
    @Mock
    private DataScopeHelper dataScopeHelper;
    @Mock
    private IFileInfoService fileInfoService;

    private HrmResignHandoverServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new HrmResignHandoverServiceImpl(
                handoverMapper, employeeMapper, userMapper, dataScopeHelper, fileInfoService);
        when(dataScopeHelper.isHrAdminOrBoss()).thenReturn(true);
        lenient().when(handoverMapper.insert(org.mockito.ArgumentMatchers.any())).thenReturn(1);
    }

    @Test
    void saveDerivesEmployeeAndReceiverNamesFromStableIds() {
        OrgEmployee resigned = employee(10L, 1L, 3, "真实离职员工");
        OrgEmployee receiver = employee(20L, 1L, 1, "真实接收人");
        when(employeeMapper.selectById(10L)).thenReturn(resigned);
        when(employeeMapper.selectById(20L)).thenReturn(receiver);

        HrmResignHandover request = new HrmResignHandover();
        request.setEmployeeId(10L);
        request.setHandoverToEmployeeId(20L);
        request.setStatus(1);

        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(SecurityUtils::getCurrentTenantId).thenReturn(1L);
            service.saveOrUpdateRecord(request);
        }

        ArgumentCaptor<HrmResignHandover> captor = ArgumentCaptor.forClass(HrmResignHandover.class);
        verify(handoverMapper).insert(captor.capture());
        assertThat(captor.getValue().getEmployeeName()).isEqualTo("真实离职员工");
        assertThat(captor.getValue().getHandoverTo()).isEqualTo("真实接收人");
        assertThat(captor.getValue().getHandoverToEmployeeId()).isEqualTo(20L);
    }

    @Test
    void saveIgnoresSubmittedNamesAndPersistsNamesDerivedFromStableIds() {
        OrgEmployee resigned = employee(10L, 1L, 3, "真实离职员工");
        OrgEmployee receiver = employee(20L, 1L, 1, "真实接收人");
        when(employeeMapper.selectById(10L)).thenReturn(resigned);
        when(employeeMapper.selectById(20L)).thenReturn(receiver);

        HrmResignHandover request = new HrmResignHandover();
        request.setEmployeeId(10L);
        request.setHandoverToEmployeeId(20L);
        request.setHandoverTo("伪造接收人");
        request.setStatus(1);

        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(SecurityUtils::getCurrentTenantId).thenReturn(1L);
            service.saveOrUpdateRecord(request);
        }

        ArgumentCaptor<HrmResignHandover> captor = ArgumentCaptor.forClass(HrmResignHandover.class);
        verify(handoverMapper).insert(captor.capture());
        assertThat(captor.getValue().getHandoverTo()).isEqualTo("真实接收人");
    }

    @Test
    void receiverFromAnotherTenantIsRejected() {
        when(employeeMapper.selectById(10L)).thenReturn(employee(10L, 1L, 3, "离职员工"));
        when(employeeMapper.selectById(20L)).thenReturn(employee(20L, 2L, 1, "其他公司接收人"));

        HrmResignHandover request = new HrmResignHandover();
        request.setEmployeeId(10L);
        request.setHandoverToEmployeeId(20L);
        request.setStatus(1);

        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(SecurityUtils::getCurrentTenantId).thenReturn(1L);
            assertThatThrownBy(() -> service.saveOrUpdateRecord(request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("不属于当前公司");
        }
    }

    @Test
    void closingIsRejectedWhileLinkedAccountCanStillLogin() {
        OrgEmployee resigned = employee(10L, 1L, 3, "离职员工");
        resigned.setUserId(100L);
        OrgEmployee receiver = employee(20L, 1L, 1, "接收人");
        SysUser activeUser = new SysUser();
        activeUser.setId(100L);
        activeUser.setStatus(0);
        when(employeeMapper.selectById(10L)).thenReturn(resigned);
        when(employeeMapper.selectById(20L)).thenReturn(receiver);
        when(userMapper.selectById(100L)).thenReturn(activeUser);

        HrmResignHandover request = completedRequest();
        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(SecurityUtils::getCurrentTenantId).thenReturn(1L);
            assertThatThrownBy(() -> service.saveOrUpdateRecord(request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("账号仍可登录");
        }
    }

    @Test
    void closingWithoutProvisionedAccountSetsArchiveTime() {
        OrgEmployee resigned = employee(10L, 1L, 3, "离职员工");
        OrgEmployee receiver = employee(20L, 1L, 2, "试用期接收人");
        when(employeeMapper.selectById(10L)).thenReturn(resigned);
        when(employeeMapper.selectById(20L)).thenReturn(receiver);

        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(SecurityUtils::getCurrentTenantId).thenReturn(1L);
            service.saveOrUpdateRecord(completedRequest());
        }

        ArgumentCaptor<HrmResignHandover> captor = ArgumentCaptor.forClass(HrmResignHandover.class);
        verify(handoverMapper).insert(captor.capture());
        assertThat(captor.getValue().getStatus()).isEqualTo(2);
        assertThat(captor.getValue().getArchiveTime()).isNotNull();
    }

    @Test
    void closingRequiresAllFiveChecksCompleted() {
        when(employeeMapper.selectById(10L)).thenReturn(employee(10L, 1L, 3, "离职员工"));
        when(employeeMapper.selectById(20L)).thenReturn(employee(20L, 1L, 1, "接收人"));
        HrmResignHandover request = completedRequest();
        request.setDocumentCheckStatus(1);

        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(SecurityUtils::getCurrentTenantId).thenReturn(1L);
            assertThatThrownBy(() -> service.saveOrUpdateRecord(request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("全部完成后才能归档");
        }
    }

    @Test
    void nonResignedEmployeeCannotEnterOffboardingLedger() {
        when(employeeMapper.selectById(10L)).thenReturn(employee(10L, 1L, 1, "在职员工"));
        HrmResignHandover request = new HrmResignHandover();
        request.setEmployeeId(10L);

        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(SecurityUtils::getCurrentTenantId).thenReturn(1L);
            assertThatThrownBy(() -> service.saveOrUpdateRecord(request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("尚未离职");
        }
    }

    @Test
    void clearSopUsesExplicitFlagAndKeepsOptimisticLockVersion() {
        HrmResignHandover existing = new HrmResignHandover();
        existing.setId(88L);
        existing.setEmployeeId(10L);
        existing.setHandoverToEmployeeId(20L);
        existing.setSopFileId(999L);
        existing.setStatus(1);
        existing.setRecordVersion(4);
        when(handoverMapper.selectById(88L)).thenReturn(existing);
        when(handoverMapper.updateById(org.mockito.ArgumentMatchers.any())).thenReturn(1);
        when(employeeMapper.selectById(10L)).thenReturn(employee(10L, 1L, 3, "离职员工"));
        when(employeeMapper.selectById(20L)).thenReturn(employee(20L, 1L, 1, "接收员工"));

        HrmResignHandover request = new HrmResignHandover();
        request.setId(88L);
        request.setEmployeeId(10L);
        request.setRecordVersion(4);
        request.setClearSopFile(true);

        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(SecurityUtils::getCurrentTenantId).thenReturn(1L);
            service.saveOrUpdateRecord(request);
        }

        ArgumentCaptor<HrmResignHandover> captor = ArgumentCaptor.forClass(HrmResignHandover.class);
        verify(handoverMapper).updateById(captor.capture());
        assertThat(captor.getValue().getSopFileId()).isNull();
        assertThat(captor.getValue().getRecordVersion()).isEqualTo(4);
    }

    @Test
    void staleClientVersionCannotOverwriteLatestHandover() {
        HrmResignHandover existing = new HrmResignHandover();
        existing.setId(88L);
        existing.setEmployeeId(10L);
        existing.setStatus(1);
        existing.setRecordVersion(5);
        when(handoverMapper.selectById(88L)).thenReturn(existing);

        HrmResignHandover request = new HrmResignHandover();
        request.setId(88L);
        request.setEmployeeId(10L);
        request.setRecordVersion(4);
        request.setStatus(0);

        assertThatThrownBy(() -> service.saveOrUpdateRecord(request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("已被他人更新");
        verify(handoverMapper, org.mockito.Mockito.never()).updateById(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void protectedSopUploadMarksFileBeforeReturningIt() {
        MultipartFile upload = org.mockito.Mockito.mock(MultipartFile.class);
        FileInfo stored = new FileInfo();
        stored.setId(321L);
        stored.setAccessScope("NORMAL");
        when(fileInfoService.uploadFile(upload, null)).thenReturn(stored);
        when(fileInfoService.updateById(stored)).thenReturn(true);

        FileInfo result = service.uploadProtectedSop(upload);

        assertThat(result).isSameAs(stored);
        assertThat(result.getAccessScope()).isEqualTo("OFFBOARDING_SOP");
        verify(fileInfoService).updateById(stored);
    }

    @Test
    void savingExistingFileAsSopAlsoMarksItProtected() {
        when(employeeMapper.selectById(10L)).thenReturn(employee(10L, 1L, 3, "离职员工"));
        FileInfo existingFile = new FileInfo();
        existingFile.setId(654L);
        existingFile.setAccessScope("NORMAL");
        when(fileInfoService.getById(654L)).thenReturn(existingFile);
        when(fileInfoService.updateById(existingFile)).thenReturn(true);

        HrmResignHandover request = new HrmResignHandover();
        request.setEmployeeId(10L);
        request.setSopFileId(654L);

        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(SecurityUtils::getCurrentTenantId).thenReturn(1L);
            service.saveOrUpdateRecord(request);
        }

        assertThat(existingFile.getAccessScope()).isEqualTo("OFFBOARDING_SOP");
        verify(fileInfoService).updateById(existingFile);
        verify(handoverMapper).insert(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void handoverIsNotSavedWhenSopProtectionFails() {
        when(employeeMapper.selectById(10L)).thenReturn(employee(10L, 1L, 3, "离职员工"));
        FileInfo existingFile = new FileInfo();
        existingFile.setId(654L);
        when(fileInfoService.getById(654L)).thenReturn(existingFile);
        when(fileInfoService.updateById(existingFile)).thenReturn(false);

        HrmResignHandover request = new HrmResignHandover();
        request.setEmployeeId(10L);
        request.setSopFileId(654L);

        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(SecurityUtils::getCurrentTenantId).thenReturn(1L);
            assertThatThrownBy(() -> service.saveOrUpdateRecord(request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("附件保护失败");
        }

        verify(handoverMapper, org.mockito.Mockito.never()).insert(org.mockito.ArgumentMatchers.any());
    }

    private HrmResignHandover completedRequest() {
        HrmResignHandover request = new HrmResignHandover();
        request.setEmployeeId(10L);
        request.setHandoverToEmployeeId(20L);
        request.setStatus(2);
        request.setCustomerCheckStatus(2);
        request.setTaskCheckStatus(2);
        request.setDocumentCheckStatus(2);
        request.setAssetCheckStatus(2);
        request.setSettlementCheckStatus(2);
        return request;
    }

    private OrgEmployee employee(Long id, Long tenantId, Integer status, String name) {
        OrgEmployee employee = new OrgEmployee();
        employee.setId(id);
        employee.setTenantId(tenantId);
        employee.setStatus(status);
        employee.setName(name);
        return employee;
    }
}
