package com.zhehang.erp.modules.system.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@TableName("sys_impersonation_session")
public class SysImpersonationSession implements Serializable {
    private static final long serialVersionUID = 1L;

    @TableId(value = "session_id", type = IdType.INPUT)
    private String sessionId;
    private Long tenantId;
    private Long actorUserId;
    private String actorUsername;
    private Long effectiveUserId;
    private String effectiveUsername;
    private Long effectiveDeptId;
    private String effectiveDeptName;
    private String effectiveRoleNames;
    private Integer effectiveRoleCount;
    private String reason;
    private LocalDateTime startTime;
    private LocalDateTime expireTime;
    private LocalDateTime endTime;
    private String status;
    private String endReason;
    private String ipAddr;
    private String userAgent;
    private String deviceInfo;
    private String tabId;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
