package com.zhehang.erp.modules.order.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.order.domain.BizOrder;
import com.zhehang.erp.modules.order.domain.BizOrderApproval;
import com.zhehang.erp.modules.order.domain.BizOrderItem;
import com.zhehang.erp.modules.order.mapper.BizOrderApprovalMapper;
import com.zhehang.erp.modules.order.mapper.BizOrderItemMapper;
import com.zhehang.erp.modules.order.mapper.BizOrderMapper;
import com.zhehang.erp.modules.order.service.IBizOrderService;
import com.zhehang.erp.modules.order.service.OrderImNotificationService;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.review.service.OrderReviewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class BizOrderServiceImpl extends ServiceImpl<BizOrderMapper, BizOrder> implements IBizOrderService {

    private final BizOrderMapper orderMapper;
    private final BizOrderItemMapper itemMapper;
    private final BizOrderApprovalMapper approvalMapper;
    private final DataScopeHelper dataScopeHelper;
    private final OrderImNotificationService imNotificationService;
    private final OrderReviewService reviewService;

    @Override
    public IPage<BizOrder> selectPage(int pageNum, int pageSize, Integer status, Long customerId, String orderNo) {
        LambdaQueryWrapper<BizOrder> wrapper = new LambdaQueryWrapper<>();
        // 数据范围:销售看本人订单、主管看本部门、财务/管理员看全部(对账)
        dataScopeHelper.applyFinancial(wrapper, BizOrder::getSalesmanId, BizOrder::getDeptId);
        wrapper.eq(status != null, BizOrder::getStatus, status)
                .eq(customerId != null, BizOrder::getCustomerId, customerId)
                .like(StringUtils.hasText(orderNo), BizOrder::getOrderNo, orderNo)
                .orderByDesc(BizOrder::getCreateTime);
        return orderMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
    }

    @Override
    public Map<String, Object> getDetail(Long id) {
        BizOrder order = orderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException("订单不存在");
        }
        LambdaQueryWrapper<BizOrderItem> itemWrapper = new LambdaQueryWrapper<>();
        itemWrapper.eq(BizOrderItem::getOrderId, id).orderByAsc(BizOrderItem::getSortOrder);
        List<BizOrderItem> items = itemMapper.selectList(itemWrapper);

        LambdaQueryWrapper<BizOrderApproval> apWrapper = new LambdaQueryWrapper<>();
        apWrapper.eq(BizOrderApproval::getOrderId, id).orderByAsc(BizOrderApproval::getCreateTime);
        List<BizOrderApproval> approvals = approvalMapper.selectList(apWrapper);

        Map<String, Object> result = new HashMap<>();
        result.put("order", order);
        result.put("items", items);
        result.put("approvals", approvals);
        return result;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long createWithItems(BizOrder order, List<BizOrderItem> items) {
        // 状态是服务端状态机的事实,绝不收请求体的值:否则带 status=4 建单可直接"跳过"主管+财务两级审批
        order.setStatus(1);
        if (!StringUtils.hasText(order.getOrderNo())) {
            order.setOrderNo("ORD" + System.currentTimeMillis());
        }
        orderMapper.insert(order);
        if (items != null) {
            for (BizOrderItem item : items) {
                item.setOrderId(order.getId());
                itemMapper.insert(item);
            }
        }
        return order.getId();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateWithItems(BizOrder order, List<BizOrderItem> items) {
        BizOrder exist = orderMapper.selectById(order.getId());
        if (exist == null) {
            throw new BusinessException("订单不存在");
        }
        if (exist.getStatus() != null && exist.getStatus() >= 4) {
            throw new BusinessException("订单已确认,不能修改");
        }
        // 状态只能走 submit/approve/reject/finance-confirm/cancel 状态机:
        // 这里曾收请求体 status,>200 元的单可被伪造 status=4 直接跳过财务二级审批(金额分级形同虚设)
        order.setStatus(exist.getStatus());
        orderMapper.updateById(order);
        if (items != null) {
            LambdaQueryWrapper<BizOrderItem> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(BizOrderItem::getOrderId, order.getId());
            itemMapper.delete(wrapper);
            for (BizOrderItem item : items) {
                item.setId(null);
                item.setOrderId(order.getId());
                itemMapper.insert(item);
            }
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void submit(Long id, Long operatorId) {
        BizOrder order = orderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException("订单不存在");
        }
        if (order.getStatus() != null && order.getStatus() != 1 && order.getStatus() != 7) {
            throw new BusinessException("当前状态不可提交审批");
        }
        order.setStatus(2);
        order.setSubmitTime(LocalDateTime.now());
        orderMapper.updateById(order);
        Long actorId = currentActorId(operatorId);
        Long approvalId = recordApproval(id, "submit", actorId, null, "submit", null);
        imNotificationService.notifyTransition(order, OrderImNotificationService.SUBMITTED,
                approvalId, actorId, null);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void approve(Long id, Long approverId, String comment) {
        BizOrder order = orderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException("订单不存在");
        }
        if (order.getStatus() == null || order.getStatus() != 2) {
            throw new BusinessException("订单状态非待审批");
        }
        order.setStatus(3);
        order.setApproveTime(LocalDateTime.now());
        orderMapper.updateById(order);
        Long actorId = currentActorId(approverId);
        Long approvalId = recordApproval(id, "approve", actorId, "主管", "approve", comment);
        imNotificationService.notifyTransition(order, OrderImNotificationService.APPROVED,
                approvalId, actorId, comment);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void reject(Long id, Long approverId, String comment) {
        BizOrder order = orderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException("订单不存在");
        }
        // 状态守卫:只有待审批(2)的订单能驳回,否则已完成/已确认/已取消单会被静默翻成"已驳回"(与 approve 同口径)
        if (order.getStatus() == null || order.getStatus() != 2) {
            throw new BusinessException("订单状态非待审批,不能驳回");
        }
        if (!StringUtils.hasText(comment)) {
            throw new BusinessException("驳回必须填写原因");
        }
        order.setStatus(7);
        orderMapper.updateById(order);
        Long actorId = currentActorId(approverId);
        Long approvalId = recordApproval(id, "reject", actorId, "主管", "reject", comment);
        imNotificationService.notifyTransition(order, OrderImNotificationService.REJECTED,
                approvalId, actorId, comment);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void financeConfirm(Long id, Long approverId, String comment) {
        BizOrder order = orderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException("订单不存在");
        }
        if (order.getStatus() == null || order.getStatus() != 3) {
            throw new BusinessException("订单尚未通过主管审批");
        }
        order.setStatus(4);
        order.setFinanceConfirmTime(LocalDateTime.now());
        orderMapper.updateById(order);
        Long actorId = currentActorId(approverId);
        Long approvalId = recordApproval(id, "finance_confirm", actorId, "财务", "approve", comment);
        reviewService.activateFromFinanceConfirmed(order, actorId, approvalId, comment);
        imNotificationService.notifyTransition(order, OrderImNotificationService.FINANCE_CONFIRMED,
                approvalId, actorId, comment);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void cancel(Long id, Long operatorId, String reason) {
        BizOrder order = orderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException("订单不存在");
        }
        if (order.getStatus() != null && order.getStatus() >= 4) {
            throw new BusinessException("已确认或已完成的订单不能取消");
        }
        order.setStatus(6);
        order.setCancelTime(LocalDateTime.now());
        order.setCancelReason(reason);
        orderMapper.updateById(order);
        recordApproval(id, "cancel", currentActorId(operatorId), null, "cancel", reason);
    }

    @Override
    public Map<String, Object> stats() {
        Map<String, Object> result = new HashMap<>();
        // 数据范围收敛:与 selectPage 同口径(财务/管理员看全部、主管看本部门、销售看本人),避免只读统计越权
        LambdaQueryWrapper<BizOrder> wrapper = new LambdaQueryWrapper<>();
        dataScopeHelper.applyFinancial(wrapper, BizOrder::getSalesmanId, BizOrder::getDeptId);
        // 仅取 status 列,在 Java 里聚合各状态单数(返回结构与原 GROUP BY 等价)
        wrapper.select(BizOrder::getStatus);
        long total = 0L;
        java.util.Map<Integer, Long> byStatus = new java.util.HashMap<>();
        for (BizOrder order : orderMapper.selectList(wrapper)) {
            total++; // total 含数据范围内全部非删除单(与逐条 count 等价)
            Integer st = order.getStatus();
            if (st != null) {
                byStatus.merge(st, 1L, Long::sum);
            }
        }
        for (int s = 1; s <= 7; s++) {
            result.put("status_" + s, byStatus.getOrDefault(s, 0L));
        }
        result.put("total", total);
        return result;
    }

    private Long recordApproval(Long orderId, String node, Long approverId, String role, String result, String comment) {
        BizOrderApproval ap = new BizOrderApproval();
        ap.setOrderId(orderId);
        ap.setNode(node);
        ap.setApproverId(approverId);
        // 审批人姓名落库:历史上从不赋值,流水表 approver_name 全 NULL,审批追溯断链
        if (approverId != null) {
            ap.setApproverName(dataScopeHelper.resolveUserNames(java.util.List.of(approverId)).get(approverId));
        }
        ap.setApproverRole(role);
        ap.setResult(result);
        ap.setComment(comment);
        ap.setApproveTime(LocalDateTime.now());
        approvalMapper.insert(ap);
        return ap.getId();
    }

    /** HTTP 入参中的人员 ID 不能作为操作人事实来源，登录身份优先。 */
    private Long currentActorId(Long requestedId) {
        Long current = SecurityUtils.getCurrentUserId();
        return current != null ? current : requestedId;
    }
}
