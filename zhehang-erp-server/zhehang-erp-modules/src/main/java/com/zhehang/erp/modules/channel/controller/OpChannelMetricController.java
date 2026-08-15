package com.zhehang.erp.modules.channel.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.channel.domain.BizOpChannelMetric;
import com.zhehang.erp.modules.channel.mapper.BizOpChannelMetricMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * 运营服务中心·平台运营数据(美团/抖音/小红书等)。
 * 第一阶段:手动录入真实指标 + 接口同步框架位(每个平台一个槽,配置凭证后激活)。
 */
@RestController
@RequestMapping("/op/channel-metric")
@RequiredArgsConstructor
public class OpChannelMetricController {

    private final BizOpChannelMetricMapper metricMapper;

    /** overview 概览类别的兜底值:老数据 category 为 NULL 时按此处理。 */
    private static final String OVERVIEW = "overview";

    /**
     * 最近 N 天各平台指标(前端按平台分组、算趋势/汇总)。
     * platform / category 均为可选过滤条件:不传则返回全部(兼容旧的 channel-data 一次拉全表)。
     * category 传 overview 时,同时匹配 NULL(老数据未分类)以保证向后兼容。
     */
    @GetMapping("/recent")
    public R<List<BizOpChannelMetric>> recent(@RequestParam(defaultValue = "30") Integer days,
                                              @RequestParam(required = false) String platform,
                                              @RequestParam(required = false) String category) {
        int d = days == null || days <= 0 ? 30 : Math.min(days, 365);
        LocalDate from = LocalDate.now().minusDays(d);
        LambdaQueryWrapper<BizOpChannelMetric> qw = new LambdaQueryWrapper<BizOpChannelMetric>()
                .ge(BizOpChannelMetric::getStatDate, from)
                .eq(platform != null && !platform.isBlank(), BizOpChannelMetric::getPlatform, platform);
        if (category != null && !category.isBlank()) {
            if (OVERVIEW.equalsIgnoreCase(category)) {
                // 概览:兼容老数据的 NULL category
                qw.and(w -> w.eq(BizOpChannelMetric::getCategory, OVERVIEW)
                        .or().isNull(BizOpChannelMetric::getCategory));
            } else {
                qw.eq(BizOpChannelMetric::getCategory, category);
            }
        }
        qw.orderByDesc(BizOpChannelMetric::getStatDate);
        return R.ok(metricMapper.selectList(qw));
    }

    /** 录入/更新某平台某天的指标(平台+日期唯一,存在则更新)。 */
    @PostMapping("/save")
    @Log(module = "运营数据", type = Log.OperationType.UPDATE)
    public R<Void> save(@RequestBody BizOpChannelMetric body) {
        if (body.getPlatform() == null || body.getPlatform().isBlank() || body.getStatDate() == null) {
            return R.fail("平台和日期必填");
        }
        if (body.getSource() == null) {
            body.setSource("manual");
        }
        // 归一化类别:空 → overview,保证唯一键(platform+date+category)稳定、与老数据概览对齐
        if (body.getCategory() == null || body.getCategory().isBlank()) {
            body.setCategory(OVERVIEW);
        }
        BizOpChannelMetric existing = findOne(body.getPlatform(), body.getStatDate(), body.getCategory());
        if (existing == null) {
            try {
                metricMapper.insert(body);
            } catch (DuplicateKeyException e) {
                BizOpChannelMetric again = findOne(body.getPlatform(), body.getStatDate(), body.getCategory());
                if (again != null) {
                    body.setId(again.getId());
                    metricMapper.updateById(body);
                }
            }
        } else {
            body.setId(existing.getId());
            metricMapper.updateById(body);
        }
        return R.ok();
    }

    /**
     * 接口同步框架位:配置该平台 API 凭证后由此触发自动拉取。
     * 当前未接入任何平台凭证 → 明确返回"待接入",绝不伪造同步成功。
     */
    @PostMapping("/sync/{platform}")
    public R<Void> sync(@PathVariable String platform) {
        return R.fail("「" + platform + "」接口待接入:请先在平台开放后台申请 API 凭证并配置后,方可自动同步。当前请用手动录入。");
    }

    private BizOpChannelMetric findOne(String platform, LocalDate date, String category) {
        LambdaQueryWrapper<BizOpChannelMetric> qw = new LambdaQueryWrapper<BizOpChannelMetric>()
                .eq(BizOpChannelMetric::getPlatform, platform)
                .eq(BizOpChannelMetric::getStatDate, date);
        if (OVERVIEW.equalsIgnoreCase(category)) {
            // 概览:命中老数据 NULL 或新数据 overview,避免同一天概览重复插入
            qw.and(w -> w.eq(BizOpChannelMetric::getCategory, OVERVIEW)
                    .or().isNull(BizOpChannelMetric::getCategory));
        } else {
            qw.eq(BizOpChannelMetric::getCategory, category);
        }
        return metricMapper.selectOne(qw.last("LIMIT 1"));
    }
}
