package com.zhehang.erp.modules.partner.domain;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

/**
 * 长期合作客户·历史合作记录(按月)。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("biz_partner_history")
public class BizPartnerHistory extends BaseEntity {
    /** 所属长期客户ID */
    private Long partnerId;
    /** 合作月份 YYYY-MM */
    private String coopMonth;
    /** 月度金额 */
    private BigDecimal amount;
    /** 是否结算:1是 0否 */
    private Integer settled;
    /** 发票是否开具:1是 0否 */
    private Integer invoiceDone;
    /** 结算凭证 [{fileId,fileName}] JSON(可多张) */
    private String vouchers;
    /** 备注 */
    private String remark;
}
