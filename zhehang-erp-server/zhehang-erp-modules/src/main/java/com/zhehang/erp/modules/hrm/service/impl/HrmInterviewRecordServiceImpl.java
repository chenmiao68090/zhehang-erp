package com.zhehang.erp.modules.hrm.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.hrm.domain.entity.HrmInterviewRecord;
import com.zhehang.erp.modules.hrm.domain.entity.HrmResume;
import com.zhehang.erp.modules.hrm.mapper.HrmInterviewRecordMapper;
import com.zhehang.erp.modules.hrm.mapper.HrmResumeMapper;
import com.zhehang.erp.modules.hrm.service.IHrmInterviewRecordService;
import com.zhehang.erp.modules.hrm.service.IHrmOnboardingService;
import com.zhehang.erp.modules.im.service.ImBusinessNotificationPublisher;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HrmInterviewRecordServiceImpl extends ServiceImpl<HrmInterviewRecordMapper, HrmInterviewRecord> implements IHrmInterviewRecordService {

    private final HrmInterviewRecordMapper interviewRecordMapper;
    private final HrmResumeMapper resumeMapper;
    private final IHrmOnboardingService onboardingService;
    private final ImBusinessNotificationPublisher notificationPublisher;

    @Override
    public List<HrmInterviewRecord> listByResumeId(Long resumeId) {
        return interviewRecordMapper.selectList(new LambdaQueryWrapper<HrmInterviewRecord>()
                .eq(HrmInterviewRecord::getResumeId, resumeId)
                .orderByDesc(HrmInterviewRecord::getInterviewTime)
                .orderByDesc(HrmInterviewRecord::getCreateTime));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void createAndApply(HrmInterviewRecord record) {
        if (record.getResumeId() == null) {
            throw new BusinessException("候选人不能为空");
        }

        HrmResume resume = resumeMapper.selectById(record.getResumeId());
        if (resume == null) {
            throw new BusinessException("候选人不存在");
        }

        if (record.getRecruitId() == null) {
            record.setRecruitId(resume.getRecruitId());
        }
        interviewRecordMapper.insert(record);

        applyResumeSnapshot(resume, record);
        resumeMapper.updateById(resume);
        if ("pass".equals(record.getResult())) {
            onboardingService.createFromResume(resume.getId());
        } else if ("reject".equals(record.getResult()) || "not_join".equals(record.getResult())) {
            // 流转里淘汰/未入职 → 同步取消该候选人已生成的待入职记录,
            // 否则待入职列表里仍会残留该候选人(飞书 217)。
            onboardingService.cancelByResume(resume.getId());
        }

        // 面试官被分配到面试 → 与面试记录同事务登记 IM outbox。
        if (record.getInterviewerId() != null) {
            String candidate = StringUtils.hasText(resume.getName()) ? resume.getName().trim() : "候选人";
            notificationPublisher.publish(ImBusinessNotificationPublisher.Notice.builder()
                    .eventId("hrm-interview:" + record.getId() + ":assigned:" + record.getInterviewerId())
                    .eventType("hrm_interview.assigned")
                    .title("新面试待评价")
                    .text("候选人【" + candidate + "】已安排由你面试")
                    .recipientIds(List.of(record.getInterviewerId()))
                    .businessType("hrm_interview")
                    .businessId(record.getId())
                    .currentStatus("scheduled")
                    .responsibleId(record.getInterviewerId())
                    .requirement("请按约面时间完成面试并及时登记评价")
                    .actionLabel("去评价")
                    .actionUrl("/hrm/recruit")
                    .build());
        }
    }

    private void applyResumeSnapshot(HrmResume resume, HrmInterviewRecord record) {
        if (record.getRecruitId() != null) {
            resume.setRecruitId(record.getRecruitId());
        }
        if (StringUtils.hasText(record.getInterviewer())) {
            resume.setInterviewer(record.getInterviewer());
        }
        if (record.getInterviewerId() != null) {
            resume.setInterviewerId(record.getInterviewerId());
        }
        if (StringUtils.hasText(record.getEvaluation())) {
            resume.setEvaluation(record.getEvaluation());
        }

        String stage = record.getStage();
        if ("first".equals(stage) && record.getInterviewTime() != null) {
            resume.setFirstInterviewTime(record.getInterviewTime());
        }
        if ("re_interview".equals(stage) && record.getInterviewTime() != null) {
            resume.setReInterviewTime(record.getInterviewTime());
            resume.setNeedReInterview(true);
        }
        if (record.getNextInterviewTime() != null) {
            resume.setReInterviewTime(record.getNextInterviewTime());
            resume.setNeedReInterview(true);
        }

        String result = record.getResult();
        if ("first_pass".equals(result) || "next_round".equals(result)) {
            resume.setStatus(4);
        } else if ("pass".equals(result)) {
            resume.setStatus(7);
        } else if ("hired".equals(result)) {
            resume.setStatus(5);
        } else if ("reject".equals(result)) {
            resume.setStatus(3);
            resume.setRejectReason(record.getRejectReason());
        } else if ("not_join".equals(result)) {
            resume.setStatus(6);
            resume.setNotJoinReason(record.getRejectReason());
        } else if (resume.getStatus() == null) {
            resume.setStatus(0);
        }
    }
}
