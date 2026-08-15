package com.zhehang.erp.modules.system.service.impl;

import com.zhehang.erp.common.core.audit.ImpersonationAuditSink;
import com.zhehang.erp.modules.system.domain.entity.SysOperLog;
import com.zhehang.erp.modules.system.mapper.SysOperLogMapper;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

class ImpersonationAuditSinkImplTest {

    @Test
    void synchronouslyPrewritesMinimalDualIdentityAuditAndReturnsGeneratedId() {
        SysOperLogMapper mapper = mock(SysOperLogMapper.class);
        doAnswer(invocation -> {
            SysOperLog value = invocation.getArgument(0);
            value.setId(501L);
            return 1;
        }).when(mapper).insert(any(SysOperLog.class));
        ImpersonationAuditSinkImpl sink = new ImpersonationAuditSinkImpl(mapper);

        Long auditId = sink.begin(entry());

        assertThat(auditId).isEqualTo(501L);
        ArgumentCaptor<SysOperLog> captor = ArgumentCaptor.forClass(SysOperLog.class);
        verify(mapper).insert(captor.capture());
        SysOperLog saved = captor.getValue();
        assertThat(saved.getStatus()).isEqualTo(ImpersonationAuditSink.STATUS_PROCESSING);
        assertThat(saved.getOperatorId()).isEqualTo(3L);
        assertThat(saved.getActorUserId()).isEqualTo(3L);
        assertThat(saved.getEffectiveUserId()).isEqualTo(27L);
        assertThat(saved.getImpersonationSessionId()).isEqualTo("imp-session-1");
        assertThat(saved.getTenantId()).isEqualTo(9L);
        assertThat(saved.getRequestParams()).isEmpty();
        assertThat(saved.getResponseResult()).isEmpty();
        assertThat(saved.getOperTime()).isNotNull();
    }

    @Test
    void preciselyCompletesOnlyTheProcessingPreauditRow() {
        SysOperLogMapper mapper = mock(SysOperLogMapper.class);
        when(mapper.completeImpersonationAudit(
                501L,
                ImpersonationAuditSink.STATUS_PROCESSING,
                ImpersonationAuditSink.STATUS_FAILURE,
                "AccessDeniedException(详情已隐去)",
                18L)).thenReturn(1);
        ImpersonationAuditSinkImpl sink = new ImpersonationAuditSinkImpl(mapper);

        sink.complete(501L, ImpersonationAuditSink.STATUS_FAILURE,
                "AccessDeniedException(详情已隐去)", 18L);

        verify(mapper).completeImpersonationAudit(
                501L,
                ImpersonationAuditSink.STATUS_PROCESSING,
                ImpersonationAuditSink.STATUS_FAILURE,
                "AccessDeniedException(详情已隐去)",
                18L);
    }

    @Test
    void rejectsMissingGeneratedIdAndAlreadyCompletedRows() {
        SysOperLogMapper mapper = mock(SysOperLogMapper.class);
        when(mapper.insert(any(SysOperLog.class))).thenReturn(1);
        when(mapper.completeImpersonationAudit(
                501L,
                ImpersonationAuditSink.STATUS_PROCESSING,
                ImpersonationAuditSink.STATUS_SUCCESS,
                "",
                1L)).thenReturn(0);
        ImpersonationAuditSinkImpl sink = new ImpersonationAuditSinkImpl(mapper);

        assertThatThrownBy(() -> sink.begin(entry()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("预写未成功");
        assertThatThrownBy(() -> sink.complete(
                501L, ImpersonationAuditSink.STATUS_SUCCESS, "", 1L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("不存在或已结束");
    }

    @Test
    void rejectsAnyPreauditThatIsNotFixedPlatformActorAndValidTargetTenantSession() {
        SysOperLogMapper mapper = mock(SysOperLogMapper.class);
        ImpersonationAuditSinkImpl sink = new ImpersonationAuditSinkImpl(mapper);
        List<ImpersonationAuditSink.Entry> invalidEntries = List.of(
                entry(1L, 3L, 27L, 9L, "imp-session-1"),
                entry(3L, 1L, 27L, 9L, "imp-session-1"),
                entry(3L, 3L, 1L, 9L, "imp-session-1"),
                entry(3L, 3L, 3L, 9L, "imp-session-1"),
                entry(3L, 3L, 27L, null, "imp-session-1"),
                entry(3L, 3L, 27L, 9L, " ")
        );

        for (ImpersonationAuditSink.Entry invalid : invalidEntries) {
            assertThatThrownBy(() -> sink.begin(invalid))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("上下文不完整");
        }
        verifyNoInteractions(mapper);
    }

    private ImpersonationAuditSink.Entry entry() {
        return entry(3L, 3L, 27L, 9L, "imp-session-1");
    }

    private ImpersonationAuditSink.Entry entry(Long operatorId, Long actorUserId,
                                                Long effectiveUserId, Long tenantId,
                                                String sessionId) {
        return new ImpersonationAuditSink.Entry(
                "客户查询",
                "QUERY",
                "platform-super-admin",
                operatorId,
                actorUserId,
                "platform-super-admin",
                effectiveUserId,
                "target-employee",
                sessionId,
                tenantId,
                "fixture.list",
                "/crm/customer/list",
                "GET",
                "127.0.0.1");
    }
}
