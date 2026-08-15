package com.zhehang.erp.modules.crm.domain.vo;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
public class SalesAiManagementInsightVO {
    private String insightId;
    private boolean available;
    private String message;
    private String provider;
    private String promptVersion;
    private LocalDateTime generatedAt;
    private String scopeLabel;
    private String dataRange;
    private String summary;
    private List<String> highlights = new ArrayList<>();
    private List<String> risks = new ArrayList<>();
    private List<String> coaching = new ArrayList<>();
    private List<String> commonObjections = new ArrayList<>();
    private String sourceQuality;
    private int confidence;
    private List<SalesAiCitationVO> citations = new ArrayList<>();
}
