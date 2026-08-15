package com.zhehang.erp.modules.order.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zhehang.erp.modules.order.domain.AddressColleagueVO;
import com.zhehang.erp.modules.order.domain.BizAddressOrder;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface BizAddressOrderMapper extends BaseMapper<BizAddressOrder> {

    /**
     * 可选同事:所有已开通账号的员工(org_employee.user_id 非空、deleted=0),
     * 返回 userId(=org_employee.user_id)、name、deptName(LEFT JOIN sys_dept)。
     * 与 gs/dashboard 的 colleagues 同口径,order 模块内自持,不跨模块依赖。
     */
    @Select("SELECT e.user_id AS userId, e.name AS name, d.dept_name AS deptName "
            + "FROM org_employee e "
            + "LEFT JOIN sys_dept d ON e.dept_id = d.id AND d.deleted = 0 "
            + "WHERE e.deleted = 0 AND e.user_id IS NOT NULL "
            + "ORDER BY e.dept_id, e.name")
    List<AddressColleagueVO> selectColleagues();
}
