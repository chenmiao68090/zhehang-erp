package com.zhehang.erp.modules.org;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.annotation.DenyDuringImpersonation;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.org.controller.OrgDeptController;
import com.zhehang.erp.modules.org.controller.OrgEmployeeController;
import com.zhehang.erp.modules.org.controller.OrgPostController;
import com.zhehang.erp.modules.org.domain.dto.EmployeeDTO;
import com.zhehang.erp.modules.org.domain.dto.EmployeeResignDTO;
import com.zhehang.erp.modules.org.domain.dto.PostDTO;
import com.zhehang.erp.modules.org.domain.entity.OrgEmployee;
import com.zhehang.erp.modules.org.domain.vo.EmployeeContractExpiryVO;
import com.zhehang.erp.modules.org.domain.vo.EmployeeRosterVO;
import com.zhehang.erp.modules.org.domain.vo.EmployeeVO;
import com.zhehang.erp.modules.org.mapper.OrgEmployeeMapper;
import com.zhehang.erp.modules.org.service.impl.OrgEmployeeServiceImpl;
import com.zhehang.erp.modules.system.domain.entity.SysDept;
import com.zhehang.erp.modules.system.domain.entity.SysUser;
import com.zhehang.erp.modules.system.domain.vo.InitialCredentialVO;
import com.zhehang.erp.modules.system.mapper.SysRoleMapper;
import com.zhehang.erp.modules.system.mapper.SysUserMapper;
import com.zhehang.erp.modules.system.service.ISysUserService;
import com.zhehang.erp.security.domain.LoginUser;
import com.zhehang.erp.security.service.TokenService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;

import java.beans.Introspector;
import java.io.InputStream;
import java.lang.reflect.Method;
import java.lang.reflect.InvocationTargetException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

class OrgAccessSecurityContractTest {

    private static final Set<String> SENSITIVE_EMPLOYEE_PROPERTIES = Set.of(
            "birthDate", "idCard", "phone", "email", "address", "householdLocation",
            "householdType", "nativePlace", "ethnicity", "politicalStatus", "maritalStatus",
            "emergencyContact", "emergencyPhone", "avatar", "annualLeaveTotal", "annualLeaveUsed",
            "hrDocs", "resumeFileId", "resumeFileName", "educationCertFileId", "educationCertFileName",
            "skillCertFileId", "skillCertFileName", "idCardFrontFileId", "idCardFrontFileName",
            "idCardBackFileId", "idCardBackFileName", "username", "accountEnabled",
            "userStatus", "roleIds", "roleNames", "remark"
    );

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void employeeArchiveReadsAndHrMaintainableWritesKeepHrManagementGate() throws Exception {
        assertHrGuard(OrgEmployeeController.class, "contractExpiring", Integer.class);
        assertHrGuard(OrgEmployeeController.class, "roster");
        assertHrGuard(OrgEmployeeController.class, "nextCode");
        assertHrGuard(OrgEmployeeController.class, "getInfo", Long.class);
        assertHrGuard(OrgEmployeeController.class, "add", EmployeeDTO.class);
        assertHrGuard(OrgEmployeeController.class, "edit", EmployeeDTO.class);
        assertHrGuard(OrgEmployeeController.class, "resign", Long.class, EmployeeResignDTO.class);
    }

    @Test
    void employeeArchiveMutationsCannotRunInsideEmployeeView() throws Exception {
        assertNotNull(OrgEmployeeController.class.getMethod("add", EmployeeDTO.class)
                .getAnnotation(DenyDuringImpersonation.class));
        assertNotNull(OrgEmployeeController.class.getMethod("edit", EmployeeDTO.class)
                .getAnnotation(DenyDuringImpersonation.class));
        assertNotNull(OrgEmployeeController.class.getMethod(
                        "resign", Long.class, EmployeeResignDTO.class)
                .getAnnotation(DenyDuringImpersonation.class));
        assertNotNull(OrgEmployeeController.class.getMethod("remove", Long.class)
                .getAnnotation(DenyDuringImpersonation.class));
        assertNotNull(OrgEmployeeController.class.getMethod(
                        "updateAccountStatus", Long.class, Boolean.class)
                .getAnnotation(DenyDuringImpersonation.class));
    }

    @Test
    void destructiveArchiveAndAccountSecurityOperationsRequirePlatformAdminOrBoss() throws Exception {
        assertAccountSecurityGuard(OrgEmployeeController.class, "remove", Long.class);
        assertAccountSecurityGuard(OrgEmployeeController.class, "resetPassword", Long.class);
        assertAccountSecurityGuard(OrgEmployeeController.class, "updateAccountStatus", Long.class, Boolean.class);
    }

    @Test
    void departmentAndPostWritesKeepHrManagementGateWhileReadSelectorsRemainCompatible() throws Exception {
        assertHrGuard(OrgDeptController.class, "add", SysDept.class);
        assertHrGuard(OrgDeptController.class, "edit", SysDept.class);
        assertHrGuard(OrgDeptController.class, "remove", Long.class);
        assertHrGuard(OrgPostController.class, "add", PostDTO.class);
        assertHrGuard(OrgPostController.class, "edit", PostDTO.class);
        assertHrGuard(OrgPostController.class, "remove", Long.class);

        assertFalse(hasGuard(OrgDeptController.class, "tree"));
        assertFalse(hasGuard(OrgPostController.class, "all"));
        assertFalse(hasGuard(OrgPostController.class, "list", Integer.class, Integer.class, String.class, Integer.class));
    }

    @Test
    void ordinaryEmployeeListCanOnlyReturnOwnRecord() {
        OrgEmployeeMapper employeeMapper = mock(OrgEmployeeMapper.class);
        DataScopeHelper dataScopeHelper = mock(DataScopeHelper.class);
        SysUserMapper userMapper = mock(SysUserMapper.class);
        SysRoleMapper roleMapper = mock(SysRoleMapper.class);
        OrgEmployeeServiceImpl service = employeeService(
                employeeMapper, dataScopeHelper, userMapper, roleMapper, mock(TokenService.class));

        EmployeeVO own = new EmployeeVO();
        own.setId(42L);
        own.setName("本人");
        when(dataScopeHelper.isHrOrAdmin()).thenReturn(false);
        when(dataScopeHelper.currentEmployeeId()).thenReturn(42L);
        when(employeeMapper.selectEmployeeById(42L)).thenReturn(own);

        IPage<EmployeeVO> page = service.selectEmployeePage(1, 500, "其他人", 99L, 88L, 1);

        assertEquals(1, page.getTotal());
        assertEquals(1, page.getRecords().size());
        assertEquals(42L, page.getRecords().get(0).getId());
        verify(employeeMapper).selectEmployeeById(42L);
        verify(employeeMapper, never()).selectEmployeePage(
                org.mockito.ArgumentMatchers.any(),
                org.mockito.ArgumentMatchers.any(),
                org.mockito.ArgumentMatchers.any(),
                org.mockito.ArgumentMatchers.any(),
                org.mockito.ArgumentMatchers.any(),
                org.mockito.ArgumentMatchers.any());
        verifyNoMoreInteractions(employeeMapper);
    }

