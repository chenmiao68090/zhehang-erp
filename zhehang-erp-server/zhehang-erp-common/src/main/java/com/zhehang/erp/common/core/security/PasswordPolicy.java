package com.zhehang.erp.common.core.security;

import com.zhehang.erp.common.core.exception.BusinessException;

import java.security.SecureRandom;
import java.util.Locale;
import java.util.Set;

/**
 * 账号密码唯一安全口径。创建、重置、首次改密和个人改密都必须经过这里。
 */
public final class PasswordPolicy {

    public static final int MIN_LENGTH = 10;
    public static final int MAX_LENGTH = 128;

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final String LOWER = "abcdefghijkmnopqrstuvwxyz";
    private static final String UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    private static final String DIGITS = "23456789";
    private static final String SYMBOLS = "!@#$%*+-_=?";
    private static final String ALL = LOWER + UPPER + DIGITS + SYMBOLS;
    private static final Set<String> COMMON_PASSWORDS = Set.of(
            "123456", "12345678", "123456789", "1234567890", "111111", "000000",
            "password", "password1", "admin", "admin123", "qwerty", "qwerty123",
            "abc123", "iloveyou", "welcome", "zhehang", "zhehang123"
    );

    private PasswordPolicy() {
    }

    public static void validate(String password, String username) {
        if (password == null || password.length() < MIN_LENGTH || password.length() > MAX_LENGTH) {
            throw new BusinessException(400, "密码长度必须为10至128位");
        }
        if (!password.equals(password.trim()) || password.chars().anyMatch(Character::isWhitespace)) {
            throw new BusinessException(400, "密码不能包含空格");
        }
        String normalized = password.toLowerCase(Locale.ROOT);
        String compact = normalized.replaceAll("[^a-z0-9]", "");
        if (COMMON_PASSWORDS.contains(normalized) || COMMON_PASSWORDS.contains(compact)
                || compact.matches("(admin|password|welcome|zhehang|qwerty|abc)\\d*")) {
            throw new BusinessException(400, "该密码过于常见，请更换更安全的密码");
        }
        if (username != null && username.length() >= 3
                && normalized.contains(username.trim().toLowerCase(Locale.ROOT))) {
            throw new BusinessException(400, "密码不能包含登录账号");
        }
        if (containsSequence(normalized) || normalized.chars().distinct().count() < 5) {
            throw new BusinessException(400, "密码不能使用连续字符或大量重复字符");
        }
        int categories = 0;
        if (password.chars().anyMatch(Character::isLowerCase)) categories++;
        if (password.chars().anyMatch(Character::isUpperCase)) categories++;
        if (password.chars().anyMatch(Character::isDigit)) categories++;
        if (password.chars().anyMatch(ch -> !Character.isLetterOrDigit(ch))) categories++;
        if (categories < 3) {
            throw new BusinessException(400, "密码需包含大小写字母、数字、符号中的至少三类");
        }
    }

    public static String generateInitialPassword() {
        while (true) {
            char[] value = new char[16];
            value[0] = randomChar(LOWER);
            value[1] = randomChar(UPPER);
            value[2] = randomChar(DIGITS);
            value[3] = randomChar(SYMBOLS);
            for (int i = 4; i < value.length; i++) {
                value[i] = randomChar(ALL);
            }
            for (int i = value.length - 1; i > 0; i--) {
                int swap = RANDOM.nextInt(i + 1);
                char current = value[i];
                value[i] = value[swap];
                value[swap] = current;
            }
            String candidate = new String(value);
            try {
                validate(candidate, null);
                return candidate;
            } catch (BusinessException ignored) {
                // 极小概率生成连续字符时重新生成，绝不向调用方返回不合规口令。
            }
        }
    }

    private static char randomChar(String source) {
        return source.charAt(RANDOM.nextInt(source.length()));
    }

    private static boolean containsSequence(String password) {
        String compact = password.replaceAll("[^a-z0-9]", "");
        String[] sequences = {"0123456789", "9876543210", "abcdefghijklmnopqrstuvwxyz",
                "zyxwvutsrqponmlkjihgfedcba", "qwertyuiop", "poiuytrewq"};
        for (String sequence : sequences) {
            for (int i = 0; i + 4 <= sequence.length(); i++) {
                if (compact.contains(sequence.substring(i, i + 4))) {
                    return true;
                }
            }
        }
        return false;
    }
}
