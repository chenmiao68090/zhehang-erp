package com.zhehang.erp.modules.auth;

import com.zhehang.erp.common.core.annotation.DenyDuringImpersonation;
import com.zhehang.erp.modules.auth.controller.AuthController;
import com.zhehang.erp.modules.org.controller.OrgEmployeeController;
import com.zhehang.erp.modules.org.domain.dto.EmployeeDTO;
import com.zhehang.erp.modules.system.controller.SysUserController;
import com.zhehang.erp.modules.system.domain.dto.PasswordChangeDTO;
import com.zhehang.erp.modules.system.domain.dto.PasswordResetDTO;
import com.zhehang.erp.modules.system.domain.dto.UserDTO;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.Test;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import java.beans.Introspector;
import java.lang.reflect.Method;
import java.lang.reflect.Parameter;
import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;

class AccountSecurityControllerContractTest {

    @Test
    void loginPasswordRefreshTokenAndPasswordChangesAreJsonRequestBodies() throws Exception {
        assertRequestBody(AuthController.class, "login",
                AuthController.LoginRequest.class, HttpServletRequest.class, HttpServletResponse.class);
        assertRequestBody(AuthController.class, "refresh", AuthController.RefreshRequest.class,
                HttpServletRequest.class, HttpServletResponse.class);
        assertRequestBody(AuthController.class, "changeInitialPassword",
                AuthController.FirstPasswordRequest.class);
        assertRequestBody(SysUserController.class, "resetPwd", PasswordResetDTO.class);
        assertRequestBody(SysUserController.class, "updateMyPassword", PasswordChangeDTO.class);

        assertThat(AuthController.class.getMethod("login",
                        AuthController.LoginRequest.class, HttpServletRequest.class, HttpServletResponse.class)
                .getAnnotation(GetMapping.class)).isNull();
    }

    @Test
    void accountAndEmployeeCreateDtosCannotAcceptCallerSuppliedPasswords() throws Exception {
        assertThat(properties(UserDTO.class)).doesNotContain("password");
        assertThat(properties(EmployeeDTO.class)).doesNotContain("password");
        assertThat(properties(AuthController.RegisterRequest.class)).doesNotContain("password");
        assertThat(properties(PasswordResetDTO.class)).containsExactlyInAnyOrder("class", "userId");
    }

    @Test
    void employeeResetCarriesOnlyEmployeeIdInPathAndNoPasswordParameter() throws Exception {
        Method method = OrgEmployeeController.class.getMethod("resetPassword", Long.class);
        assertThat(method.getParameters()).hasSize(1);
        assertThat(Arrays.stream(method.getParameters())
                .map(Parameter::getName)
                .noneMatch(name -> name.toLowerCase().contains("password"))).isTrue();
    }

    @Test
    void accountSecurityMutationsAreBlockedDuringEmployeeImpersonation() throws Exception {
        assertDeniedDuringImpersonation(AuthController.class, "register", AuthController.RegisterRequest.class);
        assertDeniedDuringImpersonation(AuthController.class, "revokeAllSessions", HttpServletRequest.class);
        assertDeniedDuringImpersonation(SysUserController.class, "add", UserDTO.class);
        assertDeniedDuringImpersonation(SysUserController.class, "resetPwd", PasswordResetDTO.class);
        assertDeniedDuringImpersonation(SysUserController.class, "resetMfa", PasswordResetDTO.class);
        assertDeniedDuringImpersonation(SysUserController.class, "updateMyPassword", PasswordChangeDTO.class);
        assertDeniedDuringImpersonation(OrgEmployeeController.class, "resetPassword", Long.class);
    }

    private void assertRequestBody(Class<?> controller, String methodName, Class<?>... parameterTypes)
            throws Exception {
        Method method = controller.getMethod(methodName, parameterTypes);
        assertThat(method.getParameters()[0].getAnnotation(RequestBody.class)).isNotNull();
        assertThat(method.getParameters()[0].getAnnotation(RequestParam.class)).isNull();
    }

    private void assertDeniedDuringImpersonation(
            Class<?> controller, String methodName, Class<?>... parameterTypes) throws Exception {
        assertThat(controller.getMethod(methodName, parameterTypes)
                .getAnnotation(DenyDuringImpersonation.class)).isNotNull();
    }

    private Set<String> properties(Class<?> type) throws Exception {
        return Arrays.stream(Introspector.getBeanInfo(type).getPropertyDescriptors())
                .map(descriptor -> descriptor.getName())
                .collect(Collectors.toSet());
    }
}
