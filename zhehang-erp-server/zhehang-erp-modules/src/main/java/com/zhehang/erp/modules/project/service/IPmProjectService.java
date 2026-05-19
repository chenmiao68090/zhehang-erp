package com.zhehang.erp.modules.project.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.zhehang.erp.modules.project.domain.entity.PmProject;

import java.util.Map;

public interface IPmProjectService extends IService<PmProject> {
    IPage<PmProject> selectPage(int pageNum, int pageSize, String name, Integer type, Integer status, Long managerId);
    void calcProgress(Long projectId);
    Map<String, Object> getStats(Long projectId);
}
