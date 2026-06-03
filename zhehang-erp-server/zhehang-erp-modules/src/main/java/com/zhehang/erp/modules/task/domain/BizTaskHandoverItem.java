package com.zhehang.erp.modules.task.domain;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 交接清单子项实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("biz_task_handover_item")
public class BizTaskHandoverItem extends BaseEntity {
    /** 交接单ID */
    private Long handoverId;
    /** 子项类别(account账号 doc资料 contact联系人 other其他) */
    private String category;
    /** 子项名称 */
    private String name;
    /** 子项内容/值 */
    private String content;
    /** 状态(0未完成 1已完成 2缺失) */
    private Integer status;
    /** 备注 */
    private String remark;
}
