package com.zhehang.erp.modules.finance.service.impl;

import com.zhehang.erp.modules.finance.domain.entity.FinCashJournal;
import com.zhehang.erp.modules.finance.domain.entity.FinCashMatchRuleConfig;
import com.zhehang.erp.modules.finance.domain.vo.MatchableOrderVO;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/** 第一阶段可解释规则推荐，不做低置信度自动核销。 */
@Component
public class CashMatchScoreEngine {

    public void apply(FinCashJournal journal, MatchableOrderVO candidate) {
        apply(journal, candidate, null);
    }

    public void apply(FinCashJournal journal, MatchableOrderVO candidate, String aliasCustomerName) {
        apply(journal, candidate, aliasCustomerName, CashMatchRuleService.defaults());
    }

    public void apply(FinCashJournal journal, MatchableOrderVO candidate, String aliasCustomerName,
                      FinCashMatchRuleConfig ruleConfig) {
        FinCashMatchRuleConfig rules = ruleConfig == null ? CashMatchRuleService.defaults() : ruleConfig;
        int score = 0;
        List<Reason> reasons = new ArrayList<>();
        String journalCustomer = normalizeName(journal.getCustomerName());
        String orderCustomer = normalizeName(candidate.getCustomerName());
        String payer = normalizeName(journal.getPayerName());
        String searchable = normalizeText(join(journal.getSummary(), journal.getRemark(), journal.getBankSerialNo()));

        if (same(journalCustomer, orderCustomer)) {
            int points = rules.getCustomerExactWeight();
            score += points;
            reasons.add(new Reason(points, "客户精确匹配 +" + points));
        } else if (StringUtils.hasText(journalCustomer) && StringUtils.hasText(orderCustomer)) {
            int points = rules.getCustomerConflictPenalty();
            score -= points;
            reasons.add(new Reason(-points, "关联客户与报单客户冲突 -" + points));
        }

        String orderNo = normalizeText(candidate.getOrderNo());
        if (StringUtils.hasText(orderNo) && searchable.contains(orderNo)) {
            int points = rules.getOrderNoWeight();
            score += points;
            reasons.add(new Reason(points, "摘要包含完整报单号 +" + points));
        }

        if (same(normalizeName(aliasCustomerName), orderCustomer)) {
            int points = rules.getPayerAliasWeight();
            score += points;
            reasons.add(new Reason(points, "已确认付款方别名匹配客户 +" + points));
        }

        if (similar(payer, orderCustomer)) {
            int points = rules.getPayerSimilarWeight();
            score += points;
            reasons.add(new Reason(points, "付款方与报单客户相似 +" + points));
        }

        BigDecimal receipt = n(journal.getUnmatchedAmount()).signum() > 0
                ? n(journal.getUnmatchedAmount()) : n(journal.getAmount());
        BigDecimal unpaid = n(candidate.getUnpaidAmount());
        BigDecimal diff = receipt.subtract(unpaid).abs();
        if (receipt.signum() > 0 && receipt.compareTo(unpaid) == 0) {
            int points = rules.getAmountExactWeight();
            score += points;
            reasons.add(new Reason(points, "到账余额等于目标未收金额 +" + points));
        } else if (withinTolerance(receipt, unpaid, diff, rules)) {
            int points = rules.getAmountNearWeight();
            score += points;
            reasons.add(new Reason(points, "到账金额与未收金额接近 +" + points));
        }

        String sales = normalizeText(candidate.getSalesName());
        if (StringUtils.hasText(sales) && searchable.contains(sales)) {
            int points = rules.getSalesWeight();
            score += points;
            reasons.add(new Reason(points, "摘要包含销售姓名 +" + points));
        }

        LocalDate receiptDate = journal.getReceiptDate();
        LocalDate orderDate = candidate.getOrderDate();
        if (receiptDate != null && orderDate != null
                && Math.abs(ChronoUnit.DAYS.between(orderDate, receiptDate)) <= rules.getDateWindowDays()) {
            int points = rules.getDateWeight();
            score += points;
            reasons.add(new Reason(points, "报单日期在到账前后" + rules.getDateWindowDays() + "天内 +" + points));
        }

        int bounded = Math.max(0, Math.min(100, score));
        reasons.sort(Comparator.comparingInt((Reason r) -> Math.abs(r.points())).reversed());
        candidate.setScore(bounded);
        candidate.setReasons(reasons.stream().map(Reason::label).toList());
        candidate.setConfidenceLevel(bounded >= rules.getHighThreshold()
                ? "high" : bounded >= rules.getMediumThreshold() ? "medium" : "low");
    }

    private boolean withinTolerance(BigDecimal receipt, BigDecimal unpaid, BigDecimal diff,
                                    FinCashMatchRuleConfig rules) {
        if (receipt.signum() <= 0 || unpaid.signum() <= 0) {
            return false;
        }
        BigDecimal base = receipt.max(unpaid);
        BigDecimal tolerance = base.multiply(rules.getAmountToleranceRate())
                .max(rules.getAmountToleranceFloor());
        return diff.compareTo(tolerance) <= 0;
    }

    private boolean same(String a, String b) {
        return StringUtils.hasText(a) && a.equals(b);
    }

    private boolean similar(String a, String b) {
        if (!StringUtils.hasText(a) || !StringUtils.hasText(b)) {
            return false;
        }
        return a.equals(b) || (a.length() >= 4 && b.contains(a)) || (b.length() >= 4 && a.contains(b));
    }

    private String normalizeName(String value) {
        return CashNameNormalizer.company(value);
    }

    private String normalizeText(String value) {
        return CashNameNormalizer.text(value);
    }

    private String join(String... values) {
        StringBuilder builder = new StringBuilder();
        for (String value : values) {
            if (StringUtils.hasText(value)) {
                builder.append(value).append(' ');
            }
        }
        return builder.toString();
    }

    private BigDecimal n(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private record Reason(int points, String label) {
    }
}
