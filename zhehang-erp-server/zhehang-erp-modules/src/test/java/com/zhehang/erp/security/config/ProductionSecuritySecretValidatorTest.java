package com.zhehang.erp.security.config;

import org.junit.jupiter.api.Test;

import java.security.SecureRandom;
import java.util.Base64;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ProductionSecuritySecretValidatorTest {

    @Test
    void acceptsStrongProductionSecrets() {
        byte[] mfaKey = new byte[32];
        new SecureRandom().nextBytes(mfaKey);

        assertThatCode(() -> new ProductionSecuritySecretValidator(
                "jwt-secret-with-at-least-thirty-two-random-bytes",
                Base64.getEncoder().encodeToString(mfaKey)).afterPropertiesSet())
                .doesNotThrowAnyException();
    }

    @Test
    void rejectsMissingWeakOrPlaceholderJwtSecrets() {
        assertThatThrownBy(() -> ProductionSecuritySecretValidator.validateJwtSecret("short"))
                .isInstanceOf(IllegalStateException.class);
        assertThatThrownBy(() -> ProductionSecuritySecretValidator.validateJwtSecret("CHANGE_ME_WITH_AT_LEAST_32_RANDOM_BYTES"))
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    void rejectsMalformedOrWrongLengthMfaKeys() {
        assertThatThrownBy(() -> ProductionSecuritySecretValidator.validateMfaEncryptionKey("not-base64"))
                .isInstanceOf(IllegalStateException.class);
        assertThatThrownBy(() -> ProductionSecuritySecretValidator.validateMfaEncryptionKey(
                Base64.getEncoder().encodeToString(new byte[16])))
                .isInstanceOf(IllegalStateException.class);
        assertThatThrownBy(() -> ProductionSecuritySecretValidator.validateMfaEncryptionKey(
                "CHANGE_ME_WITH_BASE64_32_RANDOM_BYTES"))
                .isInstanceOf(IllegalStateException.class);
    }
}
