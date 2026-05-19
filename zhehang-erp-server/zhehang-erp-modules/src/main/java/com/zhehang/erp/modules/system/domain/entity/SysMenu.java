package com.zhehang.erp.modules.system.domain.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_menu")
public class SysMenu extends BaseEntity {
    private String menuName;
    private Long parentId;
    @TableField("sort")
    private Integer orderNum;
    private String path;
    private String component;
    private String queryParam;
    private Integer menuType;
    private Integer visible;
    private Integer status;
    private String perms;
    private String icon;
    private String remark;
}