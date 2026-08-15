package com.zhehang.erp.modules.system.domain.vo;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ImpersonationSessionVO {
    private boolean active;
    private String impersonationToken;
    private String sessionId;
    private Long actorUserId;
    private String actorName;
    private Long targetUserId;
    private String targetName;
    private Long targetDeptId;
    private String targetDeptName;
    private List<String> roleNames;
    private boolean multipleRoles;
    private String reason;
    private String tabId;
    private LocalDateTime startTime;
    private LocalDateTime expireTime;
}
