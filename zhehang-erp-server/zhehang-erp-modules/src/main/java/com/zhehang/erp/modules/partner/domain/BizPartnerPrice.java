package com.zhehang.erp.modules.partner.domain;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

/**
 * 长期合作客户·协议价明细。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("biz_partner_price")
public class BizPartnerPrice extends BaseEntity {
    /** 所属客户ID */
    private Long partnerId;
    /** 项目 */
    private String itemName;
    /** 协议价 */
    private BigDecimal price;
    /** 单位 */
    private String unit;
    /** 备注 */
    private String remark;
}
