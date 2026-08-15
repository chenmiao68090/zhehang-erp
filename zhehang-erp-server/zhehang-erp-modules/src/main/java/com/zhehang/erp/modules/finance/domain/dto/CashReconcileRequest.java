package com.zhehang.erp.modules.finance.domain.dto;

import lombok.Data;

import java.util.List;

/** 渠道到账文件预览/提交请求，文件在前端解析后以结构化行传入。 */
@Data
public class CashReconcileRequest {
    private String requestNo;
    private String accountName;
    private String fileName;
    private String mappingJson;
    private List<Row> rows;

    @Data
    public static class Row {
        private Integer rowNo;
        private String transactionDate;
        private String transactionTime;
        private String amount;
        private String payerName;
        private String bankSerialNo;
        private String summary;
    }
}
