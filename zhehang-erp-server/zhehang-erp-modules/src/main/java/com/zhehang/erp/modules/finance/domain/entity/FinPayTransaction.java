package com.zhehang.erp.modules.finance.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 收款中心-统一收款流水(渠道原始层)。
 * 每笔收款先进本表,财务「认领」后生成 fin_company_journal 收款登记(下游账本)。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("fin_pay_transaction")
public class FinPayTransaction extends BaseEntity {

    /** 状态常量 */
    public static final String STATUS_UNCLAIMED = "unclaimed";
    public static final String STATUS_CLAIMED = "claimed";
    public static final String STATUS_IGNORED = "ignored";

    /** 来源常量 */
    public static final String SOURCE_MANUAL = "manual";
    public static final String SOURCE_IMPORT = "import";

    private Long channelId;

    /** 渠道类型快照(wechat/alipay/bank_qr/bank_account) */
    private String channelType;

    /** 渠道名称快照 */
    private String channelName;

    /** 金额(收入为正) */
    private BigDecimal amount;

    /** 支付/到账时间 */
    private LocalDateTime payTime;

    private String payerName;

    private String payerAccount;

    /** 交易单号/银行流水号(原文) */
    private String tradeNo;

    /** 防重键:有交易单号取单号,否则取(渠道|时间|金额|付款方)摘要;唯一索引兜底 */
    private String dedupKey;

    /** 来源:manual/import/callback/bill */
    private String source;

    /** 状态:unclaimed/claimed/ignored */
    private String status;

    /** 认领生成的收款登记id */
    private Long journalId;

    /** 认领人用户id */
    private Long claimBy;

    private LocalDateTime claimTime;

    private Long importBatchId;

    /** 原始数据(导入行原文/回调报文) */
    private String rawData;

    private String remark;
}
