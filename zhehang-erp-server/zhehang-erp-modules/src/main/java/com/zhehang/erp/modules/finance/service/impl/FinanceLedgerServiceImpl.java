package com.zhehang.erp.modules.finance.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.modules.finance.domain.entity.FinanceLedger;
import com.zhehang.erp.modules.finance.domain.entity.FinanceVoucher;
import com.zhehang.erp.modules.finance.domain.entity.FinanceVoucherEntry;
import com.zhehang.erp.modules.finance.mapper.FinanceLedgerMapper;
import com.zhehang.erp.modules.finance.mapper.FinanceVoucherEntryMapper;
import com.zhehang.erp.modules.finance.mapper.FinanceVoucherMapper;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.finance.service.IFinanceLedgerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FinanceLedgerServiceImpl extends ServiceImpl<FinanceLedgerMapper, FinanceLedger> implements IFinanceLedgerService {

    private final FinanceVoucherMapper voucherMapper;
    private final FinanceVoucherEntryMapper entryMapper;
    private final DataScopeHelper dataScopeHelper;

    /** 总账:按科目+期间汇总的发生额与余额。 */
    public List<FinanceLedger> queryGeneral(String subjectCode, String startPeriod, String endPeriod) {
        LambdaQueryWrapper<FinanceLedger> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(StringUtils.hasText(subjectCode), FinanceLedger::getSubjectCode, subjectCode)
               .ge(StringUtils.hasText(startPeriod), FinanceLedger::getPeriod, startPeriod)
               .le(StringUtils.hasText(endPeriod), FinanceLedger::getPeriod, endPeriod)
               .orderByAsc(FinanceLedger::getSubjectCode)
               .orderByAsc(FinanceLedger::getPeriod);
        dataScopeHelper.applyCreatorScope(wrapper, FinanceLedger::getCreateBy);
        return list(wrapper);
    }

    /** 余额表:按科目汇总的期初/发生/期末余额。 */
    public List<FinanceLedger> queryBalance(String startPeriod, String endPeriod) {
        LambdaQueryWrapper<FinanceLedger> wrapper = new LambdaQueryWrapper<>();
        wrapper.ge(StringUtils.hasText(startPeriod), FinanceLedger::getPeriod, startPeriod)
               .le(StringUtils.hasText(endPeriod), FinanceLedger::getPeriod, endPeriod)
               .orderByAsc(FinanceLedger::getSubjectCode);
        dataScopeHelper.applyCreatorScope(wrapper, FinanceLedger::getCreateBy);
        return list(wrapper);
    }

    /**
     * 明细账/序时账:按已过账凭证分录返回逐笔流水(关联 finance_voucher 取凭证日期/凭证号),
     * 并按科目逐笔计算累计余额(借方为正)。
     */
    public List<Map<String, Object>> queryDetailFlow(String subjectCode, String startPeriod, String endPeriod) {
        LambdaQueryWrapper<FinanceVoucher> vw = new LambdaQueryWrapper<>();
        vw.eq(FinanceVoucher::getStatus, 2)
          .ge(StringUtils.hasText(startPeriod), FinanceVoucher::getPeriod, startPeriod)
          .le(StringUtils.hasText(endPeriod), FinanceVoucher::getPeriod, endPeriod);
        dataScopeHelper.applyCreatorScope(vw, FinanceVoucher::getCreateBy);
        List<FinanceVoucher> vouchers = voucherMapper.selectList(vw);
        if (vouchers.isEmpty()) return Collections.emptyList();
        Map<Long, FinanceVoucher> vmap = vouchers.stream()
                .collect(Collectors.toMap(FinanceVoucher::getId, v -> v));

        LambdaQueryWrapper<FinanceVoucherEntry> ew = new LambdaQueryWrapper<>();
        ew.in(FinanceVoucherEntry::getVoucherId, vmap.keySet())
          .eq(StringUtils.hasText(subjectCode), FinanceVoucherEntry::getSubjectCode, subjectCode);
        List<FinanceVoucherEntry> entries = entryMapper.selectList(ew);
        if (entries.isEmpty()) return Collections.emptyList();

        entries.sort(Comparator
                .comparing(FinanceVoucherEntry::getSubjectCode)
                .thenComparing(e -> vmap.get(e.getVoucherId()).getVoucherDate()));

        List<Map<String, Object>> rows = new ArrayList<>();
        Map<String, BigDecimal> running = new HashMap<>();
        for (FinanceVoucherEntry e : entries) {
            FinanceVoucher v = vmap.get(e.getVoucherId());
            BigDecimal debit = e.getDebitAmount() == null ? BigDecimal.ZERO : e.getDebitAmount();
            BigDecimal credit = e.getCreditAmount() == null ? BigDecimal.ZERO : e.getCreditAmount();
            BigDecimal bal = running.getOrDefault(e.getSubjectCode(), BigDecimal.ZERO).add(debit).subtract(credit);
            running.put(e.getSubjectCode(), bal);
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("voucherDate", v.getVoucherDate());
            m.put("voucherNo", v.getVoucherNo());
            m.put("subjectCode", e.getSubjectCode());
            m.put("subjectName", e.getSubjectName());
            m.put("summary", e.getSummary());
            m.put("debitAmount", debit);
            m.put("creditAmount", credit);
            m.put("direction", bal.signum() >= 0 ? "DEBIT" : "CREDIT");
            m.put("balance", bal.abs());
            rows.add(m);
        }
        return rows;
    }
}
