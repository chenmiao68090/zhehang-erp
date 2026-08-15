package com.zhehang.erp.modules.order.domain;

import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 地址业务报单/提单(挂靠地址新签报单)。
 *
 * <p>一张主表存整单:客户基础/申请详情放在表头列,4 个子表(收款详情/付款单位/服务事项/尾款)
 * 各用一个 JSON 数组列(MEDIUMTEXT)以 String 承载,前端传 JSON 字符串、后端原样存取,
 * 保持单表简单、不额外建子表。不复用/不改动 channel.BizAddressResource 与 renewal.BizAddressRenewal。</p>
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("biz_address_order")
public class BizAddressOrder extends BaseEntity {

    // ---- 客户基础 / 申请详情(表头列) ----------------------------------------

    /** 企业名称(必填) */
    private String companyName;
    /** 客户来源(老客户-新签/转介绍、老客-续费、抖音新签、美团新签) */
    private String customerSource;
    /** 注册类型 */
    private String registerType;
    /** 地址类型(新签/续签) */
    private String addressType;
    /** 企业地址(新出地址或续签地址) */
    private String companyAddress;
    /** 法人姓名 */
    private String legalName;
    /** 法人联系方式(手机) */
    private String legalPhone;
    /** 法人身份证号码(可空) */
    private String legalIdCard;

    /** 服务管家 userId */
    private Long stewardId;
    /** 服务管家姓名 */
    private String stewardName;
    /** 销售人员 userId */
    private Long salesId;
    /** 销售人员姓名 */
    private String salesName;

    /** 所属年份 */
    private Integer bizYear;
    /** 所属月份 */
    private Integer bizMonth;

    /** 合同开始日期 */
    private LocalDate contractStart;
    /** 合同结束日期 */
    private LocalDate contractEnd;
    /** 付款周期 */
    private String payCycle;
    /** 赠送月份 */
    private Integer giftMonths;

    // ---- 返款信息 -----------------------------------------------------------

    /** 是否有返款(0否/1是) */
    private Integer hasRebate;
    /**
     * 返款对象。付款资料不随通用列表/详情返回，只允许通过归属校验后的返款专用接口读取；
     * WRITE_ONLY 仍允许保存接口反序列化。
     */
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String rebateRecipient;
    /** 支付宝收款码在 file_info 中的文件ID；不直接保存图片、URL或base64。 */
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private Long rebateAlipayQrFileId;

    // ---- 4 个子表(JSON 数组字符串,MEDIUMTEXT) --------------------------------

    /** 「服务单位收款详情」JSON 数组:[{收款类型,收款账户,收款日期,客户单号/付款单号}] */
    private String collectItems;
    /** 「付款单位信息」JSON 数组:[{企业名称,对接人姓名,对接人号码}] */
    private String payerUnits;
    /** 「服务事项收款明细」JSON 数组:[{服务事项,合同开始,合同结束,服务时长天,收款金额}] */
    private String serviceItems;
    /** 「尾款情况」JSON 数组:[{尾款事项,尾款金额}] */
    private String balanceItems;

    /** 收款汇总(服务事项各行金额合计,冗余存一份便于列表展示/筛选) */
    private BigDecimal collectTotal;

    /** 状态(draft草稿/pending待审批/confirmed已确认/rejected已驳回) */
    private String status;
    /** 备注 */
    private String remark;
}
