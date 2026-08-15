package com.zhehang.erp.modules.org.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.annotation.DenyDuringImpersonation;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.org.domain.dto.EmployeeDTO;
import com.zhehang.erp.modules.org.domain.dto.EmployeeResignDTO;
import com.zhehang.erp.modules.org.domain.vo.EmployeeContractExpiryVO;
import com.zhehang.erp.modules.org.domain.vo.EmployeeRosterVO;
import com.zhehang.erp.modules.org.domain.vo.EmployeeVO;
import com.zhehang.erp.modules.org.service.IOrgEmployeeService;
import com.zhehang.erp.modules.system.domain.vo.InitialCredentialVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/org/employee")
@RequiredArgsConstructor
public class OrgEmployeeController {

    private final IOrgEmployeeService employeeService;

    /**
     * 合同到期提醒:返回合同结束日期在「今天 ~ 今天+days」之间(即将到期)的在职员工,
     * 按合同结束日期升序。供 HR 及时跟进续签。
     */
    @GetMapping("/contract-expiring")
    @PreAuthorize("@perm.hasAnyRole('hr', 'boss', 'super_admin', 'sys_admin')")
    @DenyDuringImpersonation(reason = "劳动合同到期信息属于个人敏感信息")
    public R<List<EmployeeContractExpiryVO>> contractExpiring(@RequestParam(defaultValue = "30") Integer days) {
        return R.ok(employeeService.selectContractExpiring(days == null ? 30 : days));
    }

    @GetMapping("/list")
    @DenyDuringImpersonation(reason = "员工完整档案包含个人敏感信息")
    public R<IPage<EmployeeVO>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Long deptId,
            @RequestParam(required = false) Long postId,
            @RequestParam(required = false) Integer status,
            @RequestParam(defaultValue = "false") Boolean excludeResigned) {
        return R.ok(employeeService.selectEmployeePage(
                pageNum, pageSize, name, deptId, postId, status, excludeResigned));
    }

    /** 全员花名册(仅 id/姓名/部门/岗位,无身份证/手机等 PII)。限 HR/管理员/老板,供设假期额度等场景取全员名单 */
    @GetMapping("/roster")
    @PreAuthorize("@perm.hasAnyRole('hr', 'boss', 'super_admin', 'sys_admin')")
    public R<List<EmployeeRosterVO>> roster() {
        return R.ok(employeeService.selectRoster());
    }

    /**
     * 全员选人专用：只返回在职/试用员工的 ID、账号 ID、姓名、部门、岗位和状态。
     * 任务、审批等需要全员下拉的页面应调用此接口，不得复用完整 EmployeeVO。
     */
    @GetMapping("/options")
    public R<List<EmployeeRosterVO>> options() {
        return R.ok(employeeService.selectEmployeeOptions());
    }

    /** 当前登录人的员工档案(本人可读,用于员工自助同步部门/岗位/工号)。 */
    @GetMapping("/me")
    @DenyDuringImpersonation(reason = "员工个人档案包含个人敏感信息")
    public R<EmployeeVO> me() {
        return R.ok(employeeService.selectCurrentEmployee());
    }

    @GetMapping("/next-code")
    @PreAuthorize("@perm.hasAnyRole('hr', 'boss', 'super_admin', 'sys_admin')")
    public R<String> nextCode() {
        return R.ok(employeeService.generateNextEmpCode());
    }

    @GetMapping("/{id}")
    @PreAuthorize("@perm.hasAnyRole('hr', 'boss', 'super_admin', 'sys_admin')")
    @DenyDuringImpersonation(reason = "员工完整档案包含个人敏感信息")
    public R<EmployeeVO> getInfo(@PathVariable Long id) {
        return R.ok(employeeService.selectEmployeeById(id));
    }

    @PostMapping
    @PreAuthorize("@perm.hasAnyRole('hr', 'boss', 'super_admin', 'sys_admin')")
    @DenyDuringImpersonation(reason = "员工视角禁止新增员工档案")
    @Log(module = "员工管理", type = Log.OperationType.INSERT,
            saveRequestData = false, saveResponseData = false)
    public R<InitialCredentialVO> add(@Valid @RequestBody EmployeeDTO dto) {
        return R.ok(employeeService.createEmployee(dto));
    }

    @PutMapping
    @PreAuthorize("@perm.hasAnyRole('hr', 'boss', 'super_admin', 'sys_admin')")
    @DenyDuringImpersonation(reason = "员工视角禁止维护员工档案")
    @Log(module = "员工管理", type = Log.OperationType.UPDATE,
            saveRequestData = false, saveResponseData = false)
    public R<InitialCredentialVO> edit(@Valid @RequestBody EmployeeDTO dto) {
        return R.ok(employeeService.updateEmployee(dto));
    }

    /**
     * 专用离职入口：员工档案、登录账号和旧会话必须同一事务收口。
     * 同事务保存真实离职日期、停用关联账号并立即作废旧会话。
     */
    @PutMapping("/{id}/resign")
    @PreAuthorize("@perm.hasAnyRole('hr', 'boss', 'super_admin', 'sys_admin')")
    @DenyDuringImpersonation(reason = "员工视角禁止办理离职")
    @Log(module = "员工管理", type = Log.OperationType.UPDATE)
    public R<Void> resign(@PathVariable Long id, @Valid @RequestBody EmployeeResignDTO dto) {
        employeeService.resignEmployee(id, dto);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@perm.hasAnyRole('boss', 'super_admin')")
    @DenyDuringImpersonation(reason = "员工视角禁止删除员工档案")
    @Log(module = "员工管理", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        employeeService.deleteEmployee(id);
        return R.ok();
    }

    @PutMapping("/{id}/account/resetPwd")
    @PreAuthorize("@perm.hasAnyRole('boss', 'super_admin')")
    @DenyDuringImpersonation(reason = "员工视角禁止重置员工账号密码")
    @Log(module = "员工管理", type = Log.OperationType.UPDATE, saveResponseData = false)
    public R<InitialCredentialVO> resetPassword(@PathVariable Long id) {
        return R.ok(employeeService.resetEmployeePassword(id));
    }

    @PutMapping("/{id}/account/status")
    @PreAuthorize("@perm.hasAnyRole('boss', 'super_admin')")
    @DenyDuringImpersonation(reason = "员工视角禁止启停员工账号")
    @Log(module = "员工管理", type = Log.OperationType.UPDATE)
    public R<Void> updateAccountStatus(@PathVariable Long id,
                                       @RequestParam Boolean accountEnabled) {
        employeeService.updateEmployeeAccountStatus(id, accountEnabled);
        return R.ok();
    }
}
