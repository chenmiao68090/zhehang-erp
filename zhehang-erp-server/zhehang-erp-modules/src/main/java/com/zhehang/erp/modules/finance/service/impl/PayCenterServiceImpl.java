package com.zhehang.erp.modules.finance.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.finance.domain.dto.PayImportCommitDTO;
import com.zhehang.erp.modules.finance.domain.dto.PayTxnClaimDTO;
import com.zhehang.erp.modules.finance.domain.dto.PayTxnQuery;
import com.zhehang.erp.modules.finance.domain.entity.FinCompanyJournal;
import com.zhehang.erp.modules.finance.domain.entity.FinPayChannel;
import com.zhehang.erp.modules.finance.domain.entity.FinPayImportBatch;
import com.zhehang.erp.modules.finance.domain.entity.FinPayTransaction;
import com.zhehang.erp.modules.finance.mapper.FinPayChannelMapper;
import com.zhehang.erp.modules.finance.mapper.FinPayImportBatchMapper;
import com.zhehang.erp.modules.finance.mapper.FinPayTransactionMapper;
import com.zhehang.erp.modules.finance.service.ICompanyJournalService;
import com.zhehang.erp.modules.finance.service.IPayCenterService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.DigestUtils;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/**
 * 收款中心服务实现。
 * 口径:fin_pay_transaction 是渠道原始流水层(上游);认领后经收款登记服务
 * 生成 fin_company_journal 行(下游账本,编号/公式由其服务端统一计算)。
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PayCenterServiceImpl implements IPayCenterService {

    private final FinPayChannelMapper channelMapper;
    private final FinPayTransactionMapper txnMapper;
    private final FinPayImportBatchMapper batchMapper;
    private final ICompanyJournalService companyJournalService;

    /** 宽松时间正则:支持 2026-07-03 09:00:00 / 2026/7/3 9:05 / 2026年7月3日 等单位数写法;
     *  日期合法性由 LocalDate.of 严格校验(2月31日直接判无效,不做静默修正)。 */
    private static final java.util.regex.Pattern DT_PATTERN = java.util.regex.Pattern.compile(
            "^(\\d{4})[-/年.](\\d{1,2})[-/月.](\\d{1,2})日?(?:[ T](\\d{1,2}):(\\d{1,2})(?::(\\d{1,2}))?)?$");

    // ---------------- 渠道 ----------------

    @Override
    public List<FinPayChannel> listChannels() {
        return channelMapper.selectList(new LambdaQueryWrapper<FinPayChannel>()
                .orderByAsc(FinPayChannel::getSort).orderByAsc(FinPayChannel::getId));
    }

    @Override
    public Long saveChannel(FinPayChannel channel) {
        if (!StringUtils.hasText(channel.getChannelName())) {
            throw new BusinessException("渠道名称必填");
        }
        if (!StringUtils.hasText(channel.getChannelType())) {
            throw new BusinessException("渠道类型必选");
        }
        if (channel.getId() == null) {
            if (channel.getStatus() == null) channel.setStatus(1);
            if (channel.getSort() == null) channel.setSort(0);
            channelMapper.insert(channel);
        } else {
            channelMapper.updateById(channel);
        }
        return channel.getId();
    }

    @Override
    public void updateChannelStatus(Long id, Integer status) {
        FinPayChannel ch = requireChannel(id);
        FinPayChannel upd = new FinPayChannel();
        upd.setId(ch.getId());
        upd.setStatus(status != null && status == 1 ? 1 : 0);
        channelMapper.updateById(upd);
    }

    @Override
    public void removeChannel(Long id) {
        requireChannel(id);
        Long refs = txnMapper.selectCount(new LambdaQueryWrapper<FinPayTransaction>()
                .eq(FinPayTransaction::getChannelId, id));
        if (refs != null && refs > 0) {
            throw new BusinessException("该渠道已有 " + refs + " 笔流水,不能删除,请改用停用");
        }
        channelMapper.deleteById(id);
    }

    private FinPayChannel requireChannel(Long id) {
        FinPayChannel ch = id == null ? null : channelMapper.selectById(id);
        if (ch == null) {
            throw new BusinessException("收款渠道不存在,请先在渠道管理中添加");
        }
        return ch;
    }

    // ---------------- 流水 ----------------

    @Override
    public IPage<FinPayTransaction> pageTransactions(PayTxnQuery q) {
        long pageNum = q.getPageNum() == null || q.getPageNum() < 1 ? 1 : q.getPageNum();
        long pageSize = q.getPageSize() == null || q.getPageSize() < 1 ? 20 : Math.min(q.getPageSize(), 200);
        LambdaQueryWrapper<FinPayTransaction> qw = new LambdaQueryWrapper<FinPayTransaction>()
                .eq(q.getChannelId() != null, FinPayTransaction::getChannelId, q.getChannelId())
                .eq(StringUtils.hasText(q.getChannelType()), FinPayTransaction::getChannelType, q.getChannelType())
                .eq(StringUtils.hasText(q.getStatus()), FinPayTransaction::getStatus, q.getStatus())
                .eq(StringUtils.hasText(q.getSource()), FinPayTransaction::getSource, q.getSource())
                .ge(q.getBeginDate() != null, FinPayTransaction::getPayTime,
                        q.getBeginDate() == null ? null : q.getBeginDate().atStartOfDay())
                .lt(q.getEndDate() != null, FinPayTransaction::getPayTime,
                        q.getEndDate() == null ? null : q.getEndDate().plusDays(1).atStartOfDay())
                .orderByDesc(FinPayTransaction::getPayTime)
                .orderByDesc(FinPayTransaction::getId);
        if (StringUtils.hasText(q.getKeyword())) {
            String k = q.getKeyword().trim();
            qw.and(w -> w.like(FinPayTransaction::getPayerName, k)
                    .or().like(FinPayTransaction::getPayerAccount, k)
                    .or().like(FinPayTransaction::getTradeNo, k)
                    .or().like(FinPayTransaction::getRemark, k));
        }
        return txnMapper.selectPage(new Page<>(pageNum, pageSize), qw);
    }

    @Override
    public Long createManual(FinPayTransaction txn) {
        if (txn.getAmount() == null || txn.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("金额必须大于 0");
        }
        if (txn.getPayTime() == null) {
            throw new BusinessException("收款时间必填");
        }
        FinPayChannel ch = requireChannel(txn.getChannelId());
        FinPayTransaction row = new FinPayTransaction();
        row.setChannelId(ch.getId());
        row.setChannelType(ch.getChannelType());
        row.setChannelName(ch.getChannelName());
        row.setAmount(txn.getAmount());
        row.setPayTime(txn.getPayTime());
        row.setPayerName(trimTo(txn.getPayerName(), 100));
        row.setPayerAccount(trimTo(txn.getPayerAccount(), 100));
        row.setTradeNo(trimTo(txn.getTradeNo(), 100));
        row.setRemark(trimTo(txn.getRemark(), 255));
        row.setSource(FinPayTransaction.SOURCE_MANUAL);
        row.setStatus(FinPayTransaction.STATUS_UNCLAIMED);
        // 手工补录不参与查重(同一天可能真有两笔同额),用随机键占位唯一索引
        row.setDedupKey("M" + UUID.randomUUID().toString().replace("-", ""));
        txnMapper.insert(row);
        return row.getId();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long claim(Long txnId, PayTxnClaimDTO dto) {
        FinPayTransaction txn = requireTxn(txnId);
        // 条件更新先占位,防两人并发认领同一笔生成两条登记;saveJournal 抛异常时整个事务回滚占位
        int hold = txnMapper.update(null, new com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper<FinPayTransaction>()
                .eq(FinPayTransaction::getId, txn.getId())
                .eq(FinPayTransaction::getStatus, FinPayTransaction.STATUS_UNCLAIMED)
                .set(FinPayTransaction::getStatus, FinPayTransaction.STATUS_CLAIMED)
                .set(FinPayTransaction::getClaimBy, SecurityUtils.getCurrentUserId())
                .set(FinPayTransaction::getClaimTime, LocalDateTime.now()));
        if (hold != 1) {
            throw new BusinessException("该流水已被他人认领或状态已变,请刷新后重试");
        }
        FinCompanyJournal j = new FinCompanyJournal();
        j.setCompanyName(dto.getCompanyName().trim());
        j.setReceivedAmount(txn.getAmount());
        j.setReceiptDate(txn.getPayTime().toLocalDate());
        // 合同总金额不填(或填0)默认等于本次到款 → 剩余尾款=0;财务后续可在登记里改
        boolean hasContract = dto.getContractAmount() != null && dto.getContractAmount().compareTo(BigDecimal.ZERO) > 0;
        j.setContractAmount(hasContract ? dto.getContractAmount() : txn.getAmount());
        j.setBankSerialNo(txn.getTradeNo());
        j.setBelongDept(dto.getBelongDept());
        j.setReceiptType(dto.getReceiptType());
        j.setContractRemark(dto.getContractRemark());
        // 收款账号只取渠道配置的映射值;没配就留空让财务在登记里选,写渠道名会产生选项外脏值
        FinPayChannel ch = txn.getChannelId() == null ? null : channelMapper.selectById(txn.getChannelId());
        if (ch != null && StringUtils.hasText(ch.getReceiveAccount())) {
            j.setReceiveAccount(ch.getReceiveAccount());
        }
        j.setRemark("收款中心认领生成(流水#" + txn.getId() + " · " + nvl(txn.getPayerName()) + ")");
        Long journalId = companyJournalService.saveJournal(j);

        FinPayTransaction upd = new FinPayTransaction();
        upd.setId(txn.getId());
        upd.setJournalId(journalId);
        txnMapper.updateById(upd);
        return journalId;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void restore(Long txnId) {
        FinPayTransaction txn = requireTxn(txnId);
        if (FinPayTransaction.STATUS_UNCLAIMED.equals(txn.getStatus())) {
            return;
        }
        // 认领时生成的登记草稿若从未被编辑过(version=0)一并删除,防止重复认领造成账本双计
        if (txn.getJournalId() != null) {
            FinCompanyJournal journal = companyJournalService.getById(txn.getJournalId());
            if (journal != null && (journal.getVersion() == null || journal.getVersion() == 0)) {
                companyJournalService.removeJournal(journal.getId());
            }
        }
        // updateById 跳过 null 字段,置空必须用 UpdateWrapper.set(踩过坑);wrapper 更新不走自动填充,手动补审计字段
        txnMapper.update(null, new com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper<FinPayTransaction>()
                .eq(FinPayTransaction::getId, txn.getId())
                .set(FinPayTransaction::getStatus, FinPayTransaction.STATUS_UNCLAIMED)
                .set(FinPayTransaction::getJournalId, null)
                .set(FinPayTransaction::getClaimBy, null)
                .set(FinPayTransaction::getClaimTime, null)
                .set(FinPayTransaction::getUpdateBy, SecurityUtils.getCurrentUserId())
                .set(FinPayTransaction::getUpdateTime, LocalDateTime.now()));
    }

    @Override
    public void ignore(Long txnId, String reason) {
        FinPayTransaction txn = requireTxn(txnId);
        String remark = StringUtils.hasText(reason)
                ? trimTo("不入账:" + reason.trim()
                        + (StringUtils.hasText(txn.getRemark()) ? " | " + txn.getRemark() : ""), 255)
                : null;
        // 条件更新防并发:只有仍处于待认领的行才能改成不入账
        var uw = new com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper<FinPayTransaction>()
                .eq(FinPayTransaction::getId, txn.getId())
                .eq(FinPayTransaction::getStatus, FinPayTransaction.STATUS_UNCLAIMED)
                .set(FinPayTransaction::getStatus, FinPayTransaction.STATUS_IGNORED)
                .set(FinPayTransaction::getUpdateBy, SecurityUtils.getCurrentUserId())
                .set(FinPayTransaction::getUpdateTime, LocalDateTime.now());
        if (remark != null) {
            uw.set(FinPayTransaction::getRemark, remark);
        }
        if (txnMapper.update(null, uw) != 1) {
            throw new BusinessException("只有待认领的流水可以标记不入账,请刷新后重试");
        }
    }

    private FinPayTransaction requireTxn(Long id) {
        FinPayTransaction txn = id == null ? null : txnMapper.selectById(id);
        if (txn == null) {
            throw new BusinessException("流水不存在");
        }
        return txn;
    }

    // ---------------- 导入 ----------------

    @Override
    public Map<String, Object> importPreview(PayImportCommitDTO dto) {
        FinPayChannel ch = requireChannel(dto.getChannelId());
        List<ParsedRow> parsed = parseAll(ch, dto.getRows());
        Set<String> existing = findExistingKeys(parsed);
        List<Map<String, Object>> rowResults = new ArrayList<>();
        Set<String> seenKeys = new HashSet<>();
        int valid = 0, dup = 0, invalid = 0;
        for (int i = 0; i < parsed.size(); i++) {
            ParsedRow p = parsed.get(i);
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("index", i + 1);
            if (p.error != null) {
                invalid++;
                m.put("state", "invalid");
                m.put("message", p.error);
            } else if (existing.contains(p.dedupKey) || !seenKeys.add(p.dedupKey)) {
                dup++;
                m.put("state", "duplicate");
                m.put("message", existing.contains(p.dedupKey)
                        ? "系统中已有同一笔(按单号,或同日同额同付款方)" : "文件内重复单号");
            } else {
                valid++;
                m.put("state", "valid");
            }
            rowResults.add(m);
        }
        Map<String, Object> out = new HashMap<>();
        out.put("total", parsed.size());
        out.put("valid", valid);
        out.put("duplicates", dup);
        out.put("invalid", invalid);
        out.put("rows", rowResults);
        return out;
    }

    /** 逐行解析;同一次提交内,无单号且(日期|金额|付款方)完全相同的多行视为多笔真实收款,
     *  给第2笔起的防重键加序号后缀,避免同日两笔同额转账被当重复丢弃。 */
    private List<ParsedRow> parseAll(FinPayChannel ch, List<PayImportCommitDTO.Row> rows) {
        List<ParsedRow> parsed = new ArrayList<>();
        Map<String, Integer> occurrence = new HashMap<>();
        for (PayImportCommitDTO.Row r : rows) {
            ParsedRow p = parseRow(ch, r);
            if (p.error == null && p.dedupKey.startsWith("H")) {
                int n = occurrence.merge(p.dedupKey, 1, Integer::sum);
                if (n > 1) {
                    p.dedupKey = p.dedupKey + "#" + n;
                }
            }
            parsed.add(p);
        }
        return parsed;
    }

    /** 查库中已存在的防重键,IN 按 1000 个分片,防大文件撑出巨型 SQL。 */
    private Set<String> findExistingKeys(List<ParsedRow> parsed) {
        List<String> keys = parsed.stream().filter(p -> p.error == null).map(p -> p.dedupKey).toList();
        Set<String> existing = new HashSet<>();
        for (int i = 0; i < keys.size(); i += 1000) {
            List<String> chunk = keys.subList(i, Math.min(i + 1000, keys.size()));
            txnMapper.selectList(new LambdaQueryWrapper<FinPayTransaction>()
                            .in(FinPayTransaction::getDedupKey, chunk)
                            .select(FinPayTransaction::getDedupKey))
                    .forEach(t -> existing.add(t.getDedupKey()));
        }
        return existing;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Map<String, Object> importCommit(PayImportCommitDTO dto) {
        FinPayChannel ch = requireChannel(dto.getChannelId());
        FinPayImportBatch batch = new FinPayImportBatch();
        batch.setChannelId(ch.getId());
        batch.setFileName(StringUtils.hasText(dto.getFileName()) ? trimTo(dto.getFileName(), 200) : "粘贴导入");
        batch.setTotalRows(dto.getRows().size());
        batch.setInsertedRows(0);
        batch.setDuplicateRows(0);
        batch.setStatus("done");
        batchMapper.insert(batch);

        int inserted = 0, dup = 0, invalid = 0;
        Set<String> seenKeys = new HashSet<>();
        List<ParsedRow> parsedAll = parseAll(ch, dto.getRows());
        for (int i = 0; i < parsedAll.size(); i++) {
            ParsedRow p = parsedAll.get(i);
            PayImportCommitDTO.Row r = dto.getRows().get(i);
            if (p.error != null) {
                invalid++;
                continue;
            }
            if (!seenKeys.add(p.dedupKey)) {
                dup++;
                continue;
            }
            FinPayTransaction row = new FinPayTransaction();
            row.setChannelId(ch.getId());
            row.setChannelType(ch.getChannelType());
            row.setChannelName(ch.getChannelName());
            row.setAmount(p.amount);
            row.setPayTime(p.payTime);
            row.setPayerName(trimTo(r.getPayerName(), 100));
            row.setPayerAccount(trimTo(r.getPayerAccount(), 100));
            row.setTradeNo(trimTo(r.getTradeNo(), 100));
            row.setRemark(trimTo(r.getRemark(), 255));
            row.setDedupKey(p.dedupKey);
            row.setSource(FinPayTransaction.SOURCE_IMPORT);
            row.setStatus(FinPayTransaction.STATUS_UNCLAIMED);
            row.setImportBatchId(batch.getId());
            row.setRawData(trimTo(r.getRaw(), 2000));
            try {
                txnMapper.insert(row);
                inserted++;
            } catch (DuplicateKeyException e) {
                // 唯一索引兜底:并发或已存在,按重复跳过
                dup++;
            }
        }
        FinPayImportBatch upd = new FinPayImportBatch();
        upd.setId(batch.getId());
        upd.setInsertedRows(inserted);
        upd.setDuplicateRows(dup);
        if (invalid > 0) {
            upd.setRemark("无效行 " + invalid + " 条(时间或金额解析失败)已跳过");
        }
        batchMapper.updateById(upd);

        Map<String, Object> out = new HashMap<>();
        out.put("batchId", batch.getId());
        out.put("total", dto.getRows().size());
        out.put("inserted", inserted);
        out.put("duplicates", dup);
        out.put("invalid", invalid);
        return out;
    }

    @Override
    public List<FinPayImportBatch> listImportBatches() {
        return batchMapper.selectList(new LambdaQueryWrapper<FinPayImportBatch>()
                .orderByDesc(FinPayImportBatch::getId)
                .last("LIMIT 50"));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Map<String, Object> rollbackBatch(Long batchId) {
        FinPayImportBatch batch = batchMapper.selectById(batchId);
        if (batch == null) {
            throw new BusinessException("导入批次不存在");
        }
        if ("rolled_back".equals(batch.getStatus())) {
            throw new BusinessException("该批次已撤销过");
        }
        // 只删仍待认领的;已认领的与收款登记挂了钩,保留。
        // 逻辑删除不释放 dedup_key 唯一索引 → 先把防重键改写掉,否则撤销后同一份文件永远导不回来
        txnMapper.update(null, new com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper<FinPayTransaction>()
                .eq(FinPayTransaction::getImportBatchId, batchId)
                .eq(FinPayTransaction::getStatus, FinPayTransaction.STATUS_UNCLAIMED)
                .setSql("dedup_key = CONCAT('RB', id, '#', dedup_key)"));
        int removed = txnMapper.delete(new LambdaQueryWrapper<FinPayTransaction>()
                .eq(FinPayTransaction::getImportBatchId, batchId)
                .eq(FinPayTransaction::getStatus, FinPayTransaction.STATUS_UNCLAIMED));
        Long kept = txnMapper.selectCount(new LambdaQueryWrapper<FinPayTransaction>()
                .eq(FinPayTransaction::getImportBatchId, batchId));
        FinPayImportBatch upd = new FinPayImportBatch();
        upd.setId(batchId);
        upd.setStatus("rolled_back");
        upd.setRemark("撤销删除 " + removed + " 条待认领;保留已认领/不入账 " + kept + " 条");
        batchMapper.updateById(upd);
        Map<String, Object> out = new HashMap<>();
        out.put("removed", removed);
        out.put("kept", kept);
        return out;
    }

    // ---------------- 统计 ----------------

    @Override
    public Map<String, Object> stats() {
        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        LocalDateTime monthStart = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        Map<String, Object> out = new HashMap<>();
        out.put("today", sumSince(todayStart, null));
        out.put("month", sumSince(monthStart, null));
        // 待认领单独统计(含历史,不限本月)
        Map<String, Object> unclaimed = new HashMap<>();
        QueryWrapper<FinPayTransaction> uq = new QueryWrapper<FinPayTransaction>()
                .select("IFNULL(SUM(amount),0) AS amt", "COUNT(*) AS cnt")
                .eq("status", FinPayTransaction.STATUS_UNCLAIMED);
        Map<String, Object> urow = firstRow(txnMapper.selectMaps(uq));
        unclaimed.put("amount", urow.getOrDefault("amt", BigDecimal.ZERO));
        unclaimed.put("count", urow.getOrDefault("cnt", 0));
        out.put("unclaimed", unclaimed);

        // 分渠道:今日/本月(排除不入账)
        List<FinPayChannel> channels = listChannels();
        List<Map<String, Object>> chStats = new ArrayList<>();
        for (FinPayChannel ch : channels) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("channelId", ch.getId());
            m.put("channelType", ch.getChannelType());
            m.put("channelName", ch.getChannelName());
            m.put("status", ch.getStatus());
            m.put("today", sumSince(todayStart, ch.getId()));
            m.put("month", sumSince(monthStart, ch.getId()));
            chStats.add(m);
        }
        out.put("channels", chStats);
        return out;
    }

    /** 自某时刻起的合计(排除不入账),可按渠道过滤。 */
    private Map<String, Object> sumSince(LocalDateTime since, Long channelId) {
        QueryWrapper<FinPayTransaction> qw = new QueryWrapper<FinPayTransaction>()
                .select("IFNULL(SUM(amount),0) AS amt", "COUNT(*) AS cnt")
                .ne("status", FinPayTransaction.STATUS_IGNORED)
                .ge("pay_time", since);
        if (channelId != null) {
            qw.eq("channel_id", channelId);
        }
        Map<String, Object> row = firstRow(txnMapper.selectMaps(qw));
        Map<String, Object> m = new HashMap<>();
        m.put("amount", row.getOrDefault("amt", BigDecimal.ZERO));
        m.put("count", row.getOrDefault("cnt", 0));
        return m;
    }

    private static Map<String, Object> firstRow(List<Map<String, Object>> rows) {
        return rows == null || rows.isEmpty() || rows.get(0) == null ? Map.of() : rows.get(0);
    }

    // ---------------- 工具 ----------------

    private static class ParsedRow {
        LocalDateTime payTime;
        BigDecimal amount;
        String dedupKey;
        String error;
    }

    /** 解析导入行:时间/金额校验 + 防重键(有单号用单号,否则用内容摘要)。 */
    private ParsedRow parseRow(FinPayChannel ch, PayImportCommitDTO.Row r) {
        ParsedRow p = new ParsedRow();
        p.payTime = parseTime(r.getPayTime());
        if (p.payTime == null) {
            p.error = "时间无法解析:" + nvl(r.getPayTime());
            return p;
        }
        if (r.getAmount() == null || r.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            p.error = "金额缺失或不大于0";
            return p;
        }
        p.amount = r.getAmount();
        if (StringUtils.hasText(r.getTradeNo())) {
            String no = r.getTradeNo().trim();
            p.dedupKey = "C" + ch.getId() + ":" + (no.length() <= 60 ? no
                    : DigestUtils.md5DigestAsHex(no.getBytes(StandardCharsets.UTF_8)));
        } else {
            String basis = ch.getId() + "|" + p.payTime + "|" + p.amount.stripTrailingZeros().toPlainString()
                    + "|" + nvl(r.getPayerName()) + "|" + nvl(r.getPayerAccount());
            p.dedupKey = "H" + DigestUtils.md5DigestAsHex(basis.getBytes(StandardCharsets.UTF_8));
        }
        return p;
    }

    private static LocalDateTime parseTime(String s) {
        if (!StringUtils.hasText(s)) {
            return null;
        }
        java.util.regex.Matcher m = DT_PATTERN.matcher(s.trim());
        if (!m.matches()) {
            return null;
        }
        try {
            LocalDate d = LocalDate.of(Integer.parseInt(m.group(1)),
                    Integer.parseInt(m.group(2)), Integer.parseInt(m.group(3)));
            if (m.group(4) == null) {
                return d.atTime(LocalTime.NOON);
            }
            int sec = m.group(6) == null ? 0 : Integer.parseInt(m.group(6));
            return d.atTime(LocalTime.of(Integer.parseInt(m.group(4)), Integer.parseInt(m.group(5)), sec));
        } catch (Exception e) {
            // 月/日/时越界(如2月31日)一律判无效
            return null;
        }
    }

    private static String trimTo(String s, int max) {
        if (s == null) {
            return null;
        }
        String t = s.trim();
        return t.length() <= max ? t : t.substring(0, max);
    }

    private static String nvl(String s) {
        return s == null ? "" : s;
    }
}
