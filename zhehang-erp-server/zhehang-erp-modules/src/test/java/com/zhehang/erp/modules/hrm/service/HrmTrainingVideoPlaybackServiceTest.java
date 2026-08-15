package com.zhehang.erp.modules.hrm.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class HrmTrainingVideoPlaybackServiceTest {

    private static final String TOKEN = "a".repeat(64);
    private static final String USER_AGENT = "TrainingBrowser/1.0";

    @Mock private StringRedisTemplate redisTemplate;
    @Mock private ValueOperations<String, String> valueOperations;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private HrmTrainingVideoPlaybackService service;
    private Path video;

    @BeforeEach
    void setUp() throws Exception {
        service = new HrmTrainingVideoPlaybackService(redisTemplate, objectMapper);
        video = Files.createTempFile("training-video-range-", ".mp4");
        byte[] content = new byte[100];
        for (int index = 0; index < content.length; index++) {
            content[index] = (byte) index;
        }
        Files.write(video, content);
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get("training:video:play:" + TOKEN)).thenReturn(ticketJson());
    }

    @AfterEach
    void tearDown() throws Exception {
        Files.deleteIfExists(video);
    }

    @Test
    void validRangeStreamsOnlyRequestedBytes() throws Exception {
        MockHttpServletResponse response = new MockHttpServletResponse();
        service.stream(11L, TOKEN, "bytes=10-19", USER_AGENT, response);

        assertThat(response.getStatus()).isEqualTo(206);
        assertThat(response.getHeader(HttpHeaders.CONTENT_RANGE)).isEqualTo("bytes 10-19/100");
        assertThat(response.getContentLengthLong()).isEqualTo(10);
        assertThat(response.getContentAsByteArray()).containsExactly(
                (byte) 10, (byte) 11, (byte) 12, (byte) 13, (byte) 14,
                (byte) 15, (byte) 16, (byte) 17, (byte) 18, (byte) 19);
    }

    @Test
    void requestWithoutRangeStreamsWholeFile() throws Exception {
        MockHttpServletResponse response = new MockHttpServletResponse();
        service.stream(11L, TOKEN, null, USER_AGENT, response);

        assertThat(response.getStatus()).isEqualTo(200);
        assertThat(response.getHeader(HttpHeaders.ACCEPT_RANGES)).isEqualTo("bytes");
        assertThat(response.getContentType()).isEqualTo("video/mp4");
        assertThat(response.getContentLengthLong()).isEqualTo(100);
        assertThat(response.getContentAsByteArray()).hasSize(100);
    }

    @Test
    void ticketCannotBeReusedFromDifferentBrowserFingerprint() {
        MockHttpServletResponse response = new MockHttpServletResponse();
        service.stream(11L, TOKEN, null, "DifferentBrowser/2.0", response);

        assertThat(response.getStatus()).isEqualTo(HttpStatus.UNAUTHORIZED.value());
        assertThat(response.getContentLengthLong()).isZero();
    }

    @Test
    void invalidRangeReturnsRequestedRangeNotSatisfiable() {
        MockHttpServletResponse response = new MockHttpServletResponse();
        service.stream(11L, TOKEN, "bytes=200-300", USER_AGENT, response);

        assertThat(response.getStatus()).isEqualTo(416);
        assertThat(response.getHeader(HttpHeaders.CONTENT_RANGE)).isEqualTo("bytes */100");
    }

    private String ticketJson() throws Exception {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("materialId", 11L);
        payload.put("fileId", 22L);
        payload.put("learningRecordId", 33L);
        payload.put("userId", 44L);
        payload.put("tenantId", 1L);
        payload.put("filePath", video.toAbsolutePath().toString());
        payload.put("mimeType", "video/mp4");
        payload.put("fileName", "内部培训.mp4");
        payload.put("userAgentHash", userAgentHash(USER_AGENT));
        payload.put("expiresAt", System.currentTimeMillis() + 60_000);
        return objectMapper.writeValueAsString(payload);
    }

    private String userAgentHash(String userAgent) throws Exception {
        byte[] digest = MessageDigest.getInstance("SHA-256")
                .digest(userAgent.getBytes(StandardCharsets.UTF_8));
        return Base64.getUrlEncoder().withoutPadding().encodeToString(digest);
    }
}