    @Test
    void changingEmployeeIdCannotReadAnotherEmployeesFullArchive() {
        OrgEmployeeMapper employeeMapper = mock(OrgEmployeeMapper.class);
        DataScopeHelper dataScopeHelper = mock(DataScopeHelper.class);
        OrgEmployeeServiceImpl service = employeeService(
                employeeMapper, dataScopeHelper, mock(SysUserMapper.class), mock(SysRoleMapper.class),
                mock(TokenService.class));

        when(dataScopeHelper.isHrAdminOrBoss()).thenReturn(false);
        when(dataScopeHelper.currentEmployeeId()).thenReturn(42L);

        assertThrows(BusinessException.class, () -> service.selectEmployeeById(99L));
        verifyNoInteractions(employeeMapper);
    }

    @Test
    void hrCannotBypassAccountSecurityThroughDirectServiceCalls() {
        OrgEmployeeMapper employeeMapper = mock(OrgEmployeeMapper.class);
        OrgEmployeeServiceImpl service = employeeService(
                employeeMapper, mock(DataScopeHelper.class), mock(SysUserMapper.class), mock(SysRoleMapper.class),
                mock(TokenService.class));
        login(false, List.of("hr"));

        assertThrows(BusinessException.class, () -> service.deleteEmployee(99L));
        assertThrows(BusinessException.class, () -> service.resetEmployeePassword(99L));
        assertThrows(BusinessException.class, () -> service.updateEmployeeAccountStatus(99L, false));
        verifyNoInteractions(employeeMapper);
    }

    @Test
    void hrEmployeeDtoCannotChangeLinkedAccountIdentityStatusOrRoles() throws Exception {
        OrgEmployeeServiceImpl service = employeeService(
                mock(OrgEmployeeMapper.class), mock(DataScopeHelper.class),
                mock(SysUserMapper.class), mock(SysRoleMapper.class), mock(TokenService.class));
        login(false, List.of("hr"));

        EmployeeDTO dto = new EmployeeDTO();
        dto.setUserId(999L);
        dto.setUsername("takeover");
        dto.setAccountEnabled(false);
        dto.setRoleIds(List.of(1L));

        Method sanitizer = OrgEmployeeServiceImpl.class
                .getDeclaredMethod("clearUnauthorizedAccountSecurityFields", EmployeeDTO.class);
        sanitizer.setAccessible(true);
        sanitizer.invoke(service, dto);

        assertNull(dto.getUserId());
        assertNull(dto.getUsername());
        assertNull(dto.getAccountEnabled());
        assertNull(dto.getRoleIds());
    }

    @Test
    void failedEmployeeArchiveUpdateStopsBeforeAccountOrSessionMutation() {
        OrgEmployeeMapper employeeMapper = mock(OrgEmployeeMapper.class);
        SysUserMapper userMapper = mock(SysUserMapper.class);
        TokenService tokenService = mock(TokenService.class);
        OrgEmployee existing = new OrgEmployee();
        existing.setId(99L);
        existing.setEmpCode("ZH099");
        existing.setUserId(10L);
        when(employeeMapper.selectById(99L)).thenReturn(existing);
        when(employeeMapper.selectCount(org.mockito.ArgumentMatchers.any())).thenReturn(0L);
        when(employeeMapper.update(org.mockito.ArgumentMatchers.any(OrgEmployee.class),
                org.mockito.ArgumentMatchers.any())).thenReturn(0);
        OrgEmployeeServiceImpl service = employeeService(
                employeeMapper, mock(DataScopeHelper.class), userMapper,
                mock(SysRoleMapper.class), tokenService);
        ReflectionTestUtils.setField(service, "baseMapper", employeeMapper);
        login(false, List.of("hr"));

        EmployeeDTO dto = new EmployeeDTO();
        dto.setId(99L);
        dto.setEmpCode("ZH099");
        dto.setName("更新后的员工");

        BusinessException thrown = assertThrows(BusinessException.class,
                () -> service.updateEmployee(dto));

        assertTrue(thrown.getMessage().contains("员工状态已变化"));
        verify(employeeMapper).update(org.mockito.ArgumentMatchers.any(OrgEmployee.class),
                org.mockito.ArgumentMatchers.any());
        verifyNoInteractions(userMapper, tokenService);
    }

    @Test
    void failedEmployeeUserIdBackfillThrowsWithoutInvalidatingLoginSession() {
        OrgEmployeeMapper employeeMapper = mock(OrgEmployeeMapper.class);
        SysUserMapper userMapper = mock(SysUserMapper.class);
        SysRoleMapper roleMapper = mock(SysRoleMapper.class);
        TokenService tokenService = mock(TokenService.class);
        when(employeeMapper.selectCount(org.mockito.ArgumentMatchers.any())).thenReturn(0L);
        when(employeeMapper.insert(org.mockito.ArgumentMatchers.any(OrgEmployee.class))).thenAnswer(invocation -> {
            invocation.<OrgEmployee>getArgument(0).setId(99L);
            return 1;
        });
        when(userMapper.selectCount(org.mockito.ArgumentMatchers.any())).thenReturn(0L);
        when(userMapper.insert(org.mockito.ArgumentMatchers.any(SysUser.class))).thenAnswer(invocation -> {
            invocation.<SysUser>getArgument(0).setId(10L);
            return 1;
        });
        when(employeeMapper.updateById(org.mockito.ArgumentMatchers.any(OrgEmployee.class))).thenReturn(0);
        OrgEmployeeServiceImpl service = employeeService(
                employeeMapper, mock(DataScopeHelper.class), userMapper, roleMapper, tokenService);
        ReflectionTestUtils.setField(service, "baseMapper", employeeMapper);
        login(true, List.of());

        EmployeeDTO dto = new EmployeeDTO();
        dto.setEmpCode("ZH100");
        dto.setUsername("employee-100");
        dto.setAccountEnabled(true);

        BusinessException thrown = assertThrows(BusinessException.class,
                () -> service.createEmployee(dto));

        assertTrue(thrown.getMessage().contains("员工账号关联失败"));
        verify(userMapper).insert(org.mockito.ArgumentMatchers.any(SysUser.class));
        verify(employeeMapper).updateById(org.mockito.ArgumentMatchers.any(OrgEmployee.class));
        verifyNoInteractions(tokenService);
    }

