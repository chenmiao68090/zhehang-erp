package com.zhehang.erp.modules.finance.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.Version;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 收款日记账。
 * 登记每一笔真实到账,再通过 {@link FinCashMatch} 把款项核销到 4 张业务报单。
 * 旧 status 字段继续兼容旧页面；V3 使用 record/match/review/exception 四条独立状态轴。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("fin_cash_journal")
public class FinCashJournal extends BaseEntity {
    /** 收款编号(SK+yyyyMMdd+4位当日流水,唯一) */
    private String receiptNo;
    /** 收款日期 */
    private LocalDate receiptDate;
    /** 收款时间(可空) */
    private LocalDateTime receiptTime;
    /** 收款金额 */
    private BigDecimal amount;
    /** 已匹配(核销)金额 */
    private BigDecimal matchedAmount;
    /** 未匹配金额(= amount - matchedAmount) */
    private BigDecimal unmatchedAmount;
    /** 收款方式(自由文本) */
    private String paymentMethod;
    /** 收款账户(自由文本) */
    private String receiveAccount;
    /** 资金账户ID；receiveAccount 继续保留当时名称快照 */
    private Long cashAccountId;
    /** 付款方 */
    private String payerName;
    /** 付款方电话(可空) */
    private String payerPhone;
    /** 关联客户ID(crm_customer.id,可空) */
    private Long customerId;
    /** 客户名称快照(可空) */
    private String customerName;
    /** 摘要 */
    private String summary;
    /** 银行流水号 */
    private String bankSerialNo;
    /** 凭证附件 JSON 数组:[{fileId,fileName}] */
    private String voucherFile;
    /** 状态:waiting/partial/matched/reviewed/void */
    private String status;
    /** 记录状态:active/void */
    private String recordStatus;
    /** 核销状态:waiting/partial/matched */
    private String matchStatus;
    /** 审核状态:draft/pending/approved/rejected/reversed */
    private String reviewStatus;
    /** 异常状态:none/pending/processing/resolved */
    private String exceptionStatus;
    /** 资金性质:business/prepayment/deposit/intercompany/refund_return/unknown/other */
    private String fundNature;
    /** 当前处理负责人 */
    private Long ownerId;
    /** 当前处理负责人姓名快照 */
    private String ownerName;
    /** 当前处理负责人部门 */
    private Long ownerDeptId;
    /** 来源:manual/paste/excel/csv/bank/receivable */
    private String sourceType;
    /** 提交审核人 */
    private Long submittedBy;
    /** 提交审核时间 */
    private LocalDateTime submittedAt;
    /** 备注 */
    private String remark;
    /** 导入批次号(手动录入为空,批量导入时盖章,关联 fin_cash_import_batch.batch_no) */
    private String importBatchNo;
    /** 审核人用户ID */
    private Long reviewedBy;
    /** 审核时间 */
    private LocalDateTime reviewedAt;
    /** 审核/驳回意见 */
    private String reviewRemark;
    /** 反审核人 */
    private Long reverseReviewBy;
    /** 反审核时间 */
    private LocalDateTime reverseReviewAt;
    /** 反审核原因 */
    private String reverseReviewReason;
    /** 乐观锁版本 */
    @Version
    private Integer version;
}
