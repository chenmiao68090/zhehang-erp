package com.zhehang.erp.modules.finance.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.annotation.AllowDuringImpersonationRead;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.finance.domain.dto.CashActionRequest;
import com.zhehang.erp.modules.finance.domain.dto.CashAccountAdjustmentRequest;
import com.zhehang.erp.modules.finance.domain.dto.CashAccountRequest;
import com.zhehang.erp.modules.finance.domain.dto.CashBalanceResolveRequest;
import com.zhehang.erp.modules.finance.domain.dto.CashBalanceSnapshotRequest;
import com.zhehang.erp.modules.finance.domain.dto.CashDailyCloseSubmitRequest;
import com.zhehang.erp.modules.finance.domain.dto.CashExceptionActionRequest;
import com.zhehang.erp.modules.finance.domain.dto.CashImportPreviewResult;
import com.zhehang.erp.modules.finance.domain.dto.CashImportRequest;
import com.zhehang.erp.modules.finance.domain.dto.CashJournalQuery;
import com.zhehang.erp.modules.finance.domain.dto.CashMatchRequest;
import com.zhehang.erp.modules.finance.domain.dto.CashMatchRuleRequest;
import com.zhehang.erp.modules.finance.domain.dto.CashMatchRuleSimulationRequest;
import com.zhehang.erp.modules.finance.domain.dto.CashLegacyLinkRequest;
import com.zhehang.erp.modules.finance.domain.dto.CashPayerAliasRequest;
import com.zhehang.erp.modules.finance.domain.dto.CashReconcileRequest;
import com.zhehang.erp.modules.finance.domain.dto.CashReconcileResolveRequest;
import com.zhehang.erp.modules.finance.domain.dto.CashSavedViewRequest;
import com.zhehang.erp.modules.finance.domain.entity.FinCashDailyClose;
import com.zhehang.erp.modules.finance.domain.entity.FinCashAccount;
import com.zhehang.erp.modules.finance.domain.entity.FinCashAccountAdjustment;
import com.zhehang.erp.modules.finance.domain.entity.FinCashBalanceSnapshot;
import com.zhehang.erp.modules.finance.domain.entity.FinCashExceptionCase;
import com.zhehang.erp.modules.finance.domain.entity.FinCashExceptionEvent;
import com.zhehang.erp.modules.finance.domain.entity.FinCashImportBatch;
import com.zhehang.erp.modules.finance.domain.entity.FinCashJournal;
import com.zhehang.erp.modules.finance.domain.entity.FinCashMatch;
import com.zhehang.erp.modules.finance.domain.entity.FinCashMatchRuleConfig;
import com.zhehang.erp.modules.finance.domain.entity.FinCashMatchRuleEvent;
import com.zhehang.erp.modules.finance.domain.entity.FinCashPayerAlias;
import com.zhehang.erp.modules.finance.domain.entity.FinCashReconcileBatch;
import com.zhehang.erp.modules.finance.domain.entity.FinCashSavedView;
import com.zhehang.erp.modules.finance.domain.vo.CashCustomerOptionVO;
import com.zhehang.erp.modules.finance.domain.vo.CashAccountLedgerVO;
import com.zhehang.erp.modules.finance.domain.vo.CashAccountOptionVO;
import com.zhehang.erp.modules.finance.domain.vo.CashAccountSummaryVO;
import com.zhehang.erp.modules.finance.domain.vo.CashJournalDetailVO;
import com.zhehang.erp.modules.finance.domain.vo.MatchableOrderVO;
import com.zhehang.erp.modules.finance.domain.vo.CashLegacyReceiptVO;
import com.zhehang.erp.modules.finance.domain.vo.CashReconcilePreviewVO;
import com.zhehang.erp.modules.finance.mapper.FinCashJournalMapper;
import com.zhehang.erp.modules.finance.service.ICashJournalService;
import com.zhehang.erp.modules.finance.service.impl.CashDailyCloseService;
import com.zhehang.erp.modules.finance.service.impl.CashAccountService;
import com.zhehang.erp.modules.finance.service.impl.CashExceptionService;
import com.zhehang.erp.modules.finance.service.impl.CashLegacyGovernanceService;
import com.zhehang.erp.modules.finance.service.impl.CashMonthlyReportService;
import com.zhehang.erp.modules.finance.service.impl.CashMatchRuleService;
import com.zhehang.erp.modules.finance.service.impl.CashPayerAliasService;
import com.zhehang.erp.modules.finance.service.impl.CashReconcileService;
import com.zhehang.erp.modules.finance.service.impl.CashSavedViewService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/** 财务日记账 / 收款登记模块。收款入账 + 核销到 4 张业务报单。 */
@RestController
@RequestMapping("/finance/cash-journal")
@RequiredArgsConstructor
@PreAuthorize("@perm.hasPermission('finance:cash-journal:list')")
public class CashJournalController {

