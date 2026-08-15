package com.zhehang.erp.modules.system;

import com.zhehang.erp.modules.system.controller.SysDictController;
import com.zhehang.erp.modules.system.controller.SysLogController;
import com.zhehang.erp.modules.system.domain.entity.SysDictData;
import com.zhehang.erp.modules.system.domain.entity.SysDictType;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.prepost.PreAuthorize;

import java.lang.reflect.Method;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class SensitiveSettingsControllerSecurityTest {

    private static final String ROLE_ADMIN_GATE =
            "@perm.hasAnyRole('boss', 'super_admin')";
    private static final String UNIQUE_PLATFORM_ACCOUNT_GATE =
            "T(java.lang.Long).valueOf('1').equals(T(com.zhehang.erp.common.core.utils.SecurityUtils).getCurrentUserId())";

    @Test
    void dictionaryManagementIsAdminOnlyAndLegacyRawReadEndpointIsRemoved()
            throws Exception {
        assertGuarded(SysDictController.class, "typeList",
                Integer.class, Integer.class, String.class, String.class, Integer.class);
        assertGuarded(SysDictController.class, "typeAll");
        assertGuarded(SysDictController.class, "typeInfo", Long.class);
        assertGuarded(SysDictController.class, "typeAdd", SysDictType.class);
        assertGuarded(SysDictController.class, "typeEdit", SysDictType.class);
        assertGuarded(SysDictController.class, "typeRemove", Long.class);
        assertGuarded(SysDictController.class, "dataList", String.class);
        assertGuarded(SysDictController.class, "dataInfo", Long.class);
        assertGuarded(SysDictController.class, "dataAdd", SysDictData.class);
        assertGuarded(SysDictController.class, "dataEdit", SysDictData.class);
        assertGuarded(SysDictController.class, "dataRemove", Long.class);

        assertThatThrownBy(() -> SysDictController.class.getDeclaredMethod("dataEnabled", String.class))
                .isInstanceOf(NoSuchMethodException.class);
    }

    @Test
    void globalAuditLogsAreRestrictedToTheUniquePlatformAccount() {
        assertUniquePlatformAccountGuarded(SysLogController.class);
    }

    private void assertUniquePlatformAccountGuarded(Class<?> controllerClass) {
        PreAuthorize annotation = controllerClass.getAnnotation(PreAuthorize.class);
        assertThat(annotation)
                .as("%s must have a unique-platform-account class gate", controllerClass.getSimpleName())
                .isNotNull();
        assertThat(annotation.value()).isEqualTo(UNIQUE_PLATFORM_ACCOUNT_GATE);
    }

    private void assertGuarded(Class<?> controllerClass, String methodName,
                               Class<?>... parameterTypes) throws Exception {
        Method method = controllerClass.getDeclaredMethod(methodName, parameterTypes);
        PreAuthorize annotation = method.getAnnotation(PreAuthorize.class);
        assertThat(annotation)
                .as("%s.%s must have a platform-admin gate",
                        controllerClass.getSimpleName(), methodName)
                .isNotNull();
        assertThat(annotation.value()).isEqualTo(ROLE_ADMIN_GATE);
    }

}
