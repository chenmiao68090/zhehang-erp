package com.zhehang.erp.modules.crm.controller;

import com.zhehang.erp.common.core.domain.R;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/crm")
public class CrmController {
    // TODO: pending implementation

    @GetMapping("/status")
    public R<String> status() {
        return R.ok("crm module running");
    }
}
