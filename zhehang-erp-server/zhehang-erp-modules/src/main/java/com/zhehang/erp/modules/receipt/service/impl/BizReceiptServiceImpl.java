package com.zhehang.erp.modules.receipt.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.receipt.domain.BizInvoice;
import com.zhehang.erp.modules.receipt.domain.BizReceipt;
import com.zhehang.erp.modules.receipt.domain.BizReceiptPlan;
import com.zhehang.erp.modules.receipt.mapper.BizInvoiceMapper;
import com.zhehang.erp.modules.receipt.mapper.BizReceiptMapper;
import com.zhehang.erp.modules.receipt.mapper.BizReceiptPlanMapper;
import com.zhehang.erp.modules.receipt.service.IBizReceiptService;
import com.zhehang.erp.modules.contract.domain.BizContract;
import com.zhehang.erp.modules.contract.mapper.BizContractMapper;
import com.zhehang.erp.modules.contract.service.IBizContractService;
import com.zhehang.erp.modules.order.domain.BizOrder;
import com.zhehang.erp.modules.order.mapper.BizOrderMapper;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class BizReceiptServiceImpl extends ServiceImpl<BizReceiptMapper, BizReceipt> implements IBizReceiptService {

    private final BizReceiptMapper receiptMapper;
    private final BizReceiptPlanMapper planMapper;
    private final BizInvoiceMapper invoiceMapper;
    private final IBizContractService contractService;
    private final BizContractMapper contractMapper;
    private final BizOrderMapper orderMapper;
    private final DataScopeHelper dataScopeHelper;

    @Override
    public IPage<BizReceipt> selectPage(int pageNum, int pageSize, Long customerId, Long orderId, Integer status) {
        LambdaQueryWrapper<BizReceipt> wrapper = new LambdaQueryWrapper<>();
        // 数据范围:销售看本人订单收款、主管看本部门、财务/管理员看全部(对账)
        dataScopeHelper.applyFinancial(wrapper, BizReceipt::getSalesmanId, BizReceipt::getDeptId);
        wrapper.eq(customerId != null, BizReceipt::getCustomerId, customerId)
                .eq(orderId != null, BizReceipt::getOrderId, orderId)
                .eq(status != null, BizReceipt::getStatus, status)
                .orderByDesc(BizReceipt::getCreateTime);
        return receiptMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void confirm(BizReceipt receipt, Long operatorId) {
        if (!StringUtils.hasText(receipt.getReceiptNo())) {
            receipt.setReceiptNo("RCP" + System.currentTimeMillis());
        }
        receipt.setStatus(2);
        receipt.setConfirmerId(operatorId);
        receipt.setConfirmTime(LocalDateTime.now());
        if (receipt.getReceiveTime() == null) {
            receipt.setReceiveTime(LocalDateTime.now());
        }
        // 归属继承订单(数据范围:销售看本人收款、财务看全部对账)
        if (receipt.getOrderId() != null && receipt.getSalesmanId() == null) {
            BizOrder order = orderMapper.selectById(receipt.getOrderId());
            if (order != null) {
                receipt.setSalesmanId(order.getSalesmanId());
                receipt.setDeptId(order.getDeptId());
            }
        }
        if (receipt.getId() == null) {
            receiptMapper.insert(receipt);
        } else {
            receiptMapper.updateById(receipt);
        }
        if (receipt.getPlanId() != null) {
            payPlan(receipt.getPlanId(), receipt.getAmount());
        }
        // 收款确认→自动生成合同草稿(该订单尚无合同时;幂等,避免重复出合同)
        if (receipt.getOrderId() != null) {
            Long existing = contractMapper.selectCount(new LambdaQueryWrapper<BizContract>()
                    .eq(BizContract::getOrderId, receipt.getOrderId()));
            if (existing == null || existing == 0) {
                Long contractId = contractService.generateFromOrder(receipt.getOrderId(), null, null);
                log.info("收款单[{}]确认,订单[{}]自动生成合同草稿[{}]",
                        receipt.getReceiptNo(), receipt.getOrderId(), contractId);
            }
        }
    }

    @Override
    public List<BizReceiptPlan> getPlans(Long orderId) {
        LambdaQueryWrapper<BizReceiptPlan> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(BizReceiptPlan::getOrderId, orderId).orderByAsc(BizReceiptPlan::getPeriod);
        return planMapper.selectList(wrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void payPlan(Long planId, BigDecimal amount) {
        BizReceiptPlan plan = planMapper.selectById(planId);
        if (plan == null) {
            throw new BusinessException("收款计划不存在");
        }
        BigDecimal paid = plan.getPaidAmount() == null ? BigDecimal.ZERO : plan.getPaidAmount();
        BigDecimal addAmt = amount == null ? BigDecimal.ZERO : amount;
        BigDecimal newPaid = paid.add(addAmt);
        plan.setPaidAmount(newPaid);
        plan.setPaidDate(LocalDate.now());
        if (plan.getPlanAmount() != null && newPaid.compareTo(plan.getPlanAmount()) >= 0) {
            plan.setStatus(3);
        } else if (newPaid.compareTo(BigDecimal.ZERO) > 0) {
            plan.setStatus(2);
        }
        planMapper.updateById(plan);
    }

    @Override
    public List<BizReceiptPlan> getOverdue() {
        LambdaQueryWrapper<BizReceiptPlan> wrapper = new LambdaQueryWrapper<>();
        wrapper.lt(BizReceiptPlan::getPlanDate, LocalDate.now())
                .ne(BizReceiptPlan::getStatus, 3)
                .orderByAsc(BizReceiptPlan::getPlanDate);
        return planMapper.selectList(wrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void refund(Long receiptId, BigDecimal refundAmount, String reason, Long operatorId) {
        BizReceipt receipt = receiptMapper.selectById(receiptId);
        if (receipt == null) {
            throw new BusinessException("收款记录不存在");
        }
        receipt.setStatus(3);
        receipt.setRemark((receipt.getRemark() == null ? "" : receipt.getRemark())
                + " | 退款: " + refundAmount + " 原因: " + reason);
        receiptMapper.updateById(receipt);
    }

    @Override
    public IPage<BizInvoice> getInvoices(int pageNum, int pageSize, Long customerId, Integer status) {
        LambdaQueryWrapper<BizInvoice> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(customerId != null, BizInvoice::getCustomerId, customerId)
                .eq(status != null, BizInvoice::getStatus, status)
                .orderByDesc(BizInvoice::getCreateTime);
        return invoiceMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
    }

    @Override
    public Long createInvoice(BizInvoice invoice) {
        if (invoice.getStatus() == null) {
            invoice.setStatus(1);
        }
        invoiceMapper.insert(invoice);
        return invoice.getId();
    }

    @Override
    public void updateInvoiceStatus(Long id, Integer status, String trackingNo) {
        BizInvoice invoice = invoiceMapper.selectById(id);
        if (invoice == null) {
            throw new BusinessException("发票不存在");
        }
        if (status != null) {
            invoice.setStatus(status);
        }
        if (StringUtils.hasText(trackingNo)) {
            invoice.setTrackingNo(trackingNo);
        }
        invoiceMapper.updateById(invoice);
    }

    @Override
    public Map<String, Object> monthlySummary(String month) {
        Map<String, Object> result = new HashMap<>();
        YearMonth ym = StringUtils.hasText(month) ? YearMonth.parse(month) : YearMonth.now();
        LocalDateTime start = ym.atDay(1).atStartOfDay();
        LocalDateTime end = ym.atEndOfMonth().atTime(23, 59, 59);
        LambdaQueryWrapper<BizReceipt> wrapper = new LambdaQueryWrapper<>();
        wrapper.between(BizReceipt::getReceiveTime, start, end)
                .eq(BizReceipt::getStatus, 2);
        List<BizReceipt> list = receiptMapper.selectList(wrapper);
        BigDecimal total = list.stream()
                .map(r -> r.getAmount() == null ? BigDecimal.ZERO : r.getAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        result.put("month", ym.toString());
        result.put("count", list.size());
        result.put("totalAmount", total);
        return result;
    }
}
