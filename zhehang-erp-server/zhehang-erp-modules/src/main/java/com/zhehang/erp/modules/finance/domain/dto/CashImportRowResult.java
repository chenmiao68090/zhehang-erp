package com.zhehang.erp.modules.finance.domain.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * 收款批量导入·单行预览结果。
 * 携带归一化后的值 + 校验/查重/匹配结论,供前端逐行标红、人工确认后回传提交。
 */
@Data
public class CashImportRowResult {
    /** 行号(回显定位) */
    private Integer rowNo;

    // ---- 归一化后的字段(可回传提交) ----
    /** 收款日期(归一化 yyyy-MM-dd,解析失败为 null) */
    private String receiptDate;
    /** 收款时间(HH:mm[:ss],可空) */
    private String receiptTime;
    /** 收款金额(数值,解析失败为 null) */
    private BigDecimal amount;
    private String paymentMethod;
    private String receiveAccount;
    private String payerName;
    private String payerPhone;
    private String customerName;
    private String bizType;
    private String salesName;
    private String summary;
    private String bankSerialNo;
    private String orderNo;
    private String remark;

    // ---- 校验结论 ----
    /** 是否可导入(硬校验全部通过) */
    private boolean valid;
    /** 字段级中文错误(硬校验,拦截导入) */
    private List<String> errors = new ArrayList<>();
    /** 提示(软校验,不拦截,如付款方为空) */
    private List<String> warnings = new ArrayList<>();

    // ---- 查重结论 ----
    /** normal正常 / suspect疑似 / duplicate重复 */
    private String dupStatus = "normal";
    /** 查重命中原因(中文) */
    private String dupReason;

    // ---- 匹配结论(仅提示,不拦截、不自动核销) ----
    /** 匹配到的客户ID(命中 crm_customer) */
    private Long customerId;
    /** 客户是否匹配成功 */
    private boolean customerMatched;
    /** 销售是否匹配成功(命中 org_employee) */
    private boolean salesMatched;
    /** 报单是否匹配成功(命中且金额对得上) */
    private boolean orderMatched;
    /** 匹配到的报单信息 {orderNo,bizType,bizTypeLabel,customerName,receivableAmount,amountMatched} */
    private Map<String, Object> matchedOrder;

    public void addError(String e) {
        this.errors.add(e);
    }

    public void addWarning(String w) {
        this.warnings.add(w);
    }
}
