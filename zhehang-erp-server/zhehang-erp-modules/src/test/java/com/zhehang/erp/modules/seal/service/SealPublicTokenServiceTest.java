package com.zhehang.erp.modules.seal.service;

import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.util.Collection;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class SealPublicTokenServiceTest {

    private StringRedisTemplate redis;
    private ValueOperations<String, String> values;
    private SealPublicTokenService service;

    @SuppressWarnings("unchecked")
    @BeforeEach
    void setUp() {
        redis = mock(StringRedisTemplate.class);
        values = mock(ValueOperations.class);
        when(redis.opsForValue()).thenReturn(values);
        service = new SealPublicTokenService(redis);
    }

    @Test
    void issueCreatesStrongTenantBoundTicketWithoutUsingRawTokenAsRedisKey() {
        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(SecurityUtils::getCurrentTenantId).thenReturn(7L);
            security.when(SecurityUtils::getCurrentUserId).thenReturn(19L);

            SealPublicTokenService.IssuedToken issued = service.issue();

            assertThat(issued.token()).matches("[0-9a-f]{64}");
            assertThat(issued.expiresAt()).isGreaterThan(System.currentTimeMillis());
            verify(values).set(anyString(), eq("7:19"), eq(86_400L), eq(TimeUnit.SECONDS));
        }
    }

    @Test
    void expiredOrMalformedTicketFailsClosed() {
        String token = "a".repeat(64);
        when(values.get(anyString())).thenReturn(null);

        assertThatThrownBy(() -> service.require(token))
                .isInstanceOf(BusinessException.class)
                .extracting("code").isEqualTo(410);
        assertThatThrownBy(() -> service.require("guessable"))
                .isInstanceOf(BusinessException.class)
                .extracting("code").isEqualTo(410);
    }

    @Test
    void submissionLockPreventsDuplicateConcurrentOrder() {
        String token = "b".repeat(64);
        when(values.get(anyString())).thenReturn("7:19");
        when(values.setIfAbsent(anyString(), eq("1"), anyLong(), eq(TimeUnit.SECONDS))).thenReturn(false);

        assertThatThrownBy(() -> service.beginSubmission(token))
                .isInstanceOf(BusinessException.class)
                .extracting("code").isEqualTo(409);
    }

    @Test
    void submissionChecksTicketOnlyAfterLockSoCompletedTokenCannotBeReused() {
        String token = "e".repeat(64);
        when(values.setIfAbsent(anyString(), eq("1"), anyLong(), eq(TimeUnit.SECONDS))).thenReturn(true);
        when(values.get(anyString())).thenReturn(null);

        assertThatThrownBy(() -> service.beginSubmission(token))
                .isInstanceOf(BusinessException.class)
                .extracting("code").isEqualTo(410);

        org.mockito.InOrder order = inOrder(values, redis);
        order.verify(values).setIfAbsent(anyString(), eq("1"), anyLong(), eq(TimeUnit.SECONDS));
        order.verify(values).get(anyString());
        order.verify(redis).delete(anyString());
    }

    @Test
    void completionDeletesTokenAndSubmissionLock() {
        String token = "c".repeat(64);

        service.completeSubmission(token);

        verify(redis).delete(any(Collection.class));
    }
}
