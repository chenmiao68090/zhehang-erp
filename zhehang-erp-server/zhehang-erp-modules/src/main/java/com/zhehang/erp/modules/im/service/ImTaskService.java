package com.zhehang.erp.modules.im.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.im.domain.ImEntities;
import com.zhehang.erp.modules.im.domain.ImModels;
import com.zhehang.erp.modules.im.mapper.*;
import com.zhehang.erp.modules.im.realtime.ImEventPublisher;
import com.zhehang.erp.modules.task.domain.BizTask;
import com.zhehang.erp.modules.task.mapper.BizTaskMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.util.StringUtils;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.function.Consumer;
import java.util.stream.Collectors;

/** 消息转待办的状态机。biz_task 为兼容镜像，im_task_detail 为闭环真值。 */
@Service
@RequiredArgsConstructor
public class ImTaskService {
    private static final Set<String> PRIORITIES = Set.of("urgent", "important", "normal");
    private static final Set<String> STATES = Set.of(
            "all", "pending_accept", "in_progress", "pending_review", "completed", "rejected", "cancelled", "overdue");
    private static final Set<String> REMINDER_RULES = Set.of(
            "before_30m", "before_2h", "before_1d", "due", "overdue_1h");

    private final ImAccessService access;
    private final ImTaskAccessService taskAccess;
    private final ImMessagingService messagingService;
    private final ImMessageMapper messageMapper;
    private final ImConversationMapper conversationMapper;
    private final ImMemberMapper memberMapper;
    private final ImAttachmentMapper attachmentMapper;
    private final ImTaskDetailMapper detailMapper;
    private final ImTaskParticipantMapper participantMapper;
    private final ImTaskTimelineMapper timelineMapper;
    private final ImTaskReminderMapper reminderMapper;
    private final ImTaskAttachmentMapper taskAttachmentMapper;
    private final ImTaskMessageLinkMapper taskMessageLinkMapper;
    private final ImTaskQueryMapper taskQueryMapper;
    private final ImQueryMapper queryMapper;
    private final ImAuditMapper auditMapper;
    private final BizTaskMapper bizTaskMapper;
    private final ImEventPublisher eventPublisher;
    private final ObjectMapper objectMapper;

