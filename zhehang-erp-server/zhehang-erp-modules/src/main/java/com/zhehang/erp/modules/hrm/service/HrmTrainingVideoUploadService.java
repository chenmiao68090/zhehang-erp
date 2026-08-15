package com.zhehang.erp.modules.hrm.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.file.domain.entity.FileInfo;
import com.zhehang.erp.modules.file.domain.entity.FileVersion;
import com.zhehang.erp.modules.file.mapper.FileInfoMapper;
import com.zhehang.erp.modules.file.mapper.FileVersionMapper;
import com.zhehang.erp.modules.file.security.UploadSecurityService;
import com.zhehang.erp.modules.hrm.domain.entity.HrmTrainingVideoUpload;
import com.zhehang.erp.modules.hrm.mapper.HrmTrainingVideoUploadMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class HrmTrainingVideoUploadService {

    private static final String STATUS_UPLOADING = "UPLOADING";
    private static final String STATUS_COMPLETED = "COMPLETED";
    private static final String STATUS_CANCELLED = "CANCELLED";
    private static final String STATUS_EXPIRED = "EXPIRED";
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("mp4", "webm", "ogg");
    private static final TypeReference<List<Integer>> INTEGER_LIST = new TypeReference<>() { };

    private final HrmTrainingVideoUploadMapper uploadMapper;
    private final FileInfoMapper fileInfoMapper;
    private final FileVersionMapper fileVersionMapper;
    private final ObjectMapper objectMapper;
    private final UploadSecurityService uploadSecurityService;

    @Value("${file.upload.path:upload}")
    private String uploadBasePath;

    @Value("${training.video.chunk-size-bytes:8388608}")
    private int configuredChunkSize;

    @Value("${training.video.max-file-size-bytes:2147483648}")
    private long maxFileSize;

    @Value("${training.video.upload-session-hours:24}")
    private long uploadSessionHours;

    @Transactional(rollbackFor = Exception.class)
    public UploadSession init(InitRequest request) {
        requireManagerContext();
        ValidatedUpload validated = validateRequest(request);
        cleanupExpiredUploads();
        HrmTrainingVideoUpload resumed = resumeSession(request == null ? null : request.resumeToken(), validated);
        if (resumed != null) {
            return sessionView(resumed);
        }

        String token = UUID.randomUUID().toString().replace("-", "");
        int chunkSize = Math.max(1024 * 1024, Math.min(16 * 1024 * 1024, configuredChunkSize));
        int totalChunks = Math.toIntExact((validated.fileSize() + chunkSize - 1) / chunkSize);
        HrmTrainingVideoUpload upload = new HrmTrainingVideoUpload();
        upload.setUploadToken(token);
        upload.setUploaderUserId(SecurityUtils.getCurrentUserId());
        upload.setOriginalName(validated.fileName());
        upload.setFileSize(validated.fileSize());
        upload.setFileFingerprint(validated.fileFingerprint());
        upload.setMimeType(validated.mimeType());
        upload.setDurationSeconds(validated.durationSeconds());
        upload.setChunkSize(chunkSize);
        upload.setTotalChunks(totalChunks);
        upload.setUploadedChunksJson("[]");
        upload.setTempPath("training-video-tmp/" + SecurityUtils.getCurrentTenantId() + "/" + token);
        upload.setStatus(STATUS_UPLOADING);
        upload.setExpiresTime(LocalDateTime.now().plusHours(Math.max(1, uploadSessionHours)));
        uploadMapper.insert(upload);
        createDirectories(resolveInsideUploadRoot(upload.getTempPath()));
        return sessionView(upload);
    }

    @Transactional(rollbackFor = Exception.class)
    public UploadSession uploadChunk(String uploadToken, int chunkIndex, MultipartFile chunk) {
        HrmTrainingVideoUpload upload = requireOwnedSession(uploadToken, STATUS_UPLOADING);
        if (chunkIndex < 0 || chunkIndex >= upload.getTotalChunks()) {
            throw new BusinessException("视频分片序号超出范围");
        }
        if (chunk == null || chunk.isEmpty()) {
            throw new BusinessException("视频分片不能为空");
        }
        long expected = chunkIndex == upload.getTotalChunks() - 1
                ? upload.getFileSize() - (long) upload.getChunkSize() * chunkIndex
                : upload.getChunkSize();
        if (chunk.getSize() != expected) {
            throw new BusinessException("视频分片大小不一致，请重新选择原文件续传");
        }

        Path directory = resolveInsideUploadRoot(upload.getTempPath());
        createDirectories(directory);
        Path target = directory.resolve(chunkFileName(chunkIndex)).normalize();
        ensureInside(directory, target);
        try (InputStream input = new BufferedInputStream(chunk.getInputStream())) {
            Files.copy(input, target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new BusinessException("视频分片保存失败，请稍后重试");
        }

        Set<Integer> uploaded = readUploadedChunks(upload.getUploadedChunksJson());
        uploaded.add(chunkIndex);
        upload.setUploadedChunksJson(writeUploadedChunks(uploaded));
        uploadMapper.updateById(upload);
        return sessionView(upload);
    }

    @Transactional(rollbackFor = Exception.class)
    public CompletedUpload complete(String uploadToken) {
        HrmTrainingVideoUpload upload = requireOwnedSession(uploadToken, null);
        if (STATUS_COMPLETED.equals(upload.getStatus()) && upload.getFileId() != null) {
            FileInfo existing = fileInfoMapper.selectById(upload.getFileId());
            if (existing == null) {
                throw new BusinessException("已完成视频文件不存在，请重新上传");
            }
            return completedView(upload, existing);
        }
        if (!STATUS_UPLOADING.equals(upload.getStatus())) {
            throw new BusinessException("当前视频上传会话不能完成合并");
        }

        Path directory = resolveInsideUploadRoot(upload.getTempPath());
        for (int index = 0; index < upload.getTotalChunks(); index++) {
            Path part = directory.resolve(chunkFileName(index));
            long expected = index == upload.getTotalChunks() - 1
                    ? upload.getFileSize() - (long) upload.getChunkSize() * index
                    : upload.getChunkSize();
            try {
                if (!Files.isRegularFile(part) || Files.size(part) != expected) {
                    throw new BusinessException("视频分片不完整，请继续上传后再合并");
                }
            } catch (IOException e) {
                throw new BusinessException("视频分片校验失败，请稍后重试");
            }
        }

        String extension = extension(upload.getOriginalName());
        String datePath = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
        String relativePath = datePath + "/" + UUID.randomUUID().toString().replace("-", "") + "." + extension;
        Path finalPath = resolveInsideUploadRoot(relativePath);
        Path assembling = finalPath.resolveSibling(finalPath.getFileName() + ".assembling");
        createDirectories(finalPath.getParent());

        try (OutputStream output = new BufferedOutputStream(Files.newOutputStream(assembling))) {
            byte[] buffer = new byte[1024 * 1024];
            for (int index = 0; index < upload.getTotalChunks(); index++) {
                try (InputStream input = new BufferedInputStream(
                        Files.newInputStream(directory.resolve(chunkFileName(index))))) {
                    int read;
                    while ((read = input.read(buffer)) >= 0) {
                        output.write(buffer, 0, read);
                    }
                }
            }
        } catch (IOException e) {
            deleteQuietly(assembling);
            throw new BusinessException("视频合并失败，请稍后重试");
        }

        try {
            if (Files.size(assembling) != upload.getFileSize()) {
                deleteQuietly(assembling);
                throw new BusinessException("视频合并后的大小不一致，请重新上传");
            }
            uploadSecurityService.validate(assembling, upload.getOriginalName(), ALLOWED_EXTENSIONS);
            Files.move(assembling, finalPath, StandardCopyOption.ATOMIC_MOVE);
        } catch (java.nio.file.AtomicMoveNotSupportedException e) {
            try {
                Files.move(assembling, finalPath, StandardCopyOption.REPLACE_EXISTING);
            } catch (IOException moveError) {
                deleteQuietly(assembling);
                throw new BusinessException("视频文件入库失败，请稍后重试");
            }
        } catch (BusinessException e) {
            deleteQuietly(assembling);
            throw e;
        } catch (IOException e) {
            deleteQuietly(assembling);
            throw new BusinessException("视频文件入库失败，请稍后重试");
        }
        try {
            FileInfo fileInfo = createFileInfo(upload, relativePath, extension);
            upload.setFileId(fileInfo.getId());
            upload.setStatus(STATUS_COMPLETED);
            upload.setUploadedChunksJson(writeAllChunks(upload.getTotalChunks()));
            uploadMapper.updateById(upload);
            scheduleCompletedUploadCleanup(directory, finalPath);
            return completedView(upload, fileInfo);
        } catch (RuntimeException e) {
            deleteQuietly(finalPath);
            throw e;
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void cancel(String uploadToken) {
        HrmTrainingVideoUpload upload = requireOwnedSession(uploadToken, null);
        if (STATUS_COMPLETED.equals(upload.getStatus())) {
            throw new BusinessException("已完成的视频不能取消上传");
        }
        upload.setStatus(STATUS_CANCELLED);
        uploadMapper.updateById(upload);
        deleteTreeAfterCommit(resolveInsideUploadRoot(upload.getTempPath()));
    }

    private FileInfo createFileInfo(HrmTrainingVideoUpload upload, String relativePath, String extension) {
        FileInfo fileInfo = new FileInfo();
        fileInfo.setFolderId(0L);
        fileInfo.setName(upload.getOriginalName());
        fileInfo.setOriginalName(upload.getOriginalName());
        fileInfo.setFilePath(relativePath);
        fileInfo.setFileSize(upload.getFileSize());
        fileInfo.setFileType(extension);
        fileInfo.setMimeType(normalizeMime(upload.getMimeType(), extension));
        fileInfo.setAccessScope("TRAINING_VIDEO");
        fileInfo.setDownloadCount(0);
        fileInfo.setCurrentVersion(1);
        fileInfo.setTenantId(upload.getTenantId());
        fileInfo.setCreateBy(upload.getUploaderUserId());
        fileInfo.setUpdateBy(upload.getUploaderUserId());
        fileInfoMapper.insert(fileInfo);

        FileVersion version = new FileVersion();
        version.setFileId(fileInfo.getId());
        version.setVersion(1);
        version.setFilePath(relativePath);
        version.setFileSize(upload.getFileSize());
        version.setChangeLog("培训视频分片上传");
        version.setUploaderId(upload.getUploaderUserId());
        version.setTenantId(upload.getTenantId());
        version.setCreateBy(upload.getUploaderUserId());
        version.setUpdateBy(upload.getUploaderUserId());
        fileVersionMapper.insert(version);
        return fileInfo;
    }

    private HrmTrainingVideoUpload resumeSession(String resumeToken, ValidatedUpload request) {
        if (!StringUtils.hasText(resumeToken)) {
            return null;
        }
        HrmTrainingVideoUpload upload = uploadMapper.selectOne(new LambdaQueryWrapper<HrmTrainingVideoUpload>()
                .eq(HrmTrainingVideoUpload::getUploadToken, resumeToken.trim())
                .eq(HrmTrainingVideoUpload::getUploaderUserId, SecurityUtils.getCurrentUserId())
                .eq(HrmTrainingVideoUpload::getStatus, STATUS_UPLOADING)
                .last("LIMIT 1"));
        if (upload == null || upload.getExpiresTime() == null || upload.getExpiresTime().isBefore(LocalDateTime.now())) {
            return null;
        }
        if (!upload.getOriginalName().equals(request.fileName())
                || !upload.getFileSize().equals(request.fileSize())
                || !request.fileFingerprint().equals(upload.getFileFingerprint())) {
            throw new BusinessException("续传文件与原视频不一致");
        }
        return upload;
    }

    private void cleanupExpiredUploads() {
        List<HrmTrainingVideoUpload> expired = uploadMapper.selectList(
                new LambdaQueryWrapper<HrmTrainingVideoUpload>()
                        .eq(HrmTrainingVideoUpload::getUploaderUserId, SecurityUtils.getCurrentUserId())
                        .eq(HrmTrainingVideoUpload::getStatus, STATUS_UPLOADING)
                        .lt(HrmTrainingVideoUpload::getExpiresTime, LocalDateTime.now())
                        .orderByAsc(HrmTrainingVideoUpload::getExpiresTime)
                        .last("LIMIT 50"));
        for (HrmTrainingVideoUpload upload : expired) {
            upload.setStatus(STATUS_EXPIRED);
            uploadMapper.updateById(upload);
            deleteTreeAfterCommit(resolveInsideUploadRoot(upload.getTempPath()));
        }
    }

    private HrmTrainingVideoUpload requireOwnedSession(String token, String requiredStatus) {
        requireManagerContext();
        if (!StringUtils.hasText(token) || !token.matches("[a-fA-F0-9]{32}")) {
            throw new BusinessException("视频上传会话无效");
        }
        HrmTrainingVideoUpload upload = uploadMapper.selectOwnedForUpdate(SecurityUtils.getCurrentTenantId(),
                SecurityUtils.getCurrentUserId(), token);
        if (upload == null) {
            throw new BusinessException("视频上传会话不存在或无权访问");
        }
        if (upload.getExpiresTime() != null && upload.getExpiresTime().isBefore(LocalDateTime.now())
                && !STATUS_COMPLETED.equals(upload.getStatus())) {
            throw new BusinessException("视频上传会话已过期，请重新上传");
        }
        if (requiredStatus != null && !requiredStatus.equals(upload.getStatus())) {
            throw new BusinessException("视频上传会话状态已变化，请刷新后重试");
        }
        return upload;
    }

    private ValidatedUpload validateRequest(InitRequest request) {
        if (request == null || !StringUtils.hasText(request.fileName()) || request.fileSize() == null
                || !StringUtils.hasText(request.fileFingerprint())) {
            throw new BusinessException("请选择要上传的视频文件");
        }
        String normalizedName = request.fileName().replace('\\', '/').trim();
        String safeName = normalizedName.substring(normalizedName.lastIndexOf('/') + 1).trim();
        if (!StringUtils.hasText(safeName) || safeName.length() > 200
                || safeName.chars().anyMatch(Character::isISOControl)) {
            throw new BusinessException("视频文件名无效或过长");
        }
        String extension = extension(safeName);
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new BusinessException("仅支持 MP4、WebM 或 OGG 视频，建议使用 MP4(H.264)");
        }
        if (request.fileSize() <= 0 || request.fileSize() > maxFileSize) {
            throw new BusinessException("视频文件大小超出限制");
        }
        Integer duration = request.durationSeconds();
        if (duration == null || duration <= 0 || duration > 86_400) {
            throw new BusinessException("无法识别视频时长，请确认文件可以正常播放");
        }
        String fingerprint = request.fileFingerprint().trim();
        if (fingerprint.length() > 128 || !fingerprint.matches("[A-Za-z0-9_-]+")) {
            throw new BusinessException("视频文件指纹无效，请重新选择文件");
        }
        return new ValidatedUpload(safeName, request.fileSize(),
                fingerprint, normalizeMime(request.mimeType(), extension), duration);
    }

    private UploadSession sessionView(HrmTrainingVideoUpload upload) {
        Set<Integer> chunks = readUploadedChunks(upload.getUploadedChunksJson());
        return new UploadSession(upload.getUploadToken(), upload.getOriginalName(), upload.getFileSize(),
                upload.getChunkSize(), upload.getTotalChunks(), new ArrayList<>(chunks),
                upload.getStatus(), upload.getExpiresTime());
    }

    private CompletedUpload completedView(HrmTrainingVideoUpload upload, FileInfo fileInfo) {
        return new CompletedUpload(upload.getUploadToken(), fileInfo.getId(), fileInfo.getOriginalName(),
                fileInfo.getFileSize(), fileInfo.getMimeType(), upload.getDurationSeconds(), "LOCAL", "READY");
    }

    private Set<Integer> readUploadedChunks(String json) {
        LinkedHashSet<Integer> result = new LinkedHashSet<>();
        if (!StringUtils.hasText(json)) {
            return result;
        }
        try {
            objectMapper.readValue(json, INTEGER_LIST).stream()
                    .filter(value -> value != null && value >= 0)
                    .sorted()
                    .forEach(result::add);
        } catch (Exception ignored) {
            // 文件分片仍会在完成阶段逐片校验，损坏的摘要不直接判定上传成功。
        }
        return result;
    }

    private String writeUploadedChunks(Set<Integer> chunks) {
        try {
            return objectMapper.writeValueAsString(chunks.stream().sorted().toList());
        } catch (Exception e) {
            throw new BusinessException("视频上传进度保存失败");
        }
    }

    private String writeAllChunks(int totalChunks) {
        LinkedHashSet<Integer> chunks = new LinkedHashSet<>();
        for (int index = 0; index < totalChunks; index++) {
            chunks.add(index);
        }
        return writeUploadedChunks(chunks);
    }

    private Path resolveInsideUploadRoot(String relativePath) {
        Path root = Path.of(uploadBasePath);
        if (!root.isAbsolute()) {
            root = Path.of(System.getProperty("user.dir")).resolve(root);
        }
        root = root.toAbsolutePath().normalize();
        Path resolved = root.resolve(relativePath).normalize();
        ensureInside(root, resolved);
        return resolved;
    }

    private void ensureInside(Path root, Path candidate) {
        if (!candidate.toAbsolutePath().normalize().startsWith(root.toAbsolutePath().normalize())) {
            throw new BusinessException("视频存储路径无效");
        }
    }

    private void createDirectories(Path path) {
        try {
            Files.createDirectories(path);
        } catch (IOException e) {
            throw new BusinessException("视频存储目录不可用");
        }
    }

    private void deleteTreeQuietly(Path directory) {
        if (directory == null || !Files.exists(directory)) {
            return;
        }
        try (var paths = Files.walk(directory)) {
            paths.sorted(Comparator.reverseOrder()).forEach(this::deleteQuietly);
        } catch (IOException ignored) {
            // 临时目录清理由后续运维任务兜底，不影响已入库视频。
        }
    }

    private void deleteTreeAfterCommit(Path directory) {
        if (!TransactionSynchronizationManager.isSynchronizationActive()) {
            deleteTreeQuietly(directory);
            return;
        }
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                deleteTreeQuietly(directory);
            }
        });
    }

    private void scheduleCompletedUploadCleanup(Path tempDirectory, Path finalFile) {
        if (!TransactionSynchronizationManager.isSynchronizationActive()) {
            deleteTreeQuietly(tempDirectory);
            return;
        }
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                deleteTreeQuietly(tempDirectory);
            }

            @Override
            public void afterCompletion(int status) {
                if (status != TransactionSynchronization.STATUS_COMMITTED) {
                    deleteQuietly(finalFile);
                }
            }
        });
    }

    private void deleteQuietly(Path path) {
        try {
            Files.deleteIfExists(path);
        } catch (IOException ignored) {
            // 不覆盖原始业务异常。
        }
    }

    private String extension(String fileName) {
        int dot = fileName == null ? -1 : fileName.lastIndexOf('.');
        return dot < 0 ? "" : fileName.substring(dot + 1).toLowerCase(Locale.ROOT);
    }

    private String normalizeMime(String mimeType, String extension) {
        if (StringUtils.hasText(mimeType) && mimeType.toLowerCase(Locale.ROOT).startsWith("video/")) {
            return mimeType.trim().toLowerCase(Locale.ROOT);
        }
        return switch (extension) {
            case "webm" -> "video/webm";
            case "ogg" -> "video/ogg";
            default -> "video/mp4";
        };
    }

    private boolean hasExpectedVideoSignature(Path file, String extension) {
        byte[] header = new byte[64 * 1024];
        int length;
        try (InputStream input = Files.newInputStream(file)) {
            length = input.read(header);
        } catch (IOException e) {
            return false;
        }
        if (length < 4) {
            return false;
        }
        if ("webm".equals(extension)) {
            return (header[0] & 0xff) == 0x1a && (header[1] & 0xff) == 0x45
                    && (header[2] & 0xff) == 0xdf && (header[3] & 0xff) == 0xa3;
        }
        if ("ogg".equals(extension)) {
            return header[0] == 'O' && header[1] == 'g' && header[2] == 'g' && header[3] == 'S';
        }
        for (int index = 0; index + 3 < length; index++) {
            if (header[index] == 'f' && header[index + 1] == 't'
                    && header[index + 2] == 'y' && header[index + 3] == 'p') {
                return true;
            }
        }
        return false;
    }

    private String chunkFileName(int index) {
        return String.format(Locale.ROOT, "chunk-%06d.part", index);
    }

    private void requireManagerContext() {
        if (SecurityUtils.getCurrentUserId() == null || SecurityUtils.getCurrentTenantId() == null) {
            throw new BusinessException("登录信息已失效，请重新登录");
        }
    }

    public record InitRequest(String fileName,
                              Long fileSize,
                              String fileFingerprint,
                              String mimeType,
                              Integer durationSeconds,
                              String resumeToken) { }

    public record UploadSession(String uploadToken,
                                String fileName,
                                Long fileSize,
                                Integer chunkSize,
                                Integer totalChunks,
                                List<Integer> uploadedChunks,
                                String status,
                                LocalDateTime expiresTime) { }

    public record CompletedUpload(String uploadToken,
                                  Long fileId,
                                  String fileName,
                                  Long fileSize,
                                  String mimeType,
                                  Integer durationSeconds,
                                  String mediaProvider,
                                  String transcodeStatus) { }

    private record ValidatedUpload(String fileName,
                                   Long fileSize,
                                   String fileFingerprint,
                                   String mimeType,
                                   Integer durationSeconds) { }
}
