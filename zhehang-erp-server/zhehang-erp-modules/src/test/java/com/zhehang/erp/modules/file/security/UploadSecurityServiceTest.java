package com.zhehang.erp.modules.file.security;

import com.zhehang.erp.common.core.exception.BusinessException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import java.nio.charset.StandardCharsets;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class UploadSecurityServiceTest {
    private UploadSecurityService service;

    @BeforeEach
    void setUp() {
        service = new UploadSecurityService();
        ReflectionTestUtils.setField(service, "virusScanEnabled", false);
    }

    @Test
    void rejectsScriptDisguisedAsPng() {
        MockMultipartFile file = new MockMultipartFile("file", "avatar.png", "image/png",
                "<script>alert(1)</script>".getBytes(StandardCharsets.UTF_8));
        assertThrows(BusinessException.class, () -> service.validate(file, Set.of("png")));
    }

    @Test
    void rejectsMismatchedOfficeContainer() {
        byte[] zip = new byte[] {0x50, 0x4b, 0x05, 0x06, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0};
        MockMultipartFile file = new MockMultipartFile("file", "report.docx", "application/zip", zip);
        assertThrows(BusinessException.class, () -> service.validate(file, Set.of("docx")));
    }

    @Test
    void acceptsPngMagicAndUsesCanonicalMime() {
        byte[] png = new byte[] {(byte) 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0};
        MockMultipartFile file = new MockMultipartFile("file", "avatar.png", "text/html", png);
        UploadSecurityService.ValidatedFile result = service.validate(file, Set.of("png"));
        assertEquals("image/png", result.mimeType());
        assertEquals("SKIPPED_NON_PROD", result.scanStatus());
    }

    @Test
    void rejectsTextContainingFakeMp4Marker() {
        MockMultipartFile file = new MockMultipartFile("file", "clip.mp4", "video/mp4",
                "ordinary text with ftyp somewhere later".getBytes(StandardCharsets.UTF_8));
        assertThrows(BusinessException.class, () -> service.validate(file, Set.of("mp4")));
    }
}
