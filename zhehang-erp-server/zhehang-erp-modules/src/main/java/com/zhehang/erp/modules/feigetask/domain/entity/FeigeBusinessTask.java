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
@TableName("feige_task_business")
public class FeigeBusinessTask extends BaseEntity {
    private Long bridgeRunId;
    private String requestKey;
    private String requestFingerprint;
    private Long orderId;
    private String orderNo;
    private String companyName;
    private String businessType;
    private String priority;
    private String taskStatus;
    private String managerReviewStatus;
    private Long managerReviewerId;
    private String managerReviewerName;
    private LocalDateTime managerReviewTime;
    private String managerReviewRemark;
    private String assignType;
    private Long ownerId;
    private String ownerName;
    private Long deptId;
    private Long receivedBy;
    private String receivedByName;
    private LocalDateTime receivedTime;
    private String costCategory;
    private BigDecimal costAmount;
    private BigDecimal orderAmount;
    private BigDecimal receivedAmount;
    private LocalDateTime deadline;
    private Long handoverBy;
    private String handoverByName;
    private LocalDateTime handoverTime;
    private String handoverStatus;
    private Long handoverToId;
    private String handoverToName;
    private Long businessOwnerId;
    private String businessOwnerName;
    private LocalDateTime completedTime;
    private String exceptionReason;
    private String remarks;
    @Version
    private Integer version;
}
