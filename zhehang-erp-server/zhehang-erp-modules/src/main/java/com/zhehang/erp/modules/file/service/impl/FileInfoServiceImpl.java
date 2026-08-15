package com.zhehang.erp.modules.file.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.modules.file.domain.entity.FileInfo;
import com.zhehang.erp.modules.file.domain.entity.FileVersion;
import com.zhehang.erp.modules.file.mapper.FileInfoMapper;
import com.zhehang.erp.modules.file.mapper.FileVersionMapper;
import com.zhehang.erp.modules.file.security.UploadSecurityService;
import com.zhehang.erp.modules.file.service.IFileInfoService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class FileInfoServiceImpl extends ServiceImpl<FileInfoMapper, FileInfo> implements IFileInfoService {

    private final FileVersionMapper fileVersionMapper;
    private final UploadSecurityService uploadSecurityService;

    @Value("${file.upload.path:upload}")
    private String uploadBasePath;

    @Override
    public IPage<FileInfo> getFileList(Integer pageNum, Integer pageSize, Long folderId, String keyword) {
        LambdaQueryWrapper<FileInfo> wrapper = new LambdaQueryWrapper<>();
        if (folderId != null) {
            wrapper.eq(FileInfo::getFolderId, folderId);
        }
        if (StringUtils.hasText(keyword)) {
            wrapper.like(FileInfo::getName, keyword);
        }
        wrapper.orderByDesc(FileInfo::getUpdateTime);
        return page(new Page<>(pageNum, pageSize), wrapper);
    }

    private static final Set<String> ALLOWED_UPLOAD_EXTENSIONS = Set.of(
            "jpg", "jpeg", "png", "gif", "webp", "pdf", "doc", "docx", "xls", "xlsx",
            "ppt", "pptx", "txt", "csv", "zip", "rar", "mp4", "webm", "ogg", "mp3", "wav");

    @Override
    public FileInfo uploadFile(MultipartFile file, Long folderId) {
        UploadSecurityService.ValidatedFile validated = uploadSecurityService.validate(file, ALLOWED_UPLOAD_EXTENSIONS);
        String originalName = validated.originalName();
        String fileType = validated.extension();
        String mimeType = validated.mimeType();
        long fileSize = file.getSize();

        // Generate storage path: upload/yyyy/MM/dd/uuid.ext
        String datePath = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
        String storedName = UUID.randomUUID().toString().replace("-", "") + "." + fileType;
        String relativePath = datePath + "/" + storedName;

        // Create directory and save file.
        // 注意:MultipartFile.transferTo() 传入相对路径时,是相对于 Servlet 容器(Tomcat)的临时目录解析,
        // 而不是进程工作目录 —— 这会导致 mkdirs() 建的目录与 transferTo() 写入的位置不一致,
        // 抛 FileNotFoundException(整个文件上传功能坏掉)。这里统一转成绝对路径,确保建目录与写文件是同一处。
        File dest = resolveUploadFile(relativePath);
        dest.getParentFile().mkdirs();
        try {
            file.transferTo(dest);
        } catch (IOException e) {
            throw new RuntimeException("文件上传失败: " + e.getMessage());
        }

        // Save file record
        FileInfo fileInfo = new FileInfo();
        fileInfo.setFolderId(folderId != null ? folderId : 0L);
        fileInfo.setName(originalName);
        fileInfo.setOriginalName(originalName);
        fileInfo.setFilePath(relativePath);
        fileInfo.setFileSize(fileSize);
        fileInfo.setFileType(fileType);
        fileInfo.setMimeType(mimeType);
        fileInfo.setAccessScope("NORMAL");
        fileInfo.setDownloadCount(0);
        fileInfo.setCurrentVersion(1);
        save(fileInfo);

        // Save first version
        FileVersion version = new FileVersion();
        version.setFileId(fileInfo.getId());
        version.setVersion(1);
        version.setFilePath(relativePath);
        version.setFileSize(fileSize);
        version.setChangeLog("初始版本");
        fileVersionMapper.insert(version);

        return fileInfo;
    }

    @Override
    public Map<String, Object> downloadFile(Long id) {
        Map<String, Object> result = readFile(id);
        // Increment download count
        update(new LambdaUpdateWrapper<FileInfo>()
                .eq(FileInfo::getId, id)
                .setSql("download_count = download_count + 1"));
        return result;
    }

    @Override
    public Map<String, Object> readFile(Long id) {
        FileInfo fileInfo = getById(id);
        if (fileInfo == null) {
            throw new RuntimeException("文件不存在");
        }
        Map<String, Object> result = new HashMap<>();
        // 与上传写入位置保持一致(绝对路径),否则相对路径下载时会找不到文件
        result.put("filePath", resolveUploadFile(fileInfo.getFilePath()).getAbsolutePath());
        result.put("fileName", fileInfo.getOriginalName());
        result.put("mimeType", fileInfo.getMimeType());
        result.put("fileType", fileInfo.getFileType());
        return result;
    }

    @Override
    public Map<String, Object> previewFile(Long id) {
        FileInfo fileInfo = getById(id);
        if (fileInfo == null) {
            throw new RuntimeException("文件不存在");
        }
        Map<String, Object> result = new HashMap<>();
        result.put("id", fileInfo.getId());
        result.put("name", fileInfo.getName());
        result.put("mimeType", fileInfo.getMimeType());
        result.put("fileType", fileInfo.getFileType());
        result.put("fileSize", fileInfo.getFileSize());
        result.put("previewUrl", "/api/file/info/inline/" + id);
        return result;
    }

    @Override
    public void deleteFile(Long id) {
        // Soft delete (TableLogic handles it)
        removeById(id);
    }

    @Override
    public void moveFile(Long id, Long targetFolderId) {
        FileInfo fileInfo = getById(id);
        if (fileInfo != null) {
            fileInfo.setFolderId(targetFolderId);
            updateById(fileInfo);
        }
    }

    @Override
    public void renameFile(Long id, String newName) {
        FileInfo fileInfo = getById(id);
        if (fileInfo != null) {
            fileInfo.setName(newName);
            updateById(fileInfo);
        }
    }

    @Override
    public List<FileVersion> getVersionHistory(Long fileId) {
        return fileVersionMapper.selectList(
                new LambdaQueryWrapper<FileVersion>()
                        .eq(FileVersion::getFileId, fileId)
                        .orderByDesc(FileVersion::getVersion));
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(rollbackFor = Exception.class)
    public FileInfo uploadNewVersion(Long fileId, MultipartFile file, String changeLog) {
        FileInfo fileInfo = getById(fileId);
        if (fileInfo == null) {
            throw new RuntimeException("文件不存在");
        }

        UploadSecurityService.ValidatedFile validated = uploadSecurityService.validate(file, ALLOWED_UPLOAD_EXTENSIONS);
        String fileType = validated.extension();
        String datePath = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
        String storedName = UUID.randomUUID().toString().replace("-", "") + "." + fileType;
        String relativePath = datePath + "/" + storedName;

        // 同 uploadFile:用绝对路径,避免 transferTo() 相对路径解析到 Tomcat 临时目录导致写入失败
        File dest = resolveUploadFile(relativePath);
        dest.getParentFile().mkdirs();
        try {
            file.transferTo(dest);
        } catch (IOException e) {
            throw new RuntimeException("文件上传失败: " + e.getMessage());
        }

        int newVersion = (fileInfo.getCurrentVersion() == null ? 0 : fileInfo.getCurrentVersion()) + 1;

        // Save version record
        FileVersion version = new FileVersion();
        version.setFileId(fileId);
        version.setVersion(newVersion);
        version.setFilePath(relativePath);
        version.setFileSize(file.getSize());
        version.setChangeLog(changeLog);
        fileVersionMapper.insert(version);

        // Update file info
        fileInfo.setCurrentVersion(newVersion);
        fileInfo.setFilePath(relativePath);
        fileInfo.setFileSize(file.getSize());
        fileInfo.setFileType(validated.extension());
        fileInfo.setMimeType(validated.mimeType());
        updateById(fileInfo);

        return fileInfo;
    }

    @Override
    public IPage<FileInfo> getRecycleBin(Integer pageNum, Integer pageSize) {
        // Query soft-deleted files using a custom query that includes deleted=1
        Page<FileInfo> pageObj = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<FileInfo> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByDesc(FileInfo::getUpdateTime);
        // Note: For recycle bin, need to use baseMapper directly with deleted condition
        // This would need a custom SQL since @TableLogic filters deleted records by default
        return page(pageObj, wrapper);
    }

    @Override
    public void restoreFile(Long id) {
        // Restore from recycle bin - set deleted=0
        update(new LambdaUpdateWrapper<FileInfo>()
                .eq(FileInfo::getId, id)
                .set(FileInfo::getDeleted, 0));
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(rollbackFor = Exception.class)
    public void permanentDelete(Long id) {
        // Physically delete the file and record
        FileInfo fileInfo = getById(id);
        if (fileInfo != null) {
            // Collect physical file paths first; do all DB deletes inside the
            // transaction, then delete files only after DB succeeds so a rollback
            // never leaves the DB record while the file is already gone.
            List<String> pathsToDelete = new ArrayList<>();
            pathsToDelete.add(fileInfo.getFilePath());
            // Delete version records (and collect their file paths)
            List<FileVersion> versions = fileVersionMapper.selectList(
                    new LambdaQueryWrapper<FileVersion>().eq(FileVersion::getFileId, id));
            for (FileVersion v : versions) {
                pathsToDelete.add(v.getFilePath());
                fileVersionMapper.deleteById(v.getId());
            }
            // Remove main record physically
            baseMapper.deleteById(id);
            // All DB deletes succeeded — now remove the physical files
            for (String path : pathsToDelete) {
                File f = resolveUploadFile(path);
                if (f.exists()) {
                    f.delete();
                }
            }
        }
    }

    @Override
    public IPage<FileInfo> searchFiles(Integer pageNum, Integer pageSize, String keyword) {
        LambdaQueryWrapper<FileInfo> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(keyword)) {
            wrapper.like(FileInfo::getName, keyword)
                    .or()
                    .like(FileInfo::getOriginalName, keyword);
        }
        wrapper.orderByDesc(FileInfo::getUpdateTime);
        return page(new Page<>(pageNum, pageSize), wrapper);
    }

    private String getFileExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            return "";
        }
        return fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
    }

    /**
     * 把 relativePath(形如 2026/07/03/xxx.png)解析成绝对文件路径。
     * uploadBasePath 若是相对路径(默认 "upload"),这里锚定到进程工作目录并转成绝对路径,
     * 保证 mkdirs() 建目录 与 MultipartFile.transferTo() 写文件、以及后续下载/删除,指向同一处。
     */
    private File resolveUploadFile(String relativePath) {
        File base = new File(uploadBasePath);
        if (!base.isAbsolute()) {
            base = base.getAbsoluteFile();
        }
        return new File(base, relativePath);
    }
}
