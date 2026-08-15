package com.zhehang.erp.modules.finance.domain.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 收款日记账与业务报单的匹配(核销)关系。
 * 一笔收款可核销到多张报单;一张报单也可被多笔收款分次核销。
 * 反核销 = 逻辑删除本行(deleted=1)。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("fin_cash_match")
public class FinCashMatch extends BaseEntity {
    /** 收款日记账ID(fin_cash_journal.id) */
    private Long journalId;
    /** 报单类型:bookkeeping/address/gs/seal */
    private String bizType;
    /** 报单在其表内的主键ID */
    private Long bizId;
    /** 报单单号快照 */
    private String orderNo;
    /** 报单客户名快照(可空) */
    private String orderCustomer;
    /** 本次匹配(核销)金额 */
    private BigDecimal matchedAmount;
    /** 核销记录状态:active/cancelled */
    private String matchStatus;
    /** 核销方式:manual/recommended/import/receivable */
    private String matchMethod;
    /** 推荐置信度快照0-100 */
    private Integer confidenceScore;
    /** 推荐理由JSON快照 */
    private String confidenceReasonJson;
    /** 客户端幂等请求号 */
    private String requestNo;
    /** 匹配备注 */
    private String matchRemark;
    /** 匹配人用户ID */
    private Long matchedBy;
    /** 匹配时间 */
    private LocalDateTime matchedAt;
    /** 反核销人 */
    private Long cancelledBy;
    /** 反核销时间 */
    private LocalDateTime cancelledAt;
    /** 反核销原因 */
    private String cancelReason;

    /** 报单类型中文标签(非数据库字段,明细回显用) */
    @TableField(exist = false)
    private String bizTypeLabel;
    /** 匹配人姓名(非数据库字段,明细回显用) */
    @TableField(exist = false)
    private String matchedByName;
    /** 反核销人姓名(非数据库字段,明细回显用) */
    @TableField(exist = false)
    private String cancelledByName;
}
