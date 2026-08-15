package com.zhehang.erp.modules.hrm.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zhehang.erp.modules.hrm.domain.entity.HrmTrainingVideoUpload;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface HrmTrainingVideoUploadMapper extends BaseMapper<HrmTrainingVideoUpload> {

    @Select("SELECT * FROM hrm_training_video_upload WHERE tenant_id = #{tenantId} "
            + "AND uploader_user_id = #{uploaderUserId} AND upload_token = #{uploadToken} "
            + "AND deleted = 0 LIMIT 1 FOR UPDATE")
    HrmTrainingVideoUpload selectOwnedForUpdate(@Param("tenantId") Long tenantId,
                                                @Param("uploaderUserId") Long uploaderUserId,
                                                @Param("uploadToken") String uploadToken);
}
