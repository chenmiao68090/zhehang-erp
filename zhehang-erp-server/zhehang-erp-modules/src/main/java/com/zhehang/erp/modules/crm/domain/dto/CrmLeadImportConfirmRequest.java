package com.zhehang.erp.modules.crm.domain.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;

/** 公司资源导入确认请求；业务配置和行必须与预检完全一致。 */
@Data
@EqualsAndHashCode(callSuper = true)
public class CrmLeadImportConfirmRequest extends CrmLeadImportRequest {
    private String previewToken;
}