    @Test
    void platformAdminCannotAssignRolesThroughEmployeeCreateEndpoint() {
        OrgEmployeeServiceImpl service = employeeService(
                mock(OrgEmployeeMapper.class), mock(DataScopeHelper.class),
                mock(SysUserMapper.class), mock(SysRoleMapper.class), mock(TokenService.class));
        login(true, List.of());

        EmployeeDTO dto = new EmployeeDTO();
        dto.setRoleIds(List.of(2L));

        BusinessException thrown = assertThrows(BusinessException.class, () -> service.createEmployee(dto));

        assertTrue(thrown.getMessage().contains("角色管理"));
    }

    @Test
    void employeeUpdateRejectsEvenAnExplicitEmptyRoleList() {
        OrgEmployeeMapper employeeMapper = mock(OrgEmployeeMapper.class);
        OrgEmployeeServiceImpl service = employeeService(
                employeeMapper, mock(DataScopeHelper.class), mock(SysUserMapper.class),
                mock(SysRoleMapper.class), mock(TokenService.class));
        login(true, List.of("super_admin"));

        EmployeeDTO dto = new EmployeeDTO();
        dto.setId(88L);
        dto.setRoleIds(List.of());

        BusinessException thrown = assertThrows(BusinessException.class, () -> service.updateEmployee(dto));

        assertTrue(thrown.getMessage().contains("角色管理"));
        verifyNoInteractions(employeeMapper);
    }

    @Test
    void resettingEmployeePasswordInvalidatesExistingLoginSession() {
        OrgEmployeeMapper employeeMapper = mock(OrgEmployeeMapper.class);
        ISysUserService sysUserService = mock(ISysUserService.class);
        OrgEmployee employee = new OrgEmployee();
        employee.setId(99L);
        employee.setUserId(10L);
        when(employeeMapper.selectById(99L)).thenReturn(employee);
        InitialCredentialVO credential = new InitialCredentialVO("employee-10", "OneTime9!Safe", true);
        when(sysUserService.resetPassword(10L)).thenReturn(credential);
        OrgEmployeeServiceImpl service = new OrgEmployeeServiceImpl(
                employeeMapper, mock(DataScopeHelper.class), mock(SysUserMapper.class),
                mock(SysRoleMapper.class), mock(TokenService.class), sysUserService);
        login(true, List.of());

        InitialCredentialVO actual = service.resetEmployeePassword(99L);

        assertEquals(credential, actual);
        verify(sysUserService).resetPassword(10L);
    }

    @Test
    void changingEmployeeAccountStatusInvalidatesExistingLoginSession() {
        OrgEmployeeMapper employeeMapper = mock(OrgEmployeeMapper.class);
        SysUserMapper userMapper = mock(SysUserMapper.class);
        TokenService tokenService = mock(TokenService.class);
        OrgEmployee employee = new OrgEmployee();
        employee.setId(99L);
        employee.setUserId(10L);
        when(employeeMapper.selectById(99L)).thenReturn(employee);
        when(userMapper.updateById(org.mockito.ArgumentMatchers.any(SysUser.class))).thenReturn(1);
        OrgEmployeeServiceImpl service = employeeService(
                employeeMapper, mock(DataScopeHelper.class), userMapper,
                mock(SysRoleMapper.class), tokenService);
        login(true, List.of());

        service.updateEmployeeAccountStatus(99L, false);

        verify(userMapper).updateById(org.mockito.ArgumentMatchers.any(SysUser.class));
        verify(tokenService).invalidateLoginUserSafely(10L);
    }

    @Test
    void employeeAccountHelperNeverWritesRolesFromLegacyDto() throws Exception {
        SysUserMapper userMapper = mock(SysUserMapper.class);
        SysRoleMapper roleMapper = mock(SysRoleMapper.class);
        TokenService tokenService = mock(TokenService.class);
        when(userMapper.updateById(org.mockito.ArgumentMatchers.any(SysUser.class))).thenReturn(1);
        OrgEmployeeServiceImpl service = employeeService(
                mock(OrgEmployeeMapper.class), mock(DataScopeHelper.class),
                userMapper, roleMapper, tokenService);
        login(true, List.of());

        SysUser user = new SysUser();
        user.setId(10L);
        user.setUsername("employee-10");
        user.setStatus(0);
        OrgEmployee employee = new OrgEmployee();
        employee.setUserId(10L);
        employee.setName("员工十");
        employee.setStatus(1);
        employee.setAvatar("/avatar/employee-10.png");
        EmployeeDTO dto = new EmployeeDTO();
        dto.setRoleIds(List.of(4L));

        Method updateAccount = OrgEmployeeServiceImpl.class
                .getDeclaredMethod("updateAccount", SysUser.class, OrgEmployee.class, EmployeeDTO.class);
        updateAccount.setAccessible(true);
        updateAccount.invoke(service, user, employee, dto);

        verify(userMapper).updateById(user);
        verify(roleMapper, never()).deleteUserRoles(10L);
        verify(roleMapper, never()).insertUserRoles(
                org.mockito.ArgumentMatchers.eq(10L), org.mockito.ArgumentMatchers.anyList());
        verify(tokenService, never()).invalidateLoginUserSafely(10L);
    }

    @Test
    void editingOrdinaryEmployeeProfileDoesNotInvalidateLoginSession() throws Exception {
        SysUserMapper userMapper = mock(SysUserMapper.class);
        TokenService tokenService = mock(TokenService.class);
        when(userMapper.updateById(org.mockito.ArgumentMatchers.any(SysUser.class))).thenReturn(1);
        OrgEmployeeServiceImpl service = employeeService(
                mock(OrgEmployeeMapper.class), mock(DataScopeHelper.class), userMapper,
                mock(SysRoleMapper.class), tokenService);
        login(false, List.of("hr"));

        SysUser user = new SysUser();
        user.setId(10L);
        user.setUsername("employee-10");
        user.setStatus(0);
        OrgEmployee employee = new OrgEmployee();
        employee.setUserId(10L);
        employee.setName("更新后的姓名");
        employee.setPhone("masked-phone");
        employee.setStatus(1);
        employee.setAvatar("/avatar/employee-10.png");
        EmployeeDTO dto = new EmployeeDTO();

        Method updateAccount = OrgEmployeeServiceImpl.class
                .getDeclaredMethod("updateAccount", SysUser.class, OrgEmployee.class, EmployeeDTO.class);
        updateAccount.setAccessible(true);
        updateAccount.invoke(service, user, employee, dto);

        assertEquals("更新后的姓名", user.getNickname());
        verify(userMapper).updateById(user);
        verify(tokenService, never()).invalidateLoginUserSafely(10L);
    }

