package com.zhehang.erp.modules.finance.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zhehang.erp.modules.finance.domain.entity.BookkeepingColleagueVO;
import com.zhehang.erp.modules.finance.domain.entity.FinBookkeepingLedger;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/** 代账客户台账 Mapper(纯 MyBatis-Plus + 自持选人查询,无 XML) */
@Mapper
public interface FinBookkeepingLedgerMapper extends BaseMapper<FinBookkeepingLedger> {

    /**
     * 可选负责会计:所有已开通账号的员工(org_employee.user_id 非空、deleted=0)。
     * 与 gs 的 selectColleagues 同口径,finance 模块内自持,不跨模块依赖。
     */
    @Select("SELECT e.user_id AS userId, e.name AS name, d.dept_name AS deptName "
            + "FROM org_employee e "
            + "LEFT JOIN sys_dept d ON e.dept_id = d.id AND d.deleted = 0 "
            + "WHERE e.deleted = 0 AND e.user_id IS NOT NULL "
            + "ORDER BY e.dept_id, e.name")
    List<BookkeepingColleagueVO> selectColleagues();
}
