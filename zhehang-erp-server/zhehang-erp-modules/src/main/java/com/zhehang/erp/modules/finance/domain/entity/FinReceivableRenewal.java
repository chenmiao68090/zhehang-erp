package com.zhehang.erp.modules.finance.domain.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 回款续费应收台账。
 * 应收状态由系统按应收/实收/到期日自动计算;催收状态由人工催收动作维护。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("fin_receivable_renewal")
public class FinReceivableRenewal extends BaseEntity {
    private Long customerId;
    private String customerName;
    private String serviceType;
    private BigDecimal receivableAmount;
    private String receivableMonth;
    private LocalDate dueDate;
    private BigDecimal receivedAmount;
    /** V3上线前未关联日记账的历史实收基线。 */
    private BigDecimal legacyReceivedAmount;
    private BigDecimal arrearsAmount;
    /** 0待收/1部分收款/2已付款/3逾期 */
    private Integer receivableStatus;
    private Long collectorId;
    private String collectorName;
    private Long collectorDeptId;
    /** 未催/已催/承诺付款/已付款/坏账风险 */
    private String collectionStatus;
    private LocalDateTime recentCollectionTime;
    private LocalDateTime nextCollectionTime;
    /** 0否/1是 */
    private Integer pausedService;
    private String remark;

    /** 动态计算:欠费天数,未逾期或已结清为0。 */
    @TableField(exist = false)
    private Integer overdueDays;

    /** 动态计算:是否逾期欠费。 */
    @TableField(exist = false)
    private Boolean overdue;
}
