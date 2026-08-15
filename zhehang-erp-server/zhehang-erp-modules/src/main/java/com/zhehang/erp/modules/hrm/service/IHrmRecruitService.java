package com.zhehang.erp.modules.hrm.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.zhehang.erp.modules.hrm.domain.entity.HrmRecruit;
import com.zhehang.erp.modules.hrm.domain.vo.HrmColleagueVO;

import java.util.List;

public interface IHrmRecruitService extends IService<HrmRecruit> {
    IPage<HrmRecruit> selectPage(int pageNum, int pageSize, String title, Long deptId, Integer status);
    void changeStatus(Long id, Integer status);

    /** 可选面试官/评价人(已开通账号的员工) */
    List<HrmColleagueVO> listColleagues();
}
