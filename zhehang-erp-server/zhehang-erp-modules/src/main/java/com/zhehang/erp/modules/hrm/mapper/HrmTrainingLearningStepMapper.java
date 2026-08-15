package com.zhehang.erp.modules.hrm.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zhehang.erp.modules.hrm.domain.entity.HrmTrainingLearningStep;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface HrmTrainingLearningStepMapper extends BaseMapper<HrmTrainingLearningStep> {

    @Insert("INSERT INTO hrm_training_learning_step "
            + "(learning_record_id, employee_id, employee_user_id, course_id, course_version, study_cycle, "
            + "material_id, step_index, step_type, source, completed_time, last_seen_time, "
            + "completed, position_seconds, duration_seconds, watched_ranges_json, valid_watched_seconds, "
            + "coverage_percent, playback_session_id, last_heartbeat_time, playback_rate, device_type, completion_reason, "
            + "create_time, update_time, create_by, update_by, deleted, tenant_id) VALUES "
            + "(#{step.learningRecordId}, #{step.employeeId}, #{step.employeeUserId}, #{step.courseId}, "
            + "#{step.courseVersion}, #{step.studyCycle}, #{step.materialId}, #{step.stepIndex}, "
            + "#{step.stepType}, #{step.source}, #{step.completedTime}, #{step.lastSeenTime}, "
            + "#{step.completed}, #{step.positionSeconds}, #{step.durationSeconds}, #{step.watchedRangesJson}, "
            + "IFNULL(#{step.validWatchedSeconds}, 0), IFNULL(#{step.coveragePercent}, 0), #{step.playbackSessionId}, "
            + "#{step.lastHeartbeatTime}, #{step.playbackRate}, #{step.deviceType}, #{step.completionReason}, "
            + "#{step.createTime}, #{step.updateTime}, "
            + "#{step.createBy}, #{step.updateBy}, 0, #{step.tenantId}) "
            + "ON DUPLICATE KEY UPDATE "
            + "completed_time = CASE WHEN completed = 0 AND VALUES(completed) = 1 "
            + "THEN VALUES(completed_time) ELSE completed_time END, "
            + "completed = GREATEST(completed, VALUES(completed)), "
            + "position_seconds = CASE WHEN VALUES(step_type) = 'VIDEO' THEN VALUES(position_seconds) "
            + "ELSE GREATEST(IFNULL(position_seconds, 0), IFNULL(VALUES(position_seconds), 0)) END, "
            + "duration_seconds = CASE WHEN VALUES(step_type) = 'VIDEO' THEN VALUES(duration_seconds) ELSE duration_seconds END, "
            + "watched_ranges_json = CASE WHEN VALUES(step_type) = 'VIDEO' THEN VALUES(watched_ranges_json) ELSE watched_ranges_json END, "
            + "valid_watched_seconds = CASE WHEN VALUES(step_type) = 'VIDEO' THEN VALUES(valid_watched_seconds) ELSE valid_watched_seconds END, "
            + "coverage_percent = CASE WHEN VALUES(step_type) = 'VIDEO' THEN VALUES(coverage_percent) ELSE coverage_percent END, "
            + "playback_session_id = CASE WHEN VALUES(step_type) = 'VIDEO' THEN VALUES(playback_session_id) ELSE playback_session_id END, "
            + "last_heartbeat_time = CASE WHEN VALUES(step_type) = 'VIDEO' THEN VALUES(last_heartbeat_time) ELSE last_heartbeat_time END, "
            + "playback_rate = CASE WHEN VALUES(step_type) = 'VIDEO' THEN VALUES(playback_rate) ELSE playback_rate END, "
            + "device_type = CASE WHEN VALUES(step_type) = 'VIDEO' THEN VALUES(device_type) ELSE device_type END, "
            + "completion_reason = CASE WHEN completed = 0 AND VALUES(completed) = 1 "
            + "THEN VALUES(completion_reason) ELSE completion_reason END, "
            + "last_seen_time = VALUES(last_seen_time), "
            + "update_time = VALUES(update_time), update_by = VALUES(update_by), deleted = 0")
    int upsert(@Param("step") HrmTrainingLearningStep step);

    @Select("SELECT * FROM hrm_training_learning_step WHERE tenant_id = #{tenantId} "
            + "AND learning_record_id = #{learningRecordId} AND study_cycle = #{studyCycle} "
            + "AND course_version = #{courseVersion} AND material_id = #{materialId} "
            + "AND step_index = #{stepIndex} AND deleted = 0 LIMIT 1 FOR UPDATE")
    HrmTrainingLearningStep selectForUpdate(@Param("tenantId") Long tenantId,
                                            @Param("learningRecordId") Long learningRecordId,
                                            @Param("studyCycle") Integer studyCycle,
                                            @Param("courseVersion") String courseVersion,
                                            @Param("materialId") Long materialId,
                                            @Param("stepIndex") Integer stepIndex);
}
