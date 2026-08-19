package com.zhehang.erp.modules.auth.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.security.ImpersonationPolicy;
import com.zhehang.erp.modules.system.domain.entity.SysUser;
import com.zhehang.erp.modules.system.mapper.SysPermissionMapper;
import com.zhehang.erp.modules.system.mapper.SysUserMapper;
import com.zhehang.erp.security.domain.LoginUser;
import com.zhehang.erp.security.service.TokenService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final SysUserMapper userMapper;
    private final SysPermissionMapper permissionMapper;
    private final TokenService tokenService;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        SysUser user = userMapper.selectOne(
                new LambdaQueryWrapper<SysUser>().eq(SysUser::getUsername, username)
        );
        if (user == null) {
            log.warn("用户不存在: {}", username);
            throw new UsernameNotFoundException("用户不存在: " + username);
        }
        // 状态只允许 0=正常、1=停用；历史脏值或 null 一律失败收紧，不能绕过停用判断。
        if (!Integer.valueOf(0).equals(user.getStatus())) {
            log.warn("用户已禁用: {}", username);
            throw new UsernameNotFoundException("用户已禁用: " + username);
        }
        if (user.getTenantId() == null) {
            log.warn("用户未绑定租户: {}", username);
            throw new UsernameNotFoundException("账号未绑定公司租户");
        }
        // 纵深兜底：历史数据或旁路写入可能出现“员工已离职、账号仍正常”的不一致。
        // 这里只在登录时按账号所属租户查一次，既阻止新会话，也不把员工表查询放大到每个 HTTP 请求。
        if (userMapper.existsResignedEmployee(user.getId(), user.getTenantId())) {
            log.warn("离职员工账号拒绝登录: userId={}", user.getId());
            throw new UsernameNotFoundException("用户已禁用: " + username);
        }

        return buildLoginUser(user, true);
    }

    /**
     * 为代登录加载与真实登录完全相同的权限快照，但通过专用 SQL 排除密码与 PII。
     */
    public LoginUser loadActiveUserForImpersonation(Long targetUserId, Long tenantId) {
        if (tenantId == null || ImpersonationPolicy.isForbiddenTarget(targetUserId)) {
            throw new BusinessException(403, "目标员工不允许代登录");
        }
        SysUser user = userMapper.selectActiveForImpersonation(targetUserId, tenantId);
        if (user == null || !Integer.valueOf(0).equals(user.getStatus())
                || user.getTenantId() == null || !tenantId.equals(user.getTenantId())) {
            throw new BusinessException(403, "目标员工不存在、已离职或账号已停用");
        }
        return buildLoginUser(user, false);
    }

    private LoginUser buildLoginUser(SysUser user, boolean includePassword) {
        LoginUser loginUser = new LoginUser();
        loginUser.setUserId(user.getId());
        loginUser.setUsername(user.getUsername());
        loginUser.setPassword(includePassword ? user.getPassword() : null);
        loginUser.setTenantId(user.getTenantId());
        loginUser.setEnabled(true);
        loginUser.setDeptId(user.getDeptId());

        // 必须在读取角色/菜单/权限前固定版本；Token签发前会再次校验。
        // 若期间发生收权，本次登录整体失败重试，旧权限不能绑定到新版本。
        tokenService.captureAuthVersion(loginUser);

        // 数据权限:登录时一次性算好"是否管理员"与"数据范围",避免每次查询再查库
        List<String> roleKeys = userMapper.selectRoleKeysByUserId(user.getId());
        // 唯一超管口径：平台根账号或精确 super_admin 角色。
        // 历史 username=admin、boss/sys_admin 不再变成第二套绕过角色页的全权判断。
        boolean isAdmin = Long.valueOf(1L).equals(user.getId())
                || hasExactRole(roleKeys, "super_admin");
        loginUser.setAdmin(isAdmin);
        loginUser.setRoleKeys(roleKeys); // 存角色列表,供角色感知的数据范围(如财务/管理层看全部财务数据)
        if (isAdmin) {
            loginUser.setDataScope(1); // 管理员看全部
        } else {
            Integer minScope = userMapper.selectMinDataScopeByUserId(user.getId());
            loginUser.setDataScope(minScope != null ? minScope : 5); // 无角色兜底为"仅本人"
        }

        List<String> perms = userMapper.selectPermsByUserId(user.getId());
        Set<String> permSet = perms == null ? new HashSet<>() : new HashSet<>(perms);
        // 合并业务权限点（sys_role_permission → sys_permission.code），
        // 与菜单权限点同集合，统一走 @perm.hasPermission(code) 判断。
        List<String> bizPerms = permissionMapper.selectPermissionCodesByUserId(user.getId());
        if (bizPerms != null) {
            permSet.addAll(bizPerms);
        }
        // 全权限通配符与 isAdmin 使用同一唯一口径，普通 boss/sys_admin 必须按角色页真实权限执行。
        if (isAdmin) {
            permSet.add("*:*:*");
        }
        loginUser.setPermissions(permSet);
        loginUser.setAuthorities(permSet.stream()
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList()));
        return loginUser;
    }

    /** 特权角色只认精确标识，禁止使用 super_admin__* 等复制前缀获得管理权。 */
    private boolean hasExactRole(List<String> ownedRoles, String... expectedRoles) {
        if (ownedRoles == null || expectedRoles == null) {
            return false;
        }
        for (String owned : ownedRoles) {
            if (owned == null || owned.isBlank()) {
                continue;
            }
            for (String expected : expectedRoles) {
                if (owned.equals(expected)) {
                    return true;
                }
            }
        }
        return false;
    }
}
