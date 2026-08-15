package com.zhehang.erp.modules.steward.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.steward.domain.BizServiceDelivery;
import com.zhehang.erp.modules.steward.domain.BizStewardClient;
import com.zhehang.erp.modules.steward.mapper.BizServiceDeliveryMapper;
import com.zhehang.erp.modules.steward.mapper.BizStewardClientMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

/**
 * 管家体系·月度服务交付:按月跟踪各客户各项服务是否完成,可一键按客户服务项目生成当月待办。
 */
@RestController
@RequestMapping("/steward/delivery")
@RequiredArgsConstructor
public class ServiceDeliveryController {

    private final BizServiceDeliveryMapper deliveryMapper;
    private final BizStewardClientMapper clientMapper;

    /** 查服务交付:传 month 查某月;传 clientId 查某客户(不限月,近的在前) */
    @GetMapping("/list")
    public R<List<BizServiceDelivery>> list(@RequestParam(required = false) String month,
                                            @RequestParam(required = false) String status,
                                            @RequestParam(required = false) String keyword,
                                            @RequestParam(required = false) Long clientId) {
        LambdaQueryWrapper<BizServiceDelivery> qw = new LambdaQueryWrapper<BizServiceDelivery>()
                .eq(StringUtils.hasText(month), BizServiceDelivery::getDeliverMonth, month)
                .eq(clientId != null, BizServiceDelivery::getClientId, clientId)
                .eq(StringUtils.hasText(status), BizServiceDelivery::getStatus, status)
                .and(StringUtils.hasText(keyword), w -> w.like(BizServiceDelivery::getClientName, keyword)
                        .or().like(BizServiceDelivery::getServiceItem, keyword));
        if (clientId != null) qw.orderByDesc(BizServiceDelivery::getDeliverMonth);
        qw.orderByAsc(BizServiceDelivery::getStatus).orderByAsc(BizServiceDelivery::getId);
        return R.ok(deliveryMapper.selectList(qw));
    }

    @PostMapping
    @Log(module = "管家·服务交付", type = Log.OperationType.INSERT)
    public R<Void> add(@RequestBody BizServiceDelivery d) {
        if (d.getStatus() == null || d.getStatus().isBlank()) d.setStatus("pending");
        deliveryMapper.insert(d);
        return R.ok();
    }

    @PutMapping
    @Log(module = "管家·服务交付", type = Log.OperationType.UPDATE)
    public R<Void> edit(@RequestBody BizServiceDelivery d) {
        deliveryMapper.updateById(d);
        return R.ok();
    }

    /** 列表内联改状态:完成时自动记完成日期 */
    @PostMapping("/status")
    @Log(module = "管家·服务交付", type = Log.OperationType.UPDATE)
    public R<Void> status(@RequestBody BizServiceDelivery body) {
        if (body.getId() == null || !StringUtils.hasText(body.getStatus())) return R.fail("缺少参数");
        BizServiceDelivery d = deliveryMapper.selectById(body.getId());
        if (d == null) return R.fail("记录不存在");
        d.setStatus(body.getStatus());
        d.setFinishDate("done".equals(body.getStatus()) ? LocalDate.now() : null);
        deliveryMapper.updateById(d);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    @Log(module = "管家·服务交付", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        deliveryMapper.deleteById(id);
        return R.ok();
    }

    /** 一键按签约客户的服务项目,生成某月待办(已存在的不重复生成) */
    @PostMapping("/generate")
    @Log(module = "管家·服务交付", type = Log.OperationType.INSERT)
    public R<Map<String, Object>> generate(@RequestParam String month) {
        if (!StringUtils.hasText(month)) return R.fail("缺少月份");
        List<BizStewardClient> clients = clientMapper.selectList(new LambdaQueryWrapper<BizStewardClient>()
                .ne(BizStewardClient::getStatus, "churned"));
        List<BizServiceDelivery> existing = deliveryMapper.selectList(new LambdaQueryWrapper<BizServiceDelivery>()
                .eq(BizServiceDelivery::getDeliverMonth, month));
        Set<String> existKeys = new HashSet<>();
        for (BizServiceDelivery e : existing) existKeys.add(e.getClientId() + "|" + e.getServiceItem());
        int created = 0;
        for (BizStewardClient c : clients) {
            if (!StringUtils.hasText(c.getServices())) continue;
            for (String item : c.getServices().split(",")) {
                String si = item.trim();
                if (si.isEmpty()) continue;
                String key = c.getId() + "|" + si;
                if (existKeys.contains(key)) continue;
                BizServiceDelivery d = new BizServiceDelivery();
                d.setClientId(c.getId());
                d.setClientName(c.getCompanyName());
                d.setDeliverMonth(month);
                d.setServiceItem(si);
                d.setStatus("pending");
                d.setHandler(c.getStewardName());
                deliveryMapper.insert(d);
                existKeys.add(key);
                created++;
            }
        }
        Map<String, Object> m = new HashMap<>();
        m.put("created", created);
        return R.ok(m);
    }

    /** 某月交付统计:待办/进行中/已完成 */
    @GetMapping("/stats")
    public R<Map<String, Object>> stats(@RequestParam String month) {
        List<BizServiceDelivery> all = deliveryMapper.selectList(new LambdaQueryWrapper<BizServiceDelivery>()
                .eq(BizServiceDelivery::getDeliverMonth, month));
        long pending = 0, doing = 0, done = 0;
        for (BizServiceDelivery d : all) {
            if ("done".equals(d.getStatus())) done++;
            else if ("doing".equals(d.getStatus())) doing++;
            else pending++;
        }
        Map<String, Object> m = new HashMap<>();
        m.put("total", all.size());
        m.put("pending", pending);
        m.put("doing", doing);
        m.put("done", done);
        return R.ok(m);
    }
}
