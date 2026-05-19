package com.zhehang.erp.modules.dashboard.cockpit.domain.vo;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class CockpitKpiVO {
    private Integer totalCustomers;
    private Double customerGrowthRate;
    private Integer newCustomersMonth;
    private Double newCustomerGrowthRate;
    private BigDecimal totalRevenue;
    private Double revenueGrowthRate;
    private BigDecimal monthReceipt;
    private Double receiptGrowthRate;
    private Integer pendingContracts;
    private Double pendingContractsRate;
    private Integer totalEmployees;
    private Double employeeGrowthRate;
}
