package com.zhehang.erp.modules.finance.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.modules.finance.domain.entity.FinanceInvoice;
import com.zhehang.erp.modules.finance.mapper.FinanceInvoiceMapper;
import com.zhehang.erp.modules.finance.service.IFinanceInvoiceService;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class FinanceInvoiceServiceImpl extends ServiceImpl<FinanceInvoiceMapper, FinanceInvoice> implements IFinanceInvoiceService {

    private final DataScopeHelper dataScopeHelper;

    public IPage<FinanceInvoice> selectPage(Integer pageNum, Integer pageSize, String invoiceNo, Long customerId, String invoiceType, String direction) {
        LambdaQueryWrapper<FinanceInvoice> wrapper = new LambdaQueryWrapper<>();
        // 数据权限:发票按创建人收敛;管理员/财务部(data_scope=1)看全部
        dataScopeHelper.applyCreatorScope(wrapper, FinanceInvoice::getCreateBy);
        wrapper.like(StringUtils.hasText(invoiceNo), FinanceInvoice::getInvoiceNo, invoiceNo)
               .eq(customerId != null, FinanceInvoice::getCustomerId, customerId)
               .eq(StringUtils.hasText(invoiceType), FinanceInvoice::getInvoiceType, invoiceType)
               .eq(StringUtils.hasText(direction), FinanceInvoice::getDirection, direction)
               .orderByDesc(FinanceInvoice::getInvoiceDate);
        return page(new Page<>(pageNum, pageSize), wrapper);
    }

    public Map<String, BigDecimal> getStats() {
        List<FinanceInvoice> all = list();
        BigDecimal inputTotal = all.stream().filter(i -> "INPUT".equals(i.getDirection()))
            .map(FinanceInvoice::getTotalAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal outputTotal = all.stream().filter(i -> "OUTPUT".equals(i.getDirection()))
            .map(FinanceInvoice::getTotalAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        Map<String, BigDecimal> stats = new HashMap<>();
        stats.put("inputTotal", inputTotal);
        stats.put("outputTotal", outputTotal);
        return stats;
    }
}
