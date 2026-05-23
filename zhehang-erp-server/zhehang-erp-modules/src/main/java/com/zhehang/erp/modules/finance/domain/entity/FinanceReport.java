package com.zhehang.erp.modules.finance.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("finance_report")
public class FinanceReport extends BaseEntity {
    private String reportName;
    private String reportType;
    private String period;
    private String dataJson;
    private Integer status;
    private Long customerId;
}
