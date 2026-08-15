package com.zhehang.erp.modules.hrm.domain.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 可选面试官(已开通账号的员工)。
 * 与 dashboard/gs 的 colleagues 同口径:返回 org_employee.user_id、姓名、部门/岗位,
 * 供招聘面试官/评价人下拉选人并落 interviewerId。hrm 模块内自持,不跨模块依赖其 VO。
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HrmColleagueVO {
    /** 员工关联的用户ID(= org_employee.user_id,面试官以此为准) */
    private Long userId;
    /** 姓名 */
    private String name;
    /** 部门名称 */
    private String deptName;
    /** 岗位名称 */
    private String postName;
}
