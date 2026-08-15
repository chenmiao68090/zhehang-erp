package com.zhehang.erp.modules.task.domain;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 客户交接单实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("biz_task_handover")
public class BizTaskHandover extends BaseEntity {
    /** 交接单号 */
    private String handoverNo;
    /** 关联合同ID */
    private Long contractId;
    /** 客户ID */
    private Long customerId;
    /** 销售(移交方)用户ID */
    private Long salesId;
    /** 交付/会计(接收方)用户ID */
    private Long accountantId;
    /** 状态(pending待接收/in_progress进行中/completed已完成/returned已退回) */
    private String status;
    /** 交接截止日 */
    private LocalDate deadline;
    /** 完成时间 */
    private LocalDateTime completedTime;
    /** 备注 */
    private String note;

    /** 以下均为列表/详情聚合字段，不落交接主表。 */
    @TableField(exist = false)
    private String customerName;
    @TableField(exist = false)
    private String contractNo;
    @TableField(exist = false)
    private String contractTitle;
    @TableField(exist = false)
    private BigDecimal contractAmount;
    @TableField(exist = false)
    private Long orderId;
    @TableField(exist = false)
    private String salesName;
    @TableField(exist = false)
    private String accountantName;
    @TableField(exist = false)
    private List<BizTaskHandoverItem> items = new ArrayList<>();
    @TableField(exist = false)
    private Integer itemTotal;
    @TableField(exist = false)
    private Integer itemConfirmed;
    @TableField(exist = false)
    private Integer requiredTotal;
    @TableField(exist = false)
    private Integer requiredConfirmed;
    @TableField(exist = false)
    private Integer progress;
    @TableField(exist = false)
    private Boolean overdue;
    @TableField(exist = false)
    private Boolean canAccept;
    @TableField(exist = false)
    private Boolean canEditSales;
    @TableField(exist = false)
    private Boolean canConfirm;
    @TableField(exist = false)
    private Boolean canComplete;
}
