package com.zhehang.erp.modules.review.constant;

/** 审单状态机常量:四节点 + 大写状态。 */
public final class ReviewConst {
    private ReviewConst() {}
    // 节点
    public static final String NODE_CONTRACT = "CONTRACT";
    public static final String NODE_PAYMENT = "PAYMENT";
    public static final String NODE_ACCEPT = "ACCEPT";
    public static final String NODE_PROCESS = "PROCESS";
    public static final String NODE_COMPLETE = "COMPLETE";
    // 状态
    public static final String DRAFT = "DRAFT";
    public static final String SUBMITTED = "SUBMITTED";
    public static final String CONTRACT_PENDING = "CONTRACT_PENDING";
    public static final String CONTRACT_REJECTED = "CONTRACT_REJECTED";
    public static final String PAYMENT_PENDING = "PAYMENT_PENDING";
    public static final String PAYMENT_REJECTED = "PAYMENT_REJECTED";
    public static final String ACCEPT_PENDING = "ACCEPT_PENDING";
    public static final String ACCEPT_REJECTED = "ACCEPT_REJECTED";
    public static final String PROCESSING = "PROCESSING";
    public static final String COMPLETE_PENDING = "COMPLETE_PENDING";
    public static final String COMPLETE_REJECTED = "COMPLETE_REJECTED";
    public static final String COMPLETED = "COMPLETED";
    public static final String VOIDED = "VOIDED";

    public static String nodeName(String node) {
        if (node == null) return "";
        switch (node) {
            case NODE_CONTRACT: return "合同审理";
            case NODE_PAYMENT: return "财务到款确认";
            case NODE_ACCEPT: return "办事人员接收";
            case NODE_PROCESS: return "办理中";
            case NODE_COMPLETE: return "办理完毕确认";
            default: return node;
        }
    }
}
