package com.zhehang.erp.modules.hrm.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.zhehang.erp.modules.hrm.domain.entity.HrmResume;

public interface IHrmResumeService extends IService<HrmResume> {
    IPage<HrmResume> selectPage(int pageNum, int pageSize, Long recruitId, String name, Integer status);
    void changeStatus(Long id, Integer status, String evaluation);
}
