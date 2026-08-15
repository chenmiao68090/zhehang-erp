package com.zhehang.erp.modules.crm.job;

import com.zhehang.erp.modules.crm.service.ICrmLeadService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * 线索自动回收定时任务。
 *
 * <p>落地业务诉求"没跟进自动回收":持有(private)且未转化、已过保护期、连续多日未跟进的线索,
 * 自动退回公海重新分配,避免客资被囤积浪费。</p>
 *
 * <p>每日 02:00 执行一次。定时任务无登录租户上下文,
 * {@code ErpTenantHandler} 在此场景放行租户过滤,故回收对全部租户生效(系统级任务)。</p>
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class CrmLeadRecycleJob {

    private final ICrmLeadService leadService;

    /** 每天 02:00 扫描并回收久未跟进的线索 */
    @Scheduled(cron = "0 0 2 * * ?")
    public void run() {
        try {
            int n = leadService.autoRecycle();
            log.info("[定时] 线索自动回收完成,本次回收 {} 条", n);
        } catch (Exception e) {
            log.error("[定时] 线索自动回收异常", e);
        }
    }
}
