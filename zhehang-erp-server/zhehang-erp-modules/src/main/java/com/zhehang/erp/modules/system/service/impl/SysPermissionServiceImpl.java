package com.zhehang.erp.modules.system.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.modules.system.domain.entity.SysPermission;
import com.zhehang.erp.modules.system.mapper.SysPermissionMapper;
import com.zhehang.erp.modules.system.service.ISysPermissionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;

@Service
public class SysPermissionServiceImpl extends ServiceImpl<SysPermissionMapper, SysPermission>
        implements ISysPermissionService {

    @Override
    public List<SysPermission> listAll() {
        return list(new LambdaQueryWrapper<SysPermission>()
                .eq(SysPermission::getStatus, 0)
                .orderByAsc(SysPermission::getDomain)
                .orderByAsc(SysPermission::getSort));
    }

    @Override
    public List<Long> listPermissionIdsByRoleId(Long roleId) {
        return baseMapper.selectPermissionIdsByRoleId(roleId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void saveRolePermissions(Long roleId, List<Long> permissionIds) {
        baseMapper.deleteRolePermissions(roleId);
        if (permissionIds != null && !permissionIds.isEmpty()) {
            baseMapper.insertRolePermissions(roleId, permissionIds);
        }
    }
}
