package com.zhehang.erp.modules.openapi.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.openapi.domain.entity.OpenapiApp;
import com.zhehang.erp.modules.openapi.mapper.OpenapiLogMapper;
import com.zhehang.erp.modules.openapi.service.IOpenapiAppService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Tag(name = "开放API应用管理")
@RestController
@RequestMapping("/system/openapi/app")
@RequiredArgsConstructor
public class OpenapiAppController {

    private final IOpenapiAppService openapiAppService;
    private final OpenapiLogMapper openapiLogMapper;

    @Operation(summary = "应用列表（分页）")
    @GetMapping("/list")
    public R<IPage<OpenapiApp>> list(@RequestParam(defaultValue = "1") Integer pageNum,
                                     @RequestParam(defaultValue = "20") Integer pageSize,
                                     @RequestParam(required = false) String appName) {
        IPage<OpenapiApp> page = openapiAppService.lambdaQuery()
                .like(appName != null && !appName.isEmpty(), OpenapiApp::getAppName, appName)
                .page(new Page<>(pageNum, pageSize));
        // 脱敏 appSecret
        page.getRecords().forEach(app -> app.setAppSecret("******"));
        return R.ok(page);
    }

    @Operation(summary = "创建应用")
    @PostMapping
    public R<OpenapiApp> create(@RequestBody OpenapiApp app) {
        OpenapiApp created = openapiAppService.createApp(app);
        return R.ok(created);
    }

    @Operation(summary = "更新应用信息")
    @PutMapping("/{id}")
    public R<Void> update(@PathVariable Long id, @RequestBody OpenapiApp app) {
        app.setId(id);
        app.setAppKey(null);  // 不允许修改 appKey
        app.setAppSecret(null); // 不允许通过此接口修改 secret
        openapiAppService.updateById(app);
        return R.ok();
    }

    @Operation(summary = "删除应用")
    @DeleteMapping("/{id}")
    public R<Void> delete(@PathVariable Long id) {
        openapiAppService.removeById(id);
        return R.ok();
    }

    @Operation(summary = "重置密钥")
    @PostMapping("/{id}/reset-secret")
    public R<String> resetSecret(@PathVariable Long id) {
        String newSecret = openapiAppService.resetSecret(id);
        return R.ok(newSecret);
    }

    @Operation(summary = "启用/禁用")
    @PutMapping("/{id}/status")
    public R<Void> changeStatus(@PathVariable Long id, @RequestBody StatusRequest request) {
        openapiAppService.changeStatus(id, request.getStatus());
        return R.ok();
    }

    @Operation(summary = "统计概览")
    @GetMapping("/stats")
    public R<Map<String, Object>> stats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("appCount", openapiAppService.count());
        stats.put("todayCalls", openapiLogMapper.countToday());
        return R.ok(stats);
    }

    @Data
    public static class StatusRequest {
        private Integer status;
    }
}
