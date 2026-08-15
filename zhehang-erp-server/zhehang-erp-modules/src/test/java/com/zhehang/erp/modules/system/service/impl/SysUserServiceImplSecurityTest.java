package com.zhehang.erp.modules.system.service.impl;

import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.system.domain.dto.UserDTO;
import com.zhehang.erp.modules.system.domain.entity.SysUser;
import com.zhehang.erp.modules.system.mapper.SysDeptMapper;
import com.zhehang.erp.modules.system.mapper.SysRoleMapper;
import com.zhehang.erp.modules.system.mapper.SysUserMapper;
import com.zhehang.erp.security.domain.LoginUser;
import com.zhehang.erp.security.service.TokenService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SysUserServiceImplSecurityTest {

    @Mock private SysUserMapper userMapper;
    @Mock private SysRoleMapper roleMapper;
    @Mock private SysDeptMapper deptMapper;
    @Mock private TokenService tokenService;

    @InjectMocks private SysUserServiceImpl service;

    @BeforeEach
    void loginAsTenantBoss() {
        ReflectionTestUtils.setField(service, "baseMapper", userMapper);
        login(22L, 1L);
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void basicProfileEditWithoutRoleIdsPreservesExistingAssignments() {
        SysUser target = user(7L, 1L);
        target.setStatus(0);
        when(userMapper.selectById(7L)).thenReturn(target);
        when(userMapper.selectRoleKeysByUserId(7L)).thenReturn(List.of("staff"));
        when(userMapper.updateById(any(SysUser.class))).thenReturn(1);

        UserDTO dto = dto(7L, null);
        dto.setStatus(0);
        service.updateUser(dto);

        verify(roleMapper, never()).deleteUserRoles(anyLong());
        verify(roleMapper, never()).insertUserRoles(anyLong(), any());
        verify(tokenService, never()).invalidateLoginUserSafely(7L);
    }

    @Test
    void createUserRejectsUnknownStatusBeforeAnyWrite() {
        UserDTO dto = dto(null, null);
        dto.setStatus(2);

        assertThatThrownBy(() -> service.createUser(dto))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("正常或停用");

        verify(userMapper, never()).insert(any(SysUser.class));
        verify(userMapper, never()).updateById(any(SysUser.class));
        verify(roleMapper, never()).insertUserRoles(anyLong(), any());
    }

    @Test
    void createUserRejectsRoleAssignmentThroughLegacyUserEndpoint() {
        UserDTO dto = dto(null, List.of(9L, 3L));
        dto.setStatus(0);

        assertThatThrownBy(() -> service.createUser(dto))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("角色管理");

        verify(userMapper, never()).insert(any(SysUser.class));
        verify(roleMapper, never()).insertUserRoles(anyLong(), any());
    }

    @Test
    void failedUserInsertStopsBeforeRoleLocksAndRelationshipWrite() {
        UserDTO dto = dto(null, null);
        dto.setStatus(0);
        when(userMapper.selectCount(any())).thenReturn(0L);
        when(userMapper.insert(any(SysUser.class))).thenReturn(0);

        assertThatThrownBy(() -> service.createUser(dto))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("用户创建失败");

        verify(roleMapper, never()).selectRoleForUpdate(anyLong(), anyLong());
        verify(roleMapper, never()).insertUserRoles(anyLong(), any());
        verify(tokenService, never()).invalidateLoginUserSafely(anyLong());
    }

    @Test
    void updateUserRejectsUnknownStatusBeforeAnyWrite() {
        UserDTO dto = dto(7L, null);
        dto.setStatus(2);

        assertThatThrownBy(() -> service.updateUser(dto))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("正常或停用");

        verify(userMapper, never()).updateById(any(SysUser.class));
        verify(roleMapper, never()).deleteUserRoles(anyLong());
        verify(roleMapper, never()).insertUserRoles(anyLong(), any());
        verify(tokenService, never()).invalidateLoginUserSafely(anyLong());
    }

    @Test
    void departmentChangeInvalidatesLoginSafely() {
        SysUser target = user(7L, 1L);
        target.setStatus(0);
        target.setDeptId(10L);
        when(userMapper.selectById(7L)).thenReturn(target);
        when(userMapper.selectRoleKeysByUserId(7L)).thenReturn(List.of("staff"));
        when(userMapper.updateById(any(SysUser.class))).thenReturn(1);
        UserDTO dto = dto(7L, null);
        dto.setStatus(0);
        dto.setDeptId(11L);

        service.updateUser(dto);

        verify(tokenService).invalidateLoginUserSafely(7L);
    }

    @Test
    void usernameChangeInvalidatesLoginSafely() {
        SysUser target = user(7L, 1L);
        target.setStatus(0);
        target.setDeptId(10L);
        when(userMapper.selectById(7L)).thenReturn(target);
        when(userMapper.selectRoleKeysByUserId(7L)).thenReturn(List.of("staff"));
        when(userMapper.updateById(any(SysUser.class))).thenReturn(1);
        UserDTO dto = dto(7L, null);
        dto.setUsername("renamed-employee-7");
        dto.setStatus(0);
        dto.setDeptId(10L);

        service.updateUser(dto);

        verify(tokenService).invalidateLoginUserSafely(7L);
    }

    @Test
    void nicknameAndPhoneOnlyChangeDoesNotInvalidateLogin() {
        SysUser target = user(7L, 1L);
        target.setStatus(0);
        target.setDeptId(10L);
        target.setPhone("old-phone");
        when(userMapper.selectById(7L)).thenReturn(target);
        when(userMapper.selectRoleKeysByUserId(7L)).thenReturn(List.of("staff"));
        when(userMapper.updateById(any(SysUser.class))).thenReturn(1);
        UserDTO dto = dto(7L, null);
        dto.setNickname("新昵称");
        dto.setPhone("new-phone");
        dto.setStatus(0);
        dto.setDeptId(10L);

        service.updateUser(dto);

        verify(tokenService, never()).invalidateLoginUserSafely(anyLong());
    }

    @Test
    void omittedStatusAndDepartmentPreserveStoredValuesWithoutInvalidation() {
        SysUser target = user(7L, 1L);
        target.setStatus(0);
        target.setDeptId(10L);
        when(userMapper.selectById(7L)).thenReturn(target);
        when(userMapper.selectRoleKeysByUserId(7L)).thenReturn(List.of("staff"));
        when(userMapper.updateById(any(SysUser.class))).thenReturn(1);
        UserDTO dto = dto(7L, null);

        service.updateUser(dto);

        ArgumentCaptor<SysUser> updatedUser = ArgumentCaptor.forClass(SysUser.class);
        verify(userMapper).updateById(updatedUser.capture());
        assertThat(updatedUser.getValue().getStatus()).isEqualTo(0);
        assertThat(updatedUser.getValue().getDeptId()).isEqualTo(10L);
        verify(tokenService, never()).invalidateLoginUserSafely(anyLong());
    }

    @Test
    void updateUserRejectsAnyNonNullRoleIdsBeforeReadingOrWritingUser() {
        assertThatThrownBy(() -> service.updateUser(dto(7L, List.of(9L, 3L))))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("角色管理");

        verify(userMapper, never()).selectById(anyLong());
        verify(userMapper, never()).updateById(any(SysUser.class));
        verify(roleMapper, never()).deleteUserRoles(anyLong());
        verify(roleMapper, never()).insertUserRoles(anyLong(), any());
    }

    @Test
    void superAdminAlsoCannotUseAlternateUserEndpointToAssignRoles() {
        login(1L, 1L, List.of("super_admin"));

        assertThatThrownBy(() -> service.updateUser(dto(7L, List.of())))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("角色管理");

        verify(userMapper, never()).selectById(anyLong());
        verify(roleMapper, never()).deleteUserRoles(anyLong());
    }

    @Test
    void disabledOrDeletedRolesCannotContributePermissionsOrMenus() throws Exception {
        assertRoleStateFilter("mapper/system/SysUserMapper.xml", "selectPermsByUserId");
        assertRoleStateFilter("mapper/system/SysMenuMapper.xml", "selectMenusByUserId");
    }

    @Test
    void tenantBossCannotResetAnotherPrivilegedUsersPassword() {
        when(userMapper.selectById(9L)).thenReturn(user(9L, 1L));
        when(userMapper.selectRoleKeysByUserId(9L)).thenReturn(List.of("boss"));

        assertThatThrownBy(() -> service.resetPassword(9L))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("特权账号");

        verify(userMapper, never()).updateById(any(SysUser.class));
        verify(tokenService, never()).invalidateLoginUserSafely(9L);
    }

    @Test
    void exactSuperAdminCanResetAnotherSuperAdminPassword() {
        login(22L, 1L, List.of("super_admin"));
        when(userMapper.selectById(9L)).thenReturn(user(9L, 1L));
        when(userMapper.selectRoleKeysByUserId(9L)).thenReturn(List.of("super_admin"));
        when(userMapper.update(isNull(), any())).thenReturn(1);

        service.resetPassword(9L);

        verify(userMapper).update(isNull(), any());
        verify(tokenService).invalidateLoginUserSafely(9L);
    }

    @Test
    void failedResetPasswordWriteDoesNotInvalidateLogin() {
        when(userMapper.selectById(7L)).thenReturn(user(7L, 1L));
        when(userMapper.selectRoleKeysByUserId(7L)).thenReturn(List.of("staff"));
        when(userMapper.update(isNull(), any())).thenReturn(0);

        assertThatThrownBy(() -> service.resetPassword(7L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("无权修改");

        verify(tokenService, never()).invalidateLoginUserSafely(7L);
    }

    @Test
    void failedOwnPasswordWriteDoesNotInvalidateLogin() {
        SysUser current = user(22L, 1L);
        current.setPassword(SecurityUtils.encryptPassword("old-password"));
        when(userMapper.selectById(22L)).thenReturn(current);
        when(userMapper.update(isNull(), any())).thenReturn(0);

        assertThatThrownBy(() -> service.updateMyPassword("old-password", "SecureNew9!"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("无权修改");

        verify(tokenService, never()).invalidateLoginUserSafely(22L);
    }

    @Test
    void failedStatusWriteDoesNotInvalidateLogin() {
        SysUser target = user(7L, 1L);
        target.setStatus(0);
        when(userMapper.selectById(7L)).thenReturn(target);
        when(userMapper.selectRoleKeysByUserId(7L)).thenReturn(List.of("staff"));
        when(userMapper.updateById(any(SysUser.class))).thenReturn(0);

        assertThatThrownBy(() -> service.updateStatus(7L, 1))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("无权修改");

        verify(tokenService, never()).invalidateLoginUserSafely(7L);
    }

    @Test
    void resignedEmployeeCannotBeReenabledThroughStatusEndpoint() {
        SysUser target = user(7L, 1L);
        target.setStatus(1);
        when(userMapper.selectById(7L)).thenReturn(target);
        when(userMapper.selectRoleKeysByUserId(7L)).thenReturn(List.of("staff"));
        when(userMapper.existsResignedEmployee(7L, 1L)).thenReturn(true);

        assertThatThrownBy(() -> service.updateStatus(7L, 0))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("离职员工不能启用");

        verify(userMapper, never()).updateById(any(SysUser.class));
        verify(tokenService, never()).invalidateLoginUserSafely(7L);
    }

    @Test
    void resignedEmployeeCannotBeReenabledThroughWholeUserEdit() {
        SysUser target = user(7L, 1L);
        target.setStatus(1);
        when(userMapper.selectById(7L)).thenReturn(target);
        when(userMapper.selectRoleKeysByUserId(7L)).thenReturn(List.of("staff"));
        when(userMapper.existsResignedEmployee(7L, 1L)).thenReturn(true);
        UserDTO dto = dto(7L, null);
        dto.setStatus(0);

        assertThatThrownBy(() -> service.updateUser(dto))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("离职员工不能启用");

        verify(userMapper, never()).updateById(any(SysUser.class));
        verify(tokenService, never()).invalidateLoginUserSafely(7L);
    }

    @Test
    void resignationDisablesAccountAndAlwaysInvalidatesExistingSessions() {
        SysUser target = user(7L, 1L);
        target.setStatus(0);
        when(userMapper.selectById(7L)).thenReturn(target);
        when(userMapper.selectRoleKeysByUserId(7L)).thenReturn(List.of("staff"));
        when(userMapper.updateById(any(SysUser.class))).thenReturn(1);

        service.disableForResignation(7L);

        ArgumentCaptor<SysUser> disabled = ArgumentCaptor.forClass(SysUser.class);
        verify(userMapper).updateById(disabled.capture());
        assertThat(disabled.getValue().getStatus()).isEqualTo(1);
        verify(tokenService).invalidateLoginUserSafely(7L);
    }

    @Test
    void resignationInvalidatesEvenWhenAccountWasAlreadyDisabled() {
        SysUser target = user(7L, 1L);
        target.setStatus(1);
        when(userMapper.selectById(7L)).thenReturn(target);
        when(userMapper.selectRoleKeysByUserId(7L)).thenReturn(List.of("staff"));

        service.disableForResignation(7L);

        verify(userMapper, never()).updateById(any(SysUser.class));
        verify(tokenService).invalidateLoginUserSafely(7L);
    }

    @Test
    void canonicalSuperAdminCannotBeDisabledByAnyResignationWorkflow() {
        SysUser target = user(9L, 1L);
        target.setStatus(0);
        when(userMapper.selectById(9L)).thenReturn(target);
        when(userMapper.selectRoleKeysByUserId(9L)).thenReturn(List.of("super_admin"));
        login(9L, 1L, List.of("super_admin"));

        assertThatThrownBy(() -> service.disableForResignation(9L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("唯一超级管理员交接");

        verify(userMapper, never()).updateById(any(SysUser.class));
        verify(tokenService, never()).invalidateLoginUserSafely(9L);
    }

    @Test
    void platformUserIdOneCannotBeDisabledByResignationWorkflow() {
        SysUser platformUser = user(1L, 1L);
        platformUser.setStatus(0);
        when(userMapper.selectById(1L)).thenReturn(platformUser);

        assertThatThrownBy(() -> service.disableForResignation(1L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("平台管理员不能办理离职");

        verify(userMapper, never()).selectRoleKeysByUserId(1L);
        verify(userMapper, never()).updateById(any(SysUser.class));
        verify(tokenService, never()).invalidateLoginUserSafely(1L);
    }

    @Test
    void invalidStatusIsRejectedWithoutWriteOrInvalidation() {
        assertThatThrownBy(() -> service.updateStatus(7L, 2))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("正常或停用");

        verify(userMapper, never()).updateById(any(SysUser.class));
        verify(tokenService, never()).invalidateLoginUserSafely(anyLong());
    }

    @Test
    void unchangedStatusDoesNotWriteOrInvalidateLogin() {
        SysUser target = user(7L, 1L);
        target.setStatus(1);
        when(userMapper.selectById(7L)).thenReturn(target);
        when(userMapper.selectRoleKeysByUserId(7L)).thenReturn(List.of("staff"));

        service.updateStatus(7L, 1);

        verify(userMapper, never()).updateById(any(SysUser.class));
        verify(tokenService, never()).invalidateLoginUserSafely(7L);
    }

    @Test
    void securitySensitiveMutationsKeepRollbackTransactionsForTwoPhaseInvalidation() throws Exception {
        assertRollbackTransaction("updateUser", UserDTO.class);
        assertRollbackTransaction("deleteUser", Long.class);
        assertRollbackTransaction("resetPassword", Long.class);
        assertRollbackTransaction("updateMyPassword", String.class, String.class);
        assertRollbackTransaction("updateStatus", Long.class, Integer.class);
        assertRollbackTransaction("disableForResignation", Long.class);
    }

    private UserDTO dto(Long id, List<Long> roleIds) {
        UserDTO dto = new UserDTO();
        dto.setId(id);
        dto.setUsername("employee-" + id);
        dto.setNickname("员工" + id);
        dto.setRoleIds(roleIds);
        return dto;
    }

    private SysUser user(Long id, Long tenantId) {
        SysUser user = new SysUser();
        user.setId(id);
        user.setTenantId(tenantId);
        user.setUsername("employee-" + id);
        user.setNickname("员工" + id);
        return user;
    }

    private void assertRoleStateFilter(String resource, String statementId) throws Exception {
        try (InputStream input = getClass().getClassLoader().getResourceAsStream(resource)) {
            assertThat(input).as(resource + " must exist").isNotNull();
            String xml = new String(input.readAllBytes(), StandardCharsets.UTF_8).toLowerCase();
            String startMarker = "<select id=\"" + statementId.toLowerCase() + "\"";
            int start = xml.indexOf(startMarker);
            int end = xml.indexOf("</select>", start);
            assertThat(start).as(statementId + " must exist").isGreaterThanOrEqualTo(0);
            assertThat(end).as(statementId + " must be closed").isGreaterThan(start);
            String sql = xml.substring(start, end);
            assertThat(sql).contains("join sys_role r", "r.status = 0", "r.deleted = 0");
        }
    }

    private void assertRollbackTransaction(String methodName, Class<?>... parameterTypes) throws Exception {
        Transactional transactional = SysUserServiceImpl.class
                .getMethod(methodName, parameterTypes)
                .getAnnotation(Transactional.class);
        assertThat(transactional)
                .as(methodName + " must remain transactional")
                .isNotNull();
        assertThat(transactional.rollbackFor())
                .as(methodName + " must roll back on Exception")
                .contains(Exception.class);
    }

    private void login(Long userId, Long tenantId) {
        login(userId, tenantId, List.of());
    }

    private void login(Long userId, Long tenantId, List<String> roleKeys) {
        LoginUser loginUser = new LoginUser();
        loginUser.setUserId(userId);
        loginUser.setUsername("user-" + userId);
        loginUser.setTenantId(tenantId);
        loginUser.setRoleKeys(roleKeys);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(loginUser, null, List.of()));
    }
}