    @Transactional(rollbackFor = Exception.class)
    public ImModels.WorkTask createFromMessage(Long sourceMessageId, ImModels.CreateTaskRequest request) {
        ImEntities.Message source = messageMapper.selectById(sourceMessageId);
        if (source == null) throw new BusinessException("来源消息不存在");
        if ("recalled".equals(source.getStatus())) throw new BusinessException("撤回消息不能转为待办");
        if ("task".equals(source.getMessageType())) throw new BusinessException("待办卡片不能重复转为待办");
        ImEntities.Conversation conversation = access.requireConversation(source.getConversationId());

        String title = requiredText(request.getTitle(), "待办标题", 200);
        String acceptance = requiredText(request.getAcceptanceStandard(), "验收标准", 5000);
        LocalDateTime deadline = request.getDeadlineAt();
        if (deadline == null || !deadline.isAfter(LocalDateTime.now())) {
            throw new BusinessException("截止时间必须晚于当前时间");
        }
        if (deadline.isAfter(LocalDateTime.now().plusYears(5))) throw new BusinessException("截止时间不能超过5年");
        String priority = normalizePriority(request.getPriority());

        LinkedHashSet<Long> responsibleIds = normalizedIds(request.getResponsibleIds());
        LinkedHashSet<Long> collaboratorIds = normalizedIds(request.getCollaboratorIds());
        if (responsibleIds.isEmpty()) throw new BusinessException("至少选择一名责任人");
        if (responsibleIds.size() > 20 || collaboratorIds.size() > 50) throw new BusinessException("待办参与人数过多");
        collaboratorIds.removeAll(responsibleIds);
        LinkedHashSet<Long> allParticipantIds = new LinkedHashSet<>(responsibleIds);
        allParticipantIds.addAll(collaboratorIds);

        List<ImModels.Contact> contacts = access.requireActiveUsers(allParticipantIds);
        Set<Long> activeMembers = memberMapper.selectList(new LambdaQueryWrapper<ImEntities.Member>()
                        .select(ImEntities.Member::getUserId)
                        .eq(ImEntities.Member::getConversationId, conversation.getId())
                        .eq(ImEntities.Member::getStatus, "active"))
                .stream().map(ImEntities.Member::getUserId).collect(Collectors.toSet());
        if (!activeMembers.containsAll(allParticipantIds)) {
            throw new BusinessException("责任人和协同人必须是当前会话成员");
        }

        Map<Long, ImModels.Contact> contactMap = contacts.stream()
                .collect(Collectors.toMap(ImModels.Contact::getUserId, c -> c));
        Long primaryId = responsibleIds.iterator().next();
        ImModels.Contact primary = contactMap.get(primaryId);
        Long deptId = request.getDeptId() != null ? request.getDeptId() : (primary == null ? null : primary.getDeptId());
        if (deptId != null && deptId <= 0) throw new BusinessException("所属部门不正确");
        Set<Long> participantDeptIds = contacts.stream().map(ImModels.Contact::getDeptId)
                .filter(Objects::nonNull).collect(Collectors.toSet());
        if (deptId != null && !participantDeptIds.contains(deptId) && !taskAccess.isBoss()) {
            throw new BusinessException("所属部门必须来自责任人或协同人所在部门");
        }

        Map<String, Object> sourceContent = readContent(source);
        String businessType = request.getBusinessType();
        Long businessId = request.getBusinessId();
        if (!StringUtils.hasText(businessType) && sourceContent.get("businessType") != null) {
            businessType = String.valueOf(sourceContent.get("businessType"));
            businessId = asLong(sourceContent.get("businessId"));
        }
        if (!StringUtils.hasText(businessType) && StringUtils.hasText(conversation.getBusinessType())) {
            businessType = conversation.getBusinessType();
            businessId = conversation.getBusinessId();
        }
        businessType = normalizeBusinessType(businessType);
        if ((businessType == null) != (businessId == null)) throw new BusinessException("关联业务类型和业务ID必须同时填写");
        if (businessId != null && businessId <= 0) throw new BusinessException("关联业务ID不正确");
        if (request.getCustomerId() != null && request.getCustomerId() <= 0) throw new BusinessException("关联客户ID不正确");

        Long creatorId = access.currentUserId();
        Long tenantId = access.currentTenantId();
        LocalDateTime now = LocalDateTime.now();
        BizTask bizTask = new BizTask();
        bizTask.setTaskNo(createTaskNo());
        bizTask.setTitle(title);
        bizTask.setTaskType("message");
        bizTask.setBizType(businessType);
        bizTask.setBizId(businessId);
        bizTask.setCustomerId(request.getCustomerId());
        bizTask.setPriority(priorityNumber(priority));
        bizTask.setExecutorId(primaryId);
        bizTask.setExecutorName(primary == null ? null : primary.getName());
        bizTask.setDeptId(deptId);
        bizTask.setAssignerId(creatorId);
        bizTask.setPlanStartTime(now);
        bizTask.setPlanEndTime(deadline);
        bizTask.setStatus(2);
        bizTask.setDescription(sourceText(source));
        bizTask.setReviewerId(creatorId);
        bizTask.setRemark("来源：内部消息中心");
        bizTask.setTenantId(tenantId);
        bizTask.setCreateBy(creatorId);
        bizTask.setUpdateBy(creatorId);
        bizTaskMapper.insert(bizTask);

        List<String> reminderRules = normalizeReminderRules(request.getReminderRules());
        ImEntities.TaskDetail detail = new ImEntities.TaskDetail();
        detail.setTenantId(tenantId);
        detail.setCompanyId(tenantId);
        detail.setTaskId(bizTask.getId());
        detail.setConversationId(conversation.getId());
        detail.setSourceMessageId(source.getId());
        detail.setTitle(title);
        detail.setWorkflowState("pending_accept");
        detail.setPriority(priority);
        detail.setDeptId(deptId);
        detail.setDeadlineAt(deadline);
        detail.setAcceptanceStandard(acceptance);
        detail.setReminderConfigJson(writeJson(reminderRules));
        detail.setCustomerId(request.getCustomerId());
        detail.setBusinessType(businessType);
        detail.setBusinessId(businessId);
        detail.setCreatorId(creatorId);
        detail.setReviewerId(creatorId);
        detail.setVersion(0);
        detail.setCreatedAt(now);
        detail.setUpdatedAt(now);
        detailMapper.insert(detail);

        for (Long userId : responsibleIds) insertParticipant(tenantId, bizTask.getId(), userId, "responsible", now);
        for (Long userId : collaboratorIds) insertParticipant(tenantId, bizTask.getId(), userId, "collaborator", now);
        linkMessage(tenantId, source.getId(), bizTask.getId(), now);

        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("responsibleIds", responsibleIds);
        snapshot.put("collaboratorIds", collaboratorIds);
        snapshot.put("deadlineAt", deadline.toString());
        snapshot.put("priority", priority);
        addTimeline(detail, creatorId, "created", null, "pending_accept", "由消息转为待办", snapshot);
        createReminders(detail, responsibleIds, reminderRules);
        addAudit(detail, creatorId, "task.created", "由消息转为待办");

        LinkedHashSet<Long> mentions = new LinkedHashSet<>(responsibleIds);
        mentions.remove(creatorId);
        ImModels.Message card = messagingService.sendStructuredMessage(
                conversation.getId(), "task:" + bizTask.getId() + ":created", "task", "待办：" + title,
                Map.of("taskId", bizTask.getId()), !"normal".equals(priority), mentions);
        detail.setCardMessageId(card.getId());
        detail.setUpdatedAt(LocalDateTime.now());
        detailMapper.updateById(detail);
        linkMessage(tenantId, card.getId(), bizTask.getId(), LocalDateTime.now());

        ImModels.WorkTask result = loadTask(bizTask.getId(), false);
        publishTaskUpdatedAfterCommit(detail, result);
        return result;
    }

