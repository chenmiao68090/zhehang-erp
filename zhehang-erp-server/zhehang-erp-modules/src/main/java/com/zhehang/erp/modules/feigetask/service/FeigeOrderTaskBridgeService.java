package com.zhehang.erp.modules.feigetask.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.feigeorder.domain.entity.FeigeOrder;
import com.zhehang.erp.modules.feigeorder.mapper.FeigeOrderMapper;
import com.zhehang.erp.modules.feigetask.domain.dto.FeigeTaskRequests;
import com.zhehang.erp.modules.feigetask.domain.entity.FeigeAuditProcess;
import com.zhehang.erp.modules.feigetask.domain.entity.FeigeAuditStep;
import com.zhehang.erp.modules.feigetask.domain.entity.FeigeAuditTask;
import com.zhehang.erp.modules.feigetask.domain.entity.FeigeBusinessTask;
import com.zhehang.erp.modules.feigetask.domain.entity.FeigeOrderTaskBridgeRule;
import com.zhehang.erp.modules.feigetask.domain.entity.FeigeOrderTaskBridgeRun;
import com.zhehang.erp.modules.feigetask.domain.entity.FeigeTaskOperationLog;
import com.zhehang.erp.modules.feigetask.mapper.FeigeAuditProcessMapper;
import com.zhehang.erp.modules.feigetask.mapper.FeigeAuditStepMapper;
import com.zhehang.erp.modules.feigetask.mapper.FeigeAuditTaskMapper;
import com.zhehang.erp.modules.feigetask.mapper.FeigeBusinessTaskMapper;
import com.zhehang.erp.modules.feigetask.mapper.FeigeOrderTaskBridgeRuleMapper;
import com.zhehang.erp.modules.feigetask.mapper.FeigeOrderTaskBridgeRunMapper;
import com.zhehang.erp.modules.feigetask.mapper.FeigeTaskOperationLogMapper;
import com.zhehang.erp.modules.system.domain.entity.SysRole;
import com.zhehang.erp.modules.system.domain.entity.SysUser;
import com.zhehang.erp.modules.system.mapper.SysRoleMapper;
import com.zhehang.erp.modules.system.mapper.SysUserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * V202 订单到 V203 任务域的隔离桥接。订单事务只写幂等运行记录；后台消费者使用显式 tenant_id，
 * 不依赖定时线程中不存在的登录上下文，也不调用要求当前经理身份的公开创建方法。
 */
@Service
@RequiredArgsConstructor
public class FeigeOrderTaskBridgeService {

    public static final String ORDER_CREATED = "order_created";
    public static final String FINANCE_APPROVED = "finance_approved";

    private static final Set<String> TRIGGERS = Set.of(ORDER_CREATED, FINANCE_APPROVED);
    private static final Set<String> TARGETS = Set.of("business", "once", "recurring", "project_dept", "special");
    private static final Set<String> AUDIT_TARGETS = Set.of("once", "recurring", "project_dept", "special");
    private static final Set<String> RETRYABLE = Set.of("failed", "dead", "skipped");
    private static final int MAX_ATTEMPTS = 5;

    private final FeigeOrderTaskBridgeRuleMapper ruleMapper;
    private final FeigeOrderTaskBridgeRunMapper runMapper;
    private final FeigeOrderMapper orderMapper;
    private final FeigeBusinessTaskMapper businessTaskMapper;
    private final FeigeAuditProcessMapper processMapper;
    private final FeigeAuditStepMapper stepMapper;
    private final FeigeAuditTaskMapper auditTaskMapper;
    private final FeigeTaskOperationLogMapper operationLogMapper;
    private final SysUserMapper userMapper;
    private final SysRoleMapper roleMapper;
    private final DataScopeHelper dataScopeHelper;
    private final FeigeTaskAccessService access;
    private final ObjectMapper objectMapper;

    public List<Map<String, Object>> rules(Boolean enabled, String triggerEvent,
                                           String targetTaskType) {
        access.requireBridgeManager();
        validateOptionalTrigger(triggerEvent);
        validateOptionalTarget(targetTaskType);
        List<FeigeOrderTaskBridgeRule> rules = ruleMapper.selectList(new LambdaQueryWrapper<FeigeOrderTaskBridgeRule>()
                .eq(enabled != null, FeigeOrderTaskBridgeRule::getEnabled, Boolean.TRUE.equals(enabled) ? 1 : 0)
                .eq(StringUtils.hasText(triggerEvent), FeigeOrderTaskBridgeRule::getTriggerEvent, triggerEvent)
                .eq(StringUtils.hasText(targetTaskType), FeigeOrderTaskBridgeRule::getTargetTaskType, targetTaskType)
                .orderByAsc(FeigeOrderTaskBridgeRule::getTriggerEvent)
                .orderByAsc(FeigeOrderTaskBridgeRule::getRuleName));
        List<Long> processIds = rules.stream().map(FeigeOrderTaskBridgeRule::getProcessId)
                .filter(Objects::nonNull).distinct().toList();
        Map<Long, String> processNames = processIds.isEmpty() ? Map.of()
                : processMapper.selectList(new LambdaQueryWrapper<FeigeAuditProcess>()
                        .select(FeigeAuditProcess::getId, FeigeAuditProcess::getProcessName)
                        .in(FeigeAuditProcess::getId, processIds))
                .stream().collect(Collectors.toMap(FeigeAuditProcess::getId,
                        FeigeAuditProcess::getProcessName, (a, b) -> a));
        return rules.stream().map(rule -> ruleView(rule, processNames.get(rule.getProcessId()))).toList();
    }

