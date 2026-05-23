package com.zhehang.erp.modules.org.controller;

import com.zhehang.erp.common.core.domain.R;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/org")
public class OrgController {
    // TODO: pending implementation

    @GetMapping("/status")
    public R<String> status() {
        return R.ok("org module running");
    }
}
