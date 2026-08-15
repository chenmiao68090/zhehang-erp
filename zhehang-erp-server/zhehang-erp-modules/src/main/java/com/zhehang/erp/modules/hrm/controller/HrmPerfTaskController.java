package com.zhehang.erp.modules.hrm.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.hrm.domain.entity.HrmPerfItem;
import com.zhehang.erp.modules.hrm.domain.entity.HrmPerfTask;
import com.zhehang.erp.modules.hrm.domain.entity.HrmPerfTemplate;
import com.zhehang.erp.modules.hrm.mapper.HrmPerfItemMapper;
import com.zhehang.erp.modules.hrm.mapper.HrmPerfTaskMapper;
import com.zhehang.erp.modules.hrm.mapper.HrmPerfTemplateMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * HR·绩效考核任务完整流程:下发→自评→上级评价→校准→结果确认→申诉。
 * 状态机:self_eval→manager_eval→calibrate→confirm→done;另有 appeal。
 */
@RestController
@RequestMapping("/hrm/perf/task")
@RequiredArgsConstructor
public class HrmPerfTaskController {

    private final HrmPerfTaskMapper taskMapper;
    private final HrmPerfItemMapper itemMapper;
    private final HrmPerfTemplateMapper templateMapper;
    private final DataScopeHelper dataScopeHelper;
    private final ObjectMapper objectMapper;

    // ------------------------------------------------------------------ 批量下发

    @PostMapping("/batch-create")
    @Log(module = "绩效考核任务", type = Log.OperationType.INSERT)
    public R<Integer> batchCreate(@RequestBody Map<String, Object> body) {
        Long templateId = toLong(body.get("templateId"));
        String period = body.get("period") == null ? null : body.get("period").toString();
        String taskName = body.get("taskName") == null ? null : body.get("taskName").toString();

        Object targetsObj = body.get("targets");
        if (!(targetsObj instanceof List) || ((List<?>) targetsObj).isEmpty()) {
            return R.fail("请至少选择一个考核对象");
        }
        List<Map<String, Object>> targets = objectMapper.convertValue(
                targetsObj, new TypeReference<List<Map<String, Object>>>() {});

        // 读取模板维度(JSON 数组,如 [{"name":"工作业绩","weight":70}])
        List<Map<String, Object>> dimensions = new ArrayList<>();
        if (templateId != null) {
            HrmPerfTemplate template = templateMapper.selectById(templateId);
            if (template != null && StringUtils.hasText(template.getDimensions())) {
                try {
                    dimensions = objectMapper.readValue(template.getDimensions(),
                            new TypeReference<List<Map<String, Object>>>() {});
                } catch (Exception e) {
                    return R.fail("模板考核维度配置格式错误");
                }
            }
        }

        int count = 0;
        for (Map<String, Object> t : targets) {
            HrmPerfTask task = new HrmPerfTask();
            task.setTemplateId(templateId);
            task.setTaskName(taskName);
            task.setPeriod(period);
            task.setEmployeeId(toLong(t.get("employeeId")));
            task.setEmployeeName(t.get("employeeName") == null ? null : t.get("employeeName").toString());
            task.setEvaluatorId(toLong(t.get("evaluatorId")));
            task.setEvaluatorName(t.get("evaluatorName") == null ? null : t.get("evaluatorName").toString());
            task.setDept(t.get("dept") == null ? null : t.get("dept").toString());
            task.setStatus("self_eval");
            taskMapper.insert(task);

            // 复制模板维度为指标明细
            for (Map<String, Object> dim : dimensions) {
                HrmPerfItem item = new HrmPerfItem();
                item.setTaskId(task.getId());
                Object name = dim.get("name");
                item.setDimension(name == null ? null : name.toString());
                item.setWeight(toInt(dim.get("weight")));
                Object target = dim.get("standard") != null ? dim.get("standard")
                        : dim.get("target");
                item.setTarget(target == null ? null : target.toString());
                itemMapper.insert(item);
            }
            count++;
        }
        return R.ok(count);
    }

    // ------------------------------------------------------------------ 查询

    /** 当前员工被考核的任务列表 */
    @GetMapping("/mine")
    public R<List<HrmPerfTask>> mine() {
        Long empId = dataScopeHelper.currentEmployeeId();
        if (empId == null) {
            return R.ok(new ArrayList<>());
        }
        return R.ok(taskMapper.selectList(new LambdaQueryWrapper<HrmPerfTask>()
                .eq(HrmPerfTask::getEmployeeId, empId)
                .orderByDesc(HrmPerfTask::getId)));
    }

