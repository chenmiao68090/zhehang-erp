package com.zhehang.erp.modules.crm.domain.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 线索跟进提交。跟进记录、销售阶段、客户分级和下一步动作在同一事务内保存。
 */
@Data
public class CrmLeadFollowDTO {

    /** 跟进方式:1电话 2微信 3面谈 4邮件 5其他 */
    private Integer type;

    /** 本次沟通内容 */
    private String content;

    /** 下一步动作时间 */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime nextTime;

    /** 下一步计划说明 */
    private String nextContent;

    /** 销售阶段,与生命周期 status 分开 */
    private String followStatus;

    /** 客户意向等级:A/B/C跟进中,D/E转历史客资 */
    private String customerLevel;

    /** 下一步动作类型 */
    private String nextActionType;
}
