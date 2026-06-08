package com.zhehang.erp.modules.order.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.order.domain.BizOrder;
import com.zhehang.erp.modules.order.domain.BizOrderItem;
import com.zhehang.erp.modules.order.service.IBizOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/order")
@RequiredArgsConstructor
public class BizOrderController {

    private final IBizOrderService orderService;
    // 注册 JavaTimeModule:支持 body 里的 LocalDate/LocalDateTime(如 serviceStartDate)按 ISO 字符串转换,
    // 否则裸 ObjectMapper 遇到日期字段会抛异常 → 下单报"参数无效"
    private static final ObjectMapper MAPPER = new ObjectMapper()
            .registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());

    @GetMapping("/list")
    public R<IPage<BizOrder>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) String orderNo) {
        return R.ok(orderService.selectPage(pageNum, pageSize, status, customerId, orderNo));
    }

    @GetMapping("/{id}")
    public R<Map<String, Object>> detail(@PathVariable Long id) {
        return R.ok(orderService.getDetail(id));
    }

    @PostMapping
    @Log(module = "提单管理", type = Log.OperationType.INSERT)
    public R<Long> add(@RequestBody Map<String, Object> body) {
        BizOrder order = MAPPER.convertValue(body, BizOrder.class);
        List<BizOrderItem> items = body.get("items") != null
                ? MAPPER.convertValue(body.get("items"), new TypeReference<List<BizOrderItem>>() {})
                : null;
        return R.ok(orderService.createWithItems(order, items));
    }

    @PutMapping("/{id}")
    @Log(module = "提单管理", type = Log.OperationType.UPDATE)
    public R<Void> update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        BizOrder order = MAPPER.convertValue(body, BizOrder.class);
        order.setId(id);
        List<BizOrderItem> items = body.get("items") != null
                ? MAPPER.convertValue(body.get("items"), new TypeReference<List<BizOrderItem>>() {})
                : null;
        orderService.updateWithItems(order, items);
        return R.ok();
    }

    @PostMapping("/{id}/submit")
    @Log(module = "提单管理", type = Log.OperationType.UPDATE)
    public R<Void> submit(@PathVariable Long id, @RequestBody(required = false) Map<String, Object> body) {
        Long operatorId = body != null && body.get("operatorId") != null
                ? Long.valueOf(body.get("operatorId").toString()) : null;
        orderService.submit(id, operatorId);
        return R.ok();
    }

    @PostMapping("/{id}/approve")
    @Log(module = "提单管理", type = Log.OperationType.UPDATE)
    public R<Void> approve(@PathVariable Long id, @RequestBody(required = false) Map<String, Object> body) {
        Long approverId = body != null && body.get("approverId") != null
                ? Long.valueOf(body.get("approverId").toString()) : null;
        String comment = body != null && body.get("comment") != null ? body.get("comment").toString() : null;
        orderService.approve(id, approverId, comment);
        return R.ok();
    }

    @PostMapping("/{id}/reject")
    @Log(module = "提单管理", type = Log.OperationType.UPDATE)
    public R<Void> reject(@PathVariable Long id, @RequestBody(required = false) Map<String, Object> body) {
        Long approverId = body != null && body.get("approverId") != null
                ? Long.valueOf(body.get("approverId").toString()) : null;
        String comment = body != null && body.get("comment") != null ? body.get("comment").toString() : null;
        orderService.reject(id, approverId, comment);
        return R.ok();
    }

    @PostMapping("/{id}/finance-confirm")
    @Log(module = "提单管理", type = Log.OperationType.UPDATE)
    public R<Void> financeConfirm(@PathVariable Long id, @RequestBody(required = false) Map<String, Object> body) {
        Long approverId = body != null && body.get("approverId") != null
                ? Long.valueOf(body.get("approverId").toString()) : null;
        String comment = body != null && body.get("comment") != null ? body.get("comment").toString() : null;
        orderService.financeConfirm(id, approverId, comment);
        return R.ok();
    }

    @PostMapping("/{id}/cancel")
    @Log(module = "提单管理", type = Log.OperationType.UPDATE)
    public R<Void> cancel(@PathVariable Long id, @RequestBody(required = false) Map<String, Object> body) {
        Long operatorId = body != null && body.get("operatorId") != null
                ? Long.valueOf(body.get("operatorId").toString()) : null;
        String reason = body != null && body.get("reason") != null ? body.get("reason").toString() : null;
        orderService.cancel(id, operatorId, reason);
        return R.ok();
    }

    @GetMapping("/stats")
    public R<Map<String, Object>> stats() {
        return R.ok(orderService.stats());
    }

}
