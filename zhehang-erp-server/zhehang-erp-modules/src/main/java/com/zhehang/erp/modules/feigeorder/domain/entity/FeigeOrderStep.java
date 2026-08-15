package com.zhehang.erp.modules.feigeorder.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("feige_order_step")
public class FeigeOrderStep extends BaseEntity {
    private Long orderId;
    private Integer stepNo;
    private String stepName;
    private String status;
    private Long assigneeId;
    private String assigneeName;
    private LocalDateTime completedTime;
    private String remark;
}
