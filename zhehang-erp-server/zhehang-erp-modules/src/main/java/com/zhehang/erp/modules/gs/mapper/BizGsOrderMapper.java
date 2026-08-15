package com.zhehang.erp.modules.gs.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zhehang.erp.modules.gs.domain.BizGsOrder;
import com.zhehang.erp.modules.gs.domain.GsColleagueVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface BizGsOrderMapper extends BaseMapper<BizGsOrder> {

    /**
     * 可分配的办事员:所有已开通账号的员工(org_employee.user_id 非空、deleted=0),
     * 返回 userId(=org_employee.user_id)、name、deptName(LEFT JOIN sys_dept)。
     * 与 dashboard 的 selectColleagues 同口径,gs 模块内自持,不跨模块依赖。
     */
    @Select("SELECT e.user_id AS userId, e.name AS name, d.dept_name AS deptName "
            + "FROM org_employee e "
            + "LEFT JOIN sys_dept d ON e.dept_id = d.id AND d.deleted = 0 "
            + "WHERE e.deleted = 0 AND e.user_id IS NOT NULL "
            + "ORDER BY e.dept_id, e.name")
    List<GsColleagueVO> selectColleagues();

    /**
     * userId -> 姓名 映射源(列表回显办事员姓名用)。
     */
    @Select("SELECT e.user_id AS userId, e.name AS name, NULL AS deptName "
            + "FROM org_employee e "
            + "WHERE e.deleted = 0 AND e.user_id IS NOT NULL")
    List<GsColleagueVO> selectUserNames();
}