    @Test
    void hrDepartmentTransferInvalidatesLoginSessionForFreshDataScope() throws Exception {
        SysUserMapper userMapper = mock(SysUserMapper.class);
        TokenService tokenService = mock(TokenService.class);
        when(userMapper.selectRoleKeysByUserId(10L)).thenReturn(List.of("staff"));
        when(userMapper.updateById(org.mockito.ArgumentMatchers.any(SysUser.class))).thenReturn(1);
        OrgEmployeeServiceImpl service = employeeService(
                mock(OrgEmployeeMapper.class), mock(DataScopeHelper.class), userMapper,
                mock(SysRoleMapper.class), tokenService);
        login(false, List.of("hr"));

        SysUser user = new SysUser();
        user.setId(10L);
        user.setUsername("employee-10");
        user.setStatus(0);
        user.setDeptId(11L);
        OrgEmployee employee = new OrgEmployee();
        employee.setUserId(10L);
        employee.setName("跨部门员工");
        employee.setStatus(1);
        employee.setDeptId(22L);
        employee.setAvatar("/avatar/employee-10.png");
        EmployeeDTO dto = new EmployeeDTO();

        Method updateAccount = OrgEmployeeServiceImpl.class
                .getDeclaredMethod("updateAccount", SysUser.class, OrgEmployee.class, EmployeeDTO.class);
        updateAccount.setAccessible(true);
        updateAccount.invoke(service, user, employee, dto);

        assertEquals(22L, user.getDeptId());
        verify(userMapper).selectRoleKeysByUserId(10L);
        verify(userMapper).updateById(user);
        verify(tokenService).invalidateLoginUserSafely(10L);
    }

    @Test
    void hrCannotMovePrivilegedAccountAcrossDepartments() throws Exception {
        SysUserMapper userMapper = mock(SysUserMapper.class);
        TokenService tokenService = mock(TokenService.class);
        when(userMapper.selectRoleKeysByUserId(10L)).thenReturn(List.of("boss", "sys_admin"));
        OrgEmployeeServiceImpl service = employeeService(
                mock(OrgEmployeeMapper.class), mock(DataScopeHelper.class), userMapper,
                mock(SysRoleMapper.class), tokenService);
        login(false, List.of("hr"));

        SysUser user = new SysUser();
        user.setId(10L);
        user.setUsername("privileged-10");
        user.setStatus(0);
        user.setDeptId(11L);
        OrgEmployee employee = new OrgEmployee();
        employee.setUserId(10L);
        employee.setName("特权账号");
        employee.setStatus(1);
        employee.setDeptId(22L);
        employee.setAvatar("/avatar/privileged-10.png");
        EmployeeDTO dto = new EmployeeDTO();

        Method updateAccount = OrgEmployeeServiceImpl.class
                .getDeclaredMethod("updateAccount", SysUser.class, OrgEmployee.class, EmployeeDTO.class);
        updateAccount.setAccessible(true);
        InvocationTargetException thrown = assertThrows(InvocationTargetException.class,
                () -> updateAccount.invoke(service, user, employee, dto));

        assertTrue(thrown.getCause() instanceof org.springframework.security.access.AccessDeniedException);
        verify(userMapper, never()).updateById(org.mockito.ArgumentMatchers.any(SysUser.class));
        verifyNoInteractions(tokenService);
    }

    @Test
    void tenantBossCannotResetAnotherPrivilegedEmployeeAccount() {
        OrgEmployeeMapper employeeMapper = mock(OrgEmployeeMapper.class);
        SysUserMapper userMapper = mock(SysUserMapper.class);
        OrgEmployee employee = new OrgEmployee();
        employee.setId(99L);
        employee.setUserId(9L);
        when(employeeMapper.selectById(99L)).thenReturn(employee);
        when(userMapper.selectRoleKeysByUserId(9L)).thenReturn(List.of("boss"));
        OrgEmployeeServiceImpl service = employeeService(
                employeeMapper, mock(DataScopeHelper.class), userMapper, mock(SysRoleMapper.class),
                mock(TokenService.class));
        login(false, List.of("boss"));

        assertThrows(BusinessException.class,
                () -> service.resetEmployeePassword(99L));

        verify(userMapper, never()).updateById(org.mockito.ArgumentMatchers.any(SysUser.class));
    }

    @Test
    void tenantBossCanEditProfileWithoutRewritingAnUnchangedPrivilegedRole() throws Exception {
        SysUserMapper userMapper = mock(SysUserMapper.class);
        SysRoleMapper roleMapper = mock(SysRoleMapper.class);
        TokenService tokenService = mock(TokenService.class);
        when(userMapper.selectRoleIdsByUserId(9L)).thenReturn(List.of(99L));
        when(userMapper.updateById(org.mockito.ArgumentMatchers.any(SysUser.class))).thenReturn(1);
        OrgEmployeeServiceImpl service = employeeService(
                mock(OrgEmployeeMapper.class), mock(DataScopeHelper.class), userMapper, roleMapper, tokenService);
        login(false, List.of("boss"));

        SysUser user = new SysUser();
        user.setId(9L);
        user.setUsername("tenant-boss");
        user.setStatus(0);
        OrgEmployee employee = new OrgEmployee();
        employee.setName("老板本人");
        employee.setStatus(1);
        employee.setAvatar("/avatar/tenant-boss.png");
        EmployeeDTO dto = new EmployeeDTO();
        dto.setUsername("tenant-boss");
        dto.setAccountEnabled(true);
        dto.setRoleIds(List.of(99L));

        Method updateAccount = OrgEmployeeServiceImpl.class
                .getDeclaredMethod("updateAccount", SysUser.class, OrgEmployee.class, EmployeeDTO.class);
        updateAccount.setAccessible(true);
        updateAccount.invoke(service, user, employee, dto);

        verify(userMapper).updateById(user);
        verify(userMapper, never()).selectRoleKeysByUserId(9L);
        verify(roleMapper, never()).deleteUserRoles(9L);
        verify(roleMapper, never()).insertUserRoles(
                org.mockito.ArgumentMatchers.eq(9L), org.mockito.ArgumentMatchers.anyList());
        verify(tokenService, never()).invalidateLoginUserSafely(9L);
    }

