package com.zhehang.erp.modules.file.controller;

import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.file.domain.entity.FileFolder;
import com.zhehang.erp.modules.file.service.IFileFolderService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/file/folder")
@RequiredArgsConstructor
public class FileFolderController {

    private final IFileFolderService folderService;
    private final DataScopeHelper dataScopeHelper;

    @GetMapping("/tree")
    public R<List<Map<String, Object>>> tree() {
        return R.ok(folderService.getFolderTree());
    }

    @PostMapping
    @Log(module = "文件夹管理", type = Log.OperationType.INSERT)
    public R<Void> create(@RequestBody FileFolder folder) {
        folderService.createFolder(folder);
        return R.ok();
    }

    @PutMapping
    @Log(module = "文件夹管理", type = Log.OperationType.UPDATE)
    public R<Void> rename(@RequestBody FileFolder folder) {
        FileFolder existing = folderService.getById(folder.getId());
        if (existing != null && !dataScopeHelper.canAccess(existing.getCreateBy(), null)) {
            return R.fail("无权修改他人文件夹");
        }
        folderService.renameFolder(folder);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    @Log(module = "文件夹管理", type = Log.OperationType.DELETE)
    public R<Void> delete(@PathVariable Long id) {
        FileFolder existing = folderService.getById(id);
        if (existing != null && !dataScopeHelper.canAccess(existing.getCreateBy(), null)) {
            return R.fail("无权删除他人文件夹");
        }
        folderService.deleteFolder(id);
        return R.ok();
    }

    @PutMapping("/move")
    @Log(module = "文件夹管理", type = Log.OperationType.UPDATE)
    public R<Void> move(@RequestParam Long id, @RequestParam Long targetParentId) {
        folderService.moveFolder(id, targetParentId);
        return R.ok();
    }
}
