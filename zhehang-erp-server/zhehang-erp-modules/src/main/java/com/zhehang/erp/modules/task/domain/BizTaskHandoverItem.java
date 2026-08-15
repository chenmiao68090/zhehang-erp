package com.zhehang.erp.modules.task.domain;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

/**
 * 交接清单子项实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("biz_task_handover_item")
public class BizTaskHandoverItem extends BaseEntity {
    /** 交接单ID */
    private Long handoverId;
    /** 顺序 */
    private Integer itemOrder;
    /** 交接项名称 */
    private String itemName;
    /** 是否必需(0否/1是) */
    private Integer isRequired;
    /** 资料说明/验收标准 */
    private String description;
    /** 资料文件URL */
    private String fileUrl;
    /** 销售状态(provided已提供/pending_supply待补齐) */
    private String salesStatus;
    /** 预计补齐日期 */
    private LocalDate supplyExpectedDate;
    /** 接收方验收状态(confirmed合格/rejected退回) */
    private String accountantStatus;
    /** 退回原因 */
    private String rejectReason;
}
