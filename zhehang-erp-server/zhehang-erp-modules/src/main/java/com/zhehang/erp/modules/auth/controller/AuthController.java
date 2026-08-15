package com.zhehang.erp.modules.auth.controller;

import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.common.core.annotation.DenyDuringImpersonation;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.exception.ErrorCode;
import com.zhehang.erp.modules.auth.service.AccountSecurityService;
import com.zhehang.erp.modules.system.domain.entity.SysLoginLog;
import com.zhehang.erp.modules.system.domain.entity.SysUser;
import com.zhehang.erp.modules.system.domain.dto.UserDTO;
import com.zhehang.erp.modules.system.domain.vo.InitialCredentialVO;
import com.zhehang.erp.modules.system.mapper.SysUserMapper;
import com.zhehang.erp.modules.system.service.ISysLogService;
import com.zhehang.erp.modules.system.service.ISysUserService;
import com.zhehang.erp.modules.org.domain.entity.OrgEmployee;
import com.zhehang.erp.modules.org.mapper.OrgEmployeeMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.zhehang.erp.security.domain.LoginUser;
import com.zhehang.erp.security.service.LoginService;
import com.zhehang.erp.security.service.RefreshTokenCookieService;
import com.zhehang.erp.security.service.TokenService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Slf4j
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final LoginService loginService;
    private final AccountSecurityService accountSecurityService;
    private final TokenService tokenService;
    private final RefreshTokenCookieService refreshTokenCookieService;
    private final ISysUserService userService;
    private final ISysLogService logService;
    private final SysUserMapper userMapper;
    private final OrgEmployeeMapper orgEmployeeMapper;
    private final com.zhehang.erp.modules.system.service.ISysRoleService roleService;

    @PostMapping("/login")
    public R<Map<String, Object>> login(@Valid @RequestBody LoginRequest request,
                                        HttpServletRequest httpRequest,
                                        HttpServletResponse httpResponse) {
        String username = request != null ? request.getUsername() : null;
        String ip = getIpAddress(httpRequest);
        try {
            accountSecurityService.beforePasswordAuthentication(
                    username,
                    ip,
                    request != null ? request.getUuid() : null,
                    request != null ? request.getCode() : null);
            LoginUser loginUser;
            try {
                loginUser = loginService.authenticate(username, request != null ? request.getPassword() : null);
            } catch (BusinessException e) {
                accountSecurityService.recordPasswordFailure(username, ip);
                throw e;
            }
            accountSecurityService.recordPasswordSuccess(username);
            Map<String, Object> result = accountSecurityService.continueAfterPassword(loginUser);
            String action = String.valueOf(result.get("action"));
            saveLoginLog(username, httpRequest, 0,
                    AccountSecurityService.ACTION_AUTHENTICATED.equals(action)
                            ? "登录成功" : "主密码验证成功，等待完成账号安全验证");
            return R.ok(moveRefreshTokenToCookie(result, httpResponse));
        } catch (BusinessException e) {
            saveLoginLog(username, httpRequest, 1, e.getMessage());
            throw e;
        }
    }

    @PostMapping("/register")
    @PreAuthorize("@perm.hasAnyRole('boss', 'super_admin')")
    @DenyDuringImpersonation(reason = "员工视角禁止创建系统账号")
    @Log(module = "账号注册", type = Log.OperationType.INSERT,
            saveRequestData = false, saveResponseData = false)
    public R<InitialCredentialVO> register(@Valid @RequestBody RegisterRequest request) {
        UserDTO dto = new UserDTO();
        dto.setUsername(request.getUsername());
        dto.setNickname(request.getNickname());
        dto.setStatus(0);
        return R.ok(userService.createUser(dto));
    }

    @PostMapping("/first-password")
    @Log(module = "账号安全", type = Log.OperationType.UPDATE,
            saveRequestData = false, saveResponseData = false)
    public R<Map<String, Object>> changeInitialPassword(@Valid @RequestBody FirstPasswordRequest request) {
        return R.ok(accountSecurityService.changeInitialPassword(
                request.getChallengeId(), request.getNewPassword()));
    }

    @PostMapping("/mfa/enroll")
    @Log(module = "账号安全", type = Log.OperationType.OTHER,
            saveRequestData = false, saveResponseData = false)
    public R<AccountSecurityService.MfaEnrollment> startMfaEnrollment(
            @Valid @RequestBody ChallengeRequest request) {
        return R.ok(accountSecurityService.startMfaEnrollment(request.getChallengeId()));
    }

    @PostMapping("/mfa/confirm")
    @Log(module = "账号安全", type = Log.OperationType.UPDATE,
            saveRequestData = false, saveResponseData = false)
    public R<Map<String, Object>> confirmMfaEnrollment(@Valid @RequestBody MfaCodeRequest request,
                                                       HttpServletResponse response) {
        return R.ok(moveRefreshTokenToCookie(accountSecurityService.confirmMfaEnrollment(
                request.getChallengeId(), request.getCode()), response));
    }

    @PostMapping("/mfa/verify")
    @Log(module = "账号安全", type = Log.OperationType.OTHER,
            saveRequestData = false, saveResponseData = false)
    public R<Map<String, Object>> verifyMfa(@Valid @RequestBody MfaCodeRequest request,
                                            HttpServletResponse response) {
        return R.ok(moveRefreshTokenToCookie(
                accountSecurityService.verifyMfa(request.getChallengeId(), request.getCode()), response));
    }

    @PostMapping("/refresh")
    public R<Map<String, String>> refresh(@Valid @RequestBody(required = false) RefreshRequest request,
                                          HttpServletRequest httpRequest,
                                          HttpServletResponse httpResponse) {
        String bodyToken = request == null ? null : request.getRefreshToken();
        Map<String, String> tokens = tokenService.refreshToken(
                refreshTokenCookieService.preferCookie(httpRequest, bodyToken));
        if (tokens == null) {
            refreshTokenCookieService.clear(httpResponse);
            throw new BusinessException(ErrorCode.TOKEN_INVALID);
        }
        refreshTokenCookieService.write(httpResponse, tokens.remove("refreshToken"));
        return R.ok(tokens);
    }

    @PostMapping("/logout")
    public R<Void> logout(HttpServletRequest request,
                          HttpServletResponse response,
                          @RequestBody(required = false) LogoutRequest logoutRequest) {
        String bodyToken = logoutRequest == null ? null : logoutRequest.getRefreshToken();
        tokenService.removeToken(request, refreshTokenCookieService.preferCookie(request, bodyToken));
        refreshTokenCookieService.clear(response);
        return R.ok();
    }

    @PostMapping("/sessions/revoke-all")
    @DenyDuringImpersonation(reason = "员工视角禁止吊销目标员工会话")
    @Log(module = "账号安全", type = Log.OperationType.UPDATE)
    public R<Void> revokeAllSessions(HttpServletRequest request) {
        LoginUser loginUser = tokenService.getLoginUser(request);
        if (loginUser == null) {
            throw new BusinessException(ErrorCode.TOKEN_INVALID);
        }
        tokenService.invalidateLoginUserSafely(loginUser.getUserId());
        return R.ok();
    }

    /**
     * 获取当前登录用户信息（供前端路由守卫调用）
     */
    @GetMapping("/info")
    public R<Map<String, Object>> info(HttpServletRequest request) {
        LoginUser loginUser = tokenService.getLoginUser(request);
        if (loginUser == null) {
            throw new BusinessException(ErrorCode.TOKEN_INVALID);
        }
        SysUser currentUser = userService.getById(loginUser.getUserId());
        List<String> roleKeys = userMapper.selectRoleKeysByUserId(loginUser.getUserId());
        Set<String> roles = new LinkedHashSet<>();
        if (roleKeys != null) {
            for (String roleKey : roleKeys) {
                if (roleKey == null || roleKey.isBlank()) {
                    continue;
                }
                roles.add(roleKey);
                int separator = roleKey.indexOf("__");
                if (separator > 0) {
                    String base = roleKey.substring(0, separator);
                    if (!isPrivilegedRole(base)) {
                        roles.add(base);
                    }
                }
            }
        }
        if (loginUser.isAdmin() || Long.valueOf(1L).equals(loginUser.getUserId()) || roles.contains("super_admin")) {
            roles.add("admin");
        }
        if (roles.contains("sys_admin") || roles.contains("dept_manager")) {
            roles.add("manager");
        }
        if (roles.isEmpty()) {
            roles.add("user");
        }
        Map<String, Object> result = new HashMap<>();
        Map<String, Object> user = new HashMap<>();
        user.put("id", loginUser.getUserId());
        user.put("username", loginUser.getUsername());
        user.put("nickname", currentUser != null && currentUser.getNickname() != null ? currentUser.getNickname() : loginUser.getUsername());
        // 带上当前用户的入职日期(供首页"已入职 X 天"显示),按 user_id 直接取,绕开员工列表的数据范围过滤
        OrgEmployee emp = orgEmployeeMapper.selectOne(
                new LambdaQueryWrapper<OrgEmployee>()
                        .eq(OrgEmployee::getUserId, loginUser.getUserId())
                        .orderByDesc(OrgEmployee::getId)
                        .last("limit 1"));
        user.put("hireDate", emp != null ? emp.getHireDate() : null);
        // 年假余额(供请假表单显示剩余、不够禁止申请)
        user.put("annualLeaveTotal", emp != null && emp.getAnnualLeaveTotal() != null ? emp.getAnnualLeaveTotal() : 0);
        user.put("annualLeaveUsed", emp != null && emp.getAnnualLeaveUsed() != null ? emp.getAnnualLeaveUsed() : 0);
        user.put("phone", emp != null ? emp.getPhone() : null);
        result.put("user", user);
        result.put("roles", new java.util.ArrayList<>(roles));
        result.put("permissions", loginUser.getPermissions() == null
                ? java.util.Collections.emptyList()
                : new java.util.ArrayList<>(loginUser.getPermissions()));
        // 角色管理是页面导航唯一来源：null=全部，空数组=仅基础页，非空数组=多角色并集。
        // 查询异常必须失败收紧，不能把角色权限故障误解释为“可看全部”。
        List<String> visibleModules = null;
        if (!roles.contains("admin")) {
            try {
                visibleModules = roleService.resolveVisibleModules(roleKeys);
            } catch (Exception e) {
                log.warn("加载用户可见模块失败，已按最小权限收紧: userId={}", loginUser.getUserId(), e);
                visibleModules = java.util.Collections.emptyList();
            }
        }
        result.put("visibleModules", visibleModules);
        return R.ok(result);
    }

    private boolean isPrivilegedRole(String roleKey) {
        return "admin".equals(roleKey) || "super_admin".equals(roleKey)
                || "sys_admin".equals(roleKey) || "boss".equals(roleKey);
    }

    @GetMapping("/captcha")
    public R<AccountSecurityService.CaptchaChallenge> captcha() {
        return R.ok(accountSecurityService.createCaptcha());
    }

    @Data
    public static class LoginRequest {
        @NotBlank(message = "用户名不能为空")
        @Size(max = 64, message = "用户名长度不能超过64位")
        private String username;
        @NotBlank(message = "密码不能为空")
        @Size(max = 128, message = "密码长度不能超过128位")
        private String password;
        @Size(max = 8, message = "验证码格式错误")
        private String code;
        @Size(max = 64, message = "验证码标识格式错误")
        private String uuid;
    }

    @Data
    public static class RegisterRequest {
        @NotBlank(message = "用户名不能为空")
        @Size(min = 2, max = 30, message = "用户名长度2-30")
        private String username;
        @NotBlank(message = "昵称不能为空")
        @Size(max = 50, message = "昵称不能超过50位")
        private String nickname;
    }

    @Data
    public static class ChallengeRequest {
        @NotBlank(message = "登录挑战不能为空")
        @Size(max = 64, message = "登录挑战格式错误")
        private String challengeId;
    }

    @Data
    public static class FirstPasswordRequest {
        @NotBlank(message = "登录挑战不能为空")
        @Size(max = 64, message = "登录挑战格式错误")
        private String challengeId;
        @NotBlank(message = "新密码不能为空")
        @Size(min = 10, max = 128, message = "新密码长度必须为10至128位")
        private String newPassword;
    }

    @Data
    public static class MfaCodeRequest {
        @NotBlank(message = "登录挑战不能为空")
        @Size(max = 64, message = "登录挑战格式错误")
        private String challengeId;
        @NotBlank(message = "动态验证码不能为空")
        @Pattern(regexp = "\\d{6}", message = "动态验证码必须为6位数字")
        private String code;
    }

    @Data
    public static class RefreshRequest {
        @Size(max = 4096, message = "刷新令牌格式错误")
        private String refreshToken;
    }

    @Data
    public static class LogoutRequest {
        @Size(max = 4096, message = "刷新令牌格式错误")
        private String refreshToken;
    }

    private Map<String, Object> moveRefreshTokenToCookie(
            Map<String, Object> result, HttpServletResponse response) {
        if (result == null) {
            return null;
        }
        Object refreshToken = result.remove("refreshToken");
        if (refreshToken instanceof String value && !value.isBlank()) {
            refreshTokenCookieService.write(response, value);
        }
        return result;
    }

    private void saveLoginLog(String username, HttpServletRequest request, Integer status, String msg) {
        try {
            String ip = getIpAddress(request);
            String userAgent = request != null ? request.getHeader("User-Agent") : null;
            SysLoginLog loginLog = new SysLoginLog();
            loginLog.setUsername(limit(username, 64));
            loginLog.setIpAddr(limit(ip, 128));
            loginLog.setLoginLocation(limit(resolveLoginLocation(ip), 200));
            loginLog.setBrowser(limit(resolveBrowser(userAgent), 100));
            loginLog.setOs(limit(resolveOs(userAgent), 100));
            loginLog.setStatus(status);
            loginLog.setMsg(limit(msg, 500));
            loginLog.setLoginTime(LocalDateTime.now());
            logService.saveLoginLog(loginLog);
        } catch (Exception ex) {
            log.warn("登录日志保存失败: {}", ex.getMessage());
        }
    }

    private String getIpAddress(HttpServletRequest request) {
        if (request == null) {
            return null;
        }
        // Production Nginx overwrites X-Real-IP and the backend port only binds localhost.
        // Do not trust client-controlled forwarding chains for login rate limiting.
        String realIp = request.getHeader("X-Real-IP");
        return hasText(realIp) ? realIp.trim() : request.getRemoteAddr();
    }

    private String resolveLoginLocation(String ip) {
        if (!hasText(ip)) {
            return "未知";
        }
        if ("127.0.0.1".equals(ip) || "::1".equals(ip) || "0:0:0:0:0:0:0:1".equals(ip)) {
            return "本机";
        }
        if (ip.startsWith("10.") || ip.startsWith("192.168.") || is172PrivateIp(ip)) {
            return "内网地址";
        }
        return "公网地址";
    }

    private boolean is172PrivateIp(String ip) {
        if (!ip.startsWith("172.")) {
            return false;
        }
        String[] parts = ip.split("\\.");
        if (parts.length < 2) {
            return false;
        }
        try {
            int second = Integer.parseInt(parts[1]);
            return second >= 16 && second <= 31;
        } catch (NumberFormatException e) {
            return false;
        }
    }

    private String resolveBrowser(String userAgent) {
        if (!hasText(userAgent)) {
            return "未知";
        }
        String ua = userAgent.toLowerCase(Locale.ROOT);
        if (ua.contains("edg/")) {
            return "Edge";
        }
        if (ua.contains("micromessenger")) {
            return "微信内置浏览器";
        }
        if (ua.contains("chrome/") || ua.contains("crios/")) {
            return "Chrome";
        }
        if (ua.contains("firefox/")) {
            return "Firefox";
        }
        if (ua.contains("safari/")) {
            return "Safari";
        }
        return "其他浏览器";
    }

    private String resolveOs(String userAgent) {
        if (!hasText(userAgent)) {
            return "未知";
        }
        String ua = userAgent.toLowerCase(Locale.ROOT);
        if (ua.contains("windows")) {
            return "Windows";
        }
        if (ua.contains("mac os") || ua.contains("macintosh")) {
            return "macOS";
        }
        if (ua.contains("iphone") || ua.contains("ipad") || ua.contains("ios")) {
            return "iOS";
        }
        if (ua.contains("android")) {
            return "Android";
        }
        if (ua.contains("linux")) {
            return "Linux";
        }
        return "其他系统";
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty() && !"unknown".equalsIgnoreCase(value.trim());
    }

    private String limit(String value, int maxLength) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.length() <= maxLength ? trimmed : trimmed.substring(0, maxLength);
    }
}
