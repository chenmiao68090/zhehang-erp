package com.zhehang.erp.modules.system.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.system.domain.dto.RoleDTO;
import com.zhehang.erp.modules.system.domain.dto.RolePermissionSettingsDTO;
import com.zhehang.erp.modules.system.domain.entity.SysMenu;
import com.zhehang.erp.modules.system.domain.entity.SysRole;
import com.zhehang.erp.modules.system.domain.entity.SysUser;
import com.zhehang.erp.modules.system.mapper.SysMenuMapper;
import com.zhehang.erp.modules.system.mapper.SysRoleMapper;
import com.zhehang.erp.modules.system.mapper.SysUserMapper;
import com.zhehang.erp.modules.system.service.ISysRoleService;
import com.zhehang.erp.security.service.TokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SysRoleServiceImpl extends ServiceImpl<SysRoleMapper, SysRole> implements ISysRoleService {

    private static final Set<String> PRIVILEGED_ROLE_KEYS = Set.of(
            "admin", "super_admin", "sys_admin", "boss"
    );

    private final SysRoleMapper roleMapper;
    private final SysUserMapper userMapper;
    private final SysMenuMapper menuMapper;
    private final TokenService tokenService;

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
    public SysRole getRoleDetail(Long roleId) {
        if (roleId == null) {
            throw new BusinessException("缺少角色ID");
        }
        SysRole role = roleMapper.selectById(roleId);
        if (role == null) {
            throw new BusinessException("角色不存在或无权查看");
        }
        List<Long> menuIds = roleMapper.selectMenuIdsByRoleId(roleId);
        if (menuIds == null) {
            throw new BusinessException("角色菜单权限加载失败");
        }
        role.setMenuIds(menuIds);
        return role;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void createRole(RoleDTO dto) {
        validateRoleKeyForCreate(dto.getRoleKey());
        validateRoleSecurityFields(dto.getStatus(), dto.getDataScope());
        List<Long> menuIds = dto.getMenuIds() == null
                ? List.of() : requireCurrentTenantMenus(dto.getMenuIds());
        SysRole role = new SysRole();
        BeanUtils.copyProperties(dto, role);
        if (roleMapper.insert(role) <= 0) {
            throw new BusinessException("角色创建失败");
        }
        if (!menuIds.isEmpty()) {
            roleMapper.insertRoleMenus(role.getId(), menuIds);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateRole(RoleDTO dto) {
        if (dto.getId() == null) {
            throw new BusinessException("缺少角色ID");
        }
        if (dto.getDataScope() != null || dto.getMenuIds() != null) {
            throw new BusinessException("角色权限请统一通过角色管理权限设置保存");
        }
        validateRoleSecurityFields(dto.getStatus(), dto.getDataScope());
        SysRole existing = requireCurrentTenantRoleForUpdate(dto.getId());
        validateRoleKeyForUpdate(dto.getRoleKey(), existing);
        assertPrivilegedMutationAllowed(existing);
        assertCanonicalRoleConfigurationMutable(existing);
        boolean securityChanged = !Objects.equals(existing.getRoleKey(), dto.getRoleKey())
                || (dto.getStatus() != null && !Objects.equals(existing.getStatus(), dto.getStatus()));
        SysRole role = new SysRole();
        BeanUtils.copyProperties(dto, role);
        if (roleMapper.updateById(role) <= 0) {
            // updateById 带租户条件；未匹配时必须在删角色菜单前终止，
            // 避免使用其他租户的 roleId 跨租户删除 sys_role_menu。
            throw new BusinessException("角色不存在或无权修改");
        }
        if (securityChanged) {
            invalidateRoleMembers(role.getId());
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteRole(Long roleId) {
        SysRole role = requireCurrentTenantRoleForUpdate(roleId);
        assertPrivilegedMutationAllowed(role);
        if (isCanonicalSuperAdmin(role)) {
            throw new BusinessException("超级管理员为系统唯一最高角色，不允许删除");
        }
        int relationCount = roleMapper.countRoleMemberRelations(roleId);
        int deletedUserRelationCount = relationCount == 0 ? 0
                : roleMapper.countDeletedRoleMemberRelations(roleId, requireCurrentTenantId());
        // 仅当前租户已软删除用户的历史关系可自动清理；活跃成员、跨租户关系或物理孤儿
        // 一律失败收紧，防止删除仍被真实账号使用的角色。
        if (relationCount != deletedUserRelationCount) {
            throw new BusinessException("角色仍有成员，请先移除全部成员后再删除");
        }
        if (roleMapper.deleteById(roleId) <= 0) {
            throw new BusinessException("角色不存在或无权删除");
        }
        roleMapper.deleteRoleMenus(roleId);
        roleMapper.deleteRoleMembers(roleId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updatePermissionSettings(RolePermissionSettingsDTO dto) {
        if (dto == null || dto.getRoleId() == null) {
            throw new BusinessException("缺少角色ID");
        }
        if (dto.getDataScope() == null) {
            throw new BusinessException("缺少数据范围");
        }
        if (dto.getMenuIds() == null) {
            throw new BusinessException("缺少操作权限数据");
        }
        String normalizedModules = normalizeVisibleModules(dto.getVisibleModules());
        if (dto.getVisibleModules() != null && normalizedModules == null) {
            throw new BusinessException("至少保留一个可见模块；全部开启请使用不限制");
        }
        validateDataScope(dto.getDataScope());
        SysRole role = requireCurrentTenantRoleForUpdate(dto.getRoleId());
        assertPrivilegedMutationAllowed(role);
        assertCanonicalRoleConfigurationMutable(role);
        List<Long> normalizedMenuIds = requireCurrentTenantMenus(dto.getMenuIds());
        boolean scopeChanged = !Objects.equals(role.getDataScope(), dto.getDataScope());
        boolean modulesChanged = !sameVisibleModules(role.getVisibleModules(), normalizedModules);
        boolean menusChanged = !sameIds(requireRoleMenuIds(dto.getRoleId()), normalizedMenuIds);
        if (!scopeChanged && !modulesChanged && !menusChanged) {
            return;
        }
        com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper<SysRole> wrapper =
                new com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper<SysRole>()
                        .eq(SysRole::getId, dto.getRoleId());
        if (scopeChanged) {
            wrapper.set(SysRole::getDataScope, dto.getDataScope());
        }
        if (modulesChanged) {
            wrapper.set(SysRole::getVisibleModules, normalizedModules);
        }
        if (scopeChanged || modulesChanged) {
            if (roleMapper.update(null, wrapper) <= 0) {
                throw new BusinessException("角色不存在或无权修改");
            }
        }
        if (menusChanged) {
            roleMapper.deleteRoleMenus(dto.getRoleId());
            if (!normalizedMenuIds.isEmpty()) {
                roleMapper.insertRoleMenus(dto.getRoleId(), normalizedMenuIds);
            }
        }
        invalidateRoleMembers(dto.getRoleId());
    }

    @Override
    public List<String> resolveVisibleModules(List<String> roleKeys) {
        if (CollectionUtils.isEmpty(roleKeys)) {
            return List.of();
        }
        List<SysRole> roles = roleMapper.selectList(new LambdaQueryWrapper<SysRole>()
                .in(SysRole::getRoleKey, roleKeys));
        if (CollectionUtils.isEmpty(roles)) {
            return List.of();
        }
        java.util.LinkedHashSet<String> union = new java.util.LinkedHashSet<>();
        for (SysRole r : roles) {
            String vm = r.getVisibleModules();
            // 任一角色未配置(空)=不限制,直接放开(多角色叠加放大权限)
            if (!StringUtils.hasText(vm)) {
                return null;
            }
            for (String p : vm.split(",")) {
                String t = p.trim();
                if (!t.isEmpty()) {
                    union.add(t);
                }
            }
        }
        return new java.util.ArrayList<>(union);
    }

    @Override
    public List<java.util.Map<String, Object>> listRoleMembers(Long roleId) {
        requireCurrentTenantRole(roleId);
        return roleMapper.selectRoleMembers(roleId, requireCurrentTenantId());
    }

    @Override
    public List<java.util.Map<String, Object>> listMemberCandidates(String keyword) {
        return roleMapper.selectMemberCandidates(
                StringUtils.hasText(keyword) ? keyword.trim() : null,
                requireCurrentTenantId());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public int addRoleMembers(Long roleId, List<Long> userIds) {
        SysRole role = requireCurrentTenantRoleForUpdate(roleId);
        assertPrivilegedMutationAllowed(role);
        if (CollectionUtils.isEmpty(userIds)) {
            return 0;
        }
        List<Long> normalizedUserIds = requireCurrentTenantUsers(userIds);
        int added = 0;
        List<Long> addedUserIds = new ArrayList<>();
        for (Long uid : normalizedUserIds) {
            int inserted = roleMapper.insertRoleMemberIfAbsent(roleId, uid);
            added += inserted;
            if (inserted > 0) {
                addedUserIds.add(uid);
            }
        }
        invalidateUsersSafely(addedUserIds);
        return added;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void removeRoleMember(Long roleId, Long userId) {
        SysRole role = requireCurrentTenantRoleForUpdate(roleId);
        assertPrivilegedMutationAllowed(role);
        if (userId == null) {
            throw new BusinessException("用户ID不能为空");
        }
        requireCurrentTenantUsers(List.of(userId));
        if (roleMapper.deleteRoleMember(roleId, userId) > 0) {
            invalidateUsersSafely(List.of(userId));
        }
    }

    /**
     * 复制出的普通角色可继承模板语义，但绝不能用特权角色前缀制造新管理员。
     */
    private void validateRoleKeyForCreate(String roleKey) {
        if (!StringUtils.hasText(roleKey)) {
            return;
        }
        String normalized = roleKey.trim().toLowerCase(Locale.ROOT);
        int separator = normalized.indexOf("__");
        if (separator > 0 && PRIVILEGED_ROLE_KEYS.contains(normalized.substring(0, separator))) {
            throw new BusinessException("管理员、超级管理员和老板角色不允许复制");
        }
        if (PRIVILEGED_ROLE_KEYS.contains(normalized)) {
            throw new BusinessException("系统只保留唯一超级管理员角色，不允许新建第二个特权角色");
        }
    }

    private void validateRoleKeyForUpdate(String requestedRoleKey, SysRole existing) {
        if (!StringUtils.hasText(requestedRoleKey)) {
            return;
        }
        String requested = requestedRoleKey.trim().toLowerCase(Locale.ROOT);
        String current = existing == null || existing.getRoleKey() == null
                ? "" : existing.getRoleKey().trim().toLowerCase(Locale.ROOT);
        int separator = requested.indexOf("__");
        if (separator > 0 && PRIVILEGED_ROLE_KEYS.contains(requested.substring(0, separator))) {
            throw new BusinessException("特权角色不允许复制或改造");
        }
        if (PRIVILEGED_ROLE_KEYS.contains(requested) && !requested.equals(current)) {
            throw new BusinessException("不允许把普通角色改为管理员、老板或超级管理员");
        }
        if (PRIVILEGED_ROLE_KEYS.contains(current) && !requested.equals(current)) {
            throw new BusinessException("系统特权角色标识不允许修改");
        }
    }

    /** 角色表由租户插件过滤，再显式核对 tenantId，避免关联表越租户。 */
    private SysRole requireCurrentTenantRole(Long roleId) {
        Long tenantId = requireCurrentTenantId();
        if (roleId == null) {
            throw new BusinessException("缺少角色ID");
        }
        SysRole role = roleMapper.selectById(roleId);
        if (role == null || !tenantId.equals(role.getTenantId())) {
            throw new BusinessException("角色不存在或无权管理成员");
        }
        return role;
    }

    /** 用户表由租户插件过滤，要求外部传入的每一个 ID 都完整命中当前租户。 */
    private List<Long> requireCurrentTenantUsers(List<Long> userIds) {
        Long tenantId = requireCurrentTenantId();
        if (CollectionUtils.isEmpty(userIds) || userIds.stream().anyMatch(Objects::isNull)) {
            throw new BusinessException("用户ID不能为空");
        }
        List<Long> normalizedUserIds = userIds.stream().distinct().toList();
        List<SysUser> users = userMapper.selectBatchIds(normalizedUserIds);
        Set<Long> validUserIds = users == null ? Set.of() : users.stream()
                .filter(user -> tenantId.equals(user.getTenantId()))
                .map(SysUser::getId)
                .collect(Collectors.toSet());
        if (validUserIds.size() != normalizedUserIds.size()
                || !validUserIds.containsAll(normalizedUserIds)) {
            throw new BusinessException("存在用户不存在或不属于当前租户");
        }
        return normalizedUserIds;
    }

    /** 菜单表由租户插件过滤，再显式逐项核对，任何非法 ID 都整单拒绝。 */
    private List<Long> requireCurrentTenantMenus(List<Long> menuIds) {
        Long tenantId = requireCurrentTenantId();
        if (menuIds != null && menuIds.stream().anyMatch(Objects::isNull)) {
            throw new BusinessException("菜单权限ID不能为空");
        }
        List<Long> normalizedMenuIds = menuIds == null ? List.of() : menuIds.stream()
                .distinct()
                .sorted()
                .toList();
        if (normalizedMenuIds.isEmpty()) {
            return normalizedMenuIds;
        }
        // 与菜单更新/删除共用菜单行锁，并按固定顺序持锁到角色事务提交，
        // 防止校验通过后、写入 sys_role_menu 前菜单被并发删除。
        for (Long menuId : normalizedMenuIds) {
            SysMenu lockedMenu = menuMapper.selectMenuForUpdate(menuId, tenantId);
            if (lockedMenu == null
                    || !menuId.equals(lockedMenu.getId())
                    || !tenantId.equals(lockedMenu.getTenantId())) {
                throw new BusinessException("存在菜单不存在或不属于当前租户");
            }
        }
        return normalizedMenuIds;
    }

    private List<Long> requireRoleMenuIds(Long roleId) {
        List<Long> menuIds = roleMapper.selectMenuIdsByRoleId(roleId);
        if (menuIds == null) {
            throw new BusinessException("角色菜单权限加载失败");
        }
        return menuIds;
    }

    private boolean sameIds(List<Long> left, List<Long> right) {
        return new LinkedHashSet<>(left).equals(new LinkedHashSet<>(right));
    }

    private String normalizeVisibleModules(String visibleModules) {
        if (!StringUtils.hasText(visibleModules)) {
            return null;
        }
        LinkedHashSet<String> modules = new LinkedHashSet<>();
        for (String part : visibleModules.split(",")) {
            String module = part.trim();
            if (!module.isEmpty()) {
                modules.add(module);
            }
        }
        return modules.isEmpty() ? null : String.join(",", modules);
    }

    private boolean sameVisibleModules(String left, String right) {
        String normalizedLeft = normalizeVisibleModules(left);
        String normalizedRight = normalizeVisibleModules(right);
        if (normalizedLeft == null || normalizedRight == null) {
            return Objects.equals(normalizedLeft, normalizedRight);
        }
        return Set.copyOf(List.of(normalizedLeft.split(",")))
                .equals(Set.copyOf(List.of(normalizedRight.split(","))));
    }

    private void invalidateRoleMembers(Long roleId) {
        List<Long> userIds = roleMapper.selectUserIdsByRoleId(roleId, requireCurrentTenantId());
        invalidateUsersSafely(userIds);
    }

    /**
     * 事务内先失效一次，Redis 失败会抛出并让数据库回滚；提交后再失效一次，
     * 封住事务未提交期间按旧权限重新登录/续签并绑定第一次新版本的并发窗口。
     */
    private void invalidateUsersSafely(List<Long> userIds) {
        if (CollectionUtils.isEmpty(userIds)) {
            return;
        }
        List<Long> normalizedUserIds = userIds.stream()
                .filter(Objects::nonNull)
                .distinct()
                .toList();
        if (normalizedUserIds.isEmpty()) {
            return;
        }
        normalizedUserIds.forEach(tokenService::invalidateLoginUserSafely);
    }

    private SysRole requireCurrentTenantRoleForUpdate(Long roleId) {
        Long tenantId = requireCurrentTenantId();
        if (roleId == null) {
            throw new BusinessException("缺少角色ID");
        }
        SysRole role = roleMapper.selectRoleForUpdate(roleId, tenantId);
        if (role == null || !tenantId.equals(role.getTenantId())) {
            throw new BusinessException("角色不存在或无权管理成员");
        }
        return role;
    }

    private void validateRoleSecurityFields(Integer status, Integer dataScope) {
        if (status != null && status != 0 && status != 1) {
            throw new BusinessException("角色状态只能为启用或停用");
        }
        if (dataScope != null) {
            validateDataScope(dataScope);
        }
    }

    private void validateDataScope(Integer dataScope) {
        if (dataScope == null || dataScope < 1 || dataScope > 5) {
            throw new BusinessException("数据范围必须为1到5");
        }
    }

    private Long requireCurrentTenantId() {
        Long tenantId = SecurityUtils.getCurrentTenantId();
        if (tenantId == null) {
            throw new BusinessException("无法识别当前租户");
        }
        return tenantId;
    }

    private void assertPrivilegedMutationAllowed(SysRole role) {
        String roleKey = role == null || role.getRoleKey() == null
                ? "" : role.getRoleKey().trim().toLowerCase(Locale.ROOT);
        if (PRIVILEGED_ROLE_KEYS.contains(roleKey) && !canManagePrivilegedRoles()) {
            throw new AccessDeniedException("仅超级管理员可修改特权角色或其成员");
        }
    }

    private boolean isCanonicalSuperAdmin(SysRole role) {
        return role != null && "super_admin".equals(
                role.getRoleKey() == null ? "" : role.getRoleKey().trim().toLowerCase(Locale.ROOT));
    }

    private void assertCanonicalRoleConfigurationMutable(SysRole role) {
        if (isCanonicalSuperAdmin(role)) {
            throw new BusinessException("超级管理员为系统唯一最高角色，其权限配置不可修改");
        }
    }

    private boolean canManagePrivilegedRoles() {
        return SecurityUtils.canManageTenantSuperAdmin();
    }
}
