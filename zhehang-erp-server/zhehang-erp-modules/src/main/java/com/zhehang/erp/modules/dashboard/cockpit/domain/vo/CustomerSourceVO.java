package com.zhehang.erp.modules.dashboard.cockpit.domain.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerSourceVO {
    private String source;
    private Integer count;
}
