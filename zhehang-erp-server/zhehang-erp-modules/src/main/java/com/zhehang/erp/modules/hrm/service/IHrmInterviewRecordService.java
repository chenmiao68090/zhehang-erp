package com.zhehang.erp.modules.hrm.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.zhehang.erp.modules.hrm.domain.entity.HrmInterviewRecord;

import java.util.List;

public interface IHrmInterviewRecordService extends IService<HrmInterviewRecord> {
    List<HrmInterviewRecord> listByResumeId(Long resumeId);

    void createAndApply(HrmInterviewRecord record);
}
