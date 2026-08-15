package com.zhehang.erp.modules.finance.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.finance.domain.dto.CashReconcileRequest;
import com.zhehang.erp.modules.finance.domain.dto.CashReconcileResolveRequest;
import com.zhehang.erp.modules.finance.domain.entity.FinCashJournal;
import com.zhehang.erp.modules.finance.domain.entity.FinCashReconcileBatch;
import com.zhehang.erp.modules.finance.domain.entity.FinCashReconcileItem;
import com.zhehang.erp.modules.finance.domain.vo.CashReconcilePreviewVO;
import com.zhehang.erp.modules.finance.mapper.FinCashJournalMapper;
import com.zhehang.erp.modules.finance.mapper.FinCashReconcileBatchMapper;
import com.zhehang.erp.modules.finance.mapper.FinCashReconcileItemMapper;
import com.zhehang.erp.modules.system.domain.entity.SysDictData;
import com.zhehang.erp.modules.system.domain.entity.SysUser;
import com.zhehang.erp.modules.system.mapper.SysUserMapper;
import com.zhehang.erp.modules.system.service.ISysDictDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

/** 渠道到账文件批量自动比对与人工处理。 */
@Service
@RequiredArgsConstructor
public class CashReconcileService {
    private static final int MAX_ROWS = 5000;
    private static final DateTimeFormatter BATCH_TIME = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    private final FinCashReconcileBatchMapper batchMapper;
    private final FinCashReconcileItemMapper itemMapper;
    private final FinCashJournalMapper journalMapper;
    private final ISysDictDataService dictDataService;
    private final SysUserMapper userMapper;
    private final CashNotificationService notificationService;
    private final DataScopeHelper dataScopeHelper;

    public CashReconcilePreviewVO preview(CashReconcileRequest request) {
        validateRequest(request);
        List<CashReconcilePreviewVO.Item> items = parseRows(request.getRows());
        List<CashReconcilePreviewVO.Item> valid = items.stream()
                .filter(row -> row.getErrors().isEmpty()).toList();
        if (!valid.isEmpty()) applyMatches(request.getAccountName().trim(), valid);

        CashReconcilePreviewVO result = new CashReconcilePreviewVO();
        result.setAccountName(request.getAccountName().trim());
        result.setItems(items);
        result.setStats(stats(items));
        return result;
    }

    @Transactional(rollbackFor = Exception.class)
    public Map<String, Object> commit(CashReconcileRequest request) {
        validateRequest(request);
        String requestNo = StringUtils.hasText(request.getRequestNo())
                ? request.getRequestNo().trim() : UUID.randomUUID().toString();
        if (requestNo.length() > 64) throw new BusinessException("对账提交幂等号过长");
        FinCashReconcileBatch existing = batchMapper.selectOne(new LambdaQueryWrapper<FinCashReconcileBatch>()
                .eq(FinCashReconcileBatch::getRequestNo, requestNo).last("LIMIT 1"));
        if (existing != null) {
            assertBatchAccess(existing);
            return batchSummary(existing);
        }

        CashReconcilePreviewVO preview = preview(request);
        if (preview.getStats().getError() > 0) {
            throw new BusinessException("对账文件仍有 " + preview.getStats().getError() + " 条错误，请修正后再提交");
        }
        if (preview.getItems().isEmpty()) throw new BusinessException("对账文件没有可处理的入账行");

        Long uid = SecurityUtils.getCurrentUserId();
        FinCashReconcileBatch batch = new FinCashReconcileBatch();
        batch.setBatchNo("RC" + LocalDateTime.now().format(BATCH_TIME) + String.format("%04d", Math.abs(UUID.randomUUID().hashCode()) % 10000));
        batch.setRequestNo(requestNo);
        batch.setAccountName(preview.getAccountName());
        batch.setStatementStart(preview.getItems().stream().map(CashReconcilePreviewVO.Item::getTransactionDate).min(LocalDate::compareTo).orElse(null));
        batch.setStatementEnd(preview.getItems().stream().map(CashReconcilePreviewVO.Item::getTransactionDate).max(LocalDate::compareTo).orElse(null));
        batch.setFileName(trim(request.getFileName(), 255));
        batch.setMappingJson(trim(request.getMappingJson(), 20000));
        applyStats(batch, preview.getStats());
        batch.setIgnoredCount(0);
        batch.setStatus(pending(preview.getStats()) == 0 ? "matched" : "needs_review");
        batch.setImportedBy(uid);
        batch.setImportedByName(currentUserName(uid));
        batch.setImportedAt(LocalDateTime.now());
        batchMapper.insert(batch);

        for (CashReconcilePreviewVO.Item row : preview.getItems()) {
            FinCashReconcileItem entity = new FinCashReconcileItem();
            entity.setBatchId(batch.getId());
            entity.setRowNo(row.getRowNo());
            entity.setTransactionDate(row.getTransactionDate());
            entity.setTransactionTime(row.getTransactionTime());
            entity.setAmount(row.getAmount());
            entity.setPayerNameRaw(row.getPayerName());
            entity.setPayerNameNormalized(row.getPayerNameNormalized());
            entity.setBankSerialNo(row.getBankSerialNo());
            entity.setSummary(row.getSummary());
            entity.setMatchStatus(row.getMatchStatus());
            entity.setJournalId(row.getJournalId());
            entity.setReceiptNoSnapshot(row.getReceiptNo());
            entity.setMatchRule(row.getMatchRule());
            entity.setConfidenceScore(row.getConfidenceScore());
            if ("matched".equals(row.getMatchStatus())) {
                entity.setResolution("auto");
                entity.setResolvedAt(LocalDateTime.now());
            }
            itemMapper.insert(entity);
        }
        int pending = pending(preview.getStats());
        if (pending > 0) {
            notificationService.reconcileRisk(batch.getTenantId(), uid, batch.getId(), batch.getAccountName(),
                    pending, batch.getImportedAt());
        }
        return batchSummary(batch);
    }

