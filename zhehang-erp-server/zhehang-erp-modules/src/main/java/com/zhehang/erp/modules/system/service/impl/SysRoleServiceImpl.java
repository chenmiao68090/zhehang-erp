package com.zhehang.erp.modules.system.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.modules.system.domain.dto.RoleDTO;
import com.zhehang.erp.modules.system.domain.entity.SysRole;
import com.zhehang.erp.modules.system.mapper.SysRoleMapper;
import com.zhehang.erp.modules.system.service.ISysRoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SysRoleServiceImpl extends ServiceImpl<SysRoleMapper, SysRole> implements ISysRoleService {

    private final SysRoleMapper roleMapper;

    @Override
    public IPage<SysRole> selectRolePage(int pageNum, int pageSize, String roleName, String roleKey, Integer status) {
        Page<SysRole> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<SysRole> wrapper = new LambdaQueryWrapper<>();
        wrapper.like(StringUtils.hasText(roleName), SysRole::getRoleName, roleName)
               .like(StringUtils.hasText(roleKey), SysRole::getRoleKey, roleKey)
               .eq(status != null, SysRole::getStatus, status)
               .orderByAsc(SysRole::getRoleSort);
        return roleMapper.selectPage(page, wrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void createRole(RoleDTO dto) {
        SysRole role = new SysRole();
        BeanUtils.copyProperties(dto, role);
        roleMapper.insert(role);
        if (!CollectionUtils.isEmpty(dto.getMenuIds())) {
            roleMapper.insertRoleMenus(role.getId(), dto.getMenuIds());
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateRole(RoleDTO dto) {
        SysRole role = new SysRole();
        BeanUtils.copyProperties(dto, role);
        roleMapper.updateById(role);
        roleMapper.deleteRoleMenus(role.getId());
        if (!CollectionUtils.isEmpty(dto.getMenuIds())) {
            roleMapper.insertRoleMenus(role.getId(), dto.getMenuIds());
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteRole(Long roleId) {
        roleMapper.deleteById(roleId);
        roleMapper.deleteRoleMenus(roleId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void assignMenus(Long roleId, List<Long> menuIds) {
        roleMapper.deleteRoleMenus(roleId);
        if (!CollectionUtils.isEmpty(menuIds)) {
            roleMapper.insertRoleMenus(roleId, menuIds);
        }
    }

    @Override
    public void updateDataScope(Long roleId, Integer dataScope) {
        SysRole role = new SysRole();
        role.setId(roleId);
        role.setDataScope(dataScope);
        roleMapper.updateById(role);
    }
}
