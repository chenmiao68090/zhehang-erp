package com.zhehang.erp.modules.channel.domain;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 供应商实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("biz_supplier")
public class BizSupplier extends BaseEntity {
    /** 供应商编号 */
    private String supplierNo;
    /** 供应商名称 */
    private String name;
    /** 简称 */
    private String shortName;
    /** 合作状态(active/paused/terminated/potential) */
    private String status;
    /** 对接人姓名 */
    private String contactName;
    /** 联系电话 */
    private String contactPhone;
    /** 对接人微信 */
    private String contactWechat;
    /** 供应商地址 */
    private String address;
    /** 可供应区域(JSON数组) */
    private String supplyRegions;
    /** 详细地址列表(JSON) */
    private String detailAddresses;
    /** 地址总数 */
    private Integer totalAddressCount;
    /** 剩余可用地址数 */
    private Integer availableCount;
    /** 年付价格 */
    private BigDecimal priceAnnual;
    /** 半年付价格 */
    private BigDecimal priceSemiAnnual;
    /** 季付价格 */
    private BigDecimal priceQuarterly;
    /** 最低签约年限 */
    private Integer minContractYears;
    /** 是否有返点(0否/1是) */
    private Integer hasRebate;
    /** 返点比例 */
    private BigDecimal rebateRate;
    /** 返点结算周期 */
    private String rebateCycle;
    /** 付款方式 */
    private String paymentMethod;
    /** 账期天数 */
    private Integer creditDays;
    /** 合作合同编号 */
    private String cooperationContractNo;
    /** 合作开始日 */
    private LocalDate cooperationStart;
    /** 合作到期日 */
    private LocalDate cooperationEnd;
    /** 续约条件 */
    private String renewalTerms;
    /** 供应商等级(A/B/C) */
    private String supplierLevel;
    /** 备注 */
    private String remark;
}
