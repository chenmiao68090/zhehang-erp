package com.zhehang.erp.modules.feigeorder.service;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * 飞哥版订单、退费与合同域共用的状态常量。
 *
 * <p>原先集中声明在 FeigeOrderContractService 内部，拆分为多个领域 Service 后统一提取到此处，
 * 保证四个领域使用完全一致的状态字面量。</p>
 */
public final class FeigeOrderConstants {

    public static final String ORDER_PENDING = "pending";
    public static final String ORDER_IN_PROGRESS = "in_progress";
    public static final String ORDER_COMPLETED = "completed";
    public static final String ORDER_REFUND_PENDING = "refund_pending";
    public static final String ORDER_REFUNDED = "refunded";
    public static final String ORDER_CANCELLED = "cancelled";
    public static final String ORDER_REJECTED = "rejected";

    public static final String REFUND_PENDING = "pending";
    public static final String REFUND_APPROVED = "approved";
    public static final String REFUND_COMPLETED = "completed";
    public static final String REFUND_REJECTED = "rejected";

    public static final String BUSINESS_TYPE_SEAL = "seal";

    public static final BigDecimal ZERO = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);

    private FeigeOrderConstants() {
    }
}
