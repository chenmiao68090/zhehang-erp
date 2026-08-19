package com.zhehang.erp.modules.feigeorder.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.feigeorder.domain.dto.FeigeRefundRequest;
import com.zhehang.erp.modules.feigeorder.domain.entity.FeigeOrder;
import com.zhehang.erp.modules.feigeorder.domain.entity.FeigeOrderRefund;
import com.zhehang.erp.modules.feigeorder.mapper.FeigeOrderMapper;
import com.zhehang.erp.modules.feigeorder.mapper.FeigeOrderRefundMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import static com.zhehang.erp.modules.feigeorder.service.FeigeOrderConstants.ORDER_IN_PROGRESS;
import static com.zhehang.erp.modules.feigeorder.service.FeigeOrderConstants.ORDER_REFUNDED;
import static com.zhehang.erp.modules.feigeorder.service.FeigeOrderConstants.ORDER_REFUND_PENDING;
import static com.zhehang.erp.modules.feigeorder.service.FeigeOrderConstants.REFUND_APPROVED;
import static com.zhehang.erp.modules.feigeorder.service.FeigeOrderConstants.REFUND_COMPLETED;
import static com.zhehang.erp.modules.feigeorder.service.FeigeOrderConstants.REFUND_PENDING;
import static com.zhehang.erp.modules.feigeorder.service.FeigeOrderConstants.REFUND_REJECTED;
import static com.zhehang.erp.modules.feigeorder.service.FeigeOrderConstants.ZERO;
import static com.zhehang.erp.modules.feigeorder.service.FeigeOrderSupport.defaultText;
import static com.zhehang.erp.modules.feigeorder.service.FeigeOrderSupport.money;
import static com.zhehang.erp.modules.feigeorder.service.FeigeOrderSupport.page;
import static com.zhehang.erp.modules.feigeorder.service.FeigeOrderSupport.requireFinanceReviewer;
import static com.zhehang.erp.modules.feigeorder.service.FeigeOrderSupport.trimToNull;

/**
 * 飞哥版订单退费域：退费申请、主管/财务审核、驳回回滚与退费完成。
 *
 * <p>退费与订单实收金额强耦合：申请时把订单挂为退费中，驳回时回滚到申请前状态，
 * 完成时在同一事务内扣减订单实收金额（扣到 0 即整单退款）。订单行在退费三步中均取 FOR UPDATE 行锁，
 * 已完成退费不会被重复扣减，可退金额始终以订单当前实收为准。</p>
 */
@Service
@RequiredArgsConstructor
public class FeigeRefundService {

    private final FeigeOrderRefundMapper refundMapper;
    private final FeigeOrderMapper orderMapper;
    private final DataScopeHelper dataScopeHelper;
    private final FeigeOrderSupport support;

    public IPage<FeigeOrderRefund> listRefunds(int pageNum, int pageSize, String keyword, String status,
                                                LocalDate startDate, LocalDate endDate) {
        LambdaQueryWrapper<FeigeOrderRefund> query = new LambdaQueryWrapper<>();
        dataScopeHelper.applyFinancial(query, FeigeOrderRefund::getSalesmanId, FeigeOrderRefund::getDeptId);
        query.eq(StringUtils.hasText(status), FeigeOrderRefund::getStatus, status);
        if (StringUtils.hasText(keyword)) {
            query.and(w -> w.like(FeigeOrderRefund::getCompanyName, keyword)
                    .or().like(FeigeOrderRefund::getOrderNo, keyword));
        }
        query.ge(startDate != null, FeigeOrderRefund::getCreateTime,
                        startDate == null ? null : startDate.atStartOfDay())
                .lt(endDate != null, FeigeOrderRefund::getCreateTime,
                        endDate == null ? null : endDate.plusDays(1).atStartOfDay());
        query.orderByDesc(FeigeOrderRefund::getCreateTime);
        return refundMapper.selectPage(page(pageNum, pageSize), query);
    }

