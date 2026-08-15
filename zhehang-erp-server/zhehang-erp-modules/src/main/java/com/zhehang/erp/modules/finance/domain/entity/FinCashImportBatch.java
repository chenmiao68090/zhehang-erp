package com.zhehang.erp.modules.finance.domain.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 收款日记账导入批次。
 * 每次批量导入(粘贴/Excel/CSV)生成一条,记录来源、统计与状态,供批次弹窗查看与整批回滚。
 * status:imported已导入 / partial部分导入 / partial_rollback部分回滚 / rolledback已回滚。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("fin_cash_import_batch")
public class FinCashImportBatch extends BaseEntity {
    /** 批次号(IMP+yyyyMMdd+HHmmss+2位随机,唯一) */
    private String batchNo;
    /** 导入方式:paste粘贴/excel/csv */
    private String importType;
    /** 来源文件名(粘贴为空) */
    private String fileName;
    /** 提交总行数 */
    private Integer totalCount;
    /** 成功入库行数 */
    private Integer successCount;
    /** 失败(校验不通过)行数 */
    private Integer failCount;
    /** 重复(跳过)行数 */
    private Integer duplicateCount;
    /** 成功入库金额合计 */
    private BigDecimal totalAmount;
    /** 状态:imported/partial/partial_rollback/rolledback */
    private String status;
    /** 导入人用户ID */
    private Long importedBy;
    /** 导入人姓名(非表字段,查询时按 importedBy 联 sys_user 回填,供前端显示) */
    @TableField(exist = false)
    private String importedByName;
    /** 导入时间 */
    private LocalDateTime importedAt;
    /** 备注(回滚说明等) */
    private String remark;
}
