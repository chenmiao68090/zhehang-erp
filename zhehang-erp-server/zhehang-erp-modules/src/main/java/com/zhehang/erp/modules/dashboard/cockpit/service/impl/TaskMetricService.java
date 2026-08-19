package com.zhehang.erp.modules.dashboard.cockpit.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.zhehang.erp.modules.dashboard.cockpit.domain.vo.CockpitKpiVO;
import com.zhehang.erp.modules.dashboard.cockpit.domain.vo.RecentEventVO;
import com.zhehang.erp.modules.org.domain.entity.OrgEmployee;
import com.zhehang.erp.modules.org.mapper.OrgEmployeeMapper;
import com.zhehang.erp.modules.task.domain.BizTask;
import com.zhehang.erp.modules.task.mapper.BizTaskMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static com.zhehang.erp.modules.dashboard.cockpit.service.impl.CockpitConstants.Range;
import static com.zhehang.erp.modules.dashboard.cockpit.service.impl.CockpitConstants.growthRate;

/**
 * 驾驶舱任务与人力指标: 任务动态流、在岗人数与入职增长。
 *
 * <p>仅被 {@link CockpitServiceImpl} 聚合调用, 故不单独定义接口。</p>
 */
@Service
@RequiredArgsConstructor
class TaskMetricService {

    private final BizTaskMapper taskMapper;
    private final OrgEmployeeMapper employeeMapper;

    /** 在岗员工(状态1在职, 快照) + 区间内入职带来的增长率 */
    void fillEmployeeKpi(CockpitKpiVO vo, Range cur, Range prev) {
        long onDuty = employeeMapper.selectCount(
                new LambdaQueryWrapper<OrgEmployee>().eq(OrgEmployee::getStatus, 1));
        long hiredCur = employeeMapper.selectCount(
                new LambdaQueryWrapper<OrgEmployee>().between(OrgEmployee::getCreateTime, cur.start(), cur.end()));
        long hiredPrev = employeeMapper.selectCount(
                new LambdaQueryWrapper<OrgEmployee>().between(OrgEmployee::getCreateTime, prev.start(), prev.end()));
        vo.setTotalEmployees((int) onDuty);
        vo.setEmployeeGrowthRate(growthRate(hiredCur, hiredPrev));
    }

    /** 最新动态: 区间内的任务作为事件来源, 取最近 20 条, 按创建时间倒序 */
    List<RecentEventVO> getRecentEvents(Range r) {
        List<RecentEventVO> events = new ArrayList<>();
        List<BizTask> tasks = taskMapper.selectList(
                new LambdaQueryWrapper<BizTask>()
                        .between(BizTask::getCreateTime, r.start(), r.end())
                        .orderByDesc(BizTask::getCreateTime)
                        .last("LIMIT 20"));
        for (BizTask t : tasks) {
            events.add(new RecentEventVO(
                    mapTaskType(t.getTaskType()),
                    buildTaskContent(t),
                    relativeTime(t.getCreateTime()),
                    t.getExecutorName() != null ? t.getExecutorName() : "系统"));
        }
        return events;
    }

    private String mapTaskType(String taskType) {
        if (taskType == null) return "follow";
        return switch (taskType) {
            case "followup" -> "follow";
            case "service" -> "follow";
            case "audit" -> "alert";
            default -> "follow";
        };
    }

    private String buildTaskContent(BizTask t) {
        StringBuilder sb = new StringBuilder();
        if (t.getTitle() != null && !t.getTitle().isBlank()) {
            sb.append(t.getTitle());
        } else {
            sb.append("任务").append(t.getTaskNo() != null ? t.getTaskNo() : "");
        }
        if (t.getDescription() != null && !t.getDescription().isBlank()) {
            sb.append(" - ").append(t.getDescription());
        }
        return sb.toString();
    }

    /** 相对时间文案: 刚刚 / N分钟前 / N小时前 / N天前 */
    private String relativeTime(LocalDateTime time) {
        if (time == null) return "";
        Duration d = Duration.between(time, LocalDateTime.now());
        long mins = d.toMinutes();
        if (mins < 1) return "刚刚";
        if (mins < 60) return mins + "分钟前";
        long hours = d.toHours();
        if (hours < 24) return hours + "小时前";
        return d.toDays() + "天前";
    }
}
