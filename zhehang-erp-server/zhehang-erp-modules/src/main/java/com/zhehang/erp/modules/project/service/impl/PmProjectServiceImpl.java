package com.zhehang.erp.modules.project.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.modules.project.domain.entity.PmProject;
import com.zhehang.erp.modules.project.domain.entity.PmTask;
import com.zhehang.erp.modules.project.domain.entity.PmTimesheet;
import com.zhehang.erp.modules.project.mapper.PmProjectMapper;
import com.zhehang.erp.modules.project.mapper.PmTaskMapper;
import com.zhehang.erp.modules.project.mapper.PmTimesheetMapper;
import com.zhehang.erp.modules.project.service.IPmProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PmProjectServiceImpl extends ServiceImpl<PmProjectMapper, PmProject> implements IPmProjectService {

    private final PmProjectMapper projectMapper;
    private final PmTaskMapper taskMapper;
    private final PmTimesheetMapper timesheetMapper;

    @Override
    public IPage<PmProject> selectPage(int pageNum, int pageSize, String name, Integer type, Integer status, Long managerId) {
        LambdaQueryWrapper<PmProject> wrapper = new LambdaQueryWrapper<>();
        wrapper.like(StringUtils.hasText(name), PmProject::getName, name)
               .eq(type != null, PmProject::getType, type)
               .eq(status != null, PmProject::getStatus, status)
               .eq(managerId != null, PmProject::getManagerId, managerId)
               .orderByDesc(PmProject::getCreateTime);
        return projectMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
    }

    @Override
    public void calcProgress(Long projectId) {
        List<PmTask> tasks = taskMapper.selectList(
            new LambdaQueryWrapper<PmTask>().eq(PmTask::getProjectId, projectId));
        if (tasks.isEmpty()) return;
        int totalProgress = 0;
        for (PmTask t : tasks) {
            totalProgress += (t.getProgress() != null ? t.getProgress() : 0);
        }
        int avg = totalProgress / tasks.size();
        PmProject project = new PmProject();
        project.setId(projectId);
        project.setProgress(avg);
        projectMapper.updateById(project);
    }

    @Override
    public Map<String, Object> getStats(Long projectId) {
        Map<String, Object> stats = new HashMap<>();
        PmProject project = projectMapper.selectById(projectId);
        stats.put("progress", project != null ? project.getProgress() : 0);
        stats.put("budget", project != null ? project.getBudget() : BigDecimal.ZERO);
        stats.put("actualCost", project != null ? project.getActualCost() : BigDecimal.ZERO);

        List<PmTask> tasks = taskMapper.selectList(
            new LambdaQueryWrapper<PmTask>().eq(PmTask::getProjectId, projectId));
        long totalTasks = tasks.size();
        long completedTasks = tasks.stream().filter(t -> t.getStatus() != null && t.getStatus() == 3).count();
        stats.put("totalTasks", totalTasks);
        stats.put("completedTasks", completedTasks);

        List<PmTimesheet> timesheets = timesheetMapper.selectList(
            new LambdaQueryWrapper<PmTimesheet>().eq(PmTimesheet::getProjectId, projectId));
        BigDecimal totalHours = timesheets.stream()
            .map(ts -> ts.getHours() != null ? ts.getHours() : BigDecimal.ZERO)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        stats.put("totalHours", totalHours);

        return stats;
    }
}
