package com.zhehang.erp.modules.finance.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("finance_reimburse")
public class FinanceReimburse extends BaseEntity {
    private Long applicantId;
    private String reimburseNo;
    private String title;
    private BigDecimal totalAmount;
    /** 0draft 1pending 2approved 3rejected 4paid */
    private Integer status;
    private String remark;
}
