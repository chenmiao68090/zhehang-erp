package com.zhehang.erp.modules.admin.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.admin.domain.AdminHrExpense;
import com.zhehang.erp.modules.admin.mapper.AdminHrExpenseMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 行政管理-人事行政支出明细登记。
 */
@RestController
@RequestMapping("/admin/hr-expense")
@RequiredArgsConstructor
public class AdminHrExpenseController {

    private static final DateTimeFormatter NO_DATE = DateTimeFormatter.ofPattern("yyyyMMdd");

    private final AdminHrExpenseMapper mapper;

    @GetMapping("/list")
    public R<Map<String, Object>> list(@RequestParam(defaultValue = "1") Integer pageNum,
                                       @RequestParam(defaultValue = "10") Integer pageSize,
                                       @RequestParam(required = false) String month,
                                       @RequestParam(required = false) String category,
                                       @RequestParam(required = false) Long deptId,
                                       @RequestParam(required = false) String keyword) {
        LambdaQueryWrapper<AdminHrExpense> wrapper = baseWrapper(month, category, deptId, keyword)
                .orderByDesc(AdminHrExpense::getExpenseDate)
                .orderByDesc(AdminHrExpense::getId);
        IPage<AdminHrExpense> page = mapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
        Map<String, Object> result = new HashMap<>();
        result.put("page", page);
        result.put("stats", buildStats(month, category, deptId, keyword));
        return R.ok(result);
    }

    @GetMapping("/next-no")
    public R<String> nextNo(@RequestParam(required = false) String date) {
        LocalDate expenseDate = parseDate(date);
        return R.ok(nextExpenseNo(expenseDate));
    }

    @PostMapping("/save")
    @Log(module = "人事行政支出", type = Log.OperationType.UPDATE)
    public R<Void> save(@RequestBody AdminHrExpense entity) {
        normalize(entity);
        if (entity.getId() == null) {
            if (!StringUtils.hasText(entity.getExpenseNo())) {
                entity.setExpenseNo(nextExpenseNo(entity.getExpenseDate()));
            }
            mapper.insert(entity);
        } else {
            mapper.updateById(entity);
        }
        return R.ok();
    }

    @DeleteMapping("/{id}")
    @Log(module = "人事行政支出", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        mapper.deleteById(id);
        return R.ok();
    }

    private LambdaQueryWrapper<AdminHrExpense> baseWrapper(String month, String category, Long deptId, String keyword) {
        LambdaQueryWrapper<AdminHrExpense> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(month)) {
            String m = month.trim();
            LocalDate start = monthStart(m);
            wrapper.ge(AdminHrExpense::getExpenseDate, start)
                    .lt(AdminHrExpense::getExpenseDate, start.plusMonths(1));
        }
        wrapper.eq(StringUtils.hasText(category), AdminHrExpense::getCategory, category)
                .eq(deptId != null, AdminHrExpense::getDeptId, deptId)
                .and(StringUtils.hasText(keyword), w -> w
                        .like(AdminHrExpense::getExpenseNo, keyword)
                        .or().like(AdminHrExpense::getContent, keyword)
                        .or().like(AdminHrExpense::getRemark, keyword));
        return wrapper;
    }

    private Map<String, Object> buildStats(String month, String category, Long deptId, String keyword) {
        List<AdminHrExpense> list = mapper.selectList(baseWrapper(month, category, deptId, keyword));
        BigDecimal filtered = sum(list);
        LocalDate today = LocalDate.now();
        Map<String, Object> stats = new HashMap<>();
        stats.put("filteredTotal", filtered);
        stats.put("monthTotal", sumByRange(today.withDayOfMonth(1), today.withDayOfMonth(1).plusMonths(1)));
        stats.put("lastMonthTotal", sumByRange(today.withDayOfMonth(1).minusMonths(1), today.withDayOfMonth(1)));
        LocalDate quarterStart = today.withMonth(((today.getMonthValue() - 1) / 3) * 3 + 1).withDayOfMonth(1);
        stats.put("quarterTotal", sumByRange(quarterStart, quarterStart.plusMonths(3)));
        LocalDate yearStart = today.withDayOfYear(1);
        stats.put("yearTotal", sumByRange(yearStart, yearStart.plusYears(1)));
        return stats;
    }

    private BigDecimal sumByRange(LocalDate start, LocalDate end) {
        List<AdminHrExpense> list = mapper.selectList(new LambdaQueryWrapper<AdminHrExpense>()
                .ge(AdminHrExpense::getExpenseDate, start)
                .lt(AdminHrExpense::getExpenseDate, end));
        return sum(list);
    }

    private BigDecimal sum(List<AdminHrExpense> list) {
        BigDecimal total = BigDecimal.ZERO;
        for (AdminHrExpense item : list) {
            total = total.add(item.getTotalPrice() == null ? BigDecimal.ZERO : item.getTotalPrice());
        }
        return total;
    }

    private void normalize(AdminHrExpense entity) {
        if (entity == null) {
            throw new BusinessException("支出明细不能为空");
        }
        if (entity.getExpenseDate() == null) {
            entity.setExpenseDate(LocalDate.now());
        }
        if (!StringUtils.hasText(entity.getCategory())) {
            throw new BusinessException("请选择费用大类");
        }
        if (!StringUtils.hasText(entity.getContent())) {
            throw new BusinessException("请填写具体支出内容");
        }
        int qty = entity.getQuantity() == null || entity.getQuantity() < 1 ? 1 : entity.getQuantity();
        BigDecimal unit = entity.getUnitPrice() == null ? BigDecimal.ZERO : entity.getUnitPrice();
        entity.setQuantity(qty);
        entity.setUnitPrice(unit);
        entity.setTotalPrice(unit.multiply(BigDecimal.valueOf(qty)));
        if (!StringUtils.hasText(entity.getStatus())) {
            entity.setStatus("待提交");
        }
    }

    private String nextExpenseNo(LocalDate expenseDate) {
        LocalDate d = expenseDate == null ? LocalDate.now() : expenseDate;
        String prefix = "FY-" + d.format(NO_DATE) + "-";
        Long count = mapper.selectCount(new LambdaQueryWrapper<AdminHrExpense>()
                .likeRight(AdminHrExpense::getExpenseNo, prefix));
        return prefix + String.format("%03d", count + 1);
    }

    private LocalDate parseDate(String date) {
        if (!StringUtils.hasText(date)) {
            return LocalDate.now();
        }
        try {
            return LocalDate.parse(date.trim().substring(0, 10));
        } catch (Exception e) {
            return LocalDate.now();
        }
    }

    private LocalDate monthStart(String month) {
        try {
            return LocalDate.parse(month + "-01");
        } catch (Exception e) {
            return LocalDate.now().withDayOfMonth(1);
        }
    }
}
