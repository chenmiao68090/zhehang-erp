package com.zhehang.erp.security.domain;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.PropertyAccessor;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.jsontype.impl.LaissezFaireSubTypeValidator;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.Test;
import org.springframework.data.redis.serializer.Jackson2JsonRedisSerializer;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class LoginUserRedisSerializationTest {

    private final Jackson2JsonRedisSerializer<Object> serializer = productionSerializer();

    @Test
    void ordinaryLoginUserRoundTripsThroughProductionRedisSerializer() {
        LoginUser original = baseLoginUser();

        byte[] payload = serializer.serialize(original);
        assertThat(payload).isNotNull();
        assertThat(new String(payload, StandardCharsets.UTF_8))
                .doesNotContain("\"effectiveUserId\"")
                .doesNotContain("\"impersonating\"");
        LoginUser restored = deserialize(payload);

        assertThat(restored.getUserId()).isEqualTo(21L);
        assertThat(restored.getUsername()).isEqualTo("ordinary-user");
        assertThat(restored.getTenantId()).isEqualTo(7L);
        assertThat(restored.getPermissions()).containsExactlyInAnyOrder("crm:lead:list", "crm:customer:list");
        assertThat(restored.getRoleKeys()).containsExactly("sales");
        assertThat(restored.isImpersonating()).isFalse();
    }

    @Test
    void impersonationLoginUserRoundTripsWithoutSerializingDerivedFlag() {
        LoginUser original = impersonationLoginUser();

        byte[] payload = serializer.serialize(original);
        assertThat(payload).isNotNull();
        Object value = serializer.deserialize(payload);
        assertThat(new String(payload, StandardCharsets.UTF_8))
                .doesNotContain("\"effectiveUserId\"")
                .doesNotContain("\"impersonating\"");
        assertThat(value).isInstanceOf(LoginUser.class);
        LoginUser restored = (LoginUser) value;
        assertThat(restored.getUserId()).isEqualTo(21L);
        assertThat(restored.getActorUserId()).isEqualTo(3L);
        assertThat(restored.getImpersonationSessionId()).isEqualTo("imp-session-001");
        assertThat(restored.getImpersonationTabId()).isEqualTo("tab-001");
        assertThat(restored.isImpersonating()).isTrue();
    }

    @Test
    void legacyPayloadContainingDerivedFlagStillDeserializes() {
        byte[] currentPayload = serializer.serialize(impersonationLoginUser());
        assertThat(currentPayload).isNotNull();
        String currentJson = new String(currentPayload, StandardCharsets.UTF_8);
        int objectEnd = currentJson.lastIndexOf('}');
        assertThat(objectEnd).isPositive();
        String legacyJson = currentJson.substring(0, objectEnd)
                + ",\"effectiveUserId\":21,\"impersonating\":true"
                + currentJson.substring(objectEnd);

        Object value = serializer.deserialize(legacyJson.getBytes(StandardCharsets.UTF_8));

        assertThat(value).isInstanceOf(LoginUser.class);
        LoginUser restored = (LoginUser) value;
        assertThat(restored.getUserId()).isEqualTo(21L);
        assertThat(restored.getImpersonationSessionId()).isEqualTo("imp-session-001");
        assertThat(restored.isImpersonating()).isTrue();
    }

    private LoginUser deserialize(byte[] payload) {
        Object value = serializer.deserialize(payload);
        assertThat(value).isInstanceOf(LoginUser.class);
        return (LoginUser) value;
    }

    private LoginUser baseLoginUser() {
        LoginUser user = new LoginUser();
        user.setUserId(21L);
        user.setUsername("ordinary-user");
        user.setPassword("test-password");
        user.setTenantId(7L);
        user.setDeptId(9L);
        user.setDataScope(4);
        user.setPermissions(new HashSet<>(Set.of("crm:lead:list", "crm:customer:list")));
        user.setRoleKeys(new ArrayList<>(List.of("sales")));
        user.setAuthVersion(12L);
        user.setUserAuthVersion(34L);
        user.setAuthVersionBound(true);
        return user;
    }

    private LoginUser impersonationLoginUser() {
        LoginUser user = baseLoginUser();
        user.setActorUserId(3L);
        user.setActorUsername("platform-owner");
        user.setActorSessionId("actor-session-001");
        user.setActorUserAuthVersion(56L);
        user.setImpersonationSessionId("imp-session-001");
        user.setImpersonationTabId("tab-001");
        user.setImpersonationStartTime(1_720_000_000_000L);
        user.setImpersonationExpireTime(1_720_001_800_000L);
        return user;
    }

    /** Mirrors RedisConfig exactly so this test exercises the production cache boundary. */
    private static Jackson2JsonRedisSerializer<Object> productionSerializer() {
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.setVisibility(PropertyAccessor.ALL, JsonAutoDetect.Visibility.ANY);
        objectMapper.activateDefaultTyping(
                LaissezFaireSubTypeValidator.instance,
                ObjectMapper.DefaultTyping.NON_FINAL);
        objectMapper.registerModule(new JavaTimeModule());
        return new Jackson2JsonRedisSerializer<>(objectMapper, Object.class);
    }
}
