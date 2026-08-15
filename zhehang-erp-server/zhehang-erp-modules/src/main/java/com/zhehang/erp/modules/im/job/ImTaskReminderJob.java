package com.zhehang.erp.modules.im.job;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.zhehang.erp.modules.im.domain.ImEntities;
import com.zhehang.erp.modules.im.mapper.*;
import com.zhehang.erp.modules.im.realtime.ImEventPublisher;
import com.zhehang.erp.modules.im.service.ImNotificationOutboxService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/** 系统级扫描全部租户；每次更新都带主键、版本或状态条件，避免多实例重复处理。 */
@Component
@RequiredArgsConstructor
public class ImTaskReminderJob {
    private final ImTaskDetailMapper detailMapper;
    private final ImTaskTimelineMapper timelineMapper;
    private final ImTaskReminderMapper reminderMapper;
    private final ImTaskQueryMapper taskQueryMapper;
    private final ImMemberMapper memberMapper;
    private final ImEventPublisher eventPublisher;
    private final ImNotificationOutboxService outboxService;

    @Scheduled(fixedDelayString = "${im.task-reminder-scan-ms:60000}", initialDelay = 60000)
    public void scan() {
        repairReminderStatuses();
        markOverdue();
        queueDueReminders();
        repairReminderStatuses();
    }

    private void repairReminderStatuses() {
        taskQueryMapper.syncSentReminderStatus();
        taskQueryMapper.syncFailedReminderStatus();
    }

    private void markOverdue() {
        LocalDateTime now = LocalDateTime.now();
        List<ImEntities.TaskDetail> rows = detailMapper.selectList(
                new LambdaQueryWrapper<ImEntities.TaskDetail>()
                        .isNull(ImEntities.TaskDetail::getOverdueAt)
                        .le(ImEntities.TaskDetail::getDeadlineAt, now)
                        .notIn(ImEntities.TaskDetail::getWorkflowState, "completed", "cancelled")
                        .orderByAsc(ImEntities.TaskDetail::getDeadlineAt)
                        .last("LIMIT 100"));
        for (ImEntities.TaskDetail task : rows) {
            int updated = detailMapper.update(null, new LambdaUpdateWrapper<ImEntities.TaskDetail>()
                    .eq(ImEntities.TaskDetail::getId, task.getId())
                    .eq(ImEntities.TaskDetail::getVersion, task.getVersion())
                    .isNull(ImEntities.TaskDetail::getOverdueAt)
                    .set(ImEntities.TaskDetail::getOverdueAt, now)
                    .set(ImEntities.TaskDetail::getUpdatedAt, now)
                    .setSql("version = version + 1"));
            if (updated != 1) continue;

            ImEntities.TaskTimeline timeline = new ImEntities.TaskTimeline();
            timeline.setTenantId(task.getTenantId());
            timeline.setCompanyId(task.getCompanyId());
            timeline.setTaskId(task.getTaskId());
            timeline.setOperatorId(0L);
            timeline.setActionType("overdue");
            timeline.setFromState(task.getWorkflowState());
            timeline.setToState(task.getWorkflowState());
            timeline.setComment("超过截止时间，系统标记为逾期");
            timeline.setSnapshotJson("{}");
            timeline.setCreatedAt(now);
            timelineMapper.insert(timeline);

            List<Long> recipients = memberMapper.selectList(new LambdaQueryWrapper<ImEntities.Member>()
                            .select(ImEntities.Member::getUserId)
                            .eq(ImEntities.Member::getConversationId, task.getConversationId())
                            .eq(ImEntities.Member::getStatus, "active"))
                    .stream().map(ImEntities.Member::getUserId).distinct().toList();
            eventPublisher.publish("task.updated", recipients,
                    Map.of("conversationId", task.getConversationId(), "taskId", task.getTaskId(), "status", "overdue"));
        }
    }

    private void queueDueReminders() {
        LocalDateTime now = LocalDateTime.now();
        List<ImEntities.TaskReminder> reminders = reminderMapper.selectList(
                new LambdaQueryWrapper<ImEntities.TaskReminder>()
                        .eq(ImEntities.TaskReminder::getStatus, "pending")
                        .le(ImEntities.TaskReminder::getScheduledAt, now)
                        .orderByAsc(ImEntities.TaskReminder::getScheduledAt)
                        .last("LIMIT 100"));
        for (ImEntities.TaskReminder reminder : reminders) {
            ImEntities.TaskDetail task = detailMapper.selectOne(new LambdaQueryWrapper<ImEntities.TaskDetail>()
                    .eq(ImEntities.TaskDetail::getTaskId, reminder.getTaskId())
                    .eq(ImEntities.TaskDetail::getCompanyId, reminder.getCompanyId())
                    .last("LIMIT 1"));
            if (task == null || List.of("completed", "cancelled").contains(task.getWorkflowState())) {
                reminderMapper.update(null, new LambdaUpdateWrapper<ImEntities.TaskReminder>()
                        .eq(ImEntities.TaskReminder::getId, reminder.getId())
                        .eq(ImEntities.TaskReminder::getStatus, "pending")
                        .set(ImEntities.TaskReminder::getStatus, "cancelled")
                        .set(ImEntities.TaskReminder::getUpdatedAt, now));
                continue;
            }
            if (outboxService.enqueueTaskReminderSafely(reminder, task)) {
                reminderMapper.update(null, new LambdaUpdateWrapper<ImEntities.TaskReminder>()
                        .eq(ImEntities.TaskReminder::getId, reminder.getId())
                        .eq(ImEntities.TaskReminder::getStatus, "pending")
                        .set(ImEntities.TaskReminder::getStatus, "queued")
                        .set(ImEntities.TaskReminder::getQueuedAt, now)
                        .set(ImEntities.TaskReminder::getUpdatedAt, now));
            }
        }
    }
}