    public IPage<FinCashReconcileBatch> batches(Integer pageNum, Integer pageSize) {
        LambdaQueryWrapper<FinCashReconcileBatch> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(!canSeeAll(), FinCashReconcileBatch::getImportedBy, SecurityUtils.getCurrentUserId())
                .orderByDesc(FinCashReconcileBatch::getImportedAt)
                .orderByDesc(FinCashReconcileBatch::getId);
        return batchMapper.selectPage(new Page<>(positive(pageNum, 1), Math.min(positive(pageSize, 20), 100)), wrapper);
    }

    public Map<String, Object> detail(Long id) {
        FinCashReconcileBatch batch = requireBatch(id);
        assertBatchAccess(batch);
        List<FinCashReconcileItem> items = itemMapper.selectList(new LambdaQueryWrapper<FinCashReconcileItem>()
                .eq(FinCashReconcileItem::getBatchId, id).orderByAsc(FinCashReconcileItem::getRowNo));
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("batch", batch);
        out.put("items", items);
        return out;
    }

    @Transactional(rollbackFor = Exception.class)
    public Map<String, Object> resolve(Long itemId, CashReconcileResolveRequest request) {
        if (request == null || !StringUtils.hasText(request.getAction())) throw new BusinessException("请选择处理动作");
        FinCashReconcileItem item = itemMapper.selectForUpdate(itemId);
        if (item == null) throw new BusinessException("对账明细不存在");
        FinCashReconcileBatch batch = batchMapper.selectForUpdate(item.getBatchId());
        if (batch == null) throw new BusinessException("对账批次不存在");
        assertBatchAccess(batch);

        if ("ignore".equals(request.getAction())) {
            if (!StringUtils.hasText(request.getReason())) throw new BusinessException("忽略差异必须填写原因");
            item.setMatchStatus("ignored");
            item.setJournalId(null);
            item.setReceiptNoSnapshot(null);
            item.setMatchRule("人工忽略");
            item.setConfidenceScore(0);
            item.setResolution("ignored");
            item.setResolutionReason(request.getReason().trim());
        } else if ("link".equals(request.getAction())) {
            if (request.getJournalId() == null) throw new BusinessException("请选择要关联的收款记录");
            FinCashJournal journal = journalMapper.selectById(request.getJournalId());
            validateManualLink(batch, item, journal);
            Long linked = itemMapper.selectCount(new LambdaQueryWrapper<FinCashReconcileItem>()
                    .eq(FinCashReconcileItem::getJournalId, journal.getId())
                    .eq(FinCashReconcileItem::getMatchStatus, "matched")
                    .ne(FinCashReconcileItem::getId, item.getId()));
            if (linked != null && linked > 0) throw new BusinessException("该收款已在其他对账行确认");
            item.setMatchStatus("matched");
            item.setJournalId(journal.getId());
            item.setReceiptNoSnapshot(journal.getReceiptNo());
            item.setMatchRule("人工关联");
            item.setConfidenceScore(100);
            item.setResolution("manual_link");
            item.setResolutionReason(trim(request.getReason(), 500));
        } else {
            throw new BusinessException("不支持的对账处理动作");
        }
        item.setResolvedBy(SecurityUtils.getCurrentUserId());
        item.setResolvedAt(LocalDateTime.now());
        itemMapper.updateById(item);
        recalculateBatch(batch);
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("batch", batch);
        out.put("item", item);
        return out;
    }

