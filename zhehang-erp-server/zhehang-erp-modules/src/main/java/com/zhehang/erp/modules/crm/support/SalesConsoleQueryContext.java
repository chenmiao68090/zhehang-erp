package com.zhehang.erp.modules.crm.support;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class SalesConsoleQueryContext {
    private Long tenantId;
    private Long userId;
    private Long currentDeptId;
    private String scopeMode;
    private List<Long> deptIds;
    private Long ownerId;
    private Long deptId;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDateTime startTime;
    private LocalDateTime endTimeExclusive;
    private LocalDateTime now;
    private LocalDateTime todayStart;
    private LocalDateTime tomorrowStart;
    private LocalDate dueSoonDate;
}
