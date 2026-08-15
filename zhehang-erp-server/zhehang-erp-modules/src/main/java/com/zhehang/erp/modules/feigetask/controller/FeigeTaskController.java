package com.zhehang.erp.modules.feigetask.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.feigetask.domain.dto.FeigeTaskRequests;
import com.zhehang.erp.modules.feigetask.domain.entity.FeigeAuditProcess;
import com.zhehang.erp.modules.feigetask.service.FeigeAuditTaskService;
import com.zhehang.erp.modules.feigetask.service.FeigeBusinessTaskService;
import com.zhehang.erp.modules.feigetask.service.FeigeGoalService;
import com.zhehang.erp.modules.feigetask.service.FeigeOrderTaskBridgeService;
import com.zhehang.erp.modules.feigetask.service.FeigeTaskAccessService;
import com.zhehang.erp.modules.feigetask.service.FeigeTaskDirectoryService;
import com.zhehang.erp.modules.feigetask.service.FeigeWorkflowService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/feige-task")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class FeigeTaskController {

    private static final Set<String> BUSINESS_ACTIONS = Set.of("approve", "reject", "receive", "cost",
            "handover", "reassign", "exception", "complete", "confirm-handover", "restore", "recycle");

    private final FeigeTaskDirectoryService directoryService;
    private final FeigeBusinessTaskService businessService;
    private final FeigeAuditTaskService auditService;
    private final FeigeWorkflowService workflowService;
    private final FeigeGoalService goalService;
    private final FeigeTaskAccessService accessService;
    private final FeigeOrderTaskBridgeService bridgeService;
    private final ObjectMapper objectMapper;

    @GetMapping("/staff-options")
    public R<List<Map<String, Object>>> staffOptions() {
        return R.ok(directoryService.staffOptions());
    }

    @GetMapping("/role-tree")
    public R<List<Map<String, Object>>> roleTree() {
        return R.ok(directoryService.roleTree());
    }

    @GetMapping("/capabilities")
    public R<Map<String, Boolean>> capabilities() {
        boolean manager = accessService.isManager();
        return R.ok(Map.of(
                "manager", manager,
                "bridgeManage", accessService.isBridgeManager(),
                "bridgeTriggerSupported", true,
                "contractConversionSupported", true,
                "addressConversionSupported", false));
    }

    @GetMapping("/order-options")
    public R<List<Map<String, Object>>> orderOptions(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "20") Integer pageSize) {
        return R.ok(bridgeService.orderOptions(keyword, pageSize));
    }

    @GetMapping("/bridge-rules")
    public R<List<Map<String, Object>>> bridgeRules(
            @RequestParam(required = false) Boolean enabled,
            @RequestParam(required = false) String triggerEvent,
            @RequestParam(required = false) String targetTaskType) {
        return R.ok(bridgeService.rules(enabled, triggerEvent, targetTaskType));
    }

    @PostMapping("/bridge-rules")
    public R<Long> createBridgeRule(@Valid @RequestBody FeigeTaskRequests.BridgeRuleUpsert request) {
        return R.ok(bridgeService.createRule(request));
    }

    @PutMapping("/bridge-rules/{id}")
    public R<Void> updateBridgeRule(@PathVariable Long id,
                                    @Valid @RequestBody FeigeTaskRequests.BridgeRuleUpsert request) {
        bridgeService.updateRule(id, request);
        return R.ok();
    }

    @GetMapping("/bridge-runs")
    public R<Map<String, Object>> bridgeRuns(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long orderId,
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "20") Integer pageSize) {
        return R.ok(bridgeService.runs(status, orderId, pageNum, pageSize));
    }

    @PostMapping("/bridge-runs/{id}/retry")
    public R<Void> retryBridgeRun(@PathVariable Long id) {
        bridgeService.retry(id);
        return R.ok();
    }

    @GetMapping("/business")
    public R<Map<String, Object>> business(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String orderNo,
            @RequestParam(required = false) String companyName,
            @RequestParam(required = false) String businessType,
            @RequestParam(required = false) Long assigneeId,
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "20") Integer pageSize) {
        return R.ok(businessService.page(pageNum, pageSize, status, keyword,
                orderNo, companyName, businessType, assigneeId));
    }

    @PostMapping("/business")
    public R<Long> createBusiness(@Valid @RequestBody FeigeTaskRequests.BusinessCreate request) {
        return R.ok(businessService.create(request));
    }

    @PostMapping("/business/{id}/{action}")
    public R<Void> businessAction(@PathVariable Long id, @PathVariable String action,
                                  @RequestBody(required = false) Map<String, Object> payload) {
        if (!BUSINESS_ACTIONS.contains(action)) {
            throw new BusinessException("未知的业务任务操作");
        }
        Map<String, Object> body = payload == null ? Map.of() : payload;
        switch (action) {
            case "approve", "reject" -> {
                FeigeTaskRequests.ManagerReview request = convert(body, FeigeTaskRequests.ManagerReview.class);
                request.setResult(action.equals("approve") ? "approved" : "rejected");
                businessService.managerReview(id, request);
            }
            case "receive" -> businessService.receive(id);
            case "cost" -> businessService.updateCost(id, convert(body, FeigeTaskRequests.CostUpdate.class));
            case "handover" -> businessService.handover(id, convert(body, FeigeTaskRequests.UserAssignment.class));
            case "reassign" -> businessService.reassign(id, convert(body, FeigeTaskRequests.UserAssignment.class));
            case "exception" -> businessService.moveToException(id,
                    convert(body, FeigeTaskRequests.ExceptionMove.class));
            case "complete" -> businessService.complete(id);
            case "confirm-handover" -> businessService.confirmHandover(id);
            case "restore" -> businessService.restore(id);
            case "recycle" -> businessService.recycle(id);
            default -> throw new BusinessException("未知的业务任务操作");
        }
        return R.ok();
    }

    @GetMapping("/audit")
    public R<Map<String, Object>> audits(
            @RequestParam(required = false) String taskType,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String scopeType,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String businessType,
            @RequestParam(required = false) Long salesId,
            @RequestParam(required = false) Integer stepNo,
            @RequestParam(required = false) Boolean showCompleted,
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "20") Integer pageSize) {
        return R.ok(auditService.page(pageNum, pageSize, taskType, status, keyword,
                scopeType, businessType, salesId, stepNo, showCompleted));
    }

    @GetMapping("/audit/{id}")
    public R<Map<String, Object>> audit(@PathVariable Long id) {
        return R.ok(auditService.task(id));
    }

    @GetMapping("/audit/processes")
    public R<List<FeigeAuditProcess>> auditProcesses(
            @RequestParam(required = false) String taskType,
            @RequestParam(required = false) String businessTypeCode,
            @RequestParam(required = false) Boolean enabledOnly) {
        return R.ok(auditService.processes(taskType, businessTypeCode, enabledOnly));
    }

    @GetMapping("/audit/processes/{id}")
    public R<Map<String, Object>> auditProcess(@PathVariable Long id) {
        return R.ok(auditService.process(id));
    }

    @PostMapping("/audit/processes")
    public R<Long> createAuditProcess(
            @Valid @RequestBody FeigeTaskRequests.AuditProcessUpsert request) {
        return R.ok(auditService.createProcess(request));
    }

    @PutMapping("/audit/processes/{id}")
    public R<Void> updateAuditProcess(
            @PathVariable Long id,
            @Valid @RequestBody FeigeTaskRequests.AuditProcessUpsert request) {
        auditService.updateProcess(id, request);
        return R.ok();
    }

    @PostMapping("/audit")
    public R<Long> createAuditTask(@Valid @RequestBody FeigeTaskRequests.AuditTaskCreate request) {
        return R.ok(auditService.createTask(request));
    }

    @PostMapping("/audit/{id}/action")
    public R<Void> auditAction(@PathVariable Long id,
                               @RequestBody FeigeTaskRequests.AuditAction action) {
        if ("reassign_specialist".equals(action.getAction())) {
            auditService.reassignSpecialist(id, action.getServicePersonId());
            return R.ok();
        }
        if (!StringUtils.hasText(action.getResult())) {
            throw new BusinessException("审批结果不能为空");
        }
        FeigeTaskRequests.AuditReview request = new FeigeTaskRequests.AuditReview();
        request.setResult(action.getResult());
        request.setRemark(action.getRemark());
        request.setRejectReason(action.getRejectReason());
        request.setFormData(action.getFormData());
        request.setCostItems(action.getCostItems());
        request.setNextAuditorId(action.getNextAuditorId());
        request.setConvertContract(action.getConvertContract());
        request.setConvertAddress(action.getConvertAddress());
        auditService.review(id, request);
        return R.ok();
    }

    @GetMapping("/audit/order/{orderId}/payments")
    public R<List<Map<String, Object>>> auditPayments(@PathVariable Long orderId) {
        return R.ok(auditService.payments(orderId));
    }

    @GetMapping("/audit/order/{orderId}/steps")
    public R<List<Map<String, Object>>> auditSteps(@PathVariable Long orderId) {
        return R.ok(auditService.orderSteps(orderId));
    }

    @GetMapping("/workflow/tasks")
    public R<Map<String, Object>> workflowTasks(
            @RequestParam(required = false) Long userId,
            @RequestParam String cycleType,
            @RequestParam String periodKey,
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "20") Integer pageSize) {
        return R.ok(workflowService.tasks(userId, cycleType, periodKey, pageNum, pageSize));
    }

    @GetMapping("/workflow/month-stats")
    public R<List<Map<String, Object>>> workflowMonthStats(@RequestParam String month) {
        return R.ok(workflowService.monthStats(month));
    }

    @PostMapping("/workflow/tasks/{id}/{action}")
    public R<Void> workflowAction(@PathVariable Long id, @PathVariable String action,
                                  @RequestBody(required = false) Map<String, Object> payload) {
        Map<String, Object> body = payload == null ? Map.of() : payload;
        FeigeTaskRequests.WorkflowTaskDetail detail = convert(body, FeigeTaskRequests.WorkflowTaskDetail.class);
        FeigeTaskRequests.WorkflowUndone undone = convert(body, FeigeTaskRequests.WorkflowUndone.class);
        workflowService.action(id, action, detail, undone);
        return R.ok();
    }

    @PostMapping("/workflow/summary")
    public R<Void> workflowSummary(@Valid @RequestBody FeigeTaskRequests.WorkflowSummary request) {
        workflowService.saveSummary(request);
        return R.ok();
    }

    @GetMapping("/workflow/report")
    public R<List<Map<String, Object>>> workflowReport(
            @RequestParam(required = false) String cycleType,
            @RequestParam(required = false) String periodKey,
            @RequestParam(required = false) Long roleId,
            @RequestParam(required = false) String keyword) {
        return R.ok(workflowService.reportRows(cycleType, periodKey, roleId, keyword));
    }

    @GetMapping("/workflow/required-scopes")
    public R<List<Map<String, Object>>> requiredScopes() {
        return R.ok(workflowService.requiredScopes());
    }

    @PostMapping("/workflow/required-scopes")
    public R<Long> saveRequiredScope(
            @Valid @RequestBody FeigeTaskRequests.WorkflowRequiredUpsert request) {
        return R.ok(workflowService.saveRequired(request));
    }

    @DeleteMapping("/workflow/required-scopes/{id}")
    public R<Void> deleteRequiredScope(@PathVariable Long id) {
        workflowService.deleteRequired(id);
        return R.ok();
    }

    @GetMapping("/goals")
    public R<Map<String, Object>> goals(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) String cycleType,
            @RequestParam(required = false) String periodKey,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long roleId,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "20") Integer pageSize) {
        return R.ok(goalService.page(pageNum, pageSize, year, cycleType, periodKey,
                status, roleId, userId, keyword));
    }

    @PostMapping("/goals")
    public R<Long> createGoal(@Valid @RequestBody FeigeTaskRequests.GoalUpsert request) {
        return R.ok(goalService.create(request));
    }

    @PutMapping("/goals/{id}")
    public R<Void> updateGoal(@PathVariable Long id,
                              @Valid @RequestBody FeigeTaskRequests.GoalUpsert request) {
        goalService.update(id, request);
        return R.ok();
    }

    @PostMapping("/goals/{id}/status")
    public R<Void> goalStatus(@PathVariable Long id,
                              @Valid @RequestBody FeigeTaskRequests.GoalStatus request) {
        goalService.changeStatus(id, request);
        return R.ok();
    }

    @DeleteMapping("/goals/{id}")
    public R<Void> deleteGoal(@PathVariable Long id) {
        goalService.delete(id);
        return R.ok();
    }

    @GetMapping("/templates")
    public R<Map<String, Object>> templates(
            @RequestParam(required = false) String cycleType,
            @RequestParam(required = false) Long roleId,
            @RequestParam(required = false) Boolean enabled,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "20") Integer pageSize) {
        return R.ok(workflowService.templates(pageNum, pageSize, cycleType, roleId, enabled, keyword));
    }

    @PostMapping("/templates")
    public R<Long> createTemplate(
            @Valid @RequestBody FeigeTaskRequests.WorkflowTemplateUpsert request) {
        return R.ok(workflowService.createTemplate(request));
    }

    @PutMapping("/templates/{id}")
    public R<Void> updateTemplate(@PathVariable Long id,
                                  @Valid @RequestBody FeigeTaskRequests.WorkflowTemplateUpsert request) {
        workflowService.updateTemplate(id, request);
        return R.ok();
    }

    @DeleteMapping("/templates/{id}")
    public R<Void> deleteTemplate(@PathVariable Long id) {
        workflowService.deleteTemplate(id);
        return R.ok();
    }

    @GetMapping("/subordinates")
    public R<Map<String, Object>> subordinates(
            @RequestParam String cycleType,
            @RequestParam String periodKey,
            @RequestParam(required = false) Long roleId,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "20") Integer pageSize) {
        return R.ok(workflowService.subordinates(cycleType, periodKey, roleId,
                keyword, pageNum, pageSize));
    }

    @GetMapping("/subordinates/detail")
    public R<Map<String, Object>> subordinateDetail(
            @RequestParam Long userId,
            @RequestParam String cycleType,
            @RequestParam String periodKey) {
        return R.ok(workflowService.subordinateDetail(userId, cycleType, periodKey));
    }

    private <T> T convert(Map<String, Object> source, Class<T> target) {
        try {
            return objectMapper.convertValue(source, target);
        } catch (IllegalArgumentException e) {
            throw new BusinessException("请求参数格式不正确");
        }
    }
}
