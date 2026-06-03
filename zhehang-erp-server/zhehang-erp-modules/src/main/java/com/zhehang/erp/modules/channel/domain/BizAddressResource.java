package com.zhehang.erp.modules.channel.domain;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 地址资源实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("biz_address_resource")
public class BizAddressResource extends BaseEntity {
    /** 资源编号 */
    private String resourceNo;
    /** 供应商ID */
    private Long supplierId;
    /** 采购单ID */
    private Long procurementId;
    /** 挂靠地址 */
    private String address;
    /** 所属区域 */
    private String region;
    /** 采购单价 */
    private BigDecimal purchasePrice;
    /** 建议销售价 */
    private BigDecimal suggestedPrice;
    /** 状态(available/reserved/sold/expired/abnormal) */
    private String status;
    /** 关联客户ID */
    private Long customerId;
    /** 关联合同ID */
    private Long contractId;
    /** 入库日期 */
    private LocalDate stockInDate;
    /** 售出日期 */
    private LocalDate soldDate;
    /** 到期日期 */
    private LocalDate expireDate;
}
