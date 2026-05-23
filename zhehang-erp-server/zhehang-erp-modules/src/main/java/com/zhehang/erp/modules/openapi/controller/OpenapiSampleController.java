package com.zhehang.erp.modules.openapi.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.crm.domain.entity.CrmCustomer;
import com.zhehang.erp.modules.crm.service.ICrmCustomerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 开放API示例接口
 * 受签名鉴权 + 限流双重保护（通过 OpenapiSignFilter + OpenapiRateLimitFilter）
 */
@Tag(name = "开放API - 示例接口")
@RestController
@RequestMapping("/openapi/v1")
@RequiredArgsConstructor
public class OpenapiSampleController {

    private final ICrmCustomerService customerService;

    @Operation(summary = "客户列表")
    @GetMapping("/customer/list")
    public R<IPage<CrmCustomer>> customerList(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "20") Integer pageSize) {
        IPage<CrmCustomer> page = customerService.page(new Page<>(pageNum, pageSize));
        return R.ok(page);
    }

    @Operation(summary = "员工列表（简版）")
    @GetMapping("/employee/list")
    public R<Map<String, Object>> employeeList(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "20") Integer pageSize) {
        // 简化版：返回当前接口受保护的提示 + 分页参数
        // 实际可注入 HRM 员工 Service 查询
        Map<String, Object> result = new HashMap<>();
        result.put("pageNum", pageNum);
        result.put("pageSize", pageSize);
        result.put("message", "员工列表接口已开放，需接入 HRM 模块后返回真实数据");
        return R.ok(result);
    }
}
