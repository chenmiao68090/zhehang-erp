package com.zhehang.erp.modules.hrm.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.hrm.domain.entity.HrmTrainingMaterial;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpRange;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.io.File;
import java.io.IOException;
import java.io.RandomAccessFile;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class HrmTrainingVideoPlaybackService {

    private static final String TICKET_PREFIX = "training:video:play:";
    private static final int STREAM_BUFFER_SIZE = 64 * 1024;

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    @Value("${training.video.play-ticket-minutes:45}")
    private long configuredTicketMinutes;

    public PlaybackTicket issueLocal(HrmTrainingMaterial material,
                                     Long learningRecordId,
                                     Map<String, Object> file,
                                     String userAgent) {
        if (material == null || material.getId() == null || material.getFileId() == null) {
            throw new BusinessException("视频课件文件未配置");
        }
        String filePath = String.valueOf(file.getOrDefault("filePath", ""));
        File localFile = new File(filePath);
        if (!localFile.isFile()) {
            throw new BusinessException("视频文件不存在，请联系培训管理员重新上传");
        }
        String token = UUID.randomUUID().toString().replace("-", "")
                + UUID.randomUUID().toString().replace("-", "");
        long durationMinutes = material.getDurationSeconds() == null
                ? 0 : Math.max(1, (material.getDurationSeconds() + 59L) / 60L);
        long ticketMinutes = Math.max(Math.max(15, configuredTicketMinutes), durationMinutes + 15);
        ticketMinutes = Math.min(ticketMinutes, 180);
        long expiresAt = Instant.now().plusSeconds(ticketMinutes * 60).toEpochMilli();
        TicketPayload payload = new TicketPayload(material.getId(), material.getFileId(), learningRecordId,
                SecurityUtils.getCurrentUserId(), SecurityUtils.getCurrentTenantId(),
                localFile.getAbsolutePath(), safeMime(file.get("mimeType"), material.getFileName()),
                String.valueOf(file.getOrDefault("fileName", material.getFileName())),
                userAgentHash(userAgent), expiresAt);
        try {
            redisTemplate.opsForValue().set(TICKET_PREFIX + token,
                    objectMapper.writeValueAsString(payload), ticketMinutes, TimeUnit.MINUTES);
        } catch (Exception e) {
            throw new BusinessException("视频播放票据生成失败，请稍后重试");
        }
        String playUrl = "/api/hrm/training/courseware/video/stream/" + material.getId()
                + "?ticket=" + URLEncoder.encode(token, StandardCharsets.UTF_8);
        return new PlaybackTicket("LOCAL_SECURE", playUrl, true, expiresAt,
                material.getDurationSeconds(), minWatchPercent(material),
                !Boolean.FALSE.equals(material.getAllowSpeed()),
                !Boolean.FALSE.equals(material.getWatermarkEnabled()));
    }

    public PlaybackTicket issueExternal(HrmTrainingMaterial material) {
        if (material == null || !StringUtils.hasText(material.getMaterialUrl())) {
            throw new BusinessException("外部视频地址未配置");
        }
        String url = material.getMaterialUrl().trim();
        if (!url.matches("(?i)^https?://.+")) {
            throw new BusinessException("外部视频地址格式无效");
        }
        boolean directVideo = url.matches("(?i)^https?://.+\\.(mp4|webm|ogg)(?:[?#].*)?$");
        return new PlaybackTicket(directVideo ? "EXTERNAL_DIRECT" : "EXTERNAL_EMBED",
                url, false, null, material.getDurationSeconds(), minWatchPercent(material),
                !Boolean.FALSE.equals(material.getAllowSpeed()), false);
    }

    public void stream(Long materialId,
                       String ticket,
                       String rangeHeader,
                       String userAgent,
                       HttpServletResponse response) {
        TicketPayload payload;
        try {
            payload = readTicket(materialId, ticket, userAgent);
        } catch (ResponseStatusException e) {
            response.setStatus(e.getStatusCode().value());
            response.setContentLengthLong(0);
            return;
        }
        File file = new File(payload.filePath());
        if (!file.isFile()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "视频文件不存在");
        }
        long length = file.length();
        if (length <= 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "视频文件不可读取");
        }

        ByteRange requestedRange = resolveRange(rangeHeader, length, response);
        if (requestedRange == null) {
            return;
        }
        applyCommonHeaders(response, payload);
        response.setStatus(requestedRange.partial()
                ? HttpServletResponse.SC_PARTIAL_CONTENT : HttpServletResponse.SC_OK);
        response.setContentLengthLong(requestedRange.count());
        if (requestedRange.partial()) {
            response.setHeader(HttpHeaders.CONTENT_RANGE,
                    "bytes " + requestedRange.start() + "-" + requestedRange.end() + "/" + length);
        }

        try (RandomAccessFile input = new RandomAccessFile(file, "r")) {
            input.seek(requestedRange.start());
            byte[] buffer = new byte[STREAM_BUFFER_SIZE];
            long remaining = requestedRange.count();
            while (remaining > 0) {
                int read = input.read(buffer, 0, (int) Math.min(buffer.length, remaining));
                if (read < 0) {
                    break;
                }
                response.getOutputStream().write(buffer, 0, read);
                remaining -= read;
            }
            response.getOutputStream().flush();
        } catch (IOException e) {
            if (!response.isCommitted()) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "视频文件读取失败", e);
            }
        }
    }

    private ByteRange resolveRange(String rangeHeader, long length, HttpServletResponse response) {
        if (!StringUtils.hasText(rangeHeader)) {
            return new ByteRange(0, length - 1, false);
        }
        List<HttpRange> ranges;
        try {
            ranges = HttpRange.parseRanges(rangeHeader);
        } catch (IllegalArgumentException e) {
            rangeNotSatisfiable(length, response);
            return null;
        }
        if (ranges.isEmpty()) {
            rangeNotSatisfiable(length, response);
            return null;
        }
        try {
            long start = ranges.get(0).getRangeStart(length);
            long end = ranges.get(0).getRangeEnd(length);
            if (start < 0 || start >= length || end < start) {
                rangeNotSatisfiable(length, response);
                return null;
            }
            return new ByteRange(start, Math.min(end, length - 1), true);
        } catch (IllegalArgumentException e) {
            rangeNotSatisfiable(length, response);
            return null;
        }
    }

    private TicketPayload readTicket(Long materialId, String ticket, String userAgent) {
        if (materialId == null || !StringUtils.hasText(ticket) || !ticket.matches("[a-fA-F0-9]{64}")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "视频播放票据无效");
        }
        String json = redisTemplate.opsForValue().get(TICKET_PREFIX + ticket);
        if (!StringUtils.hasText(json)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "视频播放票据已过期");
        }
        try {
            TicketPayload payload = objectMapper.readValue(json, TicketPayload.class);
            if (!materialId.equals(payload.materialId())
                    || payload.expiresAt() < System.currentTimeMillis()
                    || !MessageDigest.isEqual(payload.userAgentHash().getBytes(StandardCharsets.UTF_8),
                    userAgentHash(userAgent).getBytes(StandardCharsets.UTF_8))) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "视频播放票据校验失败");
            }
            return payload;
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "视频播放票据损坏");
        }
    }

    private void applyCommonHeaders(HttpServletResponse response, TicketPayload payload) {
        response.setHeader(HttpHeaders.ACCEPT_RANGES, "bytes");
        response.setHeader(HttpHeaders.CACHE_CONTROL, CacheControl.noStore().getHeaderValue());
        response.setContentType(payload.mimeType());
        String encodedName = URLEncoder.encode(payload.fileName(), StandardCharsets.UTF_8).replace("+", "%20");
        response.setHeader(HttpHeaders.CONTENT_DISPOSITION, "inline; filename*=UTF-8''" + encodedName);
        response.setHeader("X-Content-Type-Options", "nosniff");
    }

    private void rangeNotSatisfiable(long length, HttpServletResponse response) {
        response.setStatus(HttpServletResponse.SC_REQUESTED_RANGE_NOT_SATISFIABLE);
        response.setHeader(HttpHeaders.CONTENT_RANGE, "bytes */" + length);
        response.setContentLengthLong(0);
    }

    private int minWatchPercent(HrmTrainingMaterial material) {
        int value = material.getMinWatchPercent() == null ? 90 : material.getMinWatchPercent();
        return Math.max(50, Math.min(100, value));
    }

    private String safeMime(Object mime, String fileName) {
        String value = String.valueOf(mime == null ? "" : mime).trim().toLowerCase(Locale.ROOT);
        if (value.startsWith("video/")) {
            return value;
        }
        String name = String.valueOf(fileName).toLowerCase(Locale.ROOT);
        if (name.endsWith(".webm")) {
            return "video/webm";
        }
        if (name.endsWith(".ogg")) {
            return "video/ogg";
        }
        return "video/mp4";
    }

    private String userAgentHash(String userAgent) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(String.valueOf(userAgent).getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(digest);
        } catch (Exception e) {
            throw new IllegalStateException("无法生成浏览器指纹", e);
        }
    }

    public record PlaybackTicket(String kind,
                                 String playUrl,
                                 Boolean trackable,
                                 Long expiresAt,
                                 Integer durationSeconds,
                                 Integer minWatchPercent,
                                 Boolean allowSpeed,
                                 Boolean watermarkEnabled) { }

    private record ByteRange(long start, long end, boolean partial) {
        private long count() {
            return end - start + 1;
        }
    }

    private record TicketPayload(Long materialId,
                                 Long fileId,
                                 Long learningRecordId,
                                 Long userId,
                                 Long tenantId,
                                 String filePath,
                                 String mimeType,
                                 String fileName,
                                 String userAgentHash,
                                 Long expiresAt) { }
}
