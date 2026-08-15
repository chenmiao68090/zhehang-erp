package com.zhehang.erp.modules.partner.domain;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;
import java.util.List;

/**
 * 长期合作客户名录。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("biz_partner")
public class BizPartner extends BaseEntity {
    /** 客户/公司名称 */
    private String companyName;
    /** 联系人 */
    private String contact;
    /** 联系电话 */
    private String phone;
    /** 决策人姓名 */
    private String decisionMaker;
    /** 决策人联系电话 */
    private String decisionPhone;
    /** 业务负责人姓名 */
    private String bizOwnerName;
    /** 业务负责人电话 */
    private String bizOwnerPhone;
    /** 结算方式 */
    private String settleMethod;
    /** 是否开票:1是 */
    private Integer needInvoice;
    /** 开票信息 */
    private String invoiceInfo;
    /** 月度均价(等级按此分级) */
    private java.math.BigDecimal monthlyAvg;
    /** 合作业务:seal/bill/gs/mixed */
    private String bizType;
    /** 合作等级:normal/vip/strategic */
    private String level;
    /** 合作起始日期 */
    private LocalDate sinceDate;
    /** 备注 */
    private String remark;
    /** 默认邮寄方式(京东寄付/顺丰到付/闪送寄付等) */
    private String mailMethod;
    /** 默认邮寄地址 */
    private String mailAddress;
    /** 该客户的协议价(列表带出,用于外面显示 新设/变更/单章 等标准价);非DB字段 */
    @TableField(exist = false)
    private List<BizPartnerPrice> prices;
}
