package com.zhehang.erp.modules.system.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.security.ImpersonationPolicy;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.auth.service.UserDetailsServiceImpl;
import com.zhehang.erp.modules.system.domain.dto.ImpersonationCandidateRow;
import com.zhehang.erp.modules.system.domain.dto.ImpersonationEndRequest;
import com.zhehang.erp.modules.system.domain.dto.ImpersonationStartRequest;
import com.zhehang.erp.modules.system.domain.entity.SysImpersonationSession;
import com.zhehang.erp.modules.system.domain.vo.ImpersonationCandidateVO;
import com.zhehang.erp.modules.system.domain.vo.ImpersonationSessionVO;
import com.zhehang.erp.modules.system.mapper.SysImpersonationSessionMapper;
import com.zhehang.erp.security.domain.LoginUser;
import com.zhehang.erp.security.service.TokenService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ImpersonationService {

    private static final String ACTIVE = "ACTIVE";
    private static final String ENDED = "ENDED";
    private static final String EXPIRED = "EXPIRED";
    private static final String REVOKED = "REVOKED";
    private static final String TAB_HEADER = "X-Impersonation-Tab-Id";
    private static final TypeReference<List<String>> STRING_LIST = new TypeReference<>() { };

    private final SysImpersonationSessionMapper sessionMapper;
    private final UserDetailsServiceImpl userDetailsService;
    private final TokenService tokenService;
    private final ObjectMapper objectMapper;

    public List<ImpersonationCandidateVO> candidates(String keyword, Long deptId) {
        Long tenantId = requirePlatformSuperAdmin();
        String normalizedKeyword = normalizeOptional(keyword, 64);
        return sessionMapper.selectCandidates(tenantId, normalizedKeyword, deptId, 100).stream()
                .map(this::toCandidateVO)
                .toList();
    }

    public ImpersonationSessionVO start(ImpersonationStartRequest request, HttpServletRequest httpRequest) {
        Long tenantId = requirePlatformSuperAdmin();
        if (request == null || ImpersonationPolicy.isForbiddenTarget(request.getTargetUserId())) {
            throw new AccessDeniedException("禁止代登录平台根账号或当前实际管理员账号");
        }

        String reason = normalizeRequired(request.getReason(), 200, "请填写切换员工视角的原因");
        String tabId = normalizeRequired(request.getTabId(), 64, "当前标签页标识缺失，请刷新后重试");
        if (!isValidTabId(tabId)) {
            throw new AccessDeniedException("当前标签页标识无效");
        }
        ImpersonationCandidateRow candidate = sessionMapper.selectCandidateByUserId(
                tenantId, request.getTargetUserId());
        if (candidate == null || !Objects.equals(candidate.getUserId(), request.getTargetUserId())) {
            throw new AccessDeniedException("只能查看当前公司内在职且已启用的员工账号");
        }

        // 与真实登录严格复用同一角色、菜单、权限、data_scope构造链；不读取目标密码。
        LoginUser effectiveLoginUser;
        try {
            effectiveLoginUser = userDetailsService.loadActiveUserForImpersonation(
                    request.getTargetUserId(), tenantId);
        } catch (BusinessException e) {
            // BusinessException 的全局处理只写响应体 code，HTTP 仍会是 200；安全入口必须
            // 转为 Spring Security 拒绝，确保停用/跨租户/权限版本竞态都是真实 HTTP 403。
            throw securityDenied(e);
        }
        if (effectiveLoginUser == null
                || !Objects.equals(effectiveLoginUser.getUserId(), candidate.getUserId())
                || !Objects.equals(effectiveLoginUser.getTenantId(), tenantId)) {
            throw new AccessDeniedException("目标员工身份与当前公司不一致");
        }
        revokeActiveSessionsForTab(tenantId, tabId);
        effectiveLoginUser.setImpersonationTabId(tabId);
        String sessionId = UUID.randomUUID().toString();
        TokenService.ImpersonationToken issued;
        try {
            issued = tokenService.createImpersonationToken(httpRequest, effectiveLoginUser, sessionId);
        } catch (BusinessException e) {
            // 专用签发链中的原管理员令牌、版本、标签页或会话冲突均失败收紧为 HTTP 403。
            throw securityDenied(e);
        }

        try {
            // 从专用令牌成功签发开始到审计会话完整落库为一个补偿边界；期间任何
            // 序列化、时间转换或数据库异常都必须撤销 Redis 会话。
            List<String> roleNames = parseStringList(candidate.getRoleNamesJson());
            SysImpersonationSession session = new SysImpersonationSession();
            session.setSessionId(sessionId);
            session.setTenantId(tenantId);
            session.setActorUserId(ImpersonationPolicy.AUTHORIZED_ACTOR_USER_ID);
            session.setActorUsername(safeText(SecurityUtils.getCurrentUsername(), 64, "admin"));
            session.setEffectiveUserId(candidate.getUserId());
            session.setEffectiveUsername(safeText(candidate.getDisplayName(), 100, "员工"));
            session.setEffectiveDeptId(candidate.getDeptId());
            session.setEffectiveDeptName(safeText(candidate.getDeptName(), 100, null));
            session.setEffectiveRoleNames(writeStringList(roleNames));
            session.setEffectiveRoleCount(candidate.getRoleCount() == null ? 0 : candidate.getRoleCount());
            session.setReason(reason);
            session.setStartTime(toLocalDateTime(issued.startTime()));
            session.setExpireTime(toLocalDateTime(issued.expireTime()));
            session.setStatus(ACTIVE);
            session.setIpAddr(resolveIp(httpRequest));
            session.setUserAgent(safeText(
                    httpRequest == null ? null : httpRequest.getHeader("User-Agent"), 500, null));
            session.setDeviceInfo(safeText(
                    httpRequest == null ? null : httpRequest.getHeader("Sec-CH-UA-Platform"), 200, null));
            session.setTabId(tabId);
            session.setCreateTime(LocalDateTime.now());
            session.setUpdateTime(LocalDateTime.now());

            int inserted = sessionMapper.insert(session);
            if (inserted != 1) {
                throw new IllegalStateException("代登录审计会话未成功落库");
            }
            return toSessionVO(session, issued.token());
        } catch (RuntimeException e) {
            // 审计会话未完整落盘时，专用令牌必须立刻失效，不能留下不可追溯会话。
            try {
                tokenService.revokeImpersonationSession(sessionId);
            } catch (RuntimeException cleanupFailure) {
                e.addSuppressed(cleanupFailure);
            }
            throw e;
        }
    }

    public ImpersonationSessionVO current(HttpServletRequest request) {
        if (!SecurityUtils.isImpersonating()) {
            requirePlatformSuperAdmin();
            return ImpersonationSessionVO.builder().active(false).build();
        }
        SysImpersonationSession session = requireCurrentSession(request);
        return toSessionVO(session, null);
    }

    public void end(ImpersonationEndRequest request, HttpServletRequest httpRequest) {
        SysImpersonationSession session = requireCurrentSession(httpRequest);
        String endReason = request != null && StringUtils.hasText(request.getReason())
                ? normalizeOptional(request.getReason(), 200)
                : "超级管理员主动退出员工视角";
        // 安全状态优先：先撤销 Redis 专用令牌，再落审计结束状态。若数据库更新失败，
        // 会话也已不可继续使用；反向顺序会留下“数据库已结束、令牌仍可读”的窗口。
        tokenService.revokeImpersonationSession(session.getSessionId());
        int updated = sessionMapper.update(null, new LambdaUpdateWrapper<SysImpersonationSession>()
                .eq(SysImpersonationSession::getSessionId, session.getSessionId())
                .eq(SysImpersonationSession::getTenantId, session.getTenantId())
                .eq(SysImpersonationSession::getStatus, ACTIVE)
                .set(SysImpersonationSession::getStatus, ENDED)
                .set(SysImpersonationSession::getEndReason, endReason)
                .set(SysImpersonationSession::getEndTime, LocalDateTime.now())
                .set(SysImpersonationSession::getUpdateTime, LocalDateTime.now()));
        if (updated != 1) {
            throw new AccessDeniedException("员工视角会话已结束");
        }
    }

    private SysImpersonationSession requireCurrentSession(HttpServletRequest request) {
        LoginUser requestLoginUser = tokenService.getLoginUser(request);
        if (requestLoginUser == null || !requestLoginUser.isImpersonating()
                || !ImpersonationPolicy.isAuthorizedActor(requestLoginUser.getActorUserId())
                || !SecurityUtils.isImpersonating()
                || !ImpersonationPolicy.isAuthorizedActor(SecurityUtils.getCurrentActorUserId())) {
            throw new AccessDeniedException("当前请求不是有效的超级管理员员工视角会话");
        }
        String sessionId = SecurityUtils.getCurrentImpersonationSessionId();
        if (!StringUtils.hasText(sessionId)
                || !Objects.equals(sessionId, requestLoginUser.getImpersonationSessionId())) {
            throw new AccessDeniedException("员工视角会话标识缺失");
        }
        SysImpersonationSession session = sessionMapper.selectById(sessionId);
        if (session == null
                || !ACTIVE.equals(session.getStatus())
                || !ImpersonationPolicy.isAuthorizedActor(session.getActorUserId())
                || !Objects.equals(SecurityUtils.getCurrentUserId(), requestLoginUser.getUserId())
                || !Objects.equals(SecurityUtils.getCurrentTenantId(), requestLoginUser.getTenantId())
                || !Objects.equals(requestLoginUser.getUserId(), session.getEffectiveUserId())
                || !Objects.equals(requestLoginUser.getTenantId(), session.getTenantId())) {
            tokenService.revokeImpersonationSession(sessionId);
            throw new AccessDeniedException("员工视角会话不存在或已结束");
        }
        String requestTabId = request == null ? null : request.getHeader(TAB_HEADER);
        if (!StringUtils.hasText(requestTabId)
                || !Objects.equals(requestTabId, requestLoginUser.getImpersonationTabId())
                || !Objects.equals(requestTabId, session.getTabId())) {
            throw new AccessDeniedException("员工视角仅限发起切换的当前标签页使用");
        }
        if (session.getExpireTime() == null || !session.getExpireTime().isAfter(LocalDateTime.now())) {
            tokenService.revokeImpersonationSession(sessionId);
            markEnded(session, EXPIRED, "30分钟会话到期");
            throw new AccessDeniedException("员工视角会话已到期");
        }
        return session;
    }

    private Long requirePlatformSuperAdmin() {
        if (SecurityUtils.isImpersonating()
                || !ImpersonationPolicy.isAuthorizedActor(SecurityUtils.getCurrentUserId())) {
            throw new AccessDeniedException("仅固定平台超级管理员可切换员工视角");
        }
        Long tenantId = SecurityUtils.getCurrentTenantId();
        if (tenantId == null) {
            throw new AccessDeniedException("平台超级管理员未绑定公司租户");
        }
        return tenantId;
    }

    private AccessDeniedException securityDenied(BusinessException cause) {
        return new AccessDeniedException("代登录安全校验失败", cause);
    }

    /**
     * 同一管理员标签页只能保留一个员工视角。顺序为先撤销旧 Redis 令牌、再更新审计状态；
     * 迁移中的唯一活动标签页索引继续兜住并发双击，插入失败的新令牌会由 start 补偿撤销。
     */
    private void revokeActiveSessionsForTab(Long tenantId, String tabId) {
        List<SysImpersonationSession> activeSessions = sessionMapper.selectList(
                new LambdaQueryWrapper<SysImpersonationSession>()
                        .select(SysImpersonationSession::getSessionId,
                                SysImpersonationSession::getTenantId)
                        .eq(SysImpersonationSession::getTenantId, tenantId)
                        .eq(SysImpersonationSession::getActorUserId,
                                ImpersonationPolicy.AUTHORIZED_ACTOR_USER_ID)
                        .eq(SysImpersonationSession::getTabId, tabId)
                        .eq(SysImpersonationSession::getStatus, ACTIVE));
        if (activeSessions == null || activeSessions.isEmpty()) {
            return;
        }
        for (SysImpersonationSession activeSession : activeSessions) {
            tokenService.revokeImpersonationSession(activeSession.getSessionId());
            markEnded(activeSession, REVOKED, "同一标签页启动新的员工视角");
        }
    }

    private void markEnded(SysImpersonationSession session, String status, String reason) {
        sessionMapper.update(null, new LambdaUpdateWrapper<SysImpersonationSession>()
                .eq(SysImpersonationSession::getSessionId, session.getSessionId())
                .eq(SysImpersonationSession::getTenantId, session.getTenantId())
                .eq(SysImpersonationSession::getStatus, ACTIVE)
                .set(SysImpersonationSession::getStatus, status)
                .set(SysImpersonationSession::getEndReason, reason)
                .set(SysImpersonationSession::getEndTime, LocalDateTime.now())
                .set(SysImpersonationSession::getUpdateTime, LocalDateTime.now()));
    }

    private ImpersonationCandidateVO toCandidateVO(ImpersonationCandidateRow row) {
        List<String> roleNames = parseStringList(row.getRoleNamesJson());
        List<String> roleKeys = parseStringList(row.getRoleKeysJson());
        int roleCount = row.getRoleCount() == null ? roleNames.size() : row.getRoleCount();
        return ImpersonationCandidateVO.builder()
                .userId(row.getUserId())
                .displayName(row.getDisplayName())
                .deptId(row.getDeptId())
                .deptName(row.getDeptName())
                .roleNames(roleNames)
                .roleKeys(roleKeys)
                .roleCount(roleCount)
                .multipleRoles(roleCount > 1)
                .build();
    }

    private ImpersonationSessionVO toSessionVO(SysImpersonationSession session, String token) {
        List<String> roleNames = parseStringList(session.getEffectiveRoleNames());
        return ImpersonationSessionVO.builder()
                .active(ACTIVE.equals(session.getStatus()))
                .impersonationToken(token)
                .sessionId(session.getSessionId())
                .actorUserId(session.getActorUserId())
                .actorName(session.getActorUsername())
                .targetUserId(session.getEffectiveUserId())
                .targetName(session.getEffectiveUsername())
                .targetDeptId(session.getEffectiveDeptId())
                .targetDeptName(session.getEffectiveDeptName())
                .roleNames(roleNames)
                .multipleRoles(session.getEffectiveRoleCount() != null && session.getEffectiveRoleCount() > 1)
                .reason(session.getReason())
                .tabId(session.getTabId())
                .startTime(session.getStartTime())
                .expireTime(session.getExpireTime())
                .build();
    }

    private List<String> parseStringList(String json) {
        if (!StringUtils.hasText(json)) {
            return Collections.emptyList();
        }
        try {
            List<String> values = objectMapper.readValue(json, STRING_LIST);
            return values == null ? Collections.emptyList() : values;
        } catch (JsonProcessingException e) {
            log.warn("角色快照解析失败，按空角色显示");
            return Collections.emptyList();
        }
    }

    private String writeStringList(List<String> values) {
        try {
            return objectMapper.writeValueAsString(values == null ? Collections.emptyList() : values);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("无法生成角色审计快照", e);
        }
    }

    private String normalizeRequired(String value, int maxLength, String missingMessage) {
        if (!StringUtils.hasText(value)) {
            throw new IllegalArgumentException(missingMessage);
        }
        return normalizeOptional(value, maxLength);
    }

    private String normalizeOptional(String value, int maxLength) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        String normalized = value.trim();
        if (normalized.length() > maxLength) {
            throw new IllegalArgumentException("输入内容过长");
        }
        return normalized;
    }

    private String safeText(String value, int maxLength, String fallback) {
        if (!StringUtils.hasText(value)) {
            return fallback;
        }
        String trimmed = value.trim();
        return trimmed.length() <= maxLength ? trimmed : trimmed.substring(0, maxLength);
    }

    private boolean isValidTabId(String tabId) {
        return StringUtils.hasText(tabId)
                && tabId.length() >= 8
                && tabId.length() <= 64
                && tabId.matches("[A-Za-z0-9._-]+");
    }

    private LocalDateTime toLocalDateTime(long epochMillis) {
        return LocalDateTime.ofInstant(Instant.ofEpochMilli(epochMillis), ZoneId.systemDefault());
    }

    private String resolveIp(HttpServletRequest request) {
        if (request == null) {
            return "unknown";
        }
        // 生产 Nginx 会覆盖 X-Real-IP；X-Forwarded-For 使用 $proxy_add_x_forwarded_for，
        // 其首段可由客户端预先伪造，因此审计不能优先采信该首段。
        String realIp = request.getHeader("X-Real-IP");
        if (StringUtils.hasText(realIp) && !"unknown".equalsIgnoreCase(realIp)) {
            return safeText(realIp.trim(), 128, "unknown");
        }
        return safeText(request.getRemoteAddr(), 128, "unknown");
    }
}
