package com.zhehang.erp.modules.crm.domain.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/** 销售通话录音工作台响应，不包含云客原始录音地址。 */
public final class CallRecordingVO {

    private CallRecordingVO() {
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Row {
        private Long id;
        private LocalDateTime callTime;
        private Long userId;
        private String agentName;
        private Long deptId;
        private String deptName;
        private String customerName;
        private String contactName;
        private String maskedPhone;
        private String callType;
        private Integer connected;
        private String result;
        private Integer duration;
        private String durationText;
        private Boolean effective;
        private String remark;
        private String recordingStatus;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PageResult {
        private List<Row> records;
        private long total;
        private long pageNum;
        private long pageSize;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserOption {
        private Long id;
        private String name;
        private Long deptId;
        private String deptName;
        private Boolean currentUser;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DeptOption {
        private Long id;
        private Long parentId;
        private String name;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Options {
        private String scopeMode;
        private Boolean canSelectUser;
        private Boolean canSelectDepartment;
        private Long currentUserId;
        private List<UserOption> users;
        private List<DeptOption> departments;
    }

    /** token 字段会被现有操作日志自动脱敏。 */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PlaybackTicket {
        private String token;
        private long expiresAt;
    }
}
