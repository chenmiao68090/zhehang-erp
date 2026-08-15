package com.zhehang.erp.security.service;

import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.exception.ErrorCode;
import com.zhehang.erp.security.domain.LoginUser;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class LoginService {

    private final AuthenticationManager authenticationManager;

    /** 仅完成主密码认证，不在MFA/首次改密通过前签发任何令牌。 */
    public LoginUser authenticate(String username, String password) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, password)
            );
            LoginUser loginUser = (LoginUser) authentication.getPrincipal();
            return loginUser;
        } catch (AuthenticationException e) {
            log.warn("登录失败: username={}, error={}", username, e.getMessage());
            throw new BusinessException(ErrorCode.USER_PASSWORD_ERROR);
        }
    }
}
