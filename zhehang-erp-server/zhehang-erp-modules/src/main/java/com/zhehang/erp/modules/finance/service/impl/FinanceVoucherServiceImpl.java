package com.zhehang.erp.modules.finance.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.finance.domain.entity.FinanceLedger;
import com.zhehang.erp.modules.finance.domain.entity.FinanceVoucher;
import com.zhehang.erp.modules.finance.domain.entity.FinanceVoucherEntry;
import com.zhehang.erp.modules.finance.mapper.FinanceVoucherMapper;
import com.zhehang.erp.modules.finance.mapper.FinanceVoucherEntryMapper;
import com.zhehang.erp.modules.finance.service.IFinanceLedgerService;
import com.zhehang.erp.modules.finance.service.IFinanceVoucherService;
import lombok.RequiredArgsConstructor;
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

@Service
@RequiredArgsConstructor
public class FinanceVoucherServiceImpl extends ServiceImpl<FinanceVoucherMapper, FinanceVoucher> implements IFinanceVoucherService {

    private final FinanceVoucherEntryMapper entryMapper;
    private final IFinanceLedgerService ledgerService;

    public IPage<FinanceVoucher> selectPage(Integer pageNum, Integer pageSize, String period, Integer status, String voucherType, String voucherNo) {
        LambdaQueryWrapper<FinanceVoucher> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(StringUtils.hasText(period), FinanceVoucher::getPeriod, period)
               .eq(status != null, FinanceVoucher::getStatus, status)
               .eq(StringUtils.hasText(voucherType), FinanceVoucher::getVoucherType, voucherType)
               .like(StringUtils.hasText(voucherNo), FinanceVoucher::getVoucherNo, voucherNo)
               .orderByDesc(FinanceVoucher::getVoucherDate);
        return page(new Page<>(pageNum, pageSize), wrapper);
    }

    public Map<String, Object> getDetail(Long id) {
        FinanceVoucher voucher = getById(id);
        List<FinanceVoucherEntry> entries = entryMapper.selectList(
            new LambdaQueryWrapper<FinanceVoucherEntry>().eq(FinanceVoucherEntry::getVoucherId, id));
        Map<String, Object> result = new HashMap<>();
        result.put("voucher", voucher);
        result.put("entries", entries);
        return result;
    }

