package com.zhehang.erp.modules.project.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.modules.project.domain.entity.PmTask;
import com.zhehang.erp.modules.project.mapper.PmTaskMapper;
import com.zhehang.erp.modules.project.service.IPmProjectService;
import com.zhehang.erp.modules.project.service.IPmTaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PmTaskServiceImpl extends ServiceImpl<PmTaskMapper, PmTask> implements IPmTaskService {

    private final PmTaskMapper taskMapper;
    @Lazy
    private final IPmProjectService projectService;

    @Override
    public List<PmTask> getTaskTree(Long projectId) {
        List<PmTask> all = taskMapper.selectList(
            new LambdaQueryWrapper<PmTask>()
                .eq(PmTask::getProjectId, projectId)
                .orderByAsc(PmTask::getSort));
        return buildTree(all);
    }

    @Override
    public List<PmTask> getGanttData(Long projectId) {
        return taskMapper.selectList(
            new LambdaQueryWrapper<PmTask>()
                .eq(PmTask::getProjectId, projectId)
                .orderByAsc(PmTask::getSort));
    }

    @Override
    public Map<String, List<PmTask>> getBoardData(Long projectId) {
        List<PmTask> all = taskMapper.selectList(
            new LambdaQueryWrapper<PmTask>()
                .eq(PmTask::getProjectId, projectId)
                .orderByAsc(PmTask::getSort));
        Map<String, List<PmTask>> board = new LinkedHashMap<>();
        board.put("todo", new ArrayList<>());
        board.put("inProgress", new ArrayList<>());
        board.put("review", new ArrayList<>());
        board.put("done", new ArrayList<>());
        for (PmTask t : all) {
            int s = t.getStatus() != null ? t.getStatus() : 0;
            switch (s) {
                case 0: board.get("todo").add(t); break;
                case 1: board.get("inProgress").add(t); break;
                case 2: board.get("review").add(t); break;
                case 3: board.get("done").add(t); break;
                default: board.get("todo").add(t);
            }
        }
        return board;
    }

    @Override
    public void changeStatus(Long id, Integer status) {
        PmTask task = taskMapper.selectById(id);
        if (task != null) {
            task.setStatus(status);
            if (status == 3) task.setProgress(100);
            taskMapper.updateById(task);
            projectService.calcProgress(task.getProjectId());
        }
    }

    private List<PmTask> buildTree(List<PmTask> all) {
        // Return flat list with parentId info - frontend handles tree rendering via el-table row-key + tree-props
        return all;
    }
}
