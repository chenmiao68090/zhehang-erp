package com.zhehang.erp.modules.system;

import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.contract.controller.BizContractController;
import com.zhehang.erp.modules.contract.domain.BizContractTemplate;
import com.zhehang.erp.modules.auth.controller.AuthController;
import com.zhehang.erp.modules.crm.controller.YunkeController;
import com.zhehang.erp.modules.report.controller.ReportDataController;
import com.zhehang.erp.modules.report.controller.ReportDefinitionController;
import com.zhehang.erp.modules.report.controller.ReportScheduleController;
import com.zhehang.erp.modules.system.controller.SysMenuController;
import com.zhehang.erp.modules.system.controller.SysRoleController;
import com.zhehang.erp.modules.system.controller.SysUserController;
import com.zhehang.erp.security.domain.LoginUser;
import com.zhehang.erp.security.service.PermissionService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.lang.reflect.Method;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SystemSettingsSecurityContractTest {

    private final PermissionService permissionService = new PermissionService();

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void copiedManagerRoleInheritsTemplateRoleForBackendChecks() {
        login(false, List.of("dept_manager__copied"), Set.of());

        assertTrue(permissionService.hasAnyRole("dept_manager"));
        assertTrue(SecurityUtils.hasAnyRole("dept_manager"));
        assertFalse(permissionService.hasAnyRole("hr"));
    }

    @Test
    void adminPassesRoleGateWithoutDependingOnMenuPermissionRows() {
        login(true, List.of(), Set.of());

        assertTrue(permissionService.hasAnyRole("boss"));
        assertTrue(permissionService.hasModule("crm"));
    }

    @Test
    void ordinaryStaffCannotPassManagerOrCrmModuleGate() {
        login(false, List.of("staff"), Set.of());

        assertFalse(permissionService.hasAnyRole("dept_manager", "manager", "boss"));
        assertFalse(permissionService.hasModule("crm"));
    }

    @Test
    void sensitiveIntegrationAndReportControllersKeepMethodSecurityContracts() throws Exception {
        assertClassGuard(ReportDataController.class);
        assertClassGuard(ReportDefinitionController.class);
        assertClassGuard(ReportScheduleController.class);
        assertNull(SysRoleController.class.getAnnotation(PreAuthorize.class),
                "role catalog reads must remain available to approval/HR callers with system:role:list");
        assertMethodGuard(SysRoleController.class, "list", Integer.class, Integer.class,
                String.class, String.class, Integer.class);
        assertMethodGuard(SysRoleController.class, "all");
        assertBossMutationGuard(SysRoleController.class, "add",
                com.zhehang.erp.modules.system.domain.dto.RoleDTO.class);
        assertBossMutationGuard(SysRoleController.class, "edit",
                com.zhehang.erp.modules.system.domain.dto.RoleDTO.class);
        assertBossMutationGuard(SysRoleController.class, "permissionSettings",
                com.zhehang.erp.modules.system.domain.dto.RolePermissionSettingsDTO.class);
        assertFalse(java.util.Arrays.stream(SysRoleController.class.getDeclaredMethods())
                        .anyMatch(method -> method.getName().equals("assignMenus")
                                || method.getName().equals("dataScope")
                                || method.getName().equals("visibleModules")),
                "legacy split permission write endpoints must stay removed");
        assertMethodGuard(SysUserController.class, "list", Integer.class, Integer.class,
                String.class, String.class, Integer.class);

        assertMethodGuard(YunkeController.class, "getConfig");
        assertMethodGuard(YunkeController.class, "saveConfig",
                com.zhehang.erp.modules.crm.domain.YunkeConfig.class);
        assertMethodGuard(YunkeController.class, "test");
        assertMethodGuard(YunkeController.class, "saveUserMap", List.class);
        assertMethodGuard(YunkeController.class, "enableDial", List.class);
        assertMethodGuard(YunkeController.class, "dial", Map.class);
        assertMethodGuard(YunkeController.class, "hangup", Map.class);
        assertMethodGuard(BizContractController.class, "saveTemplate", BizContractTemplate.class);
        assertMethodGuard(SysMenuController.class, "tree");
        assertMethodGuard(SysMenuController.class, "roleMenuTree", Long.class);
        assertMethodGuard(AuthController.class, "register", AuthController.RegisterRequest.class);
    }

    private void login(boolean admin, List<String> roles, Set<String> permissions) {
        LoginUser loginUser = new LoginUser();
        loginUser.setUserId(admin ? 99L : 200L);
        loginUser.setUsername(admin ? "boss-user" : "test-user");
        loginUser.setAdmin(admin);
        loginUser.setRoleKeys(roles);
        loginUser.setPermissions(permissions);
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(loginUser, null, loginUser.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    private void assertClassGuard(Class<?> controllerClass) {
        PreAuthorize annotation = controllerClass.getAnnotation(PreAuthorize.class);
        assertNotNull(annotation, () -> controllerClass.getSimpleName() + " must keep a class-level permission gate");
    }

    private void assertMethodGuard(Class<?> controllerClass, String methodName, Class<?>... parameterTypes)
            throws Exception {
        Method method = controllerClass.getDeclaredMethod(methodName, parameterTypes);
        PreAuthorize annotation = method.getAnnotation(PreAuthorize.class);
        assertNotNull(annotation,
                () -> controllerClass.getSimpleName() + "." + methodName + " must keep a permission gate");
    }

    private void assertBossMutationGuard(Class<?> controllerClass, String methodName, Class<?>... parameterTypes)
            throws Exception {
        Method method = controllerClass.getDeclaredMethod(methodName, parameterTypes);
        PreAuthorize annotation = method.getAnnotation(PreAuthorize.class);
        assertNotNull(annotation,
                () -> controllerClass.getSimpleName() + "." + methodName + " must keep a permission gate");
        assertTrue(annotation.value().contains("hasAnyRole('boss', 'super_admin')"),
                () -> controllerClass.getSimpleName() + "." + methodName + " must keep the boss mutation gate");
    }
}
