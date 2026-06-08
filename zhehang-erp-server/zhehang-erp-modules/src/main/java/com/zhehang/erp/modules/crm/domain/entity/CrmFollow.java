package com.zhehang.erp.modules.crm.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("crm_follow")
public class CrmFollow extends BaseEntity {
    /** 客户ID(客户跟进时填) */
    private Long customerId;
    /** 线索ID(线索跟进时填;与 customerId 二选一) */
    private Long leadId;
    /** 联系人ID */
    private Long contactId;
    /** 跟进方式（1电话 2拜访 3微信 4邮件） */
    private Integer type;
    /** 跟进内容 */
    private String content;
    /** 下次跟进时间 */
    private LocalDateTime nextTime;
    /** 下次跟进内容 */
    private String nextContent;
    /** 附件 */
    private String attachments;
}
