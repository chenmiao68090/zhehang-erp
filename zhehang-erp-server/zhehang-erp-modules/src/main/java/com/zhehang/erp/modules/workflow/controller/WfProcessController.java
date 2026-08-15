package com.zhehang.erp.modules.workflow.controller;

import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.workflow.domain.dto.WfProcessDefDTO;
import com.zhehang.erp.modules.workflow.domain.vo.WfProcessDefVO;
import com.zhehang.erp.modules.workflow.service.IWfInstanceService;
import com.zhehang.erp.modules.workflow.service.IWfProcessService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/workflow/process")
@RequiredArgsConstructor
public class WfProcessController {

    private final IWfProcessService processService;
    private final IWfInstanceService instanceService;
    private final DataScopeHelper dataScopeHelper;

    @GetMapping("/list")
    public R<List<WfProcessDefVO>> list(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Integer status) {
        List<WfProcessDefVO> list = processService.list(name, category, status);
        // 审批链配置(谁审谁、金额分级)只给流程管理员看;普通员工发起审批只需要表单配置
        if (!dataScopeHelper.isHrAdminOrBoss()) {
            list.forEach(vo -> vo.setProcessConfig(null));
        }
        return R.ok(list);
    }

    /** 发布预检(只读):校验流程每个审批节点是否都能解析到审批人;返回问题清单,空=通过 */
    @GetMapping("/precheck/{id}")
    public R<List<String>> precheck(@PathVariable Long id) {
        if (!dataScopeHelper.isHrAdminOrBoss()) {
            return R.fail("无权管理流程定义");
        }
        return R.ok(instanceService.precheckProcessDef(id));
    }

    /** 设计器选审批人即时预警:返回该角色人数/未设上级人数与提示 */
    @GetMapping("/assignee-preview")
    public R<Map<String, Object>> assigneePreview(
            @RequestParam String assigneeType,
            @RequestParam(required = false) String assigneeValue) {
        if (!dataScopeHelper.isHrAdminOrBoss()) {
            return R.fail("无权管理流程定义");
        }
        return R.ok(instanceService.previewAssignee(assigneeType, assigneeValue));
    }

    @GetMapping("/{id}")
    public R<WfProcessDefVO> getInfo(@PathVariable Long id) {
        return R.ok(processService.getById(id));
    }

    @PostMapping
    @Log(module = "审批设置", type = Log.OperationType.INSERT)
    public R<Void> create(@RequestBody WfProcessDefDTO dto) {
        if (!dataScopeHelper.isHrAdminOrBoss()) {
            return R.fail("无权管理流程定义");
        }
        processService.createProcessDef(dto);
        return R.ok();
    }

    @PutMapping
    @Log(module = "审批设置", type = Log.OperationType.UPDATE)
    public R<Void> update(@RequestBody WfProcessDefDTO dto) {
        if (!dataScopeHelper.isHrAdminOrBoss()) {
            return R.fail("无权管理流程定义");
        }
        processService.updateProcessDef(dto);
        return R.ok();
    }

    @PutMapping("/publish/{id}")
    @Log(module = "审批设置", type = Log.OperationType.UPDATE)
    public R<Void> publish(@PathVariable Long id) {
        if (!dataScopeHelper.isHrAdminOrBoss()) {
            return R.fail("无权管理流程定义");
        }
        processService.publishProcess(id);
        return R.ok();
    }

    @PutMapping("/disable/{id}")
    @Log(module = "审批设置", type = Log.OperationType.UPDATE)
    public R<Void> disable(@PathVariable Long id) {
        if (!dataScopeHelper.isHrAdminOrBoss()) {
            return R.fail("无权管理流程定义");
        }
        processService.disableProcess(id);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    @Log(module = "审批设置", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        if (!dataScopeHelper.isHrAdminOrBoss()) {
            return R.fail("无权管理流程定义");
        }
        processService.removeProcess(id);
        return R.ok();
    }

    @GetMapping("/templates")
    public R<List<Map<String, Object>>> templates() {
        return R.ok(processService.getTemplates());
    }
}
