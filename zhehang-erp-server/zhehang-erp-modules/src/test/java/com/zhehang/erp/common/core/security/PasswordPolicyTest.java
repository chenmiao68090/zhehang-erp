package com.zhehang.erp.common.core.security;

import com.zhehang.erp.common.core.exception.BusinessException;
import org.junit.jupiter.api.Test;

import java.util.HashSet;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class PasswordPolicyTest {

    @Test
    void acceptsTenCharacterPasswordWithThreeCharacterClasses() {
        assertThatCode(() -> PasswordPolicy.validate("SecurePass9", "employee"))
                .doesNotThrowAnyException();
    }

    @Test
    void rejectsShortCommonSequentialRepeatedAndUsernamePasswords() {
        assertRejected("Short9!", "employee");
        assertRejected("Admin123456!", "employee");
        assertRejected("Secure1234!", "employee");
        assertRejected("Aaaaaaaa1!", "employee");
        assertRejected("Employee9!X", "employee");
    }

    @Test
    void generatedInitialPasswordsAreUniqueAndAlwaysPassThePolicy() {
        Set<String> generated = new HashSet<>();
        for (int i = 0; i < 100; i++) {
            String password = PasswordPolicy.generateInitialPassword();
            assertThat(password).hasSize(16);
            assertThatCode(() -> PasswordPolicy.validate(password, "employee"))
                    .doesNotThrowAnyException();
            generated.add(password);
        }
        assertThat(generated).hasSize(100);
    }

    private void assertRejected(String password, String username) {
        assertThatThrownBy(() -> PasswordPolicy.validate(password, username))
                .isInstanceOf(BusinessException.class);
    }
}
