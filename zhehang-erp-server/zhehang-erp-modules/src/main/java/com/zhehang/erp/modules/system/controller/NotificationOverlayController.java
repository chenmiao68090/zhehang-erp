package com.zhehang.erp.modules.system.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.system.domain.SysNotificationOverlay;
import com.zhehang.erp.modules.system.mapper.SysNotificationOverlayMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 消息中心客户端属性叠加层(星标/稍后/归档/完成)落库。
 * 每个登录用户一行,存整块 overlay JSON;前端 localStorage 镜像到此,实现跨设备一致。
 * 独立 controller(不并入 SysNotificationController),避免与其它助手同时改同一文件。
 */
@RestController
@RequestMapping("/system/notification/overlay")
public class NotificationOverlayController {

    private static final Logger log = LoggerFactory.getLogger(NotificationOverlayController.class);

    private final SysNotificationOverlayMapper overlayMapper;

    public NotificationOverlayController(SysNotificationOverlayMapper overlayMapper) {
        this.overlayMapper = overlayMapper;
    }

    /** 取当前用户的 overlay JSON(没有则返回空对象)。 */
    @GetMapping
    public R<String> get() {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            return R.ok("{}");
        }
        try {
            SysNotificationOverlay row = findByUser(userId);
            return R.ok(row != null && row.getOverlayJson() != null ? row.getOverlayJson() : "{}");
        } catch (DataAccessException e) {
            log.warn("消息中心 overlay 表暂不可用,降级为空 overlay: {}", e.getClass().getSimpleName());
            return R.ok("{}");
        }
    }

    /** 保存当前用户的整块 overlay JSON(存在则更新,否则插入)。 */
    @PostMapping
    public R<Void> save(@RequestBody Map<String, String> body) {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            // 未登录/会话失效:明确失败,避免前端误以为已保存(前端 silentError 静默、保留本地)。
            return R.fail("未登录或会话已过期");
        }
        String json = body == null ? null : body.get("overlayJson");
        if (json == null) {
            json = "{}";
        }
        // 防滥用:单用户 overlay 不应过大(消息数有限),超长直接拒绝。
        if (json.length() > 200_000) {
            return R.fail("overlay 数据过大");
        }
        try {
            SysNotificationOverlay row = findByUser(userId);
            if (row == null) {
                SysNotificationOverlay fresh = new SysNotificationOverlay();
                fresh.setUserId(userId);
                fresh.setOverlayJson(json);
                try {
                    overlayMapper.insert(fresh);
                } catch (DuplicateKeyException e) {
                    // 并发下另一个请求已为该用户插入(唯一约束 uk_user_tenant 拦截):改为更新已存在行,保证"每用户一行"。
                    SysNotificationOverlay existing = findByUser(userId);
                    if (existing != null) {
                        existing.setOverlayJson(json);
                        overlayMapper.updateById(existing);
                    }
                }
            } else {
                row.setOverlayJson(json);
                overlayMapper.updateById(row);
            }
        } catch (DataAccessException e) {
            log.warn("消息中心 overlay 表暂不可用,保存动作降级为前端本地缓存: {}", e.getClass().getSimpleName());
        }
        return R.ok();
    }

    private SysNotificationOverlay findByUser(Long userId) {
        // 纵深防御:除 user_id 外显式带上当前租户,避免极端情况下(租户上下文异常)跨租户读到他人 overlay。
        Long tenantId = SecurityUtils.getCurrentTenantId();
        return overlayMapper.selectOne(
                new LambdaQueryWrapper<SysNotificationOverlay>()
                        .eq(SysNotificationOverlay::getUserId, userId)
                        .eq(tenantId != null, SysNotificationOverlay::getTenantId, tenantId)
                        .last("LIMIT 1"));
    }
}
