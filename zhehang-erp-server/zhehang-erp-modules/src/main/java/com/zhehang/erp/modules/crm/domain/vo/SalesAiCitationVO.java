package com.zhehang.erp.modules.crm.domain.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SalesAiCitationVO {
    private String type;
    private Long id;
    private String label;
    private LocalDateTime occurredAt;
    private String route;
}
