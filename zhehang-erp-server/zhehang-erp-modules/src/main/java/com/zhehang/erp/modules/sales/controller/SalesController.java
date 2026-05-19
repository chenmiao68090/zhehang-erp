package com.zhehang.erp.modules.sales.controller;

import com.zhehang.erp.common.core.domain.R;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/sales")
public class SalesController {
    // TODO: pending implementation

    @GetMapping("/status")
    public R<String> status() {
        return R.ok("sales module running");
    }
}
