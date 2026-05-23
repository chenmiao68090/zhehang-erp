package com.zhehang.erp.modules.project.controller;

import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.project.service.IPmProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/project/stats")
@RequiredArgsConstructor
public class StatsController {

    private final IPmProjectService projectService;

    @GetMapping("/{projectId}")
    public R<Map<String, Object>> stats(@PathVariable Long projectId) {
        return R.ok(projectService.getStats(projectId));
    }
}