    @Test
    void hrMarkingArchiveResignedAlwaysDisablesLinkedLoginAccount() {
        OrgEmployeeMapper employeeMapper = mock(OrgEmployeeMapper.class);
        SysUserMapper userMapper = mock(SysUserMapper.class);
        SysRoleMapper roleMapper = mock(SysRoleMapper.class);
        TokenService tokenService = mock(TokenService.class);
        ISysUserService sysUserService = mock(ISysUserService.class);
        OrgEmployee existing = new OrgEmployee();
        existing.setId(99L);
        existing.setEmpCode("ZH099");
        existing.setName("在职员工");
        existing.setStatus(1);
        existing.setUserId(10L);
        SysUser user = new SysUser();
        user.setId(10L);
        user.setUsername("existing-account");
        user.setStatus(0);

        when(employeeMapper.selectById(99L)).thenReturn(existing);
        when(employeeMapper.selectCount(org.mockito.ArgumentMatchers.any())).thenReturn(0L);
        when(employeeMapper.update(org.mockito.ArgumentMatchers.any(OrgEmployee.class),
                org.mockito.ArgumentMatchers.any())).thenReturn(1);
        when(userMapper.selectById(10L)).thenReturn(user);
        when(userMapper.updateById(org.mockito.ArgumentMatchers.any(SysUser.class))).thenReturn(1);
        OrgEmployeeServiceImpl service = new OrgEmployeeServiceImpl(
                employeeMapper, mock(DataScopeHelper.class), userMapper, roleMapper, tokenService, sysUserService);
        ReflectionTestUtils.setField(service, "baseMapper", employeeMapper);
        login(false, List.of("hr"));

        EmployeeDTO dto = new EmployeeDTO();
        dto.setId(99L);
        dto.setEmpCode("ZH099");
        dto.setName("离职员工");
        dto.setStatus(3);
        dto.setResignDate(LocalDate.now());
        dto.setAvatar("/avatar/resigned.png");
        dto.setResumeFileId(101L);
        dto.setEducationCertFileId(102L);
        dto.setSkillCertFileId(103L);
        dto.setIdCardFrontFileId(104L);
        dto.setIdCardBackFileId(105L);

        service.updateEmployee(dto);

        assertEquals(3, existing.getStatus());
        assertEquals(LocalDate.now(), existing.getResignDate());
        verify(userMapper).updateById(user);
        verify(sysUserService).disableForResignation(10L);
        verify(tokenService, never()).invalidateLoginUserSafely(10L);
    }

    @Test
    void creatingResignedArchiveRequiresARealNonFutureDate() {
        OrgEmployeeMapper employeeMapper = mock(OrgEmployeeMapper.class);
        OrgEmployeeServiceImpl service = employeeService(
                employeeMapper, mock(DataScopeHelper.class), mock(SysUserMapper.class),
                mock(SysRoleMapper.class), mock(TokenService.class));
        ReflectionTestUtils.setField(service, "baseMapper", employeeMapper);
        when(employeeMapper.selectCount(org.mockito.ArgumentMatchers.any())).thenReturn(0L);
        login(true, List.of("super_admin"));

        EmployeeDTO missingDate = new EmployeeDTO();
        missingDate.setEmpCode("ZH099");
        missingDate.setName("历史离职员工");
        missingDate.setStatus(3);
        BusinessException missingDateError = assertThrows(BusinessException.class,
                () -> service.createEmployee(missingDate));
        assertTrue(missingDateError.getMessage().contains("离职日期不能为空"));

        EmployeeDTO futureDate = new EmployeeDTO();
        futureDate.setEmpCode("ZH100");
        futureDate.setName("未来离职员工");
        futureDate.setStatus(3);
        futureDate.setResignDate(LocalDate.now().plusDays(1));
        BusinessException futureDateError = assertThrows(BusinessException.class,
                () -> service.createEmployee(futureDate));
        assertTrue(futureDateError.getMessage().contains("暂不支持预约未来离职"));

        EmployeeDTO beforeHireDate = new EmployeeDTO();
        beforeHireDate.setEmpCode("ZH101");
        beforeHireDate.setName("日期错误员工");
        beforeHireDate.setStatus(3);
        beforeHireDate.setHireDate(LocalDate.now().minusDays(2));
        beforeHireDate.setResignDate(LocalDate.now().minusDays(3));
        BusinessException beforeHireError = assertThrows(BusinessException.class,
                () -> service.createEmployee(beforeHireDate));
        assertTrue(beforeHireError.getMessage().contains("离职日期不能早于入职日期"));

        verify(employeeMapper, never()).insert(org.mockito.ArgumentMatchers.any(OrgEmployee.class));
    }

    @Test
    void creatingResignedArchiveWithLinkedAccountAlwaysRevokesResidualSessions() {
        OrgEmployeeMapper employeeMapper = mock(OrgEmployeeMapper.class);
        SysUserMapper userMapper = mock(SysUserMapper.class);
        ISysUserService sysUserService = mock(ISysUserService.class);
        SysUser disabledUser = new SysUser();
        disabledUser.setId(10L);
        disabledUser.setStatus(1);
        when(employeeMapper.selectCount(org.mockito.ArgumentMatchers.any())).thenReturn(0L);
        when(employeeMapper.insert(org.mockito.ArgumentMatchers.any(OrgEmployee.class))).thenReturn(1);
        when(userMapper.selectById(10L)).thenReturn(disabledUser);
        when(userMapper.updateById(disabledUser)).thenReturn(1);
        OrgEmployeeServiceImpl service = new OrgEmployeeServiceImpl(
                employeeMapper, mock(DataScopeHelper.class), userMapper, mock(SysRoleMapper.class),
                mock(TokenService.class), sysUserService);
        ReflectionTestUtils.setField(service, "baseMapper", employeeMapper);
        login(true, List.of("super_admin"));

        EmployeeDTO dto = new EmployeeDTO();
        dto.setEmpCode("ZH099");
        dto.setName("历史离职员工");
        dto.setUserId(10L);
        dto.setStatus(3);
        dto.setResignDate(LocalDate.now());
        dto.setAvatar("/avatar/resigned.png");

        service.createEmployee(dto);

        verify(sysUserService).disableForResignation(10L);
    }

    @Test
    void changingActiveArchiveToResignedRequiresARealNonFutureDate() {
        OrgEmployeeMapper employeeMapper = mock(OrgEmployeeMapper.class);
        OrgEmployee existing = new OrgEmployee();
        existing.setId(99L);
        existing.setEmpCode("ZH099");
        existing.setName("在职员工");
        existing.setStatus(1);
        when(employeeMapper.selectById(99L)).thenReturn(existing);
        when(employeeMapper.selectCount(org.mockito.ArgumentMatchers.any())).thenReturn(0L);
        OrgEmployeeServiceImpl service = employeeService(
                employeeMapper, mock(DataScopeHelper.class), mock(SysUserMapper.class),
                mock(SysRoleMapper.class), mock(TokenService.class));
        ReflectionTestUtils.setField(service, "baseMapper", employeeMapper);
        login(false, List.of("hr"));

        EmployeeDTO missingDate = new EmployeeDTO();
        missingDate.setId(99L);
        missingDate.setName("离职员工");
        missingDate.setStatus(3);
        BusinessException missingDateError = assertThrows(BusinessException.class,
                () -> service.updateEmployee(missingDate));
        assertTrue(missingDateError.getMessage().contains("离职日期不能为空"));

        existing.setStatus(1);
        EmployeeDTO futureDate = new EmployeeDTO();
        futureDate.setId(99L);
        futureDate.setName("离职员工");
        futureDate.setStatus(3);
        futureDate.setResignDate(LocalDate.now().plusDays(1));
        BusinessException futureDateError = assertThrows(BusinessException.class,
                () -> service.updateEmployee(futureDate));
        assertTrue(futureDateError.getMessage().contains("暂不支持预约未来离职"));

        verify(employeeMapper, never()).update(org.mockito.ArgumentMatchers.any(OrgEmployee.class),
                org.mockito.ArgumentMatchers.any());
    }