    @Transactional(rollbackFor = Exception.class)
    public Long createRule(FeigeTaskRequests.BridgeRuleUpsert request) {
        access.requireBridgeManager();
        validateRule(request, null);
        FeigeOrderTaskBridgeRule rule = new FeigeOrderTaskBridgeRule();
        copyRule(rule, request);
        if (ruleMapper.insert(rule) <= 0) {
            throw new BusinessException("桥接规则创建失败");
        }
        return rule.getId();
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateRule(Long id, FeigeTaskRequests.BridgeRuleUpsert request) {
        access.requireBridgeManager();
        FeigeOrderTaskBridgeRule rule = requireRule(id);
        validateRule(request, id);
        long runCount = runMapper.selectCount(new LambdaQueryWrapper<FeigeOrderTaskBridgeRun>()
                .eq(FeigeOrderTaskBridgeRun::getRuleId, id));
        if (runCount > 0 && (!Objects.equals(rule.getRuleCode(), request.getRuleCode().trim())
                || !Objects.equals(rule.getTriggerEvent(), request.getTriggerEvent())
                || !Objects.equals(rule.getTargetTaskType(), request.getTargetTaskType()))) {
            throw new BusinessException(409, "规则已有运行记录，编码、触发事件和目标类型不能修改");
        }
        copyRule(rule, request);
        if (ruleMapper.updateById(rule) <= 0) {
            throw new BusinessException(409, "桥接规则已被其他人更新，请刷新后重试");
        }
    }

    public Map<String, Object> runs(String status, Long orderId, Integer pageNum, Integer pageSize) {
        access.requireBridgeManager();
        if (StringUtils.hasText(status)
                && !Set.of("pending", "processing", "success", "failed", "dead", "skipped").contains(status)) {
            throw new BusinessException("未知的桥接运行状态");
        }
        LambdaQueryWrapper<FeigeOrderTaskBridgeRun> query = new LambdaQueryWrapper<>();
        query.eq(StringUtils.hasText(status), FeigeOrderTaskBridgeRun::getRunStatus, status)
                .eq(orderId != null, FeigeOrderTaskBridgeRun::getOrderId, orderId);
        dataScopeHelper.apply(query, FeigeOrderTaskBridgeRun::getBusinessOwnerId,
                FeigeOrderTaskBridgeRun::getDeptId);
        query.orderByDesc(FeigeOrderTaskBridgeRun::getCreateTime);
        IPage<FeigeOrderTaskBridgeRun> page = runMapper.selectPage(
                new Page<>(safePage(pageNum), safeSize(pageSize)), query);
        Map<String, Object> result = new LinkedHashMap<>();
        List<Long> ruleIds = page.getRecords().stream().map(FeigeOrderTaskBridgeRun::getRuleId)
                .filter(Objects::nonNull).distinct().toList();
        Map<Long, String> ruleNames = ruleIds.isEmpty() ? Map.of()
                : ruleMapper.selectList(new LambdaQueryWrapper<FeigeOrderTaskBridgeRule>()
                        .select(FeigeOrderTaskBridgeRule::getId, FeigeOrderTaskBridgeRule::getRuleName)
                        .in(FeigeOrderTaskBridgeRule::getId, ruleIds))
                .stream().collect(Collectors.toMap(FeigeOrderTaskBridgeRule::getId,
                        FeigeOrderTaskBridgeRule::getRuleName, (a, b) -> a));
        result.put("records", page.getRecords().stream()
                .map(run -> runView(run, ruleNames.get(run.getRuleId()))).toList());
        result.put("total", page.getTotal());
        result.put("current", page.getCurrent());
        result.put("size", page.getSize());
        result.put("pages", page.getPages());
        return result;
    }

    @Transactional(rollbackFor = Exception.class)
    public void retry(Long id) {
        access.requireBridgeManager();
        FeigeOrderTaskBridgeRun run = requireVisibleRun(id);
        if (!RETRYABLE.contains(run.getRunStatus())) {
            throw new BusinessException(409, "只有失败、终止或已跳过的运行可以重试");
        }
        int changed = runMapper.update(null, new LambdaUpdateWrapper<FeigeOrderTaskBridgeRun>()
                .eq(FeigeOrderTaskBridgeRun::getId, id)
                .eq(FeigeOrderTaskBridgeRun::getTenantId, run.getTenantId())
                .in(FeigeOrderTaskBridgeRun::getRunStatus, RETRYABLE)
                .set(FeigeOrderTaskBridgeRun::getRunStatus, "pending")
                .set(FeigeOrderTaskBridgeRun::getNextRetryAt, null)
                .set(FeigeOrderTaskBridgeRun::getErrorCode, null)
                .set(FeigeOrderTaskBridgeRun::getErrorMessage, null)
                .set(FeigeOrderTaskBridgeRun::getUpdateTime, LocalDateTime.now()));
        if (changed <= 0) {
            throw new BusinessException(409, "运行状态已变化，请刷新后重试");
        }
    }

    public List<Map<String, Object>> orderOptions(String keyword, Integer pageSize) {
        access.requireManager();
        LambdaQueryWrapper<FeigeOrder> query = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(keyword)) {
            query.and(w -> w.like(FeigeOrder::getOrderNo, keyword.trim())
                    .or().like(FeigeOrder::getCompanyName, keyword.trim()));
        }
        dataScopeHelper.apply(query, FeigeOrder::getSalesmanId, FeigeOrder::getDeptId);
        query.orderByDesc(FeigeOrder::getCreateTime).last("LIMIT " + Math.min(100, Math.max(1,
                pageSize == null ? 20 : pageSize)));
        return orderMapper.selectList(query).stream().map(order -> {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", order.getId());
            row.put("orderNo", order.getOrderNo());
            row.put("companyName", order.getCompanyName());
            row.put("businessType", order.getBusinessType());
            row.put("salesmanId", order.getSalesmanId());
            row.put("salesmanName", order.getSalesmanName());
            row.put("region", order.getRegion());
            row.put("amount", order.getContractAmount() == null ? order.getOrderAmount() : order.getContractAmount());
            return row;
        }).toList();
    }

