package com.zhehang.erp.modules.finance.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.finance.domain.dto.CashActionRequest;
import com.zhehang.erp.modules.finance.domain.dto.CashDailyCloseSubmitRequest;
import com.zhehang.erp.modules.finance.domain.entity.FinCashDailyClose;
import com.zhehang.erp.modules.finance.domain.entity.FinCashDailyCloseAccount;
import com.zhehang.erp.modules.finance.domain.entity.FinCashJournal;
import com.zhehang.erp.modules.finance.mapper.FinCashDailyCloseAccountMapper;
import com.zhehang.erp.modules.finance.mapper.FinCashDailyCloseMapper;
import com.zhehang.erp.modules.finance.mapper.FinCashJournalMapper;
import com.zhehang.erp.modules.finance.mapper.FinCashMatchMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

/** 收款日结：按到账日期与账户核对系统数和实际入账数。 */
@Service
@RequiredArgsConstructor
public class CashDailyCloseService {

    private static final String STATUS_OPEN = "open";
    private static final String STATUS_SUBMITTED = "submitted";
    private static final String STATUS_CLOSED = "closed";
    private static final String STATUS_REOPENED = "reopened";

    private final FinCashDailyCloseMapper closeMapper;
    private final FinCashDailyCloseAccountMapper accountMapper;
    private final FinCashJournalMapper journalMapper;
    private final FinCashMatchMapper matchMapper;
    private final CashExceptionService exceptionService;
    private final CashNotificationService notificationService;

    public Map<String, Object> preview(LocalDate date) {
        LocalDate target = date != null ? date : LocalDate.now();
        FinCashDailyClose close = findByDate(target);
        List<FinCashDailyCloseAccount> persisted = close == null
                ? List.of() : accountMapper.selectList(new LambdaQueryWrapper<FinCashDailyCloseAccount>()
                .eq(FinCashDailyCloseAccount::getCloseId, close.getId())
                .orderByAsc(FinCashDailyCloseAccount::getAccountName));
        Map<String, FinCashDailyCloseAccount> oldByAccount = persisted.stream()
                .collect(Collectors.toMap(FinCashDailyCloseAccount::getAccountName, Function.identity(), (a, b) -> a));

        List<Map<String, Object>> systemRows = journalMapper.selectDailyAccountSummary(target);
        Set<String> names = new LinkedHashSet<>();
        for (Map<String, Object> row : systemRows) {
            names.add(String.valueOf(row.get("accountName")));
        }
        names.addAll(oldByAccount.keySet());

        Map<String, Map<String, Object>> systemByName = systemRows.stream()
                .collect(Collectors.toMap(row -> String.valueOf(row.get("accountName")), Function.identity(), (a, b) -> a));
        List<FinCashDailyCloseAccount> accounts = new ArrayList<>();
        for (String name : names) {
            Map<String, Object> system = systemByName.getOrDefault(name, Map.of());
            FinCashDailyCloseAccount old = oldByAccount.get(name);
            FinCashDailyCloseAccount row = old != null ? old : new FinCashDailyCloseAccount();
            row.setAccountName(name);
            row.setSystemCount(toInt(system.get("systemCount")));
            row.setSystemAmount(toMoney(system.get("systemAmount")));
            if (old == null) {
                row.setActualCount(row.getSystemCount());
                row.setActualAmount(row.getSystemAmount());
                row.setDifferenceAmount(BigDecimal.ZERO);
                row.setStatus("matched");
            }
            accounts.add(row);
        }
        accounts.sort(Comparator.comparing(FinCashDailyCloseAccount::getAccountName));

        Map<String, Object> totals = totals(accounts);
        Long unmatchedCount = journalMapper.selectCount(new LambdaQueryWrapper<FinCashJournal>()
                .eq(FinCashJournal::getReceiptDate, target)
                .eq(FinCashJournal::getRecordStatus, "active")
                .gt(FinCashJournal::getUnmatchedAmount, BigDecimal.ZERO));
        Long exceptionCount = journalMapper.selectCount(new LambdaQueryWrapper<FinCashJournal>()
                .eq(FinCashJournal::getReceiptDate, target)
                .eq(FinCashJournal::getRecordStatus, "active")
                .in(FinCashJournal::getExceptionStatus, "pending", "processing"));

        YearMonth month = YearMonth.from(target);
        LocalDate monthStart = month.atDay(1);
        LocalDate nextMonth = month.plusMonths(1).atDay(1);
        List<Map<String, Object>> structure = matchMapper.selectMonthlyStructure(monthStart, nextMonth);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("closeDate", target);
        result.put("close", close);
        result.put("accounts", accounts);
        result.put("totals", totals);
        result.put("unmatchedCount", unmatchedCount == null ? 0L : unmatchedCount);
        result.put("exceptionCount", exceptionCount == null ? 0L : exceptionCount);
        result.put("monthlyStructure", structure);
        return result;
    }

