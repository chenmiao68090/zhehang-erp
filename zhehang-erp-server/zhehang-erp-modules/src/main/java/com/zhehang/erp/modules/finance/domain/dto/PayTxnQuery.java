package com.zhehang.erp.modules.finance.domain.dto;

import lombok.Data;

import java.time.LocalDate;

/**
 * 收款中心-流水列表查询条件。
 */
@Data
public class PayTxnQuery {
    /** 关键字(付款方/交易单号/备注) */
    private String keyword;
    /** 渠道id */
    private Long channelId;
    /** 渠道类型 wechat/alipay/bank_qr/bank_account */
    private String channelType;
    /** 状态 unclaimed/claimed/ignored */
    private String status;
    /** 来源 manual/import/callback/bill */
    private String source;
    /** 支付日期起 */
    private LocalDate beginDate;
    /** 支付日期止 */
    private LocalDate endDate;

    /** 页码,默认1 */
    private Integer pageNum;
    /** 每页条数,默认20 */
    private Integer pageSize;
}
