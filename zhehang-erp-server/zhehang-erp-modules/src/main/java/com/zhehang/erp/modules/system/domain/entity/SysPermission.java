package com.zhehang.erp.modules.system.domain.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 权限点定义（唯一可配置的业务操作权限口径）。
 *
 * <p>code 采用「业务域:资源:操作」三段式小写，如 {@code hr:salary:view}、{@code order:approve}。
 * 与 {@code sys_menu.perms}（菜单/按钮权限点）互补：菜单权限点挂在菜单树下，
 * 本表的权限点是不挂菜单的"业务操作能力"，二者最终统一进入用户登录权限集合，
 * 由 {@code @perm.hasPermission(code)} / {@link com.zhehang.erp.security.service.PermissionService} 统一判断。</p>
 *
 * <p>带 tenant_id（与 sys_menu 同口径）；关联表 sys_role_permission 不含 tenant_id。</p>
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_permission")
public class SysPermission extends BaseEntity {
    /** 权限点编码 */
    private String code;
    /** 权限点中文名 */
    private String name;
    /** 业务域(hr/order/finance/...) */
    private String domain;
    @TableField("sort")
    private Integer sort;
    /** 说明(对应原硬编码口径) */
    private String remark;
    /** 状态(0启用 1停用) */
    private Integer status;
}
