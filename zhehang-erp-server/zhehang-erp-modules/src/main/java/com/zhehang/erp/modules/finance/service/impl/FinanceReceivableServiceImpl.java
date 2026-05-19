package com.zhehang.erp.modules.finance.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.finance.domain.entity.FinanceReceivable;
import com.zhehang.erp.modules.finance.mapper.FinanceReceivableMapper;
import com.zhehang.erp.modules.finance.service.IFinanceReceivableService;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class FinanceReceivableServiceImpl extends ServiceImpl<FinanceReceivableMapper, FinanceReceivable> implements IFinanceReceivableService {

    public IPage<FinanceReceivable> selectPage(Integer pageNum, Integer pageSize, String type, Long customerId, Integer status) {
        LambdaQueryWrapper<FinanceReceivable> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(StringUtils.hasText(type), FinanceReceivable::getType, type)
               .eq(customerId != null, FinanceReceivable::getCustomerId, customerId)
               .eq(status != null, FinanceReceivable::getStatus, status)
               .orderByAsc(FinanceReceivable::getDueDate);
        return page(new Page<>(pageNum, pageSize), wrapper);
    }

    public void registerPayment(Long id, BigDecimal amount) {
        FinanceReceivable receivable = getById(id);
        BigDecimal newReceived = receivable.getReceivedAmount().add(amount);
        receivable.setReceivedAmount(newReceived);
        receivable.setRemainingAmount(receivable.getAmount().subtract(newReceived));
        if (receivable.getRemainingAmount().compareTo(BigDecimal.ZERO) <= 0) {
            receivable.setStatus(2); // completed
        } else {
            receivable.setStatus(1); // partial
        }
        updateById(receivable);
    }

    public List<Map<String, Object>> getAgingAnalysis() {
        List<FinanceReceivable> list = list(new LambdaQueryWrapper<FinanceReceivable>()
            .ne(FinanceReceivable::getStatus, 2));
        LocalDate today = LocalDate.now();
        Map<String, BigDecimal> aging = new LinkedHashMap<>();
        aging.put("0-30", BigDecimal.ZERO);
        aging.put("31-60", BigDecimal.ZERO);
        aging.put("61-90", BigDecimal.ZERO);
        aging.put("90+", BigDecimal.ZERO);

        for (FinanceReceivable r : list) {
            long days = ChronoUnit.DAYS.between(r.getDueDate(), today);
            if (days <= 0) continue; // not overdue
            String bucket;
            if (days <= 30) bucket = "0-30";
            else if (days <= 60) bucket = "31-60";
            else if (days <= 90) bucket = "61-90";
            else bucket = "90+";
            aging.put(bucket, aging.get(bucket).add(r.getRemainingAmount()));
        }

        return aging.entrySet().stream().map(e -> {
            Map<String, Object> m = new HashMap<>();
            m.put("range", e.getKey());
            m.put("amount", e.getValue());
            return m;
        }).collect(Collectors.toList());
    }

    public List<FinanceReceivable> getOverdue() {
        return list(new LambdaQueryWrapper<FinanceReceivable>()
            .ne(FinanceReceivable::getStatus, 2)
            .lt(FinanceReceivable::getDueDate, LocalDate.now()));
    }
}
