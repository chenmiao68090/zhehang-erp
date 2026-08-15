package com.zhehang.erp.modules.workflow.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.workflow.domain.dto.WfApproveDTO;
import com.zhehang.erp.modules.workflow.domain.dto.WfTaskQuery;
import com.zhehang.erp.modules.workflow.domain.vo.WfColleagueVO;
import com.zhehang.erp.modules.workflow.domain.vo.WfInstanceVO;
import com.zhehang.erp.modules.workflow.domain.vo.WfTaskVO;
import com.zhehang.erp.modules.workflow.mapper.WfTaskMapper;
import com.zhehang.erp.modules.workflow.service.IWfInstanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/workflow/task")
@RequiredArgsConstructor
public class WfTaskController {

    private final IWfInstanceService instanceService;
    private final WfTaskMapper taskMapper;

    @GetMapping("/todo")
    public R<IPage<WfTaskVO>> todo(WfTaskQuery query) {
        return R.ok(instanceService.getMyTodo(query));
    }

    @GetMapping("/done")
    public R<IPage<WfTaskVO>> done(WfTaskQuery query) {
        return R.ok(instanceService.getMyDone(query));
    }

    @GetMapping("/started")
    public R<IPage<WfInstanceVO>> started(WfTaskQuery query) {
        return R.ok(instanceService.getMyStarted(query));
    }

    @GetMapping("/cc")
    public R<IPage<WfTaskVO>> cc(WfTaskQuery query) {
        return R.ok(instanceService.getMyCc(query));
    }

    /** 四个列表一次性计数(待办/已办/抄送我/已发起),供角标一次拉齐,不用逐个点进才有数 */
    @GetMapping("/counts")
    public R<Map<String, Long>> counts() {
        return R.ok(instanceService.myCounts());
    }

    @PutMapping("/approve/{id}")
    @Log(module = "审批流程", type = Log.OperationType.UPDATE)
    public R<Void> approve(@PathVariable Long id, @RequestBody WfApproveDTO dto) {
        instanceService.approve(id, dto.getComment());
        return R.ok();
    }

    @PutMapping("/reject/{id}")
    @Log(module = "审批流程", type = Log.OperationType.UPDATE)
    public R<Void> reject(@PathVariable Long id, @RequestBody WfApproveDTO dto) {
        instanceService.reject(id, dto.getComment());
        return R.ok();
    }

    @PutMapping("/transfer/{id}")
    @Log(module = "审批流程", type = Log.OperationType.UPDATE)
    public R<Void> transfer(@PathVariable Long id, @RequestBody WfApproveDTO dto) {
        instanceService.transfer(id, dto.getTargetUserId(), dto.getComment());
        return R.ok();
    }

    /** 退回修改:把申请退给发起人改表单(不是拒绝),发起人改完可重新提交 */
    @PutMapping("/return/{id}")
    @Log(module = "审批流程", type = Log.OperationType.UPDATE)
    public R<Void> returnForRevision(@PathVariable Long id, @RequestBody WfApproveDTO dto) {
        instanceService.returnForRevision(id, dto != null ? dto.getComment() : null);
        return R.ok();
    }

    /** 催办:发起人提醒当前审批人尽快处理(同任务4小时限频) */
    @PostMapping("/urge/{id}")
    @Log(module = "审批流程", type = Log.OperationType.UPDATE)
    public R<Void> urge(@PathVariable Long id) {
        instanceService.urge(id);
        return R.ok();
    }

    /**
     * 批量审批:多个待办任务一次性通过。逐个走单条 approve(经 Spring 代理各自独立事务+行锁+原子认领),
     * 某条失败(已被处理/无权/下一节点无人)不影响其余,返回成功条数与失败明细。
     */
    @PutMapping("/batch-approve")
    @Log(module = "审批流程", type = Log.OperationType.UPDATE)
    public R<Map<String, Object>> batchApprove(@RequestBody WfApproveDTO dto) {
        List<Long> ids = dto == null ? null : dto.getTaskIds();
        if (ids == null || ids.isEmpty()) {
            return R.fail("请选择要批量通过的审批");
        }
        int ok = 0;
        List<String> failed = new java.util.ArrayList<>();
        for (Long id : ids) {
            try {
                instanceService.approve(id, dto.getComment());
                ok++;
            } catch (Exception e) {
                failed.add("任务" + id + ":" + e.getMessage());
            }
        }
        Map<String, Object> res = new java.util.HashMap<>();
        res.put("success", ok);
        res.put("failed", failed);
        return R.ok(res);
    }

    /** 标记一条抄送为已读(进"抄送我"点开某条时调用) */
    @PutMapping("/cc/read/{id}")
    public R<Void> markCcRead(@PathVariable Long id) {
        instanceService.markCcRead(id);
        return R.ok();
    }

    /** 审批选人下拉(抄送/转交用):已开通账号的员工。 */
    @GetMapping("/colleagues")
    public R<List<WfColleagueVO>> colleagues() {
        return R.ok(taskMapper.selectColleagues());
    }

    /** 补充抄送:把审批实例抄送给指定同事(出现在对方「抄送我」)。 */
    @PostMapping("/cc/{instanceId}")
    @Log(module = "审批流程", type = Log.OperationType.INSERT)
    public R<Void> addCc(@PathVariable Long instanceId, @RequestBody List<Long> userIds) {
        instanceService.addCc(instanceId, userIds);
        return R.ok();
    }
}
