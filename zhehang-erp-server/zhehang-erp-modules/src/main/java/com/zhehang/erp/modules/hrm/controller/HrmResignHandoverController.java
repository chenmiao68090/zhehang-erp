package com.zhehang.erp.modules.hrm.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.annotation.DenyDuringImpersonation;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.hrm.domain.entity.HrmResignHandover;
import com.zhehang.erp.modules.hrm.domain.vo.OffboardingSummaryVO;
import com.zhehang.erp.modules.hrm.domain.vo.ResignedStaffDetailVO;
import com.zhehang.erp.modules.hrm.domain.vo.ResignedStaffVO;
import com.zhehang.erp.modules.hrm.service.IHrmResignHandoverService;
import com.zhehang.erp.modules.file.domain.entity.FileInfo;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * 离职人员统一中心与离职交接台账。
 * 管理端权限在 service 内用 dataScopeHelper.isHrAdminOrBoss() 把关；
 * 员工视角代登录不能访问，避免借被代登录账号越权查看或更改离职资料。
 */
@RestController
@RequestMapping("/hrm/resign-handover")
@RequiredArgsConstructor
@DenyDuringImpersonation(reason = "员工视角禁止查看或办理离职交接")
public class HrmResignHandoverController {

    private final IHrmResignHandoverService handoverService;

    /** 按员工/状态查交接记录列表。 */
    @GetMapping("/list")
    public R<List<HrmResignHandover>> list(
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) Integer status) {
        return R.ok(handoverService.listRecords(employeeId, status));
    }

    /**
     * 兼容旧前端的新增/编辑入口。实际新增和更新请优先调用 /create、/update，
     * 避免把更新错记为新增；此兼容口统一记为 OTHER。
    */
    @PostMapping("/save")
    @Log(module = "离职交接管理", type = Log.OperationType.OTHER,
            saveRequestData = false, saveResponseData = false)
    public R<Void> save(@RequestBody HrmResignHandover record) {
        handoverService.saveOrUpdateRecord(record);
        return R.ok();
    }

    @PostMapping("/create")
    @Log(module = "离职交接管理", type = Log.OperationType.INSERT,
            saveRequestData = false, saveResponseData = false)
    public R<Void> create(@RequestBody HrmResignHandover record) {
        record.setId(null);
        handoverService.saveOrUpdateRecord(record);
        return R.ok();
    }

    @PutMapping("/update")
    @Log(module = "离职交接管理", type = Log.OperationType.UPDATE,
            saveRequestData = false, saveResponseData = false)
    public R<Void> update(@RequestBody HrmResignHandover record) {
        if (record.getId() == null) {
            return R.fail("更新离职交接时记录ID不能为空");
        }
        handoverService.saveOrUpdateRecord(record);
        return R.ok();
    }

    /** 取某员工的全部交接记录。 */
    @GetMapping("/by-employee/{employeeId}")
    public R<List<HrmResignHandover>> getByEmployee(@PathVariable Long employeeId) {
        return R.ok(handoverService.getByEmployee(employeeId));
    }

    /** 离职人员统一中心：每人一行，只返回最小安全字段。 */
    @GetMapping("/center")
    public R<IPage<ResignedStaffVO>> center(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "20") Integer pageSize,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Long deptId,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) Boolean riskOnly) {
        return R.ok(handoverService.selectCenterPage(pageNum, pageSize, name, deptId, status, riskOnly));
    }

    @GetMapping("/summary")
    public R<OffboardingSummaryVO> summary() {
        return R.ok(handoverService.getCenterSummary());
    }

    @GetMapping("/center/{employeeId}")
    public R<ResignedStaffDetailVO> centerDetail(@PathVariable Long employeeId) {
        return R.ok(handoverService.getCenterDetail(employeeId));
    }

    @PostMapping("/sop/upload")
    @Log(module = "离职交接管理", type = Log.OperationType.INSERT,
            saveRequestData = false, saveResponseData = false)
    public R<FileInfo> uploadSop(@RequestParam("file") MultipartFile file) {
        return R.ok(handoverService.uploadProtectedSop(file));
    }
}
