package com.zhehang.erp.modules.finance.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.finance.domain.entity.FinanceReceivable;
import com.zhehang.erp.modules.finance.mapper.FinanceReceivableMapper;
import com.zhehang.erp.modules.finance.service.IFinanceReceivableService;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FinanceReceivableServiceImpl extends ServiceImpl<FinanceReceivableMapper, FinanceReceivable> implements IFinanceReceivableService {

    private final DataScopeHelper dataScopeHelper;

    public IPage<FinanceReceivable> selectPage(Integer pageNum, Integer pageSize, String type, Long customerId, Integer status) {
        LambdaQueryWrapper<FinanceReceivable> wrapper = new LambdaQueryWrapper<>();
        // 数据权限:应收按创建人收敛;管理员/财务部(data_scope=1)看全部
        dataScopeHelper.applyCreatorScope(wrapper, FinanceReceivable::getCreateBy);
        wrapper.eq(StringUtils.hasText(type), FinanceReceivable::getType, type)
               .eq(customerId != null, FinanceReceivable::getCustomerId, customerId)
               .eq(status != null, FinanceReceivable::getStatus, status)
               .orderByAsc(FinanceReceivable::getDueDate);
        return page(new Page<>(pageNum, pageSize), wrapper);
    }

    public void registerPayment(Long id, BigDecimal amount) {
        FinanceReceivable receivable = getById(id);
        if (receivable == null) {
            throw new BusinessException("应收款记录不存在");
        }
        // 收款金额必须为正,否则负数会无凭证冲销已收、status 静默回退,坏掉应收余额
        if (amount == null || amount.signum() <= 0) {
            throw new BusinessException("收款金额必须大于0");
        }
        // null 守卫:receivedAmount/amount/amount(应收总额) 任一为 null 都会 NPE,统一当 0 处理
        BigDecimal addAmt = amount == null ? BigDecimal.ZERO : amount;
        BigDecimal prevReceived = receivable.getReceivedAmount() == null ? BigDecimal.ZERO : receivable.getReceivedAmount();
        BigDecimal total = receivable.getAmount() == null ? BigDecimal.ZERO : receivable.getAmount();
        BigDecimal newReceived = prevReceived.add(addAmt);
        // 累计已收不得超过应收总额,否则会出现负数余额、坏掉对账
        if (newReceived.compareTo(total) > 0) {
            throw new BusinessException("收款金额超过应收剩余金额");
        }
        receivable.setReceivedAmount(newReceived);
        receivable.setRemainingAmount(total.subtract(newReceived));
        if (receivable.getRemainingAmount().compareTo(BigDecimal.ZERO) <= 0) {
            receivable.setStatus(2); // completed
        } else {
            receivable.setStatus(1); // partial
        }
        updateById(receivable);
    }

    public List<Map<String, Object>> getAgingAnalysis() {
        LambdaQueryWrapper<FinanceReceivable> wrapper = new LambdaQueryWrapper<>();
        // 数据权限:账龄统计同样按创建人收敛,避免只读统计越权看到全部应收
        dataScopeHelper.applyCreatorScope(wrapper, FinanceReceivable::getCreateBy);
        wrapper.ne(FinanceReceivable::getStatus, 2);
        List<FinanceReceivable> list = list(wrapper);
        LocalDate today = LocalDate.now();
        Map<String, BigDecimal> aging = new LinkedHashMap<>();
        aging.put("0-30", BigDecimal.ZERO);
        aging.put("31-60", BigDecimal.ZERO);
        aging.put("61-90", BigDecimal.ZERO);
        aging.put("90+", BigDecimal.ZERO);

        for (FinanceReceivable r : list) {
            // dueDate 为 null 时 ChronoUnit.DAYS.between 会 NPE→账龄表500,先跳过
            if (r.getDueDate() == null) continue;
            long days = ChronoUnit.DAYS.between(r.getDueDate(), today);
            if (days <= 0) continue; // not overdue
            String bucket;
            if (days <= 30) bucket = "0-30";
            else if (days <= 60) bucket = "31-60";
            else if (days <= 90) bucket = "61-90";
            else bucket = "90+";
            BigDecimal remaining = r.getRemainingAmount() == null ? BigDecimal.ZERO : r.getRemainingAmount();
            aging.put(bucket, aging.get(bucket).add(remaining));
        }

        return aging.entrySet().stream().map(e -> {
            Map<String, Object> m = new HashMap<>();
            m.put("range", e.getKey());
            m.put("amount", e.getValue());
            return m;
        }).collect(Collectors.toList());
    }

    public List<FinanceReceivable> getOverdue() {
        LambdaQueryWrapper<FinanceReceivable> wrapper = new LambdaQueryWrapper<>();
        // 数据权限:逾期清单同样按创建人收敛,避免只读统计越权看到全部应收
        dataScopeHelper.applyCreatorScope(wrapper, FinanceReceivable::getCreateBy);
        wrapper.ne(FinanceReceivable::getStatus, 2)
               .lt(FinanceReceivable::getDueDate, LocalDate.now());
        return list(wrapper);
    }
}
