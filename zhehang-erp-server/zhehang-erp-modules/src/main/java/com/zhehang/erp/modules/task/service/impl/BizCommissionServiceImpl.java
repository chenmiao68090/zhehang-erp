package com.zhehang.erp.modules.task.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.order.domain.BizOrder;
import com.zhehang.erp.modules.order.mapper.BizOrderMapper;
import com.zhehang.erp.modules.task.domain.BizCommission;
import com.zhehang.erp.modules.task.mapper.BizCommissionMapper;
import com.zhehang.erp.modules.task.service.IBizCommissionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.YearMonth;

@Slf4j
@Service
@RequiredArgsConstructor
public class BizCommissionServiceImpl extends ServiceImpl<BizCommissionMapper, BizCommission> implements IBizCommissionService {

    private final BizCommissionMapper commissionMapper;
    private final BizOrderMapper orderMapper;

    private static final BigDecimal DEFAULT_RATE = new BigDecimal("5");

    @Override
    public IPage<BizCommission> selectPage(int pageNum, int pageSize, Long salesmanId, String period, Integer status) {
        LambdaQueryWrapper<BizCommission> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(salesmanId != null, BizCommission::getSalesmanId, salesmanId)
                .eq(StringUtils.hasText(period), BizCommission::getPeriod, period)
                .eq(status != null, BizCommission::getStatus, status)
                .orderByDesc(BizCommission::getCreateTime);
        return commissionMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
    }

    @Override
    public Long generate(Long orderId, String period) {
        BizOrder order = orderMapper.selectById(orderId);
        if (order == null) {
            throw new BusinessException("订单不存在");
        }
        BizCommission commission = new BizCommission();
        commission.setCommissionNo("CMS" + System.currentTimeMillis());
        commission.setSalesmanId(order.getSalesmanId());
        commission.setSalesmanName(order.getSalesmanName());
        commission.setDeptId(order.getDeptId());
        commission.setOrderId(orderId);
        commission.setPeriod(StringUtils.hasText(period) ? period : YearMonth.now().toString());
        BigDecimal amt = order.getPayableAmount() != null ? order.getPayableAmount() : order.getTotalAmount();
        commission.setOrderAmount(amt == null ? BigDecimal.ZERO : amt);
        commission.setCommissionRate(DEFAULT_RATE);
        commission.setCommissionAmount(commission.getOrderAmount()
                .multiply(DEFAULT_RATE).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP));
        commission.setStatus(1);
        commissionMapper.insert(commission);
        return commission.getId();
    }

    @Override
    public void salesmanConfirm(Long id, Long operatorId) {
        BizCommission c = commissionMapper.selectById(id);
        if (c == null) {
            throw new BusinessException("结算单不存在");
        }
        if (c.getStatus() == null || c.getStatus() != 1) {
            throw new BusinessException("当前状态不可销售确认");
        }
        c.setStatus(2);
        c.setSalesmanConfirmTime(LocalDateTime.now());
        commissionMapper.updateById(c);
    }

    @Override
    public void review(Long id, boolean pass, String comment, Long operatorId) {
        BizCommission c = commissionMapper.selectById(id);
        if (c == null) {
            throw new BusinessException("结算单不存在");
        }
        if (c.getStatus() == null || c.getStatus() != 2) {
            throw new BusinessException("当前状态不可主管审核");
        }
        c.setStatus(pass ? 3 : 7);
        c.setReviewTime(LocalDateTime.now());
        if (StringUtils.hasText(comment)) {
            c.setRemark(comment);
        }
        commissionMapper.updateById(c);
    }

    @Override
    public void financeConfirm(Long id, Long operatorId) {
        BizCommission c = commissionMapper.selectById(id);
        if (c == null) {
            throw new BusinessException("结算单不存在");
        }
        if (c.getStatus() == null || c.getStatus() != 3) {
            throw new BusinessException("当前状态不可财务确认");
        }
        c.setStatus(4);
        c.setFinanceConfirmTime(LocalDateTime.now());
        commissionMapper.updateById(c);
    }

    @Override
    public void bossApprove(Long id, boolean approved, Long operatorId) {
        BizCommission c = commissionMapper.selectById(id);
        if (c == null) {
            throw new BusinessException("结算单不存在");
        }
        if (c.getStatus() == null || c.getStatus() != 4) {
            throw new BusinessException("当前状态不可老板审批");
        }
        if (approved) {
            c.setStatus(6);
            c.setBossApproveTime(LocalDateTime.now());
            c.setPayTime(LocalDateTime.now());
        } else {
            c.setStatus(7);
        }
        commissionMapper.updateById(c);
    }
}
