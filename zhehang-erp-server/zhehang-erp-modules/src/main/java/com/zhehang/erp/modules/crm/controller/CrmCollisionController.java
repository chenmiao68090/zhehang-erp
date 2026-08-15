package com.zhehang.erp.modules.crm.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.annotation.AllowDuringImpersonationRead;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.crm.domain.dto.DuplicateCheckResult;
import com.zhehang.erp.modules.crm.domain.entity.CrmCollisionLog;
import com.zhehang.erp.modules.crm.service.ICrmCollisionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/crm/collision")
@RequiredArgsConstructor
public class CrmCollisionController {

    private final ICrmCollisionService collisionService;

    /** 结构化查重:返回 { hasDuplicate, matchLevel(P0~P3), matchField, existingLead* }(与前端契约对齐) */
    @PostMapping("/check")
    @AllowDuringImpersonationRead("仅按当前员工数据范围执行线索查重，不写库")
    public R<DuplicateCheckResult> check(@RequestBody Map<String, String> params) {
        return R.ok(collisionService.checkDuplicateDetail(
                params.get("creditCode"),
                params.get("name"),
                params.get("phone"),
                params.get("contactName")));
    }

    @PostMapping("/resolve/{id}")
    @Log(module = "撞单处理", type = Log.OperationType.UPDATE)
    public R<Void> resolve(@PathVariable Long id, @RequestBody Map<String, String> params) {
        collisionService.resolveCollision(id, params.get("resolution"), params.get("detail"));
        return R.ok();
    }

    @GetMapping("/log")
    public R<IPage<CrmCollisionLog>> log(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        return R.ok(collisionService.getCollisionLogs(pageNum, pageSize));
    }
}
