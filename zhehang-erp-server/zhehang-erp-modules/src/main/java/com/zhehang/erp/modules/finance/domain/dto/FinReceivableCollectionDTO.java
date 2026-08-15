package com.zhehang.erp.modules.finance.domain.dto;

import lombok.Data;

import java.time.LocalDateTime;

/** 回款续费催收记录入参。 */
@Data
public class FinReceivableCollectionDTO {
    private Long id;
    private String collectionStatus;
    private LocalDateTime nextCollectionTime;
    private Integer pausedService;
    private String content;
}
