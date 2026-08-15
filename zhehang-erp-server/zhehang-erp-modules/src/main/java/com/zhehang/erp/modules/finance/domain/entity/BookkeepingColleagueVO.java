package com.zhehang.erp.modules.finance.domain.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** 可选负责会计(已开通账号的员工)。finance 模块内自持,不跨模块依赖。 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookkeepingColleagueVO {
    /** 员工关联的用户ID(=org_employee.user_id) */
    private Long userId;
    /** 姓名 */
    private String name;
    /** 部门名称 */
    private String deptName;
}
