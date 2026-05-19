package com.zhehang.erp.modules.finance.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("finance_voucher")
public class FinanceVoucher extends BaseEntity {
    /** 凭证号 */
    private String voucherNo;
    /** 凭证日期 */
    private LocalDate voucherDate;
    /** 凭证类型 */
    private String voucherType;
    /** 会计期间 */
    private String period;
    /** 摘要 */
    private String summary;
    /** 借方合计 */
    private BigDecimal totalDebit;
    /** 贷方合计 */
    private BigDecimal totalCredit;
    /** 状态 0草稿 1已审核 2已过账 3已作废 */
    private Integer status;
    /** 审核人 */
    private Long reviewerId;
    /** 审核时间 */
    private LocalDateTime reviewTime;
    /** 客户ID */
    private Long customerId;
}
