package com.zhehang.erp.modules.order.domain;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 提单(订单)实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("biz_order")
public class BizOrder extends BaseEntity {
    /** 订单编号 */
    private String orderNo;
    /** 客户ID */
    private Long customerId;
    /** 客户名称(冗余) */
    private String customerName;
    /** 商机ID */
    private Long opportunityId;
    /** 订单类型(new新单 renew续费 upgrade升级 supplement补单) */
    private String orderType;
    /** 服务类型 */
    private String serviceType;
    /** 订单总金额 */
    private BigDecimal totalAmount;
    /** 折扣金额 */
    private BigDecimal discountAmount;
    /** 实付金额 */
    private BigDecimal payableAmount;
    /** 服务开始日期 */
    private LocalDate serviceStartDate;
    /** 服务结束日期 */
    private LocalDate serviceEndDate;
    /** 销售员ID */
    private Long salesmanId;
    /** 销售员姓名 */
    private String salesmanName;
    /** 所属部门ID */
    private Long deptId;
    /** 状态(1草稿 2待审批 3主管已批 4财务已确认 5已完成 6已取消 7已驳回) */
    private Integer status;
    /** 提交审批时间 */
    private LocalDateTime submitTime;
    /** 审批完成时间 */
    private LocalDateTime approveTime;
    /** 财务确认时间 */
    private LocalDateTime financeConfirmTime;
    /** 取消时间 */
    private LocalDateTime cancelTime;
    /** 取消原因 */
    private String cancelReason;
    /** 附件(JSON) */
    private String attachments;
    /** 备注 */
    private String remark;
}
