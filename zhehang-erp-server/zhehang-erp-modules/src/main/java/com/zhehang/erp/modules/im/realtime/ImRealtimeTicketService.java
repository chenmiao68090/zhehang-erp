package com.zhehang.erp.modules.im.realtime;

import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.security.domain.LoginUser;
import com.zhehang.erp.security.service.TokenService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class ImRealtimeTicketService {
    private static final String PREFIX = "im:ws:ticket:";
    private final StringRedisTemplate redisTemplate;
    private final TokenService tokenService;

    public String issue(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        String token = StringUtils.hasText(header) && header.startsWith("Bearer ") ? header.substring(7) : null;
        LoginUser loginUser = tokenService.getLoginUser(token);
        if (loginUser == null || !loginUser.isEnabled()) throw new BusinessException("登录已失效");
        if (loginUser.isImpersonating()) {
            throw new AccessDeniedException("员工视角禁止连接私人消息");
        }
        String ticket = UUID.randomUUID().toString().replace("-", "");
        redisTemplate.opsForValue().set(PREFIX + ticket, token, 60, TimeUnit.SECONDS);
        return ticket;
    }

    public TicketIdentity consume(String ticket) {
        if (!StringUtils.hasText(ticket) || ticket.length() > 80) return null;
        String token = redisTemplate.opsForValue().getAndDelete(PREFIX + ticket);
        LoginUser loginUser = tokenService.getLoginUser(token);
        if (loginUser == null || !loginUser.isEnabled()) return null;
        if (loginUser.isImpersonating()) return null;
        return new TicketIdentity(loginUser.getUserId(), loginUser.getTenantId(), token);
    }

    public record TicketIdentity(Long userId, Long tenantId, String token) {}
}
