package com.zhehang.erp.modules.finance.domain.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/** 对账文件自动比对预览。 */
@Data
public class CashReconcilePreviewVO {
    private String accountName;
    private List<Item> items = new ArrayList<>();
    private Stats stats = new Stats();

    @Data
    public static class Item {
        private Integer rowNo;
        private LocalDate transactionDate;
        private LocalDateTime transactionTime;
        private BigDecimal amount;
        private String payerName;
        private String payerNameNormalized;
        private String bankSerialNo;
        private String summary;
        private String matchStatus;
        private Long journalId;
        private String receiptNo;
        private String journalPayerName;
        private String matchRule;
        private Integer confidenceScore;
        private List<String> errors = new ArrayList<>();
    }

    @Data
    public static class Stats {
        private Integer total = 0;
        private Integer matched = 0;
        private Integer suggested = 0;
        private Integer unmatched = 0;
        private Integer conflict = 0;
        private Integer error = 0;
        private BigDecimal statementAmount = BigDecimal.ZERO;
        private BigDecimal matchedAmount = BigDecimal.ZERO;
    }
}