    private final ICashJournalService cashJournalService;
    private final FinCashJournalMapper cashJournalMapper;
    private final CashExceptionService cashExceptionService;
    private final CashDailyCloseService cashDailyCloseService;
    private final CashAccountService cashAccountService;
    private final CashMatchRuleService cashMatchRuleService;
    private final CashPayerAliasService payerAliasService;
    private final CashSavedViewService savedViewService;
    private final CashMonthlyReportService monthlyReportService;
    private final CashLegacyGovernanceService legacyGovernanceService;
    private final CashReconcileService reconcileService;

    /** 1. 收款日记账列表(多条件筛选 + 数据范围 + 收款日期倒序)。 */
    @GetMapping("/list")
    public R<IPage<FinCashJournal>> list(CashJournalQuery query) {
        return R.ok(cashJournalService.selectPage(query));
    }

    /** 2. 新增/编辑收款日记账。 */
    @PostMapping("/save")
    @Log(module = "收款日记账", type = Log.OperationType.INSERT)
    public R<Long> save(@RequestBody FinCashJournal entity) {
        return R.ok(cashJournalService.saveJournal(entity));
    }

    /** 3. 作废(同时反核销其已有匹配)。 */
    @PostMapping("/void/{id}")
    @Log(module = "收款日记账", type = Log.OperationType.UPDATE)
    public R<Void> voidJournal(@PathVariable Long id,
                               @RequestBody(required = false) CashActionRequest request) {
        cashJournalService.voidJournal(id, request);
        return R.ok();
    }

    /** 4. 提交审核。 */
    @PostMapping("/{id}/submit-review")
    @Log(module = "收款日记账", type = Log.OperationType.UPDATE)
    public R<Void> submitReview(@PathVariable Long id,
                                @RequestBody(required = false) CashActionRequest request) {
        cashJournalService.submitReview(id, request);
        return R.ok();
    }

    /** 5. 审核通过(finance_hq/boss/admin)。 */
    @PostMapping("/review/{id}")
    @Log(module = "收款日记账", type = Log.OperationType.UPDATE)
    public R<Void> review(@PathVariable Long id,
                          @RequestBody(required = false) CashActionRequest request) {
        cashJournalService.review(id, request);
        return R.ok();
    }

    @PostMapping("/{id}/reject-review")
    @Log(module = "收款日记账", type = Log.OperationType.UPDATE)
    public R<Void> rejectReview(@PathVariable Long id, @RequestBody CashActionRequest request) {
        cashJournalService.rejectReview(id, request);
        return R.ok();
    }

    @PostMapping("/{id}/reverse-review")
    @Log(module = "收款日记账", type = Log.OperationType.UPDATE)
    public R<Void> reverseReview(@PathVariable Long id, @RequestBody CashActionRequest request) {
        cashJournalService.reverseReview(id, request);
        return R.ok();
    }

    /** 5. 可核销报单(4 张报单归一化,仅未收/部分收)。 */
    @GetMapping("/matchable-orders")
    public R<List<MatchableOrderVO>> matchableOrders(@RequestParam(required = false) Long customerId,
                                                     @RequestParam(required = false) String keyword) {
        return R.ok(cashJournalService.matchableOrders(customerId, keyword));
    }

    @GetMapping("/{id}/recommendations")
    public R<List<MatchableOrderVO>> recommendations(@PathVariable Long id,
                                                     @RequestParam(required = false) String keyword) {
        return R.ok(cashJournalService.recommendations(id, keyword));
    }

    // ============================ 资金账户与余额 ============================

    @GetMapping("/accounts/options")
    public R<List<CashAccountOptionVO>> cashAccountOptions() {
        return R.ok(cashAccountService.options());
    }

    @GetMapping("/accounts")
    public R<List<CashAccountSummaryVO>> cashAccounts(
            @RequestParam(defaultValue = "false") boolean includeDisabled) {
        return R.ok(cashAccountService.summaries(includeDisabled));
    }

