package com.zhehang.erp.modules.finance.domain.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 收款中心-流水认领请求:生成收款登记(fin_company_journal)草稿。
 */
@Data
public class PayTxnClaimDTO {
    /** 客户公司名称(收款登记唯一必填项) */
    @NotBlank(message = "客户公司名称不能为空")
    private String companyName;

    /** 合同总金额(不填默认等于本次到款,剩余尾款=0) */
    private BigDecimal contractAmount;

    /** 归属部门(可选) */
    private String belongDept;

    /** 到款类型(可选,如:全款/首款/尾款) */
    private String receiptType;

    /** 备注(可选,写进登记的合作事项说明) */
    private String contractRemark;
}
