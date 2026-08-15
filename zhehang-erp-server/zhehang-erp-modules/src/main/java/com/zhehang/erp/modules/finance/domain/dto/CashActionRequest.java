package com.zhehang.erp.modules.finance.domain.dto;

import lombok.Data;

/** 审核、反审核、作废和反核销等高风险动作的原因/意见。 */
@Data
public class CashActionRequest {
    private String reason;
    private String remark;
    private Integer version;
}