    /** 当前员工作为评价人的任务列表 */
    @GetMapping("/to-evaluate")
    public R<List<HrmPerfTask>> toEvaluate() {
        Long empId = dataScopeHelper.currentEmployeeId();
        if (empId == null) {
            return R.ok(new ArrayList<>());
        }
        return R.ok(taskMapper.selectList(new LambdaQueryWrapper<HrmPerfTask>()
                .eq(HrmPerfTask::getEvaluatorId, empId)
                .orderByDesc(HrmPerfTask::getId)));
    }

    /** HR 管理用:全部任务 */
    @GetMapping("/list")
    public R<List<HrmPerfTask>> list(@RequestParam(required = false) String status,
                                     @RequestParam(required = false) String keyword) {
        LambdaQueryWrapper<HrmPerfTask> qw = new LambdaQueryWrapper<HrmPerfTask>()
                .eq(StringUtils.hasText(status), HrmPerfTask::getStatus, status)
                .and(StringUtils.hasText(keyword), w -> w
                        .like(HrmPerfTask::getTaskName, keyword)
                        .or().like(HrmPerfTask::getEmployeeName, keyword)
                        .or().like(HrmPerfTask::getDept, keyword))
                .orderByDesc(HrmPerfTask::getId);
        return R.ok(taskMapper.selectList(qw));
    }

    /** 任务详情:{task, items} */
    @GetMapping("/{id}")
    public R<Map<String, Object>> detail(@PathVariable Long id) {
        HrmPerfTask task = taskMapper.selectById(id);
        if (task == null) {
            return R.fail("考核任务不存在");
        }
        List<HrmPerfItem> items = itemMapper.selectList(new LambdaQueryWrapper<HrmPerfItem>()
                .eq(HrmPerfItem::getTaskId, id)
                .orderByAsc(HrmPerfItem::getId));
        Map<String, Object> result = new HashMap<>();
        result.put("task", task);
        result.put("items", items);
        return R.ok(result);
    }

    // ------------------------------------------------------------------ 流程操作

    /** 自评:逐条存自评分,task.selfScore=Σ(selfScore*weight/100),status→manager_eval */
    @PostMapping("/{id}/self")
    @Log(module = "绩效考核任务", type = Log.OperationType.UPDATE)
    public R<Void> self(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        HrmPerfTask task = taskMapper.selectById(id);
        if (task == null) {
            return R.fail("考核任务不存在");
        }
        List<Map<String, Object>> items = readItems(body);
        BigDecimal total = BigDecimal.ZERO;
        for (Map<String, Object> i : items) {
            Long itemId = toLong(i.get("id"));
            if (itemId == null) {
                continue;
            }
            HrmPerfItem item = itemMapper.selectById(itemId);
            if (item == null) {
                continue;
            }
            BigDecimal score = toBigDecimal(i.get("selfScore"));
            item.setSelfScore(score);
            if (i.get("selfComment") != null) {
                item.setSelfComment(i.get("selfComment").toString());
            }
            itemMapper.updateById(item);
            total = total.add(weighted(score, item.getWeight()));
        }
        task.setSelfScore(total.setScale(2, RoundingMode.HALF_UP));
        if (body.get("selfComment") != null) {
            task.setSelfComment(body.get("selfComment").toString());
        }
        task.setStatus("manager_eval");
        taskMapper.updateById(task);
        return R.ok();
    }

    /** 上级评价:逐条存上级评分,task.managerScore=加权和,status→calibrate */
    @PostMapping("/{id}/manager")
    @Log(module = "绩效考核任务", type = Log.OperationType.UPDATE)
    public R<Void> manager(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        HrmPerfTask task = taskMapper.selectById(id);
        if (task == null) {
            return R.fail("考核任务不存在");
        }
        List<Map<String, Object>> items = readItems(body);
        BigDecimal total = BigDecimal.ZERO;
        for (Map<String, Object> i : items) {
            Long itemId = toLong(i.get("id"));
            if (itemId == null) {
                continue;
            }
            HrmPerfItem item = itemMapper.selectById(itemId);
            if (item == null) {
                continue;
            }
            BigDecimal score = toBigDecimal(i.get("managerScore"));
            item.setManagerScore(score);
            if (i.get("managerComment") != null) {
                item.setManagerComment(i.get("managerComment").toString());
            }
            itemMapper.updateById(item);
            total = total.add(weighted(score, item.getWeight()));
        }
        task.setManagerScore(total.setScale(2, RoundingMode.HALF_UP));
        if (body.get("managerComment") != null) {
            task.setManagerComment(body.get("managerComment").toString());
        }
        task.setStatus("calibrate");
        taskMapper.updateById(task);
        return R.ok();
    }

