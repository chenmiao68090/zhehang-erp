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

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

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
        if (tax == null) {
            throw new BusinessException("Tax record not found");
        }
        if (tax.getStatus() != 0) {
            throw new BusinessException("Only pending tax records can be declared");
        }
        tax.setStatus(1);
        updateById(tax);
    }

    /**
     * 税务汇总:按期间统计应纳税额合计、申报进度,并按税种分组汇总。
     */
    public Map<String, Object> summary(String period) {
        LambdaQueryWrapper<FinanceTax> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(StringUtils.hasText(period), FinanceTax::getPeriod, period)
               .orderByDesc(FinanceTax::getDeadline);
        List<FinanceTax> list = list(wrapper);

        BigDecimal totalTax = list.stream()
                .map(t -> t.getTaxAmount() == null ? BigDecimal.ZERO : t.getTaxAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        long declared = list.stream().filter(t -> t.getStatus() != null && t.getStatus() >= 1).count();
        Map<String, BigDecimal> byType = new LinkedHashMap<>();
        for (FinanceTax t : list) {
            byType.merge(t.getTaxType() == null ? "OTHER" : t.getTaxType(),
                    t.getTaxAmount() == null ? BigDecimal.ZERO : t.getTaxAmount(), BigDecimal::add);
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalTax", totalTax);
        result.put("count", list.size());
        result.put("declaredCount", declared);
        result.put("pendingCount", list.size() - declared);
        result.put("byType", byType);
        result.put("records", list);
        return result;
    }
}
