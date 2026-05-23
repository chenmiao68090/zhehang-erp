package com.zhehang.erp.modules.project.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.zhehang.erp.modules.project.domain.entity.PmTask;

import java.util.List;
import java.util.Map;

public interface IPmTaskService extends IService<PmTask> {
    List<PmTask> getTaskTree(Long projectId);
    List<PmTask> getGanttData(Long projectId);
    Map<String, List<PmTask>> getBoardData(Long projectId);
    void changeStatus(Long id, Integer status);
}