    @Transactional(rollbackFor = Exception.class)
    public void createVoucher(FinanceVoucher voucher, List<FinanceVoucherEntry> entries) {
        validateBalance(entries);
        voucher.setVoucherNo(generateVoucherNo(voucher.getVoucherType()));
        voucher.setStatus(0);
        voucher.setPeriod(voucher.getVoucherDate().format(DateTimeFormatter.ofPattern("yyyy-MM")));
        BigDecimal totalDebit = entries.stream().map(FinanceVoucherEntry::getDebitAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalCredit = entries.stream().map(FinanceVoucherEntry::getCreditAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        voucher.setTotalDebit(totalDebit);
        voucher.setTotalCredit(totalCredit);
        save(voucher);
        entries.forEach(e -> { e.setVoucherId(voucher.getId()); entryMapper.insert(e); });
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateVoucher(FinanceVoucher voucher, List<FinanceVoucherEntry> entries) {
        FinanceVoucher existing = getById(voucher.getId());
        if (existing.getStatus() != 0) {
            throw new BusinessException("Only draft vouchers can be modified");
        }
        validateBalance(entries);
        BigDecimal totalDebit = entries.stream().map(FinanceVoucherEntry::getDebitAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalCredit = entries.stream().map(FinanceVoucherEntry::getCreditAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        voucher.setTotalDebit(totalDebit);
        voucher.setTotalCredit(totalCredit);
        updateById(voucher);
        entryMapper.delete(new LambdaQueryWrapper<FinanceVoucherEntry>().eq(FinanceVoucherEntry::getVoucherId, voucher.getId()));
        entries.forEach(e -> { e.setVoucherId(voucher.getId()); entryMapper.insert(e); });
    }

    public void audit(Long id) {
        FinanceVoucher voucher = getById(id);
        if (voucher.getStatus() != 0) {
            throw new BusinessException("Only draft vouchers can be audited");
        }
        voucher.setStatus(1);
        voucher.setReviewTime(LocalDateTime.now());
        updateById(voucher);
    }

    @Transactional(rollbackFor = Exception.class)
    public void postVoucher(Long id) {
        FinanceVoucher voucher = getById(id);
        if (voucher.getStatus() != 1) {
            throw new BusinessException("Only audited vouchers can be posted");
        }
        voucher.setStatus(2);
        updateById(voucher);
        updateLedger(id, voucher.getPeriod());
    }

    public void voidVoucher(Long id) {
        FinanceVoucher voucher = getById(id);
        if (voucher.getStatus() == 3) {
            throw new BusinessException("Voucher is already void");
        }
        voucher.setStatus(3);
        updateById(voucher);
    }

    public void deleteVoucher(Long id) {
        FinanceVoucher voucher = getById(id);
        if (voucher.getStatus() != 0) {
            throw new BusinessException("Only draft vouchers can be deleted");
        }
        removeById(id);
        entryMapper.delete(new LambdaQueryWrapper<FinanceVoucherEntry>().eq(FinanceVoucherEntry::getVoucherId, id));
    }

    private void validateBalance(List<FinanceVoucherEntry> entries) {
        BigDecimal totalDebit = entries.stream().map(FinanceVoucherEntry::getDebitAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalCredit = entries.stream().map(FinanceVoucherEntry::getCreditAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        if (totalDebit.compareTo(totalCredit) != 0) {
            throw new BusinessException("Debit and credit must be balanced");
        }
    }

    private void updateLedger(Long voucherId, String period) {
        List<FinanceVoucherEntry> entries = entryMapper.selectList(
            new LambdaQueryWrapper<FinanceVoucherEntry>().eq(FinanceVoucherEntry::getVoucherId, voucherId));
        for (FinanceVoucherEntry entry : entries) {
            FinanceLedger ledger = ledgerService.getOne(
                new LambdaQueryWrapper<FinanceLedger>()
                    .eq(FinanceLedger::getSubjectCode, entry.getSubjectCode())
                    .eq(FinanceLedger::getPeriod, period));
            if (ledger == null) {
                ledger = new FinanceLedger();
                ledger.setSubjectCode(entry.getSubjectCode());
                ledger.setSubjectName(entry.getSubjectName());
                ledger.setPeriod(period);
                ledger.setOpeningBalance(BigDecimal.ZERO);
                ledger.setDebitTotal(entry.getDebitAmount());
                ledger.setCreditTotal(entry.getCreditAmount());
                ledger.setClosingBalance(entry.getDebitAmount().subtract(entry.getCreditAmount()));
                ledger.setDirection(entry.getDebitAmount().compareTo(entry.getCreditAmount()) >= 0 ? "DEBIT" : "CREDIT");
                ledgerService.save(ledger);
            } else {
                ledger.setDebitTotal(ledger.getDebitTotal().add(entry.getDebitAmount()));
                ledger.setCreditTotal(ledger.getCreditTotal().add(entry.getCreditAmount()));
                BigDecimal balance = ledger.getOpeningBalance().add(ledger.getDebitTotal()).subtract(ledger.getCreditTotal());
                ledger.setClosingBalance(balance.abs());
                ledger.setDirection(balance.signum() >= 0 ? "DEBIT" : "CREDIT");
                ledgerService.updateById(ledger);
            }
        }
    }

    private String generateVoucherNo(String type) {
        String prefix = type + "-" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) + "-";
        long count = count(new LambdaQueryWrapper<FinanceVoucher>()
            .likeRight(FinanceVoucher::getVoucherNo, prefix));
        return prefix + String.format("%04d", count + 1);
    }
}
