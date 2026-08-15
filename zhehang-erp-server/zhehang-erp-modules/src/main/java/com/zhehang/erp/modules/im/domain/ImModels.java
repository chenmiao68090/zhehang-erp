package com.zhehang.erp.modules.im.domain;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/** IM 接口请求和返回模型；只暴露工作沟通所需字段，不暴露员工敏感资料。 */
public final class ImModels {
    private ImModels() {}

    @Data
    public static class CreateDirectRequest {
        @NotNull
        private Long userId;
    }

    @Data
    public static class CreateGroupRequest {
        @NotBlank
        private String name;
        private List<Long> memberIds = new ArrayList<>();
    }

    @Data
    public static class AddMembersRequest {
        private List<Long> userIds = new ArrayList<>();
    }

    @Data
    public static class SendMessageRequest {
        @NotBlank
        private String clientMessageId;
        private String messageType = "text";
        private String text;
        private Long replyToMessageId;
        private List<Long> mentionedUserIds = new ArrayList<>();
        private Boolean mentionAll = false;
        private List<Long> attachmentIds = new ArrayList<>();
        private Long forwardedMessageId;
    }

    @Data
    public static class EditMessageRequest {
        @NotBlank
        private String text;
    }

    @Data
    public static class ReadRequest {
        @NotNull
        private Long seq;
    }

    @Data
    public static class MemberSettingRequest {
        private Boolean pinned;
        private Boolean muted;
        private Boolean hidden;
        private Boolean manualUnread;
        private String notificationLevel;
        private String draft;
    }

    @Data
    public static class ReactionRequest {
        @NotBlank
        private String reactionCode;
    }

    @Data
    public static class PreferenceRequest {
        private Boolean browserNotification;
        private Boolean soundEnabled;
        private Boolean desktopEnabled;
    }

    @Data
    public static class CreateTaskRequest {
        @NotBlank
        private String title;
        @NotNull
        private List<Long> responsibleIds = new ArrayList<>();
        private List<Long> collaboratorIds = new ArrayList<>();
        private Long deptId;
        private String priority = "normal";
        @NotNull
        private LocalDateTime deadlineAt;
        private List<String> reminderRules = new ArrayList<>();
        private Long customerId;
        private String businessType;
        private Long businessId;
        @NotBlank
        private String acceptanceStandard;
    }

    @Data
    public static class TaskActionRequest {
        private String result;
        private String comment;
        private String reason;
        private Boolean pass;
        private List<Long> attachmentIds = new ArrayList<>();
    }

    @Data
    public static class BusinessNotification {
        @NotBlank
        private String eventId;
        @NotBlank
        private String eventType;
        @NotBlank
        private String title;
        @NotBlank
        private String text;
        private Long conversationId;
        private List<Long> recipientIds = new ArrayList<>();
        private String businessType;
        private Long businessId;
        private String currentStatus;
        private Long responsibleId;
        private Long operatorId;
        private LocalDateTime occurredAt;
        private String requirement;
        private String actionLabel;
        private String actionUrl;
        private Boolean important = false;
    }

    @Data
    public static class Contact {
        private Long userId;
        private String name;
        private String avatar;
        private String empCode;
        private Long deptId;
        private String deptName;
        private LocalDateTime lastActiveAt;
        private boolean online;
        private String memberRole;
    }

    @Data
    public static class Conversation {
        private Long id;
        private String type;
        private String name;
        private String avatarUrl;
        private Long ownerId;
        private String businessType;
        private Long businessId;
        private Long lastSeq;
        private Long lastReadSeq;
        private Long manualUnreadSeq;
        private Long lastMessageId;
        private LocalDateTime lastMessageAt;
        private LocalDateTime sortTime;
        private String lastMessageText;
        private String lastMessageType;
        private String lastSenderName;
        private int unreadCount;
        private int mentionCount;
        private int importantCount;
        private int memberCount;
        private boolean pinned;
        private boolean muted;
        private boolean hidden;
        private String notificationLevel;
        private String draft;
        private String memberRole;
        private Long peerUserId;
        private LocalDateTime peerLastActiveAt;
        private boolean peerOnline;
        private boolean canMentionAll;
        private boolean canLeave;
    }

