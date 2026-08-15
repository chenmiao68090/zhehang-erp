package com.zhehang.erp.modules.feigetask.job;

import com.zhehang.erp.modules.feigetask.service.FeigeOrderTaskBridgeService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class FeigeOrderTaskBridgeJob {

    private static final Logger log = LoggerFactory.getLogger(FeigeOrderTaskBridgeJob.class);

    private final FeigeOrderTaskBridgeService bridgeService;

    @Scheduled(fixedDelayString = "${feige.task.bridge.poll-delay-ms:10000}")
    public void poll() {
        for (Long id : bridgeService.dueRunIds()) {
            if (!bridgeService.claim(id)) {
                continue;
            }
            try {
                bridgeService.processClaimed(id);
            } catch (RuntimeException failure) {
                bridgeService.markFailed(id, failure);
                // 不输出订单、公司、人员或异常正文，避免后台日志携带业务/隐私数据。
                log.warn("Feige order-task bridge run failed, runId={}", id);
            }
        }
    }
}
