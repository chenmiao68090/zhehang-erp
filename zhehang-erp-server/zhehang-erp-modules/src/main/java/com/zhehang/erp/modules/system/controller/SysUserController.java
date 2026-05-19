package com.zhehang.erp.modules.system.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.system.domain.dto.UserDTO;
import com.zhehang.erp.modules.system.domain.vo.UserVO;
import com.zhehang.erp.modules.system.service.ISysUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/system/user")
@RequiredArgsConstructor
public class SysUserController {

    private final ISysUserService userService;

    @GetMapping("/list")
    @PreAuthorize("@perm.hasPermission('system:user:list')")
    public R<IPage<UserVO>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String phone,
            @RequestParam(required = false) Integer status) {
        return R.ok(userService.selectUserPage(pageNum, pageSize, username, phone, status));
    }

    @GetMapping("/{id}")
    @PreAuthorize("@perm.hasPermission('system:user:query')")
    public R<UserVO> getInfo(@PathVariable Long id) {
        return R.ok(userService.selectUserById(id));
    }

    @PostMapping
    @PreAuthorize("@perm.hasPermission('system:user:add')")
    @Log(module = "用户管理", type = Log.OperationType.INSERT)
    public R<Void> add(@Valid @RequestBody UserDTO dto) {
        userService.createUser(dto);
        return R.ok();
    }

    @PutMapping
    @PreAuthorize("@perm.hasPermission('system:user:edit')")
    @Log(module = "用户管理", type = Log.OperationType.UPDATE)
    public R<Void> edit(@Valid @RequestBody UserDTO dto) {
        userService.updateUser(dto);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@perm.hasPermission('system:user:remove')")
    @Log(module = "用户管理", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        userService.deleteUser(id);
        return R.ok();
    }

    @PutMapping("/resetPwd")
    @PreAuthorize("@perm.hasPermission('system:user:resetPwd')")
    @Log(module = "用户管理", type = Log.OperationType.UPDATE)
    public R<Void> resetPwd(@RequestParam Long userId, @RequestParam String newPassword) {
        userService.resetPassword(userId, newPassword);
        return R.ok();
    }

    @PutMapping("/status")
    @PreAuthorize("@perm.hasPermission('system:user:edit')")
    @Log(module = "用户管理", type = Log.OperationType.UPDATE)
    public R<Void> changeStatus(@RequestParam Long userId, @RequestParam Integer status) {
        userService.updateStatus(userId, status);
        return R.ok();
    }

    @GetMapping("/export")
    @PreAuthorize("@perm.hasPermission('system:user:export')")
    @Log(module = "用户管理", type = Log.OperationType.EXPORT)
    public R<?> export(
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String phone,
            @RequestParam(required = false) Integer status) {
        // TODO: Implement Excel export
        return R.ok(userService.selectUserPage(1, 10000, username, phone, status));
    }
}
