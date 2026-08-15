package com.zhehang.erp.modules.system.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.annotation.DenyDuringImpersonation;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.system.domain.entity.SysDictData;
import com.zhehang.erp.modules.system.domain.entity.SysDictType;
import com.zhehang.erp.modules.system.service.ISysDictDataService;
import com.zhehang.erp.modules.system.service.ISysDictTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 数据字典管理:字典类型(sys_dict_type) + 字典项(sys_dict_data)。
 * 供各业务体系把原先写死在前端的下拉字典统一集中维护。
 */
@RestController
@RequestMapping("/system/dict")
@RequiredArgsConstructor
public class SysDictController {

    private final ISysDictTypeService dictTypeService;
    private final ISysDictDataService dictDataService;

    /* ---------------- 字典类型 ---------------- */

    @GetMapping("/type/list")
    @PreAuthorize("@perm.hasAnyRole('boss', 'super_admin')")
    public R<IPage<SysDictType>> typeList(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String dictName,
            @RequestParam(required = false) String dictType,
            @RequestParam(required = false) Integer status) {
        return R.ok(dictTypeService.selectPage(pageNum, pageSize, dictName, dictType, status));
    }

    /** 全部字典类型(不分页,下拉/初始化用) */
    @GetMapping("/type/all")
    @PreAuthorize("@perm.hasAnyRole('boss', 'super_admin')")
    public R<List<SysDictType>> typeAll() {
        return R.ok(dictTypeService.list());
    }

    @GetMapping("/type/{id}")
    @PreAuthorize("@perm.hasAnyRole('boss', 'super_admin')")
    public R<SysDictType> typeInfo(@PathVariable Long id) {
        return R.ok(dictTypeService.getById(id));
    }

    @PostMapping("/type")
    @PreAuthorize("@perm.hasAnyRole('boss', 'super_admin')")
    @DenyDuringImpersonation(reason = "员工视角禁止新增系统字段类型")
    @Log(module = "数据字典类型", type = Log.OperationType.INSERT)
    public R<Void> typeAdd(@RequestBody SysDictType type) {
        dictTypeService.addType(type);
        return R.ok();
    }

    @PutMapping("/type")
    @PreAuthorize("@perm.hasAnyRole('boss', 'super_admin')")
    @DenyDuringImpersonation(reason = "员工视角禁止修改系统字段类型")
    @Log(module = "数据字典类型", type = Log.OperationType.UPDATE)
    public R<Void> typeEdit(@RequestBody SysDictType type) {
        dictTypeService.updateType(type);
        return R.ok();
    }

    @DeleteMapping("/type/{id}")
    @PreAuthorize("@perm.hasAnyRole('boss', 'super_admin')")
    @DenyDuringImpersonation(reason = "员工视角禁止删除系统字段类型")
    @Log(module = "数据字典类型", type = Log.OperationType.DELETE)
    public R<Void> typeRemove(@PathVariable Long id) {
        dictTypeService.removeTypeCascade(id);
        return R.ok();
    }

    /* ---------------- 字典项 ---------------- */

    /** 某字典类型下全部字典项(管理用,含停用) */
    @GetMapping("/data/list/{dictType}")
    @PreAuthorize("@perm.hasAnyRole('boss', 'super_admin')")
    public R<List<SysDictData>> dataList(@PathVariable String dictType) {
        return R.ok(dictDataService.listByType(dictType));
    }

    @GetMapping("/data/{id}")
    @PreAuthorize("@perm.hasAnyRole('boss', 'super_admin')")
    public R<SysDictData> dataInfo(@PathVariable Long id) {
        return R.ok(dictDataService.getById(id));
    }

    @PostMapping("/data")
    @PreAuthorize("@perm.hasAnyRole('boss', 'super_admin')")
    @DenyDuringImpersonation(reason = "员工视角禁止新增系统字段选项")
    @Log(module = "数据字典项", type = Log.OperationType.INSERT)
    public R<Void> dataAdd(@RequestBody SysDictData data) {
        dictDataService.addData(data);
        return R.ok();
    }

    @PutMapping("/data")
    @PreAuthorize("@perm.hasAnyRole('boss', 'super_admin')")
    @DenyDuringImpersonation(reason = "员工视角禁止修改系统字段选项")
    @Log(module = "数据字典项", type = Log.OperationType.UPDATE)
    public R<Void> dataEdit(@RequestBody SysDictData data) {
        dictDataService.updateData(data);
        return R.ok();
    }

    @DeleteMapping("/data/{id}")
    @PreAuthorize("@perm.hasAnyRole('boss', 'super_admin')")
    @DenyDuringImpersonation(reason = "员工视角禁止删除系统字段选项")
    @Log(module = "数据字典项", type = Log.OperationType.DELETE)
    public R<Void> dataRemove(@PathVariable Long id) {
        dictDataService.removeDataSafely(id);
        return R.ok();
    }
}
