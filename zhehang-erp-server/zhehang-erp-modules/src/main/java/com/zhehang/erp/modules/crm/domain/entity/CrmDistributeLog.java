package com.zhehang.erp.modules.crm.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("crm_distribute_log")
public class CrmDistributeLog extends BaseEntity {
    /** 线索ID */
    private Long leadId;
    /** 来源公海池ID */
    private Long fromPoolId;
    /** 接收人ID */
    private Long toUserId;
    /** 接收人姓名 */
    private String toUserName;
    /** 来源人ID */
    private Long fromUserId;
    /** 来源人姓名 */
    private String fromUserName;
    /** 分配类型(auto/manual/grab) */
    private String distributeType;
    /** 权重明细JSON */
    private String weightDetailJson;
    /** 备注 */
    private String remark;
}
