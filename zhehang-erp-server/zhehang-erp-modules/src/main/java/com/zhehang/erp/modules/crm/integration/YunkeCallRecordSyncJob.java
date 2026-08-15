package com.zhehang.erp.modules.crm.integration;

import com.zhehang.erp.modules.crm.service.YunkeCallRecordSyncService;
import com.zhehang.erp.modules.crm.domain.YunkeConfig;
import com.zhehang.erp.modules.crm.integration.YunkeClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * 云客完整手机通话记录补同步。
 *
 * <p>云客回调若没配置好或短暂失败,数据会进入"未同步通话记录"队列。这里定时小批量补拉,
 * 落库成功后再删除云客队列批次,避免丢通话记录。</p>
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class YunkeCallRecordSyncJob {

    private final YunkeCallRecordSyncService syncService;
    private final YunkeClient yunkeClient;

    /** 每 2 分钟最多补 10 批(1000条),既能追历史,也避免一次性压垮数据库。 */
    @Scheduled(fixedDelayString = "${yunke.call-record-sync-delay:120000}", initialDelay = 45000)
    public void syncFailedCallRecords() {
        for (YunkeConfig cfg : yunkeClient.listEnabledConfigs()) {
            try {
                Map<String, Object> r = syncService.syncFailedRecords(cfg, 10, 100, true);
                int inserted = intVal(r.get("inserted"));
                int updated = intVal(r.get("updated"));
                int returned = intVal(r.get("returned"));
                if (returned > 0 || inserted > 0 || updated > 0) {
                    log.info("[云客通话补同步] tenant={} returned={} inserted={} updated={} failed={} yunkeTotal={} deletedBatches={}",
                            cfg.getTenantId(), returned, inserted, updated, r.get("failed"), r.get("yunkeTotal"),
                            r.get("deletedBatches"));
                }
            } catch (Exception e) {
                log.warn("[云客通话补同步] tenant={} 异常 type={}",
                        cfg.getTenantId(), e.getClass().getSimpleName());
            }
        }
    }

    private int intVal(Object v) {
        if (v == null) return 0;
        try { return Integer.parseInt(String.valueOf(v)); } catch (Exception e) { return 0; }
    }
}
