package com.zhehang.erp.modules.workflow.domain.dto;

import lombok.Data;

import java.util.Map;

/**
 * 被退回(待修改)实例的重新提交 DTO
 */
@Data
public class WfResubmitDTO {
    /** 修改后的标题(空=保持原标题) */
    private String title;
    /** 修改后的表单数据 */
    private Map<String, Object> formData;
}
