package com.zhehang.erp.modules.feigesuite.domain.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.Map;

public final class FeigeSuiteRequests {
    private FeigeSuiteRequests() {
    }

    @Data
    public static class RecordUpsert {
        @NotBlank(message = "名称不能为空")
        @Size(max = 200, message = "名称不能超过200个字符")
        private String title;
        @Size(max = 64, message = "分类不能超过64个字符")
        private String categoryCode;
        @Size(max = 32, message = "状态不能超过32个字符")
        private String status;
        private Long ownerId;
        private BigDecimal amount;
        private LocalDate bizDate;
        private LocalDate dueDate;
        private Integer sortNo;
        private Integer version;
        private Map<String, Object> data = new LinkedHashMap<>();
    }

    @Data
    public static class RecordAction {
        @NotBlank(message = "操作不能为空")
        @Size(max = 32, message = "操作不能超过32个字符")
        private String action;
        @Size(max = 1000, message = "备注不能超过1000个字符")
        private String remark;
        private Integer version;
    }
}
