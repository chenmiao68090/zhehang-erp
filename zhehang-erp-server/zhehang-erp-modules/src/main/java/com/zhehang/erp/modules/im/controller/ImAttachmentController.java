package com.zhehang.erp.modules.im.controller;

import com.zhehang.erp.common.core.annotation.DenyDuringImpersonation;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.im.domain.ImModels;
import com.zhehang.erp.modules.im.service.ImAttachmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Set;

@RestController
@RequestMapping("/im/attachments")
@RequiredArgsConstructor
@DenyDuringImpersonation(reason = "私人消息附件")
public class ImAttachmentController {
    private static final Set<String> SAFE_INLINE_MIME_TYPES = Set.of(
            "image/jpeg", "image/png", "image/gif", "image/webp");
    private final ImAttachmentService attachmentService;

    @PostMapping("/upload")
    public R<ImModels.Attachment> upload(@RequestParam Long conversationId,
                                         @RequestParam("file") MultipartFile file) {
        return R.ok(attachmentService.upload(conversationId, file));
    }

    @GetMapping("/{id}/inline")
    public ResponseEntity<?> inline(@PathVariable Long id) {
        return authorizedResponse(id, false, false);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<?> download(@PathVariable Long id) {
        return authorizedResponse(id, false, true);
    }

    @GetMapping("/{id}/thumbnail")
    public ResponseEntity<?> thumbnail(@PathVariable Long id) {
        return authorizedResponse(id, true, false);
    }

    private ResponseEntity<?> authorizedResponse(Long id, boolean thumbnail, boolean attachment) {
        try {
            return response(attachmentService.open(id, thumbnail), attachment);
        } catch (BusinessException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(R.fail(e.getMessage()));
        }
    }

    private ResponseEntity<Resource> response(ImAttachmentService.Download download, boolean attachment) {
        boolean safeInline = !attachment && download.mimeType() != null
                && SAFE_INLINE_MIME_TYPES.contains(download.mimeType().toLowerCase());
        MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;
        if (safeInline) {
            try { mediaType = MediaType.parseMediaType(download.mimeType()); } catch (Exception ignored) { }
        }
        String fileName = URLEncoder.encode(download.fileName(), StandardCharsets.UTF_8).replace("+", "%20");
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, (safeInline ? "inline" : "attachment") + "; filename*=UTF-8''" + fileName)
                .header(HttpHeaders.CACHE_CONTROL, "private, no-store")
                .header("X-Content-Type-Options", "nosniff")
                .header("Content-Security-Policy", "default-src 'none'; sandbox")
                .header("Cross-Origin-Resource-Policy", "same-origin")
                .contentType(mediaType)
                .body(download.resource());
    }
}
