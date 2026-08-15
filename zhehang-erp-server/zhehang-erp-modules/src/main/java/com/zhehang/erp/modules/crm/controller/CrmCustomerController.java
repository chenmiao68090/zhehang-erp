package com.zhehang.erp.modules.crm.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.crm.domain.dto.CrmCustomerFollowDTO;
import com.zhehang.erp.modules.crm.domain.entity.CrmCustomer;
import com.zhehang.erp.modules.crm.domain.vo.CrmCustomer360VO;
import com.zhehang.erp.modules.crm.domain.vo.CrmCustomerPortfolioPageVO;
import com.zhehang.erp.modules.crm.service.CrmCustomer360Service;
import com.zhehang.erp.modules.crm.service.CrmCustomerPortfolioService;
import com.zhehang.erp.modules.crm.service.ICrmCustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/crm/customer")
@RequiredArgsConstructor
public class CrmCustomerController {

    private final ICrmCustomerService customerService;
    private final com.zhehang.erp.modules.crm.support.DataScopeHelper dataScopeHelper;
    private final CrmCustomerPortfolioService portfolioService;
    private final CrmCustomer360Service customer360Service;

    @GetMapping("/portfolio")
    public R<CrmCustomerPortfolioPageVO> portfolio(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "20") Integer pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String level,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) Long ownerId,
            @RequestParam(required = false) String serviceType,
            @RequestParam(defaultValue = "all") String attention) {
        return R.ok(portfolioService.page(pageNum, pageSize, keyword, level, status, ownerId,
                serviceType, attention));
    }

    @GetMapping("/{id}/360")
    public R<CrmCustomer360VO> customer360(@PathVariable Long id) {
        return R.ok(customer360Service.getByCustomerId(id));
    }

    @PostMapping("/{id}/follow")
    @Log(module = "正式客户", type = Log.OperationType.INSERT)
    public R<Void> follow(@PathVariable Long id, @RequestBody CrmCustomerFollowDTO dto) {
        portfolioService.addFollow(id, dto);
        return R.ok();
    }

    @GetMapping("/list")
    public R<IPage<CrmCustomer>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String level,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) Long ownerId) {
        return R.ok(customerService.selectPage(pageNum, pageSize, name, level, status, ownerId));
    }

    @GetMapping("/{id}")
    public R<CrmCustomer> getInfo(@PathVariable Long id) {
        CrmCustomer customer = customerService.getById(id);
        // 越权校验:员工改 URL 传别人的客户ID也打不开
        if (customer != null && !dataScopeHelper.canAccess(customer.getOwnerId(), customer.getDeptId())) {
            return R.fail(403, "无权限查看该客户");
        }
        return R.ok(customer);
    }

    @PostMapping
    @Log(module = "客户管理", type = Log.OperationType.INSERT)
    public R<Void> add(@RequestBody CrmCustomer customer) {
        customerService.save(customer);
        return R.ok();
    }

    @PutMapping
    @Log(module = "客户管理", type = Log.OperationType.UPDATE)
    public R<Void> edit(@RequestBody CrmCustomer customer) {
        customerService.updateAccessible(customer);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    @Log(module = "客户管理", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        customerService.removeAccessible(id);
        return R.ok();
    }

    @PostMapping("/toPool/{id}")
    @Log(module = "客户管理", type = Log.OperationType.UPDATE)
    public R<Void> toPool(@PathVariable Long id, @RequestBody Map<String, String> params) {
        customerService.toPool(id, params.get("reason"));
        return R.ok();
    }
}
