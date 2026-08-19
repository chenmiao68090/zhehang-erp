package com.zhehang.erp.modules.auth;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.auth.service.UserDetailsServiceImpl;
import com.zhehang.erp.modules.system.domain.entity.SysUser;
import com.zhehang.erp.modules.system.mapper.SysPermissionMapper;
import com.zhehang.erp.modules.system.mapper.SysUserMapper;
import com.zhehang.erp.security.domain.LoginUser;
import com.zhehang.erp.security.service.TokenService;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class UserDetailsRoleInheritanceTest {

    @Test
    void copiedSuperAdminRoleNeverInheritsAdministratorSemantics() {
        SysUserMapper mapper = mock(SysUserMapper.class);
        TokenService tokenService = mock(TokenService.class);
        SysUser user = new SysUser();
        user.setId(21L);
        user.setUsername("owner-copy");
        user.setPassword("encoded");
        user.setStatus(0);
        user.setTenantId(1L);

        when(mapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(user);
        when(mapper.selectRoleKeysByUserId(21L)).thenReturn(List.of("super_admin__owner"));
        when(mapper.selectMinDataScopeByUserId(21L)).thenReturn(5);
        when(mapper.selectPermsByUserId(21L)).thenReturn(Collections.emptyList());

        LoginUser result = (LoginUser) userDetailsService(mapper, tokenService)
                .loadUserByUsername("owner-copy");

        assertFalse(result.isAdmin());
        assertEquals(5, result.getDataScope());
        assertFalse(result.getPermissions().contains("*:*:*"));
        org.mockito.InOrder ordered = inOrder(tokenService, mapper);
        ordered.verify(tokenService).captureAuthVersion(result);
        ordered.verify(mapper).selectRoleKeysByUserId(21L);
    }

    @Test
    void exactSuperAdminRoleStillKeepsAdministratorSemantics() {
        SysUserMapper mapper = mock(SysUserMapper.class);
        TokenService tokenService = mock(TokenService.class);
        SysUser user = new SysUser();
        user.setId(22L);
        user.setUsername("platform-admin");
        user.setPassword("encoded");
        user.setStatus(0);
        user.setTenantId(1L);

        when(mapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(user);
        when(mapper.selectRoleKeysByUserId(22L)).thenReturn(List.of("super_admin"));
        when(mapper.selectPermsByUserId(22L)).thenReturn(Collections.emptyList());

        LoginUser result = (LoginUser) userDetailsService(mapper, tokenService)
                .loadUserByUsername("platform-admin");

        assertTrue(result.isAdmin());
        assertEquals(1, result.getDataScope());
        assertTrue(result.getPermissions().contains("*:*:*"));
        verify(tokenService).captureAuthVersion(result);
    }

    @Test
    void legacyBossAndSysAdminKeysDoNotBypassRolePagePermissions() {
        SysUserMapper mapper = mock(SysUserMapper.class);
        TokenService tokenService = mock(TokenService.class);
        SysUser user = loginCandidate(25L, "legacy-manager", 0);

        when(mapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(user);
        when(mapper.selectRoleKeysByUserId(25L)).thenReturn(List.of("boss", "sys_admin"));
        when(mapper.selectMinDataScopeByUserId(25L)).thenReturn(3);
        when(mapper.selectPermsByUserId(25L)).thenReturn(List.of("dashboard:view"));

        LoginUser result = (LoginUser) userDetailsService(mapper, tokenService)
                .loadUserByUsername("legacy-manager");

        assertFalse(result.isAdmin());
        assertEquals(3, result.getDataScope());
        assertFalse(result.getPermissions().contains("*:*:*"));
        assertTrue(result.getPermissions().contains("dashboard:view"));
    }

    @Test
    void legacyAdminUsernameAloneDoesNotCreateAdministratorPermissions() {
        SysUserMapper mapper = mock(SysUserMapper.class);
        TokenService tokenService = mock(TokenService.class);
        SysUser user = loginCandidate(26L, "admin", 0);

        when(mapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(user);
        when(mapper.selectRoleKeysByUserId(26L)).thenReturn(List.of("staff"));
        when(mapper.selectMinDataScopeByUserId(26L)).thenReturn(5);
        when(mapper.selectPermsByUserId(26L)).thenReturn(Collections.emptyList());

        LoginUser result = (LoginUser) userDetailsService(mapper, tokenService)
                .loadUserByUsername("admin");

        assertFalse(result.isAdmin());
        assertEquals(5, result.getDataScope());
        assertFalse(result.getPermissions().contains("*:*:*"));
    }

    @Test
    void nullStatusFailsClosedBeforeCapturingAuthorizationVersion() {
        SysUserMapper mapper = mock(SysUserMapper.class);
        TokenService tokenService = mock(TokenService.class);
        SysUser user = loginCandidate(23L, "null-status", null);
        when(mapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(user);

        assertThrows(UsernameNotFoundException.class,
                () -> userDetailsService(mapper, tokenService)
                        .loadUserByUsername("null-status"));

        verify(tokenService, never()).captureAuthVersion(any(LoginUser.class));
    }

    @Test
    void unknownStatusFailsClosedBeforeCapturingAuthorizationVersion() {
        SysUserMapper mapper = mock(SysUserMapper.class);
        TokenService tokenService = mock(TokenService.class);
        SysUser user = loginCandidate(24L, "unknown-status", 2);
        when(mapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(user);

        assertThrows(UsernameNotFoundException.class,
                () -> userDetailsService(mapper, tokenService)
                        .loadUserByUsername("unknown-status"));

        verify(tokenService, never()).captureAuthVersion(any(LoginUser.class));
    }

    @Test
    void resignedEmployeeFailsClosedBeforeAuthorizationSnapshotIsRead() {
        SysUserMapper mapper = mock(SysUserMapper.class);
        TokenService tokenService = mock(TokenService.class);
        SysUser user = loginCandidate(25L, "resigned-user", 0);
        when(mapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(user);
        when(mapper.existsResignedEmployee(25L, 1L)).thenReturn(true);

        assertThrows(UsernameNotFoundException.class,
                () -> userDetailsService(mapper, tokenService)
                        .loadUserByUsername("resigned-user"));

        verify(mapper).existsResignedEmployee(25L, 1L);
        verify(mapper, never()).selectRoleKeysByUserId(25L);
        verify(tokenService, never()).captureAuthVersion(any(LoginUser.class));
    }

    @Test
    void impersonationSnapshotReusesRealPermissionsButNeverCarriesPassword() {
        SysUserMapper mapper = mock(SysUserMapper.class);
        TokenService tokenService = mock(TokenService.class);
        SysUser safeProjection = loginCandidate(31L, "sales-user", 0);
        safeProjection.setPassword(null);
        safeProjection.setDeptId(8L);
        when(mapper.selectActiveForImpersonation(31L, 1L)).thenReturn(safeProjection);
        when(mapper.selectRoleKeysByUserId(31L)).thenReturn(List.of("sales"));
        when(mapper.selectMinDataScopeByUserId(31L)).thenReturn(4);
        when(mapper.selectPermsByUserId(31L)).thenReturn(List.of("crm:lead:list", "crm:lead:query"));

        LoginUser result = userDetailsService(mapper, tokenService)
                .loadActiveUserForImpersonation(31L, 1L);

        assertEquals(31L, result.getUserId());
        assertEquals(1L, result.getTenantId());
        assertEquals(8L, result.getDeptId());
        assertEquals(4, result.getDataScope());
        assertEquals(List.of("sales"), result.getRoleKeys());
        assertTrue(result.getPermissions().contains("crm:lead:list"));
        assertFalse(result.isAdmin());
        assertNull(result.getPassword());
        org.mockito.InOrder ordered = inOrder(tokenService, mapper);
        ordered.verify(tokenService).captureAuthVersion(result);
        ordered.verify(mapper).selectRoleKeysByUserId(31L);
        ordered.verify(mapper).selectMinDataScopeByUserId(31L);
        ordered.verify(mapper).selectPermsByUserId(31L);
    }

    @Test
    void impersonationTargetMustComeFromSameTenantActiveEmployeeProjection() {
        SysUserMapper mapper = mock(SysUserMapper.class);
        TokenService tokenService = mock(TokenService.class);
        when(mapper.selectActiveForImpersonation(32L, 1L)).thenReturn(null);

        assertThrows(BusinessException.class,
                () -> userDetailsService(mapper, tokenService)
                        .loadActiveUserForImpersonation(32L, 1L));
        assertThrows(BusinessException.class,
                () -> userDetailsService(mapper, tokenService)
                        .loadActiveUserForImpersonation(1L, 1L));
        assertThrows(BusinessException.class,
                () -> userDetailsService(mapper, tokenService)
                        .loadActiveUserForImpersonation(3L, 1L));

        verify(tokenService, never()).captureAuthVersion(any(LoginUser.class));
    }

    /** 业务权限点在本用例中不参与断言，用空 mock 保持“只看菜单权限与角色继承”的原有口径。 */
    private UserDetailsServiceImpl userDetailsService(SysUserMapper mapper, TokenService tokenService) {
        return new UserDetailsServiceImpl(mapper, mock(SysPermissionMapper.class), tokenService);
    }

    private SysUser loginCandidate(Long id, String username, Integer status) {
        SysUser user = new SysUser();
        user.setId(id);
        user.setUsername(username);
        user.setPassword("encoded");
        user.setStatus(status);
        user.setTenantId(1L);
        return user;
    }
}
