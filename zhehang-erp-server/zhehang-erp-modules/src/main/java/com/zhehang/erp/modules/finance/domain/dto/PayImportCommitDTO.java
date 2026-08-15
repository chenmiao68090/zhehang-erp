package com.zhehang.erp.modules.finance.domain.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

/**
 * 收款中心-对账单导入请求(前端解析 CSV/粘贴文本为行,后端按防重键去重入库)。
 * preview 与 commit 共用本结构:preview 只统计不落库。
 */
@Data
public class PayImportCommitDTO {
    /** 渠道id */
    @NotNull(message = "请选择收款渠道")
    private Long channelId;

    /** 文件名(粘贴导入可传"粘贴导入") */
    private String fileName;

    @NotEmpty(message = "没有可导入的行")
    @Size(max = 5000, message = "单次最多导入5000行,请分批")
    private List<Row> rows;

    @Data
    public static class Row {
        /** 支付/到账时间,格式 yyyy-MM-dd HH:mm:ss 或 yyyy-MM-dd */
        private String payTime;
        private BigDecimal amount;
        private String payerName;
        private String payerAccount;
        private String tradeNo;
        private String remark;
        /** 原始行文本(留档) */
        private String raw;
    }
}
