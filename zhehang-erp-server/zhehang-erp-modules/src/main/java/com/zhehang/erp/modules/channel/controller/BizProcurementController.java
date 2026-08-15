package com.zhehang.erp.modules.channel.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.channel.domain.BizProcurement;
import com.zhehang.erp.modules.channel.mapper.BizProcurementMapper;
import com.zhehang.erp.modules.channel.service.IBizChannelService;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/procurement")
@RequiredArgsConstructor
public class BizProcurementController {

    private final IBizChannelService channelService;
    private final BizProcurementMapper procurementMapper;
    private final DataScopeHelper dataScopeHelper;

    @GetMapping("/list")
    public R<IPage<BizProcurement>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) Long supplierId,
            @RequestParam(required = false) String status) {
        return R.ok(channelService.procurementList(pageNum, pageSize, supplierId, status));
    }

    @GetMapping("/{id}")
    public R<BizProcurement> detail(@PathVariable Long id) {
        BizProcurement procurement = procurementMapper.selectById(id);
        if (procurement == null) {
            return R.fail("采购单不存在");
        }
        if (!dataScopeHelper.canAccess(procurement.getCreateBy(), null)) {
            return R.fail("无权查看他人记录");
        }
        return R.ok(procurement);
    }

    @PostMapping
    @Log(module = "采购管理", type = Log.OperationType.INSERT)
    public R<Long> add(@RequestBody BizProcurement procurement) {
        procurement.setId(null);
        return R.ok(channelService.saveProcurement(procurement));
    }

    @PutMapping
    @Log(module = "采购管理", type = Log.OperationType.UPDATE)
    public R<Long> update(@RequestBody BizProcurement procurement) {
        BizProcurement existing = procurementMapper.selectById(procurement.getId());
        if (existing == null) {
            return R.fail("采购单不存在");
        }
        if (!dataScopeHelper.canAccess(existing.getCreateBy(), null)) {
            return R.fail("无权修改他人记录");
        }
        return R.ok(channelService.saveProcurement(procurement));
    }

    @DeleteMapping("/{id}")
    @Log(module = "采购管理", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        BizProcurement existing = procurementMapper.selectById(id);
        if (existing == null) {
            return R.fail("采购单不存在");
        }
        if (!dataScopeHelper.canAccess(existing.getCreateBy(), null)) {
            return R.fail("无权删除他人记录");
        }
        procurementMapper.deleteById(id);
        return R.ok();
    }

    @PostMapping("/approve")
    @Log(module = "采购管理", type = Log.OperationType.UPDATE)
    public R<Void> approve(@RequestBody Map<String, Object> body) {
        if (!dataScopeHelper.isManagerOrAdmin()) {
            return R.fail("无权操作,仅管理员/主管可操作");
        }
        Long id = Long.valueOf(body.get("id").toString());
        boolean pass = body.get("pass") == null || Boolean.parseBoolean(body.get("pass").toString());
        // 审批人一律取当前登录人,不信请求体传值
        Long approverId = com.zhehang.erp.common.core.utils.SecurityUtils.getCurrentUserId();
        channelService.approveProcurement(id, pass, approverId);
        return R.ok();
    }

    @PostMapping("/{id}/pay")
    @Log(module = "采购管理", type = Log.OperationType.UPDATE)
    public R<Void> pay(@PathVariable Long id) {
        BizProcurement p = procurementMapper.selectById(id);
        if (p == null) {
            return R.fail("采购单不存在");
        }
        if (!dataScopeHelper.canAccess(p.getCreateBy(), null)) {
            return R.fail("无权操作");
        }
        channelService.payProcurement(id);
        return R.ok();
    }

    @PostMapping("/{id}/stock-in")
    @Log(module = "采购管理", type = Log.OperationType.UPDATE)
    public R<List<Long>> stockIn(@PathVariable Long id) {
        if (!dataScopeHelper.isManagerOrAdmin()) {
            return R.fail("无权操作,仅管理员/主管可操作");
        }
        return R.ok(channelService.stockInProcurement(id));
    }
}
