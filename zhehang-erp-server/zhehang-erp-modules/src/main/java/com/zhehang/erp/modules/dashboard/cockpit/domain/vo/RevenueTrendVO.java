package com.zhehang.erp.modules.dashboard.cockpit.domain.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RevenueTrendVO {
    private String month;
    private BigDecimal revenue;
    private BigDecimal receipt;
}
