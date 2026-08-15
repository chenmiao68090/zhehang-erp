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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Service
@RequiredArgsConstructor
public class HrmResumeServiceImpl extends ServiceImpl<HrmResumeMapper, HrmResume> implements IHrmResumeService {

    private final HrmResumeMapper resumeMapper;
    private final DataScopeHelper dataScopeHelper;

    @Override
    public IPage<HrmResume> selectPage(int pageNum, int pageSize, Long recruitId, String keyword, Integer status, String tags,
                                       String interviewDateStart, String interviewDateEnd) {
        // 候选人简历含PII(电话/期望薪资),仅HR/管理员可见;其余返回空
        if (!dataScopeHelper.isHrOrAdmin()) {
            return new Page<>(pageNum, pageSize);
        }
        // 按初面时间(first_interview_time,LocalDateTime)筛选,入参为 yyyy-MM-dd,
        // 起始收敛到当天 00:00:00、结束收敛到当天 23:59:59;仅传一端时另一端自动补齐(查当日约面)。
        LocalDateTime interviewFrom = parseDayStart(interviewDateStart);
        LocalDateTime interviewTo = parseDayEnd(interviewDateEnd);
        LambdaQueryWrapper<HrmResume> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(recruitId != null, HrmResume::getRecruitId, recruitId)
               .and(StringUtils.hasText(keyword), w -> w
                       .like(HrmResume::getName, keyword)
                       .or().like(HrmResume::getPhone, keyword)
                       .or().like(HrmResume::getPositionName, keyword)
                       .or().like(HrmResume::getEducation, keyword)
                       .or().like(HrmResume::getTags, keyword))
               .eq(status != null, HrmResume::getStatus, status)
               .like(StringUtils.hasText(tags), HrmResume::getTags, tags)
               .ge(interviewFrom != null, HrmResume::getFirstInterviewTime, interviewFrom)
               .le(interviewTo != null, HrmResume::getFirstInterviewTime, interviewTo)
               .orderByDesc(HrmResume::getCreateTime);
        return resumeMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
    }

    private LocalDateTime parseDayStart(String day) {
        if (!StringUtils.hasText(day)) {
            return null;
        }
        return LocalDate.parse(day.trim()).atStartOfDay();
    }

    private LocalDateTime parseDayEnd(String day) {
        if (!StringUtils.hasText(day)) {
            return null;
        }
        return LocalDate.parse(day.trim()).atTime(LocalTime.MAX);
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
        if (resume.getStatus() == null) {
            resume.setStatus(0);
        }
        resumeMapper.updateById(resume);
    }
}
