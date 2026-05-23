package com.zhehang.erp.modules.multidim.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("multidim_record")
public class MultidimRecord extends BaseEntity {
    /** 所属表格ID */
    private Long tableId;
    /** 行数据JSON */
    private String data;
}
