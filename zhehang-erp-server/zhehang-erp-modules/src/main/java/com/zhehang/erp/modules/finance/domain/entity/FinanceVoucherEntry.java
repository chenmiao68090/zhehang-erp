package com.zhehang.erp.modules.finance.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("finance_voucher_entry")
public class FinanceVoucherEntry extends BaseEntity {
    /** 凭证ID */
    private Long voucherId;
    /** 科目编码 */
    private String subjectCode;
    /** 科目名称 */
    private String subjectName;
    /** 摘要 */
    private String summary;
    /** 借方金额 */
    private BigDecimal debitAmount;
    /** 贷方金额 */
    private BigDecimal creditAmount;
    /** 辅助核算 */
    private String auxiliary;
}
