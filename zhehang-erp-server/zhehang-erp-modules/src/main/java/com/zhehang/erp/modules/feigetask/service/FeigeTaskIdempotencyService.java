package com.zhehang.erp.modules.feigetask.service;

import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.feigetask.domain.dto.FeigeTaskRequests;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

/**
 * 手工创建任务的请求幂等工具。摘要只覆盖有业务含义的请求字段，不记录请求正文。
 */
@Service
public class FeigeTaskIdempotencyService {

    private static final String REQUEST_KEY_PATTERN = "^[A-Za-z0-9][A-Za-z0-9:_-]{7,63}$";

    public String normalizeKey(String raw) {
        if (!StringUtils.hasText(raw)) {
            return null;
        }
        String key = raw.trim();
        if (!key.matches(REQUEST_KEY_PATTERN)) {
            throw new BusinessException("requestKey仅支持8到64位字母、数字、冒号、下划线或短横线");
        }
        return key;
    }

    public String businessFingerprint(FeigeTaskRequests.BusinessCreate request) {
        StringBuilder value = new StringBuilder();
        append(value, "orderId", request.getOrderId());
        if (request.getOrderId() == null) {
            append(value, "orderNo", text(request.getOrderNo()));
            append(value, "companyName", text(request.getCompanyName()));
            append(value, "businessOwnerId", request.getBusinessOwnerId());
        }
        append(value, "remarks", text(request.getRemarks()));
        return sha256(value.toString());
    }

    public String auditFingerprint(FeigeTaskRequests.AuditTaskCreate request) {
        StringBuilder value = new StringBuilder();
        append(value, "processId", request.getProcessId());
        append(value, "orderId", request.getOrderId());
        if (request.getOrderId() == null) {
            append(value, "orderNo", text(request.getOrderNo()));
            append(value, "companyName", text(request.getCompanyName()));
            append(value, "businessTypeCode", text(request.getBusinessTypeCode()));
            append(value, "businessTypeName", text(request.getBusinessTypeName()));
            append(value, "businessOwnerId", request.getBusinessOwnerId());
            append(value, "teamName", text(request.getTeamName()));
            append(value, "region", text(request.getRegion()));
            append(value, "amount", decimal(request.getAmount()));
        }
        append(value, "scopeType", text(request.getScopeType()));
        append(value, "expenseAmount", decimal(request.getExpenseAmount()));
        append(value, "startMonth", text(request.getStartMonth()));
        append(value, "endMonth", text(request.getEndMonth()));
        append(value, "servicePersonId", request.getServicePersonId());
        append(value, "remarks", text(request.getRemarks()));
        append(value, "finalConfirm", Integer.valueOf(1).equals(request.getFinalConfirm()) ? 1 : 0);
        return sha256(value.toString());
    }

    private void append(StringBuilder target, String name, Object value) {
        String encoded = value == null ? "<null>" : String.valueOf(value);
        target.append(name.length()).append(':').append(name)
                .append('=').append(encoded.length()).append(':').append(encoded).append(';');
    }

    private String text(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }

    private String decimal(BigDecimal value) {
        return value == null ? null : value.stripTrailingZeros().toPlainString();
    }

    private String sha256(String value) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                    .digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("JVM不支持SHA-256", e);
        }
    }
}
