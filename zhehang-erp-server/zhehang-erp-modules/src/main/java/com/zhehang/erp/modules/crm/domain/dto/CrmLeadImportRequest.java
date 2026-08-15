package com.zhehang.erp.modules.crm.domain.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

/** 公司资源导入预检请求。 */
@Data
public class CrmLeadImportRequest {
    /** 兼容既有1..6并扩展到10类的来源大类，见 CrmLeadSource。兼容旧调用方字段 source。 */
    @JsonAlias("source")
    private Integer sourceType;
    private String sourcePlatform;
    private String sourceDetail;
    /** 本批次业务名称，落 crm_lead.channel；受现有列宽限制最多32字符。 */
    private String batchName;
    /** 为空表示公司公海；非空必须是当前租户启用中的公海池。 */
    private Long poolId;

    @Valid
    @Size(max = 100000, message = "单次导入不能超过100000行")
    private List<CrmLeadImportRowDTO> rows = new ArrayList<>();
}
