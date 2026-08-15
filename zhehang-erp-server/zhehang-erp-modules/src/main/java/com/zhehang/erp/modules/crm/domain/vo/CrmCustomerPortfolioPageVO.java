package com.zhehang.erp.modules.crm.domain.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * 正式客户工作台分页与当前数据范围统计。
 */
@Data
public class CrmCustomerPortfolioPageVO {
    private List<CrmCustomerPortfolioVO> records = new ArrayList<>();
    private long total;
    private int pageNum;
    private int pageSize;
    private Stats stats = new Stats();

    @Data
    public static class Stats {
        private long total;
        private long active;
        private long dueToday;
        private long overdue;
        private long handoverPending;
        private long arrearsCustomers;
        private BigDecimal arrearsAmount = BigDecimal.ZERO;
    }
}
