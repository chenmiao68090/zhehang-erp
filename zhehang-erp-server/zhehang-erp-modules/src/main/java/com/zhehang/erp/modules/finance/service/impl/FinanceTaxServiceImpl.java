package com.zhehang.erp.modules.finance.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.finance.domain.entity.FinanceTax;
import com.zhehang.erp.modules.finance.mapper.FinanceTaxMapper;
import com.zhehang.erp.modules.finance.service.IFinanceTaxService;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class FinanceTaxServiceImpl extends ServiceImpl<FinanceTaxMapper, FinanceTax> implements IFinanceTaxService {

    public IPage<FinanceTax> selectPage(Integer pageNum, Integer pageSize, Long customerId, String taxType, String period, Integer status) {
        LambdaQueryWrapper<FinanceTax> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(customerId != null, FinanceTax::getCustomerId, customerId)
               .eq(StringUtils.hasText(taxType), FinanceTax::getTaxType, taxType)
               .eq(StringUtils.hasText(period), FinanceTax::getPeriod, period)
               .eq(status != null, FinanceTax::getStatus, status)
               .orderByDesc(FinanceTax::getDeadline);
        return page(new Page<>(pageNum, pageSize), wrapper);
    }

    public void declare(Long id) {
        FinanceTax tax = getById(id);
        if (tax.getStatus() != 0) {
            throw new BusinessException("Only pending tax records can be declared");
        }
        tax.setStatus(1);
        updateById(tax);
    }
}
