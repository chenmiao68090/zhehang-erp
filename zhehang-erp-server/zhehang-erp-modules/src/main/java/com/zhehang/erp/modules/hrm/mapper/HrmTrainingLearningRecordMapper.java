package com.zhehang.erp.modules.hrm.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zhehang.erp.modules.hrm.domain.entity.HrmTrainingLearningRecord;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Update;

@Mapper
public interface HrmTrainingLearningRecordMapper extends BaseMapper<HrmTrainingLearningRecord> {

    @Update("UPDATE hrm_training_learning_record "
            + "SET progress_percent = GREATEST(IFNULL(progress_percent, 0), #{progress}), update_time = NOW() "
            + "WHERE id = #{recordId} AND employee_id = #{employeeId} AND tenant_id = #{tenantId} "
            + "AND status = '学习中' AND deleted = 0")
    int raiseLearningProgress(@Param("recordId") Long recordId,
                              @Param("employeeId") Long employeeId,
                              @Param("tenantId") Long tenantId,
                              @Param("progress") Integer progress);
}
