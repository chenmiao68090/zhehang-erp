package com.zhehang.erp.modules.task.domain;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 客户满意度回访实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("biz_satisfaction")
public class BizSatisfaction extends BaseEntity {
    /** 回访编号 */
    private String visitNo;
    /** 客户ID */
    private Long customerId;
    /** 关联合同ID */
    private Long contractId;
    /** 回访类型(first_service/3month/6month/12month/complaint/manual) */
    private String visitType;
    /** 回访时间；为空表示待回访 */
    private LocalDateTime visitTime;
    /** 回访人ID */
    private Long visitorId;
    /** 回访方式(phone/wechat/meeting) */
    private String visitMethod;
    /** 满意度评分(1-5) */
    private Integer score;
    /** 服务评价(JSON数组) */
    private String evaluation;
    /** 存在问题 */
    private String problems;
    /** 改进建议 */
    private String suggestions;
    /** 是否愿意转介绍(yes/no/considering) */
    private String willingReferral;
    /** 后续跟进事项 */
    private String followUpItems;
    /** 升级任务ID；当前页面不伪造自动派单 */
    private Long escalationTaskId;
}