    @Data
    public static class Attachment {
        private Long id;
        private Long messageId;
        private String originalName;
        private String mimeType;
        private Long fileSize;
        private boolean image;
        private String previewUrl;
        private String downloadUrl;
        private String thumbnailUrl;
        private LocalDateTime createdAt;
    }

    @Data
    public static class Mention {
        private Long userId;
        private String name;
        private String type;
        private boolean read;
    }

    @Data
    public static class ReactionGroup {
        private String code;
        private int count;
        private boolean reactedByMe;
        private List<String> userNames = new ArrayList<>();
    }

    @Data
    public static class MessageSnippet {
        private Long id;
        private Long senderId;
        private String senderName;
        private String text;
        private String status;
    }

    @Data
    public static class ForwardSource {
        private Long messageId;
        private Long conversationId;
        private Long senderId;
        private String senderName;
        private String conversationName;
    }

    @Data
    public static class Message {
        private Long id;
        private Long conversationId;
        private String clientMessageId;
        private Long seq;
        private Long senderId;
        private String senderName;
        private String senderAvatar;
        private String messageType;
        private String text;
        private String status;
        private boolean important;
        private boolean edited;
        private boolean recalled;
        private LocalDateTime createdAt;
        private boolean mine;
        private boolean favorite;
        private MessageSnippet replyTo;
        private ForwardSource forwardedFrom;
        private List<Attachment> attachments = new ArrayList<>();
        private List<Mention> mentions = new ArrayList<>();
        private List<ReactionGroup> reactions = new ArrayList<>();
        private int readCount;
        private int deliveredCount;
        private int unreadCount;
        private WorkTask task;
        private BusinessCard business;
    }

    @Data
    public static class BusinessCard {
        private String eventId;
        private String eventType;
        private String title;
        private String businessType;
        private Long businessId;
        private String currentStatus;
        private Long responsibleId;
        private String responsibleName;
        private Long operatorId;
        private String operatorName;
        private LocalDateTime occurredAt;
        private String requirement;
        private String actionLabel;
        private String actionUrl;
    }

    @Data
    public static class TaskParticipant {
        private Long taskId;
        private Long userId;
        private String name;
        private String avatar;
        private Long deptId;
        private String deptName;
        private String role;
        private String status;
    }

    @Data
    public static class TaskTimeline {
        private Long id;
        private Long operatorId;
        private String operatorName;
        private String actionType;
        private String fromState;
        private String toState;
        private String comment;
        private LocalDateTime createdAt;
    }

    @Data
    public static class WorkTask {
        private Long taskId;
        private Long conversationId;
        private Long sourceMessageId;
        private Long cardMessageId;
        private String title;
        private String workflowState;
        private String status;
        private boolean overdue;
        private String priority;
        private Long deptId;
        private String deptName;
        private LocalDateTime deadlineAt;
        private String acceptanceStandard;
        private String reminderConfigJson;
        private List<String> reminderRules = new ArrayList<>();
        private Long customerId;
        private String businessType;
        private Long businessId;
        private Long creatorId;
        private String creatorName;
        private Long reviewerId;
        private String reviewerName;
        private String resultText;
        private String rejectReason;
        private LocalDateTime acceptedAt;
        private LocalDateTime submittedAt;
        private LocalDateTime completedAt;
        private LocalDateTime cancelledAt;
        private LocalDateTime overdueAt;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private List<TaskParticipant> participants = new ArrayList<>();
        private List<Attachment> resultAttachments = new ArrayList<>();
        private List<TaskTimeline> timeline = new ArrayList<>();
        private boolean canAccept;
        private boolean canSubmit;
        private boolean canReview;
        private boolean canCancel;
    }

    @Data
    public static class TaskStats {
        private long pendingAccept;
        private long inProgress;
        private long pendingReview;
        private long completed;
        private long rejected;
        private long overdue;
    }

    @Data
    public static class CursorPage<T> {
        private List<T> items = new ArrayList<>();
        private String nextCursor;
        private boolean hasMore;
    }

    @Data
    public static class UnreadSummary {
        private int badgeCount;
        private int totalUnread;
        private int mentionUnread;
        private int unreadConversations;
    }

    @Data
    public static class ReadReceipt {
        private Long messageId;
        private Long seq;
        private int readCount;
        private int unreadCount;
        private List<Contact> readUsers = new ArrayList<>();
        private List<Contact> unreadUsers = new ArrayList<>();
    }
}
