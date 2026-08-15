package com.zhehang.erp.modules.finance.service.impl;

import com.baomidou.mybatisplus.core.MybatisConfiguration;
import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.crm.mapper.CrmCustomerMapper;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.finance.domain.dto.CashImportPreviewResult;
import com.zhehang.erp.modules.finance.domain.dto.CashImportRequest;
import com.zhehang.erp.modules.finance.domain.dto.CashImportRowDTO;
import com.zhehang.erp.modules.finance.domain.dto.CashMatchItemDTO;
import com.zhehang.erp.modules.finance.domain.dto.CashMatchRequest;
import com.zhehang.erp.modules.finance.domain.entity.FinCashImportBatch;
import com.zhehang.erp.modules.finance.domain.entity.FinCashJournal;
import com.zhehang.erp.modules.finance.domain.entity.FinCashMatch;
import com.zhehang.erp.modules.finance.mapper.FinCashImportBatchMapper;
import com.zhehang.erp.modules.finance.mapper.FinCashJournalMapper;
import com.zhehang.erp.modules.finance.mapper.FinCashMatchMapper;
import com.zhehang.erp.modules.finance.mapper.FinCashReconcileBatchMapper;
import com.zhehang.erp.modules.finance.mapper.FinReceivableCollectionLogMapper;
import com.zhehang.erp.modules.finance.mapper.FinReceivableRenewalMapper;
import com.zhehang.erp.modules.gs.mapper.BizGsOrderMapper;
import com.zhehang.erp.modules.order.mapper.BizAddressOrderMapper;
import com.zhehang.erp.modules.order.mapper.BizBookkeepingOrderMapper;
import com.zhehang.erp.modules.org.mapper.OrgEmployeeMapper;
import com.zhehang.erp.modules.seal.mapper.BizSealOrderMapper;
import com.zhehang.erp.modules.system.mapper.SysUserMapper;
import com.zhehang.erp.modules.system.service.ISysDictDataService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.apache.ibatis.builder.MapperBuilderAssistant;
import org.mockito.MockedStatic;
import org.springframework.jdbc.BadSqlGrammarException;

