package com.zhehang.erp.modules.finance.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.finance.domain.entity.FinanceReimburse;
import com.zhehang.erp.modules.finance.mapper.FinanceReimburseMapper;
import com.zhehang.erp.modules.workflow.domain.entity.WfInstance;
import com.zhehang.erp.modules.workflow.service.ApprovalCallbackHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.Map;

/**
 * 报销审批联动:审批中心 expense 流程落真实报销单(finance_reimburse),批完财务台账才认。
 * 状态语义(FinanceReimburse):0草稿 1待审 2已通过 3已驳回 4已付款。
 * 发起建单(1),通过置2,驳回置3,撤销逻辑删,重提回1并同步金额。
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class FinanceReimburseApprovalHandler implements ApprovalCallbackHandler {

    public static final String BIZ_TYPE = "fin_reimburse";

    private final FinanceReimburseMapper reimburseMapper;
    private final ObjectMapper objectMapper;

    @Override
    public String bizType() {
        return BIZ_TYPE;
    }

    @Override
    public Long onStarted(WfInstance instance) {
        FinanceReimburse r = new FinanceReimburse();
        r.setApplicantId(instance.getInitiatorId());
        r.setReimburseNo("BX" + instance.getId() + System.nanoTime() % 100000);
        fillFromForm(r, instance);
        r.setTitle(instance.getTitle());
        r.setStatus(1); // 待审
        reimburseMapper.insert(r);
        return r.getId();
    }

    @Override
    public void onResubmitted(WfInstance instance) {
        FinanceReimburse r = require(instance);
        fillFromForm(r, instance);
        r.setTitle(instance.getTitle());
        r.setStatus(1);
        reimburseMapper.updateById(r);
    }

    @Override
    public void onApproved(WfInstance instance) {
        FinanceReimburse r = require(instance);
        r.setStatus(2); // 已通过:进入财务付款队列
        reimburseMapper.updateById(r);
    }

    @Override
    public void onRejected(WfInstance instance) {
        FinanceReimburse r = require(instance);
        r.setStatus(3); // 已驳回
        reimburseMapper.updateById(r);
    }

    @Override
    public void onCancelled(WfInstance instance) {
        FinanceReimburse r = instance.getBizId() == null ? null : reimburseMapper.selectById(instance.getBizId());
        if (r != null) {
            reimburseMapper.deleteById(r.getId());
        }
    }

    private void fillFromForm(FinanceReimburse r, WfInstance instance) {
        try {
            Map<String, Object> form = objectMapper.readValue(instance.getFormData(), new TypeReference<Map<String, Object>>() {});
            Object amount = form.get("totalAmount") != null ? form.get("totalAmount") : form.get("amount");
            if (amount == null) {
                throw new BusinessException("报销金额缺失,无法建报销单");
            }
            r.setTotalAmount(new BigDecimal(amount.toString().trim()));
            Object desc = form.get("description");
            if (desc != null && StringUtils.hasText(desc.toString())) {
                r.setRemark(desc.toString());
            }
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            throw new BusinessException("报销表单数据解析失败,无法联动财务台账");
        }
    }

    private FinanceReimburse require(WfInstance instance) {
        FinanceReimburse r = instance.getBizId() == null ? null : reimburseMapper.selectById(instance.getBizId());
        if (r == null) {
            throw new BusinessException("审批关联的报销单不存在(bizId=" + instance.getBizId() + "),请联系管理员");
        }
        return r;
    }
}
