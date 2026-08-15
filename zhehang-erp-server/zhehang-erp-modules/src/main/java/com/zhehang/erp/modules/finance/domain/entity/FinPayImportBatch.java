package com.zhehang.erp.modules.finance.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 收款中心-对账单导入批次(支持整批撤销未认领流水)。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("fin_pay_import_batch")
public class FinPayImportBatch extends BaseEntity {

    private Long channelId;

    /** 文件名/粘贴导入 */
    private String fileName;

    /** 提交行数 */
    private Integer totalRows;

    /** 实际入库行数 */
    private Integer insertedRows;

    /** 重复跳过行数 */
    private Integer duplicateRows;

    /** done完成/rolled_back已撤销 */
    private String status;

    private String remark;
}
