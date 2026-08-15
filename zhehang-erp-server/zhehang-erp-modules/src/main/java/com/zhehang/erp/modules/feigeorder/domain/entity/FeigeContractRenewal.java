package com.zhehang.erp.modules.feigeorder.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("feige_contract_renewal")
public class FeigeContractRenewal extends BaseEntity {
    private Long contractId;
    private LocalDate renewalDate;
    private LocalDate startDate;
    private LocalDate expireDate;
    private BigDecimal amount;
    private Integer giftMonth;
    private String payType;
    private Long operatorId;
    private String operatorName;
    private String remark;
}
