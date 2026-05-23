package com.zhehang.erp.modules.hrm.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.zhehang.erp.modules.hrm.domain.entity.HrmRecruit;

public interface IHrmRecruitService extends IService<HrmRecruit> {
    IPage<HrmRecruit> selectPage(int pageNum, int pageSize, String title, Long deptId, Integer status);
    void changeStatus(Long id, Integer status);
}
