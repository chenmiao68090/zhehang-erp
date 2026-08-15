package com.zhehang.erp.modules.dashboard.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("daily_report")
public class DailyReport extends BaseEntity {
    private LocalDate reportDate;
    private String todayWork;
    private String tomorrowPlan;
    private Long userId;
    /** 抄送人 userId 列表,逗号分隔 */
    private String ccUserIds;
}
