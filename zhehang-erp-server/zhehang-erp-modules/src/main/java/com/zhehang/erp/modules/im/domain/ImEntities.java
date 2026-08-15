package com.zhehang.erp.modules.im.domain;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/** 第一阶段 IM 持久化实体，字段与 V147 一一对应。 */
public final class ImEntities {
    private ImEntities() {}

    @Data
    @TableName("im_conversation")
    public static class Conversation {
        @TableId(type = IdType.AUTO)
        private Long id;
        private Long tenantId;
        private Long companyId;
        private String type;
        private String name;
        private String avatarUrl;
        private Long ownerId;
        private String directKey;
        private String businessType;
        private Long businessId;
        private Long lastMessageId;
        private Long lastSeq;
        private LocalDateTime lastMessageAt;
        private String status;
        private Long createdBy;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data
    @TableName("im_conversation_member")
    public static class Member {
        @TableId(type = IdType.AUTO)
        private Long id;
        private Long tenantId;
        private Long companyId;
        private Long conversationId;
        private Long userId;
        private String memberRole;
        private Long joinSeq;
        private Long lastReadSeq;
        private Long manualUnreadSeq;
        private Long lastDeliveredSeq;
        private Boolean isPinned;
        private LocalDateTime pinnedAt;
        private Boolean isMuted;
        private String notificationLevel;
        private Boolean isHidden;
        private LocalDateTime hiddenAt;
        private String draftJson;
        private LocalDateTime joinedAt;
        private LocalDateTime leftAt;
        private String status;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data
    @TableName("im_message")
    public static class Message {
        @TableId(type = IdType.AUTO)
        private Long id;
        private Long tenantId;
        private Long companyId;
        private Long conversationId;
        private String clientMessageId;
        private Long seq;
        private Long senderId;
        private String messageType;
        private String contentJson;
        private String searchText;
        private Long replyToMessageId;
        private Long rootMessageId;
        private Boolean isImportant;
        private String status;
        private LocalDateTime editedAt;
        private LocalDateTime recalledAt;
        private Long recalledBy;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data
    @TableName("im_message_attachment")
    public static class Attachment {
        @TableId(type = IdType.AUTO)
        private Long id;
        private Long tenantId;
        private Long companyId;
        private Long conversationId;
        private Long messageId;
        private Long taskId;
        private Long uploaderId;
        private String storageKey;
        private String originalName;
        private String mimeType;
        private Long fileSize;
        private String thumbnailKey;
        private String uploadStatus;
        private String scanStatus;
        private LocalDateTime createdAt;
    }

    @Data
    @TableName("im_message_mention")
    public static class Mention {
        @TableId(type = IdType.AUTO)
        private Long id;
        private Long tenantId;
        private Long companyId;
        private Long conversationId;
        private Long messageId;
        private Long mentionedUserId;
        private String mentionType;
        private LocalDateTime readAt;
        private LocalDateTime createdAt;
    }

    @Data
    @TableName("im_message_reaction")
    public static class Reaction {
        @TableId(type = IdType.AUTO)
        private Long id;
        private Long tenantId;
        private Long companyId;
        private Long messageId;
        private Long userId;
        private String reactionCode;
        private LocalDateTime createdAt;
    }

    @Data
    @TableName("im_message_favorite")
    public static class Favorite {
        @TableId(type = IdType.AUTO)
        private Long id;
        private Long tenantId;
        private Long companyId;
        private Long userId;
        private Long messageId;
        private String remark;
        private LocalDateTime createdAt;
    }

    @Data
    @TableName("im_message_history")
    public static class History {
        @TableId(type = IdType.AUTO)
        private Long id;
        private Long tenantId;
        private Long companyId;
        private Long conversationId;
        private Long messageId;
        private Long operatorId;
        private String actionType;
        private String contentJson;
        private LocalDateTime createdAt;
    }

