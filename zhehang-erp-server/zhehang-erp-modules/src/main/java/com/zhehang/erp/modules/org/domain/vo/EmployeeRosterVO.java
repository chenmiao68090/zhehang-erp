package com.zhehang.erp.modules.org.domain.vo;

import lombok.Data;

/**
 * 员工选项/花名册精简视图：只含身份引用、姓名、部门、岗位和在职状态。
 * 严禁增加身份证、手机、住址、附件、账号角色等敏感字段；全员选人不得复用 {@link EmployeeVO}。
 */
@Data
public class EmployeeRosterVO {
    private Long id;
    /** 关联登录账号 ID，审批/任务指派等按用户归属的场景使用。 */
    private Long userId;
    private String name;
    private Long deptId;
    private String deptName;
    private Long postId;
    private String postName;
    /** 员工状态:1在职 2试用 3离职(前端可据此过滤离职) */
    private Integer status;
}
