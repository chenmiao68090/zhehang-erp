package com.zhehang.erp.modules.order.domain;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 代理记账提单。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("biz_bookkeeping_order")
public class BizBookkeepingOrder extends BaseEntity {
    /** 关联线索ID */
    private Long leadId;
    /** 公司名称 */
    private String companyName;
    /** 联系人 */
    private String contactName;
    /** 联系电话 */
    private String phone;
    /** 统一社会信用代码 */
    private String creditCode;
    /** 合同金额 */
    private BigDecimal contractAmount;
    /** 服务开始日期 */
    private LocalDate serviceStart;
    /** 服务结束日期 */
    private LocalDate serviceEnd;
    /** 签约日期 */
    private LocalDate signDate;
    /** 付款方式 */
    private String payMethod;
    /** 服务内容 */
    private String serviceContent;
    /** 合同附件 JSON */
    private String contractFile;
    /** 业务归属人 */
    private String ownerName;
    /** 状态 */
    private String status;
    /** 备注 */
    private String remark;
    /** 公司性质(个体户(查账)/个体户(核定)/小规模(0申报)/小规模(有账)/一般纳税人(0申报)/一般纳税人(有账)) */
    private String companyNature;
    /** 合作周期(一年/多年) */
    private String coopPeriod;
    /** 合作开始时间 */
    private LocalDate coopStart;
    /** 合作到期时间 */
    private LocalDate coopEnd;
    /** 注册地址 */
    private String regAddress;
    /** 注册地址归属(客户/公司) */
    private String regAddressOwner;
    /** 代账金额 */
    private BigDecimal bookkeepingAmount;
    /** 特殊备注 */
    private String specialRemark;
}
