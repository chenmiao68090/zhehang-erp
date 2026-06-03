package com.zhehang.erp.modules.marketing.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

/**
 * 营销活动（获客 ROI 勾稽地基）。
 *
 * <p>每次投放/获客活动一条记录，登记预算与实际花费；线索通过 campaign_id 关联到活动，
 * 从而把「营销投入 → 线索 → 商机 → 合同成交」串成可核算的投入产出链。</p>
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("mkt_campaign")
public class MktCampaign extends BaseEntity {
    /** 活动名称 */
    private String campaignName;
    /** 渠道：百度/抖音/小红书/电销/转介绍/官网表单 等 */
    private String channel;
    /** 预算 */
    private BigDecimal budget;
    /** 实际花费 */
    private BigDecimal actualCost;
    /** 开始日期 yyyy-MM-dd */
    private String startDate;
    /** 结束日期 yyyy-MM-dd */
    private String endDate;
    /** 展示数 */
    private Integer impressions;
    /** 点击数 */
    private Integer clicks;
    /** 线索数（冗余，可由线索按 campaignId 统计回填） */
    private Integer leadsCount;
    /** 负责人ID */
    private Long ownerId;
    /** 状态：1 进行中 / 2 已结束 */
    private Integer status;
    /** 备注 */
    private String remark;
}
