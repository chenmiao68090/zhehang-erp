package com.zhehang.erp.modules.crm.domain.vo;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
public class SalesAiDraftVO {
    private String draftId;
    private boolean available;
    private String message;
    private String provider;
    private String promptVersion;
    private LocalDateTime generatedAt;
    private LocalDateTime dataTime;
    private String transcriptionStatus;
    private String transcriptionExcerpt;
    private String summary;
    private String demand;
    private String budget;
    private String decisionMaker;
    private List<String> objections = new ArrayList<>();
    private List<String> commitments = new ArrayList<>();
    private String intentLevel;
    private String intentReason;
    private int confidence;
    private String nextActionType;
    private LocalDateTime nextActionTime;
    private String nextActionContent;
    private List<String> recommendedMaterials = new ArrayList<>();
    private String callbackScript;
    private List<String> riskSignals = new ArrayList<>();
    private List<SalesAiCitationVO> citations = new ArrayList<>();
}