    /** 校准:存校准分/等级/说明,finalScore=calibrateScore,status→confirm */
    @PostMapping("/{id}/calibrate")
    @Log(module = "绩效考核任务", type = Log.OperationType.UPDATE)
    public R<Void> calibrate(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        HrmPerfTask task = taskMapper.selectById(id);
        if (task == null) {
            return R.fail("考核任务不存在");
        }
        BigDecimal calibrateScore = toBigDecimal(body.get("calibrateScore"));
        task.setCalibrateScore(calibrateScore);
        task.setFinalScore(calibrateScore);
        if (body.get("grade") != null) {
            task.setGrade(body.get("grade").toString());
        }
        if (body.get("calibrateComment") != null) {
            task.setCalibrateComment(body.get("calibrateComment").toString());
        }
        task.setStatus("confirm");
        taskMapper.updateById(task);
        return R.ok();
    }

    /** 被考核人确认结果,status→done */
    @PostMapping("/{id}/confirm")
    @Log(module = "绩效考核任务", type = Log.OperationType.UPDATE)
    public R<Void> confirm(@PathVariable Long id) {
        HrmPerfTask task = taskMapper.selectById(id);
        if (task == null) {
            return R.fail("考核任务不存在");
        }
        task.setStatus("done");
        taskMapper.updateById(task);
        return R.ok();
    }

    /** 申诉:存申诉理由,status→appeal */
    @PostMapping("/{id}/appeal")
    @Log(module = "绩效考核任务", type = Log.OperationType.UPDATE)
    public R<Void> appeal(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        HrmPerfTask task = taskMapper.selectById(id);
        if (task == null) {
            return R.fail("考核任务不存在");
        }
        if (body.get("appealReason") != null) {
            task.setAppealReason(body.get("appealReason").toString());
        }
        task.setStatus("appeal");
        taskMapper.updateById(task);
        return R.ok();
    }

    /** 申诉答复:存答复/最终分,status→done */
    @PostMapping("/{id}/appeal-reply")
    @Log(module = "绩效考核任务", type = Log.OperationType.UPDATE)
    public R<Void> appealReply(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        HrmPerfTask task = taskMapper.selectById(id);
        if (task == null) {
            return R.fail("考核任务不存在");
        }
        if (body.get("appealReply") != null) {
            task.setAppealReply(body.get("appealReply").toString());
        }
        BigDecimal finalScore = toBigDecimal(body.get("finalScore"));
        if (finalScore != null) {
            task.setFinalScore(finalScore);
        }
        task.setStatus("done");
        taskMapper.updateById(task);
        return R.ok();
    }

    // ------------------------------------------------------------------ 工具方法

    private List<Map<String, Object>> readItems(Map<String, Object> body) {
        Object items = body.get("items");
        if (!(items instanceof List)) {
            return new ArrayList<>();
        }
        return objectMapper.convertValue(items, new TypeReference<List<Map<String, Object>>>() {});
    }

    /** 单项加权:score * weight / 100,null 安全 */
    private BigDecimal weighted(BigDecimal score, Integer weight) {
        if (score == null || weight == null) {
            return BigDecimal.ZERO;
        }
        return score.multiply(BigDecimal.valueOf(weight))
                .divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
    }

    private Long toLong(Object o) {
        if (o == null) {
            return null;
        }
        String s = o.toString().trim();
        if (s.isEmpty()) {
            return null;
        }
        try {
            return Long.valueOf(s);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private Integer toInt(Object o) {
        if (o == null) {
            return 0;
        }
        String s = o.toString().trim();
        if (s.isEmpty()) {
            return 0;
        }
        try {
            return new BigDecimal(s).intValue();
        } catch (NumberFormatException e) {
            return 0;
        }
    }

    private BigDecimal toBigDecimal(Object o) {
        if (o == null) {
            return null;
        }
        String s = o.toString().trim();
        if (s.isEmpty()) {
            return null;
        }
        try {
            return new BigDecimal(s);
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
