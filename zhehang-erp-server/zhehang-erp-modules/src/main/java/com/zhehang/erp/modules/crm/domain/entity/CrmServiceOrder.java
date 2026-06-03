package com.zhehang.erp.modules.crm.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("crm_service_order")
public class CrmServiceOrder extends BaseEntity {
    /** 客户ID */
    private Long customerId;
    /** 客户名称 */
    private String customerName;
    /** 服务类型 */
    private String serviceType;
    /** 合同编号 */
    private String contractNo;
    /** 开始日期 */
    private LocalDate startDate;
    /** 结束日期 */
    private LocalDate endDate;
    /** 金额 */
    private BigDecimal amount;
    /** 总金额 */
    private BigDecimal totalAmount;
    /** 状态(0正常 1已到期 2续费中 3已续费) */
    private Integer status;
    /** 续费状态 */
    private String renewalStatus;
    /** 服务商类型 */
    private String providerType;
    /** 处理人ID */
    private Long handlerId;
    /** 处理人姓名 */
    private String handlerName;
    /** 备注 */
    private String remark;
}
