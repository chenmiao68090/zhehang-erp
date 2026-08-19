package com.zhehang.erp.modules.hrm.controller;

import com.zhehang.erp.common.core.annotation.DenyDuringImpersonation;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.hrm.domain.entity.HrmPayslip;
import com.zhehang.erp.modules.hrm.service.IHrmPayslipService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 薪酬核算·工资条(飞书建议 165/166/167/168)。
 * HR 端:分页/总览计数、逐条新增或编辑、批量落库(Excel 解析为 JSON)、删除、发放。
 * 员工自助:/my 查本人、{id}/confirm 签字确认、{id}/feedback 异常反馈。
 */
@RestController
@RequestMapping("/hrm/payslip")
@RequiredArgsConstructor
@DenyDuringImpersonation(reason = "工资、身份证及银行卡信息")
public class HrmPayslipController {

    private final IHrmPayslipService payslipService;
    private final DataScopeHelper dataScopeHelper;

    // ============================ HR 端 ============================

    /** HR 分页 + 总览计数(全部/待确认/已确认/有异议)。返回 {page, counts}。 */
    @GetMapping("/list")
    public R<Map<String, Object>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String payMonth,
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) String deptName,
            @RequestParam(required = false) Integer confirmStatus) {
        return R.ok(payslipService.hrPage(pageNum, pageSize, payMonth, employeeId, deptName, confirmStatus));
    }

    /** 新增/编辑单条工资条(有 id 则更新)。 */
    @PostMapping("/save")
    @Log(module = "工资条核算", type = Log.OperationType.INSERT)
    public R<Void> save(@RequestBody HrmPayslip payslip) {
        if (!dataScopeHelper.hasPerm("hr:salary:manage")) {
            return R.fail("无权限,仅HR/管理员/老板可录入工资条");
        }
        if (payslip.getId() == null) {
            if (payslip.getConfirmStatus() == null) {
                payslip.setConfirmStatus(0);
            }
            payslipService.save(payslip);
        } else {
            // 编辑不允许通过本接口篡改确认流字段,防越权改状态
            payslip.setConfirmStatus(null);
            payslip.setConfirmTime(null);
            payslip.setFeedback(null);
            payslipService.updateById(payslip);
        }
        return R.ok();
    }

    /** 批量落库:前端把 Excel 解析成数组传来,后端只管新增。返回成功条数。 */
    @PostMapping("/batch-save")
    @Log(module = "工资条核算", type = Log.OperationType.INSERT)
    public R<Integer> batchSave(@RequestBody List<HrmPayslip> list) {
        return R.ok(payslipService.batchSave(list));
    }

    /** 删除一条工资条。 */
    @DeleteMapping("/{id}")
    @Log(module = "工资条核算", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        if (!dataScopeHelper.hasPerm("hr:salary:manage")) {
            return R.fail("无权限,仅HR/管理员/老板可删除工资条");
        }
        payslipService.removeById(id);
        return R.ok();
    }

    /** 发放:把指定条(ids)或某月(payMonth)从「待发放」改为「已发放待确认」,并通知员工。 */
    @PostMapping("/distribute")
    @Log(module = "工资条核算", type = Log.OperationType.UPDATE)
    public R<Integer> distribute(@RequestBody Map<String, Object> body) {
        List<Long> ids = null;
        Object idsObj = body.get("ids");
        if (idsObj instanceof List<?> raw) {
            ids = raw.stream()
                    .filter(java.util.Objects::nonNull)
                    .map(o -> Long.valueOf(String.valueOf(o)))
                    .toList();
        }
        String payMonth = body.get("payMonth") == null ? null : String.valueOf(body.get("payMonth"));
        return R.ok(payslipService.distribute(ids, payMonth));
    }

    // ============================ 员工自助 ============================

    /** 员工自助:当前登录用户查自己的工资条列表(可按月份筛)。 */
    @GetMapping("/my")
    public R<List<HrmPayslip>> my(@RequestParam(required = false) String payMonth) {
        return R.ok(payslipService.myList(payMonth));
    }

    /** 员工签字确认(仅本人,状态须为已发放待确认)。 */
    @PostMapping("/{id}/confirm")
    @Log(module = "工资条核算", type = Log.OperationType.UPDATE)
    public R<Void> confirm(@PathVariable Long id) {
        payslipService.confirm(id);
        return R.ok();
    }

    /** 员工异常反馈(仅本人,带内容)。 */
    @PostMapping("/{id}/feedback")
    @Log(module = "工资条核算", type = Log.OperationType.UPDATE)
    public R<Void> feedback(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        String content = body.get("content") == null ? "" : String.valueOf(body.get("content"));
        payslipService.feedback(id, content);
        return R.ok();
    }
}
