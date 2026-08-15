package com.zhehang.erp.modules.task.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.contract.domain.BizContract;
import com.zhehang.erp.modules.contract.mapper.BizContractMapper;
import com.zhehang.erp.modules.crm.domain.entity.CrmCustomer;
import com.zhehang.erp.modules.crm.mapper.CrmCustomerMapper;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.im.service.ImBusinessNotificationPublisher;
import com.zhehang.erp.modules.task.domain.BizTask;
import com.zhehang.erp.modules.task.domain.BizTaskHandover;
import com.zhehang.erp.modules.task.domain.BizTaskHandoverItem;
import com.zhehang.erp.modules.task.domain.dto.HandoverCreateDTO;
import com.zhehang.erp.modules.task.domain.dto.HandoverItemUpdateDTO;
import com.zhehang.erp.modules.task.mapper.BizTaskHandoverItemMapper;
import com.zhehang.erp.modules.task.mapper.BizTaskHandoverMapper;
import com.zhehang.erp.modules.task.mapper.BizTaskMapper;
import com.zhehang.erp.modules.task.service.IBizTaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BizTaskServiceImpl extends ServiceImpl<BizTaskMapper, BizTask> implements IBizTaskService {

    private final BizTaskMapper taskMapper;
    private final BizTaskHandoverMapper handoverMapper;
    private final BizTaskHandoverItemMapper handoverItemMapper;
    // 注入 mapper 而非 IBizContractService:避免 contract(派单依赖task)↔task 的Spring循环依赖
    private final BizContractMapper contractMapper;
    private final CrmCustomerMapper customerMapper;
    private final DataScopeHelper dataScopeHelper;
    private final ImBusinessNotificationPublisher notificationPublisher;

    @Override
    public IPage<BizTask> selectPage(int pageNum, int pageSize, String taskType, Integer status, Long executorId) {
        LambdaQueryWrapper<BizTask> wrapper = new LambdaQueryWrapper<>();
        // 数据范围:老板/管理员/财务部(data_scope=1)看全部;主管看本部门(及以下)交付任务;执行人看分配给自己的。
        // 待指派任务(executorId/dept_id为空)对主管和执行人都可见,以便认领/指派。
        Integer scope = SecurityUtils.getCurrentDataScope();
        boolean seeAll = SecurityUtils.isCurrentAdmin() || (scope != null && scope == 1);
        if (!seeAll) {
            if (SecurityUtils.hasAnyRole("dept_manager")) {
                Long myDept = SecurityUtils.getCurrentDeptId();
                if (myDept != null) {
                    java.util.List<Long> deptIds = dataScopeHelper.deptSelfAndChildren(myDept);
                    wrapper.and(w -> w.in(BizTask::getDeptId, deptIds).or().isNull(BizTask::getDeptId));
                } else {
                    wrapper.isNull(BizTask::getDeptId); // 主管无部门:只看待指派,兜底从严
                }
            } else {
                Long uid = SecurityUtils.getCurrentUserId();
                wrapper.and(w -> w.eq(BizTask::getExecutorId, uid).or().isNull(BizTask::getExecutorId));
            }
        }
        wrapper.eq(StringUtils.hasText(taskType), BizTask::getTaskType, taskType)
                .eq(status != null, BizTask::getStatus, status)
                .eq(executorId != null, BizTask::getExecutorId, executorId)
                .orderByDesc(BizTask::getCreateTime);
        return taskMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
    }

    @Override
    public Long createTask(BizTask task) {
        if (!StringUtils.hasText(task.getTaskNo())) {
            task.setTaskNo("TSK" + System.currentTimeMillis());
        }
        if (task.getStatus() == null) {
            task.setStatus(task.getExecutorId() != null ? 2 : 1);
        }
        if (task.getPriority() == null) {
            task.setPriority(2);
        }
        taskMapper.insert(task);
        return task.getId();
    }

    @Override
    public void assign(Long id, Long executorId, String executorName) {
        BizTask task = taskMapper.selectById(id);
        if (task == null) {
            throw new BusinessException("任务不存在");
        }
        task.setExecutorId(executorId);
        task.setExecutorName(executorName);
        task.setDeptId(dataScopeHelper.deptIdOfUser(executorId)); // 归属交付部门=执行人部门(主管按部门看任务)
        if (task.getStatus() != null && task.getStatus() == 1) {
            task.setStatus(2);
        }
        taskMapper.updateById(task);
    }

    @Override
    public void start(Long id, Long operatorId) {
        BizTask task = taskMapper.selectById(id);
        if (task == null) {
            throw new BusinessException("任务不存在");
        }
        if (task.getStatus() == null || task.getStatus() != 2) {
            throw new BusinessException("任务状态不正确");
        }
        task.setStatus(3);
        task.setActualStartTime(LocalDateTime.now());
        taskMapper.updateById(task);
    }

    @Override
    public void complete(Long id, String result, Long operatorId) {
        BizTask task = taskMapper.selectById(id);
        if (task == null) {
            throw new BusinessException("任务不存在");
        }
        if (task.getStatus() == null || !(task.getStatus() == 2 || task.getStatus() == 3 || task.getStatus() == 6)) {
            throw new BusinessException("任务状态不正确");
        }
        task.setStatus(4);
        task.setResult(result);
        task.setActualEndTime(LocalDateTime.now());
        taskMapper.updateById(task);
    }

    @Override
    public void review(Long id, boolean pass, String comment, Long reviewerId) {
        BizTask task = taskMapper.selectById(id);
        if (task == null) {
            throw new BusinessException("任务不存在");
        }
        if (task.getStatus() == null || task.getStatus() != 4) {
            throw new BusinessException("任务未到待验收状态,不能验收");
        }
        task.setStatus(pass ? 5 : 6);
        task.setReviewComment(comment);
        task.setReviewerId(reviewerId);
        task.setReviewTime(LocalDateTime.now());
        taskMapper.updateById(task);
        if (pass) {
            markContractServingIfAllDone(task);
        }
    }

    /**
     * 交付闭环回写:某合同派生的交付任务全部验收完成时,把合同状态置为"服务中"(status=5)。
     * 即 派交付→交付完成→进入服务。用 contractMapper 直接更新(避免service循环依赖)。
     */
    private void markContractServingIfAllDone(BizTask task) {
        if (!"contract".equals(task.getBizType()) || task.getBizId() == null) {
            return;
        }
        // 该合同下仍未结束(既非已完成5也非已取消7)的交付任务数
        Long pending = taskMapper.selectCount(new LambdaQueryWrapper<BizTask>()
                .eq(BizTask::getBizId, task.getBizId())
                .eq(BizTask::getBizType, "contract")
                .notIn(BizTask::getStatus, 5, 7));
        if (pending != null && pending == 0) {
            BizContract contract = contractMapper.selectById(task.getBizId());
            if (contract != null && contract.getStatus() != null && contract.getStatus() == 4) {
                LambdaUpdateWrapper<BizContract> uw = new LambdaUpdateWrapper<>();
                uw.eq(BizContract::getId, contract.getId()).set(BizContract::getStatus, 5); // 5=服务中/履约中
                contractMapper.update(null, uw);
            }
        }
    }

    @Override
    public IPage<BizTask> myTasks(int pageNum, int pageSize, Long userId) {
        LambdaQueryWrapper<BizTask> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(BizTask::getExecutorId, userId)
                .in(BizTask::getStatus, 2, 3, 4)
                .orderByAsc(BizTask::getPriority)
                .orderByAsc(BizTask::getPlanEndTime);
        return taskMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
    }

    /**
     * 任务数据范围:与 selectPage() 完全一致。老板/管理员/财务部(data_scope=1)看全部;
     * 主管看本部门(及以下)交付任务+待指派;执行人看分配给自己的+待指派。
     * 只读统计/逾期等查询复用此方法,避免任何人可见全公司任务的越权。
     */
    private void applyTaskScope(LambdaQueryWrapper<BizTask> wrapper) {
        Integer scope = SecurityUtils.getCurrentDataScope();
        boolean seeAll = SecurityUtils.isCurrentAdmin() || (scope != null && scope == 1);
        if (!seeAll) {
            if (SecurityUtils.hasAnyRole("dept_manager")) {
                Long myDept = SecurityUtils.getCurrentDeptId();
                if (myDept != null) {
                    java.util.List<Long> deptIds = dataScopeHelper.deptSelfAndChildren(myDept);
                    wrapper.and(w -> w.in(BizTask::getDeptId, deptIds).or().isNull(BizTask::getDeptId));
                } else {
                    wrapper.isNull(BizTask::getDeptId); // 主管无部门:只看待指派,兜底从严
                }
            } else {
                Long uid = SecurityUtils.getCurrentUserId();
                wrapper.and(w -> w.eq(BizTask::getExecutorId, uid).or().isNull(BizTask::getExecutorId));
            }
        }
    }

    @Override
    public List<BizTask> overdueTasks() {
        LambdaQueryWrapper<BizTask> wrapper = new LambdaQueryWrapper<>();
        applyTaskScope(wrapper);
        wrapper.lt(BizTask::getPlanEndTime, LocalDateTime.now())
                .notIn(BizTask::getStatus, 5, 7)
                .orderByAsc(BizTask::getPlanEndTime);
        return taskMapper.selectList(wrapper);
    }

    @Override
    public Map<String, Object> stats() {
        Map<String, Object> result = new HashMap<>();
        // 数据范围收敛:仅统计当前用户可见的任务(与 selectPage 一致),避免任何人看全公司统计。
        // 取出可见任务后在 Java 内按 status 计数;补齐 status_1..7 全部 key 保持返回结构不变。
        LambdaQueryWrapper<BizTask> wrapper = new LambdaQueryWrapper<>();
        applyTaskScope(wrapper);
        wrapper.select(BizTask::getStatus); // 只取 status 列,减少回表
        java.util.Map<Integer, Long> byStatus = new java.util.HashMap<>();
        for (BizTask t : taskMapper.selectList(wrapper)) {
            Integer st = t.getStatus();
            if (st != null) {
                byStatus.merge(st, 1L, Long::sum);
            }
        }
        for (int s = 1; s <= 7; s++) {
            result.put("status_" + s, byStatus.getOrDefault(s, 0L));
        }
        result.put("overdue", overdueTasks().size());
        return result;
    }

    @Override
    public IPage<BizTaskHandover> handoverList(int pageNum, int pageSize, Long customerId,
                                                String status, String keyword) {
        LambdaQueryWrapper<BizTaskHandover> wrapper = handoverScope();
        wrapper.eq(customerId != null, BizTaskHandover::getCustomerId, customerId);
        applyHandoverStatus(wrapper, status);
        applyHandoverKeyword(wrapper, keyword);
        wrapper.orderByAsc(BizTaskHandover::getDeadline)
                .orderByDesc(BizTaskHandover::getCreateTime);

        int safePage = Math.max(1, pageNum);
        int safeSize = Math.min(100, Math.max(1, pageSize));
        IPage<BizTaskHandover> page = handoverMapper.selectPage(new Page<>(safePage, safeSize), wrapper);
        enrichHandovers(page.getRecords());
        return page;
    }

    @Override
    public BizTaskHandover handoverDetail(Long handoverId) {
        BizTaskHandover handover = getHandoverOrThrow(handoverId);
        assertHandoverReadable(handover);
        enrichHandovers(Collections.singletonList(handover));
        return handover;
    }

    @Override
    public Map<String, Object> handoverStats() {
        List<BizTaskHandover> rows = handoverMapper.selectList(handoverScope());
        LocalDate today = LocalDate.now();
        Long currentUserId = SecurityUtils.getCurrentUserId();
        long pending = 0;
        long inProgress = 0;
        long completed = 0;
        long overdue = 0;
        long waitingForMe = 0;
        for (BizTaskHandover row : rows) {
            if ("pending".equals(row.getStatus())) pending++;
            if ("in_progress".equals(row.getStatus()) || "returned".equals(row.getStatus())) inProgress++;
            if ("completed".equals(row.getStatus())) completed++;
            if (!"completed".equals(row.getStatus()) && row.getDeadline() != null
                    && row.getDeadline().isBefore(today)) {
                overdue++;
            }
            if (Objects.equals(currentUserId, row.getAccountantId())
                    && ("pending".equals(row.getStatus()) || "in_progress".equals(row.getStatus())
                    || "returned".equals(row.getStatus()))) {
                waitingForMe++;
            }
        }
        Map<String, Object> result = new HashMap<>();
        result.put("total", rows.size());
        result.put("pending", pending);
        result.put("inProgress", inProgress);
        result.put("completed", completed);
        result.put("overdue", overdue);
        result.put("waitingForMe", waitingForMe);
        return result;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long createHandover(HandoverCreateDTO dto) {
        // 锁住合同后再检查活动交接单，避免双击或并发请求创建两张进行中交接单。
        BizContract contract = contractMapper.selectOne(new LambdaQueryWrapper<BizContract>()
                .eq(BizContract::getId, dto.getContractId())
                .last("FOR UPDATE"));
        if (contract == null) {
            throw new BusinessException("关联合同不存在");
        }
        if (!dataScopeHelper.canAccess(contract.getSalesmanId(), contract.getDeptId())) {
            throw new BusinessException("无权为数据范围外的合同发起交接");
        }
        Long currentUserId = SecurityUtils.getCurrentUserId();
        if (!Objects.equals(currentUserId, contract.getSalesmanId()) && !dataScopeHelper.isManagerOrAdmin()) {
            throw new BusinessException("只有合同销售或其管理人员可以发起交接");
        }
        if (contract.getStatus() == null || (contract.getStatus() != 4 && contract.getStatus() != 5)) {
            throw new BusinessException("合同尚未完成签署，不能发起交接");
        }
        if (contract.getCustomerId() == null) {
            throw new BusinessException("合同未关联正式客户，请先补全合同客户");
        }
        if (dto.getDeadline().isBefore(LocalDate.now())) {
            throw new BusinessException("交接截止日不能早于今天");
        }

        Map<Long, String> targetName = dataScopeHelper.resolveUserNames(List.of(dto.getAccountantId()));
        if (!targetName.containsKey(dto.getAccountantId())) {
            throw new BusinessException("接收人不存在或尚未开通系统账号");
        }

        Long active = handoverMapper.selectCount(new LambdaQueryWrapper<BizTaskHandover>()
                .eq(BizTaskHandover::getContractId, contract.getId())
                .in(BizTaskHandover::getStatus, "pending", "in_progress", "returned"));
        if (active != null && active > 0) {
            throw new BusinessException("该合同已有未完成的交接单，请勿重复发起");
        }

        Long salesId = contract.getSalesmanId() != null ? contract.getSalesmanId() : currentUserId;
        if (Objects.equals(salesId, dto.getAccountantId())) {
            throw new BusinessException("移交人和接收人不能是同一人");
        }

        BizTaskHandover handover = new BizTaskHandover();
        handover.setHandoverNo("HOV" + System.currentTimeMillis());
        handover.setContractId(contract.getId());
        handover.setCustomerId(contract.getCustomerId());
        handover.setSalesId(salesId);
        handover.setAccountantId(dto.getAccountantId());
        handover.setStatus("pending");
        handover.setDeadline(dto.getDeadline());
        handover.setNote(StringUtils.hasText(dto.getNote()) ? dto.getNote().trim() : null);
        handoverMapper.insert(handover);

        List<BizTaskHandoverItem> templates = handoverItemMapper.selectList(
                new LambdaQueryWrapper<BizTaskHandoverItem>()
                        .isNull(BizTaskHandoverItem::getHandoverId)
                        .orderByAsc(BizTaskHandoverItem::getItemOrder));
        if (templates == null || templates.isEmpty()) {
            templates = standardHandoverTemplates();
        }
        for (BizTaskHandoverItem template : templates) {
            BizTaskHandoverItem item = new BizTaskHandoverItem();
            item.setHandoverId(handover.getId());
            item.setItemOrder(template.getItemOrder());
            item.setItemName(template.getItemName());
            item.setIsRequired(template.getIsRequired());
            item.setDescription(template.getDescription());
            handoverItemMapper.insert(item);
        }
        sendHandoverNotice(dto.getAccountantId(), handover.getId(),
                "handover:" + handover.getId() + ":created", "handover.created", "pending",
                "有新的客户交接待接收",
                firstText(contract.getCustomerName(), "客户") + " · 请于 " + dto.getDeadline() + " 前完成资料验收",
                "去接收", true);
        return handover.getId();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void acceptHandover(Long handoverId) {
        BizTaskHandover handover = getHandoverOrThrow(handoverId);
        assertHandoverReadable(handover);
        if (!canReceive(handover)) {
            throw new BusinessException("只有指定接收人或其主管可以接收交接");
        }
        if ("completed".equals(handover.getStatus())) {
            throw new BusinessException("交接单已完成，无需重复接收");
        }
        if (!"pending".equals(handover.getStatus()) && !"returned".equals(handover.getStatus())) {
            throw new BusinessException("当前交接状态不可接收");
        }
        handoverMapper.update(null, new LambdaUpdateWrapper<BizTaskHandover>()
                .eq(BizTaskHandover::getId, handoverId)
                .set(BizTaskHandover::getStatus, "in_progress"));
        sendHandoverNotice(handover.getSalesId(), handoverId,
                "handover:" + handoverId + ":accepted", "handover.accepted", "in_progress",
                "客户交接已接收", "接收人已接单，请按清单及时补齐资料", "查看交接", false);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateHandoverItem(Long handoverId, HandoverItemUpdateDTO dto) {
        BizTaskHandover handover = getHandoverOrThrow(handoverId);
        assertHandoverReadable(handover);
        if ("completed".equals(handover.getStatus())) {
            throw new BusinessException("交接单已完成，不能再修改清单");
        }

        BizTaskHandoverItem existing = handoverItemMapper.selectById(dto.getItemId());
        if (existing == null || !Objects.equals(existing.getHandoverId(), handoverId)) {
            throw new BusinessException("交接清单项不存在或不属于当前交接单");
        }

        boolean salesAction = StringUtils.hasText(dto.getSalesStatus())
                || dto.getSupplyExpectedDate() != null || dto.getFileUrl() != null;
        boolean accountantAction = StringUtils.hasText(dto.getAccountantStatus())
                || dto.getRejectReason() != null;
        if (!salesAction && !accountantAction) {
            throw new BusinessException("未提交任何有效的交接操作");
        }
        if (salesAction && !canEditSales(handover)) {
            throw new BusinessException("只有移交销售或其主管可以更新资料提供状态");
        }
        if (accountantAction && !canReceive(handover)) {
            throw new BusinessException("只有指定接收人或其主管可以验收资料");
        }

        LambdaUpdateWrapper<BizTaskHandoverItem> update = new LambdaUpdateWrapper<BizTaskHandoverItem>()
                .eq(BizTaskHandoverItem::getId, existing.getId())
                .eq(BizTaskHandoverItem::getHandoverId, handoverId);

        String effectiveSalesStatus = existing.getSalesStatus();
        if (StringUtils.hasText(dto.getSalesStatus())) {
            if (!"provided".equals(dto.getSalesStatus()) && !"pending_supply".equals(dto.getSalesStatus())) {
                throw new BusinessException("资料提供状态不正确");
            }
            effectiveSalesStatus = dto.getSalesStatus();
            update.set(BizTaskHandoverItem::getSalesStatus, effectiveSalesStatus);
            if ("pending_supply".equals(effectiveSalesStatus)) {
                if (dto.getSupplyExpectedDate() == null) {
                    throw new BusinessException("标记待补齐时必须填写预计补齐日期");
                }
                if (dto.getSupplyExpectedDate().isBefore(LocalDate.now())) {
                    throw new BusinessException("预计补齐日期不能早于今天");
                }
                update.set(BizTaskHandoverItem::getSupplyExpectedDate, dto.getSupplyExpectedDate());
            } else {
                update.set(BizTaskHandoverItem::getSupplyExpectedDate, null)
                        .set(BizTaskHandoverItem::getAccountantStatus, null)
                        .set(BizTaskHandoverItem::getRejectReason, null);
            }
        }
        if (dto.getFileUrl() != null) {
            update.set(BizTaskHandoverItem::getFileUrl,
                    StringUtils.hasText(dto.getFileUrl()) ? dto.getFileUrl().trim() : null);
        }

        if (StringUtils.hasText(dto.getAccountantStatus())) {
            if (!"confirmed".equals(dto.getAccountantStatus()) && !"rejected".equals(dto.getAccountantStatus())) {
                throw new BusinessException("资料验收状态不正确");
            }
            if (!"provided".equals(effectiveSalesStatus)) {
                throw new BusinessException("销售尚未标记已提供，接收人不能直接验收");
            }
            if ("rejected".equals(dto.getAccountantStatus()) && !StringUtils.hasText(dto.getRejectReason())) {
                throw new BusinessException("退回资料时必须填写原因");
            }
            update.set(BizTaskHandoverItem::getAccountantStatus, dto.getAccountantStatus())
                    .set(BizTaskHandoverItem::getRejectReason,
                            "rejected".equals(dto.getAccountantStatus()) ? dto.getRejectReason().trim() : null);
        }

        boolean newRejection = "rejected".equals(dto.getAccountantStatus())
                && (!"rejected".equals(existing.getAccountantStatus())
                || !Objects.equals(existing.getRejectReason(), dto.getRejectReason().trim()));
        String normalizedFileUrl = dto.getFileUrl() == null ? existing.getFileUrl()
                : (StringUtils.hasText(dto.getFileUrl()) ? dto.getFileUrl().trim() : null);
        boolean newProvision = "provided".equals(dto.getSalesStatus())
                && (!"provided".equals(existing.getSalesStatus())
                || StringUtils.hasText(existing.getAccountantStatus())
                || !Objects.equals(existing.getFileUrl(), normalizedFileUrl));
        String eventVersion = handoverItemEventVersion(existing);

        handoverItemMapper.update(null, update);
        if (newRejection) {
            sendHandoverNotice(handover.getSalesId(), handoverId,
                    "handover:" + handoverId + ":i:" + existing.getId() + ":r:" + eventVersion,
                    "handover.item_rejected", "in_progress", "交接资料被退回",
                    existing.getItemName() + "：" + dto.getRejectReason().trim(), "去补资料", true);
        } else if (newProvision) {
            sendHandoverNotice(handover.getAccountantId(), handoverId,
                    "handover:" + handoverId + ":i:" + existing.getId() + ":p:" + eventVersion,
                    "handover.item_provided", "in_progress", "交接资料已重新提供",
                    existing.getItemName() + " 已等待验收", "去验收", true);
        }
        if ("pending".equals(handover.getStatus()) || "returned".equals(handover.getStatus())) {
            handoverMapper.update(null, new LambdaUpdateWrapper<BizTaskHandover>()
                    .eq(BizTaskHandover::getId, handoverId)
                    .set(BizTaskHandover::getStatus, "in_progress"));
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void completeHandover(Long handoverId) {
        BizTaskHandover handover = getHandoverOrThrow(handoverId);
        assertHandoverReadable(handover);
        if (!canReceive(handover)) {
            throw new BusinessException("只有指定接收人或其主管可以完成交接");
        }
        if ("completed".equals(handover.getStatus())) {
            return;
        }
        Long unconfirmedRequired = handoverItemMapper.selectCount(
                new LambdaQueryWrapper<BizTaskHandoverItem>()
                        .eq(BizTaskHandoverItem::getHandoverId, handoverId)
                        .eq(BizTaskHandoverItem::getIsRequired, 1)
                        .and(w -> w.isNull(BizTaskHandoverItem::getAccountantStatus)
                                .or().ne(BizTaskHandoverItem::getAccountantStatus, "confirmed")));
        if (unconfirmedRequired != null && unconfirmedRequired > 0) {
            throw new BusinessException("仍有必需交接项未验收合格，不能完成交接");
        }
        handoverMapper.update(null, new LambdaUpdateWrapper<BizTaskHandover>()
                .eq(BizTaskHandover::getId, handoverId)
                .set(BizTaskHandover::getStatus, "completed")
                .set(BizTaskHandover::getCompletedTime, LocalDateTime.now()));
        sendHandoverNotice(handover.getSalesId(), handoverId,
                "handover:" + handoverId + ":completed", "handover.completed", "completed",
                "客户交接已完成", "所有必需资料已验收合格，交接记录已锁定", "查看交接", false);
    }

    private LambdaQueryWrapper<BizTaskHandover> handoverScope() {
        LambdaQueryWrapper<BizTaskHandover> wrapper = new LambdaQueryWrapper<>();
        List<Long> visibleUserIds = dataScopeHelper.getVisibleUserIds();
        if (visibleUserIds != null) {
            wrapper.and(w -> w.in(BizTaskHandover::getSalesId, visibleUserIds)
                    .or().in(BizTaskHandover::getAccountantId, visibleUserIds));
        }
        return wrapper;
    }

    private void applyHandoverStatus(LambdaQueryWrapper<BizTaskHandover> wrapper, String status) {
        if (!StringUtils.hasText(status)) {
            return;
        }
        String normalized = status.trim().toLowerCase();
        if ("overdue".equals(normalized)) {
            wrapper.ne(BizTaskHandover::getStatus, "completed")
                    .lt(BizTaskHandover::getDeadline, LocalDate.now());
            return;
        }
        if (!Set.of("pending", "in_progress", "completed", "returned").contains(normalized)) {
            throw new BusinessException("交接状态筛选值不正确");
        }
        wrapper.eq(BizTaskHandover::getStatus, normalized);
    }

    private void applyHandoverKeyword(LambdaQueryWrapper<BizTaskHandover> wrapper, String keyword) {
        if (!StringUtils.hasText(keyword)) {
            return;
        }
        String term = keyword.trim();
        List<Long> customerIds = customerMapper.selectList(new LambdaQueryWrapper<CrmCustomer>()
                        .select(CrmCustomer::getId)
                        .like(CrmCustomer::getName, term)
                        .last("LIMIT 200"))
                .stream().map(CrmCustomer::getId).collect(Collectors.toList());
        wrapper.and(w -> {
            w.like(BizTaskHandover::getHandoverNo, term);
            if (!customerIds.isEmpty()) {
                w.or().in(BizTaskHandover::getCustomerId, customerIds);
            }
        });
    }

    private BizTaskHandover getHandoverOrThrow(Long handoverId) {
        BizTaskHandover handover = handoverMapper.selectById(handoverId);
        if (handover == null) {
            throw new BusinessException("交接单不存在");
        }
        return handover;
    }

    private void assertHandoverReadable(BizTaskHandover handover) {
        List<Long> visibleUserIds = dataScopeHelper.getVisibleUserIds();
        if (visibleUserIds != null && !visibleUserIds.contains(handover.getSalesId())
                && !visibleUserIds.contains(handover.getAccountantId())) {
            throw new BusinessException("无权查看数据范围外的交接单");
        }
    }

    private boolean canEditSales(BizTaskHandover handover) {
        return Objects.equals(SecurityUtils.getCurrentUserId(), handover.getSalesId())
                || dataScopeHelper.isManagerOrAdmin();
    }

    private boolean canReceive(BizTaskHandover handover) {
        return Objects.equals(SecurityUtils.getCurrentUserId(), handover.getAccountantId())
                || dataScopeHelper.isManagerOrAdmin();
    }

    private void enrichHandovers(List<BizTaskHandover> handovers) {
        if (handovers == null || handovers.isEmpty()) {
            return;
        }
        Set<Long> handoverIds = handovers.stream().map(BizTaskHandover::getId)
                .filter(Objects::nonNull).collect(Collectors.toSet());
        Set<Long> customerIds = handovers.stream().map(BizTaskHandover::getCustomerId)
                .filter(Objects::nonNull).collect(Collectors.toSet());
        Set<Long> contractIds = handovers.stream().map(BizTaskHandover::getContractId)
                .filter(Objects::nonNull).collect(Collectors.toSet());
        Set<Long> userIds = handovers.stream()
                .flatMap(h -> java.util.stream.Stream.of(h.getSalesId(), h.getAccountantId()))
                .filter(Objects::nonNull).collect(Collectors.toSet());

        Map<Long, CrmCustomer> customers = customerIds.isEmpty() ? Map.of()
                : customerMapper.selectBatchIds(customerIds).stream()
                .collect(Collectors.toMap(CrmCustomer::getId, Function.identity(), (a, b) -> a));
        Map<Long, BizContract> contracts = contractIds.isEmpty() ? Map.of()
                : contractMapper.selectBatchIds(contractIds).stream()
                .collect(Collectors.toMap(BizContract::getId, Function.identity(), (a, b) -> a));
        Map<Long, String> userNames = dataScopeHelper.resolveUserNames(userIds);
        Map<Long, List<BizTaskHandoverItem>> itemsByHandover = handoverIds.isEmpty() ? Map.of()
                : handoverItemMapper.selectList(new LambdaQueryWrapper<BizTaskHandoverItem>()
                        .in(BizTaskHandoverItem::getHandoverId, handoverIds)
                        .orderByAsc(BizTaskHandoverItem::getItemOrder))
                .stream().collect(Collectors.groupingBy(BizTaskHandoverItem::getHandoverId));

        Long currentUserId = SecurityUtils.getCurrentUserId();
        boolean manager = dataScopeHelper.isManagerOrAdmin();
        LocalDate today = LocalDate.now();
        for (BizTaskHandover handover : handovers) {
            CrmCustomer customer = customers.get(handover.getCustomerId());
            BizContract contract = contracts.get(handover.getContractId());
            List<BizTaskHandoverItem> items = new ArrayList<>(
                    itemsByHandover.getOrDefault(handover.getId(), List.of()));
            handover.setCustomerName(customer == null ? null : customer.getName());
            if (contract != null) {
                if (!StringUtils.hasText(handover.getCustomerName())) {
                    handover.setCustomerName(contract.getCustomerName());
                }
                handover.setContractNo(contract.getContractNo());
                handover.setContractTitle(contract.getTitle());
                handover.setContractAmount(contract.getAmount());
                handover.setOrderId(contract.getOrderId());
            }
            handover.setSalesName(userNames.getOrDefault(handover.getSalesId(), "未知销售"));
            handover.setAccountantName(userNames.getOrDefault(handover.getAccountantId(), "未知接收人"));
            handover.setItems(items);

            int itemTotal = items.size();
            int itemConfirmed = (int) items.stream()
                    .filter(item -> "confirmed".equals(item.getAccountantStatus())).count();
            int requiredTotal = (int) items.stream()
                    .filter(item -> Objects.equals(item.getIsRequired(), 1)).count();
            int requiredConfirmed = (int) items.stream()
                    .filter(item -> Objects.equals(item.getIsRequired(), 1)
                            && "confirmed".equals(item.getAccountantStatus())).count();
            boolean active = !"completed".equals(handover.getStatus());
            boolean canSales = active && (manager || Objects.equals(currentUserId, handover.getSalesId()));
            boolean canAccountant = active && (manager || Objects.equals(currentUserId, handover.getAccountantId()));
            handover.setItemTotal(itemTotal);
            handover.setItemConfirmed(itemConfirmed);
            handover.setRequiredTotal(requiredTotal);
            handover.setRequiredConfirmed(requiredConfirmed);
            handover.setProgress(itemTotal == 0 ? 0 : Math.round(itemConfirmed * 100F / itemTotal));
            handover.setOverdue(active && handover.getDeadline() != null && handover.getDeadline().isBefore(today));
            handover.setCanAccept(canAccountant && ("pending".equals(handover.getStatus())
                    || "returned".equals(handover.getStatus())));
            handover.setCanEditSales(canSales);
            handover.setCanConfirm(canAccountant);
            handover.setCanComplete(canAccountant && requiredTotal > 0
                    && requiredConfirmed == requiredTotal);
        }
    }

    private List<BizTaskHandoverItem> standardHandoverTemplates() {
        List<BizTaskHandoverItem> items = new ArrayList<>();
        items.add(template(1, "营业执照副本扫描件", true, "清晰彩色扫描件，包含统一社会信用代码"));
        items.add(template(2, "法人身份证正反面", true, "法定代表人身份证正反面照片"));
        items.add(template(3, "公司章程", true, "加盖公章的公司章程电子版"));
        items.add(template(4, "银行开户许可证/基本户信息", true, "基本账户开户许可证或开户证明"));
        items.add(template(5, "税务登记信息", true, "税务登记、办税员和电子税务局信息"));
        items.add(template(6, "社保公积金账户信息", false, "社保公积金账号及缴费基数"));
        items.add(template(7, "历史财务报表", true, "近三年资产负债表、利润表、现金流量表"));
        items.add(template(8, "历史纳税申报表", true, "近12个月增值税、企业所得税申报表"));
        items.add(template(9, "电子发票/税控盘信息", false, "税控盘、发票领购簿、电子发票账号"));
        items.add(template(10, "客户特殊需求说明", false, "销售承诺、服务边界、特殊风险和注意事项"));
        return items;
    }

    private BizTaskHandoverItem template(int order, String name, boolean required, String description) {
        BizTaskHandoverItem item = new BizTaskHandoverItem();
        item.setItemOrder(order);
        item.setItemName(name);
        item.setIsRequired(required ? 1 : 0);
        item.setDescription(description);
        return item;
    }

    private void sendHandoverNotice(Long userId, Long handoverId, String eventId, String eventType,
                                    String currentStatus, String title, String content,
                                    String actionLabel, boolean important) {
        if (userId == null) {
            throw new BusinessException("客户交接通知缺少接收人");
        }
        String link = "/business-handover" + (handoverId == null ? "" : "?handoverId=" + handoverId);
        notificationPublisher.publish(ImBusinessNotificationPublisher.Notice.builder()
                .eventId(eventId)
                .eventType(eventType)
                .title(title)
                .text(content)
                .recipientIds(List.of(userId))
                .businessType("handover")
                .businessId(handoverId)
                .currentStatus(currentStatus)
                .responsibleId(userId)
                .requirement(content)
                .actionLabel(actionLabel)
                .actionUrl(link)
                .important(important)
                .build());
    }

    /** 交接项没有独立历史表，以已落库更新时间和旧状态快照作为本次状态迁移版本。 */
    private String handoverItemEventVersion(BizTaskHandoverItem item) {
        LocalDateTime version = item.getUpdateTime() != null ? item.getUpdateTime() : item.getCreateTime();
        String timePart = version == null ? "initial" : version.toString();
        String statePart = Integer.toUnsignedString(Objects.hash(
                item.getSalesStatus(), item.getAccountantStatus(), item.getRejectReason(), item.getFileUrl()));
        return timePart + ":" + statePart;
    }

    private String firstText(String value, String fallback) {
        return StringUtils.hasText(value) ? value : fallback;
    }
}
