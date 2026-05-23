package com.zhehang.erp.modules.system.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.zhehang.erp.modules.system.domain.dto.RoleDTO;
import com.zhehang.erp.modules.system.domain.entity.SysRole;

import java.util.List;

public interface ISysRoleService extends IService<SysRole> {
    IPage<SysRole> selectRolePage(int pageNum, int pageSize, String roleName);
    void createRole(RoleDTO dto);
    void updateRole(RoleDTO dto);
    void deleteRole(Long roleId);
    void assignMenus(Long roleId, List<Long> menuIds);
    void updateDataScope(Long roleId, Integer dataScope);
}
