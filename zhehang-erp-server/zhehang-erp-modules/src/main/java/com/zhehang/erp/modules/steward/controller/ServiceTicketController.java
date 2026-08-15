package com.zhehang.erp.modules.steward.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.steward.domain.BizServiceTicket;
import com.zhehang.erp.modules.steward.mapper.BizServiceTicketMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 管家体系·服务工单。
 */
@RestController
@RequestMapping("/steward/ticket")
@RequiredArgsConstructor
public class ServiceTicketController {

    private final BizServiceTicketMapper ticketMapper;

    @GetMapping("/list")
    public R<IPage<BizServiceTicket>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String ticketType,
            @RequestParam(required = false) String handler,
            @RequestParam(required = false) Long clientId) {
        LambdaQueryWrapper<BizServiceTicket> qw = new LambdaQueryWrapper<BizServiceTicket>()
                .and(StringUtils.hasText(keyword), w -> w.like(BizServiceTicket::getClientName, keyword)
                        .or().like(BizServiceTicket::getTitle, keyword))
                .eq(StringUtils.hasText(status), BizServiceTicket::getStatus, status)
                .eq(StringUtils.hasText(ticketType), BizServiceTicket::getTicketType, ticketType)
                .eq(clientId != null, BizServiceTicket::getClientId, clientId)
                .like(StringUtils.hasText(handler), BizServiceTicket::getHandler, handler)
                .orderByDesc(BizServiceTicket::getId);
        return R.ok(ticketMapper.selectPage(new Page<>(pageNum, pageSize), qw));
    }

    @PostMapping
    @Log(module = "管家·服务工单", type = Log.OperationType.INSERT)
    public R<Void> add(@RequestBody BizServiceTicket t) {
        if (t.getStatus() == null || t.getStatus().isBlank()) t.setStatus("pending");
        if (t.getPriority() == null || t.getPriority().isBlank()) t.setPriority("中");
        ticketMapper.insert(t);
        return R.ok();
    }

    @PutMapping
    @Log(module = "管家·服务工单", type = Log.OperationType.UPDATE)
    public R<Void> edit(@RequestBody BizServiceTicket t) {
        if ("done".equals(t.getStatus()) && t.getFinishTime() == null) t.setFinishTime(LocalDateTime.now());
        ticketMapper.updateById(t);
        return R.ok();
    }

    /** 列表内联改状态:完成时自动记完成时间 */
    @PostMapping("/status")
    @Log(module = "管家·服务工单", type = Log.OperationType.UPDATE)
    public R<Void> status(@RequestBody BizServiceTicket body) {
        if (body.getId() == null || !StringUtils.hasText(body.getStatus())) return R.fail("缺少参数");
        BizServiceTicket t = ticketMapper.selectById(body.getId());
        if (t == null) return R.fail("工单不存在");
        t.setStatus(body.getStatus());
        t.setFinishTime("done".equals(body.getStatus()) ? LocalDateTime.now() : null);
        ticketMapper.updateById(t);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    @Log(module = "管家·服务工单", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        ticketMapper.deleteById(id);
        return R.ok();
    }

    /** 工单统计:待处理/处理中/已完成 */
    @GetMapping("/stats")
    public R<Map<String, Object>> stats() {
        List<BizServiceTicket> all = ticketMapper.selectList(new LambdaQueryWrapper<>());
        long pending = 0, doing = 0, done = 0;
        for (BizServiceTicket t : all) {
            if ("done".equals(t.getStatus())) done++;
            else if ("doing".equals(t.getStatus())) doing++;
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
