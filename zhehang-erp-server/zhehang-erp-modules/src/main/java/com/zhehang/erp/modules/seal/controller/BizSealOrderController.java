package com.zhehang.erp.modules.seal.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.annotation.DenyDuringImpersonation;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.seal.domain.BizSealOrder;
import com.zhehang.erp.modules.seal.mapper.BizSealOrderMapper;
import com.zhehang.erp.modules.task.domain.BizTask;
import com.zhehang.erp.modules.task.service.IBizTaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

/**
 * 刻章业务·每日客户登记。
 */
@RestController
@RequestMapping("/seal/order")
@RequiredArgsConstructor
@DenyDuringImpersonation(reason = "刻章登记包含身份证照片和个人收款码")
public class BizSealOrderController {

    private final BizSealOrderMapper orderMapper;
    private final IBizTaskService taskService;

    @GetMapping("/list")
    public R<IPage<BizSealOrder>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer needInvoice,
            @RequestParam(required = false) Integer invoiceDone) {
        LambdaQueryWrapper<BizSealOrder> qw = new LambdaQueryWrapper<BizSealOrder>()
                .like(StringUtils.hasText(keyword), BizSealOrder::getCompanyName, keyword)
                .eq(StringUtils.hasText(status), BizSealOrder::getStatus, status)
                .eq(needInvoice != null, BizSealOrder::getNeedInvoice, needInvoice)
                .eq(invoiceDone != null, BizSealOrder::getInvoiceDone, invoiceDone)
                .orderByDesc(BizSealOrder::getRegDate)
                .orderByDesc(BizSealOrder::getId);
        return R.ok(orderMapper.selectPage(new Page<>(pageNum, pageSize), qw));
    }

    @PostMapping
    @Log(module = "刻章业务", type = Log.OperationType.INSERT)
    public R<Void> add(@RequestBody BizSealOrder order) {
        if (order.getStatus() == null || order.getStatus().isBlank()) {
            order.setStatus("pending");
        }
        orderMapper.insert(order);
        pushInvoiceTask(order);
        return R.ok();
    }

    /** 需开票时给会计建一条站内待办(通用待办,会计在任务中心可见)。失败不阻断保存。 */
    private void pushInvoiceTask(BizSealOrder order) {
        try {
            if (order.getNeedInvoice() == null || order.getNeedInvoice() != 1) {
                return;
            }
            if (order.getInvoiceDone() != null && order.getInvoiceDone() == 1) {
                return;
            }
            BizTask task = new BizTask();
            task.setTitle("刻章待开票:" + (order.getCompanyName() == null ? "" : order.getCompanyName()));
            task.setTaskType("seal_invoice");
            task.setBizType("seal_order");
            task.setBizId(order.getId());
            task.setExecutorName("会计");
            task.setDescription("刻章业务「" + order.getCompanyName() + "」需开具发票,开票信息:" + (order.getInvoiceInfo() == null ? "(见单据)" : order.getInvoiceInfo()));
            taskService.createTask(task);
        } catch (Exception ignore) {
            // 待办创建失败不阻断刻章单保存
        }
    }

    @PutMapping
    @Log(module = "刻章业务", type = Log.OperationType.UPDATE)
    public R<Void> edit(@RequestBody BizSealOrder order) {
        orderMapper.updateById(order);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    @Log(module = "刻章业务", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        orderMapper.deleteById(id);
        return R.ok();
    }
}
