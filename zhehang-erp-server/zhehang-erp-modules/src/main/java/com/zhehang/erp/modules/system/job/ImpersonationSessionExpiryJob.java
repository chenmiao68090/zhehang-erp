package com.zhehang.erp.modules.system.job;

import com.zhehang.erp.modules.system.mapper.SysImpersonationSessionMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class ImpersonationSessionExpiryJob {

    private final SysImpersonationSessionMapper sessionMapper;

    @Scheduled(fixedDelayString = "${impersonation.expiry-scan-ms:60000}", initialDelay = 60000)
    public void markExpiredSessions() {
        // 与服务端写入 DATETIME 的时钟保持一致，避免数据库容器时区不同导致超时延迟。
        int updated = sessionMapper.markExpiredSessions(LocalDateTime.now());
        if (updated > 0) {
            log.info("已将{}个到期员工视角会话标记为EXPIRED", updated);
        }
    }
}
