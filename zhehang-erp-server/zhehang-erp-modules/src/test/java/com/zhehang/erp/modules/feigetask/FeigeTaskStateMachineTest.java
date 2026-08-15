package com.zhehang.erp.modules.feigetask;

import com.zhehang.erp.modules.feigetask.service.FeigeBusinessTaskService;
import com.zhehang.erp.modules.feigetask.service.FeigeGoalService;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class FeigeTaskStateMachineTest {

    @Test
    void businessEightStateMachineRejectsShortcuts() {
        assertTrue(FeigeBusinessTaskService.isBusinessTransitionAllowed(
                FeigeBusinessTaskService.PENDING_MANAGER_AUDIT, FeigeBusinessTaskService.PUBLIC_SEA));
        assertTrue(FeigeBusinessTaskService.isBusinessTransitionAllowed(
                FeigeBusinessTaskService.PUBLIC_SEA, FeigeBusinessTaskService.TASK));
        assertTrue(FeigeBusinessTaskService.isBusinessTransitionAllowed(
                FeigeBusinessTaskService.TASK, FeigeBusinessTaskService.HANDOVER));
        assertTrue(FeigeBusinessTaskService.isBusinessTransitionAllowed(
                FeigeBusinessTaskService.HANDOVER, FeigeBusinessTaskService.COMPLETED));
        assertTrue(FeigeBusinessTaskService.isBusinessTransitionAllowed(
                FeigeBusinessTaskService.PROBLEM_TASK, FeigeBusinessTaskService.RECYCLE_BIN));
        assertTrue(FeigeBusinessTaskService.isBusinessTransitionAllowed(
                FeigeBusinessTaskService.RECYCLE_BIN, FeigeBusinessTaskService.TASK));

        assertFalse(FeigeBusinessTaskService.isBusinessTransitionAllowed(
                FeigeBusinessTaskService.PENDING_MANAGER_AUDIT, FeigeBusinessTaskService.COMPLETED));
        assertFalse(FeigeBusinessTaskService.isBusinessTransitionAllowed(
                FeigeBusinessTaskService.COMPLETED, FeigeBusinessTaskService.TASK));
    }

    @Test
    void goalLifecycleIsForwardOnly() {
        assertTrue(FeigeGoalService.allowed("draft", "active"));
        assertTrue(FeigeGoalService.allowed("active", "completed"));
        assertTrue(FeigeGoalService.allowed("completed", "archived"));
        assertFalse(FeigeGoalService.allowed("completed", "active"));
        assertFalse(FeigeGoalService.allowed("archived", "draft"));
        assertFalse(FeigeGoalService.allowed("active", "active"));
    }
}
