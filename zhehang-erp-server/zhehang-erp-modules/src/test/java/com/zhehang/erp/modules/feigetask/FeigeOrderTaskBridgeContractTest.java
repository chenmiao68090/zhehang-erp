package com.zhehang.erp.modules.feigetask;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.modules.feigetask.domain.entity.FeigeOrderTaskBridgeRule;
import com.zhehang.erp.modules.feigetask.domain.entity.FeigeOrderTaskBridgeRun;
import com.zhehang.erp.modules.feigetask.domain.entity.FeigeAuditTask;
import com.zhehang.erp.modules.feigetask.service.FeigeAuditTaskService;
import org.junit.jupiter.api.Test;

import java.nio.file.Files;
import java.nio.file.Path;
import java.lang.reflect.Constructor;
import java.lang.reflect.Method;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class FeigeOrderTaskBridgeContractTest {

    @Test
    void bridgeUsesIsolatedTablesAndMigrationSeedsNoEnabledRule() throws Exception {
        assertEquals("feige_task_order_bridge_rule",
                FeigeOrderTaskBridgeRule.class.getAnnotation(TableName.class).value());
        assertEquals("feige_task_order_bridge_run",
                FeigeOrderTaskBridgeRun.class.getAnnotation(TableName.class).value());

        String migration = Files.readString(Path.of(
                "../../zhehang-erp-db/migration/V204_feige_order_task_bridge.sql"));
        assertTrue(migration.contains("uk_ft_bridge_run_once"));
        assertTrue(migration.contains("uk_ft_business_bridge_run"));
        assertTrue(migration.contains("uk_ft_audit_bridge_run"));
        assertFalse(migration.matches("(?is).*INSERT\\s+INTO\\s+feige_task_order_bridge_rule.*"));
        assertFalse(migration.matches("(?is).*(ALTER|UPDATE|DELETE FROM|INSERT INTO)\\s+(biz_|crm_|sys_).*"));
    }

    @Test
    void scheduledConsumerIsExplicitlyTenantScopedAndDoesNotTrustLoginContext() throws Exception {
        String service = Files.readString(Path.of(
                "src/main/java/com/zhehang/erp/modules/feigetask/service/FeigeOrderTaskBridgeService.java"));
        assertTrue(service.contains("getTenantId, run.getTenantId()"));
        assertTrue(service.contains("getTenantId, tenantId"));
        assertTrue(service.contains("existsResignedEmployee(id, tenantId)"));
        assertFalse(service.contains("SecurityUtils"));
    }

    @Test
    void automaticBusinessTaskNeedsManagerAssignment() throws Exception {
        String service = Files.readString(Path.of(
                "src/main/java/com/zhehang/erp/modules/feigetask/service/FeigeOrderTaskBridgeService.java"));
        assertTrue(service.contains("setTaskStatus(FeigeBusinessTaskService.PENDING_MANAGER_AUDIT)"));
        assertTrue(service.contains("setManagerReviewStatus(\"pending\")"));
        assertTrue(service.contains("setBusinessOwnerId(owner.getId())"));
        assertTrue(service.contains("setOwnerId(null)"));
        assertTrue(service.contains("setOwnerName(null)"));
        assertTrue(service.contains("审批类规则必须选择 personal/team 任务范围"));
        assertTrue(service.contains("规则业务类型必须与审批流程业务类型一致"));
    }

    @Test
    void processMutationIsBlockedWhilePendingInstancesExist() throws Exception {
        String service = Files.readString(Path.of(
                "src/main/java/com/zhehang/erp/modules/feigetask/service/FeigeAuditTaskService.java"));
        assertTrue(service.contains("流程存在待审核任务，只能修改名称、说明或启停状态"));
        assertTrue(service.contains("sameSteps(steps(id), request.getSteps())"));
        assertTrue(service.contains("if (pending == 0)"));
        assertTrue(service.contains("专项类型编码已存在"));
        assertTrue(service.contains("public Long createProcess"));
        assertTrue(service.contains("access.requireBridgeManager()"));
    }

    @Test
    void bridgeConfigurationUsesSuperAdminGateAndStrictIdempotentInsert() throws Exception {
        String access = Files.readString(Path.of(
                "src/main/java/com/zhehang/erp/modules/feigetask/service/FeigeTaskAccessService.java"));
        String mapper = Files.readString(Path.of(
                "src/main/java/com/zhehang/erp/modules/feigetask/mapper/FeigeOrderTaskBridgeRunMapper.java"));
        assertTrue(access.contains("public void requireBridgeManager()"));
        assertTrue(access.contains("return SecurityUtils.isCurrentAdmin()"));
        assertTrue(mapper.contains("ON DUPLICATE KEY UPDATE id = id"));
        assertFalse(mapper.contains("INSERT IGNORE"));
        assertTrue(mapper.contains("int insertIdempotent"));
        String bridge = Files.readString(Path.of(
                "src/main/java/com/zhehang/erp/modules/feigetask/service/FeigeOrderTaskBridgeService.java"));
        assertTrue(bridge.contains("row.put(\"status\", run.getRunStatus())"));
        assertTrue(bridge.contains("row.put(\"retryCount\", run.getAttemptCount())"));
        assertTrue(bridge.contains("row.put(\"ruleName\", ruleName)"));
    }

    @Test
    void finalConfirmOnlyAppliesToTheLastApprovalStep() throws Exception {
        String audit = Files.readString(Path.of(
                "src/main/java/com/zhehang/erp/modules/feigetask/service/FeigeAuditTaskService.java"));
        assertTrue(audit.contains("private boolean isFinalConfirmStep"));
        assertTrue(audit.contains("Objects.equals(task.getStepOrder(), task.getTotalSteps())"));
        assertTrue(audit.contains("if (isFinalConfirmStep(task))"));
        assertTrue(audit.contains("row.put(\"isFinalConfirm\", isFinalConfirmStep(task))"));
        assertTrue(audit.contains("request.getNextAuditorId() != null && !isFinalConfirmStep(task)"));
        assertTrue(audit.contains("return Objects.equals(task.getBusinessOwnerId(), current)"));
        String bridge = Files.readString(Path.of(
                "src/main/java/com/zhehang/erp/modules/feigetask/service/FeigeOrderTaskBridgeService.java"));
        assertTrue(bridge.contains("boolean finalOwnerConfirm"));
        assertTrue(bridge.contains("task.setAssignedUserId(owner.getId())"));

        Constructor<?> constructor = FeigeAuditTaskService.class.getDeclaredConstructors()[0];
        Object service = constructor.newInstance(new Object[constructor.getParameterCount()]);
        Method predicate = FeigeAuditTaskService.class.getDeclaredMethod("isFinalConfirmStep", FeigeAuditTask.class);
        predicate.setAccessible(true);
        FeigeAuditTask task = new FeigeAuditTask();
        task.setFinalConfirm(1);
        task.setTotalSteps(3);
        task.setStepOrder(1);
        assertFalse((Boolean) predicate.invoke(service, task));
        task.setStepOrder(3);
        assertTrue((Boolean) predicate.invoke(service, task));
        task.setTotalSteps(1);
        task.setStepOrder(1);
        assertTrue((Boolean) predicate.invoke(service, task));
    }
}
