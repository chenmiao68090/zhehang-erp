package com.zhehang.erp.modules.acquisition.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("acq_segment")
public class AcqSegment extends BaseEntity {
    /** 客群编码(F01-F10) */
    private String segmentCode;
    /** 客群名称 */
    private String segmentName;
    /** 图标名称 */
    private String segmentIcon;
    /** 客群分组ID */
    private String groupId;
    /** 分组名称 */
    private String groupName;
    /** 优先级(P0/P1/P2) */
    private String priority;
    /** 客群说明 */
    private String description;
    /** 匹配企业数量 */
    private Integer enterpriseCount;
    /** 状态(0禁用/1启用) */
    private Integer status;
    /** 排序号 */
    private Integer sortOrder;
}
