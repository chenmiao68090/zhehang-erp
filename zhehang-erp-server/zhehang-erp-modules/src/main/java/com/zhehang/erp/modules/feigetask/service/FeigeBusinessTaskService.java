package com.zhehang.erp.modules.feigetask.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.feigeorder.domain.entity.FeigeOrder;
import com.zhehang.erp.modules.feigeorder.mapper.FeigeOrderMapper;
import com.zhehang.erp.modules.feigetask.domain.dto.FeigeTaskRequests;
import com.zhehang.erp.modules.feigetask.domain.entity.FeigeBusinessTask;
import com.zhehang.erp.modules.feigetask.domain.entity.FeigeTaskOperationLog;
import com.zhehang.erp.modules.feigetask.mapper.FeigeBusinessTaskMapper;
import com.zhehang.erp.modules.feigetask.mapper.FeigeTaskOperationLogMapper;
import com.zhehang.erp.modules.system.domain.entity.SysUser;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class FeigeBusinessTaskService {

    public static final String PENDING_MANAGER_AUDIT = "pending_manager_audit";
    public static final String PUBLIC_SEA = "public_sea";
    public static final String ASSIGNED_TO_ME = "assigned_to_me";
    public static final String TASK = "task";
    public static final String HANDOVER = "handover";
    public static final String COMPLETED = "completed";
    public static final String PROBLEM_TASK = "problem_task";
    public static final String RECYCLE_BIN = "recycle_bin";

    private static final Set<String> ALL_STATUSES = Set.of(PENDING_MANAGER_AUDIT, PUBLIC_SEA,
            ASSIGNED_TO_ME, TASK, HANDOVER, COMPLETED, PROBLEM_TASK, RECYCLE_BIN);

    private final FeigeBusinessTaskMapper taskMapper;
    private final FeigeTaskOperationLogMapper operationLogMapper;
    private final FeigeOrderMapper orderMapper;
    private final DataScopeHelper dataScopeHelper;
    private final FeigeTaskAccessService access;
    private final FeigeTaskIdempotencyService idempotency;

    public IPage<FeigeBusinessTask> list(int pageNum, int pageSize, String status, String keyword,
                                         String orderNo, String companyName,
                                         String businessType, Long assigneeId) {
        if (StringUtils.hasText(status) && !ALL_STATUSES.contains(status)) {
            throw new BusinessException("未知的业务任务状态");
        }
        LambdaQueryWrapper<FeigeBusinessTask> query = new LambdaQueryWrapper<>();
        query.eq(StringUtils.hasText(status), FeigeBusinessTask::getTaskStatus, status);
        query.eq(StringUtils.hasText(businessType), FeigeBusinessTask::getBusinessType, businessType)
                .eq(assigneeId != null, FeigeBusinessTask::getOwnerId, assigneeId)
                .like(StringUtils.hasText(orderNo), FeigeBusinessTask::getOrderNo, orderNo)
                .like(StringUtils.hasText(companyName), FeigeBusinessTask::getCompanyName, companyName);
        if (StringUtils.hasText(keyword)) {
            query.and(w -> w.like(FeigeBusinessTask::getCompanyName, keyword)
                    .or().like(FeigeBusinessTask::getOrderNo, keyword));
        }
        if (PUBLIC_SEA.equals(status)) {
            applyPublicSeaScope(query);
        } else {
            dataScopeHelper.apply(query, FeigeBusinessTask::getOwnerId, FeigeBusinessTask::getDeptId);
        }
        query.orderByDesc(FeigeBusinessTask::getCreateTime);
        return taskMapper.selectPage(new Page<>(safePage(pageNum), safeSize(pageSize)), query);
    }

    public Map<String, Object> page(int pageNum, int pageSize, String status, String keyword,
                                    String orderNo, String companyName,
                                    String businessType, Long assigneeId) {
        IPage<FeigeBusinessTask> page = list(pageNum, pageSize, status, keyword,
                orderNo, companyName, businessType, assigneeId);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("records", page.getRecords().stream().map(this::toView).toList());
        result.put("total", page.getTotal());
        result.put("current", page.getCurrent());
        result.put("size", page.getSize());
        result.put("pages", page.getPages());
        return result;
    }

    public FeigeBusinessTask get(Long id) {
        return requireVisible(id);
    }

    public List<FeigeTaskOperationLog> logs(Long id) {
        requireVisible(id);
        return operationLogMapper.selectList(new LambdaQueryWrapper<FeigeTaskOperationLog>()
                .eq(FeigeTaskOperationLog::getDomainType, "business")
                .eq(FeigeTaskOperationLog::getBusinessId, id)
                .orderByAsc(FeigeTaskOperationLog::getCreateTime));
    }

    @Transactional(rollbackFor = Exception.class)
    public Long create(FeigeTaskRequests.BusinessCreate request) {
        access.requireManager();
        String requestKey = idempotency.normalizeKey(request.getRequestKey());
        String requestFingerprint = requestKey == null ? null : idempotency.businessFingerprint(request);
        Long existingId = existingIdempotentTask(requestKey, requestFingerprint, false);
        if (existingId != null) {
            return existingId;
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
                throw new BusinessException("关联订单缺少客户名称，不能创建任务");
            }
        }

        if (order == null && !StringUtils.hasText(request.getCompanyName())) {
            throw new BusinessException("未关联订单时必须填写客户名称");
        }
        Long ownerId = order == null ? request.getBusinessOwnerId() : order.getSalesmanId();
        if (order != null && ownerId == null) {
            throw new BusinessException("关联订单缺少销售负责人，不能创建任务");
        }
        SysUser owner = ownerId == null ? access.currentUser() : access.requireVisibleActiveUser(ownerId);
        String ownerName = order != null && StringUtils.hasText(order.getSalesmanName())
                ? order.getSalesmanName() : access.displayName(owner);

        FeigeBusinessTask task = new FeigeBusinessTask();
        task.setRequestKey(requestKey);
        task.setRequestFingerprint(requestFingerprint);
        task.setOrderId(order == null ? null : order.getId());
        task.setOrderNo(order == null ? trim(request.getOrderNo()) : order.getOrderNo());
        task.setCompanyName(order == null ? request.getCompanyName().trim() : order.getCompanyName());
        if (order != null) {
            task.setBusinessType(order.getBusinessType());
            task.setOrderAmount(order.getOrderAmount());
            task.setReceivedAmount(order.getReceivedAmount());
        }
        task.setTaskStatus(PENDING_MANAGER_AUDIT);
        task.setManagerReviewStatus("pending");
        task.setOwnerId(owner.getId());
        task.setOwnerName(ownerName);
        task.setBusinessOwnerId(owner.getId());
        task.setBusinessOwnerName(ownerName);
        task.setDeptId(order == null ? owner.getDeptId() : order.getDeptId());
        task.setRemarks(request.getRemarks());
        try {
            if (taskMapper.insert(task) <= 0) {
                throw new BusinessException("业务任务创建失败");
            }
        } catch (DuplicateKeyException e) {
            Long concurrentId = existingIdempotentTask(requestKey, requestFingerprint, true);
            if (concurrentId != null) {
                return concurrentId;
            }
            throw e;
        }
        access.log("business", task.getId(), "create", null, PENDING_MANAGER_AUDIT,
                "创建业务任务", null);
        return task.getId();
    }

    private Long existingIdempotentTask(String requestKey, String requestFingerprint, boolean forUpdate) {
        if (requestKey == null) {
            return null;
        }
        LambdaQueryWrapper<FeigeBusinessTask> query = new LambdaQueryWrapper<FeigeBusinessTask>()
                .eq(FeigeBusinessTask::getRequestKey, requestKey)
                .last(forUpdate ? "LIMIT 1 FOR UPDATE" : "LIMIT 1");
        FeigeBusinessTask existing = taskMapper.selectOne(query);
        if (existing == null) {
            return null;
        }
        if (!Objects.equals(existing.getRequestFingerprint(), requestFingerprint)) {
            throw new BusinessException(409, "requestKey已用于其他业务任务请求");
        }
        return existing.getId();
    }

    private String trim(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }

    @Transactional(rollbackFor = Exception.class)
    public void managerReview(Long id, FeigeTaskRequests.ManagerReview request) {
        access.requireManager();
        FeigeBusinessTask task = requireVisible(id);
        requireStatus(task, PENDING_MANAGER_AUDIT);
        String from = task.getTaskStatus();
        if ("rejected".equals(request.getResult())) {
            if (!StringUtils.hasText(request.getRemark())) {
                throw new BusinessException("驳回时必须填写原因");
            }
            task.setManagerReviewStatus("rejected");
            task.setManagerReviewRemark(request.getRemark());
            fillManagerReview(task);
            updateOrConflict(task);
            access.log("business", id, "manager_reject", from, from, "经理驳回业务任务", null);
            return;
        }
        if (!"approved".equals(request.getResult())) {
            throw new BusinessException("经理审核结果仅支持 approved/rejected");
        }

        String targetStatus = StringUtils.hasText(request.getTargetStatus())
                ? request.getTargetStatus() : request.getAssignType();
        Long assignedUserId = request.getAssigneeId() != null
                ? request.getAssigneeId() : request.getAssignedUserId();
        if (PUBLIC_SEA.equals(targetStatus)) {
            task.setAssignType("public_sea");
            task.setOwnerId(null);
            task.setOwnerName(null);
            task.setTaskStatus(PUBLIC_SEA);
        } else if (ASSIGNED_TO_ME.equals(targetStatus) || "assign_user".equals(targetStatus)) {
            SysUser assignee = access.requireVisibleActiveUser(assignedUserId);
            task.setAssignType("assign_user");
            task.setOwnerId(assignee.getId());
            task.setOwnerName(access.displayName(assignee));
            task.setDeptId(assignee.getDeptId());
            task.setTaskStatus(ASSIGNED_TO_ME);
        } else {
            throw new BusinessException("审核通过时必须选择公海或指定员工");
        }
        task.setManagerReviewStatus("approved");
        task.setManagerReviewRemark(request.getRemark());
        fillManagerReview(task);
        updateOrConflict(task);
        access.log("business", id, "manager_approve", from, task.getTaskStatus(),
                "经理通过业务任务", null);
    }

    @Transactional(rollbackFor = Exception.class)
    public void receive(Long id) {
        FeigeBusinessTask task = taskMapper.selectById(id);
        if (task == null) {
            throw new BusinessException("业务任务不存在");
        }
        String from = task.getTaskStatus();
        if (PUBLIC_SEA.equals(from)) {
            if (!access.canClaimDepartment(task.getDeptId())) {
                throw new AccessDeniedException("无权领取该公海任务");
            }
        } else if (ASSIGNED_TO_ME.equals(from)) {
            if (!Objects.equals(task.getOwnerId(), access.currentUserId())) {
                throw new AccessDeniedException("该任务未分配给当前用户");
            }
        } else {
            throw new BusinessException(409, "当前状态不能接收任务");
        }
        SysUser current = access.currentUser();
        task.setOwnerId(current.getId());
        task.setOwnerName(access.displayName(current));
        task.setDeptId(current.getDeptId());
        task.setReceivedBy(current.getId());
        task.setReceivedByName(access.displayName(current));
        task.setReceivedTime(LocalDateTime.now());
        task.setTaskStatus(TASK);
        updateOrConflict(task);
        access.log("business", id, "receive", from, TASK, "接收业务任务", null);
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateCost(Long id, FeigeTaskRequests.CostUpdate request) {
        FeigeBusinessTask task = requireVisible(id);
        requireOwnerOrManager(task);
        requireStatus(task, TASK);
        String category = StringUtils.hasText(request.getCostCategory())
                ? request.getCostCategory() : request.getCategory();
        BigDecimal amount = request.getCostAmount() != null ? request.getCostAmount() : request.getAmount();
        if (!StringUtils.hasText(category) || amount == null || amount.signum() < 0) {
            throw new BusinessException("成本分类和非负成本金额不能为空");
        }
        task.setCostCategory(category);
        task.setCostAmount(amount);
        if (StringUtils.hasText(request.getRemark())) {
            task.setRemarks(request.getRemark());
        }
        updateOrConflict(task);
        access.log("business", id, "cost", TASK, TASK, "更新业务任务成本", null);
    }

    @Transactional(rollbackFor = Exception.class)
    public void handover(Long id, FeigeTaskRequests.UserAssignment request) {
        FeigeBusinessTask task = requireVisible(id);
        requireStatus(task, TASK);
        if (!Objects.equals(task.getOwnerId(), access.currentUserId())) {
            throw new AccessDeniedException("只有当前承办人可以发起交接");
        }
        Long targetId = request.getHandoverToId() != null
                ? request.getHandoverToId() : task.getBusinessOwnerId();
        if (targetId == null) {
            throw new BusinessException("任务未设置业务归属人，无法发起交接");
        }
        SysUser target = access.requireActiveUserInTenant(targetId);
        boolean linkedBusinessOwner = Objects.equals(target.getId(), task.getBusinessOwnerId());
        if (!linkedBusinessOwner && !Objects.equals(target.getDeptId(), task.getDeptId())) {
            access.requireManager();
            if (!access.canAccess(target.getId(), target.getDeptId())) {
                throw new AccessDeniedException("无权跨部门选择交接人员");
            }
        }
        if (Objects.equals(target.getId(), access.currentUserId())) {
            throw new BusinessException("交接对象不能是当前承办人");
        }
        String name = access.currentUserName();
        task.setHandoverBy(access.currentUserId());
        task.setHandoverByName(name);
        task.setHandoverTime(LocalDateTime.now());
        task.setHandoverStatus("pending");
        task.setHandoverToId(target.getId());
        task.setHandoverToName(access.displayName(target));
        if (StringUtils.hasText(request.getRemark())) {
            task.setRemarks(request.getRemark());
        }
        task.setTaskStatus(HANDOVER);
        updateOrConflict(task);
        access.log("business", id, "handover", TASK, HANDOVER, "发起业务交接", null);
    }

    @Transactional(rollbackFor = Exception.class)
    public void confirmHandover(Long id) {
        FeigeBusinessTask task = requireVisible(id);
        requireStatus(task, HANDOVER);
        boolean target = Objects.equals(task.getHandoverToId(), access.currentUserId());
        if (!target) {
            access.requireManager();
            if (!access.canAccess(task.getOwnerId(), task.getDeptId())) {
                throw new AccessDeniedException("无权确认该交接任务");
            }
        }
        SysUser receiver = access.requireActiveUserInTenant(task.getHandoverToId());
        task.setHandoverStatus("completed");
        task.setOwnerId(task.getHandoverToId());
        task.setOwnerName(task.getHandoverToName());
        task.setDeptId(receiver.getDeptId());
        task.setCompletedTime(LocalDateTime.now());
        task.setTaskStatus(COMPLETED);
        updateOrConflict(task);
        access.log("business", id, "confirm_handover", HANDOVER, COMPLETED,
                "确认业务交接完成", null);
    }

    @Transactional(rollbackFor = Exception.class)
    public void moveToException(Long id, FeigeTaskRequests.ExceptionMove request) {
        FeigeBusinessTask task = requireVisible(id);
        requireOwnerOrManager(task);
        if (!StringUtils.hasText(request.getReason())) {
            throw new BusinessException("异常原因不能为空");
        }
        String target = StringUtils.hasText(request.getTargetStatus())
                ? request.getTargetStatus() : request.getExceptionType();
        if (!Set.of(PROBLEM_TASK, RECYCLE_BIN).contains(target)) {
            target = PROBLEM_TASK;
        }
        if (!Set.of(PROBLEM_TASK, RECYCLE_BIN).contains(target)
                || !isBusinessTransitionAllowed(task.getTaskStatus(), target)) {
            throw new BusinessException(409, "当前状态不能转入所选异常分区");
        }
        String from = task.getTaskStatus();
        task.setTaskStatus(target);
        task.setExceptionReason(request.getReason());
        updateOrConflict(task);
        access.log("business", id, "exception", from, target, "转入异常任务", null);
    }

    @Transactional(rollbackFor = Exception.class)
    public void reassign(Long id, FeigeTaskRequests.UserAssignment request) {
        access.requireManager();
        FeigeBusinessTask task = requireVisible(id);
        if (!Set.of(ASSIGNED_TO_ME, TASK, PROBLEM_TASK, RECYCLE_BIN).contains(task.getTaskStatus())) {
            throw new BusinessException(409, "当前状态不能转分配");
        }
        Long assigneeId = request.getAssigneeId() != null ? request.getAssigneeId() : request.getUserId();
        SysUser assignee = access.requireVisibleActiveUser(assigneeId);
        String from = task.getTaskStatus();
        task.setAssignType("assign_user");
        task.setOwnerId(assignee.getId());
        task.setOwnerName(access.displayName(assignee));
        task.setDeptId(assignee.getDeptId());
        task.setReceivedBy(null);
        task.setReceivedByName(null);
        task.setReceivedTime(null);
        task.setTaskStatus(ASSIGNED_TO_ME);
        if (StringUtils.hasText(request.getRemark())) {
            task.setRemarks(request.getRemark());
        }
        updateOrConflict(task);
        access.log("business", id, "reassign", from, ASSIGNED_TO_ME, "转分配业务任务", null);
    }

    @Transactional(rollbackFor = Exception.class)
    public void complete(Long id) {
        FeigeBusinessTask task = requireVisible(id);
        requireOwnerOrManager(task);
        requireStatus(task, TASK);
        task.setTaskStatus(COMPLETED);
        task.setCompletedTime(LocalDateTime.now());
        updateOrConflict(task);
        access.log("business", id, "complete", TASK, COMPLETED, "完成业务任务", null);
    }

    @Transactional(rollbackFor = Exception.class)
    public void restore(Long id) {
        FeigeBusinessTask task = requireVisible(id);
        requireOwnerOrManager(task);
        if (!Set.of(PROBLEM_TASK, RECYCLE_BIN).contains(task.getTaskStatus())) {
            throw new BusinessException(409, "当前状态不能恢复任务");
        }
        String from = task.getTaskStatus();
        task.setTaskStatus(TASK);
        task.setExceptionReason(null);
        updateOrConflict(task);
        access.log("business", id, "restore", from, TASK, "恢复业务任务", null);
    }

    @Transactional(rollbackFor = Exception.class)
    public void recycle(Long id) {
        FeigeBusinessTask task = requireVisible(id);
        requireOwnerOrManager(task);
        requireStatus(task, PROBLEM_TASK);
        task.setTaskStatus(RECYCLE_BIN);
        updateOrConflict(task);
        access.log("business", id, "recycle", PROBLEM_TASK, RECYCLE_BIN, "移入回收站", null);
    }

    public static boolean isBusinessTransitionAllowed(String from, String to) {
        if (PENDING_MANAGER_AUDIT.equals(from)) {
            return Set.of(PENDING_MANAGER_AUDIT, PUBLIC_SEA, ASSIGNED_TO_ME).contains(to);
        }
        if (PUBLIC_SEA.equals(from) || ASSIGNED_TO_ME.equals(from)) {
            return TASK.equals(to);
        }
        if (TASK.equals(from)) {
            return Set.of(HANDOVER, COMPLETED, PROBLEM_TASK, RECYCLE_BIN, ASSIGNED_TO_ME).contains(to);
        }
        if (HANDOVER.equals(from)) {
            return Set.of(COMPLETED, PROBLEM_TASK, RECYCLE_BIN).contains(to);
        }
        if (PROBLEM_TASK.equals(from)) {
            return Set.of(TASK, RECYCLE_BIN, ASSIGNED_TO_ME).contains(to);
        }
        return RECYCLE_BIN.equals(from) && Set.of(TASK, ASSIGNED_TO_ME).contains(to);
    }

    private FeigeBusinessTask requireVisible(Long id) {
        FeigeBusinessTask task = taskMapper.selectById(id);
        if (task == null) {
            throw new BusinessException("业务任务不存在或不属于当前租户");
        }
        boolean visible = Objects.equals(task.getHandoverToId(), access.currentUserId())
                || (PUBLIC_SEA.equals(task.getTaskStatus())
                ? access.canClaimDepartment(task.getDeptId())
                : access.canAccess(task.getOwnerId(), task.getDeptId()));
        if (!visible) {
            throw new AccessDeniedException("无权访问该业务任务");
        }
        return task;
    }

    private void requireOwnerOrManager(FeigeBusinessTask task) {
        if (Objects.equals(task.getOwnerId(), access.currentUserId())) {
            return;
        }
        access.requireManager();
        if (!access.canAccess(task.getOwnerId(), task.getDeptId())) {
            throw new AccessDeniedException("无权操作该业务任务");
        }
    }

    private void fillManagerReview(FeigeBusinessTask task) {
        task.setManagerReviewerId(access.currentUserId());
        task.setManagerReviewerName(access.currentUserName());
        task.setManagerReviewTime(LocalDateTime.now());
    }

    private void requireStatus(FeigeBusinessTask task, String expected) {
        if (!expected.equals(task.getTaskStatus())) {
            throw new BusinessException(409, "任务状态已变化，请刷新后重试");
        }
    }

    private void updateOrConflict(FeigeBusinessTask task) {
        if (taskMapper.updateById(task) <= 0) {
            throw new BusinessException(409, "任务已被其他人更新，请刷新后重试");
        }
    }

    private void applyPublicSeaScope(LambdaQueryWrapper<FeigeBusinessTask> query) {
        if (SecurityUtils.isCurrentAdmin() || Integer.valueOf(1).equals(SecurityUtils.getCurrentDataScope())) {
            return;
        }
        Long deptId = SecurityUtils.getCurrentDeptId();
        if (deptId == null) {
            query.eq(FeigeBusinessTask::getDeptId, -1L);
            return;
        }
        if (Integer.valueOf(4).equals(SecurityUtils.getCurrentDataScope())) {
            query.in(FeigeBusinessTask::getDeptId, dataScopeHelper.deptSelfAndChildren(deptId));
        } else {
            query.eq(FeigeBusinessTask::getDeptId, deptId);
        }
    }

    private int safePage(Integer pageNum) {
        return pageNum == null || pageNum < 1 ? 1 : pageNum;
    }

    private int safeSize(Integer pageSize) {
        return pageSize == null ? 20 : Math.max(1, Math.min(pageSize, 200));
    }

    private Map<String, Object> toView(FeigeBusinessTask task) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", task.getId());
        row.put("orderId", task.getOrderId());
        row.put("orderNo", task.getOrderNo());
        row.put("companyName", task.getCompanyName());
        row.put("businessType", task.getBusinessType());
        row.put("status", task.getTaskStatus());
        row.put("priority", task.getPriority());
        row.put("assigneeId", task.getOwnerId());
        row.put("assigneeName", task.getOwnerName());
        row.put("receivedUserName", task.getReceivedByName());
        row.put("receivedTime", task.getReceivedTime());
        row.put("managerName", task.getManagerReviewerName());
        row.put("managerReviewStatus", task.getManagerReviewStatus());
        row.put("managerReviewRemark", task.getManagerReviewRemark());
        row.put("managerReviewTime", task.getManagerReviewTime());
        row.put("costCategory", task.getCostCategory());
        row.put("costAmount", task.getCostAmount());
        row.put("orderAmount", task.getOrderAmount());
        row.put("receivedAmount", task.getReceivedAmount());
        row.put("deadline", task.getDeadline());
        row.put("handoverToId", task.getHandoverToId());
        row.put("handoverToName", task.getHandoverToName());
        row.put("exceptionReason", task.getExceptionReason());
        row.put("remarks", task.getRemarks());
        boolean manager = access.isManager();
        Long currentUserId = access.currentUserId();
        boolean owner = Objects.equals(task.getOwnerId(), currentUserId);
        row.put("canManagerReview", manager && PENDING_MANAGER_AUDIT.equals(task.getTaskStatus()));
        row.put("canReassign", manager && Set.of(ASSIGNED_TO_ME, TASK, PROBLEM_TASK, RECYCLE_BIN)
                .contains(task.getTaskStatus()));
        row.put("canReceive", (PUBLIC_SEA.equals(task.getTaskStatus())
                && access.canClaimDepartment(task.getDeptId()))
                || (ASSIGNED_TO_ME.equals(task.getTaskStatus()) && owner));
        row.put("canOperate", TASK.equals(task.getTaskStatus())
                && (owner || (manager && access.canAccess(task.getOwnerId(), task.getDeptId()))));
        row.put("canHandover", TASK.equals(task.getTaskStatus()) && owner);
        row.put("canConfirmHandover", HANDOVER.equals(task.getTaskStatus())
                && (Objects.equals(task.getHandoverToId(), currentUserId)
                || (manager && access.canAccess(task.getOwnerId(), task.getDeptId()))));
        row.put("canRecycle", PROBLEM_TASK.equals(task.getTaskStatus())
                && (owner || (manager && access.canAccess(task.getOwnerId(), task.getDeptId()))));
        row.put("createTime", task.getCreateTime());
        row.put("updateTime", task.getUpdateTime());
        return row;
    }
}
