package com.zhehang.erp.modules.steward.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.steward.domain.BizStewardComm;
import com.zhehang.erp.modules.steward.mapper.BizStewardCommMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

/**
 * 管家体系·沟通记录。
 */
@RestController
@RequestMapping("/steward/comm")
@RequiredArgsConstructor
public class StewardCommController {

    private final BizStewardCommMapper commMapper;

    @GetMapping("/list")
    public R<IPage<BizStewardComm>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long clientId) {
        LambdaQueryWrapper<BizStewardComm> qw = new LambdaQueryWrapper<BizStewardComm>()
                .and(StringUtils.hasText(keyword), w -> w.like(BizStewardComm::getClientName, keyword)
                        .or().like(BizStewardComm::getContent, keyword))
                .eq(clientId != null, BizStewardComm::getClientId, clientId)
                .orderByDesc(BizStewardComm::getCommTime)
                .orderByDesc(BizStewardComm::getId);
        return R.ok(commMapper.selectPage(new Page<>(pageNum, pageSize), qw));
    }

    @PostMapping
    @Log(module = "管家·沟通记录", type = Log.OperationType.INSERT)
    public R<Void> add(@RequestBody BizStewardComm c) {
        commMapper.insert(c);
        return R.ok();
    }

    @PutMapping
    @Log(module = "管家·沟通记录", type = Log.OperationType.UPDATE)
    public R<Void> edit(@RequestBody BizStewardComm c) {
        commMapper.updateById(c);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    @Log(module = "管家·沟通记录", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        commMapper.deleteById(id);
        return R.ok();
    }
}
