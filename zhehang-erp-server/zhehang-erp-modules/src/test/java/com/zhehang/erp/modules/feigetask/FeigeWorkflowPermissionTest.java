package com.zhehang.erp.modules.feigetask;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.feigetask.domain.dto.FeigeTaskRequests;
import com.zhehang.erp.modules.feigetask.domain.entity.FeigeWorkflowTask;
import com.zhehang.erp.modules.feigetask.mapper.FeigeWorkflowReportMapper;
import com.zhehang.erp.modules.feigetask.mapper.FeigeWorkflowRequiredMapper;
import com.zhehang.erp.modules.feigetask.mapper.FeigeWorkflowTaskMapper;
import com.zhehang.erp.modules.feigetask.mapper.FeigeWorkflowTemplateMapper;
import com.zhehang.erp.modules.feigetask.service.FeigeTaskAccessService;
import com.zhehang.erp.modules.feigetask.service.FeigeWorkflowService;
import com.zhehang.erp.modules.system.mapper.SysDeptMapper;
import com.zhehang.erp.modules.system.mapper.SysRoleMapper;
import com.zhehang.erp.modules.system.mapper.SysUserMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FeigeWorkflowPermissionTest {

    @Mock private FeigeWorkflowTemplateMapper templateMapper;
    @Mock private FeigeWorkflowTaskMapper taskMapper;
    @Mock private FeigeWorkflowReportMapper reportMapper;
    @Mock private FeigeWorkflowRequiredMapper requiredMapper;
    @Mock private SysUserMapper userMapper;
    @Mock private SysRoleMapper roleMapper;
    @Mock private SysDeptMapper deptMapper;
    @Mock private FeigeTaskAccessService access;

    private FeigeWorkflowService service;

    @BeforeEach
    void setUp() {
        service = new FeigeWorkflowService(templateMapper, taskMapper, reportMapper,
                requiredMapper, userMapper, roleMapper, deptMapper, access, new ObjectMapper());
    }

    @Test
    void managerCannotWriteSubordinateTask() {
        FeigeWorkflowTask row = task(8L);
        when(taskMapper.selectById(1L)).thenReturn(row);
        when(access.currentUserId()).thenReturn(7L);

        assertThrows(AccessDeniedException.class,
                () -> service.action(1L, "done", null, null));
        verify(taskMapper, never()).updateById(any());
    }

    @Test
    void doneRequiresPersistedRequiredMetric() {
        FeigeWorkflowTask row = task(7L);
        row.setDetailFieldsJson(schema());
        row.setWorkDetailJson(null);
        when(taskMapper.selectById(1L)).thenReturn(row);
        when(access.currentUserId()).thenReturn(7L);

        assertThrows(BusinessException.class,
                () -> service.action(1L, "done", null, null));
        verify(taskMapper, never()).updateById(any());
    }

    @Test
    void detailPersistsCanonicalMetricAndAcceptsZero() {
        FeigeWorkflowTask row = task(7L);
        row.setDetailFieldsJson(schema());
        when(taskMapper.selectById(1L)).thenReturn(row);
        when(taskMapper.updateById(any())).thenReturn(1);
        when(access.currentUserId()).thenReturn(7L);

        FeigeTaskRequests.WorkflowMetric metric = new FeigeTaskRequests.WorkflowMetric();
        metric.setCode("count");
        metric.setLabel("伪造标签");
        metric.setFieldType("number");
        metric.setRequired(true);
        metric.setValue(BigDecimal.ZERO);
        FeigeTaskRequests.WorkflowTaskDetail detail = new FeigeTaskRequests.WorkflowTaskDetail();
        detail.setMetrics(List.of(metric));

        service.action(1L, "detail", detail, null);

        ArgumentCaptor<FeigeWorkflowTask> captor = ArgumentCaptor.forClass(FeigeWorkflowTask.class);
        verify(taskMapper).updateById(captor.capture());
        String persisted = captor.getValue().getWorkDetailJson();
        assertTrue(persisted.contains("有效数量"));
        assertTrue(persisted.contains("\"value\":0"));
        assertTrue(!persisted.contains("伪造标签"));
    }

    private FeigeWorkflowTask task(Long userId) {
        FeigeWorkflowTask row = new FeigeWorkflowTask();
        row.setId(1L);
        row.setUserId(userId);
        row.setDone(0);
        return row;
    }

    private String schema() {
        return "[{\"code\":\"count\",\"label\":\"有效数量\","
                + "\"fieldType\":\"number\",\"required\":true,\"unit\":\"条\"}]";
    }
}
