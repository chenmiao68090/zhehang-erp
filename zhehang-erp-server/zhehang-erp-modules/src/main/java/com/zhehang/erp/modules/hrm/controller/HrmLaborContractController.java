package com.zhehang.erp.modules.hrm.controller;

import com.zhehang.erp.common.core.annotation.DenyDuringImpersonation;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.hrm.domain.entity.HrmLaborContract;
import com.zhehang.erp.modules.hrm.service.IHrmLaborContractService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * 劳动合同管理(飞书建议 161「劳动合同管理」,原合同到期提醒并入本模块)。
 * HR 端:分页 + 总览计数、新增/编辑、删除、即将到期列表、发送到期提醒。
 * 员工自助:/my 查本人合同。选人复用前端 employeeApi.roster,后端不新建选人接口。
 */
@RestController
@RequestMapping("/hrm/labor-contract")
@RequiredArgsConstructor
@DenyDuringImpersonation(reason = "劳动合同包含个人敏感信息")
public class HrmLaborContractController {

    private final IHrmLaborContractService contractService;

    /** HR 分页 + 总览计数(全部/生效/即将到期/已到期/已终止)。返回 {page, counts}。 */
    @GetMapping("/list")
    public R<Map<String, Object>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) String contractType,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endTo) {
        return R.ok(contractService.hrPage(pageNum, pageSize, employeeId, contractType, status, endFrom, endTo));
    }

    /** 新增/编辑劳动合同(有 id 则更新)。 */
    @PostMapping("/save")
    @Log(module = "劳动合同管理", type = Log.OperationType.INSERT)
    public R<Void> save(@RequestBody HrmLaborContract contract) {
        contractService.saveOrUpdateContract(contract);
        return R.ok();
    }

    /** 删除一份劳动合同。 */
    @DeleteMapping("/{id}")
    @Log(module = "劳动合同管理", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        contractService.deleteContract(id);
        return R.ok();
    }

    /** 即将到期:end_date 在未来 days 天内、状态非「已终止」的合同列表。 */
    @GetMapping("/expiring")
    public R<List<HrmLaborContract>> expiring(@RequestParam(defaultValue = "30") Integer days) {
        return R.ok(contractService.expiring(days));
    }

    /** 手动/接口触发:对即将到期的合同给员工本人发到期提醒(拿不到 userId 则跳过),返回提醒条数。 */
    @PostMapping("/remind-expiring")
    @Log(module = "劳动合同管理", type = Log.OperationType.UPDATE)
    public R<Integer> remindExpiring(@RequestParam(defaultValue = "30") Integer days) {
        return R.ok(contractService.remindExpiring(days));
    }

    /** 员工自助:当前登录用户查自己的劳动合同列表。 */
    @GetMapping("/my")
    public R<List<HrmLaborContract>> my() {
        return R.ok(contractService.myList());
    }
}