    public ImModels.WorkTask detail(Long taskId) {
        taskAccess.requireView(taskId);
        return loadTask(taskId, true);
    }

    public ImModels.CursorPage<ImModels.WorkTask> list(String requestedScope, String requestedState,
                                                        String cursor, int pageSize) {
        String scope = normalizeScope(requestedScope);
        String state = STATES.contains(requestedState) ? requestedState : "all";
        TaskCursor parsed = decodeCursor(cursor);
        int limit = Math.max(10, Math.min(pageSize, 80));
        List<Long> deptIds = "department".equals(scope) ? taskAccess.departmentScopeIds() : List.of();
        List<ImModels.WorkTask> rows = taskQueryMapper.listTasks(
                access.currentUserId(), access.currentTenantId(), scope, state, deptIds,
                parsed.updatedAt(), parsed.taskId(), limit + 1);
        boolean hasMore = rows.size() > limit;
        if (hasMore) rows = new ArrayList<>(rows.subList(0, limit));
        decorateTasks(rows);
        ImModels.CursorPage<ImModels.WorkTask> page = new ImModels.CursorPage<>();
        page.setItems(rows);
        page.setHasMore(hasMore);
        if (hasMore && !rows.isEmpty()) page.setNextCursor(encodeCursor(rows.get(rows.size() - 1)));
        return page;
    }

    public ImModels.TaskStats stats(String requestedScope) {
        String scope = normalizeScope(requestedScope);
        List<Long> deptIds = "department".equals(scope) ? taskAccess.departmentScopeIds() : List.of();
        ImModels.TaskStats stats = taskQueryMapper.taskStats(
                access.currentUserId(), access.currentTenantId(), scope, deptIds);
        return stats == null ? new ImModels.TaskStats() : stats;
    }

    @Transactional(rollbackFor = Exception.class)
    public ImModels.WorkTask accept(Long taskId) {
        ImEntities.TaskDetail detail = taskAccess.requireResponsible(taskId);
        if ("in_progress".equals(detail.getWorkflowState())) return loadTask(taskId, true);
        transition(detail, Set.of("pending_accept", "rejected"), "in_progress", "accepted", "已接收待办", wrapper -> {
            wrapper.set(ImEntities.TaskDetail::getAcceptedAt, LocalDateTime.now());
            wrapper.set(ImEntities.TaskDetail::getRejectReason, null);
        });
        Long userId = access.currentUserId();
        participantMapper.update(null, new LambdaUpdateWrapper<ImEntities.TaskParticipant>()
                .eq(ImEntities.TaskParticipant::getTaskId, taskId)
                .eq(ImEntities.TaskParticipant::getUserId, userId)
                .eq(ImEntities.TaskParticipant::getParticipantRole, "responsible")
                .set(ImEntities.TaskParticipant::getParticipantStatus, "accepted")
                .set(ImEntities.TaskParticipant::getAcceptedAt, LocalDateTime.now())
                .set(ImEntities.TaskParticipant::getUpdatedAt, LocalDateTime.now()));
        bizTaskMapper.update(null, new LambdaUpdateWrapper<BizTask>()
                .eq(BizTask::getId, taskId)
                .set(BizTask::getStatus, 3)
                .set(BizTask::getActualStartTime, LocalDateTime.now())
                .set(BizTask::getUpdateBy, userId));
        return finishAction(taskId, detail);
    }

