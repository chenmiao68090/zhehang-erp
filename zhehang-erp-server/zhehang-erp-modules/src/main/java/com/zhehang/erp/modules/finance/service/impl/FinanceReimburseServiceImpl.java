package com.zhehang.erp.modules.finance.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.finance.domain.entity.FinanceReimburse;
import com.zhehang.erp.modules.finance.mapper.FinanceReimburseMapper;
import com.zhehang.erp.modules.finance.service.IFinanceReimburseService;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class FinanceReimburseServiceImpl extends ServiceImpl<FinanceReimburseMapper, FinanceReimburse> implements IFinanceReimburseService {

    public IPage<FinanceReimburse> selectPage(Integer pageNum, Integer pageSize, String reimburseNo, Long applicantId, Integer status) {
        LambdaQueryWrapper<FinanceReimburse> wrapper = new LambdaQueryWrapper<>();
        wrapper.like(StringUtils.hasText(reimburseNo), FinanceReimburse::getReimburseNo, reimburseNo)
               .eq(applicantId != null, FinanceReimburse::getApplicantId, applicantId)
               .eq(status != null, FinanceReimburse::getStatus, status)
               .orderByDesc(FinanceReimburse::getCreateTime);
        return page(new Page<>(pageNum, pageSize), wrapper);
    }

    public void approve(Long id, boolean approved) {
        FinanceReimburse reimburse = getById(id);
        if (reimburse.getStatus() != 1) {
            throw new BusinessException("Only pending reimbursements can be approved");
        }
        reimburse.setStatus(approved ? 2 : 3);
        updateById(reimburse);
    }

    public void pay(Long id) {
        FinanceReimburse reimburse = getById(id);
        if (reimburse.getStatus() != 2) {
            throw new BusinessException("Only approved reimbursements can be paid");
        }
        reimburse.setStatus(4);
        updateById(reimburse);
    }
}
