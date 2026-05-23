package com.zhehang.erp.modules.supply.controller;

import com.zhehang.erp.common.core.domain.R;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/supply")
public class SupplyController {
    // TODO: pending implementation

    @GetMapping("/status")
    public R<String> status() {
        return R.ok("supply module running");
    }
}
