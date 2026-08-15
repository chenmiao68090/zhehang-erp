package com.zhehang.erp.modules.system.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 数据字典项(某字典类型下的一条选项,如 收款方式 → 微信)。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_dict_data")
public class SysDictData extends BaseEntity {
    /** 所属字典类型编码(对应 sys_dict_type.dict_type) */
    private String dictType;
    /** 字典标签(展示用,如 微信) */
    private String dictLabel;
    /** 字典键值(存储用,如 wechat) */
    private String dictValue;
    /** 排序(小的在前) */
    private Integer dictSort;
    /** 是否默认(0否 1是) */
    private Integer isDefault;
    /** 状态(0正常 1停用) */
    private Integer status;
    /** 备注 */
    private String remark;
}
