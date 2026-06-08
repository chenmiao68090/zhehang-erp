package com.zhehang.erp.modules.auth.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.zhehang.erp.modules.system.domain.entity.SysUser;
import com.zhehang.erp.modules.system.mapper.SysUserMapper;
import com.zhehang.erp.security.domain.LoginUser;
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

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        SysUser user = userMapper.selectOne(
                new LambdaQueryWrapper<SysUser>().eq(SysUser::getUsername, username)
        );
        if (user == null) {
            log.warn("用户不存在: {}", username);
            throw new UsernameNotFoundException("用户不存在: " + username);
        }
        if (user.getStatus() != null && user.getStatus() == 1) {
            log.warn("用户已禁用: {}", username);
            throw new UsernameNotFoundException("用户已禁用: " + username);
        }

        LoginUser loginUser = new LoginUser();
        loginUser.setUserId(user.getId());
        loginUser.setUsername(user.getUsername());
        loginUser.setPassword(user.getPassword());
        loginUser.setTenantId(user.getTenantId());
        loginUser.setEnabled(true);
        loginUser.setDeptId(user.getDeptId());

        // 数据权限:登录时一次性算好"是否管理员"与"数据范围",避免每次查询再查库
        List<String> roleKeys = userMapper.selectRoleKeysByUserId(user.getId());
        boolean isAdmin = Long.valueOf(1L).equals(user.getId())
                || "admin".equals(user.getUsername())
                || (roleKeys != null && (roleKeys.contains("super_admin") || roleKeys.contains("sys_admin")));
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
        if (Long.valueOf(1L).equals(user.getId()) || "admin".equals(user.getUsername())) {
            permSet.add("*:*:*");
        }
        loginUser.setPermissions(permSet);
        loginUser.setAuthorities(permSet.stream()
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList()));
        return loginUser;
    }
}
