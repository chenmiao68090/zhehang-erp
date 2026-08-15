package com.zhehang.erp.modules.system.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.annotation.DenyDuringImpersonation;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.system.domain.dto.UserDTO;
import com.zhehang.erp.modules.system.domain.dto.PasswordChangeDTO;
import com.zhehang.erp.modules.system.domain.dto.PasswordResetDTO;
import com.zhehang.erp.modules.system.domain.vo.InitialCredentialVO;
import com.zhehang.erp.modules.system.domain.vo.UserVO;
import com.zhehang.erp.modules.system.service.ISysUserService;
import com.zhehang.erp.modules.system.util.CsvExportUtils;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/system/user")
@RequiredArgsConstructor
public class SysUserController {

    private final ISysUserService userService;

    @GetMapping("/list")
    @PreAuthorize("@perm.hasAnyRole('boss', 'super_admin') and @perm.hasPermission('system:user:list')")
    public R<IPage<UserVO>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String phone,
            @RequestParam(required = false) Integer status) {
        return R.ok(userService.selectUserPage(pageNum, pageSize, username, phone, status));
    }

    @GetMapping("/{id}")
    @PreAuthorize("@perm.hasAnyRole('boss', 'super_admin') and @perm.hasPermission('system:user:query')")
    public R<UserVO> getInfo(@PathVariable Long id) {
        return R.ok(userService.selectUserById(id));
    }

    @PostMapping
    @PreAuthorize("@perm.hasAnyRole('boss', 'super_admin') and @perm.hasPermission('system:user:add')")
    @DenyDuringImpersonation(reason = "员工视角禁止创建系统账号")
    @Log(module = "用户管理", type = Log.OperationType.INSERT, saveResponseData = false)
    public R<InitialCredentialVO> add(@Valid @RequestBody UserDTO dto) {
        return R.ok(userService.createUser(dto));
    }

    @PutMapping
    @PreAuthorize("@perm.hasAnyRole('boss', 'super_admin') and @perm.hasPermission('system:user:edit')")
    @DenyDuringImpersonation(reason = "员工视角禁止修改系统账号")
    @Log(module = "用户管理", type = Log.OperationType.UPDATE)
    public R<Void> edit(@Valid @RequestBody UserDTO dto) {
        userService.updateUser(dto);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@perm.hasAnyRole('boss', 'super_admin') and @perm.hasPermission('system:user:remove')")
    @DenyDuringImpersonation(reason = "员工视角禁止删除系统账号")
    @Log(module = "用户管理", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        userService.deleteUser(id);
        return R.ok();
    }

    @PutMapping("/resetPwd")
    @PreAuthorize("@perm.hasAnyRole('boss', 'super_admin') and @perm.hasPermission('system:user:resetPwd')")
    @DenyDuringImpersonation(reason = "员工视角禁止重置系统账号密码")
    @Log(module = "用户管理", type = Log.OperationType.UPDATE, saveResponseData = false)
    public R<InitialCredentialVO> resetPwd(@Valid @RequestBody PasswordResetDTO request) {
        return R.ok(userService.resetPassword(request.getUserId()));
    }

    /** 当前登录用户自助修改密码:校验原密码,任意登录用户可用,无需特殊权限 */
    @PutMapping("/profile/updatePwd")
    @DenyDuringImpersonation(reason = "员工视角禁止修改目标员工密码")
    @Log(module = "个人中心", type = Log.OperationType.UPDATE)
    public R<Void> updateMyPassword(@Valid @RequestBody PasswordChangeDTO request) {
        userService.updateMyPassword(request.getOldPassword(), request.getNewPassword());
        return R.ok();
    }

    @PutMapping("/resetMfa")
    @PreAuthorize("@perm.hasAnyRole('boss', 'super_admin') and @perm.hasPermission('system:user:resetPwd')")
    @DenyDuringImpersonation(reason = "员工视角禁止重置系统账号MFA")
    @Log(module = "用户管理", type = Log.OperationType.UPDATE)
    public R<Void> resetMfa(@Valid @RequestBody PasswordResetDTO request) {
        userService.resetMfa(request.getUserId());
        return R.ok();
    }

    @PutMapping("/status")
    @PreAuthorize("@perm.hasAnyRole('boss', 'super_admin') and @perm.hasPermission('system:user:edit')")
    @DenyDuringImpersonation(reason = "员工视角禁止启停系统账号")
    @Log(module = "用户管理", type = Log.OperationType.UPDATE)
    public R<Void> changeStatus(@RequestParam Long userId, @RequestParam Integer status) {
        userService.updateStatus(userId, status);
        return R.ok();
    }

    @GetMapping("/export")
    @PreAuthorize("@perm.hasAnyRole('boss', 'super_admin') and @perm.hasPermission('system:user:export')")
    @Log(module = "用户管理", type = Log.OperationType.EXPORT)
    public void export(
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String phone,
            @RequestParam(required = false) Integer status,
            HttpServletResponse response) throws IOException {
        List<UserVO> users = userService.selectUserPage(1, 10000, username, phone, status).getRecords();
        CsvExportUtils.write(response, "system-users.csv",
                List.of("用户ID", "用户名", "姓名", "手机号", "邮箱", "部门", "状态", "角色", "创建时间"),
                users,
                List.of(
                        UserVO::getId,
                        UserVO::getUsername,
                        UserVO::getNickname,
                        UserVO::getPhone,
                        UserVO::getEmail,
                        UserVO::getDeptName,
                        user -> user.getStatus() != null && user.getStatus() == 0 ? "启用" : "停用",
                        user -> user.getRoleNames() == null ? "" : String.join("、", user.getRoleNames()),
                        UserVO::getCreateTime
                ));
    }
}
