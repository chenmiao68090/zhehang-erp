package com.zhehang.erp.modules.finance.service.impl;

import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.finance.domain.dto.CashAccountAdjustmentRequest;
import com.zhehang.erp.modules.finance.domain.dto.CashBalanceSnapshotRequest;
import com.zhehang.erp.modules.finance.domain.entity.FinCashAccount;
import com.zhehang.erp.modules.finance.domain.entity.FinCashAccountAdjustment;
import com.zhehang.erp.modules.finance.domain.entity.FinCashBalanceSnapshot;
import com.zhehang.erp.modules.finance.domain.entity.FinCashJournal;
import com.zhehang.erp.modules.finance.mapper.CashAccountLedgerMapper;
import com.zhehang.erp.modules.finance.mapper.FinCashAccountAdjustmentMapper;
import com.zhehang.erp.modules.finance.mapper.FinCashAccountMapper;
import com.zhehang.erp.modules.finance.mapper.FinCashBalanceSnapshotMapper;
import com.zhehang.erp.modules.system.mapper.SysUserMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.when;

class CashAccountServiceTest {
    private FinCashAccountMapper accountMapper;
    private FinCashAccountAdjustmentMapper adjustmentMapper;
    private FinCashBalanceSnapshotMapper snapshotMapper;
    private CashAccountLedgerMapper ledgerMapper;
    private CashDailyCloseService dailyCloseService;
    private CashAccountService service;

    @BeforeEach
    void setUp() {
        accountMapper = mock(FinCashAccountMapper.class);
        adjustmentMapper = mock(FinCashAccountAdjustmentMapper.class);
        snapshotMapper = mock(FinCashBalanceSnapshotMapper.class);
        ledgerMapper = mock(CashAccountLedgerMapper.class);
        dailyCloseService = mock(CashDailyCloseService.class);
        service = new CashAccountService(accountMapper, adjustmentMapper, snapshotMapper, ledgerMapper,
                mock(SysUserMapper.class), dailyCloseService);
    }

    @Test
    void bindsStableAccountIdAndKeepsNameSnapshotOnReceipt() {
        FinCashAccount account = account(12L, "工商银行基本户", "100.00");
        when(accountMapper.selectOne(any())).thenReturn(account);
        FinCashJournal journal = new FinCashJournal();
        journal.setCashAccountId(12L);

        service.bindJournalAccount(journal);

        assertThat(journal.getCashAccountId()).isEqualTo(12L);
        assertThat(journal.getReceiveAccount()).isEqualTo("工商银行基本户");
    }

