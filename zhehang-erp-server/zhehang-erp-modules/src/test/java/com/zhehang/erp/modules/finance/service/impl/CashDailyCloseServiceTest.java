package com.zhehang.erp.modules.finance.service.impl;

import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.finance.domain.dto.CashActionRequest;
import com.zhehang.erp.modules.finance.domain.entity.FinCashDailyClose;
import com.zhehang.erp.modules.finance.domain.entity.FinCashDailyCloseAccount;
import com.zhehang.erp.modules.finance.mapper.FinCashDailyCloseAccountMapper;
import com.zhehang.erp.modules.finance.mapper.FinCashDailyCloseMapper;
import com.zhehang.erp.modules.finance.mapper.FinCashJournalMapper;
import com.zhehang.erp.modules.finance.mapper.FinCashMatchMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class CashDailyCloseServiceTest {

    private FinCashDailyCloseMapper closeMapper;
    private FinCashDailyCloseAccountMapper accountMapper;
    private FinCashJournalMapper journalMapper;
    private CashExceptionService exceptionService;
    private CashNotificationService notificationService;
    private CashDailyCloseService service;

    @BeforeEach
    void setUp() {
        closeMapper = mock(FinCashDailyCloseMapper.class);
        accountMapper = mock(FinCashDailyCloseAccountMapper.class);
        journalMapper = mock(FinCashJournalMapper.class);
        exceptionService = mock(CashExceptionService.class);
        notificationService = mock(CashNotificationService.class);
        service = new CashDailyCloseService(
                closeMapper,
                accountMapper,
                journalMapper,
                mock(FinCashMatchMapper.class),
                exceptionService,
                notificationService);
    }

    @Test
    void closesWhenSubmittedSystemSnapshotIsStillCurrent() {
        FinCashDailyClose close = submittedClose();
        when(closeMapper.selectForUpdate(9L)).thenReturn(close);
        when(exceptionService.hasUnresolvedForDailyClose(9L)).thenReturn(false);
        when(journalMapper.selectDailyAccountSummary(close.getCloseDate()))
                .thenReturn(List.of(systemRow(2, "100.00")));
        when(accountMapper.selectList(any())).thenReturn(List.of(submittedAccount(2, "100.00")));
        when(closeMapper.updateById(any())).thenReturn(1);

        try (MockedStatic<SecurityUtils> security = managerSecurity()) {
            FinCashDailyClose result = service.close(9L);
            assertThat(result.getStatus()).isEqualTo("closed");
            assertThat(result.getClosedAt()).isNotNull();
            verify(notificationService).dailyCloseClosed(eq(1L), eq(9L), eq("2026-07-12"),
                    eq(1L), eq(0), eq(result.getClosedAt()));
            verify(notificationService, never()).dailyCloseReopened(any(), any(), any(), any(), any(), any());
        }
    }

    @Test
    void reopensClosedDayWithReopenedNotificationOnly() {
        FinCashDailyClose close = submittedClose();
        close.setStatus("closed");
        when(closeMapper.selectForUpdate(9L)).thenReturn(close);
        when(closeMapper.updateById(any())).thenReturn(1);
        CashActionRequest request = new CashActionRequest();
        request.setReason("银行补传流水");

        try (MockedStatic<SecurityUtils> security = managerSecurity()) {
            FinCashDailyClose result = service.reopen(9L, request);
            assertThat(result.getStatus()).isEqualTo("reopened");
            assertThat(result.getReopenReason()).isEqualTo("银行补传流水");
            verify(notificationService).dailyCloseReopened(eq(1L), eq(9L), eq("2026-07-12"),
                    eq(1L), eq(0), eq(result.getReopenedAt()));
            verify(notificationService, never()).dailyCloseClosed(any(), any(), any(), any(), any(), any());
        }
    }

    @Test
    void refusesToCloseWhenAReceiptChangedAfterSubmission() {
        FinCashDailyClose close = submittedClose();
        when(closeMapper.selectForUpdate(9L)).thenReturn(close);
        when(exceptionService.hasUnresolvedForDailyClose(9L)).thenReturn(false);
        when(journalMapper.selectDailyAccountSummary(close.getCloseDate()))
                .thenReturn(List.of(systemRow(3, "130.00")));
        when(accountMapper.selectList(any())).thenReturn(List.of(submittedAccount(2, "100.00")));

        try (MockedStatic<SecurityUtils> security = managerSecurity()) {
            assertThatThrownBy(() -> service.close(9L))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("系统到账已变化");
        }
    }

    private FinCashDailyClose submittedClose() {
        FinCashDailyClose close = new FinCashDailyClose();
        close.setId(9L);
        close.setCloseDate(LocalDate.of(2026, 7, 12));
        close.setStatus("submitted");
        close.setTenantId(1L);
        close.setSystemCount(2);
        close.setSystemAmount(new BigDecimal("100.00"));
        close.setVersion(0);
        return close;
    }

    private FinCashDailyCloseAccount submittedAccount(int count, String amount) {
        FinCashDailyCloseAccount account = new FinCashDailyCloseAccount();
        account.setCloseId(9L);
        account.setAccountName("公司基本户");
        account.setSystemCount(count);
        account.setSystemAmount(new BigDecimal(amount));
        return account;
    }

    private Map<String, Object> systemRow(int count, String amount) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("accountName", "公司基本户");
        row.put("systemCount", count);
        row.put("systemAmount", new BigDecimal(amount));
        return row;
    }

    private MockedStatic<SecurityUtils> managerSecurity() {
        MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class);
        security.when(SecurityUtils::isCurrentAdmin).thenReturn(true);
        security.when(SecurityUtils::getCurrentUserId).thenReturn(1L);
        return security;
    }
}
