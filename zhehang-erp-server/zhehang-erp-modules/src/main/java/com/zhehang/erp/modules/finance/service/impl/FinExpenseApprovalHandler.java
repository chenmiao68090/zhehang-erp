package com.zhehang.erp.modules.finance.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.finance.domain.entity.FinExpense;
import com.zhehang.erp.modules.finance.mapper.FinExpenseMapper;
import com.zhehang.erp.modules.workflow.domain.entity.WfInstance;
import com.zhehang.erp.modules.workflow.service.ApprovalCallbackHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.Map;

/**
 * 业务支出(费用 cost 流程)审批联动:收编原本"另起炉灶"的 fin_expense 手工 status 审批。
 * 发起建单(approving),全链通过 → pending_pay(待付款),驳回 → rejected,撤销逻辑删。
 * 收编后 fin_expense 的旁路手工改状态口(FinExpenseController PUT /{id}/status)只作应急,正路走审批中心。
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class FinExpenseApprovalHandler implements ApprovalCallbackHandler {

    public static final String BIZ_TYPE = "fin_expense";

    private final FinExpenseMapper expenseMapper;
    private final ObjectMapper objectMapper;

    @Override
    public String bizType() {
        return BIZ_TYPE;
    }

    @Override
    public Long onStarted(WfInstance instance) {
        Map<String, Object> form = parseForm(instance);
        FinExpense e = new FinExpense();
        e.setExpenseNo("FY" + instance.getId() + System.nanoTime() % 100000);
        e.setCategory(str(form.get("feeType")));
        e.setAmount(parseAmount(form.get("amount")));
        e.setRemark(str(form.get("description")));
        e.setStatus("approving"); // 审批中
        expenseMapper.insert(e);
        return e.getId();
    }

    @Override
    public void onResubmitted(WfInstance instance) {
        FinExpense e = require(instance);
        Map<String, Object> form = parseForm(instance);
        e.setCategory(str(form.get("feeType")));
        e.setAmount(parseAmount(form.get("amount")));
        e.setRemark(str(form.get("description")));
        e.setStatus("approving");
        expenseMapper.updateById(e);
    }

    @Override
    public void onApproved(WfInstance instance) {
        FinExpense e = require(instance);
        e.setStatus("pending_pay"); // 审批通过,待付款
        expenseMapper.updateById(e);
    }

    @Override
    public void onRejected(WfInstance instance) {
        FinExpense e = require(instance);
        e.setStatus("rejected");
        expenseMapper.updateById(e);
    }

    @Override
    public void onCancelled(WfInstance instance) {
        FinExpense e = instance.getBizId() == null ? null : expenseMapper.selectById(instance.getBizId());
        if (e != null) {
            expenseMapper.deleteById(e.getId());
        }
    }

    private Map<String, Object> parseForm(WfInstance instance) {
        try {
            return objectMapper.readValue(instance.getFormData(), new TypeReference<Map<String, Object>>() {});
        } catch (Exception ex) {
            throw new BusinessException("费用表单数据解析失败,无法联动业务支出");
        }
    }

    private BigDecimal parseAmount(Object o) {
        if (o == null) {
            throw new BusinessException("费用金额缺失");
        }
        try {
            return new BigDecimal(o.toString().trim());
        } catch (Exception e) {
            throw new BusinessException("费用金额无效");
        }
    }

    private FinExpense require(WfInstance instance) {
        FinExpense e = instance.getBizId() == null ? null : expenseMapper.selectById(instance.getBizId());
        if (e == null) {
            throw new BusinessException("审批关联的业务支出单不存在(bizId=" + instance.getBizId() + "),请联系管理员");
        }
        return e;
    }

    private String str(Object o) {
        return o == null || !StringUtils.hasText(o.toString()) ? null : o.toString();
    }
}
