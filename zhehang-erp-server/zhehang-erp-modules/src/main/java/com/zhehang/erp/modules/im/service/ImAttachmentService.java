package com.zhehang.erp.modules.im.service;

import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.file.security.UploadSecurityService;
import com.zhehang.erp.modules.im.domain.ImEntities;
import com.zhehang.erp.modules.im.domain.ImModels;
import com.zhehang.erp.modules.im.mapper.ImAttachmentMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ImAttachmentService {
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            "jpg", "jpeg", "png", "gif", "webp", "pdf", "doc", "docx", "xls", "xlsx",
            "ppt", "pptx", "txt", "csv", "zip", "rar");
    private final ImAccessService access;
    private final ImTaskAccessService taskAccess;
    private final ImAttachmentMapper attachmentMapper;
    private final UploadSecurityService uploadSecurityService;

    @Value("${im.max-file-size:20971520}")
    private long maxFileSize;

    @Value("${im.upload-path:upload/im}")
    private String uploadPath;

    @Transactional(rollbackFor = Exception.class)
    public ImModels.Attachment upload(Long conversationId, MultipartFile file) {
        access.requireConversation(conversationId);
        return store(conversationId, file);
    }

    @Transactional(rollbackFor = Exception.class)
    public ImModels.Attachment uploadForTask(Long taskId, MultipartFile file) {
        ImEntities.TaskDetail task = taskAccess.requireResponsible(taskId);
        if (!Set.of("in_progress", "rejected").contains(task.getWorkflowState())) {
            throw new BusinessException("当前待办状态不能上传处理凭证");
        }
        return store(task.getConversationId(), file);
    }

    private ImModels.Attachment store(Long conversationId, MultipartFile file) {
        if (file == null || file.isEmpty()) throw new BusinessException("请选择文件");
        if (file.getSize() > maxFileSize) throw new BusinessException("文件不能超过" + (maxFileSize / 1024 / 1024) + "MB");
        UploadSecurityService.ValidatedFile validated = uploadSecurityService.validate(file, ALLOWED_EXTENSIONS);
        String originalName = validated.originalName();
        String extension = validated.extension();
        String expectedMime = validated.mimeType();

        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
        String storedName = UUID.randomUUID().toString().replace("-", "") + "." + extension;
        String storageKey = date + "/" + storedName;
        Path target = resolve(storageKey);
        String thumbnailKey = null;
        try {
            Files.createDirectories(target.getParent());
            try (InputStream in = file.getInputStream()) {
                Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
            }
            if (expectedMime.startsWith("image/") && !"webp".equals(extension)) {
                thumbnailKey = createThumbnail(target, date, storedName);
            }
        } catch (Exception e) {
            deleteQuietly(target);
            if (e instanceof BusinessException businessException) throw businessException;
            throw new BusinessException("附件上传失败，请重试");
        }

        ImEntities.Attachment attachment = new ImEntities.Attachment();
        attachment.setTenantId(access.currentTenantId());
        attachment.setCompanyId(access.currentTenantId());
        attachment.setConversationId(conversationId);
        attachment.setUploaderId(access.currentUserId());
        attachment.setStorageKey(storageKey);
        attachment.setOriginalName(originalName);
        attachment.setMimeType(expectedMime);
        attachment.setFileSize(file.getSize());
        attachment.setThumbnailKey(thumbnailKey);
        attachment.setUploadStatus("uploaded");
        attachment.setScanStatus(validated.scanStatus());
        attachment.setCreatedAt(LocalDateTime.now());
        try {
            attachmentMapper.insert(attachment);
        } catch (RuntimeException e) {
            deleteQuietly(target);
            if (thumbnailKey != null) deleteQuietly(resolve(thumbnailKey));
            throw e;
        }
        return toModel(attachment);
    }

    public Download open(Long attachmentId, boolean thumbnail) {
        ImEntities.Attachment attachment = attachmentMapper.selectById(attachmentId);
        if (attachment == null) throw new BusinessException("附件不存在");
        if (attachment.getMessageId() == null && attachment.getTaskId() == null) {
            if (!access.currentUserId().equals(attachment.getUploaderId())) {
                throw new BusinessException("附件尚未发送");
            }
        } else if (attachment.getTaskId() != null) {
            taskAccess.requireView(attachment.getTaskId());
        } else {
            access.requireMember(attachment.getConversationId());
        }
        String key = thumbnail && StringUtils.hasText(attachment.getThumbnailKey())
                ? attachment.getThumbnailKey() : attachment.getStorageKey();
        Path path = resolve(key);
        if (!Files.isRegularFile(path)) throw new BusinessException("附件文件不存在");
        Resource resource = new FileSystemResource(path);
        String mime = thumbnail ? "image/jpeg" : attachment.getMimeType();
        return new Download(resource, attachment.getOriginalName(), mime, attachment.getFileSize());
    }

    private ImModels.Attachment toModel(ImEntities.Attachment entity) {
        ImModels.Attachment model = new ImModels.Attachment();
        model.setId(entity.getId());
        model.setOriginalName(entity.getOriginalName());
        model.setMimeType(entity.getMimeType());
        model.setFileSize(entity.getFileSize());
        model.setImage(entity.getMimeType() != null && entity.getMimeType().startsWith("image/"));
        model.setPreviewUrl("/im/attachments/" + entity.getId() + "/inline");
        model.setDownloadUrl("/im/attachments/" + entity.getId() + "/download");
        model.setThumbnailUrl(entity.getThumbnailKey() == null ? null : "/im/attachments/" + entity.getId() + "/thumbnail");
        model.setCreatedAt(entity.getCreatedAt());
        return model;
    }

    private String createThumbnail(Path source, String date, String storedName) throws IOException {
        BufferedImage original = ImageIO.read(source.toFile());
        if (original == null) throw new BusinessException("图片文件内容无效");
        int max = 360;
        double ratio = Math.min(1d, Math.min((double) max / original.getWidth(), (double) max / original.getHeight()));
        int width = Math.max(1, (int) Math.round(original.getWidth() * ratio));
        int height = Math.max(1, (int) Math.round(original.getHeight() * ratio));
        BufferedImage thumb = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics2D graphics = thumb.createGraphics();
        graphics.setColor(Color.WHITE);
        graphics.fillRect(0, 0, width, height);
        graphics.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        graphics.drawImage(original, 0, 0, width, height, null);
        graphics.dispose();
        String key = date + "/thumb_" + storedName.replaceFirst("\\.[^.]+$", ".jpg");
        Path target = resolve(key);
        ImageIO.write(thumb, "jpg", target.toFile());
        return key;
    }

    private Path resolve(String key) {
        Path base = Paths.get(uploadPath).toAbsolutePath().normalize();
        Path path = base.resolve(key).normalize();
        if (!path.startsWith(base)) throw new BusinessException("非法文件路径");
        return path;
    }

    private String safeOriginalName(String value) {
        String name = value == null ? "file" : Paths.get(value).getFileName().toString();
        name = name.replaceAll("[\\r\\n\\u0000]", "").trim();
        if (!StringUtils.hasText(name) || name.length() > 255) throw new BusinessException("文件名不合法");
        return name;
    }

    private String extensionOf(String name) {
        int dot = name.lastIndexOf('.');
        return dot < 0 ? "" : name.substring(dot + 1).toLowerCase(Locale.ROOT);
    }

    private void deleteQuietly(Path path) {
        try { Files.deleteIfExists(path); } catch (IOException ignored) { }
    }

    public record Download(Resource resource, String fileName, String mimeType, long fileSize) {}
}
