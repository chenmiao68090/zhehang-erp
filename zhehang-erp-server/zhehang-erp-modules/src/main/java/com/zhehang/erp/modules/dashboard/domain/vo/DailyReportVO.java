package com.zhehang.erp.modules.dashboard.domain.vo;

import com.zhehang.erp.modules.dashboard.domain.entity.DailyReport;
import lombok.Data;
import lombok.EqualsAndHashCode;

/** 抄送我的日报:日报字段 + 作者姓名 */
@Data
@EqualsAndHashCode(callSuper = true)
public class DailyReportVO extends DailyReport {
    /** 作者姓名(org_employee.name by user_id,查不到回退空) */
    private String authorName;
}
