package com.zhehang.erp.modules.workflow.controller;

import com.zhehang.erp.common.core.domain.R;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/workflow")
public class WorkflowController {
    // TODO: pending implementation

    @GetMapping("/status")
    public R<String> status() {
        return R.ok("workflow module running");
    }
}
