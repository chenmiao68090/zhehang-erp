package com.zhehang.erp.modules.finance.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.finance.domain.entity.FinanceReimburse;
import com.zhehang.erp.modules.finance.service.impl.FinanceReimburseServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/finance/reimburse")
@RequiredArgsConstructor
@org.springframework.security.access.prepost.PreAuthorize("@perm.hasModule('finance')")
public class FinanceReimburseController {

    private final FinanceReimburseServiceImpl reimburseService;
    private final DataScopeHelper dataScopeHelper;

    @GetMapping("/list")
    public R<IPage<FinanceReimburse>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String reimburseNo,
            @RequestParam(required = false) Long applicantId,
            @RequestParam(required = false) Integer status) {
        return R.ok(reimburseService.selectPage(pageNum, pageSize, reimburseNo, applicantId, status));
    }

    @GetMapping("/{id}")
    public R<FinanceReimburse> getInfo(@PathVariable Long id) {
        return R.ok(reimburseService.getById(id));
    }

    @PostMapping
    @Log(module = "Finance Reimburse", type = Log.OperationType.INSERT)
    public R<Void> submit(@RequestBody FinanceReimburse reimburse) {
        reimburse.setStatus(1);
        reimburseService.save(reimburse);
        return R.ok();
    }

    @PutMapping
    @Log(module = "Finance Reimburse", type = Log.OperationType.UPDATE)
    public R<Void> update(@RequestBody FinanceReimburse reimburse) {
        // 状态只能走 approve/pay/驳回,update 不允许改 status(否则可 PUT status=4 伪造"已付款"绕过审批)
        if (reimburse.getId() != null) {
            FinanceReimburse existing = reimburseService.getById(reimburse.getId());
            if (existing != null) {
                // 状态流转校验:仅 草稿(0)/待审批(1) 可编辑;已通过(2)/已驳回(3)/已付款(4) 不允许再改回(否则驳回单可被重新提交触发审批)
                Integer status = existing.getStatus();
                if (status != null && status != 0 && status != 1) {
                    throw new com.zhehang.erp.common.core.exception.BusinessException("该报销单状态不允许修改");
                }
                reimburse.setStatus(existing.getStatus());
            }
        }
        reimburseService.updateById(reimburse);
        return R.ok();
    }

    /**
     * 直接审批口(兼容保留,前端已无调用方):正路是审批中心 expense 流程 → 回调回写。
     * 门禁从"有 finance 模块就能批"收紧为审批角色(财务负责人/部门主管/管理员)。
     */
    @PutMapping("/approve")
    @Log(module = "Finance Reimburse", type = Log.OperationType.UPDATE)
    public R<Void> approve(@RequestBody Map<String, Object> params) {
        if (!dataScopeHelper.isManagerOrAdmin() && !SecurityUtils.hasAnyRole("finance_hq")) {
            return R.fail(403, "无权审批报销,仅财务负责人/部门主管/管理员可操作");
        }
        Long id = Long.valueOf(params.get("id").toString());
        boolean approved = Boolean.parseBoolean(params.get("approved").toString());
        reimburseService.approve(id, approved);
        return R.ok();
    }

    @PutMapping("/pay/{id}")
    @Log(module = "Finance Reimburse", type = Log.OperationType.UPDATE)
    public R<Void> pay(@PathVariable Long id) {
        reimburseService.pay(id);
        return R.ok();
    }
}
