package com.zhehang.erp.modules.feigesuite.controller;

import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.feigesuite.domain.dto.FeigeSuiteRequests;
import com.zhehang.erp.modules.feigesuite.service.FeigeSuiteAccessService;
import com.zhehang.erp.modules.feigesuite.service.FeigeSuitePageRegistry;
import com.zhehang.erp.modules.feigesuite.service.FeigeSuiteRecordService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/feige-suite")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class FeigeSuiteController {
    private final FeigeSuitePageRegistry registry;
    private final FeigeSuiteRecordService recordService;
    private final FeigeSuiteAccessService accessService;

    @GetMapping("/pages")
    public R<List<Map<String, Object>>> pages() {
        return R.ok(registry.all().stream().filter(definition -> {
            try {
                accessService.requireRead(definition);
                return true;
            } catch (AccessDeniedException ignored) {
                return false;
            }
        }).map(definition -> Map.<String, Object>of(
                "code", definition.code(),
                "title", definition.title(),
                "group", definition.group(),
                "defaultStatus", definition.defaultStatus(),
                "statuses", definition.statuses(),
                "actions", definition.actions()))
                .toList());
    }

    @GetMapping("/staff-options")
    public R<List<Map<String, Object>>> staffOptions() {
        return R.ok(accessService.staffOptions());
    }

    @GetMapping("/pages/{pageCode}/capabilities")
    public R<Map<String, Object>> capabilities(@PathVariable String pageCode) {
        return R.ok(accessService.capabilities(registry.require(pageCode)));
    }

    @GetMapping("/pages/{pageCode}/summary")
    public R<Map<String, Object>> summary(@PathVariable String pageCode) {
        return R.ok(recordService.summary(pageCode));
    }

    @GetMapping("/pages/{pageCode}/records")
    public R<Map<String, Object>> records(
            @PathVariable String pageCode,
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "20") Integer pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String categoryCode,
            @RequestParam(required = false) Long ownerId,
            @RequestParam(required = false) String filters,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return R.ok(recordService.page(pageCode, pageNum, pageSize, keyword, status,
                categoryCode, ownerId, filters, startDate, endDate));
    }

    @GetMapping("/pages/{pageCode}/records/{id}")
    public R<Map<String, Object>> record(@PathVariable String pageCode, @PathVariable Long id) {
        return R.ok(recordService.detail(pageCode, id));
    }

    @PostMapping("/pages/{pageCode}/records")
    public R<Long> create(@PathVariable String pageCode,
                          @Valid @RequestBody FeigeSuiteRequests.RecordUpsert request) {
        return R.ok(recordService.create(pageCode, request));
    }

    @PutMapping("/pages/{pageCode}/records/{id}")
    public R<Void> update(@PathVariable String pageCode, @PathVariable Long id,
                          @Valid @RequestBody FeigeSuiteRequests.RecordUpsert request) {
        recordService.update(pageCode, id, request);
        return R.ok();
    }

    @PostMapping("/pages/{pageCode}/records/{id}/action")
    public R<Void> action(@PathVariable String pageCode, @PathVariable Long id,
                          @Valid @RequestBody FeigeSuiteRequests.RecordAction request) {
        recordService.action(pageCode, id, request);
        return R.ok();
    }

    @DeleteMapping("/pages/{pageCode}/records/{id}")
    public R<Void> delete(@PathVariable String pageCode, @PathVariable Long id) {
        recordService.delete(pageCode, id);
        return R.ok();
    }
}