    private void applyMatches(String accountName, List<CashReconcilePreviewVO.Item> rows) {
        LocalDate min = rows.stream().map(CashReconcilePreviewVO.Item::getTransactionDate).min(LocalDate::compareTo).orElse(LocalDate.now());
        LocalDate max = rows.stream().map(CashReconcilePreviewVO.Item::getTransactionDate).max(LocalDate::compareTo).orElse(LocalDate.now());
        Set<String> statementSerials = rows.stream().map(CashReconcilePreviewVO.Item::getBankSerialNo)
                .filter(StringUtils::hasText).map(String::trim).collect(Collectors.toSet());
        LambdaQueryWrapper<FinCashJournal> journalQuery = new LambdaQueryWrapper<FinCashJournal>()
                .eq(FinCashJournal::getRecordStatus, "active")
                .eq(FinCashJournal::getReceiveAccount, accountName)
                .and(w -> {
                    w.between(FinCashJournal::getReceiptDate, min.minusDays(1), max.plusDays(1));
                    if (!statementSerials.isEmpty()) w.or().in(FinCashJournal::getBankSerialNo, statementSerials);
                });
        if (!canSeeAll()) {
            dataScopeHelper.applyFinancial(journalQuery, FinCashJournal::getOwnerId, FinCashJournal::getOwnerDeptId);
        }
        List<FinCashJournal> journals = journalMapper.selectList(journalQuery);
        Map<String, List<FinCashJournal>> bySerial = group(journals, j -> serial(j.getBankSerialNo()));
        Map<String, List<FinCashJournal>> byExact = group(journals, this::exactKey);
        Map<String, List<FinCashJournal>> byDateAmount = group(journals, this::dateAmountKey);

        Set<Long> alreadyLinked = new HashSet<>();
        List<Long> journalIds = journals.stream().map(FinCashJournal::getId).filter(Objects::nonNull).toList();
        if (!journalIds.isEmpty()) {
            alreadyLinked.addAll(itemMapper.selectList(new LambdaQueryWrapper<FinCashReconcileItem>()
                            .select(FinCashReconcileItem::getJournalId)
                            .in(FinCashReconcileItem::getJournalId, journalIds)
                            .eq(FinCashReconcileItem::getMatchStatus, "matched"))
                    .stream().map(FinCashReconcileItem::getJournalId).filter(Objects::nonNull).collect(Collectors.toSet()));
        }

        Set<Long> usedThisFile = new HashSet<>();
        for (CashReconcilePreviewVO.Item row : rows) {
            List<FinCashJournal> candidates = Collections.emptyList();
            String rule = null;
            int score = 0;
            String serial = serial(row.getBankSerialNo());
            if (StringUtils.hasText(serial)) {
                candidates = bySerial.getOrDefault(serial, List.of());
                rule = "同账户同流水号";
                score = 100;
                if (candidates.size() == 1 && money(candidates.get(0).getAmount()).compareTo(row.getAmount()) != 0) {
                    assign(row, candidates.get(0), "conflict", "流水号相同但金额不一致", 40);
                    continue;
                }
            }
            if (candidates.isEmpty()) {
                candidates = byExact.getOrDefault(exactKey(row), List.of());
                rule = "日期+金额+付款方";
                score = 90;
            }
            if (candidates.isEmpty()) {
                candidates = byDateAmount.getOrDefault(dateAmountKey(row), List.of());
                rule = "日期+金额";
                score = 70;
            }
            if (candidates.isEmpty()) {
                assign(row, null, "unmatched", "未找到系统收款", 0);
            } else if (candidates.size() > 1) {
                assign(row, candidates.get(0), "conflict", rule + "命中多笔收款", Math.min(score, 60));
            } else {
                FinCashJournal journal = candidates.get(0);
                if (alreadyLinked.contains(journal.getId()) || usedThisFile.contains(journal.getId())) {
                    assign(row, journal, "conflict", "该收款已被其他对账行使用", 30);
                } else if (score >= 90) {
                    assign(row, journal, "matched", rule, score);
                    usedThisFile.add(journal.getId());
                } else {
                    assign(row, journal, "suggested", rule + "，需人工确认付款方或流水", score);
                }
            }
        }
    }

