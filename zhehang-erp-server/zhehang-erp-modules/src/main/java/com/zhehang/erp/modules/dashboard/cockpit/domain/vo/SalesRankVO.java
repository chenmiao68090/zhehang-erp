package com.zhehang.erp.modules.dashboard.cockpit.domain.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SalesRankVO {
    private Integer rank;
    private String employeeName;
    private String department;
    private BigDecimal amount;
    private Double growthRate;
}
