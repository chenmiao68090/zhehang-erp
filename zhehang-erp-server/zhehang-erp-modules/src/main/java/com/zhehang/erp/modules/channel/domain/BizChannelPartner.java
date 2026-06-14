package com.zhehang.erp.modules.channel.domain;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

/**
 * 同行渠道实体
 * 对应前端 views/supply/channel-partner.vue 的 ChannelPartner;模式参照 biz_supplier。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("biz_channel_partner")
public class BizChannelPartner extends BaseEntity {
    /** 渠道编号 */
    private String partnerNo;
    /** 渠道名称 */
    private String name;
    /** 渠道类型(peer/park/agency/business) */
    private String partnerType;
    /** 联系人 */
    private String contactName;
    /** 联系电话 */
    private String contactPhone;
    /** 负责人 */
    private String ownerName;
    /** 可售区域(JSON数组字符串) */
    private String regions;
    /** 协议价 */
    private BigDecimal basePrice;
    /** 结算方式 */
    private String settleMode;
    /** 信用额度 */
    private BigDecimal creditLimit;
    /** 应收余额 */
    private BigDecimal receivable;
    /** 本月订单数 */
    private Integer monthOrders;
    /** 本月渠道收入 */
    private BigDecimal monthRevenue;
    /** 渠道等级(A/B/C) */
    private String partnerLevel;
    /** 合作状态(active/watch/paused) */
    private String status;
    /** 备注 */
    private String remark;
}
