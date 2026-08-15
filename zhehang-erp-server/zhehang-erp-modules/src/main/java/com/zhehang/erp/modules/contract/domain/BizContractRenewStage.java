package com.zhehang.erp.modules.contract.domain;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 合同续费阶梯处理状态(60/45/30/15/7/0 天)
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("biz_contract_renew_stage")
public class BizContractRenewStage extends BaseEntity {
    /** 关联合同ID */
    private Long contractId;
    /** 阶梯天数:60/45/30/15/7/0 */
    private Integer stage;
    /** 处理状态:pending/done/overdue */
    private String status;
    /** 处理人 */
    private String handler;
    /** 备注 */
    private String note;
    /** 处理时间 */
    private LocalDateTime handledAt;
}
