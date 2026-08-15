package com.zhehang.erp.modules.hrm.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("hrm_training_video_upload")
public class HrmTrainingVideoUpload extends BaseEntity {
    private String uploadToken;
    private Long uploaderUserId;
    private String originalName;
    private Long fileSize;
    private String fileFingerprint;
    private String mimeType;
    private Integer durationSeconds;
    private Integer chunkSize;
    private Integer totalChunks;
    private String uploadedChunksJson;
    private String tempPath;
    private String status;
    private Long fileId;
    private LocalDateTime expiresTime;
}
