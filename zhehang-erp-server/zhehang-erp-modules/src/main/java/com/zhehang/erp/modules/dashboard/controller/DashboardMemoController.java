package com.zhehang.erp.modules.dashboard.controller;

import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.dashboard.domain.entity.DashboardMemo;
import com.zhehang.erp.modules.dashboard.service.IDashboardMemoService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/dashboard/memo")
@RequiredArgsConstructor
public class DashboardMemoController {

    private final IDashboardMemoService memoService;

    @GetMapping("/list")
    public R<List<DashboardMemo>> list(@RequestParam(required = false, defaultValue = "home") String scope,
                                       @RequestParam(required = false) Boolean completed,
                                       @RequestParam(required = false) String keyword,
                                       @RequestParam(required = false, defaultValue = "30") Integer limit) {
        return R.ok(memoService.listMine(scope, completed, keyword, limit));
    }

    @GetMapping("/summary")
    public R<Map<String, Long>> summary() {
        return R.ok(memoService.summary());
    }

    @PostMapping
    public R<Boolean> add(@RequestBody DashboardMemo memo) {
        return R.ok(memoService.add(memo));
    }

    @PutMapping
    public R<Boolean> update(@RequestBody DashboardMemo memo) {
        return R.ok(memoService.updateMine(memo));
    }

    @PutMapping("/{id}/complete")
    public R<Boolean> complete(@PathVariable Long id, @RequestBody CompleteRequest request) {
        return R.ok(memoService.setCompleted(id, request.getCompleted()));
    }

    @DeleteMapping("/{id}")
    public R<Boolean> remove(@PathVariable Long id) {
        return R.ok(memoService.removeMine(id));
    }

    @Data
    public static class CompleteRequest {
        private Boolean completed;
    }
}