    @PostMapping("/accounts")
    @Log(module = "收款资金账户", type = Log.OperationType.INSERT)
    public R<FinCashAccount> createCashAccount(@RequestBody CashAccountRequest request) {
        return R.ok(cashAccountService.save(null, request));
    }

    @PutMapping("/accounts/{id}")
    @Log(module = "收款资金账户", type = Log.OperationType.UPDATE)
    public R<FinCashAccount> updateCashAccount(@PathVariable Long id,
                                               @RequestBody CashAccountRequest request) {
        return R.ok(cashAccountService.save(id, request));
    }

    @PostMapping("/accounts/{id}/disable")
    @Log(module = "收款资金账户", type = Log.OperationType.UPDATE)
    public R<Void> disableCashAccount(@PathVariable Long id) {
        cashAccountService.disable(id);
        return R.ok();
    }

    @PostMapping("/accounts/{id}/enable")
    @Log(module = "收款资金账户", type = Log.OperationType.UPDATE)
    public R<Void> enableCashAccount(@PathVariable Long id) {
        cashAccountService.enable(id);
        return R.ok();
    }

    @GetMapping("/accounts/{id}/ledger")
    public R<IPage<CashAccountLedgerVO>> cashAccountLedger(
            @PathVariable Long id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateStart,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateEnd,
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "20") Integer pageSize) {
        return R.ok(cashAccountService.ledger(id, dateStart, dateEnd, pageNum, pageSize));
    }

    @GetMapping("/accounts/{id}/balance-preview")
    public R<Map<String, Object>> cashAccountBalancePreview(
            @PathVariable Long id,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return R.ok(cashAccountService.balancePreview(id, date));
    }

    @PostMapping("/accounts/{id}/adjustments")
    @Log(module = "收款账户余额调整", type = Log.OperationType.INSERT)
    public R<FinCashAccountAdjustment> adjustCashAccount(
            @PathVariable Long id, @RequestBody CashAccountAdjustmentRequest request) {
        return R.ok(cashAccountService.adjust(id, request));
    }

    @PostMapping("/accounts/adjustments/{id}/reverse")
    @Log(module = "收款账户余额调整", type = Log.OperationType.UPDATE)
    public R<FinCashAccountAdjustment> reverseCashAccountAdjustment(
            @PathVariable Long id, @RequestBody CashAccountAdjustmentRequest request) {
        return R.ok(cashAccountService.reverseAdjustment(id, request));
    }

    @PostMapping("/accounts/{id}/snapshots")
    @Log(module = "收款账户余额核对", type = Log.OperationType.INSERT)
    public R<FinCashBalanceSnapshot> submitCashBalanceSnapshot(
            @PathVariable Long id, @RequestBody CashBalanceSnapshotRequest request) {
        return R.ok(cashAccountService.submitSnapshot(id, request));
    }

    @GetMapping("/accounts/{id}/snapshots")
    public R<IPage<FinCashBalanceSnapshot>> cashBalanceSnapshots(
            @PathVariable Long id,
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "20") Integer pageSize) {
        return R.ok(cashAccountService.snapshots(id, pageNum, pageSize));
    }

    @PostMapping("/accounts/snapshots/{id}/resolve")
    @Log(module = "收款账户余额核对", type = Log.OperationType.UPDATE)
    public R<FinCashBalanceSnapshot> resolveCashBalanceSnapshot(
            @PathVariable Long id, @RequestBody CashBalanceResolveRequest request) {
        return R.ok(cashAccountService.resolveSnapshot(id, request));
    }

    // ============================ 推荐规则治理 ============================

    @GetMapping("/match-rules")
    public R<FinCashMatchRuleConfig> matchRules() {
        return R.ok(cashMatchRuleService.managementView());
    }

    @PutMapping("/match-rules")
    @Log(module = "收款核销推荐规则", type = Log.OperationType.UPDATE)
    public R<FinCashMatchRuleConfig> updateMatchRules(@RequestBody CashMatchRuleRequest request) {
        return R.ok(cashMatchRuleService.save(request));
    }

    @GetMapping("/match-rules/events")
    public R<List<FinCashMatchRuleEvent>> matchRuleEvents() {
        return R.ok(cashMatchRuleService.events());
    }

    @PostMapping("/match-rules/simulate")
    @AllowDuringImpersonationRead("仅使用草稿规则试算推荐结果，不保存规则或核销记录")
    public R<List<MatchableOrderVO>> simulateMatchRules(
            @RequestBody CashMatchRuleSimulationRequest request) {
        if (request == null || request.getJournalId() == null) {
            throw new com.zhehang.erp.common.core.exception.BusinessException("请选择用于试算的收款记录");
        }
        return R.ok(cashJournalService.simulateRecommendations(
                request.getJournalId(), request.getKeyword(), request.getConfig()));
    }

    /** 6. 执行核销。 */
    @PostMapping("/match")
    @Log(module = "收款日记账", type = Log.OperationType.UPDATE)
    public R<Void> match(@RequestBody CashMatchRequest request) {
        cashJournalService.match(request);
        return R.ok();
    }

    /** 7. 某笔收款的匹配明细。 */
    @GetMapping("/{id}/matches")
    public R<List<FinCashMatch>> matches(@PathVariable Long id) {
        return R.ok(cashJournalService.matches(id));
    }

    /** 8. 反核销:软删某条匹配并重算所属收款。 */
    @PostMapping("/cancel-match/{matchId}")
    @Log(module = "收款日记账", type = Log.OperationType.UPDATE)
    public R<Void> cancelMatch(@PathVariable Long matchId, @RequestBody CashActionRequest request) {
        cashJournalService.cancelMatch(matchId, request);
        return R.ok();
    }

    @GetMapping("/{id}")
    public R<CashJournalDetailVO> detail(@PathVariable Long id) {
        return R.ok(cashJournalService.detail(id));
    }

    @GetMapping("/workbench")
    public R<Map<String, Object>> workbench() {
        return R.ok(cashJournalService.workbench());
    }

    @GetMapping("/monthly-report")
    public R<Map<String, Object>> monthlyReport(@RequestParam(required = false) String month) {
        return R.ok(cashJournalService.monthlyReport(month));
    }

    @GetMapping("/monthly-report/export")
    @Log(module = "收款月结报告", type = Log.OperationType.EXPORT)
    public void exportMonthlyReport(@RequestParam(required = false) String month,
                                    HttpServletResponse response) {
        monthlyReportService.exportExcel(month, response);
    }

    // ============================ 保存视图 ============================

    @GetMapping("/views")
    public R<List<FinCashSavedView>> savedViews() {
        return R.ok(savedViewService.list());
    }

    @PostMapping("/views")
    @Log(module = "收款保存视图", type = Log.OperationType.INSERT)
    public R<FinCashSavedView> createSavedView(@RequestBody CashSavedViewRequest request) {
        return R.ok(savedViewService.save(null, request));
    }

    @PutMapping("/views/{id}")
    @Log(module = "收款保存视图", type = Log.OperationType.UPDATE)
    public R<FinCashSavedView> updateSavedView(@PathVariable Long id,
                                               @RequestBody CashSavedViewRequest request) {
        return R.ok(savedViewService.save(id, request));
    }

    @DeleteMapping("/views/{id}")
    @Log(module = "收款保存视图", type = Log.OperationType.DELETE)
    public R<Void> removeSavedView(@PathVariable Long id) {
        savedViewService.remove(id);
        return R.ok();
    }

    // ============================ 付款方别名 ============================

    @GetMapping("/payer-aliases")
    public R<IPage<FinCashPayerAlias>> payerAliases(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "20") Integer pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status) {
        return R.ok(payerAliasService.page(pageNum, pageSize, keyword, status));
    }

    @PostMapping("/payer-aliases/confirm")
    @Log(module = "收款付款方别名", type = Log.OperationType.INSERT)
    public R<FinCashPayerAlias> confirmPayerAlias(@RequestBody CashPayerAliasRequest request) {
        return R.ok(payerAliasService.confirm(request));
    }

    @PostMapping("/payer-aliases/resolve")
    @Log(module = "收款付款方别名", type = Log.OperationType.UPDATE)
    public R<FinCashPayerAlias> resolvePayerAlias(@RequestBody CashPayerAliasRequest request) {
        return R.ok(payerAliasService.resolveConflict(request));
    }

    @PostMapping("/payer-aliases/{id}/disable")
    @Log(module = "收款付款方别名", type = Log.OperationType.UPDATE)
    public R<Void> disablePayerAlias(@PathVariable Long id) {
        payerAliasService.disable(id);
        return R.ok();
    }

    // ============================ 历史回款治理 ============================

    @GetMapping("/legacy-receipts")
    public R<IPage<CashLegacyReceiptVO>> legacyReceipts(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "20") Integer pageSize,
            @RequestParam(required = false) String keyword) {
        return R.ok(legacyGovernanceService.page(pageNum, pageSize, keyword));
    }

    @GetMapping("/legacy-receipts/{id}/candidates")
    public R<List<Map<String, Object>>> legacyCandidates(@PathVariable Long id) {
        return R.ok(legacyGovernanceService.candidates(id));
    }

    @PostMapping("/legacy-receipts/{id}/link")
    @Log(module = "收款历史回款治理", type = Log.OperationType.UPDATE)
    public R<Map<String, Object>> linkLegacyReceipt(@PathVariable Long id,
                                                    @RequestBody CashLegacyLinkRequest request) {
        return R.ok(legacyGovernanceService.link(id, request));
    }

    // ============================ 渠道账户对账 ============================

    @PostMapping("/reconcile/preview")
    @AllowDuringImpersonationRead("仅解析并匹配对账预览，不创建批次或收款记录")
    public R<CashReconcilePreviewVO> reconcilePreview(@RequestBody CashReconcileRequest request) {
        return R.ok(reconcileService.preview(request));
    }

    @PostMapping("/reconcile/commit")
    @Log(module = "收款渠道对账", type = Log.OperationType.INSERT)
    public R<Map<String, Object>> commitReconcile(@RequestBody CashReconcileRequest request) {
        return R.ok(reconcileService.commit(request));
    }

    @GetMapping("/reconcile/batches")
    public R<IPage<FinCashReconcileBatch>> reconcileBatches(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "20") Integer pageSize) {
        return R.ok(reconcileService.batches(pageNum, pageSize));
    }

    @GetMapping("/reconcile/batches/{id}")
    public R<Map<String, Object>> reconcileDetail(@PathVariable Long id) {
        return R.ok(reconcileService.detail(id));
    }

    @PostMapping("/reconcile/items/{id}/resolve")
    @Log(module = "收款渠道对账", type = Log.OperationType.UPDATE)
    public R<Map<String, Object>> resolveReconcileItem(@PathVariable Long id,
                                                       @RequestBody CashReconcileResolveRequest request) {
        return R.ok(reconcileService.resolve(id, request));
    }

    @GetMapping("/cash-options")
    public R<List<FinCashJournal>> cashOptions(@RequestParam(required = false) Long customerId,
                                               @RequestParam(required = false) BigDecimal maxAmount) {
        return R.ok(cashJournalService.cashOptions(customerId, maxAmount));
    }

    /** 9. 统计(尊重数据范围)。 */
    @GetMapping("/stats")
    public R<Map<String, Object>> stats() {
        return R.ok(cashJournalService.stats());
    }

    /** 10. 客户下拉(直查 crm_customer,登录即可)。 */
    @GetMapping("/customer-options")
    public R<List<CashCustomerOptionVO>> customerOptions(@RequestParam(required = false) String keyword) {
        return R.ok(cashJournalMapper.selectCustomerOptions(keyword));
    }

    // ============================ 异常闭环 ============================

    @GetMapping("/exceptions")
    public R<IPage<FinCashExceptionCase>> exceptions(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "20") Integer pageSize,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String exceptionType,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) Long ownerId) {
        return R.ok(cashExceptionService.page(pageNum, pageSize, status, exceptionType, priority, ownerId));
    }

    @PostMapping("/exceptions")
    @Log(module = "收款异常", type = Log.OperationType.INSERT)
    public R<FinCashExceptionCase> createException(@RequestBody CashExceptionActionRequest request) {
        return R.ok(cashExceptionService.create(request));
    }

    @GetMapping("/exceptions/{id}/events")
    public R<List<FinCashExceptionEvent>> exceptionEvents(@PathVariable Long id) {
        return R.ok(cashExceptionService.events(id));
    }

    @GetMapping("/exceptions/{id}")
    public R<FinCashExceptionCase> exceptionDetail(@PathVariable Long id) {
        return R.ok(cashExceptionService.detail(id));
    }

    @PostMapping("/exceptions/{id}/claim")
    @Log(module = "收款异常", type = Log.OperationType.UPDATE)
    public R<FinCashExceptionCase> claimException(@PathVariable Long id,
                                                  @RequestBody CashExceptionActionRequest request) {
        return R.ok(cashExceptionService.claim(id, request));
    }

    @PostMapping("/exceptions/{id}/transfer")
    @Log(module = "收款异常", type = Log.OperationType.UPDATE)
    public R<FinCashExceptionCase> transferException(@PathVariable Long id,
                                                     @RequestBody CashExceptionActionRequest request) {
        return R.ok(cashExceptionService.transfer(id, request));
    }

    @PostMapping("/exceptions/{id}/progress")
    @Log(module = "收款异常", type = Log.OperationType.UPDATE)
    public R<FinCashExceptionCase> progressException(@PathVariable Long id,
                                                     @RequestBody CashExceptionActionRequest request) {
        return R.ok(cashExceptionService.progress(id, request));
    }

    @PostMapping("/exceptions/{id}/resolve")
    @Log(module = "收款异常", type = Log.OperationType.UPDATE)
    public R<FinCashExceptionCase> resolveException(@PathVariable Long id,
                                                    @RequestBody CashExceptionActionRequest request) {
        return R.ok(cashExceptionService.resolve(id, request));
    }

    @PostMapping("/exceptions/{id}/reopen")
    @Log(module = "收款异常", type = Log.OperationType.UPDATE)
    public R<FinCashExceptionCase> reopenException(@PathVariable Long id,
                                                   @RequestBody CashExceptionActionRequest request) {
        return R.ok(cashExceptionService.reopen(id, request));
    }

    // ============================ 日结/月结 ============================

    @GetMapping("/daily-close/preview")
    public R<Map<String, Object>> dailyClosePreview(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return R.ok(cashDailyCloseService.preview(date));
    }

    @PostMapping("/daily-close/submit")
    @Log(module = "收款日结", type = Log.OperationType.UPDATE)
    public R<Map<String, Object>> submitDailyClose(@RequestBody CashDailyCloseSubmitRequest request) {
        return R.ok(cashDailyCloseService.submit(request));
    }

    @PostMapping("/daily-close/{id}/close")
    @Log(module = "收款日结", type = Log.OperationType.UPDATE)
    public R<FinCashDailyClose> closeDailyClose(@PathVariable Long id) {
        return R.ok(cashDailyCloseService.close(id));
    }

    @PostMapping("/daily-close/{id}/reopen")
    @Log(module = "收款日结", type = Log.OperationType.UPDATE)
    public R<FinCashDailyClose> reopenDailyClose(@PathVariable Long id,
                                                @RequestBody CashActionRequest request) {
        return R.ok(cashDailyCloseService.reopen(id, request));
    }

    // ============================ 批量导入 ============================

    /** 11. 批量导入·预览:逐行归一化 + 校验 + 查重 + 匹配,不入库。 */
    @PostMapping("/import-preview")
    @AllowDuringImpersonationRead("仅解析、校验和查重导入内容，不写入收款记录")
    public R<CashImportPreviewResult> importPreview(@RequestBody CashImportRequest request) {
        return R.ok(cashJournalService.importPreview(request));
    }

    /** 12. 批量导入·提交:生成批次 + 批量入库 + 写批次统计(事务)。 */
    @PostMapping("/import-commit")
    @Log(module = "收款日记账", type = Log.OperationType.INSERT)
    public R<Map<String, Object>> importCommit(@RequestBody CashImportRequest request) {
        return R.ok(cashJournalService.importCommit(request));
    }

    /** 13. 导入批次分页列表(数据范围:finance_hq/boss/admin 看全部,其余看自己)。 */
    @GetMapping("/import-batches")
    public R<IPage<FinCashImportBatch>> importBatches(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        return R.ok(cashJournalService.importBatches(pageNum, pageSize));
    }

    /** 14. 批次详情 + 该批次收款记录列表。 */
    @GetMapping("/import-batch/{batchNo}")
    public R<Map<String, Object>> importBatchDetail(@PathVariable String batchNo) {
        return R.ok(cashJournalService.importBatchDetail(batchNo));
    }

    /** 15. 批次回滚：可回滚记录作废，已审核/已核销/已日结分项保留。 */
    @PostMapping("/import-batch/{batchNo}/rollback")
    @Log(module = "收款日记账", type = Log.OperationType.UPDATE)
    public R<Map<String, Object>> rollbackBatch(@PathVariable String batchNo) {
        return R.ok(cashJournalService.rollbackBatch(batchNo));
    }
}
