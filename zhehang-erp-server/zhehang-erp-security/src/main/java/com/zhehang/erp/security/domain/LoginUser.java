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

    @JsonIgnore
    private transient Collection<? extends GrantedAuthority> authorities;

    private boolean enabled = true;

    @Override
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