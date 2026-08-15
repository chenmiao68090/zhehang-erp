package com.zhehang.erp.modules.crm.domain.vo;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

/** 公司资源导入确认结果。 */
@Data
public class CrmLeadImportResultVO {
    private CrmLeadImportSummaryVO summary = new CrmLeadImportSummaryVO();
    private List<CrmLeadImportRowVO> rows = new ArrayList<>();
}
