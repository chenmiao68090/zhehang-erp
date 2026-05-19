package com.zhehang.erp.modules.project.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.modules.project.domain.entity.PmMilestone;
import com.zhehang.erp.modules.project.mapper.PmMilestoneMapper;
import com.zhehang.erp.modules.project.service.IPmMilestoneService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PmMilestoneServiceImpl extends ServiceImpl<PmMilestoneMapper, PmMilestone> implements IPmMilestoneService {

    @Override
    public List<PmMilestone> listByProject(Long projectId) {
        return list(new LambdaQueryWrapper<PmMilestone>()
            .eq(PmMilestone::getProjectId, projectId)
            .orderByAsc(PmMilestone::getTargetDate));
    }
}
