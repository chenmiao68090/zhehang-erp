package com.zhehang.erp.modules.crm.domain.dto;

import jakarta.validation.Valid;
import lombok.Data;

@Data
public class SalesAiManagementRequest {
    @Valid
    private SalesConsoleQuery query = new SalesConsoleQuery();
}
