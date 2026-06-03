package com.zhehang.erp.modules.task.domain;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 客户满意度回访实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("biz_satisfaction")
public class BizSatisfaction extends BaseEntity {
    /** 客户ID */
    private Long customerId;
    /** 客户名称 */
    private String customerName;
    /** 关联订单ID */
    private Long orderId;
    /** 回访方式(phone电话 email邮件 wechat微信 visit上门) */
    private String visitMode;
    /** 回访人ID */
    private Long visitorId;
    /** 回访人姓名 */
    private String visitorName;
    /** 回访时间 */
    private LocalDateTime visitTime;
    /** 满意度评分(1-10) */
    private Integer score;
    /** NPS(-100到100) */
    private Integer nps;
    /** 客户反馈 */
    private String feedback;
    /** 改进建议 */
    private String suggestion;
    /** 状态(0待回访 1已回访 2无效) */
    private Integer status;
    /** 备注 */
    private String remark;
}
