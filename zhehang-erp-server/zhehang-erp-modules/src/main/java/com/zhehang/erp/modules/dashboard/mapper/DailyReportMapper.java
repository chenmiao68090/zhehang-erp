package com.zhehang.erp.modules.dashboard.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zhehang.erp.modules.dashboard.domain.entity.DailyReport;
import com.zhehang.erp.modules.dashboard.domain.vo.ColleagueVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface DailyReportMapper extends BaseMapper<DailyReport> {

    /**
     * 可抄送的同事:所有已开通账号的员工(org_employee.user_id 非空、deleted=0),
     * 返回 userId(=org_employee.user_id)、name、deptName(LEFT JOIN sys_dept)。
     * 按 dept_id、name 排序。
     */
    @Select("SELECT e.user_id AS userId, e.name AS name, d.dept_name AS deptName "
            + "FROM org_employee e "
            + "LEFT JOIN sys_dept d ON e.dept_id = d.id AND d.deleted = 0 "
            + "WHERE e.deleted = 0 AND e.user_id IS NOT NULL "
            + "ORDER BY e.dept_id, e.name")
    List<ColleagueVO> selectColleagues();
}
