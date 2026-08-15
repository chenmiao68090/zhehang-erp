package com.zhehang.erp.modules.finance.domain.vo;

import lombok.Data;

/** 收款日记账新增/筛选时的客户下拉选项(直查 crm_customer,仅返回少量必要字段)。 */
@Data
public class CashCustomerOptionVO {
    private Long id;
    private String name;
    private String shortName;
}
