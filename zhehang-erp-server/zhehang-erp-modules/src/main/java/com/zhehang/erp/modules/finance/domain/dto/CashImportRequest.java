package com.zhehang.erp.modules.finance.domain.dto;

import lombok.Data;

import java.util.List;

/**
 * 收款批量导入请求(预览 /import-preview 与提交 /import-commit 共用)。
 * 预览时 fileName 可空;提交时 rows 应为用户已确认的有效行。
 */
@Data
public class CashImportRequest {
    /** 导入方式:paste粘贴/excel/csv */
    private String importType;
    /** 来源文件名(粘贴为空) */
    private String fileName;
    /** 数据行(原始字符串值) */
    private List<CashImportRowDTO> rows;
}
