package com.zhehang.erp.modules.finance.domain.dto;

import lombok.Data;

/** 对账差异人工关联或忽略请求。 */
@Data
public class CashReconcileResolveRequest {
    private Long journalId;
    /** link/ignore */
    private String action;
    private String reason;
}