    @Transactional(rollbackFor = Exception.class)
    public Map<String, Object> submit(CashDailyCloseSubmitRequest request) {
        if (request == null || request.getCloseDate() == null) {
            throw new BusinessException("请选择日结日期");
        }
        if (request.getCloseDate().isAfter(LocalDate.now())) {
            throw new BusinessException("不能提交未来日期的日结");
        }
        FinCashDailyClose close = findByDate(request.getCloseDate());
        if (close != null) {
            close = closeMapper.selectForUpdate(close.getId());
            if (STATUS_CLOSED.equals(close.getStatus())) {
                throw new BusinessException("该日期已正式日结，请先重开");
            }
            if (request.getVersion() != null && !Objects.equals(request.getVersion(), close.getVersion())) {
                throw new BusinessException("日结已被其他人更新，请刷新后重试");
            }
        }

        List<Map<String, Object>> systemRows = journalMapper.selectDailyAccountSummary(request.getCloseDate());
        Map<String, Map<String, Object>> systemByName = systemRows.stream()
                .collect(Collectors.toMap(row -> String.valueOf(row.get("accountName")), Function.identity(), (a, b) -> a));
        Map<String, CashDailyCloseSubmitRequest.Account> actualByName = new HashMap<>();
        if (request.getAccounts() != null) {
            for (CashDailyCloseSubmitRequest.Account row : request.getAccounts()) {
                if (row == null || !StringUtils.hasText(row.getAccountName())) {
                    continue;
                }
                if (row.getActualCount() == null || row.getActualCount() < 0 || n(row.getActualAmount()).signum() < 0) {
                    throw new BusinessException("实际笔数和金额不能为负数");
                }
                actualByName.put(row.getAccountName().trim(), row);
            }
        }
        for (String accountName : systemByName.keySet()) {
            if (!actualByName.containsKey(accountName)) {
                throw new BusinessException("请填写账户「" + accountName + "」的实际入账笔数和金额");
            }
        }

        Set<String> allNames = new LinkedHashSet<>(systemByName.keySet());
        allNames.addAll(actualByName.keySet());
        List<FinCashDailyCloseAccount> rows = new ArrayList<>();
        for (String name : allNames) {
            Map<String, Object> system = systemByName.getOrDefault(name, Map.of());
            CashDailyCloseSubmitRequest.Account actual = actualByName.get(name);
            FinCashDailyCloseAccount row = new FinCashDailyCloseAccount();
            row.setAccountName(name);
            row.setSystemCount(toInt(system.get("systemCount")));
            row.setSystemAmount(toMoney(system.get("systemAmount")));
            row.setActualCount(actual == null ? 0 : actual.getActualCount());
            row.setActualAmount(actual == null ? BigDecimal.ZERO : n(actual.getActualAmount()));
            row.setDifferenceAmount(n(row.getActualAmount()).subtract(n(row.getSystemAmount())));
            row.setDifferenceReason(actual == null ? null : trim(actual.getDifferenceReason()));
            if (row.getDifferenceAmount().signum() == 0 && Objects.equals(row.getActualCount(), row.getSystemCount())) {
                row.setStatus("matched");
            } else {
                row.setStatus("difference");
                if (!StringUtils.hasText(row.getDifferenceReason()) && !StringUtils.hasText(request.getDifferenceReason())) {
                    throw new BusinessException("账户「" + name + "」存在差异，必须填写差异原因");
                }
            }
            rows.add(row);
        }

        Map<String, Object> total = totals(rows);
        if (close == null) {
            close = new FinCashDailyClose();
            close.setCloseDate(request.getCloseDate());
            close.setStatus(STATUS_OPEN);
        }
        close.setSystemCount((Integer) total.get("systemCount"));
        close.setSystemAmount((BigDecimal) total.get("systemAmount"));
        close.setActualCount((Integer) total.get("actualCount"));
        close.setActualAmount((BigDecimal) total.get("actualAmount"));
        close.setDifferenceAmount((BigDecimal) total.get("differenceAmount"));
        close.setDifferenceReason(trim(request.getDifferenceReason()));
        close.setStatus(STATUS_SUBMITTED);
        close.setSubmittedBy(SecurityUtils.getCurrentUserId());
        close.setSubmittedAt(java.time.LocalDateTime.now());
        if (close.getId() == null) {
            closeMapper.insert(close);
        } else if (closeMapper.updateById(close) == 0) {
            throw new BusinessException("日结已被其他人更新，请刷新后重试");
        }

        Map<String, FinCashDailyCloseAccount> oldRows = accountMapper.selectList(
                        new LambdaQueryWrapper<FinCashDailyCloseAccount>()
                                .eq(FinCashDailyCloseAccount::getCloseId, close.getId()))
                .stream().collect(Collectors.toMap(FinCashDailyCloseAccount::getAccountName, Function.identity(), (a, b) -> a));
        for (FinCashDailyCloseAccount row : rows) {
            FinCashDailyCloseAccount old = oldRows.get(row.getAccountName());
            if (old != null) {
                row.setId(old.getId());
            }
            row.setCloseId(close.getId());
            if (row.getId() == null) {
                accountMapper.insert(row);
            } else {
                accountMapper.updateById(row);
            }
        }

        boolean hasDifference = rows.stream().anyMatch(r -> "difference".equals(r.getStatus()));
        if (hasDifference) {
            String note = "日结差异 " + close.getDifferenceAmount() + " 元；"
                    + (StringUtils.hasText(close.getDifferenceReason()) ? close.getDifferenceReason() : "请核对账户明细");
            exceptionService.ensureSystemCase(null, close.getId(), "账户差异", "P0", "daily_close", note);
        } else {
            exceptionService.resolveSystemDailyCloseCase(close.getId(), "系统入账与实际入账已核对一致");
        }
        notificationService.dailyCloseSubmitted(close.getTenantId(), close.getId(), close.getCloseDate().toString(),
                String.valueOf(close.getDifferenceAmount()), close.getSubmittedBy(), close.getVersion(),
                close.getSubmittedAt());
        return preview(request.getCloseDate());
    }