    @Transactional(rollbackFor = Exception.class)
    public ImModels.WorkTask submit(Long taskId, ImModels.TaskActionRequest request) {
        ImEntities.TaskDetail detail = taskAccess.requireResponsible(taskId);
        if ("pending_review".equals(detail.getWorkflowState())) return loadTask(taskId, true);
        String result = requiredText(request.getResult(), "处理结果", 10000);
        linkTaskAttachments(detail, request.getAttachmentIds());
        transition(detail, Set.of("in_progress", "rejected"), "pending_review", "submitted", result, wrapper -> {
            wrapper.set(ImEntities.TaskDetail::getResultText, result);
            wrapper.set(ImEntities.TaskDetail::getSubmittedAt, LocalDateTime.now());
            wrapper.set(ImEntities.TaskDetail::getRejectReason, null);
        });
        participantMapper.update(null, new LambdaUpdateWrapper<ImEntities.TaskParticipant>()
                .eq(ImEntities.TaskParticipant::getTaskId, taskId)
                .eq(ImEntities.TaskParticipant::getParticipantRole, "responsible")
                .set(ImEntities.TaskParticipant::getParticipantStatus, "completed")
                .set(ImEntities.TaskParticipant::getCompletedAt, LocalDateTime.now())
                .set(ImEntities.TaskParticipant::getUpdatedAt, LocalDateTime.now()));
        bizTaskMapper.update(null, new LambdaUpdateWrapper<BizTask>()
                .eq(BizTask::getId, taskId)
                .set(BizTask::getStatus, 4)
                .set(BizTask::getResult, result)
                .set(BizTask::getActualEndTime, LocalDateTime.now())
                .set(BizTask::getUpdateBy, access.currentUserId()));
        return finishAction(taskId, detail);
    }

    @Transactional(rollbackFor = Exception.class)
    public ImModels.WorkTask review(Long taskId, ImModels.TaskActionRequest request) {
        ImEntities.TaskDetail detail = taskAccess.requireReviewer(taskId);
        boolean pass = Boolean.TRUE.equals(request.getPass());
        if (pass && "completed".equals(detail.getWorkflowState())) return loadTask(taskId, true);
        String comment = cleanOptional(request.getComment(), 1000);
        if (!pass && !StringUtils.hasText(comment)) throw new BusinessException("驳回时必须填写原因");
        String target = pass ? "completed" : "rejected";
        transition(detail, Set.of("pending_review"), target, pass ? "approved" : "rejected",
                pass ? (StringUtils.hasText(comment) ? comment : "验收通过") : comment, wrapper -> {
                    if (pass) wrapper.set(ImEntities.TaskDetail::getCompletedAt, LocalDateTime.now());
                    else wrapper.set(ImEntities.TaskDetail::getRejectReason, comment);
                });
        int taskStatus = pass ? 5 : 6;
        bizTaskMapper.update(null, new LambdaUpdateWrapper<BizTask>()
                .eq(BizTask::getId, taskId)
                .set(BizTask::getStatus, taskStatus)
                .set(BizTask::getReviewComment, comment)
                .set(BizTask::getReviewerId, access.currentUserId())
                .set(BizTask::getReviewTime, LocalDateTime.now())
                .set(BizTask::getUpdateBy, access.currentUserId()));
        if (pass) cancelPendingReminders(taskId);
        else participantMapper.update(null, new LambdaUpdateWrapper<ImEntities.TaskParticipant>()
                .eq(ImEntities.TaskParticipant::getTaskId, taskId)
                .eq(ImEntities.TaskParticipant::getParticipantRole, "responsible")
                .set(ImEntities.TaskParticipant::getParticipantStatus, "assigned")
                .set(ImEntities.TaskParticipant::getCompletedAt, null)
                .set(ImEntities.TaskParticipant::getUpdatedAt, LocalDateTime.now()));
        return finishAction(taskId, detail);
    }

