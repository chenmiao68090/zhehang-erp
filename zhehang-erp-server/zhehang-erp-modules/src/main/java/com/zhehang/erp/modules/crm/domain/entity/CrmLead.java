package com.zhehang.erp.modules.crm.domain.entity;

import com.baomidou.mybatisplus.annotation.FieldStrategy;
import com.baomidou.mybatisplus.annotation.TableField;
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
    /** 法定代表人/联系人 */
    private String legalPerson;
    /** 电话 */
    private String phone;
    /** 企业联系电话 */
    private String companyPhone;
    /** 邮箱 */
    private String email;
    /** 登记状态 */
    private String registerStatus;
    /** 来源（1工商公开名单 2客户转介绍 3美团投流 4抖音投流 5线下来客 6其他投流 7名单采购/电销 8渠道合作 9私域二开 10其他） */
    private Integer source;
    /** 状态（1新建 2跟进中 3已转化 4无效） */
    private Integer status;
    /** 无效原因 */
    private String invalidReason;
    /** 转化后关联客户ID */
    private Long convertedCustomerId;
    /** 负责人ID */
    private Long ownerId;
    /** 负责人姓名(非数据库列;列表回显用,由服务层批量填充) */
    @TableField(exist = false)
    private String ownerName;
    /** 归属部门ID(数据权限按部门过滤用) */
    private Long deptId;
    /** 备注 */
    private String remark;
    /** 客户类型 */
    private String customerType;
    /** 客户意向等级(A/B/C跟进中,D/E历史客资,空=尚未沟通分级) */
    @TableField(insertStrategy = FieldStrategy.ALWAYS)
    private String customerLevel;
    /** 注册区域 */
    private String region;
    /** 企业规模 */
    private String enterpriseScale;
    /** 企业类型 */
    private String enterpriseType;
    /** 注册资本 */
    private BigDecimal registeredCapital;
    /** 实缴资本 */
    private String paidCapital;
    /** 成立日期 */
    private LocalDate establishedDate;
    /** 核准日期 */
    private LocalDate approvedDate;
    /** 统一社会信用代码 */
    private String creditCode;
    /** 参保人数 */
    private String insuredCount;
    /** 参保人数所属年报 */
    private String insuredYear;
    /** 注册地址 */
    private String registerAddress;
    /** 最新地址 */
    private String latestAddress;
    /** 经营范围 */
    private String businessScope;
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
    /** 下一步动作时间(精确到分钟) */
    private LocalDateTime nextActionTime;
    /** 下一步动作类型 */
    private String nextActionType;
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
    /** 渠道明细（营销活动归因） */
    private String channel;
    /** 获客成本（分摊） */
    private BigDecimal acquireCost;
    /** 关联营销活动ID */
    private Long campaignId;
    /** 意向分类(A/B/C/D/E),与customerLevel同步 */
    private String intentLevel;
    /** 客户需求类型(多选逗号分隔) */
    private String needType;
    /** 报价情况(未报价/已报价/已成交) */
    private String quoteStatus;
    /** 跟进策略 */
    private String followStrategy;

    // ===== 投流客资扩展(飞书 163/164,V126 新增列;全部新加,不改老字段/老枚举) =====
    /** 客户编号(TL+yyyyMMdd+6位,create 时若空则自动生成,唯一) */
    private String leadNo;
    /** 来源平台(美团/抖音/小红书等,独立于老 source 数字枚举) */
    private String sourcePlatform;
    /** 门店&品牌词 */
    private String storeBrand;
    /** 咨询业务(=「刻章业务」算刻章,其余算非刻章;164 拆分口径靠它) */
    private String consultBusiness;
    /** 客户昵称 */
    private String nickname;
    /** 客户微信(投流录入,对应新列 wechat_no,区别于老 wechat 列) */
    private String wechatNo;
    /** 虚拟电话(可含-) */
    private String virtualPhone;
    /** 是否有效(有效/无效/待定) */
    private String validity;
    /** 跟进状态新流程(线索接收/需求沟通/需求答疑/签单收款/移交结束交付,不改老 status) */
    private String followStatus;
    /** 线索接收时点(follow_status 首次置「线索接收」时写入,用于算响应时间) */
    private LocalDateTime receiveTime;
    /** 成交金额(164 非刻章成交额靠它 sum) */
    private BigDecimal dealAmount;
    /** 实际成交业务(多选,逗号分隔) */
    private String dealBusiness;
    /** 附件 JSON([{fileId,fileName}],走已有 /file/info 上传) */
    private String attachments;
}
