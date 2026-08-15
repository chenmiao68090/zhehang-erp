package com.zhehang.erp.modules.workflow.job;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.zhehang.erp.modules.system.domain.entity.SysNotification;
import com.zhehang.erp.modules.system.mapper.SysNotificationMapper;
import com.zhehang.erp.modules.workflow.domain.entity.WfInstance;
import com.zhehang.erp.modules.workflow.domain.entity.WfTask;
import com.zhehang.erp.modules.workflow.mapper.WfInstanceMapper;
import com.zhehang.erp.modules.workflow.mapper.WfTaskMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 审批超时提醒:每30分钟扫一次到期未处理的审批任务(wf_task.deadline 已过、status=0),
 * 给审批人发站内信,timeout_notified 置1防重复提醒。
 *
 * <p>定时线程无登录租户上下文,ErpTenantHandler 对该场景放行租户过滤(系统级任务,全租户生效);
 * 通知行的 tenant_id 必须显式带上任务行的租户,否则登录用户查通知会被租户条件挡住看不见(V112老坑)。</p>
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class WfTimeoutRemindJob {

    private static final String APPROVAL_CENTER_LINK = "/approval/center";
    private static final int NOTIFY_TYPE_APPROVAL = 2;

    private final WfTaskMapper taskMapper;
    private final WfInstanceMapper instanceMapper;
    private final SysNotificationMapper notificationMapper;

    @Scheduled(cron = "0 */30 * * * ?")
    public void remindTimeoutTasks() {
        try {
            List<WfTask> overdue = taskMapper.selectList(new LambdaQueryWrapper<WfTask>()
                    .eq(WfTask::getStatus, 0)
                    .isNotNull(WfTask::getDeadline)
                    .lt(WfTask::getDeadline, LocalDateTime.now())
                    .and(w -> w.isNull(WfTask::getTimeoutNotified).or().eq(WfTask::getTimeoutNotified, 0)));
            if (overdue.isEmpty()) {
                return;
            }
            int sent = 0;
            for (WfTask task : overdue) {
                try {
                    WfInstance instance = instanceMapper.selectById(task.getInstanceId());
                    if (instance == null || instance.getStatus() == null || instance.getStatus() != 0) {
                        // 实例已结束的僵尸任务:只标记不提醒
                        markNotified(task.getId());
                        continue;
                    }
                    SysNotification n = new SysNotification();
                    n.setUserId(task.getAssigneeId());
                    n.setTitle("审批已超时");
                    n.setContent("「" + instance.getTitle() + "」在节点[" + task.getNodeName() + "]已超过审批时限,请尽快处理");
                    n.setType(NOTIFY_TYPE_APPROVAL);
                    n.setIsRead(0);
                    n.setSender("审批中心");
                    n.setLink(APPROVAL_CENTER_LINK);
                    // 显式带任务行租户:定时线程没有租户上下文,不带的话通知会因 tenant_id NULL 被挡死
                    n.setTenantId(task.getTenantId());
                    notificationMapper.insert(n);
                    markNotified(task.getId());
                    sent++;
                } catch (Exception e) {
                    log.warn("[定时] 审批超时提醒失败 taskId={}", task.getId(), e);
                }
            }
            log.info("[定时] 审批超时提醒:扫到 {} 条超时任务,发送 {} 条提醒", overdue.size(), sent);
        } catch (Exception e) {
            log.error("[定时] 审批超时提醒任务异常", e);
        }
    }

    private void markNotified(Long taskId) {
        taskMapper.update(null, new LambdaUpdateWrapper<WfTask>()
                .eq(WfTask::getId, taskId)
                .set(WfTask::getTimeoutNotified, 1));
    }
}
