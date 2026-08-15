package com.zhehang.erp.modules.dashboard.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("dashboard_memo")
public class DashboardMemo extends BaseEntity {
    private Long userId;
    private String content;
    private LocalDateTime remindTime;
    /** 优先级:1低 2普通 3重要 */
    private Integer priority;
    private String category;
    private Boolean completed;
    private LocalDateTime completedTime;
    private String remark;
}
