package com.zhehang.erp.modules.acquisition.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("acq_unlock_record")
public class AcqUnlockRecord extends BaseEntity {
    /** 企业ID */
    private Long enterpriseId;
    /** 联系方式ID */
    private Long contactId;
    /** 操作用户ID */
    private Long userId;
    /** 消耗额度 */
    private Integer creditCost;
}
