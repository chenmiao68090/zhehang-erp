package com.zhehang.erp.modules.order.domain;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 续费提单(续费体系:地址续费/代账续费共用,renewal_type 区分)。
 *
 * <p>结构照 {@link BizAddressOrder}:一张主表存整单,4 个子表(收款详情/付款单位/服务事项/尾款)
 * 各用一个 JSON 数组列(MEDIUMTEXT)以 String 承载,前端传 JSON 字符串、后端原样存取。
 * 地址续费比代账续费多供应商 4 字段。不复用/不改动 renewal.BizAddressRenewal(地址续费台账)。</p>
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("biz_renewal_order")
public class BizRenewalOrder extends BaseEntity {

    /** 续费类型常量 */
    public static final String TYPE_ADDRESS = "address";
    public static final String TYPE_BOOKKEEPING = "bookkeeping";

    /** 续费类型:address地址续费/bookkeeping代账续费 */
    private String renewalType;

    // ---- 客户基础 / 申请详情(表头列) ----------------------------------------

    /** 企业名称(必填) */
    private String companyName;
    /** 客户来源 */
    private String customerSource;
    /** 注册类型 */
    private String registerType;
    /** 企业地址(续签地址) */
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

    /** 付款周期(单次业务收费/年度收费/两年版套餐/三年版套餐) */
    private String payCycle;
    /** 赠送月份 */
    private Integer giftMonths;
    /** 合同开始日期 */
    private LocalDate contractStart;
    /** 合同结束日期(前端按周期+赠送月自动算,可手改) */
    private LocalDate contractEnd;

    // ---- 地址续费专属(代账续费留空) -----------------------------------------

    /** 供应商姓名 */
    private String supplierName;
    /** 供应商公司 */
    private String supplierCompany;
    /** 成本 */
    private BigDecimal costAmount;
    /** 返点成本 */
    private BigDecimal rebateCost;

    // ---- 4 个子表(JSON 数组字符串) ------------------------------------------

    /** 服务单位收款详情 JSON:[{收款类型,收款账户,收款日期(到分钟),客户单号/付款单号}] */
    private String collectItems;
    /** 付款单位信息 JSON:[{企业名称,对接人姓名,对接人号码(11位)}] */
    private String payerUnits;
    /** 服务事项收款明细 JSON:[{服务事项,合同开始,合同结束,服务时长天,收款金额}] */
    private String serviceItems;
    /** 尾款情况 JSON:[{尾款事项,尾款金额}] */
    private String balanceItems;

    /** 收款汇总(服务事项各行金额合计) */
    private BigDecimal collectTotal;

    /** 状态(pending待审批/confirmed已确认/rejected已驳回) */
    private String status;

    private String remark;
}
