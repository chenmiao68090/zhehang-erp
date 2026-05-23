package com.zhehang.erp.modules.project.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.zhehang.erp.modules.project.domain.entity.PmMilestone;

import java.util.List;

public interface IPmMilestoneService extends IService<PmMilestone> {
    List<PmMilestone> listByProject(Long projectId);
}
