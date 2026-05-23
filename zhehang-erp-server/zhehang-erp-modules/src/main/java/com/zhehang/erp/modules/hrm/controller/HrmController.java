package com.zhehang.erp.modules.hrm.controller;

import com.zhehang.erp.common.core.domain.R;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/hrm")
public class HrmController {
    // TODO: pending implementation

    @GetMapping("/status")
    public R<String> status() {
        return R.ok("hrm module running");
    }
}
