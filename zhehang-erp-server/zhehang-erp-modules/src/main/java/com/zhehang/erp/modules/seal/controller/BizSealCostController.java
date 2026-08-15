package com.zhehang.erp.modules.seal.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.seal.domain.BizSealCost;
import com.zhehang.erp.modules.seal.mapper.BizSealCostMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 刻章成本明细(按月录入)。
 */
@RestController
@RequestMapping("/seal/cost")
@RequiredArgsConstructor
public class BizSealCostController {

    private final BizSealCostMapper costMapper;

    /** 查某月成本明细(不传月则查某年;都不传查全部) */
    @GetMapping("/list")
    public R<List<BizSealCost>> list(@RequestParam(required = false) String month,
                                     @RequestParam(required = false) String year) {
        return R.ok(costMapper.selectList(new LambdaQueryWrapper<BizSealCost>()
                .eq(StringUtils.hasText(month), BizSealCost::getCostMonth, month)
                .eq(StringUtils.hasText(year), BizSealCost::getCostYear, year)
                .orderByAsc(BizSealCost::getId)));
    }

    /** 批量保存某月成本明细:先删该月旧明细,再整表插入(与协议价同套路) */
    @PostMapping("/batch")
    @Transactional(rollbackFor = Exception.class)
    @Log(module = "刻章成本", type = Log.OperationType.UPDATE)
    public R<Void> batchSave(@RequestBody CostBatch body) {
        if (body == null || !StringUtils.hasText(body.getMonth())) return R.fail("缺少月份");
        String month = body.getMonth();
        String year = StringUtils.hasText(body.getYear()) ? body.getYear()
                : (month.length() >= 4 ? month.substring(0, 4) : null);
        costMapper.delete(new LambdaQueryWrapper<BizSealCost>().eq(BizSealCost::getCostMonth, month));
        if (body.getLines() != null) {
            for (BizSealCost line : body.getLines()) {
                if (line == null) continue;
                // 类型和金额都空的行跳过
                if (!StringUtils.hasText(line.getCostType()) && line.getAmount() == null) continue;
                line.setId(null);
                line.setCostMonth(month);
                line.setCostYear(year);
                costMapper.insert(line);
            }
        }
        return R.ok();
    }

    @DeleteMapping("/{id}")
    @Log(module = "刻章成本", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        costMapper.deleteById(id);
        return R.ok();
    }

    /** 批量保存入参 */
    @lombok.Data
    public static class CostBatch {
        private String year;
        private String month;
        private List<BizSealCost> lines;
    }
}
