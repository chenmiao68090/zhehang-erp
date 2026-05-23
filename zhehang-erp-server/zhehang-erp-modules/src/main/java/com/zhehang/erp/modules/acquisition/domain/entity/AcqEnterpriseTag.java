package com.zhehang.erp.modules.acquisition.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("acq_enterprise_tag")
public class AcqEnterpriseTag extends BaseEntity {
    /** 企业ID */
    private Long enterpriseId;
    /** 标签名称 */
    private String tagName;
    /** 标签颜色 */
    private String tagColor;
    /** 添加人ID */
    private Long userId;
}
