package com.zhehang.erp.modules.supply.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.supply.domain.entity.SupplyReturn;
import com.zhehang.erp.modules.supply.service.impl.SupplyReturnServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/supply/return")
@RequiredArgsConstructor
public class SupplyReturnController {

    private final SupplyReturnServiceImpl returnService;

    @GetMapping("/list")
    public R<IPage<SupplyReturn>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String returnNo,
            @RequestParam(required = false) Integer status) {
        return R.ok(returnService.selectPage(pageNum, pageSize, returnNo, status));
    }

    @GetMapping("/{id}")
    public R<SupplyReturn> getInfo(@PathVariable Long id) {
        return R.ok(returnService.getById(id));
    }

    @PostMapping
    @Log(module = "Supply Return", type = Log.OperationType.INSERT)
    public R<Void> add(@RequestBody SupplyReturn ret) {
        ret.setReturnNo(returnService.generateReturnNo());
        if (ret.getStatus() == null) ret.setStatus(0);
        returnService.save(ret);
        return R.ok();
    }

    @PutMapping
    @Log(module = "Supply Return", type = Log.OperationType.UPDATE)
    public R<Void> update(@RequestBody SupplyReturn ret) {
        returnService.updateById(ret);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    @Log(module = "Supply Return", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        returnService.removeById(id);
        return R.ok();
    }

    @PutMapping("/process/{id}")
    @Log(module = "Supply Return", type = Log.OperationType.UPDATE)
    public R<Void> process(@PathVariable Long id) {
        returnService.process(id);
        return R.ok();
    }

    @PutMapping("/complete/{id}")
    @Log(module = "Supply Return", type = Log.OperationType.UPDATE)
    public R<Void> complete(@PathVariable Long id) {
        returnService.complete(id);
        return R.ok();
    }
}
