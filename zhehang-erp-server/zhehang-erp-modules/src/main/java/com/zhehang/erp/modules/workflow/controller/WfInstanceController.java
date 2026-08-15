package com.zhehang.erp.modules.workflow.controller;

import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.workflow.domain.dto.WfResubmitDTO;
import com.zhehang.erp.modules.workflow.domain.dto.WfStartDTO;
import com.zhehang.erp.modules.workflow.domain.entity.WfInstance;
import com.zhehang.erp.modules.workflow.domain.vo.WfInstanceVO;
import com.zhehang.erp.modules.workflow.mapper.WfInstanceMapper;
import com.zhehang.erp.modules.workflow.mapper.WfTaskMapper;
import com.zhehang.erp.modules.workflow.service.IWfInstanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.zhehang.erp.modules.workflow.domain.entity.WfTask;

@RestController
@RequestMapping("/workflow/instance")
@RequiredArgsConstructor
public class WfInstanceController {

    private final IWfInstanceService instanceService;
    private final WfInstanceMapper instanceMapper;
    private final WfTaskMapper taskMapper;
    private final DataScopeHelper dataScopeHelper;

    @PostMapping("/start")
    @Log(module = "审批流程", type = Log.OperationType.INSERT)
    public R<Void> start(@RequestBody WfStartDTO dto) {
        instanceService.startProcess(dto.getProcessKey(), dto.getTitle(), dto.getFormData(), dto.getBizType(), dto.getBizId());
        return R.ok();
    }

    @GetMapping("/detail/{id}")
    public R<WfInstanceVO> detail(@PathVariable Long id) {
        WfInstance instance = instanceMapper.selectById(id);
        if (instance == null) {
            return R.fail("流程实例不存在");
        }
        Long currentUserId = SecurityUtils.getCurrentUserId();
        boolean participant = taskMapper.selectCount(new LambdaQueryWrapper<WfTask>()
                .eq(WfTask::getInstanceId, id)
                .eq(WfTask::getAssigneeId, currentUserId)) > 0;
        // 数据范围校验必须用 initiatorId(业务归属人):种子/代发起数据里 createBy 与 initiatorId 不一致,
        // 用 createBy 会让"管得到创建人"的人越权看到别人的审批;老板/管理员/HR 因全公司监控放行
        boolean allowed = currentUserId != null && currentUserId.equals(instance.getInitiatorId())
                || participant
                || dataScopeHelper.isHrAdminOrBoss()
                || dataScopeHelper.canAccess(instance.getInitiatorId(), null);
        if (!allowed) {
            return R.fail(403, "无权查看他人记录");
        }
        return R.ok(instanceService.getDetail(id));
    }

    @PutMapping("/cancel/{id}")
    @Log(module = "审批流程", type = Log.OperationType.UPDATE)
    public R<Void> cancel(@PathVariable Long id) {
        instanceService.cancel(id);
        return R.ok();
    }

    /** 重新提交:发起人修改被退回(待修改)的申请后重新从头流转 */
    @PutMapping("/resubmit/{id}")
    @Log(module = "审批流程", type = Log.OperationType.UPDATE)
    public R<Void> resubmit(@PathVariable Long id, @RequestBody WfResubmitDTO dto) {
        instanceService.resubmit(id, dto);
        return R.ok();
    }

    /** 全公司审批监控(限老板/管理员/HR):状态/流程/关键字/时间段筛选,前端按当前任务时限标超时 */
    @GetMapping("/admin/list")
    public R<com.baomidou.mybatisplus.core.metadata.IPage<WfInstanceVO>> adminList(
            com.zhehang.erp.modules.workflow.domain.dto.WfTaskQuery query,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) Long initiatorId) {
        if (!dataScopeHelper.isHrAdminOrBoss()) {
            return R.fail(403, "无权查看全公司审批");
        }
        return R.ok(instanceService.adminList(query, status, initiatorId));
    }

    @DeleteMapping("/{id}")
    @Log(module = "审批流程", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        instanceService.removeStarted(id);
        return R.ok();
    }
}