    @Transactional(rollbackFor = Exception.class)
    public ImModels.WorkTask cancel(Long taskId, ImModels.TaskActionRequest request) {
        ImEntities.TaskDetail detail = taskAccess.requireCanceller(taskId);
        if ("cancelled".equals(detail.getWorkflowState())) return loadTask(taskId, true);
        String reason = requiredText(request.getReason(), "取消原因", 1000);
        transition(detail, Set.of("pending_accept", "in_progress", "pending_review", "rejected"),
                "cancelled", "cancelled", reason,
                wrapper -> wrapper.set(ImEntities.TaskDetail::getCancelledAt, LocalDateTime.now()));
        bizTaskMapper.update(null, new LambdaUpdateWrapper<BizTask>()
                .eq(BizTask::getId, taskId)
                .set(BizTask::getStatus, 7)
                .set(BizTask::getReviewComment, reason)
                .set(BizTask::getUpdateBy, access.currentUserId()));
        cancelPendingReminders(taskId);
        return finishAction(taskId, detail);
    }

    private ImModels.WorkTask finishAction(Long taskId, ImEntities.TaskDetail detail) {
        ImModels.WorkTask result = loadTask(taskId, true);
        publishTaskUpdatedAfterCommit(detail, result);
        return result;
    }

    private void transition(ImEntities.TaskDetail detail, Set<String> allowedStates, String targetState,
                            String action, String comment,
                            Consumer<LambdaUpdateWrapper<ImEntities.TaskDetail>> customizer) {
        String from = detail.getWorkflowState();
        if (!allowedStates.contains(from)) throw new BusinessException("待办状态已变化，请刷新后重试");
        ImTaskWorkflow.requireTransition(from, targetState);
        LambdaUpdateWrapper<ImEntities.TaskDetail> wrapper = new LambdaUpdateWrapper<ImEntities.TaskDetail>()
                .eq(ImEntities.TaskDetail::getId, detail.getId())
                .eq(ImEntities.TaskDetail::getVersion, detail.getVersion())
                .eq(ImEntities.TaskDetail::getWorkflowState, from)
                .set(ImEntities.TaskDetail::getWorkflowState, targetState)
                .set(ImEntities.TaskDetail::getUpdatedAt, LocalDateTime.now())
                .setSql("version = version + 1");
        customizer.accept(wrapper);
        if (detailMapper.update(null, wrapper) != 1) throw new BusinessException("待办已被其他人更新，请刷新后重试");
        addTimeline(detail, access.currentUserId(), action, from, targetState, comment, Map.of());
        addAudit(detail, access.currentUserId(), "task." + action, comment);
        detail.setWorkflowState(targetState);
        detail.setVersion(detail.getVersion() + 1);
    }

    private ImModels.WorkTask loadTask(Long taskId, boolean withDetails) {
        ImModels.WorkTask task = taskQueryMapper.taskById(taskId, access.currentTenantId());
        if (task == null) throw new BusinessException("待办不存在");
        decorateTasks(List.of(task));
        if (withDetails) {
            task.setTimeline(taskQueryMapper.timeline(taskId, access.currentTenantId()));
            task.setResultAttachments(taskQueryMapper.taskAttachments(taskId, access.currentTenantId()));
        }
        return task;
    }

