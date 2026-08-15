package com.zhehang.erp.modules.feigetask.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.system.domain.entity.SysDept;
import com.zhehang.erp.modules.system.domain.entity.SysRole;
import com.zhehang.erp.modules.system.domain.entity.SysUser;
import com.zhehang.erp.modules.system.mapper.SysDeptMapper;
import com.zhehang.erp.modules.system.mapper.SysRoleMapper;
import com.zhehang.erp.modules.system.mapper.SysUserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class FeigeTaskDirectoryService {

    private final SysUserMapper userMapper;
    private final SysRoleMapper roleMapper;
    private final SysDeptMapper deptMapper;
    private final FeigeTaskAccessService access;

    public List<Map<String, Object>> staffOptions() {
        Long tenantId = SecurityUtils.getCurrentTenantId();
        return userMapper.selectList(new LambdaQueryWrapper<SysUser>()
                        .eq(SysUser::getStatus, 0)
                        .orderByAsc(SysUser::getId))
                .stream()
                .filter(user -> access.canAccessUser(user.getId())
                        || access.canClaimDepartment(user.getDeptId()))
                .filter(user -> !userMapper.existsResignedEmployee(user.getId(), tenantId))
                .map(this::staffView)
                .toList();
    }

    public List<Map<String, Object>> roleTree() {
        return roleMapper.selectList(new LambdaQueryWrapper<SysRole>()
                        .eq(SysRole::getStatus, 0)
                        .orderByAsc(SysRole::getRoleSort)
                        .orderByAsc(SysRole::getId))
                .stream().map(role -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("id", role.getId());
                    row.put("name", role.getRoleName());
                    row.put("key", role.getRoleKey());
                    row.put("children", List.of());
                    return row;
                }).toList();
    }

    private Map<String, Object> staffView(SysUser user) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", user.getId());
        row.put("name", access.displayName(user));
        row.put("deptId", user.getDeptId());
        SysDept dept = user.getDeptId() == null ? null : deptMapper.selectById(user.getDeptId());
        row.put("deptName", dept == null ? null : dept.getDeptName());
        List<Long> roleIds = userMapper.selectRoleIdsByUserId(user.getId());
        if (roleIds != null) {
            roleIds.stream().map(roleMapper::selectById).filter(Objects::nonNull)
                    .filter(role -> Integer.valueOf(0).equals(role.getStatus()))
                    .findFirst().ifPresent(role -> {
                        row.put("roleId", role.getId());
                        row.put("roleName", role.getRoleName());
                    });
        }
        return row;
    }
}
