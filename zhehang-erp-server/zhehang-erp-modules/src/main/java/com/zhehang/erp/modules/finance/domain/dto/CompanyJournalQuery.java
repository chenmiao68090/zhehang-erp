package com.zhehang.erp.modules.finance.domain.dto;

import lombok.Data;

import java.time.LocalDate;

/**
 * 收款登记 / 公司日记账列表查询条件。
 */
@Data
public class CompanyJournalQuery {
    /** 关键字(公司名称/自动编号/法人/对接人/流水号) */
    private String keyword;
    /** 收款日期起 */
    private LocalDate receiptDateStart;
    /** 收款日期止 */
    private LocalDate receiptDateEnd;
    /** 归属部门 */
    private String belongDept;
    /** 订单状态 */
    private String orderStatus;
    /** 新签/续费 */
    private String signType;
    /** 到款类型 */
    private String receiptType;
    /** 收款账号 */
    private String receiveAccount;

    /** 页码,默认1 */
    private Integer pageNum;
    /** 每页条数,默认20,上限200 */
    private Integer pageSize;
}
