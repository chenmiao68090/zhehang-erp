package com.zhehang.erp.modules.im.service;

import com.zhehang.erp.common.core.exception.BusinessException;

import java.util.Map;
import java.util.Set;

/** 待办状态机唯一转换表，Controller 和定时任务不能自行跳状态。 */
public final class ImTaskWorkflow {
    private static final Map<String, Set<String>> TRANSITIONS = Map.of(
            "pending_accept", Set.of("in_progress", "cancelled"),
            "in_progress", Set.of("pending_review", "cancelled"),
            "pending_review", Set.of("completed", "rejected", "cancelled"),
            "rejected", Set.of("in_progress", "pending_review", "cancelled")
    );

    private ImTaskWorkflow() {}

    public static void requireTransition(String from, String to) {
        if (!TRANSITIONS.getOrDefault(from, Set.of()).contains(to)) {
            throw new BusinessException("待办状态已变化，请刷新后重试");
        }
    }

    public static boolean isClosed(String state) {
        return "completed".equals(state) || "cancelled".equals(state);
    }

    public static String displayState(String workflowState, boolean overdue) {
        if ("rejected".equals(workflowState) || isClosed(workflowState)) return workflowState;
        return overdue ? "overdue" : workflowState;
    }
}
