package com.zhehang.erp.modules.steward.domain;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 管家体系·签约客户(售后客户中枢)。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("biz_steward_client")
public class BizStewardClient extends BaseEntity {
    /** 公司名称 */
    private String companyName;
    /** 联系人 */
    private String contact;
    /** 联系电话 */
    private String phone;
    /** 负责管家 */
    private String stewardName;
    /** 服务项目(逗号:代理记账/工商/刻章等) */
    private String services;
    /** 合同金额 */
    private BigDecimal contractAmount;
    /** 签约日期 */
    private LocalDate signDate;
    /** 到期日期 */
    private LocalDate expireDate;
    /** 服务周期:年付/季付/月付 */
    private String serviceCycle;
    /** 状态:serving服务中/paused暂停/churned已流失 */
    private String status;
    /** 客户来源 */
    private String source;
    /** 备注 */
    private String remark;
}
