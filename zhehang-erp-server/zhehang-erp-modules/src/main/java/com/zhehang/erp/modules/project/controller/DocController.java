package com.zhehang.erp.modules.project.controller;

import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.project.domain.entity.PmDoc;
import com.zhehang.erp.modules.project.service.IPmDocService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/project/doc")
@RequiredArgsConstructor
public class DocController {

    private final IPmDocService docService;

    @GetMapping("/list")
    public R<List<PmDoc>> list(@RequestParam Long projectId) {
        return R.ok(docService.listByProject(projectId));
    }

    @PostMapping
    @Log(module = "项目文档", type = Log.OperationType.INSERT)
    public R<Void> add(@RequestBody PmDoc doc) {
        docService.save(doc);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    @Log(module = "项目文档", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        docService.removeById(id);
        return R.ok();
    }
}
