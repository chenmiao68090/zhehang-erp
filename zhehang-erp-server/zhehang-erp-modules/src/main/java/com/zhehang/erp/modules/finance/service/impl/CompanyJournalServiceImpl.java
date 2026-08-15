package com.zhehang.erp.modules.finance.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.finance.domain.dto.CompanyJournalQuery;
import com.zhehang.erp.modules.finance.domain.entity.FinCompanyJournal;
import com.zhehang.erp.modules.finance.mapper.FinCompanyJournalMapper;
import com.zhehang.erp.modules.finance.service.ICompanyJournalService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 收款登记 / 公司日记账服务实现。
 * 自动编号对齐飞书格式:{年份}年度CM{MMdd}日进斗金{5位全局流水}。
 * 公式列(毛利/剩余尾款/合同到期日期/收款时间/编号代码)在保存时由服务端计算。
 * 注:公式口径为合理默认值,确切算法待与飞书核对后调整(集中在 recalcFormulas / genAutoNo)。
 */
@Service
public class CompanyJournalServiceImpl
        extends ServiceImpl<FinCompanyJournalMapper, FinCompanyJournal>
        implements ICompanyJournalService {

    private static final DateTimeFormatter MMDD = DateTimeFormatter.ofPattern("MMdd");
    private static final Pattern DIGITS = Pattern.compile("\\d+");

    @Override
    public IPage<FinCompanyJournal> selectPage(CompanyJournalQuery criteria) {
        CompanyJournalQuery query = criteria == null ? new CompanyJournalQuery() : criteria;
        LambdaQueryWrapper<FinCompanyJournal> w = new LambdaQueryWrapper<>();
        w.ge(query.getReceiptDateStart() != null, FinCompanyJournal::getReceiptDate, query.getReceiptDateStart())
                .le(query.getReceiptDateEnd() != null, FinCompanyJournal::getReceiptDate, query.getReceiptDateEnd())
                .eq(StringUtils.hasText(query.getBelongDept()), FinCompanyJournal::getBelongDept, query.getBelongDept())
                .eq(StringUtils.hasText(query.getOrderStatus()), FinCompanyJournal::getOrderStatus, query.getOrderStatus())
                .eq(StringUtils.hasText(query.getSignType()), FinCompanyJournal::getSignType, query.getSignType())
                .eq(StringUtils.hasText(query.getReceiptType()), FinCompanyJournal::getReceiptType, query.getReceiptType())
                .eq(StringUtils.hasText(query.getReceiveAccount()), FinCompanyJournal::getReceiveAccount, query.getReceiveAccount());
        if (StringUtils.hasText(query.getKeyword())) {
            String kw = query.getKeyword().trim();
            w.and(n -> n.like(FinCompanyJournal::getCompanyName, kw)
                    .or().like(FinCompanyJournal::getAutoNo, kw)
                    .or().like(FinCompanyJournal::getLegalName, kw)
                    .or().like(FinCompanyJournal::getReceiptCompanyName, kw)
                    .or().like(FinCompanyJournal::getReceiptContactName, kw)
                    .or().like(FinCompanyJournal::getBankSerialNo, kw));
        }
        w.orderByDesc(FinCompanyJournal::getReceiptDate).orderByDesc(FinCompanyJournal::getId);
        int pageNum = query.getPageNum() != null && query.getPageNum() > 0 ? query.getPageNum() : 1;
        int pageSize = query.getPageSize() != null && query.getPageSize() > 0
                ? Math.min(query.getPageSize(), 200) : 20;
        return page(new Page<>(pageNum, pageSize), w);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long saveJournal(FinCompanyJournal entity) {
        if (entity == null) {
            throw new BusinessException("登记内容不能为空");
        }
        if (!StringUtils.hasText(entity.getCompanyName())) {
            throw new BusinessException("公司名称必填");
        }
        boolean isCreate = entity.getId() == null;
        recalcFormulas(entity);
        if (isCreate) {
            if (entity.getFullPaidConfirmed() == null) {
                entity.setFullPaidConfirmed(0);
            }
            entity.setVersion(0);
            boolean callerAutoNo = StringUtils.hasText(entity.getAutoNo());
            // 并发新增会取到同一个流水号,唯一索引兜底后在这里重取重试(收款中心认领+手工登记双写入路径)
            for (int attempt = 1; ; attempt++) {
                if (!callerAutoNo) {
                    // 重试轮用 FOR UPDATE 锁定读:RR 隔离下普通 SELECT 读旧快照会一直取到同一个号
                    entity.setAutoNo(genAutoNo(entity, attempt > 1));
                }
                entity.setCodeNo(genCodeNo(entity));
                try {
                    save(entity);
                    break;
                } catch (org.springframework.dao.DuplicateKeyException e) {
                    if (callerAutoNo || attempt >= 3) {
                        throw new BusinessException("自动编号冲突,请稍后重试");
                    }
                    entity.setId(null);
                }
            }
        } else {
            entity.setCodeNo(genCodeNo(entity));
            if (!updateById(entity)) {
                throw new BusinessException("保存失败:记录不存在或已被其他人更新,请刷新后重试");
            }
        }
        return entity.getId();
    }

    @Override
    public boolean removeJournal(Long id) {
        if (id == null) {
            throw new BusinessException("缺少记录id");
        }
        return removeById(id);
    }

    // ================= 公式列计算(口径为合理默认,待与飞书核对) =================

    private void recalcFormulas(FinCompanyJournal e) {
        // 收款时间:由收款日期派生(取当日 00:00)
        e.setReceiptTime(e.getReceiptDate() != null ? e.getReceiptDate().atStartOfDay() : null);
        // 地址毛利 = 挂靠地址收费 - 地址支出金额
        e.setProfitAddress(bd(e.getFeeAddress()).subtract(bd(e.getExpenseAddressAmount())));
        // 增值业务毛利 = 增值业务收费 - 增值支出 - 二次支出
        e.setProfitValueAdded(bd(e.getFeeValueAdded())
                .subtract(bd(e.getValueAddedExpenseAmount()))
                .subtract(bd(e.getSecondExpenseAmount())));
        // 总毛利 = 各项收费合计 - 各项支出合计
        BigDecimal feeSum = bd(e.getFeeAgency()).add(bd(e.getFeeAddress()))
                .add(bd(e.getFeeBusiness())).add(bd(e.getFeeValueAdded()));
        BigDecimal expSum = bd(e.getExpenseAddressAmount())
                .add(bd(e.getValueAddedExpenseAmount())).add(bd(e.getSecondExpenseAmount()));
        e.setProfitTotal(feeSum.subtract(expSum));
        // 剩余尾款 = 合同总金额 - 本次到款金额(合同总金额为空则不计算)
        if (e.getContractAmount() != null) {
            e.setRemainingAmount(e.getContractAmount().subtract(bd(e.getReceivedAmount())));
        } else {
            e.setRemainingAmount(null);
        }
        // 合同到期日期 = 服务开始日期 + 付款周期月数 + 赠送月份
        int months = cycleMonths(e.getPaymentCycle()) + giftMonths(e.getGiftMonths());
        if (e.getServiceStartDate() != null && months > 0) {
            e.setContractEndDate(e.getServiceStartDate().plusMonths(months));
        } else {
            e.setContractEndDate(null);
        }
    }

    /** 自动编号:{年份}年度CM{MMdd}日进斗金{5位全局流水}。全局流水取现有最大尾号+1,唯一索引兜底。 */
    private String genAutoNo(FinCompanyJournal e, boolean locking) {
        String year = extractYear(e);
        LocalDate d = e.getReceiptDate() != null ? e.getReceiptDate() : LocalDate.now();
        int seq = nextGlobalSeq(locking);
        return year + "年度CM" + d.format(MMDD) + "日进斗金" + String.format("%05d", seq);
    }

    /** 全局流水 = 现有 auto_no 尾 5 位数字的最大值 + 1(按租户隔离)。locking=true 用 FOR UPDATE 取最新值。 */
    private int nextGlobalSeq(boolean locking) {
        QueryWrapper<FinCompanyJournal> qw = new QueryWrapper<FinCompanyJournal>()
                .select("IFNULL(MAX(CAST(RIGHT(auto_no, 5) AS UNSIGNED)), 0) AS max_seq")
                .isNotNull("auto_no");
        if (locking) {
            qw.last("FOR UPDATE");
        }
        List<Map<String, Object>> rows = baseMapper.selectMaps(qw);
        Object v = (rows != null && !rows.isEmpty()) ? rows.get(0).get("max_seq") : null;
        int max;
        try {
            max = v == null ? 0 : Integer.parseInt(String.valueOf(v));
        } catch (NumberFormatException ex) {
            max = 0;
        }
        return max + 1;
    }

    /** 编号代码:{年份}{2位月份}{5位流水},取自 auto_no 尾号,业务编码用。 */
    private String genCodeNo(FinCompanyJournal e) {
        String year = extractYear(e);
        String month = extractMonth(e);
        String seq = "00000";
        if (StringUtils.hasText(e.getAutoNo()) && e.getAutoNo().length() >= 5) {
            String tail = e.getAutoNo().substring(e.getAutoNo().length() - 5);
            if (tail.matches("\\d{5}")) {
                seq = tail;
            }
        }
        return year + month + seq;
    }

    private String extractYear(FinCompanyJournal e) {
        Matcher m = DIGITS.matcher(e.getPerfYear() == null ? "" : e.getPerfYear());
        if (m.find() && m.group().length() == 4) {
            return m.group();
        }
        LocalDate d = e.getReceiptDate() != null ? e.getReceiptDate() : LocalDate.now();
        return String.valueOf(d.getYear());
    }

    private String extractMonth(FinCompanyJournal e) {
        Matcher m = DIGITS.matcher(e.getPerfMonth() == null ? "" : e.getPerfMonth());
        if (m.find()) {
            return String.format("%02d", Integer.parseInt(m.group()));
        }
        LocalDate d = e.getReceiptDate() != null ? e.getReceiptDate() : LocalDate.now();
        return String.format("%02d", d.getMonthValue());
    }

    private int cycleMonths(String cycle) {
        if (!StringUtils.hasText(cycle)) {
            return 0;
        }
        switch (cycle) {
            case "月度收费":
                return 1;
            case "两个月":
                return 2;
            case "三个月收费":
            case "季度收费":
                return 3;
            case "半年度收费":
                return 6;
            case "年度收费":
                return 12;
            case "两年版套餐":
                return 24;
            case "三年版套餐":
                return 36;
            default: // 单次业务收费/其他
                return 0;
        }
    }

    private int giftMonths(String gift) {
        if (!StringUtils.hasText(gift)) {
            return 0;
        }
        int total = 0;
        for (String g : gift.split(",")) {
            switch (g.trim()) {
                case "一个月":
                    total += 1;
                    break;
                case "两个月":
                    total += 2;
                    break;
                case "三个月":
                    total += 3;
                    break;
                case "六个月":
                    total += 6;
                    break;
                case "送一年":
                    total += 12;
                    break;
                default: // 无赠送
                    break;
            }
        }
        return total;
    }

    private BigDecimal bd(BigDecimal v) {
        return v == null ? BigDecimal.ZERO : v;
    }
}
