package com.zhehang.erp.modules.operation.domain;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 运营服务中心 - 线上投流每日反馈。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("ops_ad_feedback")
public class OpsAdFeedback extends BaseEntity {
    /** 反馈日期 */
    private LocalDate feedbackDate;
    /** 投放平台 */
    private String platform;
    /** 投放账户 */
    private String accountName;
    /** 投放计划/素材 */
    private String campaignName;
    /** 投放消耗 */
    private BigDecimal spendAmount;
    /** 总客资数 */
    private Integer totalLeads;
    /** 有效客资数 */
    private Integer validLeads;
    /** 无效客资数 */
    private Integer invalidLeads;
    /** 成交/转化数 */
    private Integer conversionCount;
    /** 成交金额 */
    private BigDecimal revenueAmount;
    /** 负责人 */
    private String ownerName;
    /** 状态(normal/watch/paused) */
    private String status;
    /** 备注 */
    private String remark;
}
