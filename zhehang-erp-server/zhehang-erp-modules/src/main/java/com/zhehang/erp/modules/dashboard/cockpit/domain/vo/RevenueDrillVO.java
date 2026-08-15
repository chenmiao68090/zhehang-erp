package com.zhehang.erp.modules.dashboard.cockpit.domain.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

/** 某月营收/回款按日下钻 (date=yyyy-MM-dd) */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RevenueDrillVO {
    private String date;
    private BigDecimal revenue;
    private BigDecimal receipt;
}
