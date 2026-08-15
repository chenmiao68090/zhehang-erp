package com.zhehang.erp.modules.feigetask.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.Version;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("feige_task_workflow_report")
public class FeigeWorkflowReport extends BaseEntity {
    private Long userId;
    private String userName;
    private Long deptId;
    private String cycleType;
    private String periodKey;
    private Integer totalCount;
    private Integer doneCount;
    private BigDecimal completionRate;
    private String summary;
    private String undoneDetailsJson;
    private LocalDateTime submittedAt;
    @Version
    private Integer version;
}
