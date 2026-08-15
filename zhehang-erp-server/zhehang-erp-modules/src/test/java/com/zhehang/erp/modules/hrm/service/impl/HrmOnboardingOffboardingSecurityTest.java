package com.zhehang.erp.modules.hrm.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.mail.MailService;
import com.zhehang.erp.modules.hrm.domain.entity.HrmOnboarding;
import com.zhehang.erp.modules.hrm.mapper.HrmOnboardingMapper;
import com.zhehang.erp.modules.hrm.mapper.HrmRecruitMapper;
import com.zhehang.erp.modules.hrm.mapper.HrmResumeMapper;
import com.zhehang.erp.modules.org.domain.entity.OrgEmployee;
import com.zhehang.erp.modules.org.mapper.OrgEmployeeMapper;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class HrmOnboardingOffboardingSecurityTest {

    @Test
    void staleOnboardingRecordCannotReactivateResignedEmployee() {
        HrmOnboardingMapper onboardingMapper = mock(HrmOnboardingMapper.class);
        OrgEmployeeMapper employeeMapper = mock(OrgEmployeeMapper.class);
        HrmOnboarding onboarding = new HrmOnboarding();
        onboarding.setId(8L);
        onboarding.setEmployeeId(99L);
        OrgEmployee resigned = new OrgEmployee();
        resigned.setId(99L);
        resigned.setStatus(3);
        when(onboardingMapper.selectById(8L)).thenReturn(onboarding);
        when(employeeMapper.selectById(99L)).thenReturn(resigned);
        HrmOnboardingServiceImpl service = new HrmOnboardingServiceImpl(
                onboardingMapper, mock(HrmResumeMapper.class), mock(HrmRecruitMapper.class),
                employeeMapper, new ObjectMapper(), mock(MailService.class));

        assertThatThrownBy(() -> service.markOnboarded(8L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("离职员工不能通过待入职流程恢复");

        verify(employeeMapper, never()).update(any(OrgEmployee.class), any());
        verify(employeeMapper, never()).updateById(any());
        verify(onboardingMapper, never()).updateById(any());
    }

    @Test
    void conditionalOnboardingUpdateCannotOverwriteConcurrentResignation() {
        HrmOnboardingMapper onboardingMapper = mock(HrmOnboardingMapper.class);
        OrgEmployeeMapper employeeMapper = mock(OrgEmployeeMapper.class);
        HrmOnboarding onboarding = new HrmOnboarding();
        onboarding.setId(8L);
        onboarding.setEmployeeId(99L);

        OrgEmployee draftAtFirstRead = new OrgEmployee();
        draftAtFirstRead.setId(99L);
        draftAtFirstRead.setStatus(0);
        OrgEmployee resignedAfterConcurrentWrite = new OrgEmployee();
        resignedAfterConcurrentWrite.setId(99L);
        resignedAfterConcurrentWrite.setStatus(3);

        when(onboardingMapper.selectById(8L)).thenReturn(onboarding);
        when(employeeMapper.selectById(99L))
                .thenReturn(draftAtFirstRead, draftAtFirstRead, resignedAfterConcurrentWrite);
        when(employeeMapper.update(any(OrgEmployee.class), any())).thenReturn(0);
        HrmOnboardingServiceImpl service = new HrmOnboardingServiceImpl(
                onboardingMapper, mock(HrmResumeMapper.class), mock(HrmRecruitMapper.class),
                employeeMapper, new ObjectMapper(), mock(MailService.class));

        assertThatThrownBy(() -> service.markOnboarded(8L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("离职员工不能通过待入职流程恢复");

        verify(employeeMapper).update(any(OrgEmployee.class), any());
        verify(onboardingMapper, never()).updateById(any());
    }
}
