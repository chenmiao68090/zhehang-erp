package com.zhehang.erp.modules.crm.support;

import java.util.LinkedHashMap;
import java.util.Map;

/** CRM 线索统一来源大类。具体渠道继续写 sourcePlatform/sourceDetail。 */
public final class CrmLeadSource {
    public static final int PUBLIC_COMPANY_LIST = 1;
    public static final int CUSTOMER_REFERRAL = 2;
    public static final int PAID_OPERATION_MEITUAN = 3;
    public static final int PAID_OPERATION_DOUYIN = 4;
    public static final int OFFLINE_VISIT = 5;
    public static final int PAID_OPERATION_OTHER = 6;
    public static final int PURCHASED_OR_TELEMARKETING = 7;
    public static final int CHANNEL_PARTNER = 8;
    public static final int PRIVATE_DOMAIN_REACTIVATION = 9;
    public static final int OTHER = 10;

    private static final Map<Integer, String> LABELS;

    static {
        Map<Integer, String> labels = new LinkedHashMap<>();
        labels.put(PUBLIC_COMPANY_LIST, "工商公开名单");
        labels.put(CUSTOMER_REFERRAL, "客户转介绍");
        labels.put(PAID_OPERATION_MEITUAN, "运营投流·美团");
        labels.put(PAID_OPERATION_DOUYIN, "运营投流·抖音");
        labels.put(OFFLINE_VISIT, "线下来客");
        labels.put(PAID_OPERATION_OTHER, "运营投流·其他");
        labels.put(PURCHASED_OR_TELEMARKETING, "名单采购/电销");
        labels.put(CHANNEL_PARTNER, "渠道合作");
        labels.put(PRIVATE_DOMAIN_REACTIVATION, "私域/存量二次开发");
        labels.put(OTHER, "其他");
        LABELS = Map.copyOf(labels);
    }

    private CrmLeadSource() {
    }

    public static boolean isSupported(Integer sourceType) {
        return sourceType != null && LABELS.containsKey(sourceType);
    }

    public static String labelOf(Integer sourceType) {
        return LABELS.getOrDefault(sourceType, "其他");
    }
}
