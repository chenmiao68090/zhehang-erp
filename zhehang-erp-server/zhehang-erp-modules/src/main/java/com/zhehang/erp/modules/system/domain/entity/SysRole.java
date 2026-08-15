package com.zhehang.erp.modules.system.domain.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_role")
public class SysRole extends BaseEntity {
    private String roleName;
    private String roleKey;
    @TableField("sort")
    private Integer roleSort;
    private Integer status;
    private String remark;
    /** Data scope (1=all, 2=custom, 3=dept, 4=dept_below, 5=self) */
    private Integer dataScope;
    /** 可见模块:顶层模块路径逗号分隔(如 /customer,/order,/approval);为空=不限制,回退到默认菜单可见性 */
    private String visibleModules;
    /** 角色已分配的完整菜单 ID，仅用于详情返回，不映射 sys_role 表。 */
    @TableField(exist = false)
    private List<Long> menuIds;
}
