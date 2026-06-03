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
