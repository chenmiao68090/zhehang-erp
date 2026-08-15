package com.zhehang.erp.modules.feigetask.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.Version;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("feige_task_order_bridge_rule")
public class FeigeOrderTaskBridgeRule extends BaseEntity {
    private String ruleCode;
    private String ruleName;
    private String triggerEvent;
    private String targetTaskType;
    private Long processId;
    private String businessTypeCode;
    private String scopeType;
    private Integer finalConfirm;
    private Integer enabled;
    @Version
    private Integer version;
}