    private void decorateTasks(List<ImModels.WorkTask> tasks) {
        if (tasks == null || tasks.isEmpty()) return;
        Long tenantId = access.currentTenantId();
        Long viewerId = access.currentUserId();
        List<Long> taskIds = tasks.stream().map(ImModels.WorkTask::getTaskId).toList();
        Map<Long, List<ImModels.TaskParticipant>> participants = taskQueryMapper.participantsByTaskIds(taskIds, tenantId)
                .stream().collect(Collectors.groupingBy(ImModels.TaskParticipant::getTaskId));
        for (ImModels.WorkTask task : tasks) {
            List<ImModels.TaskParticipant> people = participants.getOrDefault(task.getTaskId(), List.of());
            task.setParticipants(people);
            task.setReminderRules(readStringList(task.getReminderConfigJson()));
            boolean responsible = people.stream().anyMatch(p -> Objects.equals(p.getUserId(), viewerId)
                    && "responsible".equals(p.getRole()));
            boolean reviewer = Objects.equals(task.getReviewerId(), viewerId)
                    || taskAccess.isBoss() || taskAccess.isDepartmentManager(task.getDeptId());
            boolean creator = Objects.equals(task.getCreatorId(), viewerId);
            task.setCanAccept(responsible && Set.of("pending_accept", "rejected").contains(task.getWorkflowState()));
            task.setCanSubmit(responsible && Set.of("in_progress", "rejected").contains(task.getWorkflowState()));
            task.setCanReview(reviewer && "pending_review".equals(task.getWorkflowState()));
            task.setCanCancel((creator || taskAccess.isBoss() || taskAccess.isDepartmentManager(task.getDeptId()))
                    && !Set.of("completed", "cancelled").contains(task.getWorkflowState()));
        }
    }

    private void insertParticipant(Long tenantId, Long taskId, Long userId, String role, LocalDateTime now) {
        ImEntities.TaskParticipant participant = new ImEntities.TaskParticipant();
        participant.setTenantId(tenantId);
        participant.setCompanyId(tenantId);
        participant.setTaskId(taskId);
        participant.setUserId(userId);
        participant.setParticipantRole(role);
        participant.setParticipantStatus("assigned");
        participant.setCreatedAt(now);
        participant.setUpdatedAt(now);
        participantMapper.insert(participant);
    }

    private void linkMessage(Long tenantId, Long messageId, Long taskId, LocalDateTime now) {
        ImEntities.TaskMessageLink link = new ImEntities.TaskMessageLink();
        link.setTenantId(tenantId);
        link.setCompanyId(tenantId);
        link.setMessageId(messageId);
        link.setTaskId(taskId);
        link.setCreatedAt(now);
        taskMessageLinkMapper.insert(link);
    }

    private void createReminders(ImEntities.TaskDetail detail, Collection<Long> responsibleIds, List<String> rules) {
        LinkedHashSet<Long> overdueRecipients = new LinkedHashSet<>(responsibleIds);
        overdueRecipients.add(detail.getCreatorId());
        if (detail.getDeptId() != null) {
            overdueRecipients.addAll(taskQueryMapper.departmentManagerIds(detail.getDeptId(), detail.getTenantId()));
        }
        for (String rule : rules) {
            Collection<Long> recipients = "overdue_1h".equals(rule) ? overdueRecipients : responsibleIds;
            LocalDateTime scheduledAt = reminderTime(detail.getDeadlineAt(), rule);
            if (scheduledAt == null || scheduledAt.isBefore(LocalDateTime.now())) continue;
            for (Long recipientId : recipients) {
                ImEntities.TaskReminder reminder = new ImEntities.TaskReminder();
                reminder.setTenantId(detail.getTenantId());
                reminder.setCompanyId(detail.getCompanyId());
                reminder.setTaskId(detail.getTaskId());
                reminder.setRecipientId(recipientId);
                reminder.setReminderType(rule);
                reminder.setScheduledAt(scheduledAt);
                reminder.setEventId("im-task:" + detail.getTaskId() + ":" + rule + ":" + recipientId);
                reminder.setStatus("pending");
                reminder.setCreatedAt(LocalDateTime.now());
                reminder.setUpdatedAt(LocalDateTime.now());
                reminderMapper.insert(reminder);
            }
        }
    }

    private void linkTaskAttachments(ImEntities.TaskDetail detail, Collection<Long> requestedIds) {
        LinkedHashSet<Long> ids = normalizedIds(requestedIds);
        if (ids.isEmpty()) return;
        if (ids.size() > 10) throw new BusinessException("处理凭证最多上传10个文件");
        List<ImEntities.Attachment> attachments = attachmentMapper.selectBatchIds(ids);
        if (attachments.size() != ids.size()) throw new BusinessException("部分处理凭证不存在");
        Long userId = access.currentUserId();
        for (ImEntities.Attachment attachment : attachments) {
            if (!Objects.equals(attachment.getConversationId(), detail.getConversationId())
                    || !Objects.equals(attachment.getUploaderId(), userId)
                    || attachment.getMessageId() != null || attachment.getTaskId() != null
                    || !"uploaded".equals(attachment.getUploadStatus())) {
                throw new BusinessException("处理凭证不属于当前待办或已被使用");
            }
            attachment.setTaskId(detail.getTaskId());
            attachment.setUploadStatus("task_linked");
            attachmentMapper.updateById(attachment);
            ImEntities.TaskAttachment link = new ImEntities.TaskAttachment();
            link.setTenantId(detail.getTenantId());
            link.setCompanyId(detail.getCompanyId());
            link.setTaskId(detail.getTaskId());
            link.setAttachmentId(attachment.getId());
            link.setUploaderId(userId);
            link.setAttachmentRole("result");
            link.setCreatedAt(LocalDateTime.now());
            taskAttachmentMapper.insert(link);
        }
    }

