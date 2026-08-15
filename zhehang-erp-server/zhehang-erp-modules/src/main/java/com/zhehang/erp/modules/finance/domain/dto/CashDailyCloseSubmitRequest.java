package com.zhehang.erp.modules.finance.domain.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/** 日结提交：实际入账按账户逐行填写，系统数由后端重新汇总。 */
@Data
public class CashDailyCloseSubmitRequest {
    private LocalDate closeDate;
    private Integer actualCount;
    private BigDecimal actualAmount;
    private String differenceReason;
    private Integer version;
    private List<Account> accounts = new ArrayList<>();

    @Data
    public static class Account {
        private String accountName;
        private Integer actualCount;
        private BigDecimal actualAmount;
        private String differenceReason;
    }
}
