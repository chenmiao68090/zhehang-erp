package com.zhehang.erp.modules.steward.domain;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

/**
 * 管家体系·月度服务交付(按月跟踪各客户各项服务是否完成)。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("biz_service_delivery")
public class BizServiceDelivery extends BaseEntity {
    /** 关联签约客户ID */
    private Long clientId;
    /** 客户名称 */
    private String clientName;
    /** 交付月份 YYYY-MM */
    private String deliverMonth;
    /** 服务项目(记账/报税/工商/刻章等) */
    private String serviceItem;
    /** 状态:pending待办/doing进行中/done已完成 */
    private String status;
    /** 处理人/管家 */
    private String handler;
    /** 完成日期 */
    private LocalDate finishDate;
    /** 备注 */
    private String remark;
}
