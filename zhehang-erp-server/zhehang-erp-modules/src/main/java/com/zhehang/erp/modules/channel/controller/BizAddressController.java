package com.zhehang.erp.modules.channel.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.channel.domain.BizAddressResource;
import com.zhehang.erp.modules.channel.service.IBizChannelService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/address")
@RequiredArgsConstructor
public class BizAddressController {

    private final IBizChannelService channelService;

    @GetMapping("/list")
    public R<IPage<BizAddressResource>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String region) {
        return R.ok(channelService.addressList(pageNum, pageSize, status, region));
    }

    @GetMapping("/available")
    public R<List<BizAddressResource>> available(@RequestParam(required = false) String region) {
        return R.ok(channelService.availableAddresses(region));
    }

    @PostMapping
    @Log(module = "地址资源", type = Log.OperationType.INSERT)
    public R<Long> save(@RequestBody BizAddressResource address) {
        return R.ok(channelService.saveAddress(address));
    }

    @PostMapping("/{id}/reserve")
    @Log(module = "地址资源", type = Log.OperationType.UPDATE)
    public R<Void> reserve(@PathVariable Long id, @RequestBody(required = false) Map<String, Object> body) {
        Long customerId = body != null && body.get("customerId") != null
                ? Long.valueOf(body.get("customerId").toString()) : null;
        Long orderId = body != null && body.get("orderId") != null
                ? Long.valueOf(body.get("orderId").toString()) : null;
        channelService.reserveAddress(id, customerId, orderId);
        return R.ok();
    }

    @PostMapping("/{id}/sell")
    @Log(module = "地址资源", type = Log.OperationType.UPDATE)
    public R<Void> sell(@PathVariable Long id, @RequestBody(required = false) Map<String, Object> body) {
        Long customerId = body != null && body.get("customerId") != null
                ? Long.valueOf(body.get("customerId").toString()) : null;
        Long orderId = body != null && body.get("orderId") != null
                ? Long.valueOf(body.get("orderId").toString()) : null;
        channelService.sellAddress(id, customerId, orderId);
        return R.ok();
    }

    @PostMapping("/{id}/release")
    @Log(module = "地址资源", type = Log.OperationType.UPDATE)
    public R<Void> release(@PathVariable Long id) {
        channelService.releaseAddress(id);
        return R.ok();
    }
}
