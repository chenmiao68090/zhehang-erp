package com.zhehang.erp.modules.system.domain.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_dept")
public class SysDept extends BaseEntity {
    private Long parentId;
    /** 祖级列表(逗号分隔的祖先ID串,如 0,1,4),供数据权限 FIND_IN_SET 找子孙部门 */
    private String ancestors;
    private String deptName;
    @TableField("sort")
    private Integer orderNum;
    private String leader;
    /** 部门主管用户ID:审批流"部门主管"节点按发起人所在部门的此字段解析审批人,HR在部门管理维护 */
    private Long leaderId;
    private String phone;
    private String email;
    private Integer status;
}