package com.zhehang.erp.modules.workflow.domain.vo;

import lombok.Data;

/**
 * 审批附件 VO:前端用 fileId 走 /file/info/download(带token)预览或下载
 */
@Data
public class WfAttachmentVO {
    private Long id;
    /** file_info 文件ID */
    private Long fileId;
    private String fileName;
    private Long fileSize;
    private String mimeType;
}
