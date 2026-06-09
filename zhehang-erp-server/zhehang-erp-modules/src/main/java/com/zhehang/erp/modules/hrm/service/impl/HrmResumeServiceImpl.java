package com.zhehang.erp.modules.hrm.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.hrm.domain.entity.HrmResume;
import com.zhehang.erp.modules.hrm.mapper.HrmResumeMapper;
import com.zhehang.erp.modules.hrm.service.IHrmResumeService;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class HrmResumeServiceImpl extends ServiceImpl<HrmResumeMapper, HrmResume> implements IHrmResumeService {

    private final HrmResumeMapper resumeMapper;
    private final DataScopeHelper dataScopeHelper;

    @Override
    public IPage<HrmResume> selectPage(int pageNum, int pageSize, Long recruitId, String name, Integer status) {
        // 候选人简历含PII(电话/期望薪资),仅HR/管理员可见;其余返回空
        if (!dataScopeHelper.isHrOrAdmin()) {
            return new Page<>(pageNum, pageSize);
        }
        LambdaQueryWrapper<HrmResume> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(recruitId != null, HrmResume::getRecruitId, recruitId)
               .like(StringUtils.hasText(name), HrmResume::getName, name)
               .eq(status != null, HrmResume::getStatus, status)
               .orderByDesc(HrmResume::getCreateTime);
        return resumeMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
    }

    @Override
    public void changeStatus(Long id, Integer status, String evaluation) {
        HrmResume resume = resumeMapper.selectById(id);
        if (resume == null) {
            throw new BusinessException("简历不存在");
        }
        resume.setStatus(status);
        if (evaluation != null) {
            resume.setEvaluation(evaluation);
        }
        resumeMapper.updateById(resume);
    }
}