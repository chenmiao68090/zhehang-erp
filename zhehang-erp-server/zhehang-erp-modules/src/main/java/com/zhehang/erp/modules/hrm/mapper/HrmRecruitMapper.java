package com.zhehang.erp.modules.hrm.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zhehang.erp.modules.hrm.domain.entity.HrmRecruit;
import com.zhehang.erp.modules.hrm.domain.vo.HrmColleagueVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface HrmRecruitMapper extends BaseMapper<HrmRecruit> {

    /**
     * 可选面试官/评价人:所有已开通账号的员工(org_employee.user_id 非空、deleted=0),
     * 返回 userId(= org_employee.user_id)、name、deptName、postName(LEFT JOIN sys_dept / org_post)。
     * 与 dashboard/gs 的 selectColleagues 同口径,hrm 模块内自持,不跨模块依赖。
     */
    @Select("SELECT e.user_id AS userId, e.name AS name, d.dept_name AS deptName, p.post_name AS postName "
            + "FROM org_employee e "
            + "LEFT JOIN sys_dept d ON e.dept_id = d.id AND d.deleted = 0 "
            + "LEFT JOIN org_post p ON e.post_id = p.id AND p.deleted = 0 "
            + "WHERE e.deleted = 0 AND e.user_id IS NOT NULL "
            + "ORDER BY e.dept_id, e.name")
    List<HrmColleagueVO> selectColleagues();
}
