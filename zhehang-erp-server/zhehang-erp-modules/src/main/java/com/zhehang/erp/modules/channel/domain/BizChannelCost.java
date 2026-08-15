package com.zhehang.erp.modules.channel.domain;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

/**
 * 渠道成本实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("biz_channel_cost")
public class BizChannelCost extends BaseEntity {
    /** 渠道名称 */
    private String channelName;
    /** 渠道类型(online线上 offline线下 partner合作伙伴 referral转介绍) */
    private String channelType;
    /** 统计周期(yyyy-MM) */
    private String period;
    /** 投入金额 */
    private BigDecimal costAmount;
    /** 带来线索数 */
    private Integer leadCount;
    /** 转化客户数 */
    private Integer convertedCount;
    /** 产生订单数 */
    private Integer orderCount;
    /** 订单收入 */
    private BigDecimal revenue;
    /** ROI(收入/成本 百分比) */
    private BigDecimal roi;
    /** 备注 */
    private String remark;
}
