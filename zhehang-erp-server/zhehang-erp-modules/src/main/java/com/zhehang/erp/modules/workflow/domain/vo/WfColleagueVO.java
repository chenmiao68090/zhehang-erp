package com.zhehang.erp.modules.workflow.domain.vo;

import lombok.Data;

/**
 * 审批选人下拉项(抄送/转交用):已开通账号的员工。
 */
@Data
public class WfColleagueVO {
    /** 用户ID(org_employee.user_id) */
    private Long userId;
    /** 姓名 */
    private String name;
    /** 部门名 */
    private String deptName;
}
