package com.zhehang.erp.modules.system.service.impl;

import com.zhehang.erp.common.core.audit.ImpersonationAuditSink;
import com.zhehang.erp.common.core.security.ImpersonationPolicy;
import com.zhehang.erp.modules.system.domain.entity.SysOperLog;
import com.zhehang.erp.modules.system.mapper.SysOperLogMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/** 数据库同步代登录审计；预写和收尾均使用独立事务。 */
@Service
@RequiredArgsConstructor
public class ImpersonationAuditSinkImpl implements ImpersonationAuditSink {

    private final SysOperLogMapper operLogMapper;

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW, rollbackFor = Exception.class)
    public Long begin(Entry entry) {
        if (entry == null
                || !ImpersonationPolicy.isAuthorizedActor(entry.actorUserId())
                || !ImpersonationPolicy.isAuthorizedActor(entry.operatorId())
                || ImpersonationPolicy.isForbiddenTarget(entry.effectiveUserId())
                || entry.tenantId() == null
                || entry.impersonationSessionId() == null
                || entry.impersonationSessionId().isBlank()) {
            throw new IllegalArgumentException("代登录审计上下文不完整");
        }
        SysOperLog operLog = new SysOperLog();
        operLog.setModule(limit(entry.module(), 64));
        operLog.setOperType(limit(entry.operationType(), 20));
        operLog.setOperator(limit(entry.operator(), 64));
        operLog.setOperatorId(entry.operatorId());
        operLog.setActorUserId(entry.actorUserId());
        operLog.setActorUsername(limit(entry.actorUsername(), 64));
        operLog.setEffectiveUserId(entry.effectiveUserId());
        operLog.setEffectiveUsername(limit(entry.effectiveUsername(), 64));
        operLog.setImpersonationSessionId(limit(entry.impersonationSessionId(), 64));
        operLog.setTenantId(entry.tenantId());
        operLog.setMethod(limit(entry.method(), 200));
        operLog.setRequestUri(limit(entry.requestUri(), 500));
        operLog.setRequestMethod(limit(entry.requestMethod(), 10));
        // 不复制请求体和响应体，避免身份证、银行卡、工资、聊天等敏感数据二次落盘。
        operLog.setRequestParams("");
        operLog.setResponseResult("");
        operLog.setStatus(STATUS_PROCESSING);
        operLog.setErrorMsg("");
        operLog.setIpAddr(limit(entry.ipAddress(), 128));
        operLog.setCostTime(0L);
        operLog.setOperTime(LocalDateTime.now());

        int inserted = operLogMapper.insert(operLog);
        if (inserted != 1 || operLog.getId() == null) {
            throw new IllegalStateException("代登录审计预写未成功");
        }
        return operLog.getId();
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW, rollbackFor = Exception.class)
    public void complete(Long auditId, int status, String errorMessage, long costTime) {
        if (auditId == null) {
            throw new IllegalArgumentException("代登录审计ID不能为空");
        }
        if (status != STATUS_SUCCESS && status != STATUS_FAILURE) {
            throw new IllegalArgumentException("代登录审计最终状态非法");
        }
        int updated = operLogMapper.completeImpersonationAudit(
                auditId,
                STATUS_PROCESSING,
                status,
                limit(errorMessage, 2000),
                Math.max(0L, costTime));
        if (updated != 1) {
            throw new IllegalStateException("代登录审计记录不存在或已结束");
        }
    }

    private String limit(String value, int maxLength) {
        if (value == null || value.length() <= maxLength) {
            return value;
        }
        return value.substring(0, maxLength);
    }
}
