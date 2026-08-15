package com.zhehang.erp.modules.finance.job;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.zhehang.erp.modules.finance.domain.entity.FinCashExceptionCase;
import com.zhehang.erp.modules.finance.domain.entity.FinCashJournal;
import com.zhehang.erp.modules.finance.domain.entity.FinReceivableRenewal;
import com.zhehang.erp.modules.finance.mapper.FinCashExceptionCaseMapper;
import com.zhehang.erp.modules.finance.mapper.FinCashJournalMapper;
import com.zhehang.erp.modules.finance.mapper.FinReceivableRenewalMapper;
import com.zhehang.erp.modules.finance.service.impl.CashNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/** 扫描收款超时、异常跟进和坏账风险；eventId 保证重复扫描只落一条提醒。 */
@Slf4j
@Component
@RequiredArgsConstructor
public class CashNotificationReminderJob {
    private static final int SCAN_LIMIT = 500;

    private final FinCashJournalMapper journalMapper;
    private final FinCashExceptionCaseMapper exceptionMapper;
    private final FinReceivableRenewalMapper receivableMapper;
    private final CashNotificationService notificationService;

    @Scheduled(fixedDelayString = "${cash.notification-scan-ms:900000}",
            initialDelayString = "${cash.notification-initial-delay-ms:120000}")
    public void scan() {
        LocalDateTime now = LocalDateTime.now();
        scanUnmatched(now.minusHours(24));
        scanPendingReview(now.minusHours(24));
        scanExceptionFollowUps(now, now.minusHours(24));
        scanBadDebt();
    }

    private void scanUnmatched(LocalDateTime cutoff) {
        List<FinCashJournal> rows = journalMapper.selectList(new LambdaQueryWrapper<FinCashJournal>()
                .eq(FinCashJournal::getRecordStatus, "active")
                .gt(FinCashJournal::getUnmatchedAmount, BigDecimal.ZERO)
                .and(w -> w.le(FinCashJournal::getReceiptTime, cutoff)
                        .or(x -> x.isNull(FinCashJournal::getReceiptTime)
                                .le(FinCashJournal::getCreateTime, cutoff)))
                .orderByAsc(FinCashJournal::getReceiptTime)
                .last("LIMIT " + SCAN_LIMIT));
        for (FinCashJournal row : rows) {
            safely("unmatched", row.getId(), () -> notificationService.unmatchedOver24(
                    row.getTenantId(), row.getId(), row.getReceiptNo(), row.getOwnerId(),
                    firstNonNull(row.getUpdateTime(), row.getReceiptTime(), row.getCreateTime())));
        }
    }

    private void scanPendingReview(LocalDateTime cutoff) {
        List<FinCashJournal> rows = journalMapper.selectList(new LambdaQueryWrapper<FinCashJournal>()
                .eq(FinCashJournal::getRecordStatus, "active")
                .eq(FinCashJournal::getReviewStatus, "pending")
                .le(FinCashJournal::getSubmittedAt, cutoff)
                .orderByAsc(FinCashJournal::getSubmittedAt)
                .last("LIMIT " + SCAN_LIMIT));
        for (FinCashJournal row : rows) {
            safely("review", row.getId(), () -> notificationService.reviewTimeout(
                    row.getTenantId(), row.getId(), row.getReceiptNo(), row.getSubmittedAt()));
        }
    }

    private void scanExceptionFollowUps(LocalDateTime now, LocalDateTime overdueCutoff) {
        List<FinCashExceptionCase> rows = exceptionMapper.selectList(new LambdaQueryWrapper<FinCashExceptionCase>()
                .in(FinCashExceptionCase::getStatus, "pending", "processing")
                .isNotNull(FinCashExceptionCase::getNextFollowUpTime)
                .le(FinCashExceptionCase::getNextFollowUpTime, now)
                .orderByAsc(FinCashExceptionCase::getNextFollowUpTime)
                .last("LIMIT " + SCAN_LIMIT));
        for (FinCashExceptionCase row : rows) {
            safely("exception", row.getId(), () -> {
                if (row.getNextFollowUpTime().isBefore(overdueCutoff)) {
                    notificationService.exceptionOverdue(row.getTenantId(), row.getId(), row.getExceptionType(),
                            row.getPriority(), row.getOwnerId(), row.getNextAction(), row.getNextFollowUpTime());
                } else {
                    notificationService.followUpDue(row.getTenantId(), row.getId(), row.getExceptionType(),
                            row.getPriority(), row.getOwnerId(), row.getNextAction(), row.getNextFollowUpTime());
                }
            });
        }
    }

    private void scanBadDebt() {
        List<FinReceivableRenewal> rows = receivableMapper.selectList(new LambdaQueryWrapper<FinReceivableRenewal>()
                .eq(FinReceivableRenewal::getCollectionStatus, "坏账风险")
                .gt(FinReceivableRenewal::getArrearsAmount, BigDecimal.ZERO)
                .orderByDesc(FinReceivableRenewal::getUpdateTime)
                .last("LIMIT " + SCAN_LIMIT));
        for (FinReceivableRenewal row : rows) {
            safely("bad-debt", row.getId(), () -> notificationService.badDebtRisk(
                    row.getTenantId(), row.getId(), row.getCustomerName(), row.getCollectorId(),
                    row.getArrearsAmount().toPlainString(), firstNonNull(row.getUpdateTime(), row.getCreateTime())));
        }
    }

    private void safely(String category, Long id, Runnable action) {
        try {
            action.run();
        } catch (RuntimeException error) {
            log.warn("收款提醒扫描单条失败，category={}, id={}, errorType={}",
                    category, id, error.getClass().getSimpleName());
        }
    }

    private LocalDateTime firstNonNull(LocalDateTime... values) {
        for (LocalDateTime value : values) {
            if (value != null) return value;
        }
        return LocalDateTime.now();
    }
}
