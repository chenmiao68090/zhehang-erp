package com.zhehang.erp.modules.finance.service.impl;

import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.finance.domain.dto.CashLegacyLinkRequest;
import com.zhehang.erp.modules.finance.domain.dto.CashMatchRequest;
import com.zhehang.erp.modules.finance.domain.entity.FinCashJournal;
import com.zhehang.erp.modules.finance.domain.entity.FinCashMatch;
import com.zhehang.erp.modules.finance.domain.entity.FinReceivableCollectionLog;
import com.zhehang.erp.modules.finance.domain.entity.FinReceivableRenewal;
import com.zhehang.erp.modules.finance.domain.vo.CashJournalDetailVO;
import com.zhehang.erp.modules.finance.mapper.FinCashJournalMapper;
import com.zhehang.erp.modules.finance.mapper.FinCashMatchMapper;
import com.zhehang.erp.modules.finance.mapper.FinReceivableCollectionLogMapper;
import com.zhehang.erp.modules.finance.mapper.FinReceivableRenewalMapper;
import com.zhehang.erp.modules.finance.service.ICashJournalService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.MockedStatic;

import java.math.BigDecimal;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class CashLegacyGovernanceServiceTest {

    private FinReceivableCollectionLogMapper logMapper;
    private FinReceivableRenewalMapper receivableMapper;
    private FinCashMatchMapper matchMapper;
    private ICashJournalService cashJournalService;
    private CashLegacyGovernanceService service;

    @BeforeEach
    void setUp() {
        logMapper = mock(FinReceivableCollectionLogMapper.class);
        receivableMapper = mock(FinReceivableRenewalMapper.class);
        matchMapper = mock(FinCashMatchMapper.class);
        cashJournalService = mock(ICashJournalService.class);
        service = new CashLegacyGovernanceService(
                logMapper,
                receivableMapper,
                mock(FinCashJournalMapper.class),
                matchMapper,
                cashJournalService);
    }

    @Test
    void linksLegacyBaselineToRealCashWithoutChangingTotalReceived() {
        FinReceivableCollectionLog log = new FinReceivableCollectionLog();
        log.setId(5L);
        log.setReceivableId(9L);
        log.setActionType("记录收款");
        log.setSourceType("legacy");
        log.setPaymentAmount(new BigDecimal("100.00"));
        log.setContent("原始手工回款记录");
        when(logMapper.selectForUpdate(5L)).thenReturn(log);

        FinReceivableRenewal receivable = new FinReceivableRenewal();
        receivable.setId(9L);
        receivable.setCustomerName("杭州星海有限公司");
        receivable.setReceivableAmount(new BigDecimal("200.00"));
        receivable.setLegacyReceivedAmount(new BigDecimal("100.00"));
        receivable.setReceivedAmount(new BigDecimal("100.00"));
        when(receivableMapper.selectForUpdate(9L)).thenReturn(receivable);
        when(receivableMapper.selectById(9L)).thenReturn(receivable);

        FinCashJournal journal = new FinCashJournal();
        journal.setId(12L);
        journal.setReceiptNo("RC202607120001");
        journal.setRecordStatus("active");
        journal.setAmount(new BigDecimal("100.00"));
        journal.setUnmatchedAmount(new BigDecimal("100.00"));
        CashJournalDetailVO detail = new CashJournalDetailVO();
        detail.setJournal(journal);
        when(cashJournalService.detail(12L)).thenReturn(detail);

        FinCashMatch match = new FinCashMatch();
        match.setId(21L);
        when(matchMapper.selectOne(any())).thenReturn(match);
        when(logMapper.markLegacyLinked(eq(5L), eq(12L), eq(21L), any())).thenReturn(1);

        CashLegacyLinkRequest request = new CashLegacyLinkRequest();
        request.setJournalId(12L);
        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(SecurityUtils::isCurrentAdmin).thenReturn(true);
            Map<String, Object> result = service.link(5L, request);

            assertThat(receivable.getLegacyReceivedAmount()).isEqualByComparingTo("0.00");
            assertThat(result.get("receivedAmount")).isEqualTo(new BigDecimal("100.00"));
        }

        ArgumentCaptor<CashMatchRequest> matchRequest = ArgumentCaptor.forClass(CashMatchRequest.class);
        verify(cashJournalService).match(matchRequest.capture());
        assertThat(matchRequest.getValue().getMatchMethod()).isEqualTo("legacy_link");
        assertThat(matchRequest.getValue().getItems()).singleElement()
                .satisfies(item -> assertThat(item.getMatchedAmount()).isEqualByComparingTo("100.00"));
        verify(logMapper).markLegacyLinked(eq(5L), eq(12L), eq(21L),
                org.mockito.ArgumentMatchers.contains("原始手工回款记录"));
    }
}
