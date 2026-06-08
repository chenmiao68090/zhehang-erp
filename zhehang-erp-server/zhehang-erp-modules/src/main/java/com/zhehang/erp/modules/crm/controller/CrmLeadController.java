package com.zhehang.erp.modules.crm.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.crm.domain.entity.CrmLead;
import com.zhehang.erp.modules.crm.service.ICrmLeadService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/crm/lead")
@RequiredArgsConstructor
public class CrmLeadController {

    private final ICrmLeadService leadService;

    @GetMapping("/list")
    public R<IPage<CrmLead>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Integer source,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) Long ownerId) {
        return R.ok(leadService.selectPage(pageNum, pageSize, name, source, status, ownerId));
    }

    @GetMapping("/{id}")
    public R<CrmLead> getInfo(@PathVariable Long id) {
        return R.ok(leadService.getById(id));
    }

    @PostMapping
    @Log(module = "线索管理", type = Log.OperationType.INSERT)
    public R<Void> add(@RequestBody CrmLead lead) {
        // 默认归属公海、状态新建,确保新线索能进入公海池并被领取
        if (lead.getOwnership() == null || lead.getOwnership().isEmpty()) {
            lead.setOwnership(lead.getOwnerId() != null ? "private" : "pool");
        }
        if (lead.getStatus() == null) {
            lead.setStatus(1);
        }
        leadService.save(lead);
        return R.ok();
    }

    @PutMapping
    @Log(module = "线索管理", type = Log.OperationType.UPDATE)
    public R<Void> edit(@RequestBody CrmLead lead) {
        leadService.updateById(lead);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    @Log(module = "线索管理", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        leadService.removeById(id);
        return R.ok();
    }

    @PostMapping("/convert/{id}")
    @Log(module = "线索管理", type = Log.OperationType.UPDATE)
    public R<Void> convert(@PathVariable Long id) {
        leadService.convertToCustomer(id);
        return R.ok();
    }

    @PostMapping("/assign")
    @Log(module = "线索管理", type = Log.OperationType.UPDATE)
    public R<Void> assign(@RequestBody Map<String, Long> params) {
        leadService.assignLead(params.get("id"), params.get("ownerId"));
        return R.ok();
    }

    /** 公海线索列表(归属 pool) */
    @GetMapping("/pool")
    public R<IPage<CrmLead>> pool(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Long poolId) {
        return R.ok(leadService.selectPoolPage(pageNum, pageSize, name, poolId));
    }

    /** 我的客资(当前登录人名下、private) */
    @GetMapping("/my")
    public R<IPage<CrmLead>> my(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Integer status) {
        return R.ok(leadService.selectMyPage(pageNum, pageSize, name, status));
    }

    /** 领取(从公海领到当前登录人名下) */
    @PostMapping("/claim")
    @Log(module = "线索管理", type = Log.OperationType.UPDATE)
    public R<Void> claim(@RequestBody Map<String, Object> body) {
        leadService.claim(toIdList(body.get("ids")));
        return R.ok();
    }

    /** 退回公海 */
    @PostMapping("/return")
    @Log(module = "线索管理", type = Log.OperationType.UPDATE)
    public R<Void> returnToPool(@RequestBody Map<String, Object> body) {
        Object reason = body.get("reason");
        leadService.returnToPool(toIdList(body.get("ids")), reason == null ? null : reason.toString());
        return R.ok();
    }

    /** 分配(批量指派负责人) */
    @PostMapping("/distribute")
    @Log(module = "线索管理", type = Log.OperationType.UPDATE)
    public R<Void> distribute(@RequestBody Map<String, Object> body) {
        Object ownerId = body.get("ownerId");
        leadService.distribute(toIdList(body.get("ids")), ownerId == null ? null : Long.valueOf(ownerId.toString()));
        return R.ok();
    }

    /** 给线索写跟进:落库跟进记录并回写最后跟进时间/次数(供回收引擎判超时);仅数据范围内可操作 */
    @PostMapping("/{id}/follow")
    @Log(module = "线索管理", type = Log.OperationType.UPDATE)
    public R<Void> follow(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Integer type = body.get("type") == null ? null : Integer.valueOf(body.get("type").toString());
        String content = body.get("content") == null ? null : body.get("content").toString();
        String nextContent = body.get("nextContent") == null ? null : body.get("nextContent").toString();
        leadService.addFollow(id, type, content, parseDateTime(body.get("nextTime")), nextContent);
        return R.ok();
    }

    /** 查重(按手机号/名称) */
    @GetMapping("/duplicate")
    public R<List<CrmLead>> duplicate(
            @RequestParam(required = false) String phone,
            @RequestParam(required = false) String name) {
        return R.ok(leadService.checkDuplicate(phone, name));
    }

    /** 线索来源分布(营销统计) */
    @GetMapping("/stats/source")
    public R<List<Map<String, Object>>> sourceStats() {
        return R.ok(leadService.sourceStats());
    }

    /** 线索阶段漏斗(营销统计) */
    @GetMapping("/stats/stage")
    public R<List<Map<String, Object>>> stageStats() {
        return R.ok(leadService.stageStats());
    }

    /** 宽松解析下次跟进时间:支持 yyyy-MM-dd / yyyy-MM-dd HH:mm / yyyy-MM-dd HH:mm:ss / 带T,解析失败返回 null */
    private java.time.LocalDateTime parseDateTime(Object raw) {
        if (raw == null) {
            return null;
        }
        String s = raw.toString().trim().replace('T', ' ');
        if (s.isEmpty()) {
            return null;
        }
        try {
            if (s.length() <= 10) {
                return java.time.LocalDate.parse(s).atStartOfDay();
            }
            if (s.length() == 16) {
                s = s + ":00";
            }
            return java.time.LocalDateTime.parse(s,
                    java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        } catch (Exception e) {
            return null;
        }
    }

    /** 把前端传来的 ids(List<Integer>/List<Long> 等)统一转成 List<Long> */
    private List<Long> toIdList(Object raw) {
        if (!(raw instanceof List<?> list)) {
            return new ArrayList<>();
        }
        return list.stream()
                .filter(java.util.Objects::nonNull)
                .map(o -> Long.valueOf(o.toString()))
                .collect(Collectors.toList());
    }
}
