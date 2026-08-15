package com.zhehang.erp.modules.workflow.domain.dto;

import com.zhehang.erp.common.core.domain.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 审批列表查询条件(待办/已办/抄送/已发起通用):
 * 搜索/筛选在服务端做,前端不再一次拉50条在内存里过滤。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class WfTaskQuery extends PageQuery {
    /** 关键字:命中 实例标题/流程名/发起人姓名 */
    private String keyword;
    /** 流程标识(精确) */
    private String processKey;
    /** 时间段起(yyyy-MM-dd,含当天):待办/抄送按到达时间,已办按处理时间,已发起按发起时间 */
    private String startDate;
    /** 时间段止(yyyy-MM-dd,含当天) */
    private String endDate;
}
