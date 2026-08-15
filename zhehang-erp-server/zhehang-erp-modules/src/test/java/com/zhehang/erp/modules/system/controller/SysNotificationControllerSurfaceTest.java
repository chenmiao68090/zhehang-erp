package com.zhehang.erp.modules.system.controller;

import org.junit.jupiter.api.Test;
import org.springframework.web.bind.annotation.PostMapping;

import java.lang.reflect.Method;
import java.util.Arrays;

import static org.assertj.core.api.Assertions.assertThat;

class SysNotificationControllerSurfaceTest {

    @Test
    void authenticatedClientsCannotCreateNotificationsForArbitraryUsers() {
        Method[] methods = SysNotificationController.class.getDeclaredMethods();

        assertThat(Arrays.stream(methods)
                .filter(method -> method.isAnnotationPresent(PostMapping.class)))
                .isEmpty();
        assertThat(Arrays.stream(methods).map(Method::getName))
                .doesNotContain("create", "asStr", "parseLong", "parseInt");
    }
}
