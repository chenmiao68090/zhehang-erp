package com.zhehang.erp.security.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.zhehang.erp.common.core.domain.AuthUser;
import lombok.Data;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;
import java.util.Set;
import java.util.stream.Collectors;

@Data
public class LoginUser implements UserDetails, AuthUser {
    private static final long serialVersionUID = 1L;

    private Long userId;
    private String username;
    private String password;
    private Long tenantId;
    private Set<String> permissions;

    /** 所属部门 ID(数据权限按部门过滤用) */
    private Long deptId;
    /** 数据范围(1全部 2自定义 3本部门 4本部门及以下 5本人),多角色取数值最小者 */
    private Integer dataScope;
    /** 是否管理员(看全部数据) */
    private boolean admin;
    /** 角色标识列表(sales/finance/dept_manager...),用于角色感知的数据范围 */
    private java.util.List<String> roleKeys;

    @JsonIgnore
    private transient Collection<? extends GrantedAuthority> authorities;

    private boolean enabled = true;

    @Override
    @JsonIgnore
    public Collection<? extends GrantedAuthority> getAuthorities() {
        if (authorities == null) {
            if (permissions == null || permissions.isEmpty()) {
                authorities = Collections.emptyList();
            } else {
                authorities = permissions.stream()
                        .map(SimpleGrantedAuthority::new)
                        .collect(Collectors.toList());
            }
        }
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    @JsonIgnore
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    @JsonIgnore
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    @JsonIgnore
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }
}
