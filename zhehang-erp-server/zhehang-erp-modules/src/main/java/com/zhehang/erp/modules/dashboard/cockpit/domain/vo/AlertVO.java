package com.zhehang.erp.modules.dashboard.cockpit.domain.vo;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class AlertVO {
    private Integer overdueReceiptCount;
    private BigDecimal overdueReceiptAmount;
    private Integer riskCustomerCount;
    private Integer expiringContractCount;
    private Integer stockWarningCount;
    private Integer abnormalApprovalCount;
}
