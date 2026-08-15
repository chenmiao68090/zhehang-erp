package com.zhehang.erp.modules.dashboard.service;

import com.zhehang.erp.modules.dashboard.domain.entity.DailyReport;
import com.zhehang.erp.modules.dashboard.domain.vo.ColleagueVO;
import com.zhehang.erp.modules.dashboard.domain.vo.DailyReportVO;

import java.util.List;

public interface IDailyReportService {
    /** 当前登录用户最近的日报(最多30条) */
    List<DailyReport> listMine();

    /** 新增一条日报(自动归属当前用户) */
    boolean add(DailyReport report);

    /** 删除自己的某条日报(非本人无效) */
    boolean removeMine(Long id);

    /** 可抄送的同事:所有已开通账号的员工(userId/name/deptName) */
    List<ColleagueVO> listColleagues();

    /** 抄送给当前登录用户的日报(最多30条,含作者姓名) */
    List<DailyReportVO> listCcToMe();
}