    @Transactional(rollbackFor = Exception.class)
    public FinCashDailyClose close(Long id) {
        requireManager();
        FinCashDailyClose entity = closeMapper.selectForUpdate(id);
        if (entity == null) {
            throw new BusinessException("日结记录不存在");
        }
        if (STATUS_CLOSED.equals(entity.getStatus())) {
            return entity;
        }
        if (!STATUS_SUBMITTED.equals(entity.getStatus())) {
            throw new BusinessException("请先完成账户核对并提交日结");
        }
        if (exceptionService.hasUnresolvedForDailyClose(entity.getId())) {
            throw new BusinessException("日结仍有未解决差异，不能关闭");
        }
        assertSystemSnapshotUnchanged(entity);
        entity.setStatus(STATUS_CLOSED);
        entity.setClosedBy(SecurityUtils.getCurrentUserId());
        entity.setClosedAt(java.time.LocalDateTime.now());
        if (closeMapper.updateById(entity) == 0) {
            throw new BusinessException("日结状态已变化，请刷新后重试");
        }
        notificationService.dailyCloseClosed(entity.getTenantId(), entity.getId(),
                entity.getCloseDate().toString(), entity.getClosedBy(), entity.getVersion(), entity.getClosedAt());
        return entity;
    }

    @Transactional(rollbackFor = Exception.class)
    public FinCashDailyClose reopen(Long id, CashActionRequest request) {
        requireManager();
        if (request == null || !StringUtils.hasText(request.getReason())) {
            throw new BusinessException("重开日结必须填写原因");
        }
        FinCashDailyClose entity = closeMapper.selectForUpdate(id);
        if (entity == null) {
            throw new BusinessException("日结记录不存在");
        }
        if (!STATUS_CLOSED.equals(entity.getStatus())) {
            throw new BusinessException("仅已关闭日结可以重开");
        }
        entity.setStatus(STATUS_REOPENED);
        entity.setReopenedBy(SecurityUtils.getCurrentUserId());
        entity.setReopenedAt(java.time.LocalDateTime.now());
        entity.setReopenReason(request.getReason().trim());
        if (closeMapper.updateById(entity) == 0) {
            throw new BusinessException("日结状态已变化，请刷新后重试");
        }
        notificationService.dailyCloseReopened(entity.getTenantId(), entity.getId(),
                entity.getCloseDate().toString(), entity.getReopenedBy(), entity.getVersion(), entity.getReopenedAt());
        return entity;
    }

    public boolean isDateClosed(LocalDate date) {
        return date != null && closeMapper.selectCount(new LambdaQueryWrapper<FinCashDailyClose>()
                .eq(FinCashDailyClose::getCloseDate, date)
                .eq(FinCashDailyClose::getStatus, STATUS_CLOSED)) > 0;
    }

