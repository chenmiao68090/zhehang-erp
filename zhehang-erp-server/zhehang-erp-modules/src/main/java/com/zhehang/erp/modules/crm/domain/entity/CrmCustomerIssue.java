package com.zhehang.erp.modules.crm.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 客户服务工单实体。
 *
 * <p>把微信/电话/系统/飞书等渠道反馈的客户问题统一落成工单,按状态流转跟进,
 * 完成时必须填处理结果;重大问题可标记复盘。数据范围收敛见 ServiceImpl。</p>
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("crm_customer_issue")
public class CrmCustomerIssue extends BaseEntity {

    /** 工单编号(自动生成 GD+日期+流水) */
    private String issueNo;
    /** 客户ID(关联 crm_customer.id) */
    private Long customerId;
    /** 客户名称(冗余,便于列表展示/搜索) */
    private String customerName;
    /** 问题来源:wechat微信/phone电话/system系统/feishu飞书/other其他 */
    private String source;
    /** 来源IM会话ID(聊天右键下发任务工单) */
    private Long sourceConversationId;
    /** 来源IM消息ID(聊天右键下发任务工单) */
    private Long sourceMessageId;
    /** 问题类型:complaint投诉/consult咨询/urge催办/tax税务/invoice开票/gs工商/fee费用/other其他 */
    private String issueType;
    /** 紧急程度:P0/P1/P2 */
    private String priority;
    /** 问题描述 */
    private String description;
    /** 负责人ID(sys_user.id) */
    private Long ownerId;
    /** 负责人姓名(冗余) */
    private String ownerName;
    /** 协助人ID(可选) */
    private Long assistId;
    /** 协助人姓名(冗余) */
    private String assistName;
    /** 归属部门ID(按负责人部门写入,供部门负责人看本部门工单) */
    private Long deptId;
    /** 截止时间(必填,应用层校验) */
    private LocalDateTime deadline;
    /** 当前状态:pending待处理/processing处理中/waiting等客户/completed已完成/closed已关闭 */
    private String status;
    /** 处理结果(完成时必填) */
    private String result;
    /** 完成时间(置为已完成时写入,用于处理时长/逾期统计) */
    private LocalDateTime resolveTime;
    /** 是否升级关注:0否 1是 */
    private Integer bossInvolved;
    /** 是否需要复盘:0否 1是 */
    private Integer needReview;
    /** 复盘备注 */
    private String reviewNote;
}
