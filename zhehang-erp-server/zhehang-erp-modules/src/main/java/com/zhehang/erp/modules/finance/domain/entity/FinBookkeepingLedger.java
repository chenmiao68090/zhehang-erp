package com.zhehang.erp.modules.finance.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

/**
 * 代账客户台账实体(会计体系·代理记账业务线)。
 * 记录给「客户」按账期做账/报税的进度,区别于公司自己的财务(FinCost 等)。
 * 对应前端 views/accounting/workspace.vue 中的「代账客户台账」。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("fin_bookkeeping_ledger")
public class FinBookkeepingLedger extends BaseEntity {
    /** 客户名(代账客户公司名) */
    private String clientName;
    /** 关联客户ID(可空,预留关联 crm 客户) */
    private Long clientId;
    /** 账期(yyyy-MM,如 2026-06) */
    private String period;
    /** 记账状态(0待记账/1记账中/2已完成) */
    private Integer bookkeepingStatus;
    /** 报税状态(0待申报/1已申报/2无需申报) */
    private Integer taxFilingStatus;
    /** 负责会计的用户ID(=org_employee.user_id) */
    private Long accountantId;
    /** 负责会计姓名(冗余回显) */
    private String accountantName;
    /** 本期费用(可空) */
    private BigDecimal amount;
    /** 备注 */
    private String remark;
}
