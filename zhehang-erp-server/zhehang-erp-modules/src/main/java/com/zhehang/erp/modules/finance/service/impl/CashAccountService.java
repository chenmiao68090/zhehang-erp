package com.zhehang.erp.modules.finance.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.finance.domain.dto.CashAccountAdjustmentRequest;
import com.zhehang.erp.modules.finance.domain.dto.CashAccountRequest;
import com.zhehang.erp.modules.finance.domain.dto.CashBalanceResolveRequest;
import com.zhehang.erp.modules.finance.domain.dto.CashBalanceSnapshotRequest;
import com.zhehang.erp.modules.finance.domain.entity.FinCashAccount;
import com.zhehang.erp.modules.finance.domain.entity.FinCashAccountAdjustment;
import com.zhehang.erp.modules.finance.domain.entity.FinCashBalanceSnapshot;
import com.zhehang.erp.modules.finance.domain.entity.FinCashJournal;
import com.zhehang.erp.modules.finance.domain.vo.CashAccountLedgerVO;
import com.zhehang.erp.modules.finance.domain.vo.CashAccountOptionVO;
import com.zhehang.erp.modules.finance.domain.vo.CashAccountSummaryVO;
import com.zhehang.erp.modules.finance.mapper.CashAccountLedgerMapper;
import com.zhehang.erp.modules.finance.mapper.FinCashAccountAdjustmentMapper;
import com.zhehang.erp.modules.finance.mapper.FinCashAccountMapper;
import com.zhehang.erp.modules.finance.mapper.FinCashBalanceSnapshotMapper;
import com.zhehang.erp.modules.system.domain.entity.SysUser;
import com.zhehang.erp.modules.system.mapper.SysUserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

/** 资金账户、统一流水和余额核对。 */
@Service
@RequiredArgsConstructor
public class CashAccountService {
    private static final String ACTIVE = "active";
    private static final String REVERSED = "reversed";
    private static final DateTimeFormatter CODE_DATE = DateTimeFormatter.ofPattern("yyyyMMdd");
    private static final Set<String> ACCOUNT_TYPES = Set.of("bank", "wechat", "alipay", "cash", "other");
    private static final Set<String> ADJUSTMENT_TYPES = Set.of("bank_fee", "refund", "correction", "other");
    private static final Set<String> SNAPSHOT_SOURCES = Set.of("manual", "import", "api");

    private final FinCashAccountMapper accountMapper;
    private final FinCashAccountAdjustmentMapper adjustmentMapper;
    private final FinCashBalanceSnapshotMapper snapshotMapper;
    private final CashAccountLedgerMapper ledgerMapper;
    private final SysUserMapper sysUserMapper;
    private final CashDailyCloseService dailyCloseService;

    public List<CashAccountOptionVO> options() {
        return accountMapper.selectList(new LambdaQueryWrapper<FinCashAccount>()
                        .orderByAsc(FinCashAccount::getSortOrder)
                        .orderByAsc(FinCashAccount::getId))
                .stream()
                .map(a -> new CashAccountOptionVO(a.getId(), a.getAccountName(), a.getAccountType(),
                        a.getInstitutionName(), a.getMaskedAccountNo(), a.getStatus()))
                .toList();
    }

    public Set<String> activeAccountNames() {
        return accountMapper.selectList(new LambdaQueryWrapper<FinCashAccount>()
                        .select(FinCashAccount::getAccountName)
                        .eq(FinCashAccount::getStatus, ACTIVE))
                .stream()
                .map(FinCashAccount::getAccountName)
                .filter(StringUtils::hasText)
                .collect(java.util.stream.Collectors.toSet());
    }

    public boolean isActiveAccountName(String accountName) {
        return StringUtils.hasText(accountName) && accountMapper.selectCount(
                new LambdaQueryWrapper<FinCashAccount>()
                        .eq(FinCashAccount::getAccountName, trim(accountName))
                        .eq(FinCashAccount::getStatus, ACTIVE)) > 0;
    }

    public Set<String> disabledAccountNames() {
        return accountMapper.selectList(new LambdaQueryWrapper<FinCashAccount>()
                        .select(FinCashAccount::getAccountName)
                        .eq(FinCashAccount::getStatus, "disabled"))
                .stream()
                .map(FinCashAccount::getAccountName)
                .filter(StringUtils::hasText)
                .collect(java.util.stream.Collectors.toSet());
    }

    public boolean isDisabledAccountName(String accountName) {
        return StringUtils.hasText(accountName) && accountMapper.selectCount(
                new LambdaQueryWrapper<FinCashAccount>()
                        .eq(FinCashAccount::getAccountName, trim(accountName))
                        .eq(FinCashAccount::getStatus, "disabled")) > 0;
    }

