package com.zhehang.erp.common.core.utils;

import com.zhehang.erp.common.core.domain.AuthUser;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class SecurityUtils {

    private static final BCryptPasswordEncoder ENCODER = new BCryptPasswordEncoder();

    private static AuthUser currentAuthUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof AuthUser authUser) {
            return authUser;
        }
        return null;
    }

    public static Long getCurrentUserId() {
        AuthUser authUser = currentAuthUser();
        return authUser != null ? authUser.getUserId() : null;
    }

    public static Long getCurrentTenantId() {
        AuthUser authUser = currentAuthUser();
        return authUser != null ? authUser.getTenantId() : null;
    }

    public static String getCurrentUsername() {
        AuthUser authUser = currentAuthUser();
        if (authUser != null) {
            return authUser.getUsername();
        }
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null ? authentication.getName() : null;
    }

    public static String encryptPassword(String password) {
        return ENCODER.encode(password);
    }

    public static boolean matchesPassword(String rawPassword, String encodedPassword) {
        return ENCODER.matches(rawPassword, encodedPassword);
    }
}