import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class CashJournalSafetyTest {
    private FinCashJournalMapper journalMapper;
    private FinCashMatchMapper matchMapper;
    private FinCashImportBatchMapper batchMapper;
    private CashDailyCloseService dailyCloseService;
    private CashAccountService accountService;
    private ISysDictDataService dictDataService;
    private CashJournalServiceImpl service;

    @BeforeEach
    void setUp() throws Exception {
        if (TableInfoHelper.getTableInfo(FinCashJournal.class) == null) {
            TableInfoHelper.initTableInfo(
                    new MapperBuilderAssistant(new MybatisConfiguration(), ""), FinCashJournal.class);
        }
        journalMapper = mock(FinCashJournalMapper.class);
        matchMapper = mock(FinCashMatchMapper.class);
        batchMapper = mock(FinCashImportBatchMapper.class);
        dailyCloseService = mock(CashDailyCloseService.class);
        accountService = mock(CashAccountService.class);
        dictDataService = mock(ISysDictDataService.class);
        service = new CashJournalServiceImpl(
                matchMapper,
                mock(BizBookkeepingOrderMapper.class),
                mock(BizAddressOrderMapper.class),
                mock(BizGsOrderMapper.class),
                mock(BizSealOrderMapper.class),
                mock(SysUserMapper.class),
                batchMapper,
                mock(FinCashReconcileBatchMapper.class),
                mock(CrmCustomerMapper.class),
                mock(OrgEmployeeMapper.class),
                mock(FinReceivableRenewalMapper.class),
                mock(FinReceivableCollectionLogMapper.class),
                mock(CashExceptionService.class),
                dailyCloseService,
                mock(CashJournalEventService.class),
                mock(CashMatchScoreEngine.class),
                mock(CashMatchRuleService.class),
                accountService,
                mock(CashPayerAliasService.class),
                mock(CashMonthlyReportService.class),
                mock(CashNotificationService.class),
                dictDataService,
                new ObjectMapper(),
                mock(DataScopeHelper.class));

        Field field = ServiceImpl.class.getDeclaredField("baseMapper");
        field.setAccessible(true);
        field.set(service, journalMapper);
        when(accountService.disabledAccountNames()).thenReturn(Set.of());
        when(accountService.activeAccountNames()).thenReturn(Set.of("工商银行基本户", "微信经营账户"));
    }

    @Test
    void importPreviewScopesDuplicateSerialByCashAccount() {
        when(journalMapper.selectList(any())).thenReturn(List.of());
        CashImportRequest request = importRequest(
                importRow("工商银行基本户", "TX-001", "甲公司"),
                importRow("微信经营账户", "TX-001", "乙公司"));

        CashImportPreviewResult preview = service.importPreview(request);

        assertThat(preview.getStats().getImportable()).isEqualTo(2);
        assertThat(preview.getRows()).allSatisfy(row -> assertThat(row.getDupStatus()).isNotEqualTo("duplicate"));
    }

    @Test
    void importPreviewStillBlocksSameSerialInsideSameCashAccount() {
        when(journalMapper.selectList(any())).thenReturn(List.of());
        CashImportRequest request = importRequest(
                importRow("工商银行基本户", "TX-002", "甲公司"),
                importRow("工商银行基本户", "TX-002", "乙公司"));

        CashImportPreviewResult preview = service.importPreview(request);

        assertThat(preview.getRows().get(0).getDupStatus()).isNotEqualTo("duplicate");
        assertThat(preview.getRows().get(1).getDupStatus()).isEqualTo("duplicate");
        assertThat(preview.getRows().get(1).getDupReason()).contains("本批内");
    }

    @Test
    void importPreviewUsesBuiltInValuesWhenOptionalDictTableIsMissing() {
        when(dictDataService.listEnabledByType(any())).thenThrow(new BadSqlGrammarException(
                "dict query", "SELECT * FROM sys_dict_data",
                new SQLException("Table sys_dict_data doesn't exist", "42S02", 1146)));
        when(journalMapper.selectList(any())).thenReturn(List.of());

        CashImportPreviewResult preview = service.importPreview(importRequest(
                importRow("工商银行基本户", "TX-003", "甲公司")));

        assertThat(preview.getStats().getImportable()).isEqualTo(1);
    }

    @Test
    void importPreviewDoesNotHideOtherDictionarySqlErrors() {
        BadSqlGrammarException error = new BadSqlGrammarException(
                "dict query", "BROKEN SQL", new SQLException("Syntax error", "42000", 1064));
        when(dictDataService.listEnabledByType(any())).thenThrow(error);

        assertThatThrownBy(() -> service.importPreview(importRequest(
                importRow("工商银行基本户", "TX-004", "甲公司"))))
                .isSameAs(error);
    }

    @Test
    void sameMatchRequestAndSameFinancialContentIsIdempotent() {
        FinCashJournal journal = journal(1L, "approved", "active", LocalDate.of(2026, 7, 12));
        when(journalMapper.selectForUpdate(1L)).thenReturn(journal);
        when(matchMapper.selectList(any())).thenReturn(List.of(match(1L, "bookkeeping", 10L, "100.00")));

        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(SecurityUtils::isCurrentAdmin).thenReturn(true);
            assertThatCode(() -> service.match(matchRequest("REQ-001", "100.00"))).doesNotThrowAnyException();
        }

        verify(matchMapper, never()).insert(any());
    }

    @Test
    void reusedMatchRequestWithDifferentAmountIsRejected() {
        FinCashJournal journal = journal(1L, "draft", "active", LocalDate.of(2026, 7, 12));
        when(journalMapper.selectForUpdate(1L)).thenReturn(journal);
        when(matchMapper.selectList(any())).thenReturn(List.of(match(1L, "bookkeeping", 10L, "100.00")));

        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(SecurityUtils::isCurrentAdmin).thenReturn(true);
            assertThatThrownBy(() -> service.match(matchRequest("REQ-001", "99.00")))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("提交内容不一致");
        }
    }

    @Test
    void rollbackExplainsReviewedAndClosedRowsAndKeepsBatchRetryable() {
        FinCashImportBatch batch = new FinCashImportBatch();
        batch.setId(8L);
        batch.setBatchNo("IMP-001");
        batch.setStatus("imported");
        FinCashJournal reviewed = journal(1L, "approved", "active", LocalDate.of(2026, 7, 10));
        FinCashJournal closed = journal(2L, "draft", "active", LocalDate.of(2026, 7, 11));
        when(batchMapper.selectOne(any())).thenReturn(batch);
        when(journalMapper.selectList(any())).thenReturn(List.of(reviewed, closed));
        when(journalMapper.selectForUpdate(1L)).thenReturn(reviewed);
        when(journalMapper.selectForUpdate(2L)).thenReturn(closed);
        when(matchMapper.selectList(any())).thenReturn(List.of());
        when(dailyCloseService.isDateClosed(LocalDate.of(2026, 7, 11))).thenReturn(true);

        Map<String, Object> result;
        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(SecurityUtils::isCurrentAdmin).thenReturn(true);
            result = service.rollbackBatch("IMP-001");
        }

        assertThat(result.get("status")).isEqualTo("partial_rollback");
        assertThat(result.get("rolledBack")).isEqualTo(0);
        assertThat(result.get("reviewedSkipped")).isEqualTo(1);
        assertThat(result.get("closedSkipped")).isEqualTo(1);
        assertThat(result.get("message")).asString().contains("已审核 1 条", "已日结 1 条");
        assertThat(batch.getStatus()).isEqualTo("partial_rollback");
        verify(batchMapper).updateById(batch);
    }

    @Test
    void rollbackExplainsMatchedRows() {
        FinCashImportBatch batch = new FinCashImportBatch();
        batch.setId(9L);
        batch.setBatchNo("IMP-002");
        batch.setStatus("partial_rollback");
        FinCashJournal matchedJournal = journal(3L, "draft", "active", LocalDate.of(2026, 7, 12));
        when(batchMapper.selectOne(any())).thenReturn(batch);
        when(journalMapper.selectList(any())).thenReturn(List.of(matchedJournal));
        when(journalMapper.selectForUpdate(3L)).thenReturn(matchedJournal);
        when(matchMapper.selectList(any())).thenReturn(List.of(match(3L, "address", 20L, "50.00")));

        Map<String, Object> result;
        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(SecurityUtils::isCurrentAdmin).thenReturn(true);
            result = service.rollbackBatch("IMP-002");
        }

        assertThat(result.get("status")).isEqualTo("partial_rollback");
        assertThat(result.get("matchedSkipped")).isEqualTo(1);
        assertThat(result.get("message")).asString().contains("已核销 1 条");
    }

    private CashImportRequest importRequest(CashImportRowDTO... rows) {
        CashImportRequest request = new CashImportRequest();
        request.setImportType("paste");
        request.setRows(List.of(rows));
        return request;
    }

    private CashImportRowDTO importRow(String account, String serial, String payer) {
        CashImportRowDTO row = new CashImportRowDTO();
        row.setReceiptDate("2026-07-12");
        row.setAmount("100.00");
        row.setPaymentMethod("银行转账");
        row.setReceiveAccount(account);
        row.setBankSerialNo(serial);
        row.setPayerName(payer);
        return row;
    }

    private CashMatchRequest matchRequest(String requestNo, String amount) {
        CashMatchItemDTO item = new CashMatchItemDTO();
        item.setBizType("bookkeeping");
        item.setBizId(10L);
        item.setMatchedAmount(new BigDecimal(amount));
        CashMatchRequest request = new CashMatchRequest();
        request.setJournalId(1L);
        request.setRequestNo(requestNo);
        request.setItems(List.of(item));
        return request;
    }

    private FinCashJournal journal(Long id, String reviewStatus, String recordStatus, LocalDate date) {
        FinCashJournal journal = new FinCashJournal();
        journal.setId(id);
        journal.setReceiptDate(date);
        journal.setAmount(new BigDecimal("200.00"));
        journal.setReviewStatus(reviewStatus);
        journal.setRecordStatus(recordStatus);
        journal.setMatchStatus("waiting");
        return journal;
    }

    private FinCashMatch match(Long journalId, String bizType, Long bizId, String amount) {
        FinCashMatch match = new FinCashMatch();
        match.setJournalId(journalId);
        match.setBizType(bizType);
        match.setBizId(bizId);
        match.setMatchedAmount(new BigDecimal(amount));
        match.setMatchStatus("active");
        match.setRequestNo("REQ-001");
        return match;
    }
}
