package com.zhehang.erp.modules.project.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("pm_doc")
public class PmDoc extends BaseEntity {
    private Long projectId;
    private String title;
    private String fileUrl;
    private String fileType;
    private Long fileSize;
    private Long uploaderId;
}