    /** 在订单事务内写入幂等运行记录；配置缺失不会阻断下单。 */
    public int enqueue(FeigeOrder order, String triggerEvent, Long operatorId, String operatorName) {
        if (order == null || order.getId() == null || order.getTenantId() == null
                || order.getSalesmanId() == null || operatorId == null || !StringUtils.hasText(operatorName)) {
            throw new BusinessException("订单桥接事件缺少可信租户、订单、负责人或操作人信息");
        }
        if (!TRIGGERS.contains(triggerEvent)) {
            throw new BusinessException("未知的订单桥接事件");
        }
        if (FINANCE_APPROVED.equals(triggerEvent) && !"approved".equals(order.getAuditStatus())) {
            throw new BusinessException("只有标准财务审核通过的订单可以生成审核后任务");
        }
        List<FeigeOrderTaskBridgeRule> matched = ruleMapper.selectList(
                new LambdaQueryWrapper<FeigeOrderTaskBridgeRule>()
                        .eq(FeigeOrderTaskBridgeRule::getTenantId, order.getTenantId())
                        .eq(FeigeOrderTaskBridgeRule::getTriggerEvent, triggerEvent)
                        .eq(FeigeOrderTaskBridgeRule::getEnabled, 1)
                        .and(w -> w.isNull(FeigeOrderTaskBridgeRule::getBusinessTypeCode)
                                .or().eq(FeigeOrderTaskBridgeRule::getBusinessTypeCode, "")
                                .or().eq(FeigeOrderTaskBridgeRule::getBusinessTypeCode, order.getBusinessType())));
        int created = 0;
        for (FeigeOrderTaskBridgeRule rule : matched) {
            FeigeOrderTaskBridgeRun run = new FeigeOrderTaskBridgeRun();
            run.setRuleId(rule.getId());
            run.setRuleCode(rule.getRuleCode());
            run.setTriggerEvent(triggerEvent);
            run.setTargetTaskType(rule.getTargetTaskType());
            run.setOrderId(order.getId());
            run.setOrderNo(order.getOrderNo());
            run.setBusinessOwnerId(order.getSalesmanId());
            run.setDeptId(order.getDeptId());
            run.setOperatorId(operatorId);
            run.setOperatorName(operatorName.trim());
            run.setTenantId(order.getTenantId());
            created += runMapper.insertIdempotent(run);
        }
        return created;
    }

