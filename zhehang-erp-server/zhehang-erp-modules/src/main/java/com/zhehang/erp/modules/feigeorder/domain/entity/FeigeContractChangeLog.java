package com.zhehang.erp.modules.feigeorder.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("feige_contract_change_log")
public class FeigeContractChangeLog extends BaseEntity {
    private Long contractId;
    private String changeType;
    private String changeDesc;
    private Long operatorId;
    private String operatorName;
    private String beforeData;
    private String afterData;
}
