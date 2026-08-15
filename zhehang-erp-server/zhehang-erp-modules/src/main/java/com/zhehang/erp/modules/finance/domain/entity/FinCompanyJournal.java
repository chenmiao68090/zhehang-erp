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
 * 收款登记 / 公司日记账。
 * 对齐飞书多维表格「公司日记账(2026年度)」的 59 个字段:
 * 一行 = 一家公司的一笔业务(客户信息 + 合同业绩 + 收款 + 供应商支出)。
 * 独立于 {@link FinCashJournal}(收款核销工作台),互不影响。
 * 多选列用英文逗号连接的文本存储;附件列用 JSON 数组字符串存储 [{fileId,fileName}]。
 * profit_* / remainingAmount / contractEndDate / receiptTime / codeNo 为公式列,由服务端计算写入。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("fin_company_journal")
public class FinCompanyJournal extends BaseEntity {

    /** 自动编号(系统生成,唯一) */
    private String autoNo;

    // 一、客户基础信息
    /** 公司名称(必填) */
    private String companyName;
    /** 公司地址 */
    private String companyAddress;
    /** 法人姓名 */
    private String legalName;
    /** 法人手机号码 */
    private String legalPhone;
    /** 法人身份证号码 */
    private String legalIdCard;

    // 二、归属与合同/业绩
    /** 归属部门(单选) */
    private String belongDept;
    /** 合同签署人(单选) */
    private String contractSigner;
    /** 业绩归属年份(单选) */
    private String perfYear;
    /** 业绩所属月份(单选) */
    private String perfMonth;
    /** 合作业务(一级科目,多选,逗号分隔) */
    private String bizCategory1;
    /** 合作业务(二级科目,多选,逗号分隔) */
    private String bizCategory2;
    /** 合同总金额 */
    private BigDecimal contractAmount;
    /** 代理记账收费 */
    private BigDecimal feeAgency;
    /** 挂靠地址收费 */
    private BigDecimal feeAddress;
    /** 工商业务收费 */
    private BigDecimal feeBusiness;
    /** 增值业务收费 */
    private BigDecimal feeValueAdded;
    /** 地址毛利(公式) */
    private BigDecimal profitAddress;
    /** 增值业务毛利(公式) */
    private BigDecimal profitValueAdded;
    /** 总毛利(公式) */
    private BigDecimal profitTotal;
    /** 客户来源(单选) */
    private String customerSource;
    /** 新签/续费(单选) */
    private String signType;
    /** 订单状态(单选) */
    private String orderStatus;
    /** 服务开始日期 */
    private LocalDate serviceStartDate;
    /** 付款周期(单选) */
    private String paymentCycle;
    /** 赠送月份(多选,逗号分隔) */
    private String giftMonths;
    /** 合同到期日期(公式) */
    private LocalDate contractEndDate;
    /** 合同备注 */
    private String contractRemark;

    // 三、收款信息
    /** 收款账号(单选) */
    private String receiveAccount;
    /** 收款流水单号 */
    private String bankSerialNo;
    /** 收款时间(公式:由收款日期派生) */
    private LocalDateTime receiptTime;
    /** 收款日期 */
    private LocalDate receiptDate;
    /** 本次到款金额 */
    private BigDecimal receivedAmount;
    /** 剩余尾款(公式) */
    private BigDecimal remainingAmount;
    /** 到款类型(单选) */
    private String receiptType;
    /** 收款凭证(JSON数组:[{fileId,fileName}]) */
    private String voucherFile;
    /** 发票 */
    private String invoice;
    /** (收款)企业名称-客户/同行 */
    private String receiptCompanyName;
    /** (收款)对接人-客户/同行 */
    private String receiptContactName;
    /** (收款)对接人联系方式 */
    private String receiptContactPhone;
    /** 全款到齐(财务确认):0否1是 */
    private Integer fullPaidConfirmed;
    /** 编号代码(公式:业务编码) */
    private String codeNo;

    // 四、供应商与支出
    /** 供应商公司 */
    private String supplierCompany;
    /** 供应商对接人 */
    private String supplierContact;
    /** 地址方收款码(JSON数组附件) */
    private String addressQrFile;
    /** 供应商发票(JSON数组附件) */
    private String supplierInvoiceFile;
    /** 支出账户(多选,逗号分隔) */
    private String expenseAccount;
    /** 是否已支出(多选,逗号分隔) */
    private String expensePaidStatus;
    /** 地址支出金额 */
    private BigDecimal expenseAddressAmount;
    /** 支出日期 */
    private LocalDate expenseDate;
    /** 支出打款截图(JSON数组附件) */
    private String expensePayFile;
    /** 增值业务成本支出(多选,逗号分隔) */
    private String valueAddedCost;
    /** 增值业务支出金额 */
    private BigDecimal valueAddedExpenseAmount;
    /** 增值业务支出日期 */
    private LocalDate valueAddedExpenseDate;
    /** 支出登记备注 */
    private String expenseRemark;
    /** 二次支出金额 */
    private BigDecimal secondExpenseAmount;
    /** 二次支出日期 */
    private LocalDate secondExpenseDate;
    /** 二次支出打款截图(JSON数组附件) */
    private String secondExpenseFile;

    // 五、关联
    /** 父记录(fin_company_journal.id) */
    private Long parentId;

    /** 备注 */
    private String remark;

    /** 乐观锁版本 */
    @Version
    private Integer version;
}
