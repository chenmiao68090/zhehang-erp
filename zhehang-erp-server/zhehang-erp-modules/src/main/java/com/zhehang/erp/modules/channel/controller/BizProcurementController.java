package com.zhehang.erp.modules.channel.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.channel.domain.BizProcurement;
import com.zhehang.erp.modules.channel.mapper.BizProcurementMapper;
import com.zhehang.erp.modules.channel.service.IBizChannelService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/procurement")
@RequiredArgsConstructor
public class BizProcurementController {

    private final IBizChannelService channelService;
    private final BizProcurementMapper procurementMapper;

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
        return R.ok(procurementMapper.selectById(id));
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
        return R.ok(channelService.saveProcurement(procurement));
    }

    @DeleteMapping("/{id}")
    @Log(module = "采购管理", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        procurementMapper.deleteById(id);
        return R.ok();
    }

    @PostMapping("/approve")
    @Log(module = "采购管理", type = Log.OperationType.UPDATE)
    public R<Void> approve(@RequestBody Map<String, Object> body) {
        Long id = Long.valueOf(body.get("id").toString());
        boolean pass = body.get("pass") == null || Boolean.parseBoolean(body.get("pass").toString());
        Long approverId = body.get("approverId") != null
                ? Long.valueOf(body.get("approverId").toString()) : null;
        channelService.approveProcurement(id, pass, approverId);
        return R.ok();
    }

    @PostMapping("/{id}/pay")
    @Log(module = "采购管理", type = Log.OperationType.UPDATE)
    public R<Void> pay(@PathVariable Long id) {
        channelService.payProcurement(id);
        return R.ok();
    }

    @PostMapping("/{id}/stock-in")
    @Log(module = "采购管理", type = Log.OperationType.UPDATE)
    public R<Void> stockIn(@PathVariable Long id) {
        channelService.stockInProcurement(id);
        return R.ok();
    }
}