    /** 无登录定时线程使用；所有后续读取仍按每行 tenant_id 显式收紧。 */
    public List<Long> dueRunIds() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime stale = now.minusMinutes(5);
        return runMapper.selectList(new LambdaQueryWrapper<FeigeOrderTaskBridgeRun>()
                        .select(FeigeOrderTaskBridgeRun::getId)
                        .and(w -> w.and(x -> x.in(FeigeOrderTaskBridgeRun::getRunStatus, "pending", "failed")
                                        .and(y -> y.isNull(FeigeOrderTaskBridgeRun::getNextRetryAt)
                                                .or().le(FeigeOrderTaskBridgeRun::getNextRetryAt, now)))
                                .or(x -> x.eq(FeigeOrderTaskBridgeRun::getRunStatus, "processing")
                                        .le(FeigeOrderTaskBridgeRun::getUpdateTime, stale)))
                        .orderByAsc(FeigeOrderTaskBridgeRun::getCreateTime)
                        .last("LIMIT 50"))
                .stream().map(FeigeOrderTaskBridgeRun::getId).toList();
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW, rollbackFor = Exception.class)
    public boolean claim(Long id) {
        FeigeOrderTaskBridgeRun run = runMapper.selectById(id);
        if (run == null || run.getTenantId() == null) {
            return false;
        }
        LocalDateTime now = LocalDateTime.now();
        int changed = runMapper.update(null, new LambdaUpdateWrapper<FeigeOrderTaskBridgeRun>()
                .eq(FeigeOrderTaskBridgeRun::getId, id)
                .eq(FeigeOrderTaskBridgeRun::getTenantId, run.getTenantId())
                .and(w -> w.in(FeigeOrderTaskBridgeRun::getRunStatus, "pending", "failed")
                        .or(x -> x.eq(FeigeOrderTaskBridgeRun::getRunStatus, "processing")
                                .le(FeigeOrderTaskBridgeRun::getUpdateTime, now.minusMinutes(5))))
                .set(FeigeOrderTaskBridgeRun::getRunStatus, "processing")
                .set(FeigeOrderTaskBridgeRun::getNextRetryAt, null)
                .set(FeigeOrderTaskBridgeRun::getErrorCode, null)
                .set(FeigeOrderTaskBridgeRun::getErrorMessage, null)
                .set(FeigeOrderTaskBridgeRun::getUpdateTime, now)
                .setSql("attempt_count = attempt_count + 1"));
        return changed > 0;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW, rollbackFor = Exception.class)
    public void processClaimed(Long id) {
        FeigeOrderTaskBridgeRun run = runMapper.selectById(id);
        if (run == null || run.getTenantId() == null || !"processing".equals(run.getRunStatus())) {
            throw new BusinessException("桥接运行不存在或未被领取");
        }
        Long tenantId = run.getTenantId();
        FeigeOrderTaskBridgeRule rule = ruleMapper.selectOne(new LambdaQueryWrapper<FeigeOrderTaskBridgeRule>()
                .eq(FeigeOrderTaskBridgeRule::getId, run.getRuleId())
                .eq(FeigeOrderTaskBridgeRule::getTenantId, tenantId)
                .last("LIMIT 1"));
        if (rule == null || !Integer.valueOf(1).equals(rule.getEnabled())) {
            finish(run, "skipped", null, "RULE_DISABLED", "桥接规则不存在或已停用");
            return;
        }
        if (!Objects.equals(rule.getTriggerEvent(), run.getTriggerEvent())
                || !Objects.equals(rule.getTargetTaskType(), run.getTargetTaskType())) {
            throw new BridgeConfigurationException("RULE_CHANGED", "桥接规则关键字段与事件快照不一致");
        }
        FeigeOrder order = orderMapper.selectOne(new LambdaQueryWrapper<FeigeOrder>()
                .eq(FeigeOrder::getId, run.getOrderId())
                .eq(FeigeOrder::getTenantId, tenantId)
                .last("LIMIT 1"));
        if (order == null) {
            throw new BridgeConfigurationException("ORDER_MISSING", "关联订单不存在或租户不匹配");
        }
        if (FINANCE_APPROVED.equals(run.getTriggerEvent()) && !"approved".equals(order.getAuditStatus())) {
            throw new BridgeConfigurationException("ORDER_NOT_APPROVED", "订单尚未通过标准财务审核");
        }
        if (StringUtils.hasText(rule.getBusinessTypeCode())
                && !Objects.equals(rule.getBusinessTypeCode(), order.getBusinessType())) {
            finish(run, "skipped", null, "BUSINESS_TYPE_CHANGED", "订单业务类型已不匹配规则");
            return;
        }
        SysUser owner = activeUser(order.getSalesmanId(), tenantId);
        Long targetId = "business".equals(rule.getTargetTaskType())
                ? createBusiness(run, order, owner)
                : createAudit(run, rule, order, owner);
        finish(run, "success", targetId, null, null);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW, rollbackFor = Exception.class)
    public void markFailed(Long id, RuntimeException failure) {
        FeigeOrderTaskBridgeRun run = runMapper.selectById(id);
        if (run == null || run.getTenantId() == null || !"processing".equals(run.getRunStatus())) {
            return;
        }
        int attempts = run.getAttemptCount() == null ? 1 : run.getAttemptCount();
        boolean dead = attempts >= MAX_ATTEMPTS;
        String code = failure instanceof BridgeConfigurationException configured
                ? configured.code : "PROCESSING_FAILED";
        String message = failure instanceof BridgeConfigurationException
                ? safeMessage(failure.getMessage()) : "任务生成失败，请检查规则、流程和关联人员配置";
        runMapper.update(null, new LambdaUpdateWrapper<FeigeOrderTaskBridgeRun>()
                .eq(FeigeOrderTaskBridgeRun::getId, id)
                .eq(FeigeOrderTaskBridgeRun::getTenantId, run.getTenantId())
                .eq(FeigeOrderTaskBridgeRun::getRunStatus, "processing")
                .set(FeigeOrderTaskBridgeRun::getRunStatus, dead ? "dead" : "failed")
                .set(FeigeOrderTaskBridgeRun::getNextRetryAt,
                        dead ? null : LocalDateTime.now().plusMinutes(Math.min(60, 1L << Math.min(attempts, 6))))
                .set(FeigeOrderTaskBridgeRun::getErrorCode, code)
                .set(FeigeOrderTaskBridgeRun::getErrorMessage, message)
                .set(FeigeOrderTaskBridgeRun::getUpdateTime, LocalDateTime.now()));
    }

    private Long createBusiness(FeigeOrderTaskBridgeRun run, FeigeOrder order, SysUser owner) {
        FeigeBusinessTask existing = businessTaskMapper.selectOne(new LambdaQueryWrapper<FeigeBusinessTask>()
                .eq(FeigeBusinessTask::getTenantId, run.getTenantId())
                .eq(FeigeBusinessTask::getBridgeRunId, run.getId())
                .last("LIMIT 1"));
        if (existing != null) {
            return existing.getId();
        }
        FeigeBusinessTask task = new FeigeBusinessTask();
        fillBase(task, run);
        task.setBridgeRunId(run.getId());
        task.setOrderId(order.getId());
        task.setOrderNo(order.getOrderNo());
        task.setCompanyName(order.getCompanyName());
        task.setBusinessType(order.getBusinessType());
        task.setTaskStatus(FeigeBusinessTaskService.PENDING_MANAGER_AUDIT);
        task.setManagerReviewStatus("pending");
        // 销售仅作为业务归属人快照；承办人必须由主管审核后选择，禁止自动误派。
        task.setOwnerId(null);
        task.setOwnerName(null);
        task.setBusinessOwnerId(owner.getId());
        task.setBusinessOwnerName(displayName(owner));
        task.setDeptId(owner.getDeptId());
        task.setOrderAmount(money(order.getOrderAmount()));
        task.setReceivedAmount(money(order.getReceivedAmount()));
        task.setCostAmount(BigDecimal.ZERO);
        task.setRemarks("订单规则自动生成");
        if (businessTaskMapper.insert(task) <= 0) {
            throw new BusinessException("业务任务自动生成失败");
        }
        log(run, "business", task.getId(), "bridge_create",
                FeigeBusinessTaskService.PENDING_MANAGER_AUDIT, "由订单桥接规则自动生成业务任务");
        return task.getId();
    }

    private Long createAudit(FeigeOrderTaskBridgeRun run, FeigeOrderTaskBridgeRule rule,
                             FeigeOrder order, SysUser owner) {
        FeigeAuditTask existing = auditTaskMapper.selectOne(new LambdaQueryWrapper<FeigeAuditTask>()
                .eq(FeigeAuditTask::getTenantId, run.getTenantId())
                .eq(FeigeAuditTask::getBridgeRunId, run.getId())
                .last("LIMIT 1"));
        if (existing != null) {
            return existing.getId();
        }
        if (rule.getProcessId() == null) {
            throw new BridgeConfigurationException("PROCESS_REQUIRED", "审批类规则必须配置审批流程");
        }
        FeigeAuditProcess process = processMapper.selectOne(new LambdaQueryWrapper<FeigeAuditProcess>()
                .eq(FeigeAuditProcess::getId, rule.getProcessId())
                .eq(FeigeAuditProcess::getTenantId, run.getTenantId())
                .last("LIMIT 1"));
        if (process == null || !Integer.valueOf(1).equals(process.getEnabled())
                || !Objects.equals(process.getTaskType(), rule.getTargetTaskType())) {
            throw new BridgeConfigurationException("PROCESS_INVALID", "审批流程不存在、未启用或类型不匹配");
        }
        List<FeigeAuditStep> steps = stepMapper.selectList(new LambdaQueryWrapper<FeigeAuditStep>()
                .eq(FeigeAuditStep::getTenantId, run.getTenantId())
                .eq(FeigeAuditStep::getProcessId, process.getId())
                .orderByAsc(FeigeAuditStep::getStepOrder));
        if (steps.isEmpty()) {
            throw new BridgeConfigurationException("PROCESS_EMPTY", "审批流程没有有效步骤");
        }
        FeigeAuditStep first = steps.get(0);
        if (!Integer.valueOf(1).equals(first.getStepOrder())) {
            throw new BridgeConfigurationException("PROCESS_STEP_INVALID", "审批流程第一步序号必须为1");
        }

        FeigeAuditTask task = new FeigeAuditTask();
        fillBase(task, run);
        task.setBridgeRunId(run.getId());
        task.setTaskNo("FGA-BRIDGE-" + run.getId());
        task.setOrderId(order.getId());
        task.setOrderNo(order.getOrderNo());
        task.setCompanyName(order.getCompanyName());
        task.setTaskType(process.getTaskType());
        task.setBusinessTypeCode(StringUtils.hasText(process.getBusinessTypeCode())
                ? process.getBusinessTypeCode() : order.getBusinessType());
        task.setBusinessTypeName(order.getBusinessType());
        task.setProcessId(process.getId());
        task.setProcessCode(process.getProcessCode());
        task.setProcessName(process.getProcessName());
        task.setTotalSteps(steps.size());
        task.setTaskStatus(FeigeAuditTaskService.PENDING);
        task.setBusinessOwnerId(owner.getId());
        task.setBusinessOwnerName(displayName(owner));
        task.setDeptId(owner.getDeptId());
        task.setScopeType(rule.getScopeType());
        task.setTeamName(order.getTeamName());
        task.setRegion(order.getRegion());
        task.setAmount(order.getContractAmount() == null ? order.getOrderAmount() : order.getContractAmount());
        task.setExpenseAmount(BigDecimal.ZERO);
        task.setRemarks("订单规则自动生成");
        task.setFinalConfirm(Integer.valueOf(1).equals(rule.getFinalConfirm()) ? 1 : 0);
        task.setProcessSnapshotJson(snapshot(process, steps));
        applyFirstStep(task, first, owner, run.getTenantId());
        if (auditTaskMapper.insert(task) <= 0) {
            throw new BusinessException("审批任务自动生成失败");
        }
        log(run, "audit", task.getId(), "bridge_create", FeigeAuditTaskService.PENDING,
                "由订单桥接规则自动生成" + process.getTaskType() + "审批任务");
        return task.getId();
    }

    private void applyFirstStep(FeigeAuditTask task, FeigeAuditStep step, SysUser owner, Long tenantId) {
        task.setStepId(step.getId());
        task.setStepOrder(step.getStepOrder());
        task.setStepName(step.getStepName());
        task.setRequiredRoleKey(step.getRequiredRoleKey());
        boolean finalOwnerConfirm = Integer.valueOf(1).equals(task.getFinalConfirm())
                && Objects.equals(task.getStepOrder(), task.getTotalSteps());
        if (finalOwnerConfirm) {
            task.setAssignedUserId(owner.getId());
            task.setAssignedUserName(displayName(owner));
        } else if ("specific".equals(step.getAssigneeMode())) {
            SysUser assigned = activeUser(step.getRequiredUserId(), tenantId);
            if (StringUtils.hasText(step.getRequiredRoleKey())
                    && !userMapper.selectRoleKeysByUserId(assigned.getId()).contains(step.getRequiredRoleKey())) {
                throw new BridgeConfigurationException("ASSIGNEE_ROLE_INVALID", "指定审批人已不具备流程要求角色");
            }
            task.setAssignedUserId(assigned.getId());
            task.setAssignedUserName(displayName(assigned));
        } else if ("owner".equals(step.getAssigneeMode())) {
            task.setAssignedUserId(owner.getId());
            task.setAssignedUserName(displayName(owner));
        } else if ("role".equals(step.getAssigneeMode())) {
            SysRole role = roleMapper.selectOne(new LambdaQueryWrapper<SysRole>()
                    .eq(SysRole::getTenantId, tenantId)
                    .eq(SysRole::getRoleKey, step.getRequiredRoleKey())
                    .eq(SysRole::getStatus, 0)
                    .last("LIMIT 1"));
            if (role == null) {
                throw new BridgeConfigurationException("ROLE_INVALID", "流程要求角色不存在或已停用");
            }
        } else {
            throw new BridgeConfigurationException("ASSIGNEE_MODE_INVALID", "审批人模式不受支持");
        }
    }

    private void validateRule(FeigeTaskRequests.BridgeRuleUpsert request, Long currentId) {
        if (!request.getRuleCode().matches("^[A-Za-z][A-Za-z0-9_-]{0,63}$")) {
            throw new BusinessException("规则编码格式不正确");
        }
        if (!TRIGGERS.contains(request.getTriggerEvent())) {
            throw new BusinessException("触发事件仅支持 order_created/finance_approved");
        }
        if (!TARGETS.contains(request.getTargetTaskType())) {
            throw new BusinessException("目标任务类型不受支持");
        }
        if (StringUtils.hasText(request.getScopeType())
                && !Set.of("personal", "team").contains(request.getScopeType())) {
            throw new BusinessException("任务范围仅支持 personal/team");
        }
        long duplicate = ruleMapper.selectCount(new LambdaQueryWrapper<FeigeOrderTaskBridgeRule>()
                .eq(FeigeOrderTaskBridgeRule::getRuleCode, request.getRuleCode().trim())
                .ne(currentId != null, FeigeOrderTaskBridgeRule::getId, currentId));
        if (duplicate > 0) {
            throw new BusinessException("规则编码已存在");
        }
        if ("business".equals(request.getTargetTaskType())) {
            if (request.getProcessId() != null) {
                throw new BusinessException("业务任务规则不能绑定审批流程");
            }
            return;
        }
        if (!StringUtils.hasText(request.getScopeType())) {
            throw new BusinessException("审批类规则必须选择 personal/team 任务范围");
        }
        if (!AUDIT_TARGETS.contains(request.getTargetTaskType()) || request.getProcessId() == null) {
            throw new BusinessException("审批类规则必须选择匹配类型的审批流程");
        }
        FeigeAuditProcess process = processMapper.selectById(request.getProcessId());
        if (process == null || !Objects.equals(process.getTaskType(), request.getTargetTaskType())) {
            throw new BusinessException("审批流程不存在或类型与规则不匹配");
        }
        if (StringUtils.hasText(process.getBusinessTypeCode())
                && !Objects.equals(process.getBusinessTypeCode(), trim(request.getBusinessTypeCode()))) {
            throw new BusinessException("规则业务类型必须与审批流程业务类型一致");
        }
        if (Integer.valueOf(1).equals(request.getEnabled()) && !Integer.valueOf(1).equals(process.getEnabled())) {
            throw new BusinessException("启用规则前必须先启用审批流程");
        }
    }

    private void copyRule(FeigeOrderTaskBridgeRule rule, FeigeTaskRequests.BridgeRuleUpsert request) {
        rule.setRuleCode(request.getRuleCode().trim());
        rule.setRuleName(request.getRuleName().trim());
        rule.setTriggerEvent(request.getTriggerEvent());
        rule.setTargetTaskType(request.getTargetTaskType());
        rule.setProcessId(request.getProcessId());
        rule.setBusinessTypeCode(trim(request.getBusinessTypeCode()));
        rule.setScopeType("business".equals(request.getTargetTaskType())
                ? null : trim(request.getScopeType()));
        rule.setFinalConfirm(Integer.valueOf(1).equals(request.getFinalConfirm()) ? 1 : 0);
        rule.setEnabled(Integer.valueOf(1).equals(request.getEnabled()) ? 1 : 0);
    }

    private FeigeOrderTaskBridgeRule requireRule(Long id) {
        FeigeOrderTaskBridgeRule rule = ruleMapper.selectById(id);
        if (rule == null) {
            throw new BusinessException("桥接规则不存在或不属于当前租户");
        }
        return rule;
    }

    private FeigeOrderTaskBridgeRun requireVisibleRun(Long id) {
        FeigeOrderTaskBridgeRun run = runMapper.selectById(id);
        if (run == null) {
            throw new BusinessException("桥接运行不存在或不属于当前租户");
        }
        if (!dataScopeHelper.canAccess(run.getBusinessOwnerId(), run.getDeptId())) {
            throw new org.springframework.security.access.AccessDeniedException("无权操作该订单桥接运行");
        }
        return run;
    }

    private SysUser activeUser(Long id, Long tenantId) {
        if (id == null || tenantId == null) {
            throw new BridgeConfigurationException("OWNER_REQUIRED", "订单缺少有效负责人");
        }
        SysUser user = userMapper.selectOne(new LambdaQueryWrapper<SysUser>()
                .eq(SysUser::getId, id)
                .eq(SysUser::getTenantId, tenantId)
                .eq(SysUser::getStatus, 0)
                .last("LIMIT 1"));
        if (user == null || userMapper.existsResignedEmployee(id, tenantId)) {
            throw new BridgeConfigurationException("USER_INACTIVE", "关联员工已离职、停用或不属于当前租户");
        }
        return user;
    }

    private void finish(FeigeOrderTaskBridgeRun run, String status, Long targetId,
                        String errorCode, String errorMessage) {
        int changed = runMapper.update(null, new LambdaUpdateWrapper<FeigeOrderTaskBridgeRun>()
                .eq(FeigeOrderTaskBridgeRun::getId, run.getId())
                .eq(FeigeOrderTaskBridgeRun::getTenantId, run.getTenantId())
                .eq(FeigeOrderTaskBridgeRun::getRunStatus, "processing")
                .set(FeigeOrderTaskBridgeRun::getRunStatus, status)
                .set(FeigeOrderTaskBridgeRun::getTargetTaskId, targetId)
                .set(FeigeOrderTaskBridgeRun::getErrorCode, errorCode)
                .set(FeigeOrderTaskBridgeRun::getErrorMessage, errorMessage)
                .set(FeigeOrderTaskBridgeRun::getProcessedAt, LocalDateTime.now())
                .set(FeigeOrderTaskBridgeRun::getNextRetryAt, null)
                .set(FeigeOrderTaskBridgeRun::getUpdateTime, LocalDateTime.now()));
        if (changed <= 0) {
            throw new BusinessException(409, "桥接运行状态已被其他消费者修改");
        }
    }

    private void log(FeigeOrderTaskBridgeRun run, String domain, Long businessId,
                     String event, String toStatus, String detail) {
        FeigeTaskOperationLog log = new FeigeTaskOperationLog();
        fillBase(log, run);
        log.setDomainType(domain);
        log.setBusinessId(businessId);
        log.setEventType(event);
        log.setToStatus(toStatus);
        log.setOperatorId(run.getOperatorId());
        log.setOperatorName(run.getOperatorName());
        log.setDetail(detail);
        operationLogMapper.insert(log);
    }

    private void fillBase(com.zhehang.erp.common.core.domain.BaseEntity entity,
                          FeigeOrderTaskBridgeRun run) {
        entity.setTenantId(run.getTenantId());
        entity.setCreateBy(run.getOperatorId());
        entity.setUpdateBy(run.getOperatorId());
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
            throw new BridgeConfigurationException("SNAPSHOT_FAILED", "审批流程快照生成失败");
        }
    }

    private Map<String, Object> runView(FeigeOrderTaskBridgeRun run, String ruleName) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", run.getId());
        row.put("ruleId", run.getRuleId());
        row.put("ruleCode", run.getRuleCode());
        row.put("ruleName", ruleName);
        row.put("triggerEvent", run.getTriggerEvent());
        row.put("targetTaskType", run.getTargetTaskType());
        row.put("orderId", run.getOrderId());
        row.put("orderNo", run.getOrderNo());
        row.put("status", run.getRunStatus());
        row.put("targetTaskId", run.getTargetTaskId());
        row.put("retryCount", run.getAttemptCount());
        row.put("nextRetryAt", run.getNextRetryAt());
        row.put("errorCode", run.getErrorCode());
        row.put("errorMessage", run.getErrorMessage());
        row.put("processedAt", run.getProcessedAt());
        row.put("createTime", run.getCreateTime());
        return row;
    }

    private Map<String, Object> ruleView(FeigeOrderTaskBridgeRule rule, String processName) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", rule.getId());
        row.put("ruleCode", rule.getRuleCode());
        row.put("ruleName", rule.getRuleName());
        row.put("triggerEvent", rule.getTriggerEvent());
        row.put("targetTaskType", rule.getTargetTaskType());
        row.put("processId", rule.getProcessId());
        row.put("processName", processName);
        row.put("businessTypeCode", rule.getBusinessTypeCode());
        row.put("scopeType", rule.getScopeType());
        row.put("finalConfirm", rule.getFinalConfirm());
        row.put("enabled", rule.getEnabled());
        row.put("createTime", rule.getCreateTime());
        row.put("updateTime", rule.getUpdateTime());
        return row;
    }

    private void validateOptionalTrigger(String value) {
        if (StringUtils.hasText(value) && !TRIGGERS.contains(value)) {
            throw new BusinessException("未知的桥接触发事件");
        }
    }

    private void validateOptionalTarget(String value) {
        if (StringUtils.hasText(value) && !TARGETS.contains(value)) {
            throw new BusinessException("未知的桥接目标类型");
        }
    }

    private int safePage(Integer value) {
        return value == null || value < 1 ? 1 : value;
    }

    private int safeSize(Integer value) {
        return value == null ? 20 : Math.max(1, Math.min(value, 100));
    }

    private String displayName(SysUser user) {
        return StringUtils.hasText(user.getNickname()) ? user.getNickname() : user.getUsername();
    }

    private BigDecimal money(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private String trim(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }

    private String safeMessage(String value) {
        if (!StringUtils.hasText(value)) {
            return "桥接配置无效";
        }
        String clean = value.replaceAll("[\\r\\n\\t]", " ").trim();
        return clean.substring(0, Math.min(500, clean.length()));
    }

    public static final class BridgeConfigurationException extends BusinessException {
        private final String code;

        public BridgeConfigurationException(String code, String message) {
            super(message);
            this.code = code;
        }
    }
}
