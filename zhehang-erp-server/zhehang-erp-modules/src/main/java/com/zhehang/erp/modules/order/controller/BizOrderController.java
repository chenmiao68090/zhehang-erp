package com.zhehang.erp.modules.order.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
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
    private final DataScopeHelper dataScopeHelper;
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
        BizOrder existing = orderService.getById(id);
        if (existing != null && !canAccess(existing)) {
            return R.fail("无权查看他人记录");
        }
        return R.ok(orderService.getDetail(id));
    }

    @PostMapping
    @Log(module = "提单管理", type = Log.OperationType.INSERT)
    public R<Long> add(@RequestBody Map<String, Object> body) {
        // 先取出并移除 items:BizOrder 实体无 items 字段,若留在 body 里 convertValue 会报
        // "Unrecognized field items" → 前端带订单明细建单必 400。明细单独存 biz_order_item 子表。
        Object itemsObj = body.remove("items");
        BizOrder order = MAPPER.convertValue(body, BizOrder.class);
        List<BizOrderItem> items = itemsObj != null
                ? MAPPER.convertValue(itemsObj, new TypeReference<List<BizOrderItem>>() {})
                : null;
        return R.ok(orderService.createWithItems(order, items));
    }

    @PutMapping("/{id}")
    @Log(module = "提单管理", type = Log.OperationType.UPDATE)
    public R<Void> update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        BizOrder existing = orderService.getById(id);
        if (existing != null && !canAccess(existing)) {
            return R.fail("无权修改他人记录");
        }
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
        BizOrder existing = orderService.getById(id);
        if (existing == null) {
            return R.fail("订单不存在");
        }
        if (!canAccess(existing)) {
            return R.fail("无权操作他人记录");
        }
        Long operatorId = body != null && body.get("operatorId") != null
                ? Long.valueOf(body.get("operatorId").toString()) : null;
        orderService.submit(id, operatorId);
        return R.ok();
    }

    @PostMapping("/{id}/approve")
    @Log(module = "提单管理", type = Log.OperationType.UPDATE)
    public R<Void> approve(@PathVariable Long id, @RequestBody(required = false) Map<String, Object> body) {
        if (!dataScopeHelper.isManagerOrAdmin()) {
            return R.fail("无权操作,仅管理员/主管可操作");
        }
        BizOrder existing = orderService.getById(id);
        if (existing == null) {
            return R.fail("订单不存在");
        }
        if (!canManage(existing)) {
            return R.fail("无权审批其他部门提单");
        }
        Long approverId = body != null && body.get("approverId") != null
                ? Long.valueOf(body.get("approverId").toString()) : null;
        String comment = body != null && body.get("comment") != null ? body.get("comment").toString() : null;
        orderService.approve(id, approverId, comment);
        return R.ok();
    }

    @PostMapping("/{id}/reject")
    @Log(module = "提单管理", type = Log.OperationType.UPDATE)
    public R<Void> reject(@PathVariable Long id, @RequestBody(required = false) Map<String, Object> body) {
        if (!dataScopeHelper.isManagerOrAdmin()) {
            return R.fail("无权操作,仅管理员/主管可操作");
        }
        BizOrder existing = orderService.getById(id);
        if (existing == null) {
            return R.fail("订单不存在");
        }
        if (!canManage(existing)) {
            return R.fail("无权驳回其他部门提单");
        }
        Long approverId = body != null && body.get("approverId") != null
                ? Long.valueOf(body.get("approverId").toString()) : null;
        String comment = body != null && body.get("comment") != null ? body.get("comment").toString() : null;
        orderService.reject(id, approverId, comment);
        return R.ok();
    }

    @PostMapping("/{id}/finance-confirm")
    @Log(module = "提单管理", type = Log.OperationType.UPDATE)
    public R<Void> financeConfirm(@PathVariable Long id, @RequestBody(required = false) Map<String, Object> body) {
        if (!SecurityUtils.isCurrentAdmin()
                && !SecurityUtils.hasAnyRole("finance_hq", "finance", "boss")) {
            return R.fail("无权操作,仅财务人员/负责人/老板可确认");
        }
        Long approverId = body != null && body.get("approverId") != null
                ? Long.valueOf(body.get("approverId").toString()) : null;
        String comment = body != null && body.get("comment") != null ? body.get("comment").toString() : null;
        orderService.financeConfirm(id, approverId, comment);
        return R.ok();
    }

    @PostMapping("/{id}/cancel")
    @Log(module = "提单管理", type = Log.OperationType.UPDATE)
    public R<Void> cancel(@PathVariable Long id, @RequestBody(required = false) Map<String, Object> body) {
        if (!dataScopeHelper.isManagerOrAdmin()) {
            return R.fail("无权操作,仅管理员/主管可操作");
        }
        BizOrder existing = orderService.getById(id);
        if (existing == null) {
            return R.fail("订单不存在");
        }
        if (!canManage(existing)) {
            return R.fail("无权取消其他部门提单");
        }
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

    private boolean canAccess(BizOrder order) {
        Long ownerId = order.getSalesmanId() != null ? order.getSalesmanId() : order.getCreateBy();
        return dataScopeHelper.canAccess(ownerId, order.getDeptId());
    }

    private boolean canManage(BizOrder order) {
        return SecurityUtils.isCurrentAdmin() || SecurityUtils.hasAnyRole("boss") || canAccess(order);
    }

}
