package com.zhehang.erp.modules.hrm.service.impl;

import com.baomidou.mybatisplus.core.MybatisConfiguration;
import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.hrm.domain.entity.HrmLaborContract;
import com.zhehang.erp.modules.hrm.mapper.HrmLaborContractMapper;
import com.zhehang.erp.modules.im.service.ImBusinessNotificationPublisher;
import com.zhehang.erp.modules.org.domain.entity.OrgEmployee;
import com.zhehang.erp.modules.org.mapper.OrgEmployeeMapper;
import com.zhehang.erp.modules.system.service.GovernedFieldValueValidator;
import org.apache.ibatis.builder.MapperBuilderAssistant;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class HrmLaborContractNotificationTest {
    private HrmLaborContractMapper contractMapper;
    private DataScopeHelper dataScopeHelper;
    private OrgEmployeeMapper employeeMapper;
    private ImBusinessNotificationPublisher publisher;
    private GovernedFieldValueValidator governedFieldValueValidator;
    private HrmLaborContractServiceImpl service;

    @BeforeEach
    void setUp() {
        initTable(HrmLaborContract.class);
        contractMapper = mock(HrmLaborContractMapper.class);
        dataScopeHelper = mock(DataScopeHelper.class);
        employeeMapper = mock(OrgEmployeeMapper.class);
        publisher = mock(ImBusinessNotificationPublisher.class);
        governedFieldValueValidator = mock(GovernedFieldValueValidator.class);
        service = new HrmLaborContractServiceImpl(
                contractMapper, dataScopeHelper, employeeMapper, publisher, governedFieldValueValidator);
        when(dataScopeHelper.isHrAdminOrBoss()).thenReturn(true);
    }

    @Test
    void oneFailedReminderDoesNotBlockOtherContracts() {
        HrmLaborContract first = contract(11L, 101L, LocalDate.of(2026, 8, 1));
        HrmLaborContract second = contract(12L, 102L, LocalDate.of(2026, 8, 2));
        when(contractMapper.selectList(any())).thenReturn(List.of(first, second));
        when(employeeMapper.selectById(101L)).thenReturn(employee(101L, 21L));
        when(employeeMapper.selectById(102L)).thenReturn(employee(102L, 22L));
        doAnswer(invocation -> {
            ImBusinessNotificationPublisher.Notice notice = invocation.getArgument(0);
            if (Long.valueOf(11L).equals(notice.getBusinessId())) {
                throw new IllegalStateException("first event failed");
            }
            return 1L;
        }).when(publisher).publish(any());

        int success = service.remindExpiring(30);

        assertThat(success).isEqualTo(1);
        ArgumentCaptor<ImBusinessNotificationPublisher.Notice> notice =
                ArgumentCaptor.forClass(ImBusinessNotificationPublisher.Notice.class);
        verify(publisher, times(2)).publish(notice.capture());
        assertThat(notice.getAllValues().get(1).getEventId())
                .isEqualTo("labor-contract:12:expiring:2026-08-02");
        assertThat(notice.getAllValues().get(1).getActionUrl()).isEqualTo("/culture/self-service");
    }

    private HrmLaborContract contract(Long id, Long employeeId, LocalDate endDate) {
        HrmLaborContract contract = new HrmLaborContract();
        contract.setId(id);
        contract.setEmployeeId(employeeId);
        contract.setEndDate(endDate);
        contract.setStatus(1);
        return contract;
    }

    private OrgEmployee employee(Long id, Long userId) {
        OrgEmployee employee = new OrgEmployee();
        employee.setId(id);
        employee.setUserId(userId);
        return employee;
    }

    private static void initTable(Class<?> entityClass) {
        if (TableInfoHelper.getTableInfo(entityClass) != null) return;
        MybatisConfiguration configuration = new MybatisConfiguration();
        MapperBuilderAssistant assistant = new MapperBuilderAssistant(configuration, entityClass.getName());
        assistant.setCurrentNamespace(entityClass.getName());
        TableInfoHelper.initTableInfo(assistant, entityClass);
    }
}
