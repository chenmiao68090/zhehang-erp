package com.zhehang.erp.modules.task.domain;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 业务提成结算单实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("biz_commission")
public class BizCommission extends BaseEntity {
    /** 结算单号 */
    private String commissionNo;
    /** 销售员ID */
    private Long salesmanId;
    /** 销售员姓名 */
    private String salesmanName;
    /** 部门ID */
    private Long deptId;
    /** 关联订单ID */
    private Long orderId;
    /** 结算周期(yyyy-MM) */
    private String period;
    /** 订单金额 */
    private BigDecimal orderAmount;
    /** 提成比例(%) */
    private BigDecimal commissionRate;
    /** 提成金额 */
    private BigDecimal commissionAmount;
    /** 状态(1待销售确认 2销售已确认 3主管已审核 4财务已确认 5老板已审批 6已发放 7已驳回) */
    private Integer status;
    /** 销售确认时间 */
    private LocalDateTime salesmanConfirmTime;
    /** 主管审核时间 */
    private LocalDateTime reviewTime;
    /** 财务确认时间 */
    private LocalDateTime financeConfirmTime;
    /** 老板审批时间 */
    private LocalDateTime bossApproveTime;
    /** 发放时间 */
    private LocalDateTime payTime;
    /** 备注 */
    private String remark;
}
