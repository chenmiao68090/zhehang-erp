package com.zhehang.erp.modules.acquisition.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("acq_enterprise_crm_record")
public class AcqEnterpriseCrmRecord extends BaseEntity {
    /** 企业ID */
    private Long enterpriseId;
    /** CRM类型(lead线索/customer客户) */
    private String crmType;
    /** CRM记录ID */
    private Long crmId;
    /** 操作用户ID */
    private Long userId;
}
