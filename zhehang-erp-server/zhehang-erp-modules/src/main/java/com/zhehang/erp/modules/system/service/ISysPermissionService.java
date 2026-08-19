package com.zhehang.erp.modules.system.service;

import com.zhehang.erp.modules.system.domain.entity.SysPermission;

import java.util.List;

public interface ISysPermissionService {

    /** 全部启用权限点（按业务域 + sort 排序）。 */
    List<SysPermission> listAll();

    /** 某角色已关联的权限点 ID。 */
    List<Long> listPermissionIdsByRoleId(Long roleId);

    /** 全量覆盖某角色的权限点关联（先删后插，同事务）。 */
    void saveRolePermissions(Long roleId, List<Long> permissionIds);
}
