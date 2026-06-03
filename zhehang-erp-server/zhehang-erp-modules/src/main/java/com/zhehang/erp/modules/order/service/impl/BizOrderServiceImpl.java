package com.zhehang.erp.modules.order.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.order.domain.BizOrder;
import com.zhehang.erp.modules.order.domain.BizOrderApproval;
import com.zhehang.erp.modules.order.domain.BizOrderItem;
import com.zhehang.erp.modules.order.mapper.BizOrderApprovalMapper;
import com.zhehang.erp.modules.order.mapper.BizOrderItemMapper;
import com.zhehang.erp.modules.order.mapper.BizOrderMapper;
import com.zhehang.erp.modules.order.service.IBizOrderService;
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

    @Override
    public IPage<BizOrder> selectPage(int pageNum, int pageSize, Integer status, Long customerId, String orderNo) {
        LambdaQueryWrapper<BizOrder> wrapper = new LambdaQueryWrapper<>();
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
        if (order.getStatus() == null) {
            order.setStatus(1);
        }
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
        recordApproval(id, "submit", operatorId, null, "submit", null);
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
        recordApproval(id, "approve", approverId, "主管", "approve", comment);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void reject(Long id, Long approverId, String comment) {
        BizOrder order = orderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException("订单不存在");
        }
        order.setStatus(7);
        orderMapper.updateById(order);
        recordApproval(id, "reject", approverId, "主管", "reject", comment);
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
        recordApproval(id, "finance_confirm", approverId, "财务", "approve", comment);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void cancel(Long id, Long operatorId, String reason) {
        BizOrder order = orderMapper.selectById(id);
        if (order == null) {
            throw new BusinessException("订单不存在");
        }
        if (order.getStatus() != null && order.getStatus() == 5) {
            throw new BusinessException("已完成的订单不能取消");
        }
        order.setStatus(6);
        order.setCancelTime(LocalDateTime.now());
        order.setCancelReason(reason);
        orderMapper.updateById(order);
        recordApproval(id, "cancel", operatorId, null, "cancel", reason);
    }

    @Override
    public Map<String, Object> stats() {
        Map<String, Object> result = new HashMap<>();
        for (int s = 1; s <= 7; s++) {
            LambdaQueryWrapper<BizOrder> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(BizOrder::getStatus, s);
            result.put("status_" + s, orderMapper.selectCount(wrapper));
        }
        result.put("total", orderMapper.selectCount(null));
        return result;
    }

    private void recordApproval(Long orderId, String node, Long approverId, String role, String result, String comment) {
        BizOrderApproval ap = new BizOrderApproval();
        ap.setOrderId(orderId);
        ap.setNode(node);
        ap.setApproverId(approverId);
        ap.setApproverRole(role);
        ap.setResult(result);
        ap.setComment(comment);
        ap.setApproveTime(LocalDateTime.now());
        approvalMapper.insert(ap);
    }
}
