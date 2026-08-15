package com.zhehang.erp.modules.dashboard.domain.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** 可抄送的同事(已开通账号的员工) */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ColleagueVO {
    /** 员工关联的用户ID(=org_employee.user_id,抄送以此为准) */
    private Long userId;
    /** 姓名 */
    private String name;
    /** 部门名称 */
    private String deptName;
}
