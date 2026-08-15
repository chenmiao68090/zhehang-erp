package com.zhehang.erp.modules.crm.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.crm.domain.dto.SalesConsoleQuery;
import com.zhehang.erp.modules.crm.domain.vo.SalesConsoleVO;
import com.zhehang.erp.modules.crm.domain.vo.SalesStageCustomerVO;
import com.zhehang.erp.modules.crm.service.SalesOperatingConsoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/crm/sales-console")
@RequiredArgsConstructor
@PreAuthorize("@perm.hasAnyRole('sales', 'online_sales', 'dept_manager', 'manager', 'boss', 'super_admin')")
public class SalesOperatingConsoleController {

    private final SalesOperatingConsoleService service;

    @GetMapping("/overview")
    public R<SalesConsoleVO> overview(@ModelAttribute SalesConsoleQuery query) {
        return R.ok(service.overview(query));
    }

    @GetMapping("/stages/{stageCode}/customers")
    public R<IPage<SalesStageCustomerVO>> stageCustomers(
            @PathVariable String stageCode,
            @ModelAttribute SalesConsoleQuery query,
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "20") int pageSize) {
        return R.ok(service.stageCustomers(stageCode, query, pageNum, pageSize));
    }
}
