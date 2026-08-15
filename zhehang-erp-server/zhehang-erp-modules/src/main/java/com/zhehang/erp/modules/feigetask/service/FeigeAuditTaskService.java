package com.zhehang.erp.modules.feigetask.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.feigeorder.domain.entity.FeigeOrder;
import com.zhehang.erp.modules.feigeorder.domain.entity.FeigeOrderPayment;
import com.zhehang.erp.modules.feigeorder.mapper.FeigeOrderMapper;
import com.zhehang.erp.modules.feigeorder.mapper.FeigeOrderPaymentMapper;
import com.zhehang.erp.modules.feigeorder.service.FeigeTaskContractConversionService;
import com.zhehang.erp.modules.feigetask.domain.dto.FeigeTaskRequests;
import com.zhehang.erp.modules.feigetask.domain.entity.FeigeAuditProcess;
import com.zhehang.erp.modules.feigetask.domain.entity.FeigeAuditStep;
import com.zhehang.erp.modules.feigetask.domain.entity.FeigeAuditTask;
import com.zhehang.erp.modules.feigetask.domain.entity.FeigeTaskOperationLog;
import com.zhehang.erp.modules.feigetask.mapper.FeigeAuditProcessMapper;
import com.zhehang.erp.modules.feigetask.mapper.FeigeAuditStepMapper;
import com.zhehang.erp.modules.feigetask.mapper.FeigeAuditTaskMapper;
import com.zhehang.erp.modules.feigetask.mapper.FeigeTaskOperationLogMapper;
import com.zhehang.erp.modules.system.domain.entity.SysUser;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class FeigeAuditTaskService {

    public static final String PENDING = "pending";
    public static final String APPROVED = "approved";
    public static final String REJECTED = "rejected";
    public static final String RETURNED = "returned";

    private static final Set<String> TASK_TYPES = Set.of("once", "recurring", "project_dept", "special");
    private static final Set<String> ASSIGNEE_MODES = Set.of("role", "specific", "owner");
    private static final Set<String> FORM_FIELD_TYPES = Set.of(
            "text", "textarea", "number", "select", "date", "datetime", "switch");
    private static final Set<String> INDICATOR_TYPES = Set.of(
            "next_auditor", "cost_input", "convert_contract", "convert_address");
    private static final DateTimeFormatter NUMBER_TIME = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
    private static final DateTimeFormatter FORM_DATE_TIME = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final FeigeAuditProcessMapper processMapper;
    private final FeigeAuditStepMapper stepMapper;
    private final FeigeAuditTaskMapper taskMapper;
    private final FeigeTaskOperationLogMapper operationLogMapper;
    private final FeigeOrderMapper orderMapper;
    private final FeigeOrderPaymentMapper paymentMapper;
    private final DataScopeHelper dataScopeHelper;
    private final FeigeTaskAccessService access;
    private final ObjectMapper objectMapper;
    private final FeigeTaskIdempotencyService idempotency;
    private final FeigeTaskContractConversionService contractConversionService;

    public List<FeigeAuditProcess> processes(String taskType, String businessTypeCode, Boolean enabledOnly) {
        access.requireManager();
        if (StringUtils.hasText(taskType) && !TASK_TYPES.contains(taskType)) {
            throw new BusinessException("未知的审批任务类型");
        }
        return processMapper.selectList(new LambdaQueryWrapper<FeigeAuditProcess>()
                .eq(StringUtils.hasText(taskType), FeigeAuditProcess::getTaskType, taskType)
                .eq(StringUtils.hasText(businessTypeCode), FeigeAuditProcess::getBusinessTypeCode, businessTypeCode)
                .eq(Boolean.TRUE.equals(enabledOnly), FeigeAuditProcess::getEnabled, 1)
                .orderByAsc(FeigeAuditProcess::getTaskType)
                .orderByAsc(FeigeAuditProcess::getProcessName));
    }

    public Map<String, Object> process(Long id) {
        access.requireManager();
        FeigeAuditProcess process = requireProcess(id);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("process", process);
        result.put("steps", steps(id));
        return result;
    }

    @Transactional(rollbackFor = Exception.class)
    public Long createProcess(FeigeTaskRequests.AuditProcessUpsert request) {
        access.requireBridgeManager();
        validateProcessRequest(request, null);
        FeigeAuditProcess process = new FeigeAuditProcess();
        copyProcess(process, request);
        if (processMapper.insert(process) <= 0) {
            throw new BusinessException("审批流程创建失败");
        }
        replaceSteps(process.getId(), request.getSteps());
        access.log("audit_process", process.getId(), "create", null,
                String.valueOf(process.getEnabled()), "创建审批流程", null);
        return process.getId();
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateProcess(Long id, FeigeTaskRequests.AuditProcessUpsert request) {
        access.requireBridgeManager();
        FeigeAuditProcess process = requireProcess(id);
        validateProcessRequest(request, id);
        long pending = taskMapper.selectCount(new LambdaQueryWrapper<FeigeAuditTask>()
                .eq(FeigeAuditTask::getProcessId, id)
                .eq(FeigeAuditTask::getTaskStatus, PENDING));
        if (pending > 0) {
            boolean identityChanged = !Objects.equals(process.getProcessCode(), request.getProcessCode().trim())
                    || !Objects.equals(process.getTaskType(), request.getTaskType())
                    || !Objects.equals(process.getBusinessTypeCode(), trimJson(request.getBusinessTypeCode()));
            if (identityChanged || !sameSteps(steps(id), request.getSteps())) {
                throw new BusinessException(409, "流程存在待审核任务，只能修改名称、说明或启停状态");
            }
        }
        String from = String.valueOf(process.getEnabled());
        copyProcess(process, request);
        if (processMapper.updateById(process) <= 0) {
            throw new BusinessException(409, "审批流程已被其他人更新，请刷新后重试");
        }
        // 待审核实例仍引用原 step_id；安全元数据更新时必须保留原步骤行。
        if (pending == 0) {
            replaceSteps(id, request.getSteps());
        }
        access.log("audit_process", id, "update", from, String.valueOf(process.getEnabled()),
                "更新审批流程", null);
    }

    private boolean sameSteps(List<FeigeAuditStep> current, List<FeigeTaskRequests.AuditStep> requested) {
        if (current.size() != requested.size()) {
            return false;
        }
        List<FeigeAuditStep> left = current.stream()
                .sorted(java.util.Comparator.comparing(FeigeAuditStep::getStepOrder)).toList();
        List<FeigeTaskRequests.AuditStep> right = requested.stream()
                .sorted(java.util.Comparator.comparing(FeigeTaskRequests.AuditStep::getStepOrder)).toList();
        for (int i = 0; i < left.size(); i++) {
            FeigeAuditStep a = left.get(i);
            FeigeTaskRequests.AuditStep b = right.get(i);
            if (!Objects.equals(a.getStepOrder(), b.getStepOrder())
                    || !Objects.equals(a.getStepName(), b.getStepName())
                    || !Objects.equals(a.getRequiredRoleKey(), b.getRequiredRoleKey())
                    || !Objects.equals(a.getAssigneeMode(), b.getAssigneeMode())
                    || !Objects.equals(a.getRequiredUserId(), b.getRequiredUserId())
                    || !Objects.equals(Integer.valueOf(1).equals(a.getAllowBatch()),
                    Integer.valueOf(1).equals(b.getAllowBatch()))
                    || !Objects.equals(Integer.valueOf(1).equals(a.getFinalStep()),
                    Integer.valueOf(1).equals(b.getFinalStep()))
                    || !Objects.equals(trimJson(a.getFormSchemaJson()), trimJson(b.getFormSchemaJson()))
                    || !Objects.equals(trimJson(a.getIndicatorSchemaJson()), trimJson(b.getIndicatorSchemaJson()))) {
                return false;
            }
        }
        return true;
    }

    private String trimJson(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }

    private String firstText(String preferred, String fallback) {
        return StringUtils.hasText(preferred) ? preferred.trim() : trimJson(fallback);
    }

    public IPage<FeigeAuditTask> tasks(int pageNum, int pageSize, String taskType,
                                       String status, String keyword, String scopeType,
                                       String businessType, Long salesId, Integer stepNo,
                                       Boolean showCompleted) {
        if (StringUtils.hasText(taskType) && !TASK_TYPES.contains(taskType)) {
            throw new BusinessException("未知的审批任务类型");
        }
        if (StringUtils.hasText(status) && !Set.of(PENDING, APPROVED, REJECTED).contains(status)) {
            throw new BusinessException("未知的审批任务状态");
        }
        LambdaQueryWrapper<FeigeAuditTask> query = new LambdaQueryWrapper<>();
        query.eq(StringUtils.hasText(taskType), FeigeAuditTask::getTaskType, taskType)
                .eq(StringUtils.hasText(status), FeigeAuditTask::getTaskStatus, status)
                .eq(StringUtils.hasText(scopeType), FeigeAuditTask::getScopeType, scopeType)
                .eq(StringUtils.hasText(businessType), FeigeAuditTask::getBusinessTypeCode, businessType)
                .eq(salesId != null, FeigeAuditTask::getBusinessOwnerId, salesId)
                .eq(stepNo != null, FeigeAuditTask::getStepOrder, stepNo);
        if (!StringUtils.hasText(status) && Boolean.TRUE.equals(showCompleted)) {
            query.in(FeigeAuditTask::getTaskStatus, APPROVED, REJECTED);
        }
        if (StringUtils.hasText(keyword)) {
            query.and(w -> w.like(FeigeAuditTask::getCompanyName, keyword)
                    .or().like(FeigeAuditTask::getOrderNo, keyword)
                    .or().like(FeigeAuditTask::getTaskNo, keyword));
        }
        applyAuditScope(query);
        query.orderByDesc(FeigeAuditTask::getCreateTime);
        return taskMapper.selectPage(new Page<>(safePage(pageNum), safeSize(pageSize)), query);
    }

    public Map<String, Object> page(int pageNum, int pageSize, String taskType, String status,
                                    String keyword, String scopeType, String businessType,
                                    Long salesId, Integer stepNo, Boolean showCompleted) {
        IPage<FeigeAuditTask> page = tasks(pageNum, pageSize, taskType, status, keyword,
                scopeType, businessType, salesId, stepNo, showCompleted);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("records", page.getRecords().stream().map(task -> toView(task, false)).toList());
        result.put("total", page.getTotal());
        result.put("current", page.getCurrent());
        result.put("size", page.getSize());
        result.put("pages", page.getPages());
        return result;
    }

    public Map<String, Object> task(Long id) {
        return toView(requireVisibleTask(id), true);
    }

    public Map<String, Object> taskProcess(Long id) {
        FeigeAuditTask task = requireVisibleTask(id);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("task", task);
        result.put("steps", steps(task.getProcessId()));
        result.put("logs", logs(id));
        return result;
    }

    public List<FeigeTaskOperationLog> logs(Long id) {
        requireVisibleTask(id);
        return operationLogMapper.selectList(new LambdaQueryWrapper<FeigeTaskOperationLog>()
                .eq(FeigeTaskOperationLog::getDomainType, "audit")
                .eq(FeigeTaskOperationLog::getBusinessId, id)
                .orderByAsc(FeigeTaskOperationLog::getCreateTime));
    }

    public List<Map<String, Object>> payments(Long orderId) {
        requireVisibleLinkedOrderTasks(orderId);
        return paymentMapper.selectList(new LambdaQueryWrapper<FeigeOrderPayment>()
                        .eq(FeigeOrderPayment::getOrderId, orderId)
                        .orderByAsc(FeigeOrderPayment::getPaymentTime))
                .stream().map(payment -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("id", payment.getId());
                    row.put("orderId", payment.getOrderId());
                    row.put("amount", payment.getAmount());
                    row.put("paymentTime", payment.getPaymentTime());
                    row.put("paymentMethod", payment.getPaymentMethod());
                    row.put("status", payment.getStatus());
                    row.put("remark", payment.getRemarks());
                    return row;
                }).toList();
    }

    public List<Map<String, Object>> orderSteps(Long orderId) {
        return requireVisibleLinkedOrderTasks(orderId)
                .stream().map(task -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("id", task.getId());
                    row.put("name", task.getStepName() == null ? task.getProcessName() : task.getStepName());
                    row.put("sequence", task.getStepOrder());
                    row.put("status", task.getTaskStatus());
                    row.put("assigneeName", task.getAssignedUserName());
                    row.put("completedTime", task.getAuditTime());
                    row.put("comment", StringUtils.hasText(task.getAuditRemark())
                            ? task.getAuditRemark() : task.getRejectReason());
                    return row;
                }).toList();
    }

    @Transactional(rollbackFor = Exception.class)
    public Long createTask(FeigeTaskRequests.AuditTaskCreate request) {
        access.requireManager();
        String requestKey = idempotency.normalizeKey(request.getRequestKey());
        String requestFingerprint = requestKey == null ? null : idempotency.auditFingerprint(request);
        Long existingId = existingIdempotentTask(requestKey, requestFingerprint, false);
        if (existingId != null) {
            return existingId;
        }

        FeigeAuditProcess process = requireProcess(request.getProcessId());
        if (!Integer.valueOf(1).equals(process.getEnabled())) {
            throw new BusinessException("审批流程未启用");
        }
        List<FeigeAuditStep> steps = steps(process.getId());
        if (steps.isEmpty()) {
            throw new BusinessException("审批流程没有步骤");
        }

        FeigeOrder order = null;
        if (request.getOrderId() != null) {
            order = orderMapper.selectById(request.getOrderId());
            if (order == null) {
                throw new BusinessException("关联飞哥订单不存在或不属于当前租户");
            }
            if (!dataScopeHelper.canAccess(order.getSalesmanId(), order.getDeptId())) {
                throw new AccessDeniedException("无权关联该飞哥订单");
            }
            if (!StringUtils.hasText(order.getCompanyName())) {
                throw new BusinessException("关联订单缺少客户名称，不能创建审批任务");
            }
        }

        if (order == null && !StringUtils.hasText(request.getCompanyName())) {
            throw new BusinessException("未关联订单时必须填写客户名称");
        }
        Long ownerId = order == null ? request.getBusinessOwnerId() : order.getSalesmanId();
        if (order != null && ownerId == null) {
            throw new BusinessException("关联订单缺少销售负责人，不能创建审批任务");
        }
        SysUser owner = ownerId == null ? access.currentUser() : access.requireVisibleActiveUser(ownerId);
        String ownerName = order != null && StringUtils.hasText(order.getSalesmanName())
                ? order.getSalesmanName() : access.displayName(owner);
        if (StringUtils.hasText(request.getScopeType())
                && !Set.of("personal", "team").contains(request.getScopeType())) {
            throw new BusinessException("任务范围仅支持 personal/team");
        }
        validateMonthRange(request.getStartMonth(), request.getEndMonth());
        SysUser servicePerson = request.getServicePersonId() == null
                ? null : access.requireVisibleActiveUser(request.getServicePersonId());

        FeigeAuditTask task = new FeigeAuditTask();
        task.setRequestKey(requestKey);
        task.setRequestFingerprint(requestFingerprint);
        task.setTaskNo(nextTaskNo());
        task.setOrderId(order == null ? null : order.getId());
        task.setOrderNo(order == null ? trimJson(request.getOrderNo()) : order.getOrderNo());
        task.setCompanyName(order == null ? request.getCompanyName().trim() : order.getCompanyName());
        task.setTaskType(process.getTaskType());
        task.setBusinessTypeCode(order == null
                ? firstText(request.getBusinessTypeCode(), process.getBusinessTypeCode())
                : firstText(order.getBusinessType(), process.getBusinessTypeCode()));
        task.setBusinessTypeName(order == null ? trimJson(request.getBusinessTypeName()) : order.getBusinessType());
        task.setProcessId(process.getId());
        task.setProcessCode(process.getProcessCode());
        task.setProcessName(process.getProcessName());
        task.setTotalSteps(steps.size());
        task.setTaskStatus(PENDING);
        task.setBusinessOwnerId(owner.getId());
        task.setBusinessOwnerName(ownerName);
        task.setDeptId(order == null ? owner.getDeptId() : order.getDeptId());
        task.setScopeType(request.getScopeType());
        task.setTeamName(order == null ? trimJson(request.getTeamName()) : order.getTeamName());
        task.setRegion(order == null ? trimJson(request.getRegion()) : order.getRegion());
        task.setAmount(order == null ? request.getAmount()
                : order.getContractAmount() == null ? order.getOrderAmount() : order.getContractAmount());
        task.setExpenseAmount(request.getExpenseAmount());
        task.setStartMonth(request.getStartMonth());
        task.setEndMonth(request.getEndMonth());
        task.setServicePersonId(servicePerson == null ? null : servicePerson.getId());
        task.setServicePersonName(servicePerson == null ? null : access.displayName(servicePerson));
        task.setRemarks(request.getRemarks());
        task.setFinalConfirm(Integer.valueOf(1).equals(request.getFinalConfirm()) ? 1 : 0);
        task.setProcessSnapshotJson(snapshot(process, steps));
        applyStep(task, steps.get(0));
        try {
            if (taskMapper.insert(task) <= 0) {
                throw new BusinessException("审批任务创建失败");
            }
        } catch (DuplicateKeyException e) {
            Long concurrentId = existingIdempotentTask(requestKey, requestFingerprint, true);
            if (concurrentId != null) {
                return concurrentId;
            }
            throw e;
        }
        access.log("audit", task.getId(), "create", null, PENDING,
                "创建" + process.getTaskType() + "审批任务", null);
        return task.getId();
    }

    private Long existingIdempotentTask(String requestKey, String requestFingerprint, boolean forUpdate) {
        if (requestKey == null) {
            return null;
        }
        LambdaQueryWrapper<FeigeAuditTask> query = new LambdaQueryWrapper<FeigeAuditTask>()
                .eq(FeigeAuditTask::getRequestKey, requestKey)
                .last(forUpdate ? "LIMIT 1 FOR UPDATE" : "LIMIT 1");
        FeigeAuditTask existing = taskMapper.selectOne(query);
        if (existing == null) {
            return null;
        }
        if (!Objects.equals(existing.getRequestFingerprint(), requestFingerprint)) {
            throw new BusinessException(409, "requestKey已用于其他审批任务请求");
        }
        return existing.getId();
    }

    @Transactional(rollbackFor = Exception.class)
    public void review(Long id, FeigeTaskRequests.AuditReview request) {
        reviewInternal(id, request, false);
    }

    @Transactional(rollbackFor = Exception.class)
    public void reassignSpecialist(Long id, Long servicePersonId) {
        access.requireManager();
        FeigeAuditTask task = requireVisibleTask(id);
        if (!"special".equals(task.getTaskType())) {
            throw new BusinessException("只有专项任务可以调整专项服务人员");
        }
        if (!PENDING.equals(task.getTaskStatus())) {
            throw new BusinessException(409, "只有待审核专项任务可以调整服务人员");
        }
        SysUser specialist = access.requireVisibleActiveUser(servicePersonId);
        task.setServicePersonId(specialist.getId());
        task.setServicePersonName(access.displayName(specialist));
        updateOrConflict(task);
        access.log("audit", id, "reassign_specialist", PENDING, PENDING,
                "调整专项服务人员", null);
    }

    @Transactional(rollbackFor = Exception.class)
    public int batchReview(FeigeTaskRequests.BatchAuditReview request) {
        access.requireManager();
        LinkedHashSet<Long> ids = new LinkedHashSet<>(request.getTaskIds());
        if (ids.size() != request.getTaskIds().size()) {
            throw new BusinessException("批量任务中存在重复ID");
        }
        for (Long id : ids) {
            reviewInternal(id, request, true);
        }
        return ids.size();
    }

    @Transactional(rollbackFor = Exception.class)
    public void resubmit(Long id) {
        FeigeAuditTask task = requireVisibleTask(id);
        if (!REJECTED.equals(task.getTaskStatus())) {
            throw new BusinessException(409, "只有已驳回任务可以重新提交");
        }
        boolean owner = Objects.equals(task.getBusinessOwnerId(), access.currentUserId());
        if (!owner) {
            access.requireManager();
            if (!access.canAccess(task.getBusinessOwnerId(), task.getDeptId())) {
                throw new AccessDeniedException("无权重新提交该任务");
            }
        }
        List<FeigeAuditStep> steps = steps(task.getProcessId());
        if (steps.isEmpty()) {
            throw new BusinessException("审批流程已无可用步骤");
        }
        task.setTaskStatus(PENDING);
        task.setAuditResult(null);
        task.setAuditDataJson(null);
        task.setAuditRemark(null);
        task.setRejectReason(null);
        task.setAuditTime(null);
        task.setAuditUserId(null);
        task.setAuditUserName(null);
        task.setTotalSteps(steps.size());
        applyStep(task, steps.get(0));
        updateOrConflict(task);
        access.log("audit", id, "resubmit", REJECTED, PENDING, "重新提交审批任务", null);
    }

    private void reviewInternal(Long id, FeigeTaskRequests.AuditReview request, boolean batch) {
        FeigeAuditTask task = requireVisibleTask(id);
        if (!PENDING.equals(task.getTaskStatus())) {
            throw new BusinessException(409, "任务已处理，请刷新后重试");
        }
        FeigeAuditStep currentStep = stepMapper.selectById(task.getStepId());
        if (currentStep == null || !Objects.equals(currentStep.getProcessId(), task.getProcessId())) {
            throw new BusinessException("当前审批步骤已失效");
        }
        if (batch && !Integer.valueOf(1).equals(currentStep.getAllowBatch())) {
            throw new BusinessException("当前步骤不允许批量审核");
        }
        requireAuditor(task);

        String result = request.getResult();
        if (!StringUtils.hasText(result) || !Set.of(APPROVED, REJECTED, RETURNED).contains(result)) {
            throw new BusinessException("审核结果仅支持 approved/rejected/returned");
        }
        if (Set.of(REJECTED, RETURNED).contains(result)
                && !StringUtils.hasText(request.getRejectReason())) {
            throw new BusinessException("驳回或退回时必须填写原因");
        }
        FeigeAuditStep next = APPROVED.equals(result)
                ? nextStep(task.getProcessId(), task.getStepOrder()) : null;
        boolean terminalApproval = APPROVED.equals(result)
                && next == null
                && Integer.valueOf(1).equals(currentStep.getFinalStep())
                && Objects.equals(task.getStepOrder(), task.getTotalSteps());
        validateAuditRequest(task, currentStep, request, result, terminalApproval, batch);

        Integer reviewedStepOrder = task.getStepOrder();
        String reviewedStepName = task.getStepName();
        String evidenceJson = auditPayload(task, currentStep, request, result);
        task.setAuditResult(result);
        task.setAuditDataJson(evidenceJson);
        task.setAuditRemark(request.getRemark());
        task.setRejectReason(request.getRejectReason());
        task.setAuditTime(LocalDateTime.now());
        task.setAuditUserId(access.currentUserId());
        task.setAuditUserName(access.currentUserName());

        String finalStatus;
        Long convertedContractId = null;
        if (APPROVED.equals(result)) {
            if (next == null) {
                finalStatus = APPROVED;
                task.setTaskStatus(APPROVED);
                if (Boolean.TRUE.equals(request.getConvertContract())) {
                    convertedContractId = contractConversionService.ensureContractFromApprovedTask(task.getOrderId());
                    if (convertedContractId == null) {
                        throw new BusinessException("合同转换未返回有效合同，审批未完成");
                    }
                }
            } else {
                finalStatus = PENDING;
                task.setTaskStatus(PENDING);
                task.setAuditResult(null);
                task.setAuditDataJson(null);
                task.setAuditRemark(null);
                task.setRejectReason(null);
                task.setAuditTime(null);
                task.setAuditUserId(null);
                task.setAuditUserName(null);
                applyStep(task, next);
                if (request.getNextAuditorId() != null && !isFinalConfirmStep(task)) {
                    SysUser nextAuditor = access.requireVisibleActiveUserInRole(
                            request.getNextAuditorId(), next.getRequiredRoleKey());
                    task.setAssignedUserId(nextAuditor.getId());
                    task.setAssignedUserName(access.displayName(nextAuditor));
                }
            }
        } else {
            finalStatus = REJECTED;
            task.setTaskStatus(REJECTED);
        }
        updateOrConflict(task);
        String detail = "审批步骤" + reviewedStepOrder + "：" + reviewedStepName
                + (convertedContractId == null ? "" : "；合同转换已完成");
        access.log("audit", id, "review_" + result, PENDING, finalStatus,
                detail, evidenceJson);
    }

    private void requireAuditor(FeigeAuditTask task) {
        Long current = access.currentUserId();
        if (isFinalConfirmStep(task)) {
            if (!Objects.equals(task.getBusinessOwnerId(), current)) {
                throw new AccessDeniedException("最终确认必须由业务负责人本人处理");
            }
            return;
        }
        if (SecurityUtils.isCurrentAdmin()) {
            return;
        }
        if (task.getAssignedUserId() != null && Objects.equals(task.getAssignedUserId(), current)) {
            return;
        }
        if (task.getAssignedUserId() == null && access.hasCurrentRole(task.getRequiredRoleKey())) {
            if (!access.canClaimDepartment(task.getDeptId())) {
                throw new AccessDeniedException("审批任务不在当前部门数据范围内");
            }
            return;
        }
        throw new AccessDeniedException("当前用户不是该步骤的审批人");
    }

    private FeigeAuditTask requireVisibleTask(Long id) {
        FeigeAuditTask task = taskMapper.selectById(id);
        if (task == null) {
            throw new BusinessException("审批任务不存在或不属于当前租户");
        }
        if (!isVisibleTask(task)) {
            throw new AccessDeniedException("无权访问该审批任务");
        }
        return task;
    }

    private boolean isVisibleTask(FeigeAuditTask task) {
        Long current = access.currentUserId();
        return Objects.equals(task.getBusinessOwnerId(), current)
                || Objects.equals(task.getAssignedUserId(), current)
                || (access.hasCurrentRole(task.getRequiredRoleKey())
                && access.canClaimDepartment(task.getDeptId()))
                || access.canAccess(task.getBusinessOwnerId(), task.getDeptId());
    }

    private List<FeigeAuditTask> requireVisibleLinkedOrderTasks(Long orderId) {
        if (orderId == null) {
            throw new BusinessException("缺少订单ID");
        }
        FeigeOrder order = orderMapper.selectById(orderId);
        if (order == null) {
            throw new BusinessException("飞哥订单不存在或不属于当前租户");
        }
        List<FeigeAuditTask> visible = taskMapper.selectList(new LambdaQueryWrapper<FeigeAuditTask>()
                        .eq(FeigeAuditTask::getOrderId, orderId)
                        .orderByAsc(FeigeAuditTask::getCreateTime))
                .stream().filter(this::isVisibleTask).toList();
        if (visible.isEmpty()) {
            throw new AccessDeniedException("无权查看该订单的审批信息");
        }
        return visible;
    }

    private void applyAuditScope(LambdaQueryWrapper<FeigeAuditTask> query) {
        if (SecurityUtils.isCurrentAdmin() || Integer.valueOf(1).equals(SecurityUtils.getCurrentDataScope())) {
            return;
        }
        Integer scope = SecurityUtils.getCurrentDataScope();
        if (Integer.valueOf(3).equals(scope) || Integer.valueOf(4).equals(scope)) {
            dataScopeHelper.apply(query, FeigeAuditTask::getBusinessOwnerId, FeigeAuditTask::getDeptId);
            return;
        }
        Long userId = access.currentUserId();
        List<String> roleKeys = SecurityUtils.getCurrentRoleKeys();
        Long deptId = SecurityUtils.getCurrentDeptId();
        query.and(w -> {
            w.eq(FeigeAuditTask::getBusinessOwnerId, userId)
                    .or().eq(FeigeAuditTask::getAssignedUserId, userId);
            if (!roleKeys.isEmpty() && deptId != null) {
                w.or(x -> x.in(FeigeAuditTask::getRequiredRoleKey, roleKeys)
                        .eq(FeigeAuditTask::getDeptId, deptId));
            }
        });
    }

    private void validateProcessRequest(FeigeTaskRequests.AuditProcessUpsert request, Long currentId) {
        if (!TASK_TYPES.contains(request.getTaskType())) {
            throw new BusinessException("任务类型仅支持 once/recurring/project_dept/special");
        }
        long duplicate = processMapper.selectCount(new LambdaQueryWrapper<FeigeAuditProcess>()
                .eq(FeigeAuditProcess::getProcessCode, request.getProcessCode().trim())
                .ne(currentId != null, FeigeAuditProcess::getId, currentId));
        if (duplicate > 0) {
            throw new BusinessException("流程编码已存在");
        }
        if ("special".equals(request.getTaskType())) {
            if (!StringUtils.hasText(request.getBusinessTypeCode())) {
                throw new BusinessException("专项流程必须填写专项类型编码");
            }
            long duplicateSpecialType = processMapper.selectCount(new LambdaQueryWrapper<FeigeAuditProcess>()
                    .eq(FeigeAuditProcess::getTaskType, "special")
                    .eq(FeigeAuditProcess::getBusinessTypeCode, request.getBusinessTypeCode().trim())
                    .ne(currentId != null, FeigeAuditProcess::getId, currentId));
            if (duplicateSpecialType > 0) {
                throw new BusinessException("专项类型编码已存在");
            }
        }
        List<FeigeTaskRequests.AuditStep> sorted = new ArrayList<>(request.getSteps());
        sorted.sort(java.util.Comparator.comparing(FeigeTaskRequests.AuditStep::getStepOrder));
        for (int i = 0; i < sorted.size(); i++) {
            FeigeTaskRequests.AuditStep step = sorted.get(i);
            if (!Objects.equals(step.getStepOrder(), i + 1)) {
                throw new BusinessException("审批步骤必须从1开始且连续");
            }
            if (!ASSIGNEE_MODES.contains(step.getAssigneeMode())) {
                throw new BusinessException("审批人模式仅支持 role/specific/owner");
            }
            if ("role".equals(step.getAssigneeMode())) {
                access.requireActiveRoleKey(step.getRequiredRoleKey());
            } else if ("specific".equals(step.getAssigneeMode())) {
                access.requireVisibleActiveUser(step.getRequiredUserId());
            }
            boolean shouldBeFinal = i == sorted.size() - 1;
            if (Integer.valueOf(1).equals(step.getFinalStep()) != shouldBeFinal) {
                throw new BusinessException("只有最后一个审批步骤可以标记为最终步骤");
            }
            validateFormSchema(step.getFormSchemaJson());
            validateIndicatorSchema(step.getIndicatorSchemaJson());
            if (!shouldBeFinal && indicatorTypes(step.getIndicatorSchemaJson()).contains("convert_contract")) {
                throw new BusinessException("合同转换只能配置在最终审批步骤");
            }
        }
    }

    private void validateFormSchema(String schemaJson) {
        Set<String> codes = new LinkedHashSet<>();
        for (Map<String, Object> field : strictMapList(schemaJson, "审批表单配置")) {
            String code = text(field.get("code"));
            String label = text(field.get("label"));
            String type = text(field.get("fieldType"));
            if (!StringUtils.hasText(code) || !code.matches("^[a-z][a-z0-9_]{0,39}$")) {
                throw new BusinessException("审批表单字段编码格式不正确");
            }
            if (!codes.add(code)) {
                throw new BusinessException("审批表单字段编码不能重复");
            }
            if (!StringUtils.hasText(label)) {
                throw new BusinessException("审批表单字段名称不能为空");
            }
            if (!FORM_FIELD_TYPES.contains(type)) {
                throw new BusinessException("审批表单字段类型不受支持：" + code);
            }
            Object required = field.get("required");
            if (required != null && !(required instanceof Boolean)) {
                throw new BusinessException("审批表单 required 必须是布尔值：" + code);
            }
            if ("select".equals(type)) {
                validateSelectOptions(field.get("options"), code);
            }
            if (field.get("precision") != null && (!(field.get("precision") instanceof Number precision)
                    || precision.intValue() < 0 || precision.intValue() > 10)) {
                throw new BusinessException("审批表单精度必须是0到10的整数：" + code);
            }
            if (field.get("min") != null) {
                decimal(field.get("min"), "字段最小值 " + code);
            }
        }
    }

    private void validateIndicatorSchema(String schemaJson) {
        Set<String> types = new LinkedHashSet<>();
        for (Map<String, Object> indicator : strictMapList(schemaJson, "审批指标配置")) {
            String type = text(indicator.get("indicatorType"));
            if (!INDICATOR_TYPES.contains(type)) {
                throw new BusinessException("审批指标类型不受支持");
            }
            if (!types.add(type)) {
                throw new BusinessException("同一步骤不能重复配置审批指标：" + type);
            }
        }
    }

    private void validateSelectOptions(Object rawOptions, String code) {
        if (!(rawOptions instanceof List<?> options) || options.isEmpty()) {
            throw new BusinessException("下拉字段必须配置选项：" + code);
        }
        Set<String> values = new LinkedHashSet<>();
        for (Object raw : options) {
            if (!(raw instanceof Map<?, ?> option) || option.get("value") == null
                    || !StringUtils.hasText(text(option.get("label")))) {
                throw new BusinessException("下拉字段选项必须包含 label/value：" + code);
            }
            if (!values.add(String.valueOf(option.get("value")))) {
                throw new BusinessException("下拉字段选项值不能重复：" + code);
            }
        }
    }

    private void copyProcess(FeigeAuditProcess target, FeigeTaskRequests.AuditProcessUpsert source) {
        target.setProcessCode(source.getProcessCode().trim());
        target.setProcessName(source.getProcessName().trim());
        target.setTaskType(source.getTaskType());
        target.setBusinessTypeCode(trimJson(source.getBusinessTypeCode()));
        target.setDescription(source.getDescription());
        target.setEnabled(Integer.valueOf(0).equals(source.getEnabled()) ? 0 : 1);
    }

    private void replaceSteps(Long processId, List<FeigeTaskRequests.AuditStep> requests) {
        stepMapper.delete(new LambdaQueryWrapper<FeigeAuditStep>()
                .eq(FeigeAuditStep::getProcessId, processId));
        requests.stream()
                .sorted(java.util.Comparator.comparing(FeigeTaskRequests.AuditStep::getStepOrder))
                .forEach(request -> {
                    FeigeAuditStep step = new FeigeAuditStep();
                    step.setProcessId(processId);
                    step.setStepOrder(request.getStepOrder());
                    step.setStepName(request.getStepName());
                    step.setRequiredRoleKey(request.getRequiredRoleKey());
                    step.setAssigneeMode(request.getAssigneeMode());
                    step.setRequiredUserId(request.getRequiredUserId());
                    step.setAllowBatch(Integer.valueOf(1).equals(request.getAllowBatch()) ? 1 : 0);
                    step.setFinalStep(Integer.valueOf(1).equals(request.getFinalStep()) ? 1 : 0);
                    step.setFormSchemaJson(request.getFormSchemaJson());
                    step.setIndicatorSchemaJson(request.getIndicatorSchemaJson());
                    if (stepMapper.insert(step) <= 0) {
                        throw new BusinessException("审批步骤保存失败");
                    }
                });
    }

    private void applyStep(FeigeAuditTask task, FeigeAuditStep step) {
        task.setStepId(step.getId());
        task.setStepOrder(step.getStepOrder());
        task.setStepName(step.getStepName());
        task.setRequiredRoleKey(step.getRequiredRoleKey());
        task.setAssignedUserId(null);
        task.setAssignedUserName(null);
        if (isFinalConfirmStep(task)) {
            SysUser assigned = access.requireActiveUserInTenant(task.getBusinessOwnerId());
            task.setAssignedUserId(assigned.getId());
            task.setAssignedUserName(access.displayName(assigned));
        } else if ("specific".equals(step.getAssigneeMode())) {
            SysUser assigned = access.requireActiveUserInTenant(step.getRequiredUserId());
            task.setAssignedUserId(assigned.getId());
            task.setAssignedUserName(access.displayName(assigned));
        } else if ("owner".equals(step.getAssigneeMode())) {
            SysUser assigned = access.requireActiveUserInTenant(task.getBusinessOwnerId());
            task.setAssignedUserId(assigned.getId());
            task.setAssignedUserName(access.displayName(assigned));
        }
    }

    private FeigeAuditStep nextStep(Long processId, Integer currentOrder) {
        return stepMapper.selectOne(new LambdaQueryWrapper<FeigeAuditStep>()
                .eq(FeigeAuditStep::getProcessId, processId)
                .gt(FeigeAuditStep::getStepOrder, currentOrder)
                .orderByAsc(FeigeAuditStep::getStepOrder)
                .last("LIMIT 1"));
    }

    private List<FeigeAuditStep> steps(Long processId) {
        return stepMapper.selectList(new LambdaQueryWrapper<FeigeAuditStep>()
                .eq(FeigeAuditStep::getProcessId, processId)
                .orderByAsc(FeigeAuditStep::getStepOrder));
    }

    private FeigeAuditProcess requireProcess(Long id) {
        FeigeAuditProcess process = processMapper.selectById(id);
        if (process == null) {
            throw new BusinessException("审批流程不存在或不属于当前租户");
        }
        return process;
    }

    private String snapshot(FeigeAuditProcess process, List<FeigeAuditStep> steps) {
        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("processCode", process.getProcessCode());
        snapshot.put("processName", process.getProcessName());
        snapshot.put("taskType", process.getTaskType());
        snapshot.put("businessTypeCode", process.getBusinessTypeCode());
        snapshot.put("steps", steps);
        try {
            return objectMapper.writeValueAsString(snapshot);
        } catch (JsonProcessingException e) {
            throw new BusinessException("审批流程快照生成失败");
        }
    }

    private void validateAuditRequest(FeigeAuditTask task, FeigeAuditStep step,
                                      FeigeTaskRequests.AuditReview request,
                                      String result, boolean terminalApproval, boolean batch) {
        if (Boolean.TRUE.equals(request.getConvertAddress())) {
            throw new BusinessException(409, "地址转换尚未接入飞哥订单业务域，不能执行该动作");
        }
        validateFormSchema(step.getFormSchemaJson());
        validateIndicatorSchema(step.getIndicatorSchemaJson());
        Set<String> indicators = indicatorTypes(step.getIndicatorSchemaJson());
        if (Boolean.TRUE.equals(request.getConvertContract())) {
            if (batch) {
                throw new BusinessException(409, "合同转换不支持批量审批，请逐单处理");
            }
            if (!APPROVED.equals(result)) {
                throw new BusinessException(409, "只有审批通过时才能转换合同");
            }
            if (!indicators.contains("convert_contract")) {
                throw new BusinessException(409, "当前审批步骤未配置合同转换");
            }
            if (!terminalApproval) {
                throw new BusinessException(409, "合同转换只能在最终审批通过时执行");
            }
            if (task.getOrderId() == null) {
                throw new BusinessException(409, "合同转换必须关联飞哥订单");
            }
        }
        Map<String, Object> values = request.getFormData() == null
                ? new LinkedHashMap<>() : new LinkedHashMap<>(request.getFormData());
        for (Map<String, Object> field : strictMapList(step.getFormSchemaJson(), "审批表单配置")) {
            String code = text(field.get("code"));
            String label = text(field.get("label"));
            String type = text(field.get("fieldType"));
            boolean present = values.containsKey(code);
            Object value = values.remove(code);
            if (APPROVED.equals(result) && Boolean.TRUE.equals(field.get("required"))
                    && (!present || value == null || (value instanceof String s && !StringUtils.hasText(s)))) {
                throw new BusinessException("请填写审批字段：" + label);
            }
            if (value == null) {
                continue;
            }
            validateFormValue(field, code, label, type, value);
        }
        if (!values.isEmpty()) {
            throw new BusinessException("审批表单包含流程未定义字段：" + values.keySet().iterator().next());
        }
        if (request.getCostItems() != null) {
            for (Map<String, Object> item : request.getCostItems()) {
                if (!StringUtils.hasText(text(item.get("expenseName")))) {
                    throw new BusinessException("成本项报销名称不能为空");
                }
                BigDecimal amount = decimal(item.get("amount"), "成本项金额");
                if (amount.signum() <= 0) {
                    throw new BusinessException("成本项金额必须大于0");
                }
                if (item.get("categoryName") != null && !(item.get("categoryName") instanceof String)
                        || item.get("remark") != null && !(item.get("remark") instanceof String)) {
                    throw new BusinessException("成本项类目和备注必须是文本");
                }
            }
        }
        if (APPROVED.equals(result) && indicators.contains("cost_input")
                && (request.getCostItems() == null || request.getCostItems().isEmpty())) {
            throw new BusinessException("当前步骤必须填写成本项");
        }
    }

    private Set<String> indicatorTypes(String schemaJson) {
        return strictMapList(schemaJson, "审批指标配置").stream()
                .map(item -> text(item.get("indicatorType")))
                .collect(java.util.stream.Collectors.toCollection(LinkedHashSet::new));
    }

    private void validateFormValue(Map<String, Object> field, String code, String label,
                                   String type, Object value) {
        switch (type) {
            case "text", "textarea" -> {
                if (!(value instanceof String textValue)) {
                    throw new BusinessException("审批字段必须是文本：" + label);
                }
                if (textValue.length() > 10000) {
                    throw new BusinessException("审批字段内容过长：" + label);
                }
            }
            case "number" -> {
                BigDecimal number = decimal(value, label);
                if (field.get("min") != null
                        && number.compareTo(decimal(field.get("min"), label + "最小值")) < 0) {
                    throw new BusinessException("审批字段小于允许值：" + label);
                }
                if (field.get("precision") instanceof Number precision
                        && number.stripTrailingZeros().scale() > precision.intValue()) {
                    throw new BusinessException("审批字段小数位超过限制：" + label);
                }
            }
            case "select" -> {
                List<?> options = (List<?>) field.get("options");
                boolean allowed = options.stream().filter(Map.class::isInstance)
                        .map(Map.class::cast)
                        .anyMatch(option -> Objects.equals(String.valueOf(option.get("value")),
                                String.valueOf(value)));
                if (!allowed) {
                    throw new BusinessException("审批字段选项不合法：" + label);
                }
            }
            case "date" -> {
                if (!(value instanceof String dateValue)) {
                    throw new BusinessException("审批字段日期格式不正确：" + label);
                }
                try {
                    LocalDate.parse(dateValue);
                } catch (DateTimeParseException e) {
                    throw new BusinessException("审批字段日期格式应为 YYYY-MM-DD：" + label);
                }
            }
            case "datetime" -> {
                if (!(value instanceof String dateTimeValue)) {
                    throw new BusinessException("审批字段时间格式不正确：" + label);
                }
                try {
                    LocalDateTime.parse(dateTimeValue, FORM_DATE_TIME);
                } catch (DateTimeParseException e) {
                    throw new BusinessException("审批字段时间格式应为 YYYY-MM-DD HH:mm:ss：" + label);
                }
            }
            case "switch" -> {
                if (!(value instanceof Boolean)) {
                    throw new BusinessException("审批字段必须是布尔值：" + label);
                }
            }
            default -> throw new BusinessException("审批字段类型不受支持：" + code);
        }
    }

    private String auditPayload(FeigeAuditTask task, FeigeAuditStep step,
                                FeigeTaskRequests.AuditReview request, String result) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("result", result);
        payload.put("stepOrder", task.getStepOrder());
        payload.put("stepName", step.getStepName());
        payload.put("auditorId", access.currentUserId());
        payload.put("auditorName", access.currentUserName());
        payload.put("formData", request.getFormData());
        payload.put("costItems", request.getCostItems());
        payload.put("convertContract", request.getConvertContract());
        payload.put("convertAddress", request.getConvertAddress());
        payload.put("remark", request.getRemark());
        payload.put("rejectReason", request.getRejectReason());
        if (StringUtils.hasText(request.getAuditDataJson())) {
            payload.put("legacyAuditDataJson", request.getAuditDataJson());
        }
        try {
            return objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException e) {
            throw new BusinessException("审批表单序列化失败");
        }
    }

    private Map<String, Object> toView(FeigeAuditTask task, boolean detail) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", task.getId());
        row.put("taskType", task.getTaskType());
        row.put("orderId", task.getOrderId());
        row.put("orderNo", task.getOrderNo());
        row.put("companyName", task.getCompanyName());
        row.put("businessType", StringUtils.hasText(task.getBusinessTypeName())
                ? task.getBusinessTypeName() : task.getBusinessTypeCode());
        row.put("processName", task.getProcessName());
        row.put("stepName", task.getStepName());
        row.put("stepNo", task.getStepOrder());
        row.put("stepCount", task.getTotalSteps());
        row.put("status", task.getTaskStatus());
        row.put("auditResult", task.getAuditResult());
        row.put("scopeType", task.getScopeType());
        row.put("salesId", task.getBusinessOwnerId());
        row.put("salesName", task.getBusinessOwnerName());
        row.put("assignedUserId", task.getAssignedUserId());
        row.put("assignedUserName", task.getAssignedUserName());
        row.put("servicePersonId", task.getServicePersonId());
        row.put("servicePersonName", task.getServicePersonName());
        row.put("teamName", task.getTeamName());
        row.put("region", task.getRegion());
        row.put("amount", task.getAmount());
        row.put("expenseAmount", task.getExpenseAmount());
        row.put("startMonth", task.getStartMonth());
        row.put("endMonth", task.getEndMonth());
        row.put("remarks", task.getRemarks());
        row.put("canChangeGsSpecialist", access.isManager()
                && "special".equals(task.getTaskType()) && PENDING.equals(task.getTaskStatus()));
        row.put("conversionSupported", false);
        row.put("createTime", task.getCreateTime());
        row.put("updateTime", task.getUpdateTime());
        if (detail) {
            Object decoded = readJson(task.getAuditDataJson());
            if (decoded instanceof Map<?, ?> decodedMap && decodedMap.containsKey("formData")) {
                row.put("formValues", decodedMap.get("formData"));
            } else {
                row.put("formValues", decoded);
            }
            FeigeAuditStep step = task.getStepId() == null ? null : stepMapper.selectById(task.getStepId());
            row.put("fields", step == null ? List.of() : jsonList(step.getFormSchemaJson()));
            row.put("indicators", step == null ? List.of() : jsonList(step.getIndicatorSchemaJson()));
            row.put("conversionSupported", step != null
                    && PENDING.equals(task.getTaskStatus())
                    && task.getOrderId() != null
                    && Objects.equals(task.getStepOrder(), task.getTotalSteps())
                    && indicatorTypes(step.getIndicatorSchemaJson()).contains("convert_contract"));
            row.put("isFinalConfirm", isFinalConfirmStep(task));
            row.put("auditAllowed", canAudit(task));
            row.put("logs", logs(task.getId()).stream().map(log -> {
                Map<String, Object> logRow = new LinkedHashMap<>();
                logRow.put("id", log.getId());
                logRow.put("action", log.getEventType());
                logRow.put("result", log.getToStatus());
                logRow.put("operatorName", log.getOperatorName());
                logRow.put("comment", log.getDetail());
                logRow.put("payload", readJson(log.getPayloadJson()));
                logRow.put("createTime", log.getCreateTime());
                return logRow;
            }).toList());
        }
        return row;
    }

    private boolean canAudit(FeigeAuditTask task) {
        if (!PENDING.equals(task.getTaskStatus())) {
            return false;
        }
        Long current = access.currentUserId();
        if (isFinalConfirmStep(task)) {
            return Objects.equals(task.getBusinessOwnerId(), current);
        }
        boolean candidate = SecurityUtils.isCurrentAdmin()
                || Objects.equals(task.getAssignedUserId(), current)
                || (task.getAssignedUserId() == null
                && access.hasCurrentRole(task.getRequiredRoleKey())
                && access.canClaimDepartment(task.getDeptId()));
        return candidate;
    }

    private boolean isFinalConfirmStep(FeigeAuditTask task) {
        return Integer.valueOf(1).equals(task.getFinalConfirm())
                && task.getStepOrder() != null
                && Objects.equals(task.getStepOrder(), task.getTotalSteps());
    }

    private Object readJson(String json) {
        if (!StringUtils.hasText(json)) {
            return null;
        }
        try {
            return objectMapper.readValue(json, Object.class);
        } catch (JsonProcessingException ignored) {
            return null;
        }
    }

    @SuppressWarnings("unchecked")
    private List<Object> jsonList(String json) {
        return new ArrayList<>((List<Object>) (List<?>) strictMapList(json, "审批配置"));
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> strictMapList(String json, String label) {
        if (!StringUtils.hasText(json)) {
            return List.of();
        }
        final Object decoded;
        try {
            decoded = objectMapper.readValue(json, Object.class);
        } catch (JsonProcessingException e) {
            throw new BusinessException(label + "不是有效JSON");
        }
        if (!(decoded instanceof List<?> list)) {
            throw new BusinessException(label + "必须是JSON数组");
        }
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object item : list) {
            if (!(item instanceof Map<?, ?> map)) {
                throw new BusinessException(label + "的每一项必须是对象");
            }
            result.add(new LinkedHashMap<>((Map<String, Object>) map));
        }
        return result;
    }

    private String text(Object value) {
        return value instanceof String text ? text : null;
    }

    private BigDecimal decimal(Object value, String label) {
        if (!(value instanceof Number) && !(value instanceof String)) {
            throw new BusinessException(label + "必须是有效数字");
        }
        try {
            return new BigDecimal(String.valueOf(value).trim());
        } catch (NumberFormatException e) {
            throw new BusinessException(label + "必须是有效数字");
        }
    }

    private void validateMonthRange(String startMonth, String endMonth) {
        YearMonth start = parseMonth(startMonth, "开始月份");
        YearMonth end = parseMonth(endMonth, "结束月份");
        if (start != null && end != null && end.isBefore(start)) {
            throw new BusinessException("结束月份不能早于开始月份");
        }
    }

    private YearMonth parseMonth(String value, String label) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        try {
            return YearMonth.parse(value);
        } catch (DateTimeParseException e) {
            throw new BusinessException(label + "格式应为 YYYY-MM");
        }
    }

    private void updateOrConflict(FeigeAuditTask task) {
        if (taskMapper.updateById(task) <= 0) {
            throw new BusinessException(409, "审批任务已被其他人更新，请刷新后重试");
        }
    }

    private String nextTaskNo() {
        return "FGA" + LocalDateTime.now().format(NUMBER_TIME)
                + String.format("%04d", ThreadLocalRandom.current().nextInt(10000));
    }

    private int safePage(Integer pageNum) {
        return pageNum == null || pageNum < 1 ? 1 : pageNum;
    }

    private int safeSize(Integer pageSize) {
        return pageSize == null ? 20 : Math.max(1, Math.min(pageSize, 200));
    }
}
