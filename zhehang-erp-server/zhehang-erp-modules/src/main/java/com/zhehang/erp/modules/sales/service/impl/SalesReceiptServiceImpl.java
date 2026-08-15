package com.zhehang.erp.modules.sales.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.modules.sales.domain.entity.SalesReceipt;
import com.zhehang.erp.modules.sales.mapper.SalesReceiptMapper;
import com.zhehang.erp.modules.sales.service.ISalesReceiptService;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SalesReceiptServiceImpl extends ServiceImpl<SalesReceiptMapper, SalesReceipt> implements ISalesReceiptService {

    private final SalesReceiptMapper receiptMapper;
    private final DataScopeHelper dataScopeHelper;

    @Override
    public IPage<SalesReceipt> selectPage(int pageNum, int pageSize, Long customerId, Integer status, String startDate, String endDate) {
        LambdaQueryWrapper<SalesReceipt> wrapper = new LambdaQueryWrapper<>();
        // 数据权限:销售回款按创建人收敛;管理员/财务部(data_scope=1)看全部
        dataScopeHelper.applyCreatorScope(wrapper, SalesReceipt::getCreateBy);
        wrapper.eq(customerId != null, SalesReceipt::getCustomerId, customerId)
               .eq(status != null, SalesReceipt::getStatus, status)
               .ge(startDate != null, SalesReceipt::getReceiptDate, startDate)
               .le(endDate != null, SalesReceipt::getReceiptDate, endDate)
               .orderByDesc(SalesReceipt::getCreateTime);
        return receiptMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
    }

    @Override
    public List<SalesReceipt> overdueList() {
        LambdaQueryWrapper<SalesReceipt> wrapper = new LambdaQueryWrapper<>();
        dataScopeHelper.applyCreatorScope(wrapper, SalesReceipt::getCreateBy); // 逾期回款同样按创建人收敛
        wrapper.lt(true, SalesReceipt::getDueDate, LocalDate.now())
               .ne(SalesReceipt::getStatus, 2)
               // 已全额收款(余额<=0)的不算逾期,避免逾期列表/账龄出现误报
               .apply("(amount - COALESCE(received_amount, 0)) > 0")
               .orderByAsc(SalesReceipt::getDueDate);
        return receiptMapper.selectList(wrapper);
    }

    @Override
    public Map<String, Object> monthlyStats() {
        LocalDate now = LocalDate.now();
        LocalDate firstDay = now.withDayOfMonth(1);

        // 本月应收
        LambdaQueryWrapper<SalesReceipt> dueWrapper = new LambdaQueryWrapper<>();
        dataScopeHelper.applyCreatorScope(dueWrapper, SalesReceipt::getCreateBy); // 统计同样按创建人收敛
        dueWrapper.ge(SalesReceipt::getDueDate, firstDay).le(SalesReceipt::getDueDate, now);
        List<SalesReceipt> dueList = receiptMapper.selectList(dueWrapper);
        BigDecimal totalDue = dueList.stream().map(SalesReceipt::getAmount).filter(a -> a != null).reduce(BigDecimal.ZERO, BigDecimal::add);

        // 本月已收
        LambdaQueryWrapper<SalesReceipt> receivedWrapper = new LambdaQueryWrapper<>();
        dataScopeHelper.applyCreatorScope(receivedWrapper, SalesReceipt::getCreateBy); // 统计同样按创建人收敛
        // status 1=部分回款 / 2=已回款,两者都有真实已收额(前端 receipt.vue 确认 1=partial),都计入"本月已收",否则低报现金流
        receivedWrapper.ge(SalesReceipt::getReceiptDate, firstDay).le(SalesReceipt::getReceiptDate, now).in(SalesReceipt::getStatus, 1, 2);
        List<SalesReceipt> receivedList = receiptMapper.selectList(receivedWrapper);
        BigDecimal totalReceived = receivedList.stream().map(SalesReceipt::getReceivedAmount).filter(a -> a != null).reduce(BigDecimal.ZERO, BigDecimal::add);

        // 逾期金额
        List<SalesReceipt> overdueList = overdueList();
        BigDecimal overdueAmount = overdueList.stream().map(r -> {
            BigDecimal due = r.getAmount() != null ? r.getAmount() : BigDecimal.ZERO;
            BigDecimal received = r.getReceivedAmount() != null ? r.getReceivedAmount() : BigDecimal.ZERO;
            return due.subtract(received);
        }).reduce(BigDecimal.ZERO, BigDecimal::add);

        // 回款率
        BigDecimal rate = totalDue.compareTo(BigDecimal.ZERO) > 0
                ? totalReceived.multiply(new BigDecimal("100")).divide(totalDue, 2, BigDecimal.ROUND_HALF_UP)
                : BigDecimal.ZERO;

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalDue", totalDue);
        stats.put("totalReceived", totalReceived);
        stats.put("overdueAmount", overdueAmount);
        stats.put("receiptRate", rate);
        return stats;
    }
}
