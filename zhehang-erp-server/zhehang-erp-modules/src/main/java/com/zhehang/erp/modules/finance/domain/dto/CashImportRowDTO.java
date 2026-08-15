package com.zhehang.erp.modules.finance.domain.dto;

import lombok.Data;

/**
 * 收款批量导入·单行原始输入(前端粘贴或 Excel/CSV 解析后的一行,全部为字符串原始值)。
 * 后端负责归一化(日期/金额)、逐字段校验、查重与匹配,不信任前端已解析的语义。
 */
@Data
public class CashImportRowDTO {
    /** 行号(前端 1-based,便于回显定位;可空) */
    private String rowNo;
    /** 收款日期(原始:2026-07-10 / 2026/7/10 / 2026.7.10) */
    private String receiptDate;
    /** 收款时间(原始:HH:mm 或 HH:mm:ss,可空) */
    private String receiptTime;
    /** 收款金额(原始:1000 / 1,000.00 / ￥1000) */
    private String amount;
    /** 收款方式 */
    private String paymentMethod;
    /** 收款账户 */
    private String receiveAccount;
    /** 付款方 */
    private String payerName;
    /** 付款方电话 */
    private String payerPhone;
    /** 客户名称(用于匹配 crm_customer) */
    private String customerName;
    /** 业务类型(自由文本,原样落库到摘要辅助;不强校验) */
    private String bizType;
    /** 销售姓名(用于匹配 org_employee) */
    private String salesName;
    /** 摘要 */
    private String summary;
    /** 银行流水号(查重主键) */
    private String bankSerialNo;
    /** 报单单号(BK-/AD-/GS-/SL- 前缀+id,用于匹配 4 张报单) */
    private String orderNo;
    /** 备注 */
    private String remark;
}