    private List<CashReconcilePreviewVO.Item> parseRows(List<CashReconcileRequest.Row> rawRows) {
        List<CashReconcilePreviewVO.Item> rows = new ArrayList<>();
        int fallback = 1;
        for (CashReconcileRequest.Row raw : rawRows) {
            if (raw == null || blank(raw)) continue;
            CashReconcilePreviewVO.Item row = new CashReconcilePreviewVO.Item();
            row.setRowNo(raw.getRowNo() != null && raw.getRowNo() > 0 ? raw.getRowNo() : fallback);
            row.setTransactionDate(parseDate(raw.getTransactionDate()));
            if (row.getTransactionDate() == null) row.getErrors().add("入账日期格式不正确");
            row.setAmount(parseAmount(raw.getAmount()));
            if (row.getAmount() == null || row.getAmount().signum() <= 0) row.getErrors().add("入账金额必须大于0");
            row.setTransactionTime(parseDateTime(raw.getTransactionTime(), row.getTransactionDate()));
            row.setPayerName(trim(raw.getPayerName(), 200));
            row.setPayerNameNormalized(CashNameNormalizer.company(row.getPayerName()));
            row.setBankSerialNo(trim(raw.getBankSerialNo(), 128));
            row.setSummary(trim(raw.getSummary(), 500));
            if (row.getErrors().isEmpty()) row.setMatchStatus("unmatched");
            else row.setMatchStatus("error");
            row.setConfidenceScore(0);
            rows.add(row);
            fallback++;
        }
        return rows;
    }

    private CashReconcilePreviewVO.Stats stats(List<CashReconcilePreviewVO.Item> rows) {
        CashReconcilePreviewVO.Stats stats = new CashReconcilePreviewVO.Stats();
        stats.setTotal(rows.size());
        for (CashReconcilePreviewVO.Item row : rows) {
            if (!row.getErrors().isEmpty()) stats.setError(stats.getError() + 1);
            else {
                stats.setStatementAmount(stats.getStatementAmount().add(money(row.getAmount())));
                switch (row.getMatchStatus()) {
                    case "matched" -> {
                        stats.setMatched(stats.getMatched() + 1);
                        stats.setMatchedAmount(stats.getMatchedAmount().add(money(row.getAmount())));
                    }
                    case "suggested" -> stats.setSuggested(stats.getSuggested() + 1);
                    case "conflict" -> stats.setConflict(stats.getConflict() + 1);
                    default -> stats.setUnmatched(stats.getUnmatched() + 1);
                }
            }
        }
        return stats;
    }

    private void validateRequest(CashReconcileRequest request) {
        if (request == null || !StringUtils.hasText(request.getAccountName())) throw new BusinessException("请选择系统收款账户");
        if (request.getRows() == null || request.getRows().isEmpty()) throw new BusinessException("对账文件没有数据");
        if (request.getRows().size() > MAX_ROWS) throw new BusinessException("单次对账最多支持5000行");
        List<SysDictData> accountRows = dictDataService.listEnabledByType("receive_account");
        Set<String> accounts = (accountRows == null ? List.<SysDictData>of() : accountRows).stream()
                .map(SysDictData::getDictLabel).filter(StringUtils::hasText).collect(Collectors.toSet());
        if (!accounts.isEmpty() && !accounts.contains(request.getAccountName().trim())) {
            throw new BusinessException("收款账户不在当前启用字典中");
        }
    }

