package com.zhehang.erp.modules.feigeorder.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("feige_contract_handover")
public class FeigeContractHandover extends BaseEntity {
    private Long sourceStaffId;
    private String sourceStaffName;
    private Long targetStaffId;
    private String targetStaffName;
    private String serviceRole;
    private Integer contractCount;
    private String affectedContractIds;
    private String status;
    private Long operatorId;
    private String operatorName;
    private LocalDateTime revokedTime;
}
