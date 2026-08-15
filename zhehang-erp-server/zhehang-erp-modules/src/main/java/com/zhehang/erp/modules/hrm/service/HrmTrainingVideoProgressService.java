package com.zhehang.erp.modules.hrm.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.hrm.domain.entity.HrmTrainingLearningStep;
import com.zhehang.erp.modules.hrm.domain.entity.HrmTrainingMaterial;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HrmTrainingVideoProgressService {

    private static final int MAX_VIDEO_SECONDS = 86_400;
    private static final int HEARTBEAT_GRACE_SECONDS = 5;
    private static final int MAX_HEARTBEAT_GAP_SECONDS = 45;
    private final ObjectMapper objectMapper;

    public HrmTrainingLearningStep apply(HrmTrainingLearningStep target,
                                         HrmTrainingLearningStep stored,
                                         HrmTrainingMaterial material,
                                         HrmTrainingLearningProgressService.StepInput input,
                                         LocalDateTime now) {
        int durationSeconds = resolveDuration(material, input.durationSeconds(), stored);
        int positionSeconds = validatePosition(input.positionSeconds(), durationSeconds);
        String sessionId = normalizeSessionId(input.playbackSessionId());
        BigDecimal playbackRate = normalizePlaybackRate(input.playbackRate(), material);
        String eventType = normalizeEvent(input.eventType());
        List<WatchRange> ranges = parseRanges(stored == null ? null : stored.getWatchedRangesJson(), durationSeconds);

        if (canCountInterval(stored, sessionId, positionSeconds, playbackRate, eventType, now)) {
            ranges.add(new WatchRange(stored.getPositionSeconds(), positionSeconds));
            ranges = mergeRanges(ranges, durationSeconds);
        }

        int validSeconds = ranges.stream().mapToInt(range -> range.end() - range.start()).sum();
        int coveragePercent = Math.min(100, (int) Math.floor(validSeconds * 100.0 / durationSeconds));
        int requiredPercent = minWatchPercent(material);
        boolean wasCompleted = stored != null && Boolean.TRUE.equals(stored.getCompleted());
        boolean reachedEnd = "ENDED".equals(eventType) || positionSeconds >= Math.max(0, durationSeconds - 2);
        boolean completed = wasCompleted || (coveragePercent >= requiredPercent && reachedEnd);

        target.setCompleted(completed);
        target.setPositionSeconds(positionSeconds);
        target.setDurationSeconds(durationSeconds);
        target.setWatchedRangesJson(writeRanges(ranges));
        target.setValidWatchedSeconds(validSeconds);
        target.setCoveragePercent(coveragePercent);
        target.setPlaybackSessionId(sessionId);
        target.setLastHeartbeatTime(now);
        target.setPlaybackRate(playbackRate);
        target.setDeviceType(normalizeDeviceType(input.deviceType()));
        target.setCompletionReason(completed
                ? (stored != null && Boolean.TRUE.equals(stored.getCompleted())
                ? stored.getCompletionReason() : "WATCH_COVERAGE")
                : null);
        target.setCompletedTime(completed
                ? (stored != null && stored.getCompletedTime() != null ? stored.getCompletedTime() : now)
                : null);
        return target;
    }

    public List<WatchRange> mergeRanges(List<WatchRange> input, int durationSeconds) {
        List<WatchRange> normalized = input == null ? new ArrayList<>() : input.stream()
                .filter(range -> range != null && range.end() > range.start())
                .map(range -> new WatchRange(
                        Math.max(0, Math.min(durationSeconds, range.start())),
                        Math.max(0, Math.min(durationSeconds, range.end()))))
                .filter(range -> range.end() > range.start())
                .sorted(Comparator.comparingInt(WatchRange::start).thenComparingInt(WatchRange::end))
                .toList();
        List<WatchRange> result = new ArrayList<>();
        for (WatchRange current : normalized) {
            if (result.isEmpty()) {
                result.add(current);
                continue;
            }
            WatchRange previous = result.get(result.size() - 1);
            if (current.start() <= previous.end() + 1) {
                result.set(result.size() - 1,
                        new WatchRange(previous.start(), Math.max(previous.end(), current.end())));
            } else {
                result.add(current);
            }
        }
        return result;
    }

    private boolean canCountInterval(HrmTrainingLearningStep stored,
                                     String sessionId,
                                     int positionSeconds,
                                     BigDecimal playbackRate,
                                     String eventType,
                                     LocalDateTime now) {
        if (stored == null || stored.getPositionSeconds() == null || stored.getLastHeartbeatTime() == null
                || !StringUtils.hasText(sessionId)
                || !sessionId.equals(stored.getPlaybackSessionId())
                || "SEEK".equals(eventType) || "PLAY".equals(eventType)) {
            return false;
        }
        int positionDelta = positionSeconds - stored.getPositionSeconds();
        long elapsedSeconds = Math.max(0,
                Duration.between(stored.getLastHeartbeatTime(), now).toMillis() / 1000);
        if (positionDelta <= 0 || elapsedSeconds <= 0 || elapsedSeconds > MAX_HEARTBEAT_GAP_SECONDS) {
            return false;
        }
        double allowedDelta = elapsedSeconds * playbackRate.doubleValue() + HEARTBEAT_GRACE_SECONDS;
        return positionDelta <= Math.ceil(allowedDelta);
    }

    private int resolveDuration(HrmTrainingMaterial material,
                                Integer requestedDuration,
                                HrmTrainingLearningStep stored) {
        Integer configured = material == null ? null : material.getDurationSeconds();
        Integer previous = stored == null ? null : stored.getDurationSeconds();
        int fallbackMinutes = material == null || material.getDurationMinutes() == null
                ? 0 : material.getDurationMinutes() * 60;
        int value = positive(configured, positive(previous, positive(requestedDuration, fallbackMinutes)));
        if (value <= 0 || value > MAX_VIDEO_SECONDS) {
            throw new BusinessException("视频时长无效，请联系培训管理员重新配置课件");
        }
        if (requestedDuration != null && requestedDuration > 0
                && Math.abs(requestedDuration - value) > Math.max(10, value / 20)) {
            throw new BusinessException("视频时长与课件配置不一致，请刷新后重试");
        }
        return value;
    }

    private int validatePosition(Integer requestedPosition, int durationSeconds) {
        if (requestedPosition == null || requestedPosition < 0
                || requestedPosition > durationSeconds + 3 || requestedPosition > MAX_VIDEO_SECONDS) {
            throw new BusinessException("视频播放位置超出有效范围");
        }
        return Math.min(requestedPosition, durationSeconds);
    }

    private BigDecimal normalizePlaybackRate(Double requestedRate, HrmTrainingMaterial material) {
        double value = requestedRate == null || !Double.isFinite(requestedRate) ? 1.0 : requestedRate;
        if (value < 0.5 || value > 2.0) {
            throw new BusinessException("视频播放倍速超出允许范围");
        }
        if (material != null && Boolean.FALSE.equals(material.getAllowSpeed()) && Math.abs(value - 1.0) > 0.05) {
            throw new BusinessException("该必修视频不允许倍速播放");
        }
        return BigDecimal.valueOf(value).setScale(2, RoundingMode.HALF_UP);
    }

    private int minWatchPercent(HrmTrainingMaterial material) {
        int value = material == null || material.getMinWatchPercent() == null
                ? 90 : material.getMinWatchPercent();
        return Math.max(50, Math.min(100, value));
    }

    private List<WatchRange> parseRanges(String value, int durationSeconds) {
        if (!StringUtils.hasText(value)) {
            return new ArrayList<>();
        }
        try {
            JsonNode root = objectMapper.readTree(value);
            if (root == null || !root.isArray()) {
                return new ArrayList<>();
            }
            List<WatchRange> parsed = new ArrayList<>();
            for (JsonNode node : root) {
                if (node.isArray() && node.size() >= 2) {
                    parsed.add(new WatchRange(node.get(0).asInt(), node.get(1).asInt()));
                } else if (node.isObject() && node.has("start") && node.has("end")) {
                    parsed.add(new WatchRange(node.get("start").asInt(), node.get("end").asInt()));
                }
            }
            return mergeRanges(parsed, durationSeconds);
        } catch (Exception ignored) {
            return new ArrayList<>();
        }
    }

    private String writeRanges(List<WatchRange> ranges) {
        try {
            return objectMapper.writeValueAsString(ranges);
        } catch (Exception e) {
            throw new BusinessException("视频学习进度保存失败");
        }
    }

    private String normalizeSessionId(String value) {
        if (!StringUtils.hasText(value)) {
            throw new BusinessException("视频播放会话无效，请刷新后重试");
        }
        String normalized = value.trim();
        if (normalized.length() > 64 || !normalized.matches("[A-Za-z0-9_-]+")) {
            throw new BusinessException("视频播放会话格式无效");
        }
        return normalized;
    }

    private String normalizeEvent(String value) {
        String normalized = StringUtils.hasText(value) ? value.trim().toUpperCase() : "HEARTBEAT";
        return switch (normalized) {
            case "PLAY", "HEARTBEAT", "PAUSE", "SEEK", "ENDED" -> normalized;
            default -> throw new BusinessException("不支持的视频进度事件");
        };
    }

    private String normalizeDeviceType(String value) {
        String normalized = StringUtils.hasText(value) ? value.trim().toUpperCase() : "UNKNOWN";
        return switch (normalized) {
            case "DESKTOP", "MOBILE", "TABLET" -> normalized;
            default -> "UNKNOWN";
        };
    }

    private int positive(Integer preferred, int fallback) {
        return preferred != null && preferred > 0 ? preferred : fallback;
    }

    public record WatchRange(int start, int end) { }
}
