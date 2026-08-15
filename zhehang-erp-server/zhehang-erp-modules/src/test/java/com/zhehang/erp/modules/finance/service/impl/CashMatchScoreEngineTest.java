package com.zhehang.erp.modules.finance.service.impl;

import com.zhehang.erp.modules.finance.domain.entity.FinCashJournal;
import com.zhehang.erp.modules.finance.domain.entity.FinCashMatchRuleConfig;
import com.zhehang.erp.modules.finance.domain.vo.MatchableOrderVO;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

class CashMatchScoreEngineTest {

    private final CashMatchScoreEngine engine = new CashMatchScoreEngine();

    @Test
    void ranksExactCustomerOrderNumberAndAmountAsHighConfidence() {
        FinCashJournal journal = journal("杭州星海有限公司", "星海财税", "BD-20260712-18 王丽", "1000.00");
        MatchableOrderVO order = order("杭州星海有限责任公司", "BD2026071218", "王丽", "1000.00");

        engine.apply(journal, order);

        assertThat(order.getScore()).isEqualTo(100);
        assertThat(order.getConfidenceLevel()).isEqualTo("high");
        assertThat(order.getReasons()).contains(
                "客户精确匹配 +50",
                "摘要包含完整报单号 +40",
                "到账余额等于目标未收金额 +15");
    }

    @Test
    void keepsNearAmountCandidateExplainableWithoutAutoPromotingIt() {
        FinCashJournal journal = journal(null, "杭州星海有限公司", "地址服务费", "1000.00");
        MatchableOrderVO order = order("杭州星海有限责任公司", "DZ1024", null, "995.00");

        engine.apply(journal, order);

        assertThat(order.getScore()).isEqualTo(31);
        assertThat(order.getConfidenceLevel()).isEqualTo("low");
        assertThat(order.getReasons()).contains(
                "付款方与报单客户相似 +20",
                "到账金额与未收金额接近 +8");
    }

    @Test
    void customerConflictAppliesPenaltyAndNeverProducesNegativeScore() {
        FinCashJournal journal = journal("甲公司", null, null, "500.00");
        MatchableOrderVO order = order("乙公司", "GS88", null, "900.00");

        engine.apply(journal, order);

        assertThat(order.getScore()).isZero();
        assertThat(order.getConfidenceLevel()).isEqualTo("low");
        assertThat(order.getReasons()).contains("关联客户与报单客户冲突 -40");
    }

    @Test
    void confirmedPayerAliasAddsExplainableScoreWithoutChangingOtherRules() {
        FinCashJournal journal = journal(null, "王小明", "服务费", "1000.00");
        MatchableOrderVO order = order("杭州星海有限责任公司", "DZ1025", null, "1000.00");

        engine.apply(journal, order, "杭州星海有限公司");

        assertThat(order.getScore()).isEqualTo(48);
        assertThat(order.getConfidenceLevel()).isEqualTo("low");
        assertThat(order.getReasons()).contains("已确认付款方别名匹配客户 +30");
    }

    @Test
    void appliesTenantRuleWeightsAndConfidenceThresholdsDuringSimulation() {
        FinCashJournal journal = journal(null, "无关付款方", "服务费", "1000.00");
        MatchableOrderVO order = order("杭州星海有限责任公司", "DZ1026", null, "1000.00");
        FinCashMatchRuleConfig rules = CashMatchRuleService.defaults();
        rules.setPayerSimilarWeight(0);
        rules.setAmountExactWeight(50);
        rules.setDateWeight(0);
        rules.setHighThreshold(45);
        rules.setMediumThreshold(20);

        engine.apply(journal, order, null, rules);

        assertThat(order.getScore()).isEqualTo(50);
        assertThat(order.getConfidenceLevel()).isEqualTo("high");
        assertThat(order.getReasons()).contains("到账余额等于目标未收金额 +50");
    }

    @Test
    void companyNormalizerRemovesLegalSuffixAndPunctuationConsistently() {
        assertThat(CashNameNormalizer.company("杭州·星海（集团）有限责任公司"))
                .isEqualTo("杭州星海集团");
        assertThat(CashNameNormalizer.company(null)).isEmpty();
    }

    private FinCashJournal journal(String customerName, String payerName, String summary, String amount) {
        FinCashJournal journal = new FinCashJournal();
        journal.setCustomerName(customerName);
        journal.setPayerName(payerName);
        journal.setSummary(summary);
        journal.setAmount(new BigDecimal(amount));
        journal.setUnmatchedAmount(new BigDecimal(amount));
        journal.setReceiptDate(LocalDate.of(2026, 7, 12));
        return journal;
    }

    private MatchableOrderVO order(String customerName, String orderNo, String salesName, String unpaidAmount) {
        MatchableOrderVO order = new MatchableOrderVO();
        order.setCustomerName(customerName);
        order.setOrderNo(orderNo);
        order.setSalesName(salesName);
        order.setUnpaidAmount(new BigDecimal(unpaidAmount));
        order.setOrderDate(LocalDate.of(2026, 7, 1));
        return order;
    }
}
