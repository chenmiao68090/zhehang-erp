package com.zhehang.erp.modules.task.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.task.domain.BizSatisfaction;
import com.zhehang.erp.modules.task.mapper.BizSatisfactionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/satisfaction")
@RequiredArgsConstructor
public class BizSatisfactionController {

    private final BizSatisfactionMapper satisfactionMapper;

    @GetMapping("/list")
    public R<IPage<BizSatisfaction>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) Integer status) {
        LambdaQueryWrapper<BizSatisfaction> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(customerId != null, BizSatisfaction::getCustomerId, customerId)
                .eq(status != null, BizSatisfaction::getStatus, status)
                .orderByDesc(BizSatisfaction::getCreateTime);
        return R.ok(satisfactionMapper.selectPage(new Page<>(pageNum, pageSize), wrapper));
    }

    @PostMapping
    @Log(module = "客户回访", type = Log.OperationType.INSERT)
    public R<Long> add(@RequestBody BizSatisfaction satisfaction) {
        if (satisfaction.getStatus() == null) {
            satisfaction.setStatus(satisfaction.getVisitTime() != null ? 1 : 0);
        }
        satisfactionMapper.insert(satisfaction);
        return R.ok(satisfaction.getId());
    }

    @GetMapping("/pending")
    public R<IPage<BizSatisfaction>> pending(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        LambdaQueryWrapper<BizSatisfaction> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(BizSatisfaction::getStatus, 0)
                .orderByAsc(BizSatisfaction::getCreateTime);
        return R.ok(satisfactionMapper.selectPage(new Page<>(pageNum, pageSize), wrapper));
    }
}
