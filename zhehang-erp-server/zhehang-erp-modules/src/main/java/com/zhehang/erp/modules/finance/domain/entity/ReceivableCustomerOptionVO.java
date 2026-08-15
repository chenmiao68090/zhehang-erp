package com.zhehang.erp.modules.finance.domain.entity;

import lombok.Data;

/** 回款续费新增应收时的客户下拉选项。 */
@Data
public class ReceivableCustomerOptionVO {
    private Long id;
    private String name;
    private String shortName;
    private Long ownerId;
}
