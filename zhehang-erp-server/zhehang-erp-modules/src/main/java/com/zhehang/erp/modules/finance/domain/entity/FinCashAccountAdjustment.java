package com.zhehang.erp.modules.finance.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.Version;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/** 账户余额调整。冲正通过新增反向记录完成，原记录不物理删除。 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("fin_cash_account_adjustment")
public class FinCashAccountAdjustment extends BaseEntity {
    private String adjustmentNo;
    private String requestNo;
    private Long accountId;
    private String accountNameSnapshot;
    private LocalDate adjustmentDate;
    private LocalDateTime adjustmentTime;
    /** in/out */
    private String direction;
    /** bank_fee/refund/correction/other */
    private String adjustmentType;
    private BigDecimal amount;
    private String reason;
    private String evidenceFile;
    /** active/reversed */
    private String status;
    private Long reversalOfId;
    private Long reversalId;
    private Long operatorId;
    private String operatorName;
    @Version
    private Integer version;
}
