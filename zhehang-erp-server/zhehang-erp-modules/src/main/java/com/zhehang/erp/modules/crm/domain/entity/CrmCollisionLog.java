package com.zhehang.erp.modules.crm.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("crm_collision_log")
public class CrmCollisionLog extends BaseEntity {
    /** 线索ID */
    private Long leadId;
    /** 线索名称 */
    private String leadName;
    /** 用户A ID */
    private Long userAId;
    /** 用户A 姓名 */
    private String userAName;
    /** 用户B ID */
    private Long userBId;
    /** 用户B 姓名 */
    private String userBName;
    /** 冲突类型 */
    private String conflictType;
    /** 匹配字段 */
    private String matchField;
    /** 处理方式 */
    private String resolution;
    /** 处理详情 */
    private String resolutionDetail;
    /** 处理人ID */
    private Long resolvedBy;
    /** 处理时间 */
    private LocalDateTime resolvedTime;
    /** 状态(0待处理 1已处理) */
    private Integer status;
}
