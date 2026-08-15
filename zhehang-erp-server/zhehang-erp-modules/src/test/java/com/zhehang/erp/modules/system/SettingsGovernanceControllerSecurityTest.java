package com.zhehang.erp.modules.system;

import com.zhehang.erp.modules.system.controller.SettingsGovernanceController;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;

import java.lang.reflect.Method;

import static org.assertj.core.api.Assertions.assertThat;

class SettingsGovernanceControllerSecurityTest {

    private static final String SETTINGS_ADMIN_GATE =
            "@perm.hasAnyRole('boss', 'super_admin')";

    @Test
    void rulesAndFieldsRequireBossOrSuperAdmin() throws Exception {
        assertAdminGuard("rules");
        assertAdminGuard("fields");
    }

    @Test
    void optionsRemainReadableToAuthenticatedBusinessPages() throws Exception {
        assertThat(SettingsGovernanceController.class.getAnnotation(PreAuthorize.class)).isNull();

        Method options = SettingsGovernanceController.class.getDeclaredMethod("options", String.class);
        PreAuthorize guard = options.getAnnotation(PreAuthorize.class);
        assertThat(guard)
                .as("option consumers must keep the application's normal authenticated-user boundary")
                .isNotNull();
        assertThat(guard.value()).isEqualTo("isAuthenticated()");
    }

    @Test
    void governanceControllerDoesNotExposeGenericMutationEndpoint() {
        assertThat(SettingsGovernanceController.class.getDeclaredMethods())
                .allSatisfy(method -> {
                    assertThat(method.getAnnotation(PostMapping.class)).isNull();
                    assertThat(method.getAnnotation(PutMapping.class)).isNull();
                    assertThat(method.getAnnotation(PatchMapping.class)).isNull();
                    assertThat(method.getAnnotation(DeleteMapping.class)).isNull();
                });
    }

    private void assertAdminGuard(String methodName) throws Exception {
        Method method = SettingsGovernanceController.class.getDeclaredMethod(methodName);
        PreAuthorize guard = method.getAnnotation(PreAuthorize.class);
        assertThat(guard)
                .as("SettingsGovernanceController.%s must keep the settings admin gate", methodName)
                .isNotNull();
        assertThat(guard.value()).isEqualTo(SETTINGS_ADMIN_GATE);
    }
}