    @Transactional(readOnly = true)
    public List<CashAccountSummaryVO> summaries(boolean includeDisabled) {
        assertManager("查看资金账户余额");
        LambdaQueryWrapper<FinCashAccount> query = new LambdaQueryWrapper<FinCashAccount>()
                .eq(!includeDisabled, FinCashAccount::getStatus, ACTIVE)
                .orderByAsc(FinCashAccount::getSortOrder)
                .orderByAsc(FinCashAccount::getId);
        return accountMapper.selectList(query).stream().map(this::summary).toList();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> balancePreview(Long accountId, LocalDate asOf) {
        assertManager("查看资金账户余额");
        FinCashAccount account = requireAccount(accountId);
        LocalDate previewDate = asOf == null ? LocalDate.now() : asOf;
        if (previewDate.isAfter(LocalDate.now())) {
            throw new BusinessException("余额核对日期不能晚于今天");
        }
        return Map.of(
                "accountId", account.getId(),
                "accountName", account.getAccountName(),
                "date", previewDate,
                "systemBalance", systemBalance(account, previewDate));
    }

    @Transactional(rollbackFor = Exception.class)
    public FinCashAccount save(Long id, CashAccountRequest request) {
        assertManager("维护资金账户");
        validateAccount(request, id == null);
        if (id == null) {
            dailyCloseService.assertDateOpenForUpdate(request.getOpeningDate());
            FinCashAccount entity = new FinCashAccount();
            entity.setAccountCode("CA-" + LocalDate.now().format(CODE_DATE) + "-"
                    + UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase());
            entity.setStatus(ACTIVE);
            entity.setOpeningDate(request.getOpeningDate());
            entity.setOpeningBalance(n(request.getOpeningBalance()));
            entity.setVersion(0);
            applyMutableAccountFields(entity, request);
            assertAccountNameUnique(entity.getAccountName(), null);
            try {
                accountMapper.insert(entity);
            } catch (DuplicateKeyException e) {
                throw new BusinessException("账户名称或账户编码已存在");
            }
            return entity;
        }

        FinCashAccount entity = requireAccountForUpdate(id);
        if (request.getVersion() == null || !Objects.equals(request.getVersion(), entity.getVersion())) {
            throw new BusinessException("资金账户已被其他人更新，请刷新后重试");
        }
        String newName = trim(request.getAccountName());
        if (!Objects.equals(newName, entity.getAccountName())) {
            long ledgerCount = ledgerMapper.countLedger(tenantId(), entity.getId(), entity.getAccountName(),
                    entity.getOpeningDate(), null);
            if (ledgerCount > 0) {
                throw new BusinessException("账户已有资金流水，不能改名；请停用后新建账户");
            }
            assertAccountNameUnique(newName, entity.getId());
        }
        applyMutableAccountFields(entity, request);
        try {
            if (accountMapper.updateById(entity) != 1) {
                throw new BusinessException("资金账户已被其他人更新，请刷新后重试");
            }
        } catch (DuplicateKeyException e) {
            throw new BusinessException("账户名称已存在");
        }
        return entity;
    }

    @Transactional(rollbackFor = Exception.class)
    public void disable(Long id) {
        assertManager("停用资金账户");
        FinCashAccount account = requireAccountForUpdate(id);
        if (!ACTIVE.equals(account.getStatus())) {
            throw new BusinessException("该资金账户已停用");
        }
        if (snapshotMapper.selectCount(new LambdaQueryWrapper<FinCashBalanceSnapshot>()
                .eq(FinCashBalanceSnapshot::getAccountId, id)
                .eq(FinCashBalanceSnapshot::getStatus, "difference")) > 0) {
            throw new BusinessException("账户仍有未解决余额差异，不能停用");
        }
        BigDecimal balance = systemBalance(account, LocalDate.now());
        if (balance.signum() != 0) {
            throw new BusinessException("账户系统余额不为0，不能停用");
        }
        account.setStatus("disabled");
        if (accountMapper.updateById(account) != 1) {
            throw new BusinessException("资金账户状态已变化，请刷新后重试");
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void enable(Long id) {
        assertManager("启用资金账户");
        FinCashAccount account = requireAccountForUpdate(id);
        if (ACTIVE.equals(account.getStatus())) {
            throw new BusinessException("该资金账户已在使用中");
        }
        account.setStatus(ACTIVE);
        if (accountMapper.updateById(account) != 1) {
            throw new BusinessException("资金账户状态已变化，请刷新后重试");
        }
    }

    /** 绑定稳定账户ID，同时保留账户名称快照。 */
    public void bindJournalAccount(FinCashJournal journal) {
        if (journal == null) return;
        if (journal.getCashAccountId() != null) {
            FinCashAccount account = accountMapper.selectOne(new LambdaQueryWrapper<FinCashAccount>()
                    .eq(FinCashAccount::getId, journal.getCashAccountId()).last("FOR UPDATE"));
            if (account == null || !ACTIVE.equals(account.getStatus())) {
                throw new BusinessException("所选资金账户不存在或已停用");
            }
            journal.setReceiveAccount(account.getAccountName());
            return;
        }
        if (!StringUtils.hasText(journal.getReceiveAccount())) return;
        FinCashAccount account = accountMapper.selectOne(new LambdaQueryWrapper<FinCashAccount>()
                .eq(FinCashAccount::getAccountName, trim(journal.getReceiveAccount()))
                .eq(FinCashAccount::getStatus, ACTIVE)
                .last("LIMIT 1 FOR UPDATE"));
        if (account != null) {
            journal.setCashAccountId(account.getId());
            journal.setReceiveAccount(account.getAccountName());
        }
    }

    /** 修改或作废旧收款时锁住其原账户；历史账户已停用也必须允许做反向处理。 */
    public void lockJournalAccount(FinCashJournal journal) {
        if (journal == null) return;
        FinCashAccount account = null;
        if (journal.getCashAccountId() != null) {
            account = accountMapper.selectOne(new LambdaQueryWrapper<FinCashAccount>()
                    .eq(FinCashAccount::getId, journal.getCashAccountId()).last("FOR UPDATE"));
        } else if (StringUtils.hasText(journal.getReceiveAccount())) {
            account = accountMapper.selectOne(new LambdaQueryWrapper<FinCashAccount>()
                    .eq(FinCashAccount::getAccountName, trim(journal.getReceiveAccount()))
                    .last("LIMIT 1 FOR UPDATE"));
        }
        if (account != null) {
            journal.setCashAccountId(account.getId());
            journal.setReceiveAccount(account.getAccountName());
        }
    }

    /** 批量导入按账户名称一次性绑定，避免逐行查询。 */
    public void bindJournalAccounts(List<FinCashJournal> journals) {
        if (journals == null || journals.isEmpty()) return;
        Map<String, FinCashAccount> byName = new HashMap<>();
        for (FinCashAccount account : accountMapper.selectList(new LambdaQueryWrapper<FinCashAccount>()
                .last("FOR UPDATE"))) {
            byName.put(account.getAccountName(), account);
        }
        for (FinCashJournal journal : journals) {
            if (journal.getCashAccountId() != null || !StringUtils.hasText(journal.getReceiveAccount())) continue;
            FinCashAccount account = byName.get(trim(journal.getReceiveAccount()));
            if (account != null) {
                if (!ACTIVE.equals(account.getStatus())) {
                    throw new BusinessException("导入数据包含已停用资金账户：" + account.getAccountName());
                }
                journal.setCashAccountId(account.getId());
                journal.setReceiveAccount(account.getAccountName());
            }
        }
    }

    @Transactional(readOnly = true)
    public IPage<CashAccountLedgerVO> ledger(Long accountId, LocalDate dateStart, LocalDate dateEnd,
                                              int pageNum, int pageSize) {
        assertManager("查看资金账户流水");
        FinCashAccount account = requireAccount(accountId);
        LocalDate start = dateStart == null || dateStart.isBefore(account.getOpeningDate())
                ? account.getOpeningDate() : dateStart;
        LocalDate end = dateEnd == null ? LocalDate.now() : dateEnd;
        if (end.isBefore(start)) throw new BusinessException("流水结束日期不能早于开始日期");
        int size = Math.max(1, Math.min(pageSize, 200));
        int current = Math.max(pageNum, 1);
        long total = ledgerMapper.countLedger(tenantId(), accountId, account.getAccountName(), start, end);
        List<CashAccountLedgerVO> rows = ledgerMapper.selectLedger(tenantId(), accountId,
                account.getAccountName(), start, end, (long) (current - 1) * size, size);
        Page<CashAccountLedgerVO> page = new Page<>(current, size, total);
        page.setRecords(rows);
        return page;
    }

    @Transactional(rollbackFor = Exception.class)
    public FinCashAccountAdjustment adjust(Long accountId, CashAccountAdjustmentRequest request) {
        assertManager("登记余额调整");
        FinCashAccount account = requireActiveAccountForUpdate(accountId);
        validateAdjustment(request);
        assertAdjustmentDateInAccountRange(account, request.getAdjustmentDate());
        FinCashAccountAdjustment existing = adjustmentMapper.selectOne(
                new LambdaQueryWrapper<FinCashAccountAdjustment>()
                        .eq(FinCashAccountAdjustment::getRequestNo, trim(request.getRequestNo()))
                        .last("LIMIT 1"));
        if (existing != null) {
            assertAdjustmentReplay(existing, accountId, request);
            return existing;
        }
        dailyCloseService.assertDateOpenForUpdate(request.getAdjustmentDate());
        FinCashAccountAdjustment entity = buildAdjustment(account, request);
        try {
            adjustmentMapper.insert(entity);
        } catch (DuplicateKeyException e) {
            FinCashAccountAdjustment duplicate = adjustmentMapper.selectOne(
                    new LambdaQueryWrapper<FinCashAccountAdjustment>()
                            .eq(FinCashAccountAdjustment::getRequestNo, trim(request.getRequestNo()))
                            .last("LIMIT 1"));
            if (duplicate != null) {
                assertAdjustmentReplay(duplicate, accountId, request);
                return duplicate;
            }
            throw e;
        }
        return entity;
    }

    @Transactional(rollbackFor = Exception.class)
    public FinCashAccountAdjustment reverseAdjustment(Long adjustmentId, CashAccountAdjustmentRequest request) {
        assertManager("冲正余额调整");
        if (request == null || !StringUtils.hasText(trim(request.getRequestNo()))) {
            throw new BusinessException("冲正幂等号不能为空");
        }
        if (!StringUtils.hasText(trim(request.getReason()))) {
            throw new BusinessException("冲正必须填写原因");
        }
        FinCashAccountAdjustment repeated = adjustmentMapper.selectOne(
                new LambdaQueryWrapper<FinCashAccountAdjustment>()
                        .eq(FinCashAccountAdjustment::getRequestNo, trim(request.getRequestNo()))
                        .last("LIMIT 1"));
        if (repeated != null) {
            if (!Objects.equals(repeated.getReversalOfId(), adjustmentId)) {
                throw new BusinessException("幂等号已用于其他余额调整");
            }
            return repeated;
        }
        FinCashAccountAdjustment original = adjustmentMapper.selectOne(
                new LambdaQueryWrapper<FinCashAccountAdjustment>()
                        .eq(FinCashAccountAdjustment::getId, adjustmentId)
                        .last("FOR UPDATE"));
        if (original == null) throw new BusinessException("余额调整不存在");
        if (REVERSED.equals(original.getStatus())) throw new BusinessException("该余额调整已冲正");
        if (original.getReversalOfId() != null) throw new BusinessException("冲正流水不能再次冲正");
        FinCashAccount account = requireAccountForUpdate(original.getAccountId());
        LocalDate reversalDate = request.getAdjustmentDate() == null ? LocalDate.now() : request.getAdjustmentDate();
        assertAdjustmentDateInAccountRange(account, reversalDate);
        dailyCloseService.assertDateOpenForUpdate(reversalDate);

        CashAccountAdjustmentRequest reverseRequest = new CashAccountAdjustmentRequest();
        reverseRequest.setRequestNo(trim(request.getRequestNo()));
        reverseRequest.setAdjustmentDate(reversalDate);
        reverseRequest.setDirection("in".equals(original.getDirection()) ? "out" : "in");
        reverseRequest.setAdjustmentType(original.getAdjustmentType());
        reverseRequest.setAmount(original.getAmount());
        reverseRequest.setReason("冲正 " + original.getAdjustmentNo() + "：" + trim(request.getReason()));
        reverseRequest.setEvidenceFile(request.getEvidenceFile());
        validateAdjustment(reverseRequest);
        FinCashAccountAdjustment reversal = buildAdjustment(account, reverseRequest);
        reversal.setReversalOfId(original.getId());
        adjustmentMapper.insert(reversal);
        original.setStatus(REVERSED);
        original.setReversalId(reversal.getId());
        adjustmentMapper.updateById(original);
        return reversal;
    }

    @Transactional(rollbackFor = Exception.class)
    public FinCashBalanceSnapshot submitSnapshot(Long accountId, CashBalanceSnapshotRequest request) {
        assertManager("提交余额核对");
        FinCashAccount account = requireAccountForUpdate(accountId);
        validateSnapshot(request, account);
        FinCashBalanceSnapshot existing = snapshotMapper.selectOne(
                new LambdaQueryWrapper<FinCashBalanceSnapshot>()
                        .eq(FinCashBalanceSnapshot::getRequestNo, trim(request.getRequestNo()))
                        .last("LIMIT 1"));
        if (existing != null) {
            assertSnapshotReplay(existing, accountId, request);
            return existing;
        }
        if (snapshotMapper.selectCount(new LambdaQueryWrapper<FinCashBalanceSnapshot>()
                .eq(FinCashBalanceSnapshot::getAccountId, accountId)
                .eq(FinCashBalanceSnapshot::getSnapshotDate, request.getSnapshotDate())) > 0) {
            throw new BusinessException("该账户当天已提交余额快照，不能覆盖原财务事实");
        }

        BigDecimal systemBalance = systemBalance(account, request.getSnapshotDate());
        BigDecimal actualBalance = request.getActualBalance().setScale(2, java.math.RoundingMode.HALF_UP);
        BigDecimal difference = actualBalance.subtract(systemBalance);
        assertMoneyRange(systemBalance, "系统余额");
        assertMoneyRange(difference, "余额差异");
        String reason = trim(request.getDifferenceReason());
        if (difference.signum() != 0 && !StringUtils.hasText(reason)) {
            throw new BusinessException("实际余额与系统余额有差异时必须填写原因");
        }
        FinCashBalanceSnapshot entity = new FinCashBalanceSnapshot();
        entity.setRequestNo(trim(request.getRequestNo()));
        entity.setAccountId(accountId);
        entity.setAccountNameSnapshot(account.getAccountName());
        entity.setSnapshotDate(request.getSnapshotDate());
        entity.setSystemBalance(systemBalance);
        entity.setActualBalance(actualBalance);
        entity.setDifferenceAmount(difference);
        String sourceType = trim(request.getSourceType());
        entity.setSourceType(StringUtils.hasText(sourceType) && SNAPSHOT_SOURCES.contains(sourceType)
                ? sourceType : "manual");
        entity.setStatus(difference.signum() == 0 ? "matched" : "difference");
        entity.setDifferenceReason(reason);
        entity.setEvidenceFile(trim(request.getEvidenceFile()));
        entity.setSubmittedBy(SecurityUtils.getCurrentUserId());
        entity.setSubmittedByName(currentUserName());
        entity.setSubmittedAt(LocalDateTime.now());
        entity.setVersion(0);
        try {
            snapshotMapper.insert(entity);
        } catch (DuplicateKeyException e) {
            FinCashBalanceSnapshot duplicate = snapshotMapper.selectOne(
                    new LambdaQueryWrapper<FinCashBalanceSnapshot>()
                            .eq(FinCashBalanceSnapshot::getRequestNo, trim(request.getRequestNo()))
                            .last("LIMIT 1"));
            if (duplicate != null) {
                assertSnapshotReplay(duplicate, accountId, request);
                return duplicate;
            }
            throw new BusinessException("该账户当天已提交余额快照，不能覆盖原财务事实");
        }
        return entity;
    }

    public IPage<FinCashBalanceSnapshot> snapshots(Long accountId, int pageNum, int pageSize) {
        assertManager("查看余额核对历史");
        requireAccount(accountId);
        int size = Math.max(1, Math.min(pageSize, 100));
        return snapshotMapper.selectPage(new Page<>(Math.max(pageNum, 1), size),
                new LambdaQueryWrapper<FinCashBalanceSnapshot>()
                        .eq(FinCashBalanceSnapshot::getAccountId, accountId)
                        .orderByDesc(FinCashBalanceSnapshot::getSnapshotDate)
                        .orderByDesc(FinCashBalanceSnapshot::getId));
    }

    @Transactional(rollbackFor = Exception.class)
    public FinCashBalanceSnapshot resolveSnapshot(Long snapshotId, CashBalanceResolveRequest request) {
        assertManager("解决余额差异");
        String resolution = request == null ? null : trim(request.getResolution());
        if (!StringUtils.hasText(resolution)) throw new BusinessException("解决余额差异必须填写结论");
        length(resolution, 500, "解决结论");
        FinCashBalanceSnapshot entity = snapshotMapper.selectOne(
                new LambdaQueryWrapper<FinCashBalanceSnapshot>()
                        .eq(FinCashBalanceSnapshot::getId, snapshotId)
                        .last("FOR UPDATE"));
        if (entity == null) throw new BusinessException("余额快照不存在");
        if (!"difference".equals(entity.getStatus())) throw new BusinessException("该余额快照不需要解决");
        if (request.getVersion() == null || !Objects.equals(request.getVersion(), entity.getVersion())) {
            throw new BusinessException("余额快照已被其他人处理，请刷新后重试");
        }
        entity.setStatus("resolved");
        entity.setResolution(resolution);
        entity.setResolvedBy(SecurityUtils.getCurrentUserId());
        entity.setResolvedByName(currentUserName());
        entity.setResolvedAt(LocalDateTime.now());
        if (snapshotMapper.updateById(entity) != 1) {
            throw new BusinessException("余额快照已被其他人处理，请刷新后重试");
        }
        return entity;
    }

    private CashAccountSummaryVO summary(FinCashAccount account) {
        BigDecimal receipts = n(ledgerMapper.sumReceipts(tenantId(), account.getId(), account.getAccountName(),
                account.getOpeningDate(), LocalDate.now()));
        BigDecimal adjustments = n(ledgerMapper.sumAdjustments(tenantId(), account.getId(),
                account.getOpeningDate(), LocalDate.now()));
        FinCashBalanceSnapshot latest = snapshotMapper.selectOne(
                new LambdaQueryWrapper<FinCashBalanceSnapshot>()
                        .eq(FinCashBalanceSnapshot::getAccountId, account.getId())
                        .orderByDesc(FinCashBalanceSnapshot::getSnapshotDate)
                        .orderByDesc(FinCashBalanceSnapshot::getId)
                        .last("LIMIT 1"));
        long unresolvedCount = snapshotMapper.selectCount(new LambdaQueryWrapper<FinCashBalanceSnapshot>()
                .eq(FinCashBalanceSnapshot::getAccountId, account.getId())
                .eq(FinCashBalanceSnapshot::getStatus, "difference"));
        CashAccountSummaryVO vo = new CashAccountSummaryVO();
        vo.setId(account.getId());
        vo.setAccountCode(account.getAccountCode());
        vo.setAccountName(account.getAccountName());
        vo.setAccountType(account.getAccountType());
        vo.setInstitutionName(account.getInstitutionName());
        vo.setMaskedAccountNo(account.getMaskedAccountNo());
        vo.setCurrency(account.getCurrency());
        vo.setOpeningDate(account.getOpeningDate());
        vo.setOpeningBalance(n(account.getOpeningBalance()));
        vo.setStatus(account.getStatus());
        vo.setSortOrder(account.getSortOrder());
        vo.setRemark(account.getRemark());
        vo.setVersion(account.getVersion());
        vo.setReceiptInflow(receipts);
        vo.setAdjustmentNet(adjustments);
        vo.setSystemBalance(n(account.getOpeningBalance()).add(receipts).add(adjustments));
        vo.setUnresolvedDifferenceCount(unresolvedCount);
        vo.setUpdateTime(account.getUpdateTime());
        if (latest != null) {
            vo.setLatestSnapshotId(latest.getId());
            vo.setLatestSnapshotDate(latest.getSnapshotDate());
            vo.setLatestActualBalance(latest.getActualBalance());
            vo.setLatestDifference(latest.getDifferenceAmount());
            vo.setLatestSnapshotStatus(latest.getStatus());
        }
        return vo;
    }

    private BigDecimal systemBalance(FinCashAccount account, LocalDate asOf) {
        if (asOf.isBefore(account.getOpeningDate())) {
            throw new BusinessException("余额核对日期不能早于账户起算日期");
        }
        return n(account.getOpeningBalance())
                .add(n(ledgerMapper.sumReceipts(tenantId(), account.getId(), account.getAccountName(),
                        account.getOpeningDate(), asOf)))
                .add(n(ledgerMapper.sumAdjustments(tenantId(), account.getId(),
                        account.getOpeningDate(), asOf)))
                .setScale(2, java.math.RoundingMode.HALF_UP);
    }

    private FinCashAccountAdjustment buildAdjustment(FinCashAccount account,
                                                       CashAccountAdjustmentRequest request) {
        FinCashAccountAdjustment entity = new FinCashAccountAdjustment();
        entity.setAdjustmentNo("TZ-" + LocalDate.now().format(CODE_DATE) + "-"
                + UUID.randomUUID().toString().replace("-", "").substring(0, 10).toUpperCase());
        entity.setRequestNo(trim(request.getRequestNo()));
        entity.setAccountId(account.getId());
        entity.setAccountNameSnapshot(account.getAccountName());
        entity.setAdjustmentDate(request.getAdjustmentDate());
        entity.setAdjustmentTime(LocalDateTime.now());
        entity.setDirection(trim(request.getDirection()));
        entity.setAdjustmentType(trim(request.getAdjustmentType()));
        entity.setAmount(request.getAmount().setScale(2, java.math.RoundingMode.HALF_UP));
        entity.setReason(trim(request.getReason()));
        entity.setEvidenceFile(trim(request.getEvidenceFile()));
        entity.setStatus(ACTIVE);
        entity.setOperatorId(SecurityUtils.getCurrentUserId());
        entity.setOperatorName(currentUserName());
        entity.setVersion(0);
        return entity;
    }

    private void assertAdjustmentReplay(FinCashAccountAdjustment existing, Long accountId,
                                        CashAccountAdjustmentRequest request) {
        BigDecimal amount = request.getAmount().setScale(2, java.math.RoundingMode.HALF_UP);
        if (!Objects.equals(existing.getAccountId(), accountId)
                || !Objects.equals(existing.getAdjustmentDate(), request.getAdjustmentDate())
                || !Objects.equals(existing.getDirection(), trim(request.getDirection()))
                || !Objects.equals(existing.getAdjustmentType(), trim(request.getAdjustmentType()))
                || existing.getAmount() == null || existing.getAmount().compareTo(amount) != 0
                || !Objects.equals(existing.getReason(), trim(request.getReason()))) {
            throw new BusinessException("幂等号已对应其他余额调整内容");
        }
    }

    private void assertSnapshotReplay(FinCashBalanceSnapshot existing, Long accountId,
                                      CashBalanceSnapshotRequest request) {
        BigDecimal actual = request.getActualBalance().setScale(2, java.math.RoundingMode.HALF_UP);
        String source = StringUtils.hasText(trim(request.getSourceType())) ? trim(request.getSourceType()) : "manual";
        if (!Objects.equals(existing.getAccountId(), accountId)
                || !Objects.equals(existing.getSnapshotDate(), request.getSnapshotDate())
                || existing.getActualBalance() == null || existing.getActualBalance().compareTo(actual) != 0
                || !Objects.equals(existing.getSourceType(), source)
                || !Objects.equals(existing.getDifferenceReason(), trim(request.getDifferenceReason()))) {
            throw new BusinessException("幂等号已对应其他余额快照内容");
        }
    }

    private void assertAdjustmentDateInAccountRange(FinCashAccount account, LocalDate adjustmentDate) {
        if (adjustmentDate != null && adjustmentDate.isBefore(account.getOpeningDate())) {
            throw new BusinessException("调整日期不能早于账户余额起算日期");
        }
    }

    private void validateAccount(CashAccountRequest request, boolean creating) {
        if (request == null || !StringUtils.hasText(trim(request.getAccountName()))) {
            throw new BusinessException("账户名称不能为空");
        }
        if (trim(request.getAccountName()).length() > 80) throw new BusinessException("账户名称不能超过80字");
        if (!ACCOUNT_TYPES.contains(trim(request.getAccountType()))) throw new BusinessException("账户类型不正确");
        if (creating && request.getOpeningDate() == null) throw new BusinessException("请选择余额起算日期");
        if (creating && request.getOpeningDate().isAfter(LocalDate.now())) {
            throw new BusinessException("余额起算日期不能晚于今天");
        }
        if (request.getOpeningBalance() != null
                && request.getOpeningBalance().abs().compareTo(new BigDecimal("99999999999999.99")) > 0) {
            throw new BusinessException("期初余额超出允许范围");
        }
        String currency = trim(request.getCurrency());
        if (StringUtils.hasText(currency) && !currency.matches("[A-Za-z]{3,8}")) {
            throw new BusinessException("币种必须是3到8位字母代码");
        }
        if (request.getSortOrder() != null && (request.getSortOrder() < 0 || request.getSortOrder() > 9999)) {
            throw new BusinessException("账户排序必须在0到9999之间");
        }
        length(request.getInstitutionName(), 100, "银行或机构名称");
        length(request.getMaskedAccountNo(), 80, "脱敏账号");
        length(request.getRemark(), 500, "账户备注");
        String masked = trim(request.getMaskedAccountNo());
        if (StringUtils.hasText(masked) && masked.replaceAll("[\\s-]", "").matches("\\d{10,}")) {
            throw new BusinessException("账号必须脱敏后保存，例如 ****1234");
        }
    }

    private void validateAdjustment(CashAccountAdjustmentRequest request) {
        if (request == null || !StringUtils.hasText(trim(request.getRequestNo()))) {
            throw new BusinessException("调整幂等号不能为空");
        }
        length(request.getRequestNo(), 64, "调整幂等号");
        if (request.getAdjustmentDate() == null) throw new BusinessException("请选择调整日期");
        if (request.getAdjustmentDate().isAfter(LocalDate.now())) throw new BusinessException("调整日期不能晚于今天");
        if (!Set.of("in", "out").contains(trim(request.getDirection()))) throw new BusinessException("调整方向不正确");
        if (!ADJUSTMENT_TYPES.contains(trim(request.getAdjustmentType()))) throw new BusinessException("调整类型不正确");
        if (request.getAmount() == null || request.getAmount().signum() <= 0) throw new BusinessException("调整金额必须大于0");
        if (request.getAmount().compareTo(new BigDecimal("99999999999999.99")) > 0) throw new BusinessException("调整金额超出允许范围");
        if (!StringUtils.hasText(trim(request.getReason()))) throw new BusinessException("余额调整必须填写原因");
        length(request.getReason(), 500, "调整原因");
        length(request.getEvidenceFile(), 20000, "调整凭证");
    }

    private void validateSnapshot(CashBalanceSnapshotRequest request, FinCashAccount account) {
        if (request == null || !StringUtils.hasText(trim(request.getRequestNo()))) {
            throw new BusinessException("余额快照幂等号不能为空");
        }
        length(request.getRequestNo(), 64, "余额快照幂等号");
        if (request.getSnapshotDate() == null) throw new BusinessException("请选择余额核对日期");
        if (request.getSnapshotDate().isAfter(LocalDate.now())) throw new BusinessException("余额核对日期不能晚于今天");
        if (request.getSnapshotDate().isBefore(account.getOpeningDate())) {
            throw new BusinessException("余额核对日期不能早于账户起算日期");
        }
        if (request.getActualBalance() == null) throw new BusinessException("请输入实际余额");
        if (request.getActualBalance().abs().compareTo(new BigDecimal("99999999999999.99")) > 0) {
            throw new BusinessException("实际余额超出允许范围");
        }
        if (StringUtils.hasText(trim(request.getSourceType()))
                && !SNAPSHOT_SOURCES.contains(trim(request.getSourceType()))) {
            throw new BusinessException("余额快照来源不正确");
        }
        length(request.getDifferenceReason(), 500, "差异原因");
        length(request.getEvidenceFile(), 20000, "余额凭证");
    }

    private void applyMutableAccountFields(FinCashAccount entity, CashAccountRequest request) {
        entity.setAccountName(trim(request.getAccountName()));
        entity.setAccountType(trim(request.getAccountType()));
        entity.setInstitutionName(trim(request.getInstitutionName()));
        entity.setMaskedAccountNo(trim(request.getMaskedAccountNo()));
        entity.setCurrency(StringUtils.hasText(trim(request.getCurrency())) ? trim(request.getCurrency()).toUpperCase() : "CNY");
        entity.setSortOrder(request.getSortOrder() == null ? 100 : request.getSortOrder());
        entity.setRemark(trim(request.getRemark()));
    }

    private void assertAccountNameUnique(String accountName, Long excludeId) {
        LambdaQueryWrapper<FinCashAccount> query = new LambdaQueryWrapper<FinCashAccount>()
                .eq(FinCashAccount::getAccountName, accountName)
                .ne(excludeId != null, FinCashAccount::getId, excludeId);
        if (accountMapper.selectCount(query) > 0) throw new BusinessException("账户名称已存在");
    }

    private FinCashAccount requireActiveAccountForUpdate(Long id) {
        FinCashAccount account = requireAccountForUpdate(id);
        if (!ACTIVE.equals(account.getStatus())) throw new BusinessException("资金账户已停用");
        return account;
    }

    private FinCashAccount requireAccount(Long id) {
        if (id == null) throw new BusinessException("资金账户ID不能为空");
        FinCashAccount account = accountMapper.selectById(id);
        if (account == null) throw new BusinessException("资金账户不存在");
        return account;
    }

    private FinCashAccount requireAccountForUpdate(Long id) {
        FinCashAccount account = accountMapper.selectOne(new LambdaQueryWrapper<FinCashAccount>()
                .eq(FinCashAccount::getId, id).last("FOR UPDATE"));
        if (account == null) throw new BusinessException("资金账户不存在");
        return account;
    }

    private String currentUserName() {
        Long userId = SecurityUtils.getCurrentUserId();
        SysUser user = userId == null ? null : sysUserMapper.selectById(userId);
        if (user == null) return null;
        return StringUtils.hasText(user.getNickname()) ? user.getNickname() : user.getUsername();
    }

    private Long tenantId() {
        Long tenantId = SecurityUtils.getCurrentTenantId();
        if (tenantId == null) throw new BusinessException("当前登录缺少租户信息");
        return tenantId;
    }

    private void assertManager(String action) {
        if (!(SecurityUtils.isCurrentAdmin() || SecurityUtils.hasAnyRole("finance_hq", "boss"))) {
            throw new BusinessException("仅财务负责人/老板/管理员可" + action);
        }
    }

    private void length(String value, int max, String label) {
        if (value != null && value.trim().length() > max) {
            throw new BusinessException(label + "不能超过" + max + "字");
        }
    }

    private void assertMoneyRange(BigDecimal value, String label) {
        if (value != null && value.abs().compareTo(new BigDecimal("99999999999999.99")) > 0) {
            throw new BusinessException(label + "超出允许范围");
        }
    }

    private BigDecimal n(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private String trim(String value) {
        return value == null ? null : value.trim();
    }
}
