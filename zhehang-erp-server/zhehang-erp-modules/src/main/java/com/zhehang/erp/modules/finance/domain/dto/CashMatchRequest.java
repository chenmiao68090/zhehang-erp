package com.zhehang.erp.modules.finance.domain.dto;

import lombok.Data;

import java.util.List;

/** 收款核销请求:把某笔收款日记账核销到一张或多张报单。 */
@Data
public class CashMatchRequest {
    /** 收款日记账ID */
    private Long journalId;
    /** 客户端幂等号；重复提交同一请求只生效一次。 */
    private String requestNo;
    /** manual/recommended/import/receivable */
    private String matchMethod;
    /** 本次核销客户唯一时，是否人工确认付款方别名。 */
    private Boolean rememberPayerAlias;
    /** 本次要核销的报单明细 */
    private List<CashMatchItemDTO> items;
}
