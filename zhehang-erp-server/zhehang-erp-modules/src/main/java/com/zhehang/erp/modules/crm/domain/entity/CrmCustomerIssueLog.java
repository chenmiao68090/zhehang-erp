package com.zhehang.erp.modules.crm.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 客户服务工单流转记录。
 *
 * <p>每次新建/分配/状态变更/关闭/复盘自动记一条,工单详情页按时间线展示,
 * 供老板复盘"这单为什么拖了3天"时有据可查。</p>
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("crm_customer_issue_log")
public class CrmCustomerIssueLog extends BaseEntity {

    /** 工单ID(crm_customer_issue.id) */
    private Long issueId;
    /** 动作:create新建/assign分配/status改状态/close关闭/review复盘 */
    private String action;
    /** 变更前状态 */
    private String fromStatus;
    /** 变更后状态 */
    private String toStatus;
    /** 操作人ID */
    private Long operatorId;
    /** 操作人姓名 */
    private String operatorName;
    /** 操作说明/备注 */
    private String remark;
}
