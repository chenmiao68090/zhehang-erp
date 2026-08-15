package com.zhehang.erp.modules.channel.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.channel.domain.BizChannelCost;
import com.zhehang.erp.modules.channel.service.IBizChannelService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/channel-cost")
@RequiredArgsConstructor
public class BizChannelCostController {

    private final IBizChannelService channelService;

    @GetMapping("/list")
    public R<IPage<BizChannelCost>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String channelType,
            @RequestParam(required = false) String period) {
        return R.ok(channelService.channelCostList(pageNum, pageSize, channelType, period));
    }

    @PostMapping
    @Log(module = "渠道成本", type = Log.OperationType.UPDATE)
    public R<Long> save(@RequestBody BizChannelCost cost) {
        return R.ok(channelService.saveChannelCost(cost));
    }

    @GetMapping("/roi")
    public R<Map<String, Object>> roi(@RequestParam(required = false) String period) {
        return R.ok(channelService.roiAnalysis(period));
    }
}
