package com.zhehang.erp.modules.channel.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.channel.domain.BizChannelPartner;
import com.zhehang.erp.modules.channel.service.IBizChannelPartnerService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 同行渠道 Controller。实际请求路径 = context-path /api + /channel-partner/...
 */
@RestController
@RequestMapping("/channel-partner")
@RequiredArgsConstructor
public class BizChannelPartnerController {

    private final IBizChannelPartnerService partnerService;

    @GetMapping("/list")
    public R<IPage<BizChannelPartner>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String partnerType,
            @RequestParam(required = false) String partnerLevel,
            @RequestParam(required = false) String status) {
        return R.ok(partnerService.partnerList(pageNum, pageSize, keyword, partnerType, partnerLevel, status));
    }

    @GetMapping("/{id}")
    public R<BizChannelPartner> detail(@PathVariable Long id) {
        return R.ok(partnerService.getPartner(id));
    }

    @PostMapping
    @Log(module = "同行渠道", type = Log.OperationType.INSERT)
    public R<Long> add(@RequestBody BizChannelPartner partner) {
        partner.setId(null);
        return R.ok(partnerService.savePartner(partner));
    }

    @PutMapping
    @Log(module = "同行渠道", type = Log.OperationType.UPDATE)
    public R<Long> update(@RequestBody BizChannelPartner partner) {
        return R.ok(partnerService.savePartner(partner));
    }

    @PutMapping("/{id}/status")
    @Log(module = "同行渠道", type = Log.OperationType.UPDATE)
    public R<Void> changeStatus(@PathVariable Long id, @RequestParam String status) {
        partnerService.changeStatus(id, status);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    @Log(module = "同行渠道", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        partnerService.removePartner(id);
        return R.ok();
    }
}
