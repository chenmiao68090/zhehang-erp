package com.zhehang.erp.modules.analysis.controller;

import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.analysis.service.AnalysisService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.Map;

/**
 * 经营分析(只读看板):老板/主管/经理可见,数据范围=全公司(分析定位)。
 */
@RestController
@RequestMapping("/analysis")
@RequiredArgsConstructor
public class AnalysisController {

    private final AnalysisService analysisService;

    @GetMapping("/overview")
    @PreAuthorize("@perm.hasAnyRole('dept_manager', 'manager', 'boss', 'super_admin')")
    public R<Map<String, Object>> overview(@RequestParam(required = false) Integer year) {
        return R.ok(analysisService.overview(year == null ? LocalDate.now().getYear() : year));
    }

    @GetMapping("/new-orders")
    @PreAuthorize("@perm.hasAnyRole('dept_manager', 'manager', 'boss', 'super_admin')")
    public R<Map<String, Object>> newOrders(@RequestParam(required = false) Integer year,
                                            @RequestParam(required = false) Integer month) {
        return R.ok(analysisService.newOrders(year == null ? LocalDate.now().getYear() : year, month));
    }

    @GetMapping("/renewal")
    @PreAuthorize("@perm.hasAnyRole('dept_manager', 'manager', 'boss', 'super_admin')")
    public R<Map<String, Object>> renewal(@RequestParam(required = false) Integer year) {
        return R.ok(analysisService.renewal(year == null ? LocalDate.now().getYear() : year));
    }

    @GetMapping("/loss")
    @PreAuthorize("@perm.hasAnyRole('dept_manager', 'manager', 'boss', 'super_admin')")
    public R<Map<String, Object>> loss() {
        return R.ok(analysisService.loss());
    }

    @GetMapping("/customer-value")
    @PreAuthorize("@perm.hasAnyRole('dept_manager', 'manager', 'boss', 'super_admin')")
    public R<Map<String, Object>> customerValue() {
        return R.ok(analysisService.customerValue());
    }

    @GetMapping("/lead-roi")
    @PreAuthorize("@perm.hasAnyRole('dept_manager', 'manager', 'boss', 'super_admin')")
    public R<Map<String, Object>> leadRoi(@RequestParam(required = false) String start,
                                          @RequestParam(required = false) String end) {
        return R.ok(analysisService.leadRoi(start, end));
    }

    @GetMapping("/sales")
    @PreAuthorize("@perm.hasAnyRole('dept_manager', 'manager', 'boss', 'super_admin')")
    public R<Map<String, Object>> sales(@RequestParam(required = false) Integer year) {
        return R.ok(analysisService.sales(year == null ? LocalDate.now().getYear() : year));
    }
}
