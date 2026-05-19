package com.zhehang.erp.modules.system.domain.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

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
}
