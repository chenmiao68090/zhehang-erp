const fs = require('fs');

// R.java
const r1 = `package com.zhehang.erp.common.core.domain;

import lombok.Data;
import java.io.Serializable;

@Data
public class R<T> implements Serializable {
    private static final long serialVersionUID = 1L;
    private int code;
    private String message;
    private T data;
    private long timestamp;

    public R() {
        this.timestamp = System.currentTimeMillis();
    }

    public static <T> R<T> ok() {
        R<T> r = new R<>();
        r.setCode(200);
        r.setMessage("操作成功");
        return r;
    }

    public static <T> R<T> ok(T data) {
        R<T> r = new R<>();
        r.setCode(200);
        r.setMessage("操作成功");
        r.setData(data);
        return r;
    }

    public static <T> R<T> fail(String message) {
        R<T> r = new R<>();
        r.setCode(500);
        r.setMessage(message);
        return r;
    }

    public static <T> R<T> fail(int code, String message) {
        R<T> r = new R<>();
        r.setCode(code);
        r.setMessage(message);
        return r;
    }
}
`;
fs.writeFileSync('zhehang-erp-server/zhehang-erp-common/src/main/java/com/zhehang/erp/common/core/domain/R.java', r1, 'utf8');

// TokenService.java
const ts = `package com.zhehang.erp.security.service;

import com.zhehang.erp.security.domain.LoginUser;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
public class TokenService {

    private static final String TOKEN_PREFIX = "Bearer ";
    private static final String HEADER = "Authorization";
    private static final String LOGIN_USER_KEY = "login_user:";

    @Value("\${jwt.secret}")
    private String secret;

    @Value("\${jwt.access-token-expiration:7200000}")
    private long accessTokenExpiration;

    @Value("\${jwt.refresh-token-expiration:604800000}")
    private long refreshTokenExpiration;

    private final RedisTemplate<String, Object> redisTemplate;

    public TokenService(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public Map<String, String> createToken(LoginUser loginUser) {
        String accessUuid = UUID.randomUUID().toString();
        String refreshUuid = UUID.randomUUID().toString();

        // 存储用户信息到Redis
        redisTemplate.opsForValue().set(LOGIN_USER_KEY + accessUuid, loginUser, accessTokenExpiration, TimeUnit.MILLISECONDS);
        redisTemplate.opsForValue().set(LOGIN_USER_KEY + refreshUuid, loginUser, refreshTokenExpiration, TimeUnit.MILLISECONDS);

        // 生成Token
        String accessToken = generateToken(accessUuid, loginUser.getUserId(), accessTokenExpiration);
        String refreshToken = generateToken(refreshUuid, loginUser.getUserId(), refreshTokenExpiration);

        Map<String, String> tokens = new HashMap<>();
        tokens.put("accessToken", accessToken);
        tokens.put("refreshToken", refreshToken);
        return tokens;
    }

    public LoginUser getLoginUser(HttpServletRequest request) {
        String token = getTokenFromRequest(request);
        if (StringUtils.hasText(token)) {
            try {
                Claims claims = parseToken(token);
                String uuid = claims.get("uuid", String.class);
                Object obj = redisTemplate.opsForValue().get(LOGIN_USER_KEY + uuid);
                if (obj instanceof LoginUser) {
                    return (LoginUser) obj;
                }
            } catch (Exception e) {
                log.warn("Token解析失败: {}", e.getMessage());
            }
        }
        return null;
    }

    public Map<String, String> refreshToken(String refreshToken) {
        try {
            Claims claims = parseToken(refreshToken);
            String uuid = claims.get("uuid", String.class);
            Object obj = redisTemplate.opsForValue().get(LOGIN_USER_KEY + uuid);
            if (obj instanceof LoginUser loginUser) {
                // 删除旧的refresh token
                redisTemplate.delete(LOGIN_USER_KEY + uuid);
                // 创建新的token对
                return createToken(loginUser);
            }
        } catch (Exception e) {
            log.warn("Refresh Token无效: {}", e.getMessage());
        }
        return null;
    }

    public void removeToken(HttpServletRequest request) {
        String token = getTokenFromRequest(request);
        if (StringUtils.hasText(token)) {
            try {
                Claims claims = parseToken(token);
                String uuid = claims.get("uuid", String.class);
                redisTemplate.delete(LOGIN_USER_KEY + uuid);
            } catch (Exception e) {
                log.warn("Token移除失败: {}", e.getMessage());
            }
        }
    }

    private String generateToken(String uuid, Long userId, long expiration) {
        SecretKey key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        return Jwts.builder()
                .claim("uuid", uuid)
                .claim("userId", userId)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(key)
                .compact();
    }

    private Claims parseToken(String token) {
        SecretKey key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
    }

    private String getTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader(HEADER);
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith(TOKEN_PREFIX)) {
            return bearerToken.substring(TOKEN_PREFIX.length());
        }
        return null;
    }
}
`;
fs.writeFileSync('zhehang-erp-server/zhehang-erp-security/src/main/java/com/zhehang/erp/security/service/TokenService.java', ts, 'utf8');

// SysUserServiceImpl.java - 仅修复注释
let svc = fs.readFileSync('zhehang-erp-server/zhehang-erp-modules/src/main/java/com/zhehang/erp/modules/system/service/impl/SysUserServiceImpl.java', 'utf8');
svc = svc.replace('// 鏍￠獙鐢ㄦ埛鍚嶅敮涓€', '// 校验用户名唯一');
svc = svc.replace('// 鍒嗛厤瑙掕壊', '// 分配角色');
svc = svc.replace('// 鏇存柊瑙掕壊', '// 更新角色');
fs.writeFileSync('zhehang-erp-server/zhehang-erp-modules/src/main/java/com/zhehang/erp/modules/system/service/impl/SysUserServiceImpl.java', svc, 'utf8');

// DocController.java
const dc = `package com.zhehang.erp.modules.project.controller;

import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.project.domain.entity.PmDoc;
import com.zhehang.erp.modules.project.service.IPmDocService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/project/doc")
@RequiredArgsConstructor
public class DocController {

    private final IPmDocService docService;

    @GetMapping("/list")
    public R<List<PmDoc>> list(@RequestParam Long projectId) {
        return R.ok(docService.listByProject(projectId));
    }

    @PostMapping
    @Log(module = "项目文档", type = Log.OperationType.INSERT)
    public R<Void> add(@RequestBody PmDoc doc) {
        docService.save(doc);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    @Log(module = "项目文档", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        docService.removeById(id);
        return R.ok();
    }
}
`;
fs.writeFileSync('zhehang-erp-server/zhehang-erp-modules/src/main/java/com/zhehang/erp/modules/project/controller/DocController.java', dc, 'utf8');

// RoleDTO.java
const rd = `package com.zhehang.erp.modules.system.domain.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.List;

@Data
public class RoleDTO {
    private Long id;
    @NotBlank(message = "角色名称不能为空")
    private String roleName;
    @NotBlank(message = "角色标识不能为空")
    private String roleKey;
    private Integer roleSort;
    private Integer status;
    private String remark;
    private List<Long> menuIds;
}
`;
fs.writeFileSync('zhehang-erp-server/zhehang-erp-modules/src/main/java/com/zhehang/erp/modules/system/domain/dto/RoleDTO.java', rd, 'utf8');

console.log('Fixed 5 files');