    /**
     * 资金写操作与日结共用日期行锁。这样正式关闭日结和同日录入/修改不会交叉穿透。
     * 尚未创建日结头时没有可锁记录，此时允许写入；正式关闭前仍会做快照复核。
     */
    public void assertDateOpenForUpdate(LocalDate date) {
        if (date == null) {
            return;
        }
        FinCashDailyClose close = closeMapper.selectForUpdateByDate(date);
        if (close != null && STATUS_CLOSED.equals(close.getStatus())) {
            throw new BusinessException("该到账日期已日结关闭，请先重开日结");
        }
    }

    private FinCashDailyClose findByDate(LocalDate date) {
        return closeMapper.selectOne(new LambdaQueryWrapper<FinCashDailyClose>()
                .eq(FinCashDailyClose::getCloseDate, date)
                .last("LIMIT 1"));
    }

    /** 关闭动作必须确认提交后的到账笔数、金额和账户分布都没有变化。 */
    private void assertSystemSnapshotUnchanged(FinCashDailyClose close) {
        List<Map<String, Object>> currentRows = journalMapper.selectDailyAccountSummary(close.getCloseDate());
        List<FinCashDailyCloseAccount> submittedRows = accountMapper.selectList(
                new LambdaQueryWrapper<FinCashDailyCloseAccount>()
                        .eq(FinCashDailyCloseAccount::getCloseId, close.getId()));
        Map<String, FinCashDailyCloseAccount> submittedByName = submittedRows.stream()
                .collect(Collectors.toMap(FinCashDailyCloseAccount::getAccountName,
                        Function.identity(), (a, b) -> a));
        if (currentRows.size() != submittedByName.size()) {
            throw new BusinessException("日结提交后系统到账账户已变化，请重新核对并提交日结");
        }
        int currentCount = 0;
        BigDecimal currentAmount = BigDecimal.ZERO;
        for (Map<String, Object> current : currentRows) {
            String accountName = String.valueOf(current.get("accountName"));
            int count = toInt(current.get("systemCount"));
            BigDecimal amount = toMoney(current.get("systemAmount"));
            FinCashDailyCloseAccount submitted = submittedByName.get(accountName);
            if (submitted == null || !Objects.equals(count, submitted.getSystemCount())
                    || amount.compareTo(n(submitted.getSystemAmount())) != 0) {
                throw new BusinessException("日结提交后账户「" + accountName + "」的系统到账已变化，请重新提交日结");
            }
            currentCount += count;
            currentAmount = currentAmount.add(amount);
        }
        if (!Objects.equals(currentCount, close.getSystemCount())
                || currentAmount.compareTo(n(close.getSystemAmount())) != 0) {
            throw new BusinessException("日结提交后系统到账合计已变化，请重新核对并提交日结");
        }
    }

    private Map<String, Object> totals(List<FinCashDailyCloseAccount> rows) {
        int systemCount = rows.stream().map(FinCashDailyCloseAccount::getSystemCount)
                .filter(Objects::nonNull).reduce(0, Integer::sum);
        int actualCount = rows.stream().map(FinCashDailyCloseAccount::getActualCount)
                .filter(Objects::nonNull).reduce(0, Integer::sum);
        BigDecimal systemAmount = rows.stream().map(FinCashDailyCloseAccount::getSystemAmount)
                .map(this::n).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal actualAmount = rows.stream().map(FinCashDailyCloseAccount::getActualAmount)
                .map(this::n).reduce(BigDecimal.ZERO, BigDecimal::add);
        Map<String, Object> totals = new LinkedHashMap<>();
        totals.put("systemCount", systemCount);
        totals.put("systemAmount", systemAmount);
        totals.put("actualCount", actualCount);
        totals.put("actualAmount", actualAmount);
        totals.put("differenceAmount", actualAmount.subtract(systemAmount));
        return totals;
    }

    private int toInt(Object value) {
        if (value instanceof Number number) {
            return number.intValue();
        }
        try {
            return value == null ? 0 : Integer.parseInt(String.valueOf(value));
        } catch (NumberFormatException ignore) {
            return 0;
        }
    }

    private BigDecimal toMoney(Object value) {
        if (value instanceof BigDecimal decimal) {
            return decimal;
        }
        try {
            return value == null ? BigDecimal.ZERO : new BigDecimal(String.valueOf(value));
        } catch (NumberFormatException ignore) {
            return BigDecimal.ZERO;
        }
    }

    private void requireManager() {
        if (!(SecurityUtils.isCurrentAdmin() || SecurityUtils.hasAnyRole("finance_hq", "boss"))) {
            throw new BusinessException("仅财务负责人/老板/管理员可关闭或重开日结");
        }
    }

    private BigDecimal n(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private String trim(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }
}
