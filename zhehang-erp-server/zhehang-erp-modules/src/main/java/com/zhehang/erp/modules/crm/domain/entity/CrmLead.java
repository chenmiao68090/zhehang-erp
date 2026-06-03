package com.zhehang.erp.modules.crm.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("crm_lead")
public class CrmLead extends BaseEntity {
    /** 线索名称 */
    private String name;
    /** 公司名称 */
    private String company;
    /** 电话 */
    private String phone;
    /** 邮箱 */
    private String email;
    /** 来源（1网站 2电话 3推荐 4广告） */
    private Integer source;
    /** 状态（1新建 2跟进中 3已转化 4无效） */
    private Integer status;
    /** 负责人ID */
    private Long ownerId;
    /** 备注 */
    private String remark;
    /** 客户类型 */
    private String customerType;
    /** 客户等级(A/B/C/D) */
    private String customerLevel;
    /** 注册区域 */
    private String region;
    /** 企业规模 */
    private String enterpriseScale;
    /** 注册资本 */
    private BigDecimal registeredCapital;
    /** 成立日期 */
    private LocalDate establishedDate;
    /** 微信 */
    private String wechat;
    /** 联系人职位 */
    private String contactPosition;
    /** 联系人角色 */
    private String contactRole;
    /** 所属公海池ID */
    private Long poolId;
    /** 归属(pool/private) */
    private String ownership;
    /** 领取时间 */
    private LocalDateTime claimTime;
    /** 最后跟进时间 */
    private LocalDateTime lastFollowTime;
    /** 下次跟进时间 */
    private LocalDate nextFollowTime;
    /** 最后跟进内容 */
    private String lastFollowContent;
    /** 跟进次数 */
    private Integer followCount;
    /** 保护期到期 */
    private LocalDate protectionExpireDate;
    /** 回收预警天数 */
    private Integer recycleWarningDays;
    /** 服务类型JSON */
    private String serviceType;
    /** 现有服务商 */
    private String currentProvider;
    /** 服务到期日 */
    private LocalDate serviceExpireDate;
    /** 纳税人类型 */
    private Integer isGeneralTaxpayer;
    /** 月均票据量 */
    private String monthlyInvoiceVolume;
    /** 报价金额 */
    private BigDecimal quotedPrice;
    /** 成交概率 */
    private Integer dealProbability;
    /** 预计成交日期 */
    private LocalDate expectedDealDate;
    /** 特殊需求 */
    private String specialNeeds;
    /** 来源细分 */
    private String sourceDetail;
    /** 负责团队 */
    private String teamType;
    /** 协作人JSON */
    private String collaboratorIds;
    /** 被回收次数 */
    private Integer recycleCount;
    /** 上次回收时间 */
    private LocalDateTime lastRecycleTime;
}