    private void validateManualLink(FinCashReconcileBatch batch, FinCashReconcileItem item, FinCashJournal journal) {
        if (journal == null || !"active".equals(journal.getRecordStatus())) throw new BusinessException("关联收款不存在或已作废");
        if (!canSeeAll() && !dataScopeHelper.canAccess(journal.getOwnerId(), journal.getOwnerDeptId())) {
            throw new BusinessException("无权关联该收款记录");
        }
        if (!Objects.equals(batch.getAccountName(), journal.getReceiveAccount())) throw new BusinessException("关联收款账户与对账批次不一致");
        if (money(item.getAmount()).compareTo(money(journal.getAmount())) != 0) throw new BusinessException("对账金额与收款金额不一致，不能强制关联");
    }

    private void recalculateBatch(FinCashReconcileBatch batch) {
        List<FinCashReconcileItem> rows = itemMapper.selectList(new LambdaQueryWrapper<FinCashReconcileItem>()
                .eq(FinCashReconcileItem::getBatchId, batch.getId()));
        int matched = 0, suggested = 0, unmatched = 0, conflict = 0, ignored = 0;
        BigDecimal matchedAmount = BigDecimal.ZERO;
        for (FinCashReconcileItem row : rows) {
            switch (row.getMatchStatus()) {
                case "matched" -> { matched++; matchedAmount = matchedAmount.add(money(row.getAmount())); }
                case "suggested" -> suggested++;
                case "conflict" -> conflict++;
                case "ignored" -> ignored++;
                default -> unmatched++;
            }
        }
        batch.setMatchedCount(matched);
        batch.setSuggestedCount(suggested);
        batch.setUnmatchedCount(unmatched);
        batch.setConflictCount(conflict);
        batch.setIgnoredCount(ignored);
        batch.setMatchedAmount(matchedAmount);
        int pending = suggested + unmatched + conflict;
        batch.setStatus(pending == 0 ? (ignored > 0 ? "resolved" : "matched") : "needs_review");
        batchMapper.updateById(batch);
    }

    private void applyStats(FinCashReconcileBatch batch, CashReconcilePreviewVO.Stats stats) {
        batch.setTotalCount(stats.getTotal());
        batch.setMatchedCount(stats.getMatched());
        batch.setSuggestedCount(stats.getSuggested());
        batch.setUnmatchedCount(stats.getUnmatched());
        batch.setConflictCount(stats.getConflict());
        batch.setStatementAmount(stats.getStatementAmount());
        batch.setMatchedAmount(stats.getMatchedAmount());
    }

    private int pending(CashReconcilePreviewVO.Stats stats) {
        return stats.getSuggested() + stats.getUnmatched() + stats.getConflict();
    }

    private Map<String, Object> batchSummary(FinCashReconcileBatch batch) {
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("id", batch.getId());
        out.put("batchNo", batch.getBatchNo());
        out.put("status", batch.getStatus());
        out.put("totalCount", batch.getTotalCount());
        out.put("matchedCount", batch.getMatchedCount());
        out.put("pendingCount", n(batch.getSuggestedCount()) + n(batch.getUnmatchedCount()) + n(batch.getConflictCount()));
        out.put("statementAmount", batch.getStatementAmount());
        out.put("matchedAmount", batch.getMatchedAmount());
        return out;
    }

    private Map<String, List<FinCashJournal>> group(List<FinCashJournal> rows, Function<FinCashJournal, String> key) {
        return rows.stream().filter(row -> StringUtils.hasText(key.apply(row)))
                .collect(Collectors.groupingBy(key, HashMap::new, Collectors.toList()));
    }

    private void assign(CashReconcilePreviewVO.Item row, FinCashJournal journal, String status, String rule, int score) {
        row.setMatchStatus(status);
        row.setMatchRule(rule);
        row.setConfidenceScore(score);
        if (journal != null) {
            row.setJournalId(journal.getId());
            row.setReceiptNo(journal.getReceiptNo());
            row.setJournalPayerName(journal.getPayerName());
        }
    }

