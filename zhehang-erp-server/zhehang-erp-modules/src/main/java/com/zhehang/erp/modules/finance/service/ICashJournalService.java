package com.zhehang.erp.modules.finance.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.zhehang.erp.modules.finance.domain.dto.CashImportPreviewResult;
import com.zhehang.erp.modules.finance.domain.dto.CashImportRequest;
import com.zhehang.erp.modules.finance.domain.dto.CashActionRequest;
import com.zhehang.erp.modules.finance.domain.dto.CashJournalQuery;
import com.zhehang.erp.modules.finance.domain.dto.CashMatchRequest;
import com.zhehang.erp.modules.finance.domain.dto.CashMatchRuleRequest;
import com.zhehang.erp.modules.finance.domain.entity.FinCashJournal;
import com.zhehang.erp.modules.finance.domain.entity.FinCashMatch;
import com.zhehang.erp.modules.finance.domain.vo.CashJournalDetailVO;
import com.zhehang.erp.modules.finance.domain.vo.MatchableOrderVO;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/** 收款日记账服务。 */
public interface ICashJournalService extends IService<FinCashJournal> {

    IPage<FinCashJournal> selectPage(CashJournalQuery query);

    /** 新增/编辑收款日记账,返回主键。 */
    Long saveJournal(FinCashJournal entity);

    /** 作废；已审核、已日结或仍有有效核销时禁止。 */
    void voidJournal(Long id, CashActionRequest request);

    /** 提交审核。 */
    void submitReview(Long id, CashActionRequest request);

    /** 审核(finance_hq/boss/admin)。 */
    void review(Long id, CashActionRequest request);

    /** 驳回审核。 */
    void rejectReview(Long id, CashActionRequest request);

    /** 反审核。 */
    void reverseReview(Long id, CashActionRequest request);

    /** 核销:可核销报单归一化列表(只返回未收/部分收)。 */
    List<MatchableOrderVO> matchableOrders(Long customerId, String keyword);

    /** 针对某笔收款的可解释推荐，包含四类报单与回款续费应收。 */
    List<MatchableOrderVO> recommendations(Long journalId, String keyword);

    /** 使用未保存的规则参数试算，不改变当前生效配置。 */
    List<MatchableOrderVO> simulateRecommendations(Long journalId, String keyword, CashMatchRuleRequest rules);

    /** 执行核销(事务)。 */
    void match(CashMatchRequest request);

    /** 某笔收款的匹配明细。 */
    List<FinCashMatch> matches(Long journalId);

    /** 反核销:软删某条匹配并重算所属收款。 */
    void cancelMatch(Long matchId, CashActionRequest request);

    /** 右侧抽屉完整详情。 */
    CashJournalDetailVO detail(Long journalId);

    /** 今日必须处理、统一资金指标与续费风险。 */
    Map<String, Object> workbench();

    /** 月度经营口径。 */
    Map<String, Object> monthlyReport(String month);

    /** 回款续费选择已有未核销收款。 */
    List<FinCashJournal> cashOptions(Long customerId, BigDecimal maxAmount);

    /** 统计(尊重数据范围)。 */
    Map<String, Object> stats();

    // ============================== 批量导入 =================================

    /** 导入预览:逐行归一化 + 校验 + 查重 + 匹配,不入库。 */
    CashImportPreviewResult importPreview(CashImportRequest request);

    /** 导入提交(事务):生成批次、批量入库、写批次统计。返回 {batchNo,successCount,failCount,duplicateCount,totalAmount}。 */
    Map<String, Object> importCommit(CashImportRequest request);

    /** 导入批次分页列表(数据范围:finance_hq/boss/admin 看全部,其余看自己)。 */
    IPage<com.zhehang.erp.modules.finance.domain.entity.FinCashImportBatch> importBatches(Integer pageNum, Integer pageSize);

    /** 批次详情 + 该批次收款记录列表。返回 {batch, records}。 */
    Map<String, Object> importBatchDetail(String batchNo);

    /** 整批回滚(仅 finance_hq/boss/admin):未审核/未匹配记录置作废,批次置 rolledback。返回回滚/跳过统计。 */
    Map<String, Object> rollbackBatch(String batchNo);
}
