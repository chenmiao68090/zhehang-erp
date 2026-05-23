package com.zhehang.erp.modules.hrm.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.zhehang.erp.modules.hrm.domain.entity.HrmTraining;

public interface IHrmTrainingService extends IService<HrmTraining> {
    IPage<HrmTraining> selectPage(int pageNum, int pageSize, String title, Integer status);
    void enroll(Long trainingId, Long employeeId);
}