    private void cancelPendingReminders(Long taskId) {
        reminderMapper.update(null, new LambdaUpdateWrapper<ImEntities.TaskReminder>()
                .eq(ImEntities.TaskReminder::getTaskId, taskId)
                .in(ImEntities.TaskReminder::getStatus, "pending", "queued")
                .set(ImEntities.TaskReminder::getStatus, "cancelled")
                .set(ImEntities.TaskReminder::getUpdatedAt, LocalDateTime.now()));
    }

    private void addTimeline(ImEntities.TaskDetail detail, Long operatorId, String action, String fromState,
                             String toState, String comment, Object snapshot) {
        ImEntities.TaskTimeline timeline = new ImEntities.TaskTimeline();
        timeline.setTenantId(detail.getTenantId());
        timeline.setCompanyId(detail.getCompanyId());
        timeline.setTaskId(detail.getTaskId());
        timeline.setOperatorId(operatorId);
        timeline.setActionType(action);
        timeline.setFromState(fromState);
        timeline.setToState(toState);
        timeline.setComment(cleanOptional(comment, 2000));
        timeline.setSnapshotJson(writeJson(snapshot));
        timeline.setCreatedAt(LocalDateTime.now());
        timelineMapper.insert(timeline);
    }

    private void addAudit(ImEntities.TaskDetail detail, Long operatorId, String action, String reason) {
        ImEntities.AuditLog audit = new ImEntities.AuditLog();
        audit.setTenantId(detail.getTenantId());
        audit.setCompanyId(detail.getCompanyId());
        audit.setOperatorId(operatorId);
        audit.setActionType(action);
        audit.setConversationId(detail.getConversationId());
        audit.setMessageId(detail.getSourceMessageId());
        audit.setReason(cleanOptional(reason, 500));
        audit.setCreatedAt(LocalDateTime.now());
        auditMapper.insert(audit);
    }

    private void publishTaskUpdatedAfterCommit(ImEntities.TaskDetail detail, ImModels.WorkTask task) {
        List<Long> recipients = memberMapper.selectList(new LambdaQueryWrapper<ImEntities.Member>()
                        .select(ImEntities.Member::getUserId)
                        .eq(ImEntities.Member::getConversationId, detail.getConversationId())
                        .eq(ImEntities.Member::getStatus, "active"))
                .stream().map(ImEntities.Member::getUserId).distinct().toList();
        afterCommit(() -> eventPublisher.publish("task.updated", recipients,
                Map.of("conversationId", detail.getConversationId(), "task", task)));
    }

    private String normalizeScope(String requestedScope) {
        String scope = StringUtils.hasText(requestedScope) ? requestedScope.trim() : "all_mine";
        if ("company".equals(scope) && !taskAccess.isBoss()) throw new BusinessException("无权查看全公司待办");
        if ("department".equals(scope)) taskAccess.departmentScopeIds();
        if (!Set.of("all_mine", "responsible", "created", "participating", "department", "company").contains(scope)) {
            return "all_mine";
        }
        return scope;
    }

    private String normalizePriority(String value) {
        String priority = StringUtils.hasText(value) ? value.trim().toLowerCase() : "normal";
        if (!PRIORITIES.contains(priority)) throw new BusinessException("优先级不正确");
        return priority;
    }

    private List<String> normalizeReminderRules(Collection<String> values) {
        LinkedHashSet<String> rules = new LinkedHashSet<>();
        if (values != null) values.stream().filter(REMINDER_RULES::contains).forEach(rules::add);
        if (rules.isEmpty()) rules.addAll(List.of("before_2h", "due", "overdue_1h"));
        return List.copyOf(rules);
    }