    @Transactional(rollbackFor = Exception.class)
    public Long applyRefund(Long orderId, FeigeRefundRequest request) {
        FeigeOrder order = support.requireOrder(orderId, true);
        if (money(order.getReceivedAmount()).compareTo(ZERO) <= 0) {
            throw new BusinessException("该订单暂无可退实收金额");
        }
        Long active = refundMapper.selectCount(new LambdaQueryWrapper<FeigeOrderRefund>()
                .eq(FeigeOrderRefund::getOrderId, orderId)
                .in(FeigeOrderRefund::getStatus, REFUND_PENDING, REFUND_APPROVED));
        if (active != null && active > 0) {
            throw new BusinessException("该订单已有待处理退费申请");
        }
        // Completed refunds have already reduced received_amount, so the current balance is the source of truth.
        BigDecimal available = money(order.getReceivedAmount());
        if (money(request.getRefundAmount()).compareTo(available) > 0) {
            throw new BusinessException("退费金额超过当前可退金额");
        }
        FeigeOrderRefund refund = new FeigeOrderRefund();
        refund.setOrderId(orderId);
        refund.setOrderNo(order.getOrderNo());
        refund.setCompanyName(order.getCompanyName());
        refund.setRefundAmount(money(request.getRefundAmount()));
        refund.setReason(request.getReason());
        refund.setStatus(REFUND_PENDING);
        refund.setPreviousOrderStatus(order.getStatus());
        refund.setSalesmanId(order.getSalesmanId());
        refund.setSalesmanName(order.getSalesmanName());
        refund.setDeptId(order.getDeptId());
        refundMapper.insert(refund);
        order.setStatus(ORDER_REFUND_PENDING);
        orderMapper.updateById(order);
        support.log(orderId, "refund_apply", "提交退费申请 " + refund.getRefundAmount().toPlainString() + " 元", request.getReason());
        return refund.getId();
    }

    @Transactional(rollbackFor = Exception.class)
    public void approveRefund(Long refundId, String comment) {
        FeigeOrderRefund refund = requireRefund(refundId, true);
        support.requireReviewer();
        if (!REFUND_PENDING.equals(refund.getStatus())) {
            throw new BusinessException("退费申请状态已变化，请刷新后重试");
        }
        fillReview(refund, REFUND_APPROVED, comment);
        refundMapper.updateById(refund);
        support.log(refund.getOrderId(), "refund_approve", "退费申请已审核", comment);
    }

    @Transactional(rollbackFor = Exception.class)
    public void rejectRefund(Long refundId, String comment) {
        FeigeOrderRefund refund = requireRefund(refundId, true);
        support.requireReviewer();
        if (!REFUND_PENDING.equals(refund.getStatus()) && !REFUND_APPROVED.equals(refund.getStatus())) {
            throw new BusinessException("退费申请状态已变化，请刷新后重试");
        }
        fillReview(refund, REFUND_REJECTED, comment);
        refundMapper.updateById(refund);
        FeigeOrder order = support.requireOrder(refund.getOrderId(), true);
        order.setStatus(defaultText(refund.getPreviousOrderStatus(), ORDER_IN_PROGRESS));
        orderMapper.updateById(order);
        support.log(refund.getOrderId(), "refund_reject", "退费申请已驳回", comment);
    }

    @Transactional(rollbackFor = Exception.class)
    public void completeRefund(Long refundId, String comment) {
        FeigeOrderRefund refund = requireRefund(refundId, true);
        requireFinanceReviewer();
        if (!REFUND_APPROVED.equals(refund.getStatus())) {
            throw new BusinessException("退费申请尚未通过审核");
        }
        FeigeOrder order = support.requireOrder(refund.getOrderId(), true);
        BigDecimal remaining = money(order.getReceivedAmount()).subtract(money(refund.getRefundAmount()));
        if (remaining.compareTo(ZERO) < 0) {
            throw new BusinessException("订单实收金额已变化，无法完成退费");
        }
        refund.setStatus(REFUND_COMPLETED);
        refund.setCompletedTime(LocalDateTime.now());
        refund.setReviewComment(comment);
        refundMapper.updateById(refund);
        order.setReceivedAmount(remaining);
        order.setStatus(remaining.compareTo(ZERO) == 0
                ? ORDER_REFUNDED : defaultText(refund.getPreviousOrderStatus(), ORDER_IN_PROGRESS));
        orderMapper.updateById(order);
        support.log(refund.getOrderId(), "refund_complete", "完成退费 " + refund.getRefundAmount().toPlainString() + " 元", comment);
    }

    private FeigeOrderRefund requireRefund(Long id, boolean forUpdate) {
        FeigeOrderRefund refund = forUpdate
                ? refundMapper.selectOne(new LambdaQueryWrapper<FeigeOrderRefund>()
                    .eq(FeigeOrderRefund::getId, id).last("FOR UPDATE"))
                : refundMapper.selectById(id);
        if (refund == null) throw new BusinessException("退费申请不存在");
        if (!dataScopeHelper.canAccess(refund.getSalesmanId(), refund.getDeptId())) {
            throw new AccessDeniedException("无权访问数据范围外的退费申请");
        }
        return refund;
    }

    private void fillReview(FeigeOrderRefund refund, String status, String comment) {
        Long reviewerId = SecurityUtils.getCurrentUserId();
        refund.setStatus(status);
        refund.setReviewerId(reviewerId);
        refund.setReviewerName(support.resolveUserName(reviewerId));
        refund.setReviewTime(LocalDateTime.now());
        refund.setReviewComment(trimToNull(comment));
    }
}
