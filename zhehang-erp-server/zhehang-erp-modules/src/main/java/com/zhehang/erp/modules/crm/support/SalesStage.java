package com.zhehang.erp.modules.crm.support;

import com.zhehang.erp.modules.crm.domain.entity.CrmLead;

import java.util.Arrays;

/** 销售经营台统一阶段字典。 */
public enum SalesStage {
    LEAD_RECEIVED("线索接收", 1, true),
    NEEDS_COMMUNICATION("需求沟通", 2, true),
    NEEDS_CLARIFICATION("需求答疑", 3, true),
    SIGNING_PAYMENT("签单收款", 4, true),
    HANDOFF_DELIVERY("移交结束交付", 5, true),
    INVALID("无效", 99, false);

    private final String label;
    private final int order;
    private final boolean funnelStage;

    SalesStage(String label, int order, boolean funnelStage) {
        this.label = label;
        this.order = order;
        this.funnelStage = funnelStage;
    }

    public String getCode() {
        return name();
    }

    public String getLabel() {
        return label;
    }

    public int getOrder() {
        return order;
    }

    public boolean isFunnelStage() {
        return funnelStage;
    }

    public static SalesStage fromLead(CrmLead lead) {
        if (lead == null) {
            return null;
        }
        return resolve(lead.getFollowStatus(), lead.getStatus());
    }

    public static SalesStage resolve(String followStatus, Integer lifecycleStatus) {
        if (Integer.valueOf(4).equals(lifecycleStatus)) {
            return INVALID;
        }
        if (Integer.valueOf(3).equals(lifecycleStatus)) {
            return HANDOFF_DELIVERY;
        }
        String value = followStatus == null ? "" : followStatus.trim();
        for (SalesStage stage : values()) {
            if (stage.label.equals(value)) {
                return stage;
            }
        }
        return Integer.valueOf(2).equals(lifecycleStatus) ? NEEDS_COMMUNICATION : LEAD_RECEIVED;
    }

    public static SalesStage fromCode(String code) {
        if (code == null || code.isBlank()) {
            return null;
        }
        return Arrays.stream(values())
                .filter(stage -> stage.name().equalsIgnoreCase(code.trim()))
                .findFirst()
                .orElse(null);
    }
}
