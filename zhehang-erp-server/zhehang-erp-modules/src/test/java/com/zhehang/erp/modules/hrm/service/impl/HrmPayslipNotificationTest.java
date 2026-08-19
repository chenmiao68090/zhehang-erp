package com.zhehang.erp.modules.hrm.service.impl;

import com.baomidou.mybatisplus.core.MybatisConfiguration;
import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.hrm.domain.entity.HrmPayslip;
import com.zhehang.erp.modules.hrm.mapper.HrmPayslipMapper;
import com.zhehang.erp.modules.im.service.ImBusinessNotificationPublisher;
import com.zhehang.erp.modules.org.domain.entity.OrgEmployee;
import com.zhehang.erp.modules.org.mapper.OrgEmployeeMapper;
import org.apache.ibatis.builder.MapperBuilderAssistant;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class HrmPayslipNotificationTest {
    private HrmPayslipMapper payslipMapper;
    private DataScopeHelper dataScopeHelper;
    private OrgEmployeeMapper employeeMapper;
    private ImBusinessNotificationPublisher publisher;
    private HrmPayslipServiceImpl service;

    @BeforeEach
    void setUp() {
        initTable(HrmPayslip.class);
        payslipMapper = mock(HrmPayslipMapper.class);
        dataScopeHelper = mock(DataScopeHelper.class);
        employeeMapper = mock(OrgEmployeeMapper.class);
        publisher = mock(ImBusinessNotificationPublisher.class);
        service = new HrmPayslipServiceImpl(payslipMapper, dataScopeHelper, employeeMapper, publisher);
        when(dataScopeHelper.hasPerm("hr:salary:manage")).thenReturn(true);
    }

    @Test
    void distributionUsesPayslipIdAndEmployeeSelfServiceLink() {
        HrmPayslip payslip = payslip();
        when(payslipMapper.selectList(any())).thenReturn(List.of(payslip));
        when(employeeMapper.selectById(101L)).thenReturn(employee());

        int distributed = service.distribute(List.of(31L), null);

        assertThat(distributed).isEqualTo(1);
        ArgumentCaptor<ImBusinessNotificationPublisher.Notice> notice =
                ArgumentCaptor.forClass(ImBusinessNotificationPublisher.Notice.class);
        verify(publisher).publish(notice.capture());
        assertThat(notice.getValue().getEventId()).isEqualTo("payslip:31:distributed");
        assertThat(notice.getValue().getRecipientIds()).containsExactly(21L);
        assertThat(notice.getValue().getActionUrl()).isEqualTo("/culture/my-payslip");
    }

    @Test
    void outboxFailureEscapesForDistributionTransactionRollback() {
        when(payslipMapper.selectList(any())).thenReturn(List.of(payslip()));
        when(employeeMapper.selectById(101L)).thenReturn(employee());
        doThrow(new IllegalStateException("outbox unavailable")).when(publisher).publish(any());

        assertThatThrownBy(() -> service.distribute(List.of(31L), null))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("outbox unavailable");
    }

    private HrmPayslip payslip() {
        HrmPayslip payslip = new HrmPayslip();
        payslip.setId(31L);
        payslip.setEmployeeId(101L);
        payslip.setPayMonth("2026-07");
        payslip.setConfirmStatus(0);
        return payslip;
    }

    private OrgEmployee employee() {
        OrgEmployee employee = new OrgEmployee();
        employee.setId(101L);
        employee.setUserId(21L);
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