    @Test
    void regularFinanceCannotReadSensitiveAccountBalances() {
        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(SecurityUtils::isCurrentAdmin).thenReturn(false);
            security.when(() -> SecurityUtils.hasAnyRole("finance_hq", "boss")).thenReturn(false);

            assertThatThrownBy(() -> service.summaries(false))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("财务负责人");
        }
    }

    @Test
    void bulkImportCannotBypassDisabledAccountThroughLegacyDictionaryName() {
        FinCashAccount account = account(12L, "工商银行基本户", "100.00");
        account.setStatus("disabled");
        when(accountMapper.selectList(any())).thenReturn(List.of(account));
        FinCashJournal journal = new FinCashJournal();
        journal.setReceiveAccount("工商银行基本户");

        assertThatThrownBy(() -> service.bindJournalAccounts(List.of(journal)))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("已停用资金账户");
    }

    @Test
    void adjustmentIsIdempotentAndCreatesAuditableSignedFlow() {
        FinCashAccount account = account(12L, "工商银行基本户", "100.00");
        when(accountMapper.selectOne(any())).thenReturn(account);
        AtomicReference<FinCashAccountAdjustment> inserted = new AtomicReference<>();
        when(adjustmentMapper.insert(any())).thenAnswer(invocation -> {
            FinCashAccountAdjustment entity = invocation.getArgument(0);
            entity.setId(21L);
            inserted.set(entity);
            return 1;
        });
        CashAccountAdjustmentRequest request = new CashAccountAdjustmentRequest();
        request.setRequestNo("ADJ-001");
        request.setAdjustmentDate(LocalDate.of(2026, 7, 12));
        request.setDirection("out");
        request.setAdjustmentType("bank_fee");
        request.setAmount(new BigDecimal("12.34"));
        request.setReason("银行手续费");

        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(SecurityUtils::isCurrentAdmin).thenReturn(true);
            security.when(SecurityUtils::getCurrentUserId).thenReturn(7L);
            FinCashAccountAdjustment result = service.adjust(12L, request);

            assertThat(result.getId()).isEqualTo(21L);
            assertThat(inserted.get().getDirection()).isEqualTo("out");
            assertThat(inserted.get().getAmount()).isEqualByComparingTo("12.34");
            assertThat(inserted.get().getReason()).isEqualTo("银行手续费");
        }
    }

    @Test
    void rejectsReusedAdjustmentRequestNumberWithDifferentFinancialContent() {
        FinCashAccount account = account(12L, "工商银行基本户", "100.00");
        when(accountMapper.selectOne(any())).thenReturn(account);
        FinCashAccountAdjustment existing = new FinCashAccountAdjustment();
        existing.setAccountId(12L);
        existing.setAdjustmentDate(LocalDate.of(2026, 7, 12));
        existing.setDirection("out");
        existing.setAdjustmentType("bank_fee");
        existing.setAmount(new BigDecimal("10.00"));
        existing.setReason("银行手续费");
        when(adjustmentMapper.selectOne(any())).thenReturn(existing);
        CashAccountAdjustmentRequest request = new CashAccountAdjustmentRequest();
        request.setRequestNo("ADJ-001");
        request.setAdjustmentDate(LocalDate.of(2026, 7, 12));
        request.setDirection("out");
        request.setAdjustmentType("bank_fee");
        request.setAmount(new BigDecimal("20.00"));
        request.setReason("银行手续费");

        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(SecurityUtils::isCurrentAdmin).thenReturn(true);
            assertThatThrownBy(() -> service.adjust(12L, request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("其他余额调整内容");
        }
    }

    @Test
    void previewsSystemBalanceForSelectedHistoricalDate() {
        FinCashAccount account = account(12L, "工商银行基本户", "100.00");
        when(accountMapper.selectById(12L)).thenReturn(account);
        when(ledgerMapper.sumReceipts(anyLong(), anyLong(), any(), any(), any())).thenReturn(new BigDecimal("50.00"));
        when(ledgerMapper.sumAdjustments(anyLong(), anyLong(), any(), any())).thenReturn(new BigDecimal("-10.00"));

        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(SecurityUtils::isCurrentAdmin).thenReturn(true);
            security.when(SecurityUtils::getCurrentTenantId).thenReturn(1L);
            var result = service.balancePreview(12L, LocalDate.of(2026, 7, 10));

            assertThat(result.get("date")).isEqualTo(LocalDate.of(2026, 7, 10));
            assertThat(result.get("systemBalance")).isEqualTo(new BigDecimal("140.00"));
        }
    }

    @Test
    void snapshotStoresServerCalculatedBalanceAndDifference() {
        FinCashAccount account = account(12L, "工商银行基本户", "100.00");
        when(accountMapper.selectOne(any())).thenReturn(account);
        when(snapshotMapper.selectCount(any())).thenReturn(0L);
        when(ledgerMapper.sumReceipts(anyLong(), anyLong(), any(), any(), any())).thenReturn(new BigDecimal("50.00"));
        when(ledgerMapper.sumAdjustments(anyLong(), anyLong(), any(), any())).thenReturn(new BigDecimal("-10.00"));
        AtomicReference<FinCashBalanceSnapshot> inserted = new AtomicReference<>();
        when(snapshotMapper.insert(any())).thenAnswer(invocation -> {
            FinCashBalanceSnapshot entity = invocation.getArgument(0);
            entity.setId(31L);
            inserted.set(entity);
            return 1;
        });
        CashBalanceSnapshotRequest request = new CashBalanceSnapshotRequest();
        request.setRequestNo("BAL-001");
        request.setSnapshotDate(LocalDate.of(2026, 7, 12));
        request.setActualBalance(new BigDecimal("142.00"));
        request.setDifferenceReason("两元待核实");

        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(SecurityUtils::isCurrentAdmin).thenReturn(true);
            security.when(SecurityUtils::getCurrentTenantId).thenReturn(1L);
            security.when(SecurityUtils::getCurrentUserId).thenReturn(7L);
            FinCashBalanceSnapshot result = service.submitSnapshot(12L, request);

            assertThat(result.getSystemBalance()).isEqualByComparingTo("140.00");
            assertThat(result.getDifferenceAmount()).isEqualByComparingTo("2.00");
            assertThat(result.getStatus()).isEqualTo("difference");
            assertThat(inserted.get().getDifferenceReason()).isEqualTo("两元待核实");
        }
    }

    private FinCashAccount account(Long id, String name, String openingBalance) {
        FinCashAccount account = new FinCashAccount();
        account.setId(id);
        account.setAccountName(name);
        account.setAccountType("bank");
        account.setOpeningDate(LocalDate.of(2026, 1, 1));
        account.setOpeningBalance(new BigDecimal(openingBalance));
        account.setStatus("active");
        account.setVersion(0);
        return account;
    }
}