    @Test
    void ordinaryEditMayKeepHistoricalResignedArchiveWithoutInventingDate() {
        OrgEmployeeMapper employeeMapper = mock(OrgEmployeeMapper.class);
        ISysUserService sysUserService = mock(ISysUserService.class);
        OrgEmployee existing = new OrgEmployee();
        existing.setId(99L);
        existing.setEmpCode("ZH099");
        existing.setName("历史离职员工");
        existing.setStatus(3);
        existing.setResignDate(null);
        when(employeeMapper.selectById(99L)).thenReturn(existing);
        when(employeeMapper.selectCount(org.mockito.ArgumentMatchers.any())).thenReturn(0L);
        when(employeeMapper.update(org.mockito.ArgumentMatchers.eq(existing),
                org.mockito.ArgumentMatchers.any())).thenReturn(1);
        OrgEmployeeServiceImpl service = new OrgEmployeeServiceImpl(
                employeeMapper, mock(DataScopeHelper.class), mock(SysUserMapper.class),
                mock(SysRoleMapper.class), mock(TokenService.class), sysUserService);
        ReflectionTestUtils.setField(service, "baseMapper", employeeMapper);
        login(false, List.of("hr"));

        EmployeeDTO dto = new EmployeeDTO();
        dto.setId(99L);
        dto.setName("历史离职员工（更新）");
        dto.setStatus(3);
        dto.setResignDate(null);
        dto.setResumeFileId(101L);
        dto.setEducationCertFileId(102L);
        dto.setSkillCertFileId(103L);
        dto.setIdCardFrontFileId(104L);
        dto.setIdCardBackFileId(105L);
        service.updateEmployee(dto);

        assertEquals(3, existing.getStatus());
        assertNull(existing.getResignDate());
        verify(employeeMapper).update(org.mockito.ArgumentMatchers.eq(existing),
                org.mockito.ArgumentMatchers.any());
        verify(sysUserService, never()).disableForResignation(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void staleOrdinaryEditCannotReviveResignedEmployeeOrReenableAccount() {
        OrgEmployeeMapper employeeMapper = mock(OrgEmployeeMapper.class);
        SysUserMapper userMapper = mock(SysUserMapper.class);
        ISysUserService sysUserService = mock(ISysUserService.class);
        OrgEmployee resigned = new OrgEmployee();
        resigned.setId(99L);
        resigned.setEmpCode("ZH099");
        resigned.setName("已离职员工");
        resigned.setStatus(3);
        resigned.setUserId(10L);
        when(employeeMapper.selectById(99L)).thenReturn(resigned);
        when(employeeMapper.selectCount(org.mockito.ArgumentMatchers.any())).thenReturn(0L);
        OrgEmployeeServiceImpl service = new OrgEmployeeServiceImpl(
                employeeMapper, mock(DataScopeHelper.class), userMapper,
                mock(SysRoleMapper.class), mock(TokenService.class), sysUserService);
        ReflectionTestUtils.setField(service, "baseMapper", employeeMapper);
        login(true, List.of("super_admin"));

        EmployeeDTO staleForm = new EmployeeDTO();
        staleForm.setId(99L);
        staleForm.setEmpCode("ZH099");
        staleForm.setName("旧页面中的在职员工");
        staleForm.setStatus(1);
        staleForm.setAccountEnabled(true);

        BusinessException thrown = assertThrows(BusinessException.class,
                () -> service.updateEmployee(staleForm));

        assertTrue(thrown.getMessage().contains("专用返聘流程"));
        verify(employeeMapper, never()).update(org.mockito.ArgumentMatchers.any(OrgEmployee.class),
                org.mockito.ArgumentMatchers.any());
        verifyNoInteractions(userMapper, sysUserService);
    }

    @Test
    void dedicatedResignationEndpointStateChangeAndAccountRevocationStayTogether() {
        OrgEmployeeMapper employeeMapper = mock(OrgEmployeeMapper.class);
        ISysUserService sysUserService = mock(ISysUserService.class);
        OrgEmployee employee = new OrgEmployee();
        employee.setId(99L);
        employee.setUserId(10L);
        employee.setStatus(1);
        when(employeeMapper.selectById(99L)).thenReturn(employee);
        when(employeeMapper.update(org.mockito.ArgumentMatchers.any(OrgEmployee.class),
                org.mockito.ArgumentMatchers.any())).thenReturn(1);
        OrgEmployeeServiceImpl service = new OrgEmployeeServiceImpl(
                employeeMapper, mock(DataScopeHelper.class), mock(SysUserMapper.class),
                mock(SysRoleMapper.class), mock(TokenService.class), sysUserService);

        EmployeeResignDTO dto = new EmployeeResignDTO();
        dto.setResignDate(LocalDate.now());
        service.resignEmployee(99L, dto);

        assertEquals(3, employee.getStatus());
        assertEquals(LocalDate.now(), employee.getResignDate());
        verify(employeeMapper).update(org.mockito.ArgumentMatchers.any(OrgEmployee.class),
                org.mockito.ArgumentMatchers.any());
        verify(sysUserService).disableForResignation(10L);
    }

    @Test
    void repeatedDedicatedResignationWithSameDateRevokesAccountAgainWithoutUpdatingArchive() {
        OrgEmployeeMapper employeeMapper = mock(OrgEmployeeMapper.class);
        ISysUserService sysUserService = mock(ISysUserService.class);
        LocalDate recordedResignDate = LocalDate.now().minusDays(2);
        OrgEmployee employee = new OrgEmployee();
        employee.setId(99L);
        employee.setUserId(10L);
        employee.setStatus(3);
        employee.setResignDate(recordedResignDate);
        when(employeeMapper.selectById(99L)).thenReturn(employee);
        OrgEmployeeServiceImpl service = new OrgEmployeeServiceImpl(
                employeeMapper, mock(DataScopeHelper.class), mock(SysUserMapper.class),
                mock(SysRoleMapper.class), mock(TokenService.class), sysUserService);

        EmployeeResignDTO dto = new EmployeeResignDTO();
        dto.setResignDate(recordedResignDate);
        service.resignEmployee(99L, dto);

        assertEquals(recordedResignDate, employee.getResignDate());
        verify(employeeMapper, never()).update(org.mockito.ArgumentMatchers.any(OrgEmployee.class),
                org.mockito.ArgumentMatchers.any());
        verify(sysUserService).disableForResignation(10L);
    }

    @Test
    void failedConditionalResignationUpdateDoesNotRevokeAccount() {
        OrgEmployeeMapper employeeMapper = mock(OrgEmployeeMapper.class);
        ISysUserService sysUserService = mock(ISysUserService.class);
        OrgEmployee employee = new OrgEmployee();
        employee.setId(99L);
        employee.setUserId(10L);
        employee.setStatus(1);
        when(employeeMapper.selectById(99L)).thenReturn(employee);
        when(employeeMapper.update(org.mockito.ArgumentMatchers.any(OrgEmployee.class),
                org.mockito.ArgumentMatchers.any())).thenReturn(0);
        OrgEmployeeServiceImpl service = new OrgEmployeeServiceImpl(
                employeeMapper, mock(DataScopeHelper.class), mock(SysUserMapper.class),
                mock(SysRoleMapper.class), mock(TokenService.class), sysUserService);

        EmployeeResignDTO dto = new EmployeeResignDTO();
        dto.setResignDate(LocalDate.now());
        BusinessException thrown = assertThrows(BusinessException.class,
                () -> service.resignEmployee(99L, dto));

        assertTrue(thrown.getMessage().contains("员工状态已变化"));
        assertEquals(1, employee.getStatus());
        assertNull(employee.getResignDate());
        verify(employeeMapper).update(org.mockito.ArgumentMatchers.any(OrgEmployee.class),
                org.mockito.ArgumentMatchers.any());
        verify(sysUserService, never()).disableForResignation(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void draftEmployeeCannotBeResigned() {
        OrgEmployeeMapper employeeMapper = mock(OrgEmployeeMapper.class);
        ISysUserService sysUserService = mock(ISysUserService.class);
        OrgEmployee employee = new OrgEmployee();
        employee.setId(99L);
        employee.setUserId(10L);
        employee.setStatus(0);
        when(employeeMapper.selectById(99L)).thenReturn(employee);
        OrgEmployeeServiceImpl service = new OrgEmployeeServiceImpl(
                employeeMapper, mock(DataScopeHelper.class), mock(SysUserMapper.class),
                mock(SysRoleMapper.class), mock(TokenService.class), sysUserService);

        EmployeeResignDTO dto = new EmployeeResignDTO();
        dto.setResignDate(LocalDate.now());
        BusinessException thrown = assertThrows(BusinessException.class,
                () -> service.resignEmployee(99L, dto));

        assertTrue(thrown.getMessage().contains("仅在职或试用员工可以办理离职"));
        assertEquals(0, employee.getStatus());
        verify(employeeMapper, never()).update(org.mockito.ArgumentMatchers.any(OrgEmployee.class),
                org.mockito.ArgumentMatchers.any());
        verify(sysUserService, never()).disableForResignation(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void dedicatedResignationRejectsDateBeforeHireDateWithoutChangingArchiveOrAccount() {
        OrgEmployeeMapper employeeMapper = mock(OrgEmployeeMapper.class);
        ISysUserService sysUserService = mock(ISysUserService.class);
        OrgEmployee employee = new OrgEmployee();
        employee.setId(99L);
        employee.setUserId(10L);
        employee.setStatus(1);
        employee.setHireDate(LocalDate.now().minusDays(3));
        when(employeeMapper.selectById(99L)).thenReturn(employee);
        OrgEmployeeServiceImpl service = new OrgEmployeeServiceImpl(
                employeeMapper, mock(DataScopeHelper.class), mock(SysUserMapper.class),
                mock(SysRoleMapper.class), mock(TokenService.class), sysUserService);

        EmployeeResignDTO dto = new EmployeeResignDTO();
        dto.setResignDate(LocalDate.now().minusDays(4));
        BusinessException thrown = assertThrows(BusinessException.class,
                () -> service.resignEmployee(99L, dto));

        assertTrue(thrown.getMessage().contains("离职日期不能早于入职日期"));
        assertEquals(1, employee.getStatus());
        verify(employeeMapper, never()).update(org.mockito.ArgumentMatchers.any(OrgEmployee.class),
                org.mockito.ArgumentMatchers.any());
        verify(sysUserService, never()).disableForResignation(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void repeatedDedicatedResignationCannotOverwriteARecordedRealDate() {
        OrgEmployeeMapper employeeMapper = mock(OrgEmployeeMapper.class);
        ISysUserService sysUserService = mock(ISysUserService.class);
        OrgEmployee employee = new OrgEmployee();
        employee.setId(99L);
        employee.setUserId(10L);
        employee.setStatus(3);
        employee.setResignDate(LocalDate.now().minusDays(2));
        when(employeeMapper.selectById(99L)).thenReturn(employee);
        OrgEmployeeServiceImpl service = new OrgEmployeeServiceImpl(
                employeeMapper, mock(DataScopeHelper.class), mock(SysUserMapper.class),
                mock(SysRoleMapper.class), mock(TokenService.class), sysUserService);

        EmployeeResignDTO dto = new EmployeeResignDTO();
        dto.setResignDate(LocalDate.now().minusDays(1));
        BusinessException thrown = assertThrows(BusinessException.class,
                () -> service.resignEmployee(99L, dto));

        assertTrue(thrown.getMessage().contains("日期已变化"));
        assertEquals(LocalDate.now().minusDays(2), employee.getResignDate());
        verify(employeeMapper, never()).update(org.mockito.ArgumentMatchers.any(OrgEmployee.class),
                org.mockito.ArgumentMatchers.any());
        verify(sysUserService, never()).disableForResignation(10L);
    }

    @Test
    void resignedEmployeeCannotBeReenabledThroughEmployeeAccountEndpoint() {
        OrgEmployeeMapper employeeMapper = mock(OrgEmployeeMapper.class);
        OrgEmployee employee = new OrgEmployee();
        employee.setId(99L);
        employee.setUserId(10L);
        employee.setStatus(3);
        when(employeeMapper.selectById(99L)).thenReturn(employee);
        OrgEmployeeServiceImpl service = employeeService(
                employeeMapper, mock(DataScopeHelper.class), mock(SysUserMapper.class),
                mock(SysRoleMapper.class), mock(TokenService.class));
        login(true, List.of("super_admin"));

        BusinessException thrown = assertThrows(BusinessException.class,
                () -> service.updateEmployeeAccountStatus(99L, true));

        assertTrue(thrown.getMessage().contains("离职员工不能启用"));
    }

    @Test
    void ordinaryEmployeeEditCannotActAsAnImplicitRehire() {
        OrgEmployeeMapper employeeMapper = mock(OrgEmployeeMapper.class);
        SysUserMapper userMapper = mock(SysUserMapper.class);
        TokenService tokenService = mock(TokenService.class);
        ISysUserService sysUserService = mock(ISysUserService.class);
        OrgEmployee employee = new OrgEmployee();
        employee.setId(99L);
        employee.setEmpCode("ZH099");
        employee.setUserId(10L);
        employee.setStatus(3);
        when(employeeMapper.selectById(99L)).thenReturn(employee);
        when(employeeMapper.selectCount(org.mockito.ArgumentMatchers.any())).thenReturn(0L);
        OrgEmployeeServiceImpl service = new OrgEmployeeServiceImpl(
                employeeMapper, mock(DataScopeHelper.class), userMapper, mock(SysRoleMapper.class),
                tokenService, sysUserService);
        ReflectionTestUtils.setField(service, "baseMapper", employeeMapper);
        login(false, List.of("hr"));
        EmployeeDTO dto = new EmployeeDTO();
        dto.setId(99L);
        dto.setEmpCode("ZH099");
        dto.setName("返聘员工");
        dto.setStatus(1);

        BusinessException thrown = assertThrows(BusinessException.class,
                () -> service.updateEmployee(dto));

        assertTrue(thrown.getMessage().contains("专用返聘流程"));
        verify(employeeMapper, never()).update(org.mockito.ArgumentMatchers.any(OrgEmployee.class),
                org.mockito.ArgumentMatchers.any());
        verifyNoInteractions(userMapper);
        verify(sysUserService, never()).disableForResignation(10L);
        verify(tokenService, never()).invalidateLoginUserSafely(10L);
    }

    @Test
    void ordinarySelectionAndContractReminderUseDedicatedMinimalViews() throws Exception {
        Method options = OrgEmployeeController.class.getDeclaredMethod("options");
        Method contractExpiring = OrgEmployeeController.class.getDeclaredMethod("contractExpiring", Integer.class);

        String optionsReturn = options.getGenericReturnType().getTypeName();
        String contractReturn = contractExpiring.getGenericReturnType().getTypeName();
        assertTrue(optionsReturn.contains(EmployeeRosterVO.class.getName()));
        assertFalse(optionsReturn.contains(EmployeeVO.class.getName()));
        assertTrue(contractReturn.contains(EmployeeContractExpiryVO.class.getName()));
        assertFalse(contractReturn.contains("OrgEmployee"));
        assertNoSensitiveProperties(EmployeeRosterVO.class);
        assertNoSensitiveProperties(EmployeeContractExpiryVO.class);
    }

    @Test
    void minimalMapperQueriesNeverSelectWholeEmployeeRowOrSensitiveColumns() throws Exception {
        try (InputStream input = getClass().getClassLoader()
                .getResourceAsStream("mapper/org/OrgEmployeeMapper.xml")) {
            assertNotNull(input);
            String xml = new String(input.readAllBytes(), StandardCharsets.UTF_8);
            assertMinimalSelect(xml, "selectActiveOptions");
            assertMinimalSelect(xml, "selectContractExpiring");
        }
    }

    private void assertHrGuard(Class<?> controller, String methodName, Class<?>... parameterTypes)
            throws Exception {
        Method method = controller.getDeclaredMethod(methodName, parameterTypes);
        PreAuthorize annotation = method.getAnnotation(PreAuthorize.class);
        assertNotNull(annotation, () -> controller.getSimpleName() + "." + methodName + " 缺少后端门禁");
        assertTrue(annotation.value().contains("hasAnyRole"));
        assertTrue(annotation.value().contains("'hr'"));
    }

    private void assertAccountSecurityGuard(Class<?> controller, String methodName, Class<?>... parameterTypes)
            throws Exception {
        Method method = controller.getDeclaredMethod(methodName, parameterTypes);
        PreAuthorize annotation = method.getAnnotation(PreAuthorize.class);
        assertNotNull(annotation, () -> controller.getSimpleName() + "." + methodName + " 缺少账号安全门禁");
        assertTrue(annotation.value().contains("hasAnyRole"));
        assertTrue(annotation.value().contains("'boss'"));
        assertFalse(annotation.value().contains("'hr'"));
    }

    private boolean hasGuard(Class<?> controller, String methodName, Class<?>... parameterTypes)
            throws Exception {
        return controller.getDeclaredMethod(methodName, parameterTypes).isAnnotationPresent(PreAuthorize.class);
    }

    private void assertNoSensitiveProperties(Class<?> viewClass) throws Exception {
        Set<String> actual = Arrays.stream(Introspector.getBeanInfo(viewClass).getPropertyDescriptors())
                .map(descriptor -> descriptor.getName())
                .collect(Collectors.toSet());
        Set<String> leaked = SENSITIVE_EMPLOYEE_PROPERTIES.stream()
                .filter(actual::contains)
                .collect(Collectors.toSet());
        assertTrue(leaked.isEmpty(), () -> viewClass.getSimpleName() + " 泄露敏感字段: " + leaked);
    }

    private void assertMinimalSelect(String xml, String statementId) {
        String startMarker = "<select id=\"" + statementId + "\"";
        int start = xml.indexOf(startMarker);
        int end = xml.indexOf("</select>", start);
        assertTrue(start >= 0 && end > start, () -> "缺少 mapper 语句: " + statementId);
        String sql = xml.substring(start, end).toLowerCase();
        assertFalse(sql.contains("select e.*"), () -> statementId + " 不得查询完整员工行");
        for (String forbiddenColumn : Set.of(
                "id_card", "phone", "email", "address", "birth_date", "emergency_phone",
                "hr_docs", "resume_file_id", "id_card_front_file_id", "id_card_back_file_id")) {
            assertFalse(sql.contains(forbiddenColumn),
                    () -> statementId + " 不得查询敏感列 " + forbiddenColumn);
        }
    }

    private OrgEmployeeServiceImpl employeeService(OrgEmployeeMapper employeeMapper,
                                                    DataScopeHelper dataScopeHelper,
                                                    SysUserMapper userMapper,
                                                    SysRoleMapper roleMapper,
                                                    TokenService tokenService) {
        return new OrgEmployeeServiceImpl(
                employeeMapper, dataScopeHelper, userMapper, roleMapper, tokenService,
                mock(ISysUserService.class));
    }

    private void login(boolean admin, List<String> roles) {
        LoginUser loginUser = new LoginUser();
        loginUser.setUserId(admin ? 1L : 200L);
        loginUser.setUsername(admin ? "admin" : "hr-user");
        loginUser.setAdmin(admin);
        loginUser.setTenantId(1L);
        loginUser.setRoleKeys(roles);
        loginUser.setPermissions(Set.of());
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(loginUser, null, loginUser.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }
}
