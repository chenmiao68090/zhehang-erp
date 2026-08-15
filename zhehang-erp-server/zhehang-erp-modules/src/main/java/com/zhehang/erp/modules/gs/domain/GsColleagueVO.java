package com.zhehang.erp.modules.gs.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** 可分配的办事员(已开通账号的员工) */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GsColleagueVO {
    /** 员工关联的用户ID(=org_employee.user_id,分配以此为准) */
    private Long userId;
    /** 姓名 */
    private String name;
    /** 部门名称 */
    private String deptName;
}
