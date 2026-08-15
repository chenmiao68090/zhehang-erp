package com.zhehang.erp.modules.crm.service;

import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.ai.config.AiConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;
import org.springframework.boot.web.client.RestTemplateBuilder;

import java.time.Duration;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class SalesAudioTranscriptionService {

    private static final long MAX_AUDIO_BYTES = 24L * 1024L * 1024L;
    private static final int MAX_TRANSCRIPT_CHARS = 12000;

    private final AiConfig aiConfig;
    private final CallRecordingService callRecordingService;
    private final RestTemplateBuilder restTemplateBuilder;

    public TranscriptionResult transcribe(Long recordId) {
        if (recordId == null) return TranscriptionResult.notRequested();
        CallRecordingService.AccessibleRecording recording;
        try {
            recording = callRecordingService.loadAccessibleRecording(recordId, MAX_AUDIO_BYTES);
        } catch (BusinessException e) {
            String message = safeMessage(e.getMessage());
            if (message.contains("暂未生成")) return new TranscriptionResult("missing", "", message);
            return new TranscriptionResult("failed", "", message);
        }

        AiConfig.OpenAiProperties openai = aiConfig.getOpenai();
        if (openai == null || !StringUtils.hasText(openai.getApiKey())) {
            return new TranscriptionResult("unavailable", "", "未配置录音转写服务，仍可手工填写小结");
        }
        try {
            RestTemplate client = restTemplateBuilder
                    .setConnectTimeout(Duration.ofSeconds(8))
                    .setReadTimeout(Duration.ofSeconds(70))
                    .build();
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(openai.getApiKey());
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("model", StringUtils.hasText(openai.getTranscriptionModel())
                    ? openai.getTranscriptionModel() : "gpt-4o-mini-transcribe");
            ByteArrayResource resource = new ByteArrayResource(recording.content()) {
                @Override
                public String getFilename() {
                    return recording.fileName();
                }
            };
            HttpHeaders fileHeaders = new HttpHeaders();
            fileHeaders.setContentType(MediaType.parseMediaType(recording.contentType()));
            body.add("file", new HttpEntity<>(resource, fileHeaders));
            String baseUrl = openai.getBaseUrl().replaceAll("/+$", "");
            ResponseEntity<Map> response = client.postForEntity(baseUrl + "/audio/transcriptions",
                    new HttpEntity<>(body, headers), Map.class);
            Object textValue = response.getBody() == null ? null : response.getBody().get("text");
            String transcript = textValue instanceof String ? ((String) textValue).trim() : "";
            if (!StringUtils.hasText(transcript)) {
                return new TranscriptionResult("failed", "", "录音未识别出有效文字，可继续手工填写");
            }
            return new TranscriptionResult("ready", limit(transcript, MAX_TRANSCRIPT_CHARS), "录音已安全转写");
        } catch (Exception e) {
            log.warn("Sales audio transcription failed for recordId={}", recordId);
            return new TranscriptionResult("failed", "", "录音转写暂时不可用，可继续手工填写");
        }
    }

    private static String safeMessage(String message) {
        if (!StringUtils.hasText(message)) return "录音服务暂时不可用";
        return limit(message.replaceAll("https?://\\S+", "[地址已保护]"), 100);
    }

    private static String limit(String value, int max) {
        return value == null || value.length() <= max ? value : value.substring(0, max);
    }

    public record TranscriptionResult(String status, String text, String message) {
        static TranscriptionResult notRequested() {
            return new TranscriptionResult("not_requested", "", "本次未关联可转写录音");
        }
    }
}
