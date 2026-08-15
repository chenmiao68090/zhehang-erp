package com.zhehang.erp.modules.hrm.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zhehang.erp.modules.hrm.domain.entity.HrmTrainingLearningStep;
import com.zhehang.erp.modules.hrm.domain.entity.HrmTrainingMaterial;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class HrmTrainingVideoProgressServiceTest {

    private HrmTrainingVideoProgressService service;
    private HrmTrainingMaterial material;

    @BeforeEach
    void setUp() {
        service = new HrmTrainingVideoProgressService(new ObjectMapper());
        material = new HrmTrainingMaterial();
        material.setMaterialType("VIDEO");
        material.setDurationSeconds(100);
        material.setMinWatchPercent(90);
        material.setAllowSpeed(true);
    }

    @Test
    void firstHeartbeatOnlySetsBaselineAndSeekJumpDoesNotEarnCoverage() {
        LocalDateTime now = LocalDateTime.now();
        HrmTrainingLearningStep first = service.apply(new HrmTrainingLearningStep(), null, material,
                input(0, "PLAY"), now.minusSeconds(2));
        assertThat(first.getCoveragePercent()).isZero();

        HrmTrainingLearningStep seeked = service.apply(new HrmTrainingLearningStep(), first, material,
                input(80, "SEEK"), now);
        assertThat(seeked.getValidWatchedSeconds()).isZero();
        assertThat(seeked.getCompleted()).isFalse();
    }

    @Test
    void continuousHeartbeatCountsUniqueSecondsAndOverlapsAreMerged() {
        LocalDateTime now = LocalDateTime.now();
        HrmTrainingLearningStep stored = stored(10, "[[0,10],[5,15]]", now.minusSeconds(10));

        HrmTrainingLearningStep updated = service.apply(new HrmTrainingLearningStep(), stored, material,
                input(20, "HEARTBEAT"), now);

        assertThat(updated.getValidWatchedSeconds()).isEqualTo(20);
        assertThat(updated.getCoveragePercent()).isEqualTo(20);
        assertThat(updated.getWatchedRangesJson()).isEqualTo("[{\"start\":0,\"end\":20}]");
    }

    @Test
    void eightyNinePercentCannotCompleteButNinetyPercentAtEndCan() {
        LocalDateTime now = LocalDateTime.now();
        HrmTrainingLearningStep below = stored(89, "[[0,89]]", now.minusSeconds(1));
        HrmTrainingLearningStep rejected = service.apply(new HrmTrainingLearningStep(), below, material,
                input(100, "ENDED"), now);
        assertThat(rejected.getCoveragePercent()).isEqualTo(89);
        assertThat(rejected.getCompleted()).isFalse();

        HrmTrainingLearningStep enough = stored(90, "[[0,90]]", now.minusSeconds(1));
        HrmTrainingLearningStep accepted = service.apply(new HrmTrainingLearningStep(), enough, material,
                input(100, "ENDED"), now);
        assertThat(accepted.getCoveragePercent()).isEqualTo(90);
        assertThat(accepted.getCompleted()).isTrue();
        assertThat(accepted.getCompletionReason()).isEqualTo("WATCH_COVERAGE");
    }

    @Test
    void mergeRangesNeverDoubleCountsReplay() {
        List<HrmTrainingVideoProgressService.WatchRange> ranges = new ArrayList<>();
        ranges.add(new HrmTrainingVideoProgressService.WatchRange(0, 20));
        ranges.add(new HrmTrainingVideoProgressService.WatchRange(10, 30));
        ranges.add(new HrmTrainingVideoProgressService.WatchRange(31, 40));

        assertThat(service.mergeRanges(ranges, 100))
                .containsExactly(new HrmTrainingVideoProgressService.WatchRange(0, 40));
    }

    private HrmTrainingLearningProgressService.StepInput input(int position, String event) {
        return new HrmTrainingLearningProgressService.StepInput(11L, 0, false, position,
                100, event, "session_one", 1.0, "DESKTOP");
    }

    private HrmTrainingLearningStep stored(int position, String ranges, LocalDateTime heartbeat) {
        HrmTrainingLearningStep step = new HrmTrainingLearningStep();
        step.setPositionSeconds(position);
        step.setDurationSeconds(100);
        step.setWatchedRangesJson(ranges);
        step.setValidWatchedSeconds(position);
        step.setCoveragePercent(position);
        step.setPlaybackSessionId("session_one");
        step.setLastHeartbeatTime(heartbeat);
        step.setCompleted(false);
        return step;
    }
}
