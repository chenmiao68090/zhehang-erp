package com.zhehang.erp.modules.workflow.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 审批附件:真文件走 file 模块(file_info),这里只挂引用;
 * form_data 只存附件文件ID数组,禁止 base64 进 JSON 列。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("wf_attachment")
public class WfAttachment extends BaseEntity {
    /** 流程实例ID */
    private Long instanceId;
    /** file_info 文件ID */
    private Long fileId;
    /** 文件名(冗余,列表直接展示) */
    private String fileName;
    /** 文件字节数 */
    private Long fileSize;
    /** MIME类型(前端判断可否图片预览) */
    private String mimeType;
    /** 上传人用户ID */
    private Long uploadBy;
}
