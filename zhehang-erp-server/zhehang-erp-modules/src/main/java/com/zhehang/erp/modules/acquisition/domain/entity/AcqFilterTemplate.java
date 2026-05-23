package com.zhehang.erp.modules.acquisition.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("acq_filter_template")
public class AcqFilterTemplate extends BaseEntity {
    /** 方案名称 */
    private String templateName;
    /** 方案描述 */
    private String templateDesc;
    /** 筛选条件(JSON) */
    private String filterConditions;
    /** 所属用户ID */
    private Long userId;
    /** 是否默认方案 */
    private Integer isDefault;
    /** 使用次数 */
    private Integer useCount;
}
