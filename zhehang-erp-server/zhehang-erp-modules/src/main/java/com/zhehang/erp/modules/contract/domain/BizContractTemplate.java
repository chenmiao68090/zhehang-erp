package com.zhehang.erp.modules.contract.domain;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 合同模板实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("biz_contract_template")
public class BizContractTemplate extends BaseEntity {
    /** 模板名称 */
    private String name;
    /** 模板分类 */
    private String category;
    /** 适用类型 */
    private String applyType;
    /** 模板内容(支持占位符) */
    private String content;
    /** 占位符变量定义(JSON) */
    private String variables;
    /** 状态(0禁用 1启用) */
    private Integer status;
    /** 备注 */
    private String remark;
}
