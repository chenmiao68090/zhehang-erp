package com.zhehang.erp.modules.finance.domain.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

/**
 * 收款批量导入·预览结果:逐行结论 + 汇总统计。逐行处理但不入库。
 */
@Data
public class CashImportPreviewResult {
    /** 逐行结果(空行已忽略) */
    private List<CashImportRowResult> rows;
    /** 汇总统计 */
    private Stats stats;

    @Data
    public static class Stats {
        /** 有效数据总行数(已忽略空行) */
        private int total;
        /** 可导入行数(valid 且非 duplicate) */
        private int importable;
        /** 硬校验失败行数 */
        private int error;
        /** 疑似(suspect)行数 */
        private int suspect;
        /** 可导入金额合计 */
        private BigDecimal importableAmount = BigDecimal.ZERO;
    }
}
