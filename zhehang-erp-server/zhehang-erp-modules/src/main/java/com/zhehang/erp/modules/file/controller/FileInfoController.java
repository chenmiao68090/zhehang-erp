package com.zhehang.erp.modules.file.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.annotation.DenyDuringImpersonation;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.file.domain.entity.FileInfo;
import com.zhehang.erp.modules.file.domain.entity.FileVersion;
import com.zhehang.erp.modules.file.mapper.FileInfoMapper;
import com.zhehang.erp.modules.file.service.IFileInfoService;
import com.zhehang.erp.modules.hrm.domain.entity.HrmTrainingMaterial;
import com.zhehang.erp.modules.hrm.mapper.HrmTrainingMaterialMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/file/info")
@RequiredArgsConstructor
@DenyDuringImpersonation(reason = "公司共享文件可能包含合同、证件及其他敏感资料")
public class FileInfoController {

    private static final List<String> SAFE_INLINE_MIME_TYPES = List.of(
            "image/jpeg", "image/png", "image/gif", "image/webp");

    private final IFileInfoService fileInfoService;
    private final FileInfoMapper fileInfoMapper;
    private final DataScopeHelper dataScopeHelper;
    private final HrmTrainingMaterialMapper trainingMaterialMapper;

    @GetMapping("/list")
    public R<IPage<FileInfo>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) Long folderId,
            @RequestParam(required = false) String keyword) {
        return R.ok(hideOffboardingFiles(fileInfoService.getFileList(pageNum, pageSize, folderId, keyword)));
    }

    @PostMapping("/upload")
    @Log(module = "文件管理", type = Log.OperationType.INSERT)
    public R<FileInfo> upload(@RequestParam("file") MultipartFile file,
                              @RequestParam(required = false) Long folderId) {
        return R.ok(fileInfoService.uploadFile(file, folderId));
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> download(@PathVariable Long id) {
        // 普通文件保持公司共享；离职SOP、受保护培训课件则在下方单独收紧。
        assertProtectedFileAllowed(id);
        return fileResponse(fileInfoService.downloadFile(id), true);
    }

    @GetMapping("/inline/{id}")
    public ResponseEntity<Resource> inline(@PathVariable Long id) {
        assertProtectedFileAllowed(id);
        return fileResponse(fileInfoService.readFile(id), false);
    }

    @GetMapping("/preview/{id}")
    public R<Map<String, Object>> preview(@PathVariable Long id) {
        assertProtectedFileAllowed(id);
        return R.ok(fileInfoService.previewFile(id));
    }

    private ResponseEntity<Resource> fileResponse(Map<String, Object> result, boolean download) {
        String filePath = (String) result.get("filePath");
        String fileName = (String) result.get("fileName");
        String mimeType = (String) result.get("mimeType");

        File file = new File(filePath);
        if (!file.exists()) {
            return ResponseEntity.notFound().build();
        }

        Resource resource = new FileSystemResource(file);
        String encodedName = URLEncoder.encode(fileName, StandardCharsets.UTF_8).replace("+", "%20");
        boolean safeInline = !download && mimeType != null
                && SAFE_INLINE_MIME_TYPES.contains(mimeType.toLowerCase());
        MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;
        if (safeInline) {
            try {
                mediaType = MediaType.parseMediaType(mimeType);
            } catch (Exception ignored) {
                mediaType = MediaType.APPLICATION_OCTET_STREAM;
            }
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, (safeInline ? "inline" : "attachment") + "; filename*=UTF-8''" + encodedName)
                .header(HttpHeaders.CACHE_CONTROL, "no-store")
                .header("X-Content-Type-Options", "nosniff")
                .header("Content-Security-Policy", "default-src 'none'; sandbox")
                .header("Cross-Origin-Resource-Policy", "same-origin")
                .contentType(safeInline ? mediaType : MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }

    private void assertProtectedFileAllowed(Long fileId) {
        if (fileId == null || dataScopeHelper.isHrAdminOrBoss()) {
            return;
        }
        FileInfo fileInfo = fileInfoService.getById(fileId);
        if (fileInfo != null && "OFFBOARDING_SOP".equalsIgnoreCase(fileInfo.getAccessScope())) {
            throw new BusinessException("离职交接附件仅人事、老板或管理员可访问");
        }
        if (fileInfo != null && "TRAINING_VIDEO".equalsIgnoreCase(fileInfo.getAccessScope())) {
            throw new BusinessException("培训课件原文件已保护，请在培训中心系统内学习");
        }
        List<HrmTrainingMaterial> protectedMaterials = trainingMaterialMapper.selectList(
                new LambdaQueryWrapper<HrmTrainingMaterial>()
                        .eq(HrmTrainingMaterial::getFileId, fileId)
                        .eq(HrmTrainingMaterial::getEnabled, true));
        boolean protectedCourseware = protectedMaterials.stream().anyMatch(this::isProtectedTrainingCourseware);
        if (protectedCourseware) {
            throw new BusinessException("培训课件原文件已保护，请在培训中心系统内学习");
        }
    }

    private boolean isProtectedTrainingCourseware(HrmTrainingMaterial material) {
        String type = material.getMaterialType() == null ? "" : material.getMaterialType().trim().toUpperCase();
        String name = material.getFileName() == null ? "" : material.getFileName().trim().toLowerCase();
        return "PPT".equals(type)
                || "VIDEO".equals(type)
                || name.endsWith(".ppt")
                || name.endsWith(".pptx")
                || name.endsWith(".mp4")
                || name.endsWith(".webm")
                || name.endsWith(".ogg");
    }

    @DeleteMapping("/{id}")
    @Log(module = "文件管理", type = Log.OperationType.DELETE)
    public R<Void> delete(@PathVariable Long id) {
        assertProtectedFileAllowed(id);
        FileInfo file = fileInfoService.getById(id);
        if (file != null && !dataScopeHelper.canAccess(file.getCreateBy(), null)) {
            return R.fail("无权删除他人文件");
        }
        fileInfoService.deleteFile(id);
        return R.ok();
    }

    @PutMapping("/move")
    @Log(module = "文件管理", type = Log.OperationType.UPDATE)
    public R<Void> move(@RequestParam Long id, @RequestParam Long targetFolderId) {
        assertProtectedFileAllowed(id);
        FileInfo file = fileInfoService.getById(id);
        if (file != null && !dataScopeHelper.canAccess(file.getCreateBy(), null)) {
            return R.fail("无权移动他人文件");
        }
        fileInfoService.moveFile(id, targetFolderId);
        return R.ok();
    }

    @PutMapping("/rename/{id}")
    @Log(module = "文件管理", type = Log.OperationType.UPDATE)
    public R<Void> rename(@PathVariable Long id, @RequestParam String newName) {
        assertProtectedFileAllowed(id);
        FileInfo file = fileInfoService.getById(id);
        if (file != null && !dataScopeHelper.canAccess(file.getCreateBy(), null)) {
            return R.fail("无权重命名他人文件");
        }
        fileInfoService.renameFile(id, newName);
        return R.ok();
    }

    @GetMapping("/versions/{id}")
    public R<List<FileVersion>> versions(@PathVariable Long id) {
        assertProtectedFileAllowed(id);
        return R.ok(fileInfoService.getVersionHistory(id));
    }

    @PostMapping("/upload-version/{id}")
    @Log(module = "文件管理", type = Log.OperationType.UPDATE)
    public R<FileInfo> uploadVersion(@PathVariable Long id,
                                     @RequestParam("file") MultipartFile file,
                                     @RequestParam(required = false, defaultValue = "") String changeLog) {
        assertProtectedFileAllowed(id);
        FileInfo existing = fileInfoService.getById(id);
        if (existing != null && !dataScopeHelper.canAccess(existing.getCreateBy(), null)) {
            return R.fail("无权操作他人文件");
        }
        return R.ok(fileInfoService.uploadNewVersion(id, file, changeLog));
    }

    @GetMapping("/recycle")
    public R<IPage<FileInfo>> recycle(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        return R.ok(hideOffboardingFiles(fileInfoService.getRecycleBin(pageNum, pageSize)));
    }

    @PutMapping("/restore/{id}")
    @Log(module = "文件管理", type = Log.OperationType.UPDATE)
    public R<Void> restore(@PathVariable Long id) {
        assertRecycleOperationAllowed(id);
        fileInfoService.restoreFile(id);
        return R.ok();
    }

    @DeleteMapping("/permanent/{id}")
    @Log(module = "文件管理", type = Log.OperationType.DELETE)
    public R<Void> permanentDelete(@PathVariable Long id) {
        FileInfo file = assertRecycleOperationAllowed(id);
        if (file != null && !dataScopeHelper.isHrAdminOrBoss()
                && !dataScopeHelper.canAccess(file.getCreateBy(), null)) {
            return R.fail("无权删除他人文件");
        }
        fileInfoService.permanentDelete(id);
        return R.ok();
    }

    @GetMapping("/search")
    public R<IPage<FileInfo>> search(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String keyword) {
        return R.ok(hideOffboardingFiles(fileInfoService.searchFiles(pageNum, pageSize, keyword)));
    }

    private IPage<FileInfo> hideOffboardingFiles(IPage<FileInfo> page) {
        if (page == null || dataScopeHelper.isHrAdminOrBoss() || page.getRecords() == null) {
            return page;
        }
        int before = page.getRecords().size();
        page.setRecords(page.getRecords().stream()
                .filter(file -> !"OFFBOARDING_SOP".equalsIgnoreCase(file.getAccessScope()))
                .toList());
        int hidden = before - page.getRecords().size();
        if (hidden > 0) {
            page.setTotal(Math.max(0, page.getTotal() - hidden));
        }
        return page;
    }

    /**
     * 逻辑删除后通用 getById 会过滤记录；这里使用只投影安全字段的专用查询精确识别保护范围，
     * 仅拦截离职交接附件，普通回收站文件继续沿用原有操作口径。
     */
    private FileInfo assertRecycleOperationAllowed(Long fileId) {
        if (fileId == null) {
            return null;
        }
        FileInfo recycledFile = fileInfoMapper.selectIncludingDeletedById(fileId);
        if (recycledFile != null && "OFFBOARDING_SOP".equalsIgnoreCase(recycledFile.getAccessScope())
                && !dataScopeHelper.isHrAdminOrBoss()) {
            throw new BusinessException("离职交接附件仅人事、老板或管理员可访问");
        }
        return recycledFile;
    }
}
