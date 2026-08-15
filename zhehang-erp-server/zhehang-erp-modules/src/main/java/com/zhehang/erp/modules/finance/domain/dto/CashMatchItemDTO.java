package com.zhehang.erp.modules.finance.domain.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

/** 匹配(核销)明细:一条收款核销到某张报单的一笔金额。 */
@Data
public class CashMatchItemDTO {
    /** 报单类型:bookkeeping/address/gs/seal */
    private String bizType;
    /** 报单在其表内的主键ID */
    private Long bizId;
    /** 报单单号(快照,前端从列表带回) */
    private String orderNo;
    /** 报单客户名(快照,可空) */
    private String orderCustomer;
    /** 本次匹配金额 */
    private BigDecimal matchedAmount;
    /** 匹配备注 */
    private String matchRemark;
    /** 推荐分数快照。 */
    private Integer confidenceScore;
    /** 推荐理由快照。 */
    private List<String> confidenceReasons;
}
