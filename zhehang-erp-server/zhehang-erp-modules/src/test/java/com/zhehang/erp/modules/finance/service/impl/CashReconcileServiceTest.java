package com.zhehang.erp.modules.finance.service.impl;

import com.baomidou.mybatisplus.core.MybatisConfiguration;
import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import com.zhehang.erp.modules.finance.domain.dto.CashReconcileRequest;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.finance.domain.entity.FinCashJournal;
import com.zhehang.erp.modules.finance.domain.entity.FinCashReconcileItem;
import com.zhehang.erp.modules.finance.domain.vo.CashReconcilePreviewVO;
import com.zhehang.erp.modules.finance.mapper.FinCashJournalMapper;
import com.zhehang.erp.modules.finance.mapper.FinCashReconcileBatchMapper;
import com.zhehang.erp.modules.finance.mapper.FinCashReconcileItemMapper;
import com.zhehang.erp.modules.system.mapper.SysUserMapper;
import com.zhehang.erp.modules.system.service.ISysDictDataService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.apache.ibatis.builder.MapperBuilderAssistant;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class CashReconcileServiceTest {

    private FinCashJournalMapper journalMapper;
    private FinCashReconcileItemMapper itemMapper;
    private ISysDictDataService dictDataService;
    private CashReconcileService service;

    @BeforeEach
    void setUp() {
        TableInfoHelper.initTableInfo(
                new MapperBuilderAssistant(new MybatisConfiguration(), ""), FinCashReconcileItem.class);
        journalMapper = mock(FinCashJournalMapper.class);
        itemMapper = mock(FinCashReconcileItemMapper.class);
        dictDataService = mock(ISysDictDataService.class);
        when(dictDataService.listEnabledByType("receive_account")).thenReturn(List.of());
        when(itemMapper.selectList(any())).thenReturn(List.of());
        service = new CashReconcileService(
                mock(FinCashReconcileBatchMapper.class),
                itemMapper,
                journalMapper,
                dictDataService,
                mock(SysUserMapper.class),
                mock(CashNotificationService.class),
                mock(DataScopeHelper.class));
    }

    @Test
    void exactSerialAndAmountProducesAutomaticMatch() {
        when(journalMapper.selectList(any())).thenReturn(List.of(
                journal(11L, "RC-001", "2026-07-12", "1000.00", "公司基本户", "杭州星海有限公司", "BANK-88")));

        CashReconcilePreviewVO result = service.preview(request(row("2026-07-12", "1000", "杭州星海", "BANK-88")));

        assertThat(result.getStats().getMatched()).isEqualTo(1);
        assertThat(result.getItems()).singleElement().satisfies(item -> {
            assertThat(item.getMatchStatus()).isEqualTo("matched");
            assertThat(item.getJournalId()).isEqualTo(11L);
            assertThat(item.getConfidenceScore()).isEqualTo(100);
            assertThat(item.getMatchRule()).isEqualTo("同账户同流水号");
        });
    }

    @Test
    void sameDateAndAmountWithMultipleReceiptsStaysConflict() {
        when(journalMapper.selectList(any())).thenReturn(List.of(
                journal(11L, "RC-001", "2026-07-12", "1000.00", "公司基本户", "甲公司", null),
                journal(12L, "RC-002", "2026-07-12", "1000.00", "公司基本户", "乙公司", null)));

        CashReconcilePreviewVO result = service.preview(request(row("2026-07-12", "1000", "其他付款方", null)));

        assertThat(result.getStats().getConflict()).isEqualTo(1);
        assertThat(result.getItems().get(0).getMatchStatus()).isEqualTo("conflict");
        assertThat(result.getItems().get(0).getMatchRule()).contains("命中多笔收款");
    }

    @Test
    void sameSerialWithDifferentAmountIsExplicitConflict() {
        when(journalMapper.selectList(any())).thenReturn(List.of(
                journal(11L, "RC-001", "2026-07-12", "900.00", "公司基本户", "甲公司", "BANK-88")));

        CashReconcilePreviewVO result = service.preview(request(row("2026-07-12", "1000", "甲公司", "BANK-88")));

        assertThat(result.getStats().getConflict()).isEqualTo(1);
        assertThat(result.getItems().get(0).getMatchRule()).contains("流水号相同但金额不一致");
    }

    @Test
    void invalidDateAndNonPositiveAmountAreRejectedBeforeMatching() {
        CashReconcilePreviewVO result = service.preview(request(row("2026-02-30", "-1", "甲公司", null)));

        assertThat(result.getStats().getError()).isEqualTo(1);
        assertThat(result.getStats().getStatementAmount()).isEqualByComparingTo("0.00");
        assertThat(result.getItems()).singleElement().satisfies(item -> {
            assertThat(item.getMatchStatus()).isEqualTo("error");
            assertThat(item.getErrors()).contains("入账日期格式不正确", "入账金额必须大于0");
        });
    }

    private CashReconcileRequest request(CashReconcileRequest.Row... rows) {
        CashReconcileRequest request = new CashReconcileRequest();
        request.setAccountName("公司基本户");
        request.setFileName("statement.xlsx");
        request.setRows(List.of(rows));
        return request;
    }

    private CashReconcileRequest.Row row(String date, String amount, String payer, String serial) {
        CashReconcileRequest.Row row = new CashReconcileRequest.Row();
        row.setRowNo(1);
        row.setTransactionDate(date);
        row.setAmount(amount);
        row.setPayerName(payer);
        row.setBankSerialNo(serial);
        return row;
    }

    private FinCashJournal journal(Long id, String receiptNo, String date, String amount,
                                   String account, String payer, String serial) {
        FinCashJournal journal = new FinCashJournal();
        journal.setId(id);
        journal.setReceiptNo(receiptNo);
        journal.setReceiptDate(LocalDate.parse(date));
        journal.setAmount(new BigDecimal(amount));
        journal.setReceiveAccount(account);
        journal.setPayerName(payer);
        journal.setBankSerialNo(serial);
        journal.setRecordStatus("active");
        return journal;
    }
}
