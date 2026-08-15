package com.zhehang.erp.modules.finance.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.Version;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/** 每日到账核对头表。第一阶段正式口径是当日入账，不计算完整银行期末余额。 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("fin_cash_daily_close")
public class FinCashDailyClose extends BaseEntity {
    private LocalDate closeDate;
    private String status;
    private Integer systemCount;
    private BigDecimal systemAmount;
    private Integer actualCount;
    private BigDecimal actualAmount;
    private BigDecimal differenceAmount;
    private String differenceReason;
    private Long submittedBy;
    private LocalDateTime submittedAt;
    private Long closedBy;
    private LocalDateTime closedAt;
    private Long reopenedBy;
    private LocalDateTime reopenedAt;
    private String reopenReason;
    @Version
    private Integer version;
}
