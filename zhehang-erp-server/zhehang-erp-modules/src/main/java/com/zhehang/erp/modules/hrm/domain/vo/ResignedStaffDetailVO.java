package com.zhehang.erp.modules.hrm.domain.vo;

import com.zhehang.erp.modules.hrm.domain.entity.HrmResignHandover;
import lombok.Data;

import java.util.Collections;
import java.util.List;

/** 离职人员中心详情：安全员工视图+真实交接记录+可追溯时间轴。 */
@Data
public class ResignedStaffDetailVO {
    private ResignedStaffVO employee;
    private List<HrmResignHandover> handovers = Collections.emptyList();
    private List<OffboardingTimelineVO> timeline = Collections.emptyList();
}
