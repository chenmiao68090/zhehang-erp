package com.zhehang.erp.modules.channel.controller;

import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.channel.service.IAddressOverviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * 地址资源总览(只读)。
 *
 * <p>飞书建议 72:按行政区分组展示全部托管地址、快速筛选、跳转对应区域地址清单、统计地址总量。
 * 数据源为渠道模块挂靠地址资源表 {@code biz_address_resource},以 {@code region}(所属区域)为行政区维度。</p>
 *
 * <p>全为只读聚合接口,不修改任何既有业务文件。</p>
 */
@RestController
@RequestMapping("/address-overview")
@RequiredArgsConstructor
public class AddressOverviewController {

    private final IAddressOverviewService addressOverviewService;

    /** 按行政区(所属区域)分组统计托管地址数量:[{area, count}]。 */
    @GetMapping("/by-area")
    public R<List<Map<String, Object>>> byArea() {
        return R.ok(addressOverviewService.byArea());
    }

    /** 某行政区下的地址清单(全量;area 为空则不限区域,可选 status 过滤)。 */
    @GetMapping("/list")
    public R<List<Map<String, Object>>> list(
            @RequestParam(required = false) String area,
            @RequestParam(required = false) String status) {
        return R.ok(addressOverviewService.listByArea(area, status));
    }

    /** 汇总统计:地址总量、已用/空闲、各状态计数。 */
    @GetMapping("/summary")
    public R<Map<String, Object>> summary() {
        return R.ok(addressOverviewService.summary());
    }
}
