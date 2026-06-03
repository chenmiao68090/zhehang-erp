package com.zhehang.erp.modules.marketing.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.marketing.domain.entity.MktCampaign;
import com.zhehang.erp.modules.marketing.service.IMktCampaignService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 营销活动（获客 ROI 勾稽地基）。
 */
@RestController
@RequestMapping("/marketing/campaign")
@RequiredArgsConstructor
public class MktCampaignController {

    private final IMktCampaignService campaignService;

    @GetMapping("/list")
    public R<IPage<MktCampaign>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String channel,
            @RequestParam(required = false) Integer status) {
        return R.ok(campaignService.selectPage(pageNum, pageSize, keyword, channel, status));
    }

    @GetMapping("/{id}")
    public R<MktCampaign> getInfo(@PathVariable Long id) {
        return R.ok(campaignService.getById(id));
    }

    @PostMapping
    @Log(module = "营销活动", type = Log.OperationType.INSERT)
    public R<Void> add(@RequestBody MktCampaign campaign) {
        campaignService.save(campaign);
        return R.ok();
    }

    @PutMapping
    @Log(module = "营销活动", type = Log.OperationType.UPDATE)
    public R<Void> edit(@RequestBody MktCampaign campaign) {
        campaignService.updateById(campaign);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    @Log(module = "营销活动", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        campaignService.removeById(id);
        return R.ok();
    }

    /** 各营销活动获客 ROI/CAC 统计 */
    @GetMapping("/roi")
    public R<java.util.List<java.util.Map<String, Object>>> roi() {
        return R.ok(campaignService.roi());
    }
}
