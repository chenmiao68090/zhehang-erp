package com.zhehang.erp.modules.project.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.modules.project.domain.entity.PmDoc;
import com.zhehang.erp.modules.project.mapper.PmDocMapper;
import com.zhehang.erp.modules.project.service.IPmDocService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PmDocServiceImpl extends ServiceImpl<PmDocMapper, PmDoc> implements IPmDocService {

    @Override
    public List<PmDoc> listByProject(Long projectId) {
        return list(new LambdaQueryWrapper<PmDoc>()
            .eq(PmDoc::getProjectId, projectId)
            .orderByDesc(PmDoc::getCreateTime));
    }
}
