package com.zhehang.erp.modules.hrm.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("hrm_sop")
public class HrmSop extends BaseEntity {
    private String sopTitle;
    /** 逗号分隔:会计/销售/工商/客服/运营/管理 */
    private String applicablePositions;
    private String businessScenario;
    private String standardSteps;
    private String checkStandard;
    private Long ownerId;
    private String ownerName;
    private String versionNo;
    private Boolean enabled;
    private Integer usageCount;
    private LocalDateTime lastUsedTime;
}
