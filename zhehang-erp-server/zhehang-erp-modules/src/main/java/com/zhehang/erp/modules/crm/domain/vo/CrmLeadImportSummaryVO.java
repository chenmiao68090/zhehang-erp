package com.zhehang.erp.modules.crm.domain.vo;

import lombok.Data;

/** 导入预检/确认汇总。warning 是 READY/IMPORTED 行的叠加提示，不参与总数等式。 */
@Data
public class CrmLeadImportSummaryVO {
    private int total;
    private int importable;
    private int imported;
    private int duplicate;
    private int conflict;
    private int error;
    private int warning;
}
