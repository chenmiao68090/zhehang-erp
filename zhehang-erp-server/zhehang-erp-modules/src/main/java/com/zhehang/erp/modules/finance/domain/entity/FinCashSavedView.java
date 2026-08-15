package com.zhehang.erp.modules.finance.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.Version;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/** 收款工作台个人/公共保存视图。 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("fin_cash_saved_view")
public class FinCashSavedView extends BaseEntity {
    private String viewName;
    /** personal/public */
    private String visibility;
    private Long ownerId;
    private String configJson;
    private Integer isDefault;
    private Integer sortOrder;
    @Version
    private Integer version;
}
