package com.zhehang.erp.modules.system.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 数据字典类型(如 收款方式 = payment_method)。
 * 各业务体系原先写死在 .vue 里的下拉字典,统一由此表 + sys_dict_data 承载。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_dict_type")
public class SysDictType extends BaseEntity {
    /** 字典名称(中文,如 收款方式) */
    private String dictName;
    /** 字典类型编码(英文唯一,如 payment_method) */
    private String dictType;
    /** 状态(0正常 1停用) */
    private Integer status;
    /** 备注 */
    private String remark;
}
