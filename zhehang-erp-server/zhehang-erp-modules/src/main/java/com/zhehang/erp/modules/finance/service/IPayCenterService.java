package com.zhehang.erp.modules.finance.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.modules.finance.domain.dto.PayImportCommitDTO;
import com.zhehang.erp.modules.finance.domain.dto.PayTxnClaimDTO;
import com.zhehang.erp.modules.finance.domain.dto.PayTxnQuery;
import com.zhehang.erp.modules.finance.domain.entity.FinPayChannel;
import com.zhehang.erp.modules.finance.domain.entity.FinPayImportBatch;
import com.zhehang.erp.modules.finance.domain.entity.FinPayTransaction;

import java.util.List;
import java.util.Map;

/**
 * 收款中心服务:渠道管理 + 统一收款流水 + 认领生成收款登记 + 对账单导入。
 */
public interface IPayCenterService {

    /** 渠道列表(含停用,按 sort 升序)。 */
    List<FinPayChannel> listChannels();

    /** 新增/编辑渠道(id 为空=新增)。 */
    Long saveChannel(FinPayChannel channel);

    /** 启用/停用渠道。 */
    void updateChannelStatus(Long id, Integer status);

    /** 删除渠道(有流水引用时拒绝,提示改用停用)。 */
    void removeChannel(Long id);

    /** 流水分页(多条件筛选 + 支付时间倒序)。 */
    IPage<FinPayTransaction> pageTransactions(PayTxnQuery query);

    /** 手工补录一笔收款,返回流水id。 */
    Long createManual(FinPayTransaction txn);

    /** 认领:生成收款登记草稿并回写流水,返回收款登记id。 */
    Long claim(Long txnId, PayTxnClaimDTO dto);

    /** 撤销认领/取消不入账:流水回到待认领(已生成的收款登记不删,仅解除关联)。 */
    void restore(Long txnId);

    /** 标记不入账(内部转账/测试款等)。 */
    void ignore(Long txnId, String reason);

    /** 导入预览:只查重不落库,返回统计与逐行状态。 */
    Map<String, Object> importPreview(PayImportCommitDTO dto);

    /** 导入提交:按防重键去重入库,返回批次统计。 */
    Map<String, Object> importCommit(PayImportCommitDTO dto);

    /** 导入批次列表(近50条)。 */
    List<FinPayImportBatch> listImportBatches();

    /** 撤销一个导入批次(仅删除其中仍待认领的流水)。 */
    Map<String, Object> rollbackBatch(Long batchId);

    /** 总览统计:今日/本月/待认领 + 分渠道。 */
    Map<String, Object> stats();
}
