package com.zhehang.erp.modules.crm.domain.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SalesAiFeedbackRequest {
    @NotBlank
    @Size(max = 64)
    private String draftId;

    private Boolean useful;
    private Boolean adopted;

    @Pattern(regexp = "^(|FACT_ERROR|NOT_RELEVANT|TOO_GENERIC|MISSING_CONTEXT|OTHER)$")
    private String reasonCode;
}
