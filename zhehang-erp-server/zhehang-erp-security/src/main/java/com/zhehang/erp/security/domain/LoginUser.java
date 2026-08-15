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

    /** 本次普通登录会话是否已经通过 MFA；旧会话反序列化后默认为 false。 */
    private boolean mfaVerified;

    /** 全局权限版本,角色/菜单变更后用于让旧登录态失效 */
    private Long authVersion = 0L;
    /** 用户权限版本,单个账号角色/状态/密码变更后用于让旧登录态失效 */
    private Long userAuthVersion = 0L;
    /** 是否已在读取角色/权限前捕获版本快照，防止旧权限绑定到变更后的新版本 */
    private boolean authVersionBound;

    /** 代登录实际操作人；普通登录为空并回退到 userId/username。 */
    private Long actorUserId;
    private String actorUsername;
    /** 签发代登录令牌时使用的原管理员稳定登录会话。 */
    private String actorSessionId;
    /** 原管理员自己的权限版本；与目标员工版本同时校验。 */
    private Long actorUserAuthVersion = 0L;
    /** 独立代登录会话及固定有效期（毫秒时间戳）。 */
    private String impersonationSessionId;
    /** 浏览器当前标签页随机标识；每个代登录请求必须通过请求头同时证明。 */
    private String impersonationTabId;
    private Long impersonationStartTime;
    private Long impersonationExpireTime;

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
    public Long getActorUserId() {
        return actorUserId != null ? actorUserId : userId;
    }

    @Override
    public String getActorUsername() {
        return actorUsername != null ? actorUsername : username;
    }

    @Override
    @JsonIgnore
    public Long getEffectiveUserId() {
        return userId;
    }

    @Override
    @JsonIgnore
    public boolean isImpersonating() {
        return impersonationSessionId != null && !impersonationSessionId.isBlank();
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
