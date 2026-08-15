package com.zhehang.erp.modules.feigetask;

import com.zhehang.erp.modules.feigetask.controller.FeigeTaskController;
import org.junit.jupiter.api.Test;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.lang.reflect.Method;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class FeigeTaskControllerContractTest {

    @Test
    void controllerUsesIsolatedBasePath() {
        RequestMapping mapping = FeigeTaskController.class.getAnnotation(RequestMapping.class);
        assertEquals(Set.of("/feige-task"), Set.of(mapping.value()));
    }

    @Test
    void exposesFrontendContractRoutes() {
        Set<String> routes = Arrays.stream(FeigeTaskController.class.getDeclaredMethods())
                .flatMap(method -> mappings(method).stream())
                .collect(Collectors.toSet());
        assertTrue(routes.contains("GET /staff-options"));
        assertTrue(routes.contains("GET /capabilities"));
        assertTrue(routes.contains("GET /order-options"));
        assertTrue(routes.contains("GET /bridge-rules"));
        assertTrue(routes.contains("POST /bridge-rules"));
        assertTrue(routes.contains("PUT /bridge-rules/{id}"));
        assertTrue(routes.contains("GET /bridge-runs"));
        assertTrue(routes.contains("POST /bridge-runs/{id}/retry"));
        assertTrue(routes.contains("GET /business"));
        assertTrue(routes.contains("POST /business"));
        assertTrue(routes.contains("POST /business/{id}/{action}"));
        assertTrue(routes.contains("POST /audit"));
        assertTrue(routes.contains("GET /audit/processes"));
        assertTrue(routes.contains("GET /audit/processes/{id}"));
        assertTrue(routes.contains("POST /audit/processes"));
        assertTrue(routes.contains("PUT /audit/processes/{id}"));
        assertTrue(routes.contains("POST /audit/{id}/action"));
        assertTrue(routes.contains("GET /audit/order/{orderId}/payments"));
        assertTrue(routes.contains("GET /workflow/month-stats"));
        assertTrue(routes.contains("GET /workflow/required-scopes"));
        assertTrue(routes.contains("POST /goals/{id}/status"));
        assertTrue(routes.contains("GET /templates"));
        assertTrue(routes.contains("GET /subordinates/detail"));
    }

    @Test
    void productionCapabilitiesExposeOnlyImplementedBridgeAndContractHooks() throws Exception {
        String source = Files.readString(Path.of(
                "src/main/java/com/zhehang/erp/modules/feigetask/controller/FeigeTaskController.java"));
        assertTrue(source.contains("\"bridgeTriggerSupported\", true"));
        assertTrue(source.contains("\"contractConversionSupported\", true"));
        assertTrue(source.contains("\"addressConversionSupported\", false"));
    }

    private Set<String> mappings(Method method) {
        java.util.LinkedHashSet<String> result = new java.util.LinkedHashSet<>();
        GetMapping get = method.getAnnotation(GetMapping.class);
        PostMapping post = method.getAnnotation(PostMapping.class);
        PutMapping put = method.getAnnotation(PutMapping.class);
        DeleteMapping delete = method.getAnnotation(DeleteMapping.class);
        if (get != null) Arrays.stream(get.value()).map(path -> "GET " + path).forEach(result::add);
        if (post != null) Arrays.stream(post.value()).map(path -> "POST " + path).forEach(result::add);
        if (put != null) Arrays.stream(put.value()).map(path -> "PUT " + path).forEach(result::add);
        if (delete != null) Arrays.stream(delete.value()).map(path -> "DELETE " + path).forEach(result::add);
        return result;
    }
}