    @Data
    @TableName("im_audit_log")
    public static class AuditLog {
        @TableId(type = IdType.AUTO)
        private Long id;
        private Long tenantId;
        private Long companyId;
        private Long operatorId;
        private String actionType;
        private Long conversationId;
        private Long messageId;
        private String reason;
        private String ipAddress;
        private String userAgent;
        private LocalDateTime createdAt;
    }

    @Data
    @TableName("im_user_preference")
    public static class Preference {
        @TableId(type = IdType.AUTO)
        private Long id;
        private Long tenantId;
        private Long companyId;
        private Long userId;
        private Boolean browserNotification;
        private Boolean soundEnabled;
        private Boolean desktopEnabled;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data
    @TableName("im_task_detail")
    public static class TaskDetail {
        @TableId(type = IdType.AUTO)
        private Long id;
        private Long tenantId;
        private Long companyId;
        private Long taskId;
        private Long conversationId;
        private Long sourceMessageId;
        private Long cardMessageId;
        private String title;
        private String workflowState;
        private String priority;
        private Long deptId;
        private LocalDateTime deadlineAt;
        private String acceptanceStandard;
        private String reminderConfigJson;
        private Long customerId;
        private String businessType;
        private Long businessId;
        private Long creatorId;
        private Long reviewerId;
        private String resultText;
        private String rejectReason;
        private LocalDateTime acceptedAt;
        private LocalDateTime submittedAt;
        private LocalDateTime completedAt;
        private LocalDateTime cancelledAt;
        private LocalDateTime overdueAt;
        private Integer version;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data
    @TableName("im_task_participant")
    public static class TaskParticipant {
        @TableId(type = IdType.AUTO)
        private Long id;
        private Long tenantId;
        private Long companyId;
        private Long taskId;
        private Long userId;
        private String participantRole;
        private String participantStatus;
        private LocalDateTime acceptedAt;
        private LocalDateTime completedAt;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data
    @TableName("im_task_timeline")
    public static class TaskTimeline {
        @TableId(type = IdType.AUTO)
        private Long id;
        private Long tenantId;
        private Long companyId;
        private Long taskId;
        private Long operatorId;
        private String actionType;
        private String fromState;
        private String toState;
        private String comment;
        private String snapshotJson;
        private LocalDateTime createdAt;
    }

    @Data
    @TableName("im_task_reminder")
    public static class TaskReminder {
        @TableId(type = IdType.AUTO)
        private Long id;
        private Long tenantId;
        private Long companyId;
        private Long taskId;
        private Long recipientId;
        private String reminderType;
        private LocalDateTime scheduledAt;
        private String eventId;
        private String status;
        private LocalDateTime queuedAt;
        private LocalDateTime sentAt;
        private String lastError;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data
    @TableName("im_task_attachment")
    public static class TaskAttachment {
        @TableId(type = IdType.AUTO)
        private Long id;
        private Long tenantId;
        private Long companyId;
        private Long taskId;
        private Long attachmentId;
        private Long uploaderId;
        private String attachmentRole;
        private LocalDateTime createdAt;
    }

    @Data
    @TableName("im_task_message_link")
    public static class TaskMessageLink {
        @TableId(type = IdType.AUTO)
        private Long id;
        private Long tenantId;
        private Long companyId;
        private Long messageId;
        private Long taskId;
        private LocalDateTime createdAt;
    }

    @Data
    @TableName("im_message_business_ref")
    public static class BusinessRef {
        @TableId(type = IdType.AUTO)
        private Long id;
        private Long tenantId;
        private Long companyId;
        private Long messageId;
        private String businessType;
        private Long businessId;
        private String displaySnapshot;
        private LocalDateTime createdAt;
    }

    @Data
    @TableName("im_notification_outbox")
    public static class NotificationOutbox {
        @TableId(type = IdType.AUTO)
        private Long id;
        private Long tenantId;
        private Long companyId;
        private String eventId;
        private String eventType;
        private String payloadJson;
        private String status;
        private Integer retryCount;
        private LocalDateTime nextRetryAt;
        private String lastError;
        private LocalDateTime processedAt;
        private Long resultMessageId;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
}
