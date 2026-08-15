package com.zhehang.erp.modules.crm.domain.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 正式客户跟进提交。
 */
@Data
public class CrmCustomerFollowDTO {
    /** 跟进方式:1电话 2微信 3面谈 4邮件 5其他。 */
    private Integer type;
    /** 本次沟通内容。 */
    private String content;
    /** 下一步处理时间。 */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime nextTime;
    /** 下一步具体计划。 */
    private String nextContent;
    /** 客户意向等级:A/B/C/D/E。正式客户仅作经营标签，不改变客户生命周期。 */
    private String customerLevel;
}
