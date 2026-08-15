package com.zhehang.erp.modules.crm.domain.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 电销通话小结。保存后同时形成通话记录、CRM 跟进和下一步待办。
 */
@Data
public class CallSummaryDTO {

    private Long leadId;
    private String customerName;
    private String phone;
    private String platformCallId;
    private Integer duration;
    private Integer connected;
    private String result;
    private String remark;
    private String intentLevel;
    private String needType;
    private String quoteStatus;
    private String followStatus;
    private String customerLevel;
    private String nextActionType;
    private String nextActionContent;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime nextActionTime;
}
