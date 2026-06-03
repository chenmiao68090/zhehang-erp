package com.zhehang.erp.modules.crm.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("crm_pool_config")
public class CrmPoolConfig extends BaseEntity {
    /** 公海池名称 */
    private String poolName;
    /** 公海池类型 */
    private String poolType;
    /** 可见范围 */
    private String visibleScope;
    /** 操作范围 */
    private String operateScope;
    /** 分配模式 */
    private String distributeMode;
    /** 描述 */
    private String description;
    /** 排序 */
    private Integer sortOrder;
    /** 状态(0正常 1禁用) */
    private Integer status;
    /** 规则配置JSON */
    private String rulesJson;
}