    private LocalDateTime reminderTime(LocalDateTime deadline, String rule) {
        return switch (rule) {
            case "before_30m" -> deadline.minusMinutes(30);
            case "before_2h" -> deadline.minusHours(2);
            case "before_1d" -> deadline.minusDays(1);
            case "due" -> deadline;
            case "overdue_1h" -> deadline.plusHours(1);
            default -> null;
        };
    }

    private int priorityNumber(String priority) {
        return switch (priority) {
            case "urgent" -> 4;
            case "important" -> 3;
            default -> 2;
        };
    }

    private String normalizeBusinessType(String value) {
        if (!StringUtils.hasText(value)) return null;
        String type = value.trim().toLowerCase();
        if (!type.matches("[a-z][a-z0-9_]{0,31}")) throw new BusinessException("关联业务类型格式不正确");
        return type;
    }

    private String sourceText(ImEntities.Message source) {
        String text = String.valueOf(readContent(source).getOrDefault("text", ""));
        if (StringUtils.hasText(text)) return text.length() > 5000 ? text.substring(0, 5000) : text;
        return "[" + source.getMessageType() + "消息]";
    }

    private Map<String, Object> readContent(ImEntities.Message source) {
        if (source == null || !StringUtils.hasText(source.getContentJson())) return Map.of();
        try {
            return objectMapper.readValue(source.getContentJson(), new TypeReference<>() {});
        } catch (Exception ignored) {
            // 旧消息内容异常时仍保留来源链接，不影响创建待办。
            return Map.of();
        }
    }

    private Long asLong(Object value) {
        if (value instanceof Number number) return number.longValue();
        try { return value == null ? null : Long.valueOf(String.valueOf(value)); }
        catch (NumberFormatException ignored) { return null; }
    }

    private String createTaskNo() {
        String time = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String random = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase(Locale.ROOT);
        return "IMT" + time + random;
    }

    private LinkedHashSet<Long> normalizedIds(Collection<Long> ids) {
        LinkedHashSet<Long> result = new LinkedHashSet<>();
        if (ids != null) ids.stream().filter(Objects::nonNull).filter(id -> id > 0).forEach(result::add);
        return result;
    }

    private String requiredText(String value, String label, int maxLength) {
        String clean = cleanOptional(value, maxLength);
        if (!StringUtils.hasText(clean)) throw new BusinessException(label + "不能为空");
        return clean;
    }

    private String cleanOptional(String value, int maxLength) {
        if (value == null) return null;
        String clean = value.replace("\u0000", "").trim();
        if (clean.length() > maxLength) throw new BusinessException("内容不能超过" + maxLength + "个字符");
        return clean;
    }

    private List<String> readStringList(String json) {
        if (!StringUtils.hasText(json)) return List.of();
        try { return objectMapper.readValue(json, new TypeReference<>() {}); }
        catch (Exception ignored) { return List.of(); }
    }

    private String writeJson(Object value) {
        try { return objectMapper.writeValueAsString(value); }
        catch (Exception e) { throw new BusinessException("待办数据格式错误"); }
    }

    private String encodeCursor(ImModels.WorkTask task) {
        String raw = task.getUpdatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) + "|" + task.getTaskId();
        return Base64.getUrlEncoder().withoutPadding().encodeToString(raw.getBytes(StandardCharsets.UTF_8));
    }

    private TaskCursor decodeCursor(String cursor) {
        if (!StringUtils.hasText(cursor)) return new TaskCursor(null, null);
        try {
            String raw = new String(Base64.getUrlDecoder().decode(cursor), StandardCharsets.UTF_8);
            String[] parts = raw.split("\\|", 2);
            return new TaskCursor(LocalDateTime.parse(parts[0], DateTimeFormatter.ISO_LOCAL_DATE_TIME), Long.valueOf(parts[1]));
        } catch (Exception e) {
            throw new BusinessException("待办游标已失效，请刷新列表");
        }
    }

    private void afterCommit(Runnable action) {
        if (TransactionSynchronizationManager.isActualTransactionActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override public void afterCommit() { action.run(); }
            });
        } else action.run();
    }

    private record TaskCursor(LocalDateTime updatedAt, Long taskId) {}
}
