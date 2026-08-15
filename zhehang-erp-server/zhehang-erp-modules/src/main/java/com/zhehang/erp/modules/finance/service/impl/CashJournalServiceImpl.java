package com.zhehang.erp.modules.finance.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.toolkit.support.SFunction;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.crm.domain.entity.CrmCustomer;
import com.zhehang.erp.modules.crm.mapper.CrmCustomerMapper;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.finance.domain.dto.CashActionRequest;
import com.zhehang.erp.modules.finance.domain.dto.CashImportPreviewResult;
import com.zhehang.erp.modules.finance.domain.dto.CashImportRequest;
import com.zhehang.erp.modules.finance.domain.dto.CashImportRowDTO;
import com.zhehang.erp.modules.finance.domain.dto.CashImportRowResult;
import com.zhehang.erp.modules.finance.domain.dto.CashJournalQuery;
import com.zhehang.erp.modules.finance.domain.dto.CashMatchItemDTO;
import com.zhehang.erp.modules.finance.domain.dto.CashMatchRequest;
import com.zhehang.erp.modules.finance.domain.dto.CashMatchRuleRequest;
import com.zhehang.erp.modules.finance.domain.entity.FinCashExceptionCase;
import com.zhehang.erp.modules.finance.domain.entity.FinCashImportBatch;
import com.zhehang.erp.modules.finance.domain.entity.FinCashJournal;
import com.zhehang.erp.modules.finance.domain.entity.FinCashMatch;
import com.zhehang.erp.modules.finance.domain.entity.FinCashMatchRuleConfig;
import com.zhehang.erp.modules.finance.domain.entity.FinCashPayerAlias;
import com.zhehang.erp.modules.finance.domain.entity.FinCashReconcileBatch;
import com.zhehang.erp.modules.finance.domain.entity.FinReceivableCollectionLog;
import com.zhehang.erp.modules.finance.domain.entity.FinReceivableRenewal;
import com.zhehang.erp.modules.finance.domain.vo.CashJournalDetailVO;
import com.zhehang.erp.modules.finance.domain.vo.CashWorkbenchTaskVO;
import com.zhehang.erp.modules.finance.domain.vo.MatchableOrderVO;
import com.zhehang.erp.modules.finance.mapper.FinCashImportBatchMapper;
import com.zhehang.erp.modules.finance.mapper.FinCashJournalMapper;
import com.zhehang.erp.modules.finance.mapper.FinCashMatchMapper;
import com.zhehang.erp.modules.finance.mapper.FinCashReconcileBatchMapper;
import com.zhehang.erp.modules.finance.mapper.FinReceivableCollectionLogMapper;
import com.zhehang.erp.modules.finance.mapper.FinReceivableRenewalMapper;
import com.zhehang.erp.modules.org.domain.entity.OrgEmployee;
import com.zhehang.erp.modules.org.mapper.OrgEmployeeMapper;
import com.zhehang.erp.modules.gs.domain.BizGsOrder;
import com.zhehang.erp.modules.gs.mapper.BizGsOrderMapper;
import com.zhehang.erp.modules.order.domain.BizAddressOrder;
import com.zhehang.erp.modules.order.domain.BizBookkeepingOrder;
import com.zhehang.erp.modules.order.mapper.BizAddressOrderMapper;
import com.zhehang.erp.modules.order.mapper.BizBookkeepingOrderMapper;
import com.zhehang.erp.modules.seal.domain.BizSealOrder;
import com.zhehang.erp.modules.seal.mapper.BizSealOrderMapper;
import com.zhehang.erp.modules.system.domain.entity.SysUser;
import com.zhehang.erp.modules.system.domain.entity.SysDictData;
import com.zhehang.erp.modules.system.mapper.SysUserMapper;
import com.zhehang.erp.modules.system.service.ISysDictDataService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.jdbc.BadSqlGrammarException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.IdentityHashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.TreeSet;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;
import java.util.function.Function;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/** 收款日记账服务实现。 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CashJournalServiceImpl
        extends ServiceImpl<FinCashJournalMapper, FinCashJournal>
        implements com.zhehang.erp.modules.finance.service.ICashJournalService {

    private static final String STATUS_WAITING = "waiting";
    private static final String STATUS_PARTIAL = "partial";
    private static final String STATUS_MATCHED = "matched";
    private static final String STATUS_REVIEWED = "reviewed";
    private static final String STATUS_VOID = "void";

    private static final String RECORD_ACTIVE = "active";
    private static final String RECORD_VOID = "void";
    private static final String REVIEW_DRAFT = "draft";
    private static final String REVIEW_PENDING = "pending";
    private static final String REVIEW_APPROVED = "approved";
    private static final String REVIEW_REJECTED = "rejected";
    private static final String REVIEW_REVERSED = "reversed";
    private static final String EXCEPTION_NONE = "none";
    private static final String FUND_BUSINESS = "business";
    private static final String FUND_UNKNOWN = "unknown";
    private static final String MATCH_ACTIVE = "active";
    private static final String MATCH_CANCELLED = "cancelled";

    private static final String BIZ_BOOKKEEPING = "bookkeeping";
    private static final String BIZ_ADDRESS = "address";
    private static final String BIZ_GS = "gs";
    private static final String BIZ_SEAL = "seal";
    private static final String BIZ_RECEIVABLE = "receivable";

    private static final DateTimeFormatter DAY_FMT = DateTimeFormatter.ofPattern("yyyyMMdd");
    private static final DateTimeFormatter BATCH_TS_FMT = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
    private static final Pattern ORDER_REFERENCE = Pattern.compile(
            "(?i)(BK|AD|GS|SL|RR)[\\s\\-#：:]*(\\d+)");

    /** 收款方式白名单(导入校验用) */
    private static final Set<String> ALLOWED_METHODS = new HashSet<>(java.util.Arrays.asList(
            "微信", "支付宝", "银行转账", "对公转账", "现金", "其他"));
    /** 收款账户白名单(导入校验用) */
    private static final Set<String> ALLOWED_ACCOUNTS = new HashSet<>(java.util.Arrays.asList(
            "公司基本户", "微信收款", "支付宝收款", "老板账户", "其他账户"));

    /** 报单单号前缀 → 报单类型 */
    private static final Map<String, String> ORDER_PREFIX_TO_BIZ = Map.of(
            "BK-", BIZ_BOOKKEEPING, "AD-", BIZ_ADDRESS, "GS-", BIZ_GS, "SL-", BIZ_SEAL);

    private final FinCashMatchMapper cashMatchMapper;
    private final BizBookkeepingOrderMapper bookkeepingOrderMapper;
    private final BizAddressOrderMapper addressOrderMapper;
    private final BizGsOrderMapper gsOrderMapper;
    private final BizSealOrderMapper sealOrderMapper;
    private final SysUserMapper sysUserMapper;
    private final FinCashImportBatchMapper cashImportBatchMapper;
    private final FinCashReconcileBatchMapper cashReconcileBatchMapper;
    private final CrmCustomerMapper crmCustomerMapper;
    private final OrgEmployeeMapper orgEmployeeMapper;
    private final FinReceivableRenewalMapper receivableRenewalMapper;
    private final FinReceivableCollectionLogMapper receivableLogMapper;
    private final CashExceptionService cashExceptionService;
    private final CashDailyCloseService cashDailyCloseService;
    private final CashJournalEventService cashJournalEventService;
    private final CashMatchScoreEngine cashMatchScoreEngine;
    private final CashMatchRuleService cashMatchRuleService;
    private final CashAccountService cashAccountService;
    private final CashPayerAliasService payerAliasService;
    private final CashMonthlyReportService monthlyReportService;
    private final CashNotificationService cashNotificationService;
    private final ISysDictDataService dictDataService;
    private final ObjectMapper objectMapper;
    private final DataScopeHelper dataScopeHelper;

    // ============================== 列表 =====================================

    @Override
    public IPage<FinCashJournal> selectPage(CashJournalQuery criteria) {
        CashJournalQuery query = criteria == null ? new CashJournalQuery() : criteria;
        LambdaQueryWrapper<FinCashJournal> w = new LambdaQueryWrapper<>();
        w.ge(query.getReceiptDateStart() != null, FinCashJournal::getReceiptDate, query.getReceiptDateStart())
                .le(query.getReceiptDateEnd() != null, FinCashJournal::getReceiptDate, query.getReceiptDateEnd())
                .eq(Boolean.TRUE.equals(query.getTodayOnly()), FinCashJournal::getReceiptDate, LocalDate.now())
                .eq(StringUtils.hasText(query.getStatus()), FinCashJournal::getStatus, query.getStatus())
                .eq(StringUtils.hasText(query.getRecordStatus()), FinCashJournal::getRecordStatus, query.getRecordStatus())
                .eq(StringUtils.hasText(query.getMatchStatus()), FinCashJournal::getMatchStatus, query.getMatchStatus())
                .eq(StringUtils.hasText(query.getReviewStatus()), FinCashJournal::getReviewStatus, query.getReviewStatus())
                .eq(StringUtils.hasText(query.getExceptionStatus()), FinCashJournal::getExceptionStatus, query.getExceptionStatus())
                .eq(StringUtils.hasText(query.getFundNature()), FinCashJournal::getFundNature, query.getFundNature())
                .eq(StringUtils.hasText(query.getPaymentMethod()), FinCashJournal::getPaymentMethod, query.getPaymentMethod())
                .eq(StringUtils.hasText(query.getReceiveAccount()), FinCashJournal::getReceiveAccount, query.getReceiveAccount())
                .eq(query.getCreateBy() != null, FinCashJournal::getCreateBy, query.getCreateBy())
                .eq(query.getOwnerId() != null, FinCashJournal::getOwnerId, query.getOwnerId())
                .like(StringUtils.hasText(query.getCustomerName()), FinCashJournal::getCustomerName, query.getCustomerName())
                .like(StringUtils.hasText(query.getPayerName()), FinCashJournal::getPayerName, query.getPayerName())
                .ge(query.getAmountMin() != null, FinCashJournal::getAmount, query.getAmountMin())
                .le(query.getAmountMax() != null, FinCashJournal::getAmount, query.getAmountMax());
        if (StringUtils.hasText(query.getKeyword())) {
            String keyword = query.getKeyword().trim();
            w.and(nested -> nested.like(FinCashJournal::getReceiptNo, keyword)
                    .or().like(FinCashJournal::getPayerName, keyword)
                    .or().like(FinCashJournal::getCustomerName, keyword)
                    .or().like(FinCashJournal::getSummary, keyword)
                    .or().like(FinCashJournal::getBankSerialNo, keyword));
        }
        if (Boolean.TRUE.equals(query.getOnlyUnmatched())) {
            w.gt(FinCashJournal::getUnmatchedAmount, BigDecimal.ZERO);
        }
        if (Boolean.TRUE.equals(query.getOver24h())) {
            w.gt(FinCashJournal::getUnmatchedAmount, BigDecimal.ZERO)
                    .apply("COALESCE(receipt_time, create_time) < DATE_SUB(NOW(), INTERVAL 24 HOUR)");
        }
        // 默认不含作废；兼容旧 status=void 查询。
        if (!Boolean.TRUE.equals(query.getIncludeVoid()) && !STATUS_VOID.equals(query.getStatus())
                && !RECORD_VOID.equals(query.getRecordStatus())) {
            w.eq(FinCashJournal::getRecordStatus, RECORD_ACTIVE);
        }
        if (!canReview()) dataScopeHelper.applyFinancial(w, FinCashJournal::getOwnerId, FinCashJournal::getOwnerDeptId);
        w.orderByDesc(FinCashJournal::getReceiptDate).orderByDesc(FinCashJournal::getId);
        int pageNum = query.getPageNum() != null && query.getPageNum() > 0 ? query.getPageNum() : 1;
        int pageSize = query.getPageSize() != null && query.getPageSize() > 0
                ? Math.min(query.getPageSize(), 200) : 20;
        IPage<FinCashJournal> result = page(new Page<>(pageNum, pageSize), w);
        fillJournalOwnerNames(result.getRecords());
        return result;
    }

    // ============================== 新增/编辑 =================================

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long saveJournal(FinCashJournal entity) {
        if (entity == null) {
            throw new BusinessException("收款记录不能为空");
        }
        boolean isCreate = entity.getId() == null;
        FinCashJournal before = null;
        if (isCreate) {
            cashAccountService.bindJournalAccount(entity);
        } else {
            before = requireJournalForUpdate(entity.getId());
            cashAccountService.lockJournalAccount(before);
            cashAccountService.bindJournalAccount(entity);
        }
        validateJournal(entity);
        // 与 DB(utf8mb4_unicode_ci)查重口径一致:写入前去尾空格
        entity.setBankSerialNo(trim(entity.getBankSerialNo()));
        entity.setPayerName(trim(entity.getPayerName()));
        entity.setCustomerName(trim(entity.getCustomerName()));
        entity.setSummary(trim(entity.getSummary()));
        rejectDuplicateSerial(entity);
        String beforeSnapshot = null;
        if (isCreate) {
            Long uid = SecurityUtils.getCurrentUserId();
            if (!canReview() && entity.getOwnerId() != null && !Objects.equals(entity.getOwnerId(), uid)) {
                throw new BusinessException("普通财务不能将收款登记到他人名下");
            }
            assertDateOpen(entity.getReceiptDate());
            if (!StringUtils.hasText(entity.getReceiptNo())) {
                entity.setReceiptNo(genReceiptNo(entity.getReceiptDate()));
            }
            entity.setMatchedAmount(BigDecimal.ZERO);
            entity.setUnmatchedAmount(n(entity.getAmount()));
            entity.setRecordStatus(RECORD_ACTIVE);
            entity.setMatchStatus(STATUS_WAITING);
            entity.setReviewStatus(REVIEW_DRAFT);
            entity.setExceptionStatus(EXCEPTION_NONE);
            entity.setFundNature(validFundNature(entity.getFundNature()));
            entity.setSourceType(validSourceType(entity.getSourceType()));
            fillJournalOwner(entity, entity.getOwnerId() != null ? entity.getOwnerId() : uid);
            entity.setReviewedBy(null);
            entity.setReviewedAt(null);
            entity.setSubmittedBy(null);
            entity.setSubmittedAt(null);
            entity.setVersion(0);
            syncLegacyStatus(entity);
            save(entity);
            cashJournalEventService.append(entity, "create", null,
                    "登记真实到账 " + n(entity.getAmount()) + " 元", null);
        } else {
            assertDatesOpen(before.getReceiptDate(), entity.getReceiptDate());
            assertMutable(before, "编辑");
            beforeSnapshot = cashJournalEventService.snapshot(before);
            if (entity.getVersion() != null && !Objects.equals(entity.getVersion(), before.getVersion())) {
                throw new BusinessException("收款记录已被其他人更新，请刷新后重试");
            }
            BigDecimal matched = n(before.getMatchedAmount());
            if (n(entity.getAmount()).compareTo(matched) < 0) {
                throw new BusinessException("收款金额不能小于已匹配金额 " + matched);
            }
            if (!canReview() && entity.getOwnerId() != null
                    && !Objects.equals(entity.getOwnerId(), before.getOwnerId())) {
                throw new BusinessException("普通财务不能变更收款负责人");
            }
            // 编辑不改编号、核销金额和历史审核痕迹；驳回/反审核后的修改回到草稿。
            entity.setReceiptNo(before.getReceiptNo());
            entity.setMatchedAmount(matched);
            entity.setRecordStatus(before.getRecordStatus());
            entity.setMatchStatus(before.getMatchStatus());
            entity.setReviewStatus(REVIEW_REJECTED.equals(before.getReviewStatus())
                    || REVIEW_REVERSED.equals(before.getReviewStatus()) ? REVIEW_DRAFT : before.getReviewStatus());
            entity.setExceptionStatus(before.getExceptionStatus());
            entity.setSourceType(before.getSourceType());
            entity.setSubmittedBy(before.getSubmittedBy());
            entity.setSubmittedAt(before.getSubmittedAt());
            entity.setReviewedBy(before.getReviewedBy());
            entity.setReviewedAt(before.getReviewedAt());
            entity.setReviewRemark(before.getReviewRemark());
            entity.setReverseReviewBy(before.getReverseReviewBy());
            entity.setReverseReviewAt(before.getReverseReviewAt());
            entity.setReverseReviewReason(before.getReverseReviewReason());
            entity.setFundNature(validFundNature(entity.getFundNature()));
            fillJournalOwner(entity, entity.getOwnerId() != null ? entity.getOwnerId() : before.getOwnerId());
            entity.setVersion(before.getVersion());
            recomputeJournal(entity);
            syncLegacyStatus(entity);
            if (!updateById(entity)) {
                throw new BusinessException("收款记录已被其他人更新，请刷新后重试");
            }
            cashJournalEventService.append(entity, "update", beforeSnapshot,
                    "更新收款登记字段", null);
        }
        syncAutomaticException(entity);
        return entity.getId();
    }

    /** 收款编号:SK + yyyyMMdd + 4位当日流水。查同前缀最大号 +1;唯一索引兜底并发冲突。 */
    private String genReceiptNo(LocalDate date) {
        LocalDate d = date != null ? date : LocalDate.now();
        String prefix = "SK" + d.format(DAY_FMT);
        FinCashJournal last = baseMapper.selectOne(new LambdaQueryWrapper<FinCashJournal>()
                .likeRight(FinCashJournal::getReceiptNo, prefix)
                .orderByDesc(FinCashJournal::getReceiptNo)
                .last("LIMIT 1"));
        int seq = 1;
        if (last != null && StringUtils.hasText(last.getReceiptNo())
                && last.getReceiptNo().length() >= prefix.length() + 4) {
            try {
                seq = Integer.parseInt(last.getReceiptNo().substring(prefix.length())) + 1;
            } catch (NumberFormatException ignore) {
                // 编号被人工改乱时退回从1开始,唯一索引仍保证不重复
            }
        }
        return prefix + String.format("%04d", seq);
    }

    // ============================== 作废 =====================================

    /** 作废不再隐式删除核销；必须先显式反核销并留下原因。 */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void voidJournal(Long id, CashActionRequest request) {
        String reason = requireReason(request, "作废收款必须填写原因");
        FinCashJournal j = requireJournalForUpdate(id);
        cashAccountService.lockJournalAccount(j);
        if (RECORD_VOID.equals(j.getRecordStatus())) {
            throw new BusinessException("该收款已作废");
        }
        if (REVIEW_APPROVED.equals(j.getReviewStatus())) {
            throw new BusinessException("已审核收款必须先反审核再作废");
        }
        assertDateOpen(j.getReceiptDate());
        if (sumJournalMatched(j.getId()).signum() > 0) {
            throw new BusinessException("该收款仍有有效核销，请先逐笔反核销再作废");
        }
        String before = cashJournalEventService.snapshot(j);
        j.setRecordStatus(RECORD_VOID);
        j.setReviewStatus(REVIEW_DRAFT);
        j.setRemark(appendText(j.getRemark(), "[作废] " + reason, 4000));
        syncLegacyStatus(j);
        updateById(j);
        cashJournalEventService.append(j, "void", before, "作废收款：" + reason, null);
    }

    // ============================== 审核状态机 ================================

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void submitReview(Long id, CashActionRequest request) {
        FinCashJournal j = requireJournalForUpdate(id);
        assertActive(j);
        assertDateOpen(j.getReceiptDate());
        if (REVIEW_APPROVED.equals(j.getReviewStatus())) {
            throw new BusinessException("该收款已审核");
        }
        if (REVIEW_PENDING.equals(j.getReviewStatus())) {
            throw new BusinessException("该收款已在审核中");
        }
        if (cashExceptionService.hasUnresolvedForJournal(j.getId())) {
            throw new BusinessException("该收款仍有未解决异常，不能提交审核");
        }
        if (!StringUtils.hasText(j.getFundNature()) || FUND_UNKNOWN.equals(j.getFundNature())) {
            throw new BusinessException("请先明确资金性质再提交审核");
        }
        recomputeJournal(j);
        if (FUND_BUSINESS.equals(j.getFundNature()) && !STATUS_MATCHED.equals(j.getMatchStatus())) {
            throw new BusinessException("业务款必须全部核销后才能提交审核");
        }
        String before = cashJournalEventService.snapshot(j);
        j.setReviewStatus(REVIEW_PENDING);
        j.setSubmittedBy(SecurityUtils.getCurrentUserId());
        j.setSubmittedAt(LocalDateTime.now());
        j.setReviewRemark(request == null ? null : trim(request.getRemark()));
        syncLegacyStatus(j);
        updateById(j);
        cashJournalEventService.append(j, "submit", before, "提交收款审核", null);
        cashNotificationService.reviewSubmitted(j.getId(), j.getReceiptNo(), j.getSubmittedBy(), j.getSubmittedAt());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void review(Long id, CashActionRequest request) {
        if (!canReview()) {
            throw new BusinessException("仅财务负责人/老板/管理员可审核");
        }
        FinCashJournal j = requireJournalForUpdate(id);
        assertActive(j);
        assertDateOpen(j.getReceiptDate());
        if (!REVIEW_PENDING.equals(j.getReviewStatus())) {
            throw new BusinessException("仅待审核收款可以审核通过");
        }
        if (cashExceptionService.hasUnresolvedForJournal(j.getId())) {
            throw new BusinessException("该收款仍有未解决异常，不能审核通过");
        }
        recomputeJournal(j);
        if (FUND_BUSINESS.equals(j.getFundNature()) && !STATUS_MATCHED.equals(j.getMatchStatus())) {
            throw new BusinessException("业务款未全部核销，不能审核通过");
        }
        String before = cashJournalEventService.snapshot(j);
        j.setReviewStatus(REVIEW_APPROVED);
        j.setReviewedBy(SecurityUtils.getCurrentUserId());
        j.setReviewedAt(LocalDateTime.now());
        j.setReviewRemark(request == null ? j.getReviewRemark() : trim(request.getRemark()));
        syncLegacyStatus(j);
        updateById(j);
        cashJournalEventService.append(j, "review", before, "审核通过", null);
        cashNotificationService.reviewResult(j.getSubmittedBy(), j.getId(), j.getReceiptNo(), true, null,
                j.getReviewedAt());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void rejectReview(Long id, CashActionRequest request) {
        if (!canReview()) {
            throw new BusinessException("仅财务负责人/老板/管理员可驳回审核");
        }
        String reason = requireReason(request, "驳回审核必须填写原因");
        FinCashJournal j = requireJournalForUpdate(id);
        assertActive(j);
        assertDateOpen(j.getReceiptDate());
        if (!REVIEW_PENDING.equals(j.getReviewStatus())) {
            throw new BusinessException("仅待审核收款可以驳回");
        }
        String before = cashJournalEventService.snapshot(j);
        LocalDateTime rejectedAt = LocalDateTime.now();
        j.setReviewStatus(REVIEW_REJECTED);
        j.setReviewRemark(reason);
        syncLegacyStatus(j);
        updateById(j);
        cashJournalEventService.append(j, "reject", before, "审核驳回：" + reason, null);
        cashNotificationService.reviewResult(j.getSubmittedBy(), j.getId(), j.getReceiptNo(), false, reason,
                rejectedAt);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void reverseReview(Long id, CashActionRequest request) {
        if (!canReview()) {
            throw new BusinessException("仅财务负责人/老板/管理员可反审核");
        }
        String reason = requireReason(request, "反审核必须填写原因");
        FinCashJournal j = requireJournalForUpdate(id);
        assertActive(j);
        assertDateOpen(j.getReceiptDate());
        if (!REVIEW_APPROVED.equals(j.getReviewStatus())) {
            throw new BusinessException("仅已审核收款可以反审核");
        }
        String before = cashJournalEventService.snapshot(j);
        j.setReviewStatus(REVIEW_REVERSED);
        j.setReverseReviewBy(SecurityUtils.getCurrentUserId());
        j.setReverseReviewAt(LocalDateTime.now());
        j.setReverseReviewReason(reason);
        syncLegacyStatus(j);
        updateById(j);
        cashJournalEventService.append(j, "reverse", before, "反审核：" + reason, null);
        cashNotificationService.reviewReversed(j.getId(), j.getReceiptNo(), j.getSubmittedBy(),
                j.getReverseReviewAt());
    }

    // ============================== 可核销报单 =================================

    @Override
    public List<MatchableOrderVO> matchableOrders(Long customerId, String keyword) {
        String customerName = customerId != null ? baseMapper.selectCustomerNameById(customerId) : null;
        List<MatchableOrderVO> out = new ArrayList<>();

        // 代账 biz_bookkeeping_order:应收=contract_amount(空则bookkeeping_amount),客户=company_name,销售=owner_name,日期=sign_date
        List<BizBookkeepingOrder> bkList = bookkeepingOrderMapper.selectList(
                scoped(new LambdaQueryWrapper<BizBookkeepingOrder>(), BizBookkeepingOrder::getCreateBy,
                        BizBookkeepingOrder::getCompanyName, customerName, keyword));
        Map<Long, BigDecimal> bkMatched = matchedSums(BIZ_BOOKKEEPING, idsOf(bkList, BizBookkeepingOrder::getId));
        for (BizBookkeepingOrder o : bkList) {
            addCandidate(out, BIZ_BOOKKEEPING, "代账", "代理记账", o.getId(), "BK-",
                    o.getCompanyName(), o.getOwnerName(),
                    firstNonNull(o.getContractAmount(), o.getBookkeepingAmount()),
                    bkMatched.get(o.getId()),
                    o.getSignDate() != null ? o.getSignDate() : dateOf(o.getCreateTime()));
        }

        // 地址 biz_address_order:应收=collect_total,客户=company_name,销售=sales_name,日期=contract_start
        List<BizAddressOrder> adList = addressOrderMapper.selectList(
                scoped(new LambdaQueryWrapper<BizAddressOrder>(), BizAddressOrder::getCreateBy,
                        BizAddressOrder::getCompanyName, customerName, keyword));
        Map<Long, BigDecimal> adMatched = matchedSums(BIZ_ADDRESS, idsOf(adList, BizAddressOrder::getId));
        for (BizAddressOrder o : adList) {
            addCandidate(out, BIZ_ADDRESS, "地址", "地址挂靠", o.getId(), "AD-",
                    o.getCompanyName(), o.getSalesName(),
                    o.getCollectTotal(),
                    adMatched.get(o.getId()),
                    o.getContractStart() != null ? o.getContractStart() : dateOf(o.getCreateTime()));
        }

        // 工商 biz_gs_order:应收=fee,客户=company_name,销售=handler(办理人),日期=received_date
        List<BizGsOrder> gsList = gsOrderMapper.selectList(
                scoped(new LambdaQueryWrapper<BizGsOrder>(), BizGsOrder::getCreateBy,
                        BizGsOrder::getCompanyName, customerName, keyword));
        Map<Long, BigDecimal> gsMatched = matchedSums(BIZ_GS, idsOf(gsList, BizGsOrder::getId));
        for (BizGsOrder o : gsList) {
            addCandidate(out, BIZ_GS, "工商", "工商办理", o.getId(), "GS-",
                    o.getCompanyName(), o.getHandler(),
                    o.getFee(),
                    gsMatched.get(o.getId()),
                    o.getReceivedDate() != null ? o.getReceivedDate() : dateOf(o.getCreateTime()));
        }

        // 刻章 biz_seal_order:应收=fee,客户=company_name,销售=owner_name,日期=reg_date
        List<BizSealOrder> sealList = sealOrderMapper.selectList(
                scoped(new LambdaQueryWrapper<BizSealOrder>(), BizSealOrder::getCreateBy,
                        BizSealOrder::getCompanyName, customerName, keyword));
        Map<Long, BigDecimal> sealMatched = matchedSums(BIZ_SEAL, idsOf(sealList, BizSealOrder::getId));
        for (BizSealOrder o : sealList) {
            addCandidate(out, BIZ_SEAL, "刻章", "刻章刻制", o.getId(), "SL-",
                    o.getCompanyName(), o.getOwnerName(),
                    o.getFee(),
                    sealMatched.get(o.getId()),
                    o.getRegDate() != null ? o.getRegDate() : dateOf(o.getCreateTime()));
        }

        out.sort(Comparator.comparing(MatchableOrderVO::getOrderDate,
                Comparator.nullsLast(Comparator.reverseOrder())));
        return out;
    }

    @Override
    public List<MatchableOrderVO> recommendations(Long journalId, String keyword) {
        return recommendationsWithRules(journalId, keyword, cashMatchRuleService.current());
    }

    @Override
    public List<MatchableOrderVO> simulateRecommendations(Long journalId, String keyword,
                                                           CashMatchRuleRequest rules) {
        return recommendationsWithRules(journalId, keyword, cashMatchRuleService.draft(rules));
    }

    private List<MatchableOrderVO> recommendationsWithRules(Long journalId, String keyword,
                                                             FinCashMatchRuleConfig rules) {
        FinCashJournal journal = requireJournalAccess(journalId);
        FinCashPayerAlias payerAlias = payerAliasService.uniqueActive(journal.getPayerName());
        Map<String, MatchableOrderVO> candidateMap = new LinkedHashMap<>();
        if (journal.getCustomerId() != null) {
            mergeCandidates(candidateMap, matchableOrders(journal.getCustomerId(), null));
        } else if (!StringUtils.hasText(keyword)) {
            mergeCandidates(candidateMap, matchableOrders(null, null));
        }
        if (StringUtils.hasText(keyword)) {
            mergeCandidates(candidateMap, matchableOrders(null, keyword.trim()));
        }
        if (StringUtils.hasText(journal.getPayerName())) {
            mergeCandidates(candidateMap, matchableOrders(null, journal.getPayerName()));
        }
        if (payerAlias != null) {
            mergeCandidates(candidateMap, matchableOrders(payerAlias.getCustomerId(), null));
        }
        addReferencedCandidates(candidateMap, journal,
                joinText(journal.getSummary(), journal.getRemark(), journal.getBankSerialNo(), keyword), rules);

        LambdaQueryWrapper<FinReceivableRenewal> receivableQuery = new LambdaQueryWrapper<>();
        receivableQuery.gt(FinReceivableRenewal::getArrearsAmount, BigDecimal.ZERO);
        if (StringUtils.hasText(keyword)) {
            receivableQuery.and(w -> w.like(FinReceivableRenewal::getCustomerName, keyword)
                    .or().like(FinReceivableRenewal::getRemark, keyword)
                    .or().like(FinReceivableRenewal::getReceivableMonth, keyword));
        } else if (journal.getCustomerId() != null || payerAlias != null) {
            receivableQuery.eq(FinReceivableRenewal::getCustomerId,
                    journal.getCustomerId() != null ? journal.getCustomerId() : payerAlias.getCustomerId());
        } else if (StringUtils.hasText(journal.getPayerName())) {
            receivableQuery.like(FinReceivableRenewal::getCustomerName, journal.getPayerName());
        }
        receivableQuery.orderByAsc(FinReceivableRenewal::getDueDate).last("LIMIT 200");
        for (FinReceivableRenewal receivable : receivableRenewalMapper.selectList(receivableQuery)) {
            MatchableOrderVO vo = new MatchableOrderVO();
            vo.setBizType(BIZ_RECEIVABLE);
            vo.setBizTypeLabel("回款续费");
            vo.setBizName((StringUtils.hasText(receivable.getServiceType()) ? receivable.getServiceType() : "应收")
                    + (StringUtils.hasText(receivable.getReceivableMonth()) ? " · " + receivable.getReceivableMonth() : ""));
            vo.setBizId(receivable.getId());
            vo.setOrderNo("RR-" + receivable.getId());
            vo.setCustomerName(receivable.getCustomerName());
            vo.setSalesName(receivable.getCollectorName());
            vo.setReceivableAmount(n(receivable.getReceivableAmount()));
            vo.setReceivedAmount(n(receivable.getReceivedAmount()));
            vo.setUnpaidAmount(n(receivable.getArrearsAmount()));
            vo.setOrderDate(receivable.getDueDate());
            vo.setPaymentStatus(n(receivable.getReceivedAmount()).signum() > 0 ? "部分收款" : "待收款");
            candidateMap.putIfAbsent(candidateKey(vo.getBizType(), vo.getBizId()), vo);
        }

        List<MatchableOrderVO> candidates = new ArrayList<>(candidateMap.values());
        for (MatchableOrderVO candidate : candidates) {
            cashMatchScoreEngine.apply(journal, candidate,
                    payerAlias == null ? null : payerAlias.getCustomerNameSnapshot(), rules);
        }
        return candidates.stream()
                .sorted(Comparator.comparing(MatchableOrderVO::getScore,
                                Comparator.nullsLast(Comparator.reverseOrder()))
                        .thenComparing(MatchableOrderVO::getOrderDate,
                                Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(rules.getMaxCandidates())
                .collect(Collectors.toList());
    }

    private void mergeCandidates(Map<String, MatchableOrderVO> target, List<MatchableOrderVO> rows) {
        if (rows == null) {
            return;
        }
        for (MatchableOrderVO row : rows) {
            if (row != null && row.getBizId() != null && StringUtils.hasText(row.getBizType())) {
                target.putIfAbsent(candidateKey(row.getBizType(), row.getBizId()), row);
            }
        }
    }

    /** 摘要、备注或人工搜索中出现完整报单号时，直接把目标补进候选集。 */
    private void addReferencedCandidates(Map<String, MatchableOrderVO> target,
                                         FinCashJournal journal,
                                         String searchable,
                                         FinCashMatchRuleConfig rules) {
        if (!StringUtils.hasText(searchable)) {
            return;
        }
        Matcher matcher = ORDER_REFERENCE.matcher(searchable);
        while (matcher.find()) {
            String prefix = matcher.group(1).toUpperCase();
            String bizType = switch (prefix) {
                case "BK" -> BIZ_BOOKKEEPING;
                case "AD" -> BIZ_ADDRESS;
                case "GS" -> BIZ_GS;
                case "SL" -> BIZ_SEAL;
                case "RR" -> BIZ_RECEIVABLE;
                default -> null;
            };
            if (bizType == null) {
                continue;
            }
            try {
                Long bizId = Long.valueOf(matcher.group(2));
                MatchableOrderVO candidate = candidateForTarget(journal, bizType, bizId, rules);
                if (candidate != null) {
                    target.putIfAbsent(candidateKey(bizType, bizId), candidate);
                }
            } catch (NumberFormatException ignore) {
                // 超出 Long 范围的输入不是有效报单号，按普通摘要处理。
            }
        }
    }

    /** 从服务端真实报单生成推荐/审计快照，不信任前端回传的客户、单号和分数。 */
    private MatchableOrderVO candidateForTarget(FinCashJournal journal, String bizType, Long bizId,
                                                FinCashMatchRuleConfig rules) {
        List<MatchableOrderVO> rows = new ArrayList<>(1);
        switch (bizType) {
            case BIZ_BOOKKEEPING: {
                BizBookkeepingOrder o = bookkeepingOrderMapper.selectById(bizId);
                if (o != null) {
                    addCandidate(rows, BIZ_BOOKKEEPING, "代账", "代理记账", o.getId(), "BK-",
                            o.getCompanyName(), o.getOwnerName(),
                            firstNonNull(o.getContractAmount(), o.getBookkeepingAmount()),
                            matchedSums(BIZ_BOOKKEEPING, List.of(o.getId())).get(o.getId()),
                            o.getSignDate() != null ? o.getSignDate() : dateOf(o.getCreateTime()));
                }
                break;
            }
            case BIZ_ADDRESS: {
                BizAddressOrder o = addressOrderMapper.selectById(bizId);
                if (o != null) {
                    addCandidate(rows, BIZ_ADDRESS, "地址", "地址挂靠", o.getId(), "AD-",
                            o.getCompanyName(), o.getSalesName(), o.getCollectTotal(),
                            matchedSums(BIZ_ADDRESS, List.of(o.getId())).get(o.getId()),
                            o.getContractStart() != null ? o.getContractStart() : dateOf(o.getCreateTime()));
                }
                break;
            }
            case BIZ_GS: {
                BizGsOrder o = gsOrderMapper.selectById(bizId);
                if (o != null) {
                    addCandidate(rows, BIZ_GS, "工商", "工商办理", o.getId(), "GS-",
                            o.getCompanyName(), o.getHandler(), o.getFee(),
                            matchedSums(BIZ_GS, List.of(o.getId())).get(o.getId()),
                            o.getReceivedDate() != null ? o.getReceivedDate() : dateOf(o.getCreateTime()));
                }
                break;
            }
            case BIZ_SEAL: {
                BizSealOrder o = sealOrderMapper.selectById(bizId);
                if (o != null) {
                    addCandidate(rows, BIZ_SEAL, "刻章", "刻章刻制", o.getId(), "SL-",
                            o.getCompanyName(), o.getOwnerName(), o.getFee(),
                            matchedSums(BIZ_SEAL, List.of(o.getId())).get(o.getId()),
                            o.getRegDate() != null ? o.getRegDate() : dateOf(o.getCreateTime()));
                }
                break;
            }
            case BIZ_RECEIVABLE: {
                FinReceivableRenewal o = receivableRenewalMapper.selectById(bizId);
                if (o != null && n(o.getArrearsAmount()).signum() > 0) {
                    MatchableOrderVO vo = new MatchableOrderVO();
                    vo.setBizType(BIZ_RECEIVABLE);
                    vo.setBizTypeLabel("回款续费");
                    vo.setBizName((StringUtils.hasText(o.getServiceType()) ? o.getServiceType() : "应收")
                            + (StringUtils.hasText(o.getReceivableMonth()) ? " · " + o.getReceivableMonth() : ""));
                    vo.setBizId(o.getId());
                    vo.setOrderNo("RR-" + o.getId());
                    vo.setCustomerName(o.getCustomerName());
                    vo.setSalesName(o.getCollectorName());
                    vo.setReceivableAmount(n(o.getReceivableAmount()));
                    vo.setReceivedAmount(n(o.getReceivedAmount()));
                    vo.setUnpaidAmount(n(o.getArrearsAmount()));
                    vo.setOrderDate(o.getDueDate());
                    vo.setPaymentStatus(n(o.getReceivedAmount()).signum() > 0 ? "部分收款" : "待收款");
                    rows.add(vo);
                }
                break;
            }
            default:
                return null;
        }
        if (rows.isEmpty()) {
            return null;
        }
        MatchableOrderVO candidate = rows.get(0);
        FinCashPayerAlias alias = payerAliasService.uniqueActive(journal.getPayerName());
        cashMatchScoreEngine.apply(journal, candidate, alias == null ? null : alias.getCustomerNameSnapshot(), rules);
        return candidate;
    }

    private String candidateKey(String bizType, Long bizId) {
        return bizType + "|" + bizId;
    }

    private String joinText(String... values) {
        StringBuilder text = new StringBuilder();
        if (values != null) {
            for (String value : values) {
                if (StringUtils.hasText(value)) {
                    text.append(value).append(' ');
                }
            }
        }
        return text.toString();
    }

    /** 财务共享队列查询报单；租户隔离由 MyBatis 多租户插件统一处理。 */
    private <T> LambdaQueryWrapper<T> scoped(LambdaQueryWrapper<T> w,
                                             SFunction<T, ?> createByColumn,
                                             SFunction<T, ?> companyNameColumn,
                                             String customerName,
                                             String keyword) {
        w.like(StringUtils.hasText(customerName), companyNameColumn, customerName);
        w.like(StringUtils.hasText(keyword), companyNameColumn, keyword);
        w.last("LIMIT 300");
        return w;
    }

    private void addCandidate(List<MatchableOrderVO> out,
                              String bizType, String label, String bizName,
                              Long bizId, String prefix,
                              String customer, String sales,
                              BigDecimal receivable, BigDecimal received,
                              LocalDate orderDate) {
        BigDecimal recv = n(receivable);
        BigDecimal got = n(received);
        BigDecimal unpaid = recv.subtract(got);
        if (unpaid.signum() <= 0) {
            return; // 只返回未收/部分收
        }
        MatchableOrderVO vo = new MatchableOrderVO();
        vo.setBizType(bizType);
        vo.setBizTypeLabel(label);
        vo.setBizName(bizName);
        vo.setBizId(bizId);
        vo.setOrderNo(prefix + bizId);
        vo.setCustomerName(customer);
        vo.setSalesName(sales);
        vo.setReceivableAmount(recv);
        vo.setReceivedAmount(got);
        vo.setUnpaidAmount(unpaid);
        vo.setOrderDate(orderDate);
        vo.setPaymentStatus(got.signum() > 0 ? "部分收款" : "待收款");
        out.add(vo);
    }

    // ============================== 核销 =====================================

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void match(CashMatchRequest request) {
        if (request == null || request.getJournalId() == null) {
            throw new BusinessException("请选择收款记录");
        }
        List<CashMatchItemDTO> items = request.getItems();
        if (items == null || items.isEmpty()) {
            throw new BusinessException("请选择要核销的报单");
        }
        String requestNo = StringUtils.hasText(request.getRequestNo())
                ? request.getRequestNo().trim() : UUID.randomUUID().toString();
        if (requestNo.length() > 64) {
            throw new BusinessException("核销请求号过长");
        }

        // 同一请求中的相同目标先合并，既防超额也与数据库幂等唯一键保持一致。
        Map<String, CashMatchItemDTO> normalizedItems = new LinkedHashMap<>();
        BigDecimal total = BigDecimal.ZERO;
        for (CashMatchItemDTO item : items) {
            String bizType = item.getBizType();
            Long bizId = item.getBizId();
            if (!isValidBizType(bizType) || bizId == null) {
                throw new BusinessException("核销报单类型或ID不合法");
            }
            BigDecimal amt = n(item.getMatchedAmount());
            if (amt.signum() <= 0) {
                throw new BusinessException("核销金额必须大于0");
            }
            String key = bizType + "|" + bizId;
            CashMatchItemDTO existing = normalizedItems.get(key);
            if (existing == null) {
                normalizedItems.put(key, item);
            } else {
                existing.setMatchedAmount(n(existing.getMatchedAmount()).add(amt));
            }
            total = total.add(amt);
        }

        FinCashJournal j = requireJournalForUpdate(request.getJournalId());
        List<FinCashMatch> existingRequestMatches = cashMatchMapper.selectList(
                new LambdaQueryWrapper<FinCashMatch>()
                        .eq(FinCashMatch::getRequestNo, requestNo));
        if (existingRequestMatches != null && !existingRequestMatches.isEmpty()) {
            assertSameMatchRequest(j.getId(), normalizedItems, existingRequestMatches);
            return;
        }
        assertMutable(j, "核销");

        List<String> targetKeys = new ArrayList<>(normalizedItems.keySet());
        Collections.sort(targetKeys);
        for (String key : targetKeys) {
            String[] parts = key.split("\\|", 2);
            lockBusinessTarget(parts[0], Long.valueOf(parts[1]));
        }

        // 每张报单:本次请求 <= 目标剩余可收金额。
        for (Map.Entry<String, CashMatchItemDTO> e : normalizedItems.entrySet()) {
            String[] parts = e.getKey().split("\\|", 2);
            String bizType = parts[0];
            Long bizId = Long.valueOf(parts[1]);
            BigDecimal receivable = orderReceivable(bizType, bizId);
            if (receivable == null) {
                throw new BusinessException("报单不存在:" + bizType + "#" + bizId);
            }
            BigDecimal already = matchedSums(bizType, Collections.singletonList(bizId))
                    .getOrDefault(bizId, BigDecimal.ZERO);
            BigDecimal unpaid = n(receivable).subtract(already);
            BigDecimal requested = n(e.getValue().getMatchedAmount());
            if (requested.compareTo(unpaid) > 0) {
                throw new BusinessException("报单 " + bizType + "#" + bizId + " 核销金额超过其未收金额 " + unpaid);
            }
        }

        // 本次合计 <= 该收款未匹配金额。
        BigDecimal currentMatched = sumJournalMatched(j.getId());
        BigDecimal unmatched = n(j.getAmount()).subtract(currentMatched);
        if (total.compareTo(unmatched) > 0) {
            throw new BusinessException("核销合计 " + total + " 超过该收款未匹配金额 " + unmatched);
        }

        String before = cashJournalEventService.snapshot(j);
        LocalDateTime now = LocalDateTime.now();
        Long uid = SecurityUtils.getCurrentUserId();
        List<Long> matchIds = new ArrayList<>();
        List<MatchableOrderVO> scoreSnapshots = new ArrayList<>();
        FinCashMatchRuleConfig activeRules = cashMatchRuleService.current();
        for (CashMatchItemDTO item : normalizedItems.values()) {
            MatchableOrderVO scoreSnapshot = candidateForTarget(j, item.getBizType(), item.getBizId(), activeRules);
            if (scoreSnapshot == null) {
                throw new BusinessException("核销目标已无可核销余额，请刷新后重试");
            }
            FinCashMatch m = new FinCashMatch();
            m.setJournalId(j.getId());
            m.setBizType(item.getBizType());
            m.setBizId(item.getBizId());
            m.setOrderNo(scoreSnapshot.getOrderNo());
            m.setOrderCustomer(scoreSnapshot.getCustomerName());
            m.setMatchedAmount(n(item.getMatchedAmount()));
            m.setMatchStatus(MATCH_ACTIVE);
            m.setMatchMethod(validMatchMethod(request.getMatchMethod(), item));
            m.setConfidenceScore(scoreSnapshot.getScore());
            m.setConfidenceReasonJson(toJson(scoreSnapshot.getReasons()));
            m.setRequestNo(requestNo);
            m.setMatchRemark(item.getMatchRemark());
            m.setMatchedBy(uid);
            m.setMatchedAt(now);
            cashMatchMapper.insert(m);
            matchIds.add(m.getId());
            scoreSnapshots.add(scoreSnapshot);
            if (BIZ_RECEIVABLE.equals(m.getBizType())) {
                recomputeReceivableFromCash(m.getBizId(), m, j, false);
            }
        }

        recomputeJournal(j);
        syncLegacyStatus(j);
        updateById(j);
        Map<String, Object> metadata = new LinkedHashMap<>();
        metadata.put("requestNo", requestNo);
        metadata.put("matchIds", matchIds);
        metadata.put("amount", total);
        cashJournalEventService.append(j, "match", before, "完成核销 " + total + " 元", metadata);
        FinCashPayerAlias activeAlias = payerAliasService.uniqueActive(j.getPayerName());
        if (Boolean.TRUE.equals(request.getRememberPayerAlias())) {
            activeAlias = payerAliasService.confirmFromMatch(j, scoreSnapshots);
        }
        FinCashPayerAlias aliasForUsage = activeAlias;
        if (aliasForUsage != null && scoreSnapshots.stream().anyMatch(candidate ->
                CashNameNormalizer.company(aliasForUsage.getCustomerNameSnapshot())
                        .equals(CashNameNormalizer.company(candidate.getCustomerName())))) {
            payerAliasService.markUsed(aliasForUsage.getId());
        }
    }

    @Override
    public List<FinCashMatch> matches(Long journalId) {
        requireJournalAccess(journalId);
        List<FinCashMatch> list = cashMatchMapper.selectList(new LambdaQueryWrapper<FinCashMatch>()
                .eq(FinCashMatch::getJournalId, journalId)
                .orderByDesc(FinCashMatch::getMatchedAt)
                .orderByDesc(FinCashMatch::getId));
        // 回填报单类型标签 + 匹配人姓名
        List<Long> userIds = list.stream()
                .flatMap(m -> java.util.stream.Stream.of(m.getMatchedBy(), m.getCancelledBy()))
                .filter(Objects::nonNull).distinct().collect(Collectors.toList());
        Map<Long, String> nameMap = new HashMap<>();
        if (!userIds.isEmpty()) {
            for (SysUser u : sysUserMapper.selectBatchIds(userIds)) {
                nameMap.put(u.getId(), StringUtils.hasText(u.getNickname()) ? u.getNickname() : u.getUsername());
            }
        }
        for (FinCashMatch m : list) {
            m.setBizTypeLabel(labelOf(m.getBizType()));
            m.setMatchedByName(m.getMatchedBy() != null ? nameMap.get(m.getMatchedBy()) : null);
            m.setCancelledByName(m.getCancelledBy() != null ? nameMap.get(m.getCancelledBy()) : null);
        }
        return list;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void cancelMatch(Long matchId, CashActionRequest request) {
        String reason = requireReason(request, "反核销必须填写原因");
        FinCashMatch m = cashMatchMapper.selectForUpdate(matchId);
        if (m == null) {
            throw new BusinessException("核销记录不存在");
        }
        if (MATCH_CANCELLED.equals(m.getMatchStatus())) {
            throw new BusinessException("该核销已取消");
        }
        Long uid = SecurityUtils.getCurrentUserId();
        boolean self = m.getMatchedBy() != null && m.getMatchedBy().equals(uid);
        if (!canReview() && !self) {
            throw new BusinessException("仅财务负责人/老板/管理员或本人可反核销");
        }
        FinCashJournal j = requireJournalForUpdate(m.getJournalId());
        assertMutable(j, "反核销");
        assertDateOpen(j.getReceiptDate());
        String before = cashJournalEventService.snapshot(j);
        m.setMatchStatus(MATCH_CANCELLED);
        m.setCancelledBy(uid);
        m.setCancelledAt(LocalDateTime.now());
        m.setCancelReason(reason);
        cashMatchMapper.updateById(m);
        if (BIZ_RECEIVABLE.equals(m.getBizType())) {
            lockBusinessTarget(BIZ_RECEIVABLE, m.getBizId());
            recomputeReceivableFromCash(m.getBizId(), m, j, true);
        }
        recomputeJournal(j);
        syncLegacyStatus(j);
        updateById(j);
        cashJournalEventService.append(j, "cancel_match", before,
                "反核销 " + n(m.getMatchedAmount()) + " 元：" + reason,
                Map.of("matchId", m.getId(), "bizType", m.getBizType(), "bizId", m.getBizId()));
    }

    // ============================== 统计 =====================================

    @Override
    public Map<String, Object> stats() {
        LocalDate today = LocalDate.now();
        YearMonth month = YearMonth.now();
        Map<String, Object> data = new LinkedHashMap<>();
        Map<String, Object> summary = baseMapper.selectSummary(today, month.atDay(1),
                month.plusMonths(1).atDay(1), canReview() ? null : dataScopeHelper.getVisibleUserIds());
        if (summary != null) {
            data.putAll(summary);
        }
        return data;
    }

    @Override
    public CashJournalDetailVO detail(Long journalId) {
        FinCashJournal journal = requireJournalAccess(journalId);
        fillJournalOwnerNames(Collections.singletonList(journal));
        CashJournalDetailVO detail = new CashJournalDetailVO();
        detail.setJournal(journal);
        detail.setMatches(matches(journalId));
        FinCashExceptionCase exceptionCase = cashExceptionService.caseForJournal(journalId);
        detail.setExceptionCase(exceptionCase);
        detail.setExceptionEvents(exceptionCase == null ? List.of() : cashExceptionService.events(exceptionCase.getId()));
        detail.setJournalEvents(cashJournalEventService.list(journalId));
        detail.setDailyClosed(cashDailyCloseService.isDateClosed(journal.getReceiptDate()));
        return detail;
    }

    @Override
    public Map<String, Object> workbench() {
        LocalDate today = LocalDate.now();
        Map<String, Object> metrics = new LinkedHashMap<>(stats());
        List<Long> visibleUserIds = canReview() ? null : dataScopeHelper.getVisibleUserIds();
        Map<String, Object> risk = visibleUserIds == null
                ? receivableRenewalMapper.selectRiskSummary(today) : scopedReceivableRisk(today, visibleUserIds);
        if (risk != null) metrics.putAll(risk);

        Map<String, CashWorkbenchTaskVO> tasks = new LinkedHashMap<>();
        List<String> truncatedSources = new ArrayList<>();
        LambdaQueryWrapper<FinCashJournal> cashTaskQuery = new LambdaQueryWrapper<FinCashJournal>()
                .eq(FinCashJournal::getRecordStatus, RECORD_ACTIVE)
                .and(w -> w.eq(FinCashJournal::getReceiptDate, today)
                        .or().gt(FinCashJournal::getUnmatchedAmount, BigDecimal.ZERO)
                        .or().eq(FinCashJournal::getReviewStatus, REVIEW_PENDING)
                        .or().in(FinCashJournal::getExceptionStatus, "pending", "processing"))
                .orderByAsc(FinCashJournal::getReceiptDate)
                .orderByDesc(FinCashJournal::getAmount);
        if (!canReview()) {
            dataScopeHelper.applyFinancial(cashTaskQuery, FinCashJournal::getOwnerId, FinCashJournal::getOwnerDeptId);
        }
        cashTaskQuery.last("LIMIT 151");
        List<FinCashJournal> cashRows = baseMapper.selectList(cashTaskQuery);
        if (cashRows.size() > 150) {
            truncatedSources.add("收款任务");
            cashRows = new ArrayList<>(cashRows.subList(0, 150));
        }
        fillJournalOwnerNames(cashRows);
        LocalDateTime over24 = LocalDateTime.now().minusHours(24);
        for (FinCashJournal row : cashRows) {
            LocalDateTime receivedAt = row.getReceiptTime() != null ? row.getReceiptTime() : row.getCreateTime();
            if (n(row.getUnmatchedAmount()).signum() > 0 && receivedAt != null && receivedAt.isBefore(over24)) {
                putTask(tasks, cashTask(row, "P0", "over24_unmatched", "超24小时未匹配",
                        "到账超过24小时仍有 " + n(row.getUnmatchedAmount()) + " 元没有去向", "去核销"));
            } else if (today.equals(row.getReceiptDate()) && STATUS_WAITING.equals(row.getMatchStatus())) {
                putTask(tasks, cashTask(row, "P1", "today_unmatched", "今日新增未匹配",
                        "今日到账尚未匹配客户或业务", "去核销"));
            }
            if (STATUS_PARTIAL.equals(row.getMatchStatus())) {
                putTask(tasks, cashTask(row, "P1", "partial_balance", "部分匹配仍有余额",
                        "剩余 " + n(row.getUnmatchedAmount()) + " 元需要明确去向", "继续核销"));
            }
            if (REVIEW_PENDING.equals(row.getReviewStatus())) {
                putTask(tasks, cashTask(row, "P1", "pending_review", "已匹配待审核",
                        "收款已提交审核，等待财务负责人确认", "去审核"));
            }
        }

        IPage<FinCashExceptionCase> exceptionPage = cashExceptionService.page(1, 101, null, null, null, null);
        List<FinCashExceptionCase> exceptionRows = exceptionPage.getRecords();
        if (exceptionRows.size() > 100) {
            truncatedSources.add("异常款");
            exceptionRows = new ArrayList<>(exceptionRows.subList(0, 100));
        }
        for (FinCashExceptionCase entity : exceptionRows) {
            if ("resolved".equals(entity.getStatus())) {
                continue;
            }
            CashWorkbenchTaskVO task = new CashWorkbenchTaskVO();
            task.setTaskKey("exception:" + entity.getId());
            task.setSourceType("exception");
            task.setSourceId(entity.getId());
            task.setJournalId(entity.getJournalId());
            task.setPriority(entity.getPriority());
            task.setTaskType("exception");
            task.setTitle(entity.getExceptionType());
            task.setReason(StringUtils.hasText(entity.getNextAction()) ? entity.getNextAction() : entity.getLatestNote());
            task.setAmount(entity.getReceiptAmount());
            task.setOwnerId(entity.getOwnerId());
            task.setOwnerName(entity.getOwnerName());
            task.setDeadline(entity.getNextFollowUpTime());
            task.setAction("处理异常");
            putTask(tasks, task);
        }

        LambdaQueryWrapper<FinCashReconcileBatch> reconcileQuery = new LambdaQueryWrapper<FinCashReconcileBatch>()
                .eq(FinCashReconcileBatch::getStatus, "needs_review")
                .orderByDesc(FinCashReconcileBatch::getImportedAt);
        if (!canSeeAllBatches()) {
            reconcileQuery.eq(FinCashReconcileBatch::getImportedBy, SecurityUtils.getCurrentUserId());
        }
        List<FinCashReconcileBatch> reconcileBatches = cashReconcileBatchMapper.selectList(reconcileQuery.last("LIMIT 51"));
        if (reconcileBatches.size() > 50) {
            truncatedSources.add("账户对账");
            reconcileBatches = new ArrayList<>(reconcileBatches.subList(0, 50));
        }
        int reconcilePendingCount = 0;
        for (FinCashReconcileBatch batch : reconcileBatches) {
            int pending = ni(batch.getSuggestedCount()) + ni(batch.getUnmatchedCount()) + ni(batch.getConflictCount());
            reconcilePendingCount += pending;
            CashWorkbenchTaskVO task = new CashWorkbenchTaskVO();
            task.setTaskKey("reconcile:" + batch.getId());
            task.setSourceType("reconcile");
            task.setSourceId(batch.getId());
            task.setPriority(ni(batch.getConflictCount()) > 0 ? "P0" : "P1");
            task.setTaskType("reconcile_risk");
            task.setTitle(batch.getAccountName() + "对账待处理");
            task.setReason("对账批次 " + batch.getBatchNo() + " 仍有 " + pending + " 行待确认");
            task.setAmount(n(batch.getStatementAmount()).subtract(n(batch.getMatchedAmount())).max(BigDecimal.ZERO));
            task.setOwnerId(batch.getImportedBy());
            task.setOwnerName(batch.getImportedByName());
            task.setDeadline(batch.getImportedAt() == null ? null : batch.getImportedAt().plusHours(24));
            task.setAction("去对账");
            putTask(tasks, task);
        }
        metrics.put("reconcilePendingCount", reconcilePendingCount);

        LambdaQueryWrapper<FinReceivableRenewal> receivableRiskQuery = new LambdaQueryWrapper<FinReceivableRenewal>()
                .gt(FinReceivableRenewal::getArrearsAmount, BigDecimal.ZERO)
                .and(w -> w.lt(FinReceivableRenewal::getDueDate, today)
                        .or().eq(FinReceivableRenewal::getCollectionStatus, "坏账风险"))
                .orderByAsc(FinReceivableRenewal::getDueDate);
        if (!canReview()) dataScopeHelper.applyByVisibleUsers(receivableRiskQuery, FinReceivableRenewal::getCollectorId);
        receivableRiskQuery.last("LIMIT 51");
        List<FinReceivableRenewal> receivableRisks = receivableRenewalMapper.selectList(receivableRiskQuery);
        if (receivableRisks.size() > 50) {
            truncatedSources.add("回款续费");
            receivableRisks = new ArrayList<>(receivableRisks.subList(0, 50));
        }
        for (FinReceivableRenewal row : receivableRisks) {
            CashWorkbenchTaskVO task = new CashWorkbenchTaskVO();
            task.setTaskKey("receivable:" + row.getId());
            task.setSourceType("receivable");
            task.setSourceId(row.getId());
            task.setPriority("坏账风险".equals(row.getCollectionStatus()) ? "P0" : "P1");
            task.setTaskType("receivable_risk");
            task.setTitle("回款续费" + ("坏账风险".equals(row.getCollectionStatus()) ? "坏账风险" : "逾期"));
            task.setReason(row.getCustomerName() + " 欠费 " + n(row.getArrearsAmount()) + " 元");
            task.setAmount(row.getArrearsAmount());
            task.setOwnerId(row.getCollectorId());
            task.setOwnerName(row.getCollectorName());
            task.setDeadline(row.getNextCollectionTime());
            task.setAction("去催收");
            putTask(tasks, task);
        }

        List<CashWorkbenchTaskVO> ordered = tasks.values().stream()
                .sorted(Comparator.comparingInt((CashWorkbenchTaskVO t) -> priorityRank(t.getPriority()))
                        .thenComparing(CashWorkbenchTaskVO::getDeadline, Comparator.nullsLast(Comparator.naturalOrder()))
                        .thenComparing(CashWorkbenchTaskVO::getTaskKey))
                .collect(Collectors.toList());
        Map<String, Long> counts = ordered.stream().collect(Collectors.groupingBy(
                CashWorkbenchTaskVO::getPriority, LinkedHashMap::new, Collectors.counting()));
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("metrics", metrics);
        result.put("taskCounts", counts);
        result.put("tasks", ordered);
        result.put("taskTruncated", !truncatedSources.isEmpty());
        result.put("truncatedSources", truncatedSources);
        return result;
    }

    private Map<String, Object> scopedReceivableRisk(LocalDate today, List<Long> visibleUserIds) {
        List<FinReceivableRenewal> rows = receivableRenewalMapper.selectList(
                new LambdaQueryWrapper<FinReceivableRenewal>()
                        .in(FinReceivableRenewal::getCollectorId, visibleUserIds)
                        .gt(FinReceivableRenewal::getArrearsAmount, BigDecimal.ZERO)
                        .and(w -> w.lt(FinReceivableRenewal::getDueDate, today)
                                .or().eq(FinReceivableRenewal::getCollectionStatus, "坏账风险")));
        BigDecimal overdueAmount = BigDecimal.ZERO;
        BigDecimal badRiskAmount = BigDecimal.ZERO;
        int overdueCount = 0;
        int badRiskCount = 0;
        for (FinReceivableRenewal row : rows) {
            BigDecimal amount = n(row.getArrearsAmount());
            if (row.getDueDate() != null && row.getDueDate().isBefore(today)) {
                overdueAmount = overdueAmount.add(amount);
                overdueCount++;
            }
            if ("坏账风险".equals(row.getCollectionStatus())) {
                badRiskAmount = badRiskAmount.add(amount);
                badRiskCount++;
            }
        }
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("overdueAmount", overdueAmount);
        result.put("overdueCount", overdueCount);
        result.put("badRiskAmount", badRiskAmount);
        result.put("badRiskCount", badRiskCount);
        return result;
    }

    @Override
    public Map<String, Object> monthlyReport(String monthValue) {
        return monthlyReportService.report(monthValue);
    }

    @Override
    public List<FinCashJournal> cashOptions(Long customerId, BigDecimal maxAmount) {
        LambdaQueryWrapper<FinCashJournal> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(FinCashJournal::getRecordStatus, RECORD_ACTIVE)
                .ne(FinCashJournal::getReviewStatus, REVIEW_APPROVED)
                .gt(FinCashJournal::getUnmatchedAmount, BigDecimal.ZERO);
        if (customerId != null) {
            wrapper.and(w -> w.eq(FinCashJournal::getCustomerId, customerId)
                    .or().isNull(FinCashJournal::getCustomerId));
        }
        wrapper.le(maxAmount != null, FinCashJournal::getUnmatchedAmount, maxAmount);
        if (!canReview()) dataScopeHelper.applyFinancial(wrapper, FinCashJournal::getOwnerId, FinCashJournal::getOwnerDeptId);
        wrapper.orderByDesc(FinCashJournal::getReceiptDate)
                .orderByDesc(FinCashJournal::getId)
                .last("LIMIT 50");
        List<FinCashJournal> rows = baseMapper.selectList(wrapper);
        fillJournalOwnerNames(rows);
        return rows;
    }

    // ============================== 批量导入 =================================

    @Override
    public CashImportPreviewResult importPreview(CashImportRequest request) {
        List<CashImportRowDTO> raw = request == null ? null : request.getRows();
        List<CashImportRowResult> results = new ArrayList<>();
        CashImportPreviewResult out = new CashImportPreviewResult();
        out.setRows(results);
        if (raw == null || raw.isEmpty()) {
            out.setStats(new CashImportPreviewResult.Stats());
            return out;
        }

        Set<String> allowedMethods = enabledDictValues("payment_method", ALLOWED_METHODS);
        Set<String> allowedAccounts = new HashSet<>(enabledDictValues("receive_account", ALLOWED_ACCOUNTS));
        allowedAccounts.removeAll(cashAccountService.disabledAccountNames());
        allowedAccounts.addAll(cashAccountService.activeAccountNames());
        // 1) 逐行归一化 + 硬/软校验(空行忽略)
        int idx = 0;
        for (CashImportRowDTO dto : raw) {
            idx++;
            if (isBlankRow(dto)) {
                continue; // 空行忽略
            }
            CashImportRowResult r = new CashImportRowResult();
            r.setRowNo(parseRowNo(dto.getRowNo(), idx));
            parseAndValidate(dto, r, allowedMethods, allowedAccounts);
            results.add(r);
        }

        // 2) 批量查重(高效:先一次性把本批 bankSerialNo / 日期 拉到 DB 命中集合,别逐行 N 次查库)
        applyDuplicateCheck(results);

        // 3) 匹配(客户/销售/报单;仅提示,不拦截、不自动核销)
        applyMatch(results);

        // 4) 汇总
        CashImportPreviewResult.Stats stats = new CashImportPreviewResult.Stats();
        stats.setTotal(results.size());
        for (CashImportRowResult r : results) {
            if (!r.isValid()) {
                stats.setError(stats.getError() + 1);
            }
            if ("suspect".equals(r.getDupStatus())) {
                stats.setSuspect(stats.getSuspect() + 1);
            }
            boolean importable = r.isValid() && !"duplicate".equals(r.getDupStatus());
            if (importable) {
                stats.setImportable(stats.getImportable() + 1);
                if (r.getAmount() != null) {
                    stats.setImportableAmount(stats.getImportableAmount().add(r.getAmount()));
                }
            }
        }
        out.setStats(stats);
        return out;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Map<String, Object> importCommit(CashImportRequest request) {
        List<CashImportRowDTO> raw = request == null ? null : request.getRows();
        if (raw == null || raw.isEmpty()) {
            throw new BusinessException("没有可导入的数据");
        }
        String importType = normImportType(request.getImportType());
        Set<String> allowedMethods = enabledDictValues("payment_method", ALLOWED_METHODS);
        Set<String> allowedAccounts = new HashSet<>(enabledDictValues("receive_account", ALLOWED_ACCOUNTS));
        allowedAccounts.removeAll(cashAccountService.disabledAccountNames());
        allowedAccounts.addAll(cashAccountService.activeAccountNames());

        // 1) 服务端复核:重新归一化 + 硬校验(不信任前端);硬校验未过计 fail,流水号硬重复计 duplicate 跳过。
        //    用户在预览确认的 suspect 允许入库,此处不再拦 suspect。
        List<CashImportRowResult> parsed = new ArrayList<>();
        int idx = 0;
        for (CashImportRowDTO dto : raw) {
            idx++;
            if (isBlankRow(dto)) {
                continue;
            }
            CashImportRowResult r = new CashImportRowResult();
            r.setRowNo(parseRowNo(dto.getRowNo(), idx));
            parseAndValidate(dto, r, allowedMethods, allowedAccounts);
            parsed.add(r);
        }
        applyDuplicateCheck(parsed);

        // 批量查硬重复:一次性查询流水号，再按“收款账户+流水号”判断。
        Set<String> serials = parsed.stream()
                .filter(CashImportRowResult::isValid)
                .map(CashImportRowResult::getBankSerialNo)
                .filter(StringUtils::hasText)
                .collect(Collectors.toSet());
        Set<String> serialActive = new HashSet<>();
        if (!serials.isEmpty()) {
            List<FinCashJournal> hit = baseMapper.selectList(new LambdaQueryWrapper<FinCashJournal>()
                    .select(FinCashJournal::getReceiveAccount, FinCashJournal::getBankSerialNo)
                    .in(FinCashJournal::getBankSerialNo, serials)
                    .ne(FinCashJournal::getStatus, STATUS_VOID));
            for (FinCashJournal j : hit) {
                serialActive.add(serialAccountKey(j.getReceiveAccount(), j.getBankSerialNo()));
            }
        }

        String batchNo = genBatchNo();
        Map<String, Long> customerCache = new HashMap<>();
        Set<String> seenSerial = new HashSet<>();
        Set<String> seenDaps = new HashSet<>(); // 无流水号行批内去重(日期+金额+付款方+摘要)
        List<FinCashJournal> valids = new ArrayList<>();
        Map<FinCashJournal, CashImportRowResult> importSourceRows = new IdentityHashMap<>();
        int fail = 0;
        int duplicate = 0;

        // 2) 组装待入库实体(先不赋 receiptNo,后面按日期批量赋号)
        for (CashImportRowResult r : parsed) {
            if (!r.isValid()) {
                fail++;
                continue;
            }
            LocalDate d = LocalDate.parse(r.getReceiptDate());
            String serial = r.getBankSerialNo();
            if (StringUtils.hasText(serial)) {
                String serialK = serialAccountKey(r.getReceiveAccount(), serial);
                if (serialActive.contains(serialK) || seenSerial.contains(serialK)) {
                    duplicate++;
                    continue;
                }
                seenSerial.add(serialK);
            } else {
                // 无流水号行(现金/微信等)批内去重:完全相同(日期+金额+付款方+摘要)只入库一条
                String daps = dapKey(d, r.getAmount(), r.getPayerName()) + "|" + norm(r.getSummary());
                if (seenDaps.contains(daps)) {
                    duplicate++;
                    continue;
                }
                seenDaps.add(daps);
            }
            FinCashJournal j = new FinCashJournal();
            j.setReceiptDate(d);
            if (StringUtils.hasText(r.getReceiptTime())) {
                j.setReceiptTime(d.atTime(java.time.LocalTime.parse(r.getReceiptTime())));
            }
            j.setAmount(r.getAmount());
            j.setMatchedAmount(BigDecimal.ZERO);
            j.setUnmatchedAmount(r.getAmount());
            j.setPaymentMethod(r.getPaymentMethod());
            j.setReceiveAccount(r.getReceiveAccount());
            j.setPayerName(r.getPayerName());
            j.setPayerPhone(r.getPayerPhone());
            Long cid = StringUtils.hasText(r.getCustomerName())
                    ? customerCache.computeIfAbsent(r.getCustomerName(), this::lookupCustomerId) : null;
            j.setCustomerId(cid);
            j.setCustomerName(r.getCustomerName());
            j.setSummary(r.getSummary());
            j.setBankSerialNo(serial);
            j.setRecordStatus(RECORD_ACTIVE);
            j.setMatchStatus(STATUS_WAITING);
            j.setReviewStatus(REVIEW_DRAFT);
            j.setExceptionStatus(EXCEPTION_NONE);
            j.setFundNature(FUND_BUSINESS);
            j.setSourceType(importType);
            fillJournalOwner(j, SecurityUtils.getCurrentUserId());
            syncLegacyStatus(j);
            j.setRemark(buildImportRemark(r));
            j.setImportBatchNo(batchNo);
            valids.add(j);
            importSourceRows.put(j, r);
        }

        // 3) 批内按日期连续赋 receiptNo(每个日期只查一次当日最大号,组内 +1,不逐行查 max)
        for (LocalDate receiptDate : valids.stream().map(FinCashJournal::getReceiptDate)
                .collect(Collectors.toCollection(TreeSet::new))) {
            assertDateOpen(receiptDate);
        }
        cashAccountService.bindJournalAccounts(valids);
        assignReceiptNos(valids);

        // 4) 批量入库(分片 saveBatch,支持大批量 5000 行)
        //    receipt_no 唯一索引在并发导入(或导入撞手动新增)时可能撞号 → 捕获后重读库当日最大号
        //    重排 receiptNo 再重试,最多 5 次;仍失败则抛出交由 @Transactional 整批回滚。
        if (!valids.isEmpty()) {
            int attempts = 0;
            while (true) {
                attempts++;
                try {
                    saveBatch(valids, 500);
                    break;
                } catch (DuplicateKeyException dke) {
                    if (attempts >= 5) {
                        throw dke;
                    }
                    // 重新读库(含并发已提交行)当日最大号,整批重排收款编号后再试(实体主键保持不变,
                    // 单次 flush 全批失败未落库,复用旧号无 PK 冲突)
                    assignReceiptNos(valids);
                }
            }
        }

        for (FinCashJournal journal : valids) {
            cashJournalEventService.append(journal, "create", null,
                    "通过" + importType + "导入真实到账 " + n(journal.getAmount()) + " 元",
                    Map.of("batchNo", batchNo));
            CashImportRowResult source = importSourceRows.get(journal);
            if (source != null && "suspect".equals(source.getDupStatus())) {
                cashExceptionService.ensureSystemCase(journal, null, "重复疑似", "P0", "import",
                        StringUtils.hasText(source.getDupReason()) ? source.getDupReason() : "导入预览识别为疑似重复");
            } else {
                syncAutomaticException(journal);
            }
        }

        BigDecimal totalAmount = valids.stream().map(j -> n(j.getAmount()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        int success = valids.size();

        // 5) 写批次记录
        FinCashImportBatch batch = new FinCashImportBatch();
        batch.setBatchNo(batchNo);
        batch.setImportType(importType);
        batch.setFileName(trim(request.getFileName()));
        batch.setTotalCount(parsed.size());
        batch.setSuccessCount(success);
        batch.setFailCount(fail);
        batch.setDuplicateCount(duplicate);
        batch.setTotalAmount(totalAmount);
        batch.setStatus((fail > 0 || duplicate > 0) ? "partial" : "imported");
        batch.setImportedBy(SecurityUtils.getCurrentUserId());
        batch.setImportedAt(LocalDateTime.now());
        cashImportBatchMapper.insert(batch);

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("batchNo", batchNo);
        out.put("successCount", success);
        out.put("failCount", fail);
        out.put("duplicateCount", duplicate);
        out.put("totalAmount", totalAmount);
        return out;
    }

    @Override
    public IPage<FinCashImportBatch> importBatches(Integer pageNum, Integer pageSize) {
        LambdaQueryWrapper<FinCashImportBatch> w = new LambdaQueryWrapper<>();
        if (!canSeeAllBatches()) {
            w.eq(FinCashImportBatch::getImportedBy, SecurityUtils.getCurrentUserId());
        }
        w.orderByDesc(FinCashImportBatch::getImportedAt).orderByDesc(FinCashImportBatch::getId);
        IPage<FinCashImportBatch> page = cashImportBatchMapper.selectPage(new Page<>(pageNum, pageSize), w);
        fillImportedByName(page.getRecords());
        return page;
    }

    @Override
    public Map<String, Object> importBatchDetail(String batchNo) {
        FinCashImportBatch batch = requireBatchAccess(batchNo);
        fillImportedByName(java.util.Collections.singletonList(batch));
        List<FinCashJournal> records = baseMapper.selectList(new LambdaQueryWrapper<FinCashJournal>()
                .eq(FinCashJournal::getImportBatchNo, batchNo)
                .orderByDesc(FinCashJournal::getReceiptDate)
                .orderByDesc(FinCashJournal::getId));
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("batch", batch);
        out.put("records", records);
        return out;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Map<String, Object> rollbackBatch(String batchNo) {
        // 仅 finance_hq/boss/admin
        if (!(SecurityUtils.isCurrentAdmin() || SecurityUtils.hasAnyRole("finance_hq", "boss"))) {
            throw new BusinessException("仅财务负责人/老板/管理员可回滚导入批次");
        }
        if (!StringUtils.hasText(batchNo)) {
            throw new BusinessException("批次号不能为空");
        }
        FinCashImportBatch batch = cashImportBatchMapper.selectOne(new LambdaQueryWrapper<FinCashImportBatch>()
                .eq(FinCashImportBatch::getBatchNo, batchNo).last("LIMIT 1"));
        if (batch == null) {
            throw new BusinessException("导入批次不存在");
        }
        if ("rolledback".equals(batch.getStatus())) {
            throw new BusinessException("该批次已回滚,勿重复操作");
        }
        List<FinCashJournal> records = baseMapper.selectList(new LambdaQueryWrapper<FinCashJournal>()
                .eq(FinCashJournal::getImportBatchNo, batchNo));
        int rolledBack = 0;
        int reviewedSkipped = 0;
        int matchedSkipped = 0;
        int closedSkipped = 0;
        int alreadyVoid = 0;
        for (FinCashJournal row : records) {
            FinCashJournal j = requireJournalForUpdate(row.getId());
            if (RECORD_VOID.equals(j.getRecordStatus())) {
                alreadyVoid++;
                continue;
            }
            if (REVIEW_APPROVED.equals(j.getReviewStatus())) {
                reviewedSkipped++;
                continue;
            }
            if (sumJournalMatched(j.getId()).signum() > 0) {
                matchedSkipped++;
                continue;
            }
            if (cashDailyCloseService.isDateClosed(j.getReceiptDate())) {
                closedSkipped++;
                continue;
            }
            cashAccountService.lockJournalAccount(j);
            String before = cashJournalEventService.snapshot(j);
            j.setRecordStatus(RECORD_VOID);
            j.setReviewStatus(REVIEW_DRAFT);
            syncLegacyStatus(j);
            updateById(j);
            cashJournalEventService.append(j, "void", before, "导入批次 " + batchNo + " 回滚作废", null);
            rolledBack++;
        }
        int skipped = reviewedSkipped + matchedSkipped + closedSkipped;
        String skipSummary = rollbackSkipSummary(reviewedSkipped, matchedSkipped, closedSkipped);
        batch.setStatus(skipped > 0 ? "partial_rollback" : "rolledback");
        String note = "回滚作废 " + rolledBack + " 条"
                + (alreadyVoid > 0 ? ",原已作废 " + alreadyVoid + " 条" : "")
                + (skipped > 0 ? ",未回滚 " + skipped + " 条（" + skipSummary + "）" : "");
        batch.setRemark(appendRemark(batch.getRemark(), note));
        cashImportBatchMapper.updateById(batch);

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("batchNo", batchNo);
        out.put("status", batch.getStatus());
        out.put("rolledBack", rolledBack);
        out.put("skipped", skipped);
        out.put("reviewedSkipped", reviewedSkipped);
        out.put("matchedSkipped", matchedSkipped);
        out.put("closedSkipped", closedSkipped);
        out.put("alreadyVoid", alreadyVoid);
        String message = rolledBack == 0 && skipped == 0
                ? "该批次收款已全部处于作废状态"
                : "已回滚 " + rolledBack + " 条"
                + (skipped > 0 ? ",另有 " + skipped + " 条未回滚（" + skipSummary + "）" : "")
                + (alreadyVoid > 0 ? ",原已作废 " + alreadyVoid + " 条" : "");
        out.put("message", message);
        return out;
    }

    // ---------- 导入:解析/校验 ----------

    private boolean isBlankRow(CashImportRowDTO d) {
        if (d == null) {
            return true;
        }
        return !StringUtils.hasText(d.getReceiptDate())
                && !StringUtils.hasText(d.getReceiptTime())
                && !StringUtils.hasText(d.getAmount())
                && !StringUtils.hasText(d.getPaymentMethod())
                && !StringUtils.hasText(d.getReceiveAccount())
                && !StringUtils.hasText(d.getPayerName())
                && !StringUtils.hasText(d.getPayerPhone())
                && !StringUtils.hasText(d.getCustomerName())
                && !StringUtils.hasText(d.getBizType())
                && !StringUtils.hasText(d.getSalesName())
                && !StringUtils.hasText(d.getSummary())
                && !StringUtils.hasText(d.getBankSerialNo())
                && !StringUtils.hasText(d.getOrderNo())
                && !StringUtils.hasText(d.getRemark());
    }

    private Integer parseRowNo(String raw, int fallback) {
        if (StringUtils.hasText(raw)) {
            try {
                return Integer.parseInt(raw.trim());
            } catch (NumberFormatException ignore) {
                // 用兜底行号
            }
        }
        return fallback;
    }

    /** 逐行归一化 + 硬校验(errors,拦截)+ 软校验(warnings,不拦截),回填解析后值。 */
    private void parseAndValidate(CashImportRowDTO dto,
                                  CashImportRowResult r,
                                  Set<String> allowedMethods,
                                  Set<String> allowedAccounts) {
        r.setPaymentMethod(trim(dto.getPaymentMethod()));
        r.setReceiveAccount(trim(dto.getReceiveAccount()));
        r.setPayerName(trim(dto.getPayerName()));
        r.setPayerPhone(trim(dto.getPayerPhone()));
        r.setCustomerName(trim(dto.getCustomerName()));
        r.setBizType(trim(dto.getBizType()));
        r.setSalesName(trim(dto.getSalesName()));
        r.setSummary(trim(dto.getSummary()));
        r.setBankSerialNo(trim(dto.getBankSerialNo()));
        r.setOrderNo(trim(dto.getOrderNo()));
        r.setRemark(trim(dto.getRemark()));

        // 日期(必填 + 多格式归一化)
        LocalDate d = normalizeDate(dto.getReceiptDate());
        if (!StringUtils.hasText(dto.getReceiptDate())) {
            r.addError("收款日期不能为空");
        } else if (d == null) {
            r.addError("收款日期格式无法识别(支持 2026-07-10 / 2026/7/10 / 2026.7.10)");
        } else {
            r.setReceiptDate(d.toString());
        }

        // 时间(可空)
        String t = normalizeTime(dto.getReceiptTime());
        if (StringUtils.hasText(dto.getReceiptTime()) && t == null) {
            r.addWarning("收款时间格式无法识别,已忽略");
        }
        r.setReceiptTime(t);

        // 金额(必填 > 0,多格式归一化)
        BigDecimal amt = normalizeAmount(dto.getAmount());
        if (!StringUtils.hasText(dto.getAmount())) {
            r.addError("收款金额不能为空");
        } else if (amt == null) {
            r.addError("收款金额格式无法识别");
        } else if (amt.signum() <= 0) {
            r.addError("收款金额必须大于0");
        } else {
            // 小数位 > 2 先按四舍五入归一到 2 位,保证预览合计与入库值一致
            if (amt.scale() > 2) {
                amt = amt.setScale(2, RoundingMode.HALF_UP);
            }
            // 整数位超过 10 位(DECIMAL(12,2) 上限)→ 预览即标错,不进 saveBatch 导致整批回滚
            if (amt.precision() - amt.scale() > 10) {
                r.addError("金额超出可存储范围(整数位不能超过10位)");
            } else {
                r.setAmount(amt);
            }
        }

        // 收款方式(必填 + 白名单)
        if (!StringUtils.hasText(r.getPaymentMethod())) {
            r.addError("收款方式不能为空");
        } else if (!allowedMethods.contains(r.getPaymentMethod())) {
            r.addError("收款方式不在当前启用字典中");
        }

        // 收款账户(必填 + 白名单)
        if (!StringUtils.hasText(r.getReceiveAccount())) {
            r.addError("收款账户不能为空");
        } else if (!allowedAccounts.contains(r.getReceiveAccount())) {
            r.addError("收款账户不在当前启用字典中");
        }

        // 付款方(建议必填,空给 warning 不拦截)
        if (!StringUtils.hasText(r.getPayerName())) {
            r.addWarning("付款方为空,建议补全");
        }

        r.setValid(r.getErrors().isEmpty());
    }

    /** 归一化日期:支持 2026-07-10 / 2026/7/10 / 2026.7.10;含空格(带时间)只取日期段。失败返回 null。 */
    private LocalDate normalizeDate(String s) {
        if (!StringUtils.hasText(s)) {
            return null;
        }
        String v = s.trim();
        int sp = v.indexOf(' ');
        if (sp > 0) {
            v = v.substring(0, sp);
        }
        String[] p = v.split("[./\\-]");
        if (p.length != 3) {
            return null;
        }
        try {
            String yStr = p[0].trim();
            // 年份必须 4 位且落在合理区间,避免 "26.7.10" 被解析成 0026 年入库
            if (yStr.length() != 4) {
                return null;
            }
            int year = Integer.parseInt(yStr);
            if (year < 1900 || year > 2100) {
                return null;
            }
            return LocalDate.of(year,
                    Integer.parseInt(p[1].trim()), Integer.parseInt(p[2].trim()));
        } catch (Exception e) {
            return null;
        }
    }

    /** 归一化时间:HH:mm 或 HH:mm:ss;若传入完整日期时间取空格后段。失败返回 null。 */
    private String normalizeTime(String s) {
        if (!StringUtils.hasText(s)) {
            return null;
        }
        String v = s.trim();
        int sp = v.indexOf(' ');
        if (sp > 0) {
            v = v.substring(sp + 1);
        }
        String[] p = v.split(":");
        if (p.length < 2 || p.length > 3) {
            return null;
        }
        try {
            int h = Integer.parseInt(p[0].trim());
            int mi = Integer.parseInt(p[1].trim());
            int se = p.length == 3 ? Integer.parseInt(p[2].trim()) : 0;
            if (h < 0 || h > 23 || mi < 0 || mi > 59 || se < 0 || se > 59) {
                return null;
            }
            return String.format("%02d:%02d:%02d", h, mi, se);
        } catch (Exception e) {
            return null;
        }
    }

    /** 归一化金额:去 ￥/¥/$/逗号/空格(含全角);失败返回 null。 */
    private BigDecimal normalizeAmount(String s) {
        if (!StringUtils.hasText(s)) {
            return null;
        }
        String v = s.replaceAll("[￥¥$,\\s\\u00A0]", "").trim();
        if (v.isEmpty()) {
            return null;
        }
        try {
            return new BigDecimal(v);
        } catch (Exception e) {
            return null;
        }
    }

    // ---------- 导入:查重(批量高效) ----------

    /** 批量查重：一次性查询候选，再按账户+流水号及日期金额特征逐行 O(1) 判定。 */
    private void applyDuplicateCheck(List<CashImportRowResult> rows) {
        Set<String> serials = new HashSet<>();
        Set<LocalDate> dates = new HashSet<>();
        for (CashImportRowResult r : rows) {
            if (!r.isValid()) {
                continue;
            }
            if (StringUtils.hasText(r.getBankSerialNo())) {
                serials.add(r.getBankSerialNo());
            }
            if (r.getReceiptDate() != null) {
                dates.add(LocalDate.parse(r.getReceiptDate()));
            }
        }

        // 流水号命中(全局一次查询):区分「非作废」与「仅作废」
        Set<String> serialActive = new HashSet<>();
        Set<String> serialVoidOnly = new HashSet<>();
        if (!serials.isEmpty()) {
            List<FinCashJournal> hit = baseMapper.selectList(new LambdaQueryWrapper<FinCashJournal>()
                    .select(FinCashJournal::getReceiveAccount, FinCashJournal::getBankSerialNo,
                            FinCashJournal::getStatus)
                    .in(FinCashJournal::getBankSerialNo, serials));
            Set<String> voidHit = new HashSet<>();
            for (FinCashJournal j : hit) {
                String key = serialAccountKey(j.getReceiveAccount(), j.getBankSerialNo());
                if (STATUS_VOID.equals(j.getStatus())) {
                    voidHit.add(key);
                } else {
                    serialActive.add(key);
                }
            }
            for (String s : voidHit) {
                if (!serialActive.contains(s)) {
                    serialVoidOnly.add(s);
                }
            }
        }

        // 日期+金额+付款方(+摘要)命中(按本批日期一次查询)
        Set<String> dapActive = new HashSet<>();
        Set<String> dapVoid = new HashSet<>();
        Set<String> dapsActive = new HashSet<>();
        if (!dates.isEmpty()) {
            List<FinCashJournal> hit = baseMapper.selectList(new LambdaQueryWrapper<FinCashJournal>()
                    .select(FinCashJournal::getReceiptDate, FinCashJournal::getAmount,
                            FinCashJournal::getPayerName, FinCashJournal::getSummary, FinCashJournal::getStatus)
                    .in(FinCashJournal::getReceiptDate, dates));
            for (FinCashJournal j : hit) {
                String dap = dapKey(j.getReceiptDate(), j.getAmount(), j.getPayerName());
                if (STATUS_VOID.equals(j.getStatus())) {
                    dapVoid.add(dap);
                } else {
                    dapActive.add(dap);
                    dapsActive.add(dap + "|" + norm(j.getSummary()));
                }
            }
        }

        Set<String> seenSerial = new HashSet<>(); // 本批内流水号重复检测
        Set<String> seenDap = new HashSet<>();    // 本批内无流水号行:日期+金额+付款方
        Set<String> seenDaps = new HashSet<>();   // 本批内无流水号行:日期+金额+付款方+摘要
        for (CashImportRowResult r : rows) {
            if (!r.isValid()) {
                continue;
            }
            LocalDate d = LocalDate.parse(r.getReceiptDate());
            String serial = r.getBankSerialNo();
            String serialK = serialAccountKey(r.getReceiveAccount(), serial);
            String dap = dapKey(d, r.getAmount(), r.getPayerName());
            String daps = dap + "|" + norm(r.getSummary());

            if (StringUtils.hasText(serial)) {
                if (serialActive.contains(serialK)) {
                    markDup(r, "duplicate", "银行流水号已存在,疑似重复导入");
                    continue;
                }
                if (seenSerial.contains(serialK)) {
                    markDup(r, "duplicate", "本批内银行流水号重复");
                    continue;
                }
                seenSerial.add(serialK);
                if (serialVoidOnly.contains(serialK)) {
                    markDup(r, "suspect", "流水号命中已作废记录,请人工确认");
                    continue;
                }
                if (dapActive.contains(dap)) {
                    markDup(r, "suspect", "日期+金额+付款方与已有记录相同,疑似重复");
                } else if (dapVoid.contains(dap)) {
                    markDup(r, "suspect", "日期+金额+付款方命中已作废记录,请人工确认");
                }
            } else {
                if (seenDaps.contains(daps)) {
                    markDup(r, "suspect", "本批内无流水号行完全相同(日期+金额+付款方+摘要),疑似重复");
                } else if (dapsActive.contains(daps)) {
                    markDup(r, "suspect", "无流水号,且日期+金额+付款方+摘要与已有记录相同,疑似重复");
                } else if (seenDap.contains(dap)) {
                    markDup(r, "suspect", "本批内无流水号行日期+金额+付款方相同,疑似重复");
                } else if (dapActive.contains(dap)) {
                    markDup(r, "suspect", "无流水号,且日期+金额+付款方与已有记录相同,疑似重复");
                } else if (dapVoid.contains(dap)) {
                    markDup(r, "suspect", "无流水号,命中已作废记录,请人工确认");
                }
                seenDap.add(dap);
                seenDaps.add(daps);
            }
        }
    }

    private void markDup(CashImportRowResult r, String status, String reason) {
        r.setDupStatus(status);
        r.setDupReason(reason);
    }

    private String dapKey(LocalDate d, BigDecimal amt, String payer) {
        return (d == null ? "" : d.toString()) + "|"
                + (amt == null ? "" : amt.stripTrailingZeros().toPlainString()) + "|"
                + norm(payer);
    }

    // ---------- 导入:匹配(客户/销售/报单;distinct 值缓存,不逐行 N 次查库) ----------

    private void applyMatch(List<CashImportRowResult> rows) {
        Map<String, Long> customerCache = new HashMap<>();
        Map<String, Boolean> salesCache = new HashMap<>();
        for (CashImportRowResult r : rows) {
            if (!r.isValid()) {
                continue;
            }
            if (StringUtils.hasText(r.getCustomerName())) {
                Long cid = customerCache.computeIfAbsent(r.getCustomerName(), this::lookupCustomerId);
                r.setCustomerId(cid);
                r.setCustomerMatched(cid != null);
            }
            if (StringUtils.hasText(r.getSalesName())) {
                Boolean sm = salesCache.computeIfAbsent(r.getSalesName(), this::salesExists);
                r.setSalesMatched(Boolean.TRUE.equals(sm));
            }
            if (StringUtils.hasText(r.getOrderNo())) {
                applyOrderMatch(r);
            }
        }
    }

    /** 客户匹配:先精确后模糊(按 crm_customer.name),取最新一条;未命中返回 null。 */
    private Long lookupCustomerId(String name) {
        CrmCustomer exact = crmCustomerMapper.selectOne(new LambdaQueryWrapper<CrmCustomer>()
                .select(CrmCustomer::getId).eq(CrmCustomer::getName, name)
                .orderByDesc(CrmCustomer::getUpdateTime).last("LIMIT 1"));
        if (exact != null) {
            return exact.getId();
        }
        CrmCustomer like = crmCustomerMapper.selectOne(new LambdaQueryWrapper<CrmCustomer>()
                .select(CrmCustomer::getId).like(CrmCustomer::getName, name)
                .orderByDesc(CrmCustomer::getUpdateTime).last("LIMIT 1"));
        return like == null ? null : like.getId();
    }

    /** 销售匹配:org_employee.name 存在即命中。 */
    private Boolean salesExists(String name) {
        Long cnt = orgEmployeeMapper.selectCount(new LambdaQueryWrapper<OrgEmployee>()
                .eq(OrgEmployee::getName, name));
        return cnt != null && cnt > 0;
    }

    /** 报单匹配:尾款/分次付款只要不超过当前未收金额即可识别，不要求等于整单应收。 */
    private void applyOrderMatch(CashImportRowResult r) {
        String no = r.getOrderNo().toUpperCase();
        String bizType = null;
        Long bizId = null;
        for (Map.Entry<String, String> e : ORDER_PREFIX_TO_BIZ.entrySet()) {
            if (no.startsWith(e.getKey())) {
                bizType = e.getValue();
                try {
                    bizId = Long.valueOf(no.substring(e.getKey().length()).trim());
                } catch (NumberFormatException ignore) {
                    bizId = null;
                }
                break;
            }
        }
        if (bizType == null || bizId == null) {
            return; // 单号格式不识别,不匹配(不拦截)
        }
        BigDecimal receivable = orderReceivable(bizType, bizId);
        if (receivable == null) {
            return; // 报单不存在
        }
        BigDecimal already = matchedSums(bizType, Collections.singletonList(bizId))
                .getOrDefault(bizId, BigDecimal.ZERO);
        BigDecimal unpaid = n(receivable).subtract(already).max(BigDecimal.ZERO);
        boolean amtMatched = r.getAmount() != null && r.getAmount().signum() > 0
                && r.getAmount().compareTo(unpaid) <= 0;
        Map<String, Object> mo = new LinkedHashMap<>();
        mo.put("orderNo", prefixOf(bizType) + bizId);
        mo.put("bizType", bizType);
        mo.put("bizTypeLabel", labelOf(bizType));
        mo.put("customerName", orderCustomer(bizType, bizId));
        mo.put("receivableAmount", receivable);
        mo.put("unpaidAmount", unpaid);
        mo.put("amountMatched", amtMatched);
        r.setMatchedOrder(mo);
        r.setOrderMatched(amtMatched); // 金额对得上才算真正匹配
    }

    // ---------- 导入:编号/批次/入库辅助 ----------

    /** 批内按日期连续赋 receiptNo:每个日期只调一次 genReceiptNo 取起始号,组内连续 +1。 */
    private void assignReceiptNos(List<FinCashJournal> list) {
        Map<LocalDate, Integer> nextSeqByDate = new HashMap<>();
        for (FinCashJournal j : list) {
            LocalDate d = j.getReceiptDate();
            Integer next = nextSeqByDate.get(d);
            if (next == null) {
                String first = genReceiptNo(d); // 复用现有唯一编号逻辑取该日期起始号
                int seq = 1;
                try {
                    seq = Integer.parseInt(first.substring(("SK" + d.format(DAY_FMT)).length()));
                } catch (Exception ignore) {
                    seq = 1;
                }
                next = seq;
            }
            j.setReceiptNo("SK" + d.format(DAY_FMT) + String.format("%04d", next));
            nextSeqByDate.put(d, next + 1);
        }
    }

    /** 批次号:IMP+yyyyMMddHHmmss+2位随机;UNIQUE 索引兜底,冲突则重试。 */
    private String genBatchNo() {
        for (int i = 0; i < 5; i++) {
            String no = "IMP" + LocalDateTime.now().format(BATCH_TS_FMT)
                    + String.format("%02d", ThreadLocalRandom.current().nextInt(100));
            Long cnt = cashImportBatchMapper.selectCount(new LambdaQueryWrapper<FinCashImportBatch>()
                    .eq(FinCashImportBatch::getBatchNo, no));
            if (cnt == null || cnt == 0) {
                return no;
            }
        }
        return "IMP" + LocalDateTime.now().format(BATCH_TS_FMT)
                + String.format("%02d", ThreadLocalRandom.current().nextInt(100))
                + (System.nanoTime() % 10);
    }

    private String normImportType(String t) {
        String v = t == null ? "" : t.trim().toLowerCase();
        return ("paste".equals(v) || "excel".equals(v) || "csv".equals(v)) ? v : "paste";
    }

    /** 导入行的辅助信息(业务类型/销售/报单)折进备注,避免丢失(fin_cash_journal 无这些专列)。 */
    private String buildImportRemark(CashImportRowResult r) {
        List<String> extras = new ArrayList<>();
        if (StringUtils.hasText(r.getBizType())) {
            extras.add("业务类型:" + r.getBizType());
        }
        if (StringUtils.hasText(r.getSalesName())) {
            extras.add("销售:" + r.getSalesName());
        }
        if (StringUtils.hasText(r.getOrderNo())) {
            extras.add("报单:" + r.getOrderNo());
        }
        StringBuilder sb = new StringBuilder();
        if (StringUtils.hasText(r.getRemark())) {
            sb.append(r.getRemark());
        }
        if (!extras.isEmpty()) {
            if (sb.length() > 0) {
                sb.append(" | ");
            }
            sb.append("[导入] ").append(String.join(" ", extras));
        }
        String s = sb.toString();
        return s.isEmpty() ? null : s;
    }

    private boolean canSeeAllBatches() {
        return SecurityUtils.isCurrentAdmin() || SecurityUtils.hasAnyRole("finance_hq", "boss");
    }

    private FinCashImportBatch requireBatchAccess(String batchNo) {
        if (!StringUtils.hasText(batchNo)) {
            throw new BusinessException("批次号不能为空");
        }
        FinCashImportBatch batch = cashImportBatchMapper.selectOne(new LambdaQueryWrapper<FinCashImportBatch>()
                .eq(FinCashImportBatch::getBatchNo, batchNo).last("LIMIT 1"));
        if (batch == null) {
            throw new BusinessException("导入批次不存在");
        }
        if (!canSeeAllBatches()) {
            Long uid = SecurityUtils.getCurrentUserId();
            if (uid == null || !uid.equals(batch.getImportedBy())) {
                throw new BusinessException("无权访问该导入批次");
            }
        }
        return batch;
    }

    /** 批量按 importedBy 联 sys_user 回填导入人姓名(nickname 优先,退回 username),供前端显示。 */
    private void fillImportedByName(List<FinCashImportBatch> batches) {
        if (batches == null || batches.isEmpty()) {
            return;
        }
        List<Long> ids = batches.stream().map(FinCashImportBatch::getImportedBy)
                .filter(Objects::nonNull).distinct().collect(Collectors.toList());
        if (ids.isEmpty()) {
            return;
        }
        Map<Long, String> nameMap = new HashMap<>();
        for (SysUser u : sysUserMapper.selectBatchIds(ids)) {
            nameMap.put(u.getId(), StringUtils.hasText(u.getNickname()) ? u.getNickname() : u.getUsername());
        }
        for (FinCashImportBatch b : batches) {
            if (b.getImportedBy() != null) {
                b.setImportedByName(nameMap.get(b.getImportedBy()));
            }
        }
    }

    private String appendRemark(String old, String add) {
        if (!StringUtils.hasText(old)) {
            return add.length() > 500 ? add.substring(0, 500) : add;
        }
        String s = old + " | " + add;
        return s.length() > 500 ? s.substring(0, 500) : s;
    }

    private String rollbackSkipSummary(int reviewed, int matched, int closed) {
        List<String> reasons = new ArrayList<>();
        if (reviewed > 0) reasons.add("已审核 " + reviewed + " 条");
        if (matched > 0) reasons.add("已核销 " + matched + " 条");
        if (closed > 0) reasons.add("已日结 " + closed + " 条");
        return String.join("、", reasons);
    }

    private String norm(String s) {
        return s == null ? "" : s.trim();
    }

    private String trim(String s) {
        return s == null ? null : s.trim();
    }

    /** 流水号比较口径:与 DB(utf8mb4_unicode_ci + 尾空格 padding)对齐 → trim + 大写。 */
    private String serialKey(String s) {
        return s == null ? null : s.trim().toUpperCase();
    }

    private String serialAccountKey(String receiveAccount, String serialNo) {
        return norm(receiveAccount).toUpperCase() + "|" + serialKey(serialNo);
    }

    // ============================== 内部工具 =================================

    private FinCashJournal requireJournalAccess(Long id) {
        if (id == null) {
            throw new BusinessException("收款记录不存在");
        }
        FinCashJournal j = getById(id);
        if (j == null) {
            throw new BusinessException("收款记录不存在");
        }
        ensureV3Defaults(j);
        if (!canReview() && !dataScopeHelper.canAccess(j.getOwnerId(), j.getOwnerDeptId())) {
            throw new BusinessException("无权访问该收款记录");
        }
        return j;
    }

    private FinCashJournal requireJournalForUpdate(Long id) {
        if (id == null) {
            throw new BusinessException("收款记录不存在");
        }
        FinCashJournal journal = baseMapper.selectForUpdate(id);
        if (journal == null) {
            throw new BusinessException("收款记录不存在");
        }
        ensureV3Defaults(journal);
        if (!canReview() && !dataScopeHelper.canAccess(journal.getOwnerId(), journal.getOwnerDeptId())) {
            throw new BusinessException("无权操作该收款记录");
        }
        return journal;
    }

    private boolean canReview() {
        return SecurityUtils.isCurrentAdmin() || SecurityUtils.hasAnyRole("finance_hq", "boss");
    }

    /** 金额事实永远按有效核销重新计算，不信任前端传入的汇总字段。 */
    private void recomputeJournal(FinCashJournal j) {
        BigDecimal matched = sumJournalMatched(j.getId());
        BigDecimal amount = n(j.getAmount());
        BigDecimal unmatched = amount.subtract(matched);
        if (unmatched.signum() < 0) {
            unmatched = BigDecimal.ZERO;
        }
        j.setMatchedAmount(matched);
        j.setUnmatchedAmount(unmatched);
        if (matched.signum() == 0) {
            j.setMatchStatus(STATUS_WAITING);
        } else if (matched.compareTo(amount) >= 0) {
            j.setMatchStatus(STATUS_MATCHED);
        } else {
            j.setMatchStatus(STATUS_PARTIAL);
        }
    }

    /** 某收款有效核销合计；取消记录保留但不再计入。 */
    private BigDecimal sumJournalMatched(Long journalId) {
        if (journalId == null) {
            return BigDecimal.ZERO;
        }
        List<FinCashMatch> ms = cashMatchMapper.selectList(new LambdaQueryWrapper<FinCashMatch>()
                .eq(FinCashMatch::getJournalId, journalId)
                .and(w -> w.eq(FinCashMatch::getMatchStatus, MATCH_ACTIVE)
                        .or().isNull(FinCashMatch::getMatchStatus)));
        return ms.stream().map(m -> n(m.getMatchedAmount())).reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /** 某类报单一批ID的已匹配合计(key=bizId)。 */
    private Map<Long, BigDecimal> matchedSums(String bizType, List<Long> ids) {
        Map<Long, BigDecimal> map = new HashMap<>();
        if (ids == null || ids.isEmpty()) {
            return map;
        }
        List<FinCashMatch> ms = cashMatchMapper.selectList(new LambdaQueryWrapper<FinCashMatch>()
                .eq(FinCashMatch::getBizType, bizType)
                .in(FinCashMatch::getBizId, ids)
                .and(w -> w.eq(FinCashMatch::getMatchStatus, MATCH_ACTIVE)
                        .or().isNull(FinCashMatch::getMatchStatus)));
        for (FinCashMatch m : ms) {
            map.merge(m.getBizId(), n(m.getMatchedAmount()), BigDecimal::add);
        }
        return map;
    }

    /** 报单应收金额(各表不同列)。报单不存在返回 null。 */
    private BigDecimal orderReceivable(String bizType, Long bizId) {
        switch (bizType) {
            case BIZ_BOOKKEEPING: {
                BizBookkeepingOrder o = bookkeepingOrderMapper.selectById(bizId);
                return o == null ? null : n(firstNonNull(o.getContractAmount(), o.getBookkeepingAmount()));
            }
            case BIZ_ADDRESS: {
                BizAddressOrder o = addressOrderMapper.selectById(bizId);
                return o == null ? null : n(o.getCollectTotal());
            }
            case BIZ_GS: {
                BizGsOrder o = gsOrderMapper.selectById(bizId);
                return o == null ? null : n(o.getFee());
            }
            case BIZ_SEAL: {
                BizSealOrder o = sealOrderMapper.selectById(bizId);
                return o == null ? null : n(o.getFee());
            }
            case BIZ_RECEIVABLE: {
                FinReceivableRenewal o = receivableRenewalMapper.selectById(bizId);
                if (o == null) {
                    return null;
                }
                return n(o.getReceivableAmount()).subtract(n(o.getLegacyReceivedAmount())).max(BigDecimal.ZERO);
            }
            default:
                return null;
        }
    }

    /** 报单客户名(核销落库快照兜底)。 */
    private String orderCustomer(String bizType, Long bizId) {
        switch (bizType) {
            case BIZ_BOOKKEEPING: {
                BizBookkeepingOrder o = bookkeepingOrderMapper.selectById(bizId);
                return o == null ? null : o.getCompanyName();
            }
            case BIZ_ADDRESS: {
                BizAddressOrder o = addressOrderMapper.selectById(bizId);
                return o == null ? null : o.getCompanyName();
            }
            case BIZ_GS: {
                BizGsOrder o = gsOrderMapper.selectById(bizId);
                return o == null ? null : o.getCompanyName();
            }
            case BIZ_SEAL: {
                BizSealOrder o = sealOrderMapper.selectById(bizId);
                return o == null ? null : o.getCompanyName();
            }
            case BIZ_RECEIVABLE: {
                FinReceivableRenewal o = receivableRenewalMapper.selectById(bizId);
                return o == null ? null : o.getCustomerName();
            }
            default:
                return null;
        }
    }

    private boolean isValidBizType(String bizType) {
        return BIZ_BOOKKEEPING.equals(bizType) || BIZ_ADDRESS.equals(bizType)
                || BIZ_GS.equals(bizType) || BIZ_SEAL.equals(bizType)
                || BIZ_RECEIVABLE.equals(bizType);
    }

    private String labelOf(String bizType) {
        if (bizType == null) {
            return null;
        }
        switch (bizType) {
            case BIZ_BOOKKEEPING: return "代账";
            case BIZ_ADDRESS: return "地址";
            case BIZ_GS: return "工商";
            case BIZ_SEAL: return "刻章";
            case BIZ_RECEIVABLE: return "回款续费";
            default: return bizType;
        }
    }

    private String prefixOf(String bizType) {
        if (bizType == null) {
            return "";
        }
        switch (bizType) {
            case BIZ_BOOKKEEPING: return "BK-";
            case BIZ_ADDRESS: return "AD-";
            case BIZ_GS: return "GS-";
            case BIZ_SEAL: return "SL-";
            case BIZ_RECEIVABLE: return "RR-";
            default: return "";
        }
    }

    private void lockBusinessTarget(String bizType, Long bizId) {
        Object locked;
        switch (bizType) {
            case BIZ_BOOKKEEPING: locked = cashMatchMapper.lockBookkeeping(bizId); break;
            case BIZ_ADDRESS: locked = cashMatchMapper.lockAddress(bizId); break;
            case BIZ_GS: locked = cashMatchMapper.lockGs(bizId); break;
            case BIZ_SEAL: locked = cashMatchMapper.lockSeal(bizId); break;
            case BIZ_RECEIVABLE: locked = receivableRenewalMapper.selectForUpdate(bizId); break;
            default: locked = null;
        }
        if (locked == null) {
            throw new BusinessException("核销目标不存在:" + bizType + "#" + bizId);
        }
    }

    /** 回款续费实收 = V3上线前历史基线 + 当前有效日记账核销。 */
    private void recomputeReceivableFromCash(Long receivableId,
                                             FinCashMatch match,
                                             FinCashJournal journal,
                                             boolean reversal) {
        FinReceivableRenewal receivable = receivableRenewalMapper.selectById(receivableId);
        if (receivable == null) {
            throw new BusinessException("回款续费应收不存在");
        }
        String beforeCollectionStatus = receivable.getCollectionStatus();
        if (reversal && "legacy_link".equals(match.getMatchMethod())) {
            receivable.setLegacyReceivedAmount(n(receivable.getLegacyReceivedAmount()).add(n(match.getMatchedAmount())));
            receivableRenewalMapper.updateById(receivable);
            receivableLogMapper.restoreLegacyLink(match.getId(),
                    "历史回款关联已撤销，金额恢复为 legacy 基线；原因：" + match.getCancelReason());
        }
        BigDecimal linked = matchedSums(BIZ_RECEIVABLE, Collections.singletonList(receivableId))
                .getOrDefault(receivableId, BigDecimal.ZERO);
        BigDecimal received = n(receivable.getLegacyReceivedAmount()).add(linked);
        BigDecimal total = n(receivable.getReceivableAmount());
        if (received.compareTo(total) > 0) {
            throw new BusinessException("关联后实收将超过应收金额");
        }
        BigDecimal arrears = total.subtract(received).max(BigDecimal.ZERO);
        receivable.setReceivedAmount(received);
        receivable.setArrearsAmount(arrears);
        boolean overdue = receivable.getDueDate() != null && receivable.getDueDate().isBefore(LocalDate.now())
                && arrears.signum() > 0;
        if (arrears.signum() == 0) {
            receivable.setReceivableStatus(2);
            receivable.setCollectionStatus("已付款");
            receivable.setNextCollectionTime(null);
        } else if (overdue) {
            receivable.setReceivableStatus(3);
            if ("已付款".equals(receivable.getCollectionStatus())) {
                receivable.setCollectionStatus("已催");
            }
        } else if (received.signum() > 0) {
            receivable.setReceivableStatus(1);
            if ("已付款".equals(receivable.getCollectionStatus())) {
                receivable.setCollectionStatus("已催");
            }
        } else {
            receivable.setReceivableStatus(0);
        }
        receivableRenewalMapper.updateById(receivable);

        FinReceivableCollectionLog log = new FinReceivableCollectionLog();
        log.setReceivableId(receivableId);
        log.setCashJournalId(journal.getId());
        log.setCashMatchId(match.getId());
        log.setSourceType(reversal ? "reversal" : "cash_journal");
        log.setActionType(reversal ? "反核销回退" : "记录收款");
        log.setActionTime(LocalDateTime.now());
        log.setOperatorId(SecurityUtils.getCurrentUserId());
        log.setOperatorName(currentActorName());
        log.setBeforeStatus(beforeCollectionStatus);
        log.setAfterStatus(receivable.getCollectionStatus());
        log.setPaymentAmount(reversal ? n(match.getMatchedAmount()).negate() : n(match.getMatchedAmount()));
        log.setReceivedAfter(received);
        log.setArrearsAfter(arrears);
        log.setNextCollectionTime(receivable.getNextCollectionTime());
        log.setContent((reversal ? "反核销回退 " : "关联收款日记账核销 ")
                + n(match.getMatchedAmount()) + " 元，收款编号 " + journal.getReceiptNo()
                + (reversal ? "，原因：" + match.getCancelReason() : ""));
        receivableLogMapper.insert(log);
    }

    private void validateJournal(FinCashJournal entity) {
        if (entity.getReceiptDate() == null) {
            throw new BusinessException("收款日期不能为空");
        }
        if (n(entity.getAmount()).signum() <= 0) {
            throw new BusinessException("收款金额必须大于0");
        }
        if (!StringUtils.hasText(entity.getPaymentMethod())) {
            throw new BusinessException("收款方式不能为空");
        }
        if (!StringUtils.hasText(entity.getReceiveAccount())) {
            throw new BusinessException("收款账户不能为空");
        }
        if (cashAccountService.isDisabledAccountName(entity.getReceiveAccount())) {
            throw new BusinessException("所选资金账户已停用");
        }
        if (!enabledDictValues("payment_method", ALLOWED_METHODS).contains(entity.getPaymentMethod().trim())) {
            throw new BusinessException("收款方式不在当前启用字典中");
        }
        if (!enabledDictValues("receive_account", ALLOWED_ACCOUNTS).contains(entity.getReceiveAccount().trim())
                && !cashAccountService.isActiveAccountName(entity.getReceiveAccount())) {
            throw new BusinessException("收款账户不在当前启用字典中");
        }
    }

    private Set<String> enabledDictValues(String dictType, Set<String> fallback) {
        List<SysDictData> rows;
        try {
            rows = dictDataService.listEnabledByType(dictType);
        } catch (BadSqlGrammarException ex) {
            if (ex.getSQLException() == null || ex.getSQLException().getErrorCode() != 1146) {
                throw ex;
            }
            log.warn("收款字典表尚未建立，使用内置兜底值: dictType={}", dictType);
            return fallback;
        }
        Set<String> values = rows == null ? new HashSet<>() : rows.stream()
                .map(SysDictData::getDictValue)
                .filter(StringUtils::hasText)
                .map(String::trim)
                .collect(Collectors.toSet());
        return values.isEmpty() ? fallback : values;
    }

    private void rejectDuplicateSerial(FinCashJournal entity) {
        if (!StringUtils.hasText(entity.getBankSerialNo())) {
            return;
        }
        LambdaQueryWrapper<FinCashJournal> wrapper = new LambdaQueryWrapper<FinCashJournal>()
                .eq(FinCashJournal::getBankSerialNo, entity.getBankSerialNo().trim())
                .eq(FinCashJournal::getReceiveAccount, entity.getReceiveAccount())
                .eq(FinCashJournal::getRecordStatus, RECORD_ACTIVE)
                .ne(entity.getId() != null, FinCashJournal::getId, entity.getId());
        if (baseMapper.selectCount(wrapper) > 0) {
            throw new BusinessException("该收款账户下银行流水号已存在，请勿重复登记");
        }
    }

    private void fillJournalOwner(FinCashJournal journal, Long ownerId) {
        journal.setOwnerId(ownerId);
        journal.setOwnerName(null);
        journal.setOwnerDeptId(null);
        if (ownerId == null) {
            return;
        }
        SysUser user = sysUserMapper.selectById(ownerId);
        if (user != null) {
            journal.setOwnerName(StringUtils.hasText(user.getNickname()) ? user.getNickname() : user.getUsername());
            journal.setOwnerDeptId(user.getDeptId());
        }
    }

    private void fillJournalOwnerNames(List<FinCashJournal> journals) {
        if (journals == null || journals.isEmpty()) {
            return;
        }
        List<Long> userIds = journals.stream()
                .map(j -> j.getOwnerId() != null ? j.getOwnerId() : j.getCreateBy())
                .filter(Objects::nonNull).distinct().collect(Collectors.toList());
        if (userIds.isEmpty()) {
            return;
        }
        Map<Long, SysUser> users = sysUserMapper.selectBatchIds(userIds).stream()
                .collect(Collectors.toMap(SysUser::getId, Function.identity()));
        for (FinCashJournal journal : journals) {
            Long ownerId = journal.getOwnerId() != null ? journal.getOwnerId() : journal.getCreateBy();
            SysUser user = users.get(ownerId);
            if (journal.getOwnerId() == null) {
                journal.setOwnerId(ownerId);
            }
            if (!StringUtils.hasText(journal.getOwnerName()) && user != null) {
                journal.setOwnerName(StringUtils.hasText(user.getNickname()) ? user.getNickname() : user.getUsername());
                journal.setOwnerDeptId(user.getDeptId());
            }
        }
    }

    private void assertMutable(FinCashJournal journal, String action) {
        assertActive(journal);
        assertDateOpen(journal.getReceiptDate());
        if (REVIEW_APPROVED.equals(journal.getReviewStatus())) {
            throw new BusinessException("已审核收款必须先反审核才能" + action);
        }
        if (REVIEW_PENDING.equals(journal.getReviewStatus())) {
            throw new BusinessException("待审核收款不能" + action + "，请先由审核人驳回");
        }
    }

    private void assertActive(FinCashJournal journal) {
        if (RECORD_VOID.equals(journal.getRecordStatus())) {
            throw new BusinessException("已作废收款不能继续操作");
        }
    }

    private void assertDateOpen(LocalDate receiptDate) {
        cashDailyCloseService.assertDateOpenForUpdate(receiptDate);
    }

    private void assertDatesOpen(LocalDate... dates) {
        Set<LocalDate> ordered = new TreeSet<>();
        if (dates != null) {
            for (LocalDate date : dates) {
                if (date != null) {
                    ordered.add(date);
                }
            }
        }
        for (LocalDate date : ordered) {
            assertDateOpen(date);
        }
    }

    private void ensureV3Defaults(FinCashJournal journal) {
        if (!StringUtils.hasText(journal.getRecordStatus())) {
            journal.setRecordStatus(STATUS_VOID.equals(journal.getStatus()) ? RECORD_VOID : RECORD_ACTIVE);
        }
        if (!StringUtils.hasText(journal.getMatchStatus())) {
            BigDecimal matched = n(journal.getMatchedAmount());
            journal.setMatchStatus(matched.signum() == 0 ? STATUS_WAITING
                    : matched.compareTo(n(journal.getAmount())) >= 0 ? STATUS_MATCHED : STATUS_PARTIAL);
        }
        if (!StringUtils.hasText(journal.getReviewStatus())) {
            journal.setReviewStatus(STATUS_REVIEWED.equals(journal.getStatus()) ? REVIEW_APPROVED : REVIEW_DRAFT);
        }
        if (!StringUtils.hasText(journal.getExceptionStatus())) {
            journal.setExceptionStatus(EXCEPTION_NONE);
        }
        if (!StringUtils.hasText(journal.getFundNature())) {
            journal.setFundNature(n(journal.getMatchedAmount()).signum() > 0 ? FUND_BUSINESS : FUND_UNKNOWN);
        }
        if (!StringUtils.hasText(journal.getSourceType())) {
            journal.setSourceType(StringUtils.hasText(journal.getImportBatchNo()) ? "import" : "manual");
        }
        if (journal.getVersion() == null) {
            journal.setVersion(0);
        }
    }

    private void syncLegacyStatus(FinCashJournal journal) {
        if (RECORD_VOID.equals(journal.getRecordStatus())) {
            journal.setStatus(STATUS_VOID);
        } else if (REVIEW_APPROVED.equals(journal.getReviewStatus())) {
            journal.setStatus(STATUS_REVIEWED);
        } else {
            journal.setStatus(StringUtils.hasText(journal.getMatchStatus()) ? journal.getMatchStatus() : STATUS_WAITING);
        }
    }

    private void syncAutomaticException(FinCashJournal journal) {
        if (!StringUtils.hasText(journal.getPayerName())) {
            cashExceptionService.ensureSystemCase(journal, null, "付款方不明", "P0", "system",
                    "到账金额存在，但付款方为空");
            return;
        }
        if (FUND_BUSINESS.equals(journal.getFundNature()) && journal.getCustomerId() == null
                && !StringUtils.hasText(journal.getCustomerName())) {
            cashExceptionService.ensureSystemCase(journal, null, "客户不匹配", "P1", "system",
                    "业务款尚未关联客户");
            return;
        }
        if (!StringUtils.hasText(journal.getVoucherFile()) || "[]".equals(journal.getVoucherFile().trim())) {
            cashExceptionService.ensureSystemCase(journal, null, "无凭证", "P2", "system",
                    "收款尚未上传凭证");
            return;
        }
        cashExceptionService.resolveSystemJournalCase(journal.getId(), "付款方、客户与凭证已补全");
    }

    private String validFundNature(String value) {
        String nature = StringUtils.hasText(value) ? value.trim() : FUND_BUSINESS;
        if (!Set.of("business", "prepayment", "deposit", "intercompany", "refund_return", "unknown", "other")
                .contains(nature)) {
            throw new BusinessException("资金性质不合法");
        }
        return nature;
    }

    private String validSourceType(String value) {
        String source = StringUtils.hasText(value) ? value.trim() : "manual";
        return Set.of("manual", "paste", "excel", "csv", "bank", "receivable", "import").contains(source)
                ? source : "manual";
    }

    private void assertSameMatchRequest(Long journalId,
                                        Map<String, CashMatchItemDTO> expectedItems,
                                        List<FinCashMatch> existingMatches) {
        Map<String, BigDecimal> actualAmounts = new LinkedHashMap<>();
        for (FinCashMatch match : existingMatches) {
            if (!Objects.equals(journalId, match.getJournalId())) {
                throw new BusinessException("核销请求号已被其他收款使用，请刷新后重试");
            }
            String key = match.getBizType() + "|" + match.getBizId();
            actualAmounts.merge(key, n(match.getMatchedAmount()), BigDecimal::add);
        }
        if (actualAmounts.size() != expectedItems.size()) {
            throw new BusinessException("核销请求号已使用且提交内容不一致，请刷新后重试");
        }
        for (Map.Entry<String, CashMatchItemDTO> entry : expectedItems.entrySet()) {
            BigDecimal actual = actualAmounts.get(entry.getKey());
            if (actual == null || actual.compareTo(n(entry.getValue().getMatchedAmount())) != 0) {
                throw new BusinessException("核销请求号已使用且提交内容不一致，请刷新后重试");
            }
        }
    }

    private String validMatchMethod(String value, CashMatchItemDTO item) {
        String method = StringUtils.hasText(value) ? value.trim()
                : item.getConfidenceScore() != null ? "recommended" : "manual";
        return Set.of("manual", "recommended", "import", "receivable", "legacy_link").contains(method) ? method : "manual";
    }

    private String requireReason(CashActionRequest request, String message) {
        String reason = request == null ? null : request.getReason();
        if (!StringUtils.hasText(reason)) {
            throw new BusinessException(message);
        }
        return reason.trim();
    }

    private String appendText(String old, String add, int maxLength) {
        String value = StringUtils.hasText(old) ? old + " | " + add : add;
        return value.length() > maxLength ? value.substring(0, maxLength) : value;
    }

    private String toJson(Object value) {
        if (value == null) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException ignore) {
            return null;
        }
    }

    private String currentActorName() {
        Long uid = SecurityUtils.getCurrentUserId();
        SysUser user = uid == null ? null : sysUserMapper.selectById(uid);
        if (user != null) {
            return StringUtils.hasText(user.getNickname()) ? user.getNickname() : user.getUsername();
        }
        return SecurityUtils.getCurrentUsername();
    }

    private CashWorkbenchTaskVO cashTask(FinCashJournal row,
                                          String priority,
                                          String taskType,
                                          String title,
                                          String reason,
                                          String action) {
        CashWorkbenchTaskVO task = new CashWorkbenchTaskVO();
        task.setTaskKey("cash:" + taskType + ":" + row.getId());
        task.setSourceType("cash");
        task.setSourceId(row.getId());
        task.setJournalId(row.getId());
        task.setPriority(priority);
        task.setTaskType(taskType);
        task.setTitle(title);
        task.setReason(reason);
        task.setAmount(row.getUnmatchedAmount());
        task.setOwnerId(row.getOwnerId());
        task.setOwnerName(row.getOwnerName());
        task.setDeadline(REVIEW_PENDING.equals(row.getReviewStatus()) ? row.getSubmittedAt() : null);
        task.setAction(action);
        return task;
    }

    private void putTask(Map<String, CashWorkbenchTaskVO> tasks, CashWorkbenchTaskVO task) {
        tasks.putIfAbsent(task.getTaskKey(), task);
    }

    private int priorityRank(String priority) {
        if ("P0".equals(priority)) return 0;
        if ("P1".equals(priority)) return 1;
        return 2;
    }

    private <T> List<Long> idsOf(List<T> list, Function<T, Long> idGetter) {
        return list.stream().map(idGetter).filter(Objects::nonNull).collect(Collectors.toList());
    }

    private BigDecimal firstNonNull(BigDecimal a, BigDecimal b) {
        return a != null ? a : b;
    }

    private LocalDate dateOf(LocalDateTime dt) {
        return dt == null ? null : dt.toLocalDate();
    }

    private BigDecimal n(BigDecimal val) {
        return val == null ? BigDecimal.ZERO : val;
    }

    private int ni(Integer value) {
        return value == null ? 0 : value;
    }

}
