package com.zhehang.erp.modules.admin.domain;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 行政管理-人事行政支出明细登记。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("admin_hr_expense")
public class AdminHrExpense extends BaseEntity {
    private String expenseNo;
    private LocalDate expenseDate;
    private Long deptId;
    private String deptName;
    private String category;
    private String content;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private String payMethod;
    private String status;
    private String attach;
    private String remark;
    private String invoiceType;
    private String invoiceTitle;
    private BigDecimal invoiceAmount;
    private String invoiceAttach;
}