    private String exactKey(FinCashJournal row) {
        return row.getReceiptDate() + "|" + money(row.getAmount()) + "|" + CashNameNormalizer.company(row.getPayerName());
    }

    private String exactKey(CashReconcilePreviewVO.Item row) {
        return row.getTransactionDate() + "|" + money(row.getAmount()) + "|" + row.getPayerNameNormalized();
    }

    private String dateAmountKey(FinCashJournal row) {
        return row.getReceiptDate() + "|" + money(row.getAmount());
    }

    private String dateAmountKey(CashReconcilePreviewVO.Item row) {
        return row.getTransactionDate() + "|" + money(row.getAmount());
    }

    private String serial(String value) {
        return StringUtils.hasText(value) ? value.trim().toUpperCase() : "";
    }

    private LocalDate parseDate(String value) {
        if (!StringUtils.hasText(value)) return null;
        String normalized = value.trim().replace('/', '-').replace('.', '-');
        int space = normalized.indexOf(' ');
        if (space > 0) normalized = normalized.substring(0, space);
        try {
            String[] parts = normalized.split("-");
            if (parts.length == 3) return LocalDate.of(Integer.parseInt(parts[0]), Integer.parseInt(parts[1]), Integer.parseInt(parts[2]));
        } catch (RuntimeException ignore) {
            return null;
        }
        return null;
    }

    private LocalDateTime parseDateTime(String value, LocalDate date) {
        if (!StringUtils.hasText(value) || date == null) return null;
        String normalized = value.trim().replace('/', '-').replace('.', '-');
        try {
            if (normalized.contains("T")) return LocalDateTime.parse(normalized);
            if (normalized.contains(" ")) {
                if (normalized.length() == 16) normalized += ":00";
                return LocalDateTime.parse(normalized, DateTimeFormatter.ofPattern("yyyy-M-d HH:mm:ss"));
            }
            String[] parts = normalized.split(":");
            if (parts.length >= 2) {
                LocalTime time = LocalTime.of(Integer.parseInt(parts[0]), Integer.parseInt(parts[1]), parts.length > 2 ? Integer.parseInt(parts[2]) : 0);
                return date.atTime(time);
            }
        } catch (DateTimeParseException | NumberFormatException ignore) {
            return null;
        }
        return null;
    }

    private BigDecimal parseAmount(String value) {
        if (!StringUtils.hasText(value)) return null;
        try {
            return new BigDecimal(value.replaceAll("[￥¥$,\\s\\u00A0]", "")).setScale(2, RoundingMode.HALF_UP);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private boolean blank(CashReconcileRequest.Row row) {
        return !StringUtils.hasText(row.getTransactionDate()) && !StringUtils.hasText(row.getAmount())
                && !StringUtils.hasText(row.getPayerName()) && !StringUtils.hasText(row.getBankSerialNo())
                && !StringUtils.hasText(row.getSummary());
    }

    private FinCashReconcileBatch requireBatch(Long id) {
        FinCashReconcileBatch batch = batchMapper.selectById(id);
        if (batch == null) throw new BusinessException("对账批次不存在");
        return batch;
    }

    private void assertBatchAccess(FinCashReconcileBatch batch) {
        if (!canSeeAll() && !Objects.equals(batch.getImportedBy(), SecurityUtils.getCurrentUserId())) {
            throw new BusinessException("无权访问该对账批次");
        }
    }

    private boolean canSeeAll() {
        return SecurityUtils.isCurrentAdmin() || SecurityUtils.hasAnyRole("finance_hq", "boss");
    }

    private String currentUserName(Long uid) {
        SysUser user = uid == null ? null : userMapper.selectById(uid);
        if (user == null) return uid == null ? "系统" : "用户" + uid;
        return StringUtils.hasText(user.getNickname()) ? user.getNickname() : user.getUsername();
    }

    private String trim(String value, int max) {
        if (!StringUtils.hasText(value)) return null;
        String text = value.trim();
        return text.length() <= max ? text : text.substring(0, max);
    }

    private BigDecimal money(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value.setScale(2, RoundingMode.HALF_UP);
    }

    private int n(Integer value) {
        return value == null ? 0 : value;
    }

    private int positive(Integer value, int fallback) {
        return value != null && value > 0 ? value : fallback;
    }
}
