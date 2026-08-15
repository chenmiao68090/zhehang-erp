package com.zhehang.erp.modules.file.security;

import com.zhehang.erp.common.core.exception.BusinessException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

/**
 * 所有业务上传共用的内容校验入口。扩展名和浏览器声明的 Content-Type 仅作提示，
 * 最终类型以文件头及容器内容为准；生产环境还必须通过病毒扫描。
 */
@Slf4j
@Service
public class UploadSecurityService {

    private static final int HEADER_SIZE = 64 * 1024;
    private static final int CLAM_CHUNK_SIZE = 64 * 1024;
    private static final Map<String, String> MIME_BY_EXTENSION = mimeTypes();

    @Value("${upload.security.virus-scan.enabled:false}")
    private boolean virusScanEnabled;

    @Value("${upload.security.virus-scan.host:clamav}")
    private String virusScanHost;

    @Value("${upload.security.virus-scan.port:3310}")
    private int virusScanPort;

    @Value("${upload.security.virus-scan.connect-timeout-ms:3000}")
    private int connectTimeoutMs;

    @Value("${upload.security.virus-scan.read-timeout-ms:120000}")
    private int readTimeoutMs;

    public ValidatedFile validate(MultipartFile file, Set<String> allowedExtensions) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("请选择有效文件");
        }
        String originalName = safeFileName(file.getOriginalFilename());
        String extension = extensionOf(originalName);
        Set<String> normalizedAllowed = normalizeAllowed(allowedExtensions);
        requireAllowed(extension, normalizedAllowed);
        try {
            DetectedType detected;
            try (InputStream input = file.getInputStream()) {
                detected = detect(input);
            }
            requireTypeMatches(extension, detected);
            String scanStatus;
            try (InputStream input = file.getInputStream()) {
                scanStatus = scan(input);
            }
            return new ValidatedFile(originalName, extension, canonicalMime(extension), detected.name(), scanStatus);
        } catch (BusinessException e) {
            throw e;
        } catch (IOException e) {
            throw new BusinessException("文件安全校验失败，请重新选择文件");
        }
    }

    public ValidatedFile validate(Path path, String originalName, Set<String> allowedExtensions) {
        if (path == null || !Files.isRegularFile(path)) {
            throw new BusinessException("待校验文件不存在");
        }
        String safeName = safeFileName(originalName);
        String extension = extensionOf(safeName);
        Set<String> normalizedAllowed = normalizeAllowed(allowedExtensions);
        requireAllowed(extension, normalizedAllowed);
        try {
            DetectedType detected;
            try (InputStream input = Files.newInputStream(path)) {
                detected = detect(input);
            }
            requireTypeMatches(extension, detected);
            String scanStatus;
            try (InputStream input = Files.newInputStream(path)) {
                scanStatus = scan(input);
            }
            return new ValidatedFile(safeName, extension, canonicalMime(extension), detected.name(), scanStatus);
        } catch (BusinessException e) {
            throw e;
        } catch (IOException e) {
            throw new BusinessException("文件安全校验失败，请重新上传");
        }
    }

    private DetectedType detect(InputStream source) throws IOException {
        try (BufferedInputStream input = new BufferedInputStream(source)) {
            input.mark(HEADER_SIZE + 1);
            byte[] header = input.readNBytes(HEADER_SIZE);
            input.reset();
            if (startsWith(header, 0xff, 0xd8, 0xff)) return DetectedType.JPEG;
            if (startsWith(header, 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return DetectedType.PNG;
            if (startsWithAscii(header, "GIF87a") || startsWithAscii(header, "GIF89a")) return DetectedType.GIF;
            if (header.length >= 12 && startsWithAscii(header, "RIFF") && asciiEquals(header, 8, "WEBP")) return DetectedType.WEBP;
            if (startsWithAscii(header, "%PDF-")) return DetectedType.PDF;
            if (startsWith(header, 0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1)) return DetectedType.OLE;
            if (startsWith(header, 0x52, 0x61, 0x72, 0x21, 0x1a, 0x07)) return DetectedType.RAR;
            if (startsWith(header, 0x1a, 0x45, 0xdf, 0xa3)) return DetectedType.WEBM;
            if (startsWithAscii(header, "OggS")) return DetectedType.OGG;
            if (header.length >= 12 && startsWithAscii(header, "RIFF") && asciiEquals(header, 8, "WAVE")) return DetectedType.WAV;
            if (startsWithAscii(header, "ID3") || isMp3Frame(header)) return DetectedType.MP3;
            if (containsFtyp(header)) return DetectedType.MP4;
            if (startsWith(header, 0x50, 0x4b, 0x03, 0x04)
                    || startsWith(header, 0x50, 0x4b, 0x05, 0x06)
                    || startsWith(header, 0x50, 0x4b, 0x07, 0x08)) {
                return detectZipContainer(input);
            }
            if (looksLikePlainText(header)) return DetectedType.TEXT;
            return DetectedType.UNKNOWN;
        }
    }

    private DetectedType detectZipContainer(InputStream input) throws IOException {
        boolean word = false;
        boolean excel = false;
        boolean powerpoint = false;
        int entries = 0;
        try (ZipInputStream zip = new ZipInputStream(input)) {
            ZipEntry entry;
            while ((entry = zip.getNextEntry()) != null && entries++ < 300) {
                String name = entry.getName().toLowerCase(Locale.ROOT);
                word |= name.startsWith("word/");
                excel |= name.startsWith("xl/");
                powerpoint |= name.startsWith("ppt/");
            }
        }
        if (word) return DetectedType.DOCX;
        if (excel) return DetectedType.XLSX;
        if (powerpoint) return DetectedType.PPTX;
        return DetectedType.ZIP;
    }

    private void requireTypeMatches(String extension, DetectedType detected) {
        boolean matches = switch (extension) {
            case "jpg", "jpeg" -> detected == DetectedType.JPEG;
            case "png" -> detected == DetectedType.PNG;
            case "gif" -> detected == DetectedType.GIF;
            case "webp" -> detected == DetectedType.WEBP;
            case "pdf" -> detected == DetectedType.PDF;
            case "docx" -> detected == DetectedType.DOCX;
            case "xlsx" -> detected == DetectedType.XLSX;
            case "pptx" -> detected == DetectedType.PPTX;
            case "doc", "xls", "ppt" -> detected == DetectedType.OLE;
            case "zip" -> detected == DetectedType.ZIP;
            case "rar" -> detected == DetectedType.RAR;
            case "txt", "csv" -> detected == DetectedType.TEXT;
            case "mp4" -> detected == DetectedType.MP4;
            case "webm" -> detected == DetectedType.WEBM;
            case "ogg" -> detected == DetectedType.OGG;
            case "mp3" -> detected == DetectedType.MP3;
            case "wav" -> detected == DetectedType.WAV;
            default -> false;
        };
        if (!matches) {
            throw new BusinessException("文件内容与扩展名不一致，已拒绝上传");
        }
    }

    private String scan(InputStream source) {
        if (!virusScanEnabled) return "SKIPPED_NON_PROD";
        try (Socket socket = new Socket()) {
            socket.connect(new InetSocketAddress(virusScanHost, virusScanPort), connectTimeoutMs);
            socket.setSoTimeout(readTimeoutMs);
            try (OutputStream rawOutput = new BufferedOutputStream(socket.getOutputStream());
                 DataOutputStream output = new DataOutputStream(rawOutput);
                 InputStream response = socket.getInputStream()) {
                output.write("zINSTREAM\0".getBytes(StandardCharsets.US_ASCII));
                byte[] buffer = new byte[CLAM_CHUNK_SIZE];
                int read;
                while ((read = source.read(buffer)) >= 0) {
                    if (read == 0) continue;
                    output.writeInt(read);
                    output.write(buffer, 0, read);
                }
                output.writeInt(0);
                output.flush();
                String result = new String(response.readNBytes(4096), StandardCharsets.UTF_8).trim();
                if (result.endsWith("OK")) return "CLEAN";
                if (result.contains("FOUND")) {
                    log.warn("Upload rejected by malware scanner");
                    throw new BusinessException("文件安全扫描未通过，已拒绝上传");
                }
                log.error("Unexpected malware scanner response");
                throw new BusinessException("文件安全扫描服务异常，请稍后重试");
            }
        } catch (BusinessException e) {
            throw e;
        } catch (IOException e) {
            log.error("Malware scanner unavailable: {}", e.getClass().getSimpleName());
            throw new BusinessException("文件安全扫描服务暂时不可用，请稍后重试");
        }
    }

    private String safeFileName(String value) {
        String candidate = value == null ? "" : value.replaceAll("[\\r\\n\\u0000]", "").trim();
        String name;
        try {
            name = Path.of(candidate).getFileName().toString();
        } catch (RuntimeException e) {
            throw new BusinessException("文件名不合法");
        }
        if (!StringUtils.hasText(name) || name.length() > 255 || name.startsWith(".")) {
            throw new BusinessException("文件名不合法");
        }
        return name;
    }

    private String extensionOf(String name) {
        int dot = name.lastIndexOf('.');
        return dot < 1 || dot == name.length() - 1 ? "" : name.substring(dot + 1).toLowerCase(Locale.ROOT);
    }

    private void requireAllowed(String extension, Set<String> allowed) {
        if (!StringUtils.hasText(extension) || !allowed.contains(extension)) {
            throw new BusinessException("不允许上传该文件类型");
        }
    }

    private Set<String> normalizeAllowed(Set<String> allowedExtensions) {
        if (allowedExtensions == null || allowedExtensions.isEmpty()) return Set.of();
        Set<String> normalized = new HashSet<>();
        allowedExtensions.forEach(value -> {
            if (value != null) normalized.add(value.toLowerCase(Locale.ROOT));
        });
        return normalized;
    }

    private String canonicalMime(String extension) {
        return MIME_BY_EXTENSION.getOrDefault(extension, "application/octet-stream");
    }

    private static boolean startsWith(byte[] value, int... prefix) {
        if (value.length < prefix.length) return false;
        for (int index = 0; index < prefix.length; index++) {
            if ((value[index] & 0xff) != prefix[index]) return false;
        }
        return true;
    }

    private static boolean startsWithAscii(byte[] value, String prefix) {
        return asciiEquals(value, 0, prefix);
    }

    private static boolean asciiEquals(byte[] value, int offset, String expected) {
        byte[] bytes = expected.getBytes(StandardCharsets.US_ASCII);
        if (offset < 0 || value.length < offset + bytes.length) return false;
        return Arrays.equals(Arrays.copyOfRange(value, offset, offset + bytes.length), bytes);
    }

    private static boolean containsFtyp(byte[] header) {
        if (header.length < 12 || !asciiEquals(header, 4, "ftyp")) return false;
        long boxSize = ((long) (header[0] & 0xff) << 24)
                | ((long) (header[1] & 0xff) << 16)
                | ((long) (header[2] & 0xff) << 8)
                | (header[3] & 0xffL);
        return boxSize >= 12 && boxSize <= 16L * 1024 * 1024;
    }

    private static boolean isMp3Frame(byte[] header) {
        return header.length >= 2 && (header[0] & 0xff) == 0xff && ((header[1] & 0xe0) == 0xe0);
    }

    private static boolean looksLikePlainText(byte[] header) {
        if (header.length == 0) return false;
        int controls = 0;
        for (byte current : header) {
            int value = current & 0xff;
            if (value == 0) return false;
            if (value < 0x20 && value != '\n' && value != '\r' && value != '\t' && value != '\f') controls++;
        }
        return controls <= Math.max(1, header.length / 100);
    }

    private static Map<String, String> mimeTypes() {
        Map<String, String> values = new HashMap<>();
        values.put("jpg", "image/jpeg"); values.put("jpeg", "image/jpeg"); values.put("png", "image/png");
        values.put("gif", "image/gif"); values.put("webp", "image/webp"); values.put("pdf", "application/pdf");
        values.put("doc", "application/msword"); values.put("docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        values.put("xls", "application/vnd.ms-excel"); values.put("xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        values.put("ppt", "application/vnd.ms-powerpoint"); values.put("pptx", "application/vnd.openxmlformats-officedocument.presentationml.presentation");
        values.put("txt", "text/plain"); values.put("csv", "text/csv"); values.put("zip", "application/zip"); values.put("rar", "application/vnd.rar");
        values.put("mp4", "video/mp4"); values.put("webm", "video/webm"); values.put("ogg", "video/ogg");
        values.put("mp3", "audio/mpeg"); values.put("wav", "audio/wav");
        return Map.copyOf(values);
    }

    private enum DetectedType { JPEG, PNG, GIF, WEBP, PDF, OLE, DOCX, XLSX, PPTX, ZIP, RAR, TEXT, MP4, WEBM, OGG, MP3, WAV, UNKNOWN }

    public record ValidatedFile(String originalName, String extension, String mimeType,
                                String detectedType, String scanStatus) { }
}
