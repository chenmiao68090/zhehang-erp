package com.zhehang.erp.modules.hrm.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * HR·月度考勤汇总(按员工×月份持久化,HR 可改 + 员工二次确认)。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("hrm_attendance_summary")
public class HrmAttendanceSummary extends BaseEntity {
    private Long employeeId;
    private String employeeName;
    /** 月份 YYYY-MM */
    private String month;
    private Integer expectedDays;
    private Integer paidHolidayDays;
    private Integer actualDays;
    private Integer normal;
    private Integer late;
    private Integer early;
    private Integer absent;
    private BigDecimal personalLeave;
    private BigDecimal sickLeave;
    /** 0待HR确认/1HR已确认待员工/2员工已确认/3员工有异议 */
    private Integer confirmStatus;
    private Long confirmBy;
    private LocalDateTime confirmTime;
    private LocalDateTime employeeConfirmTime;
    private String employeeRemark;
    private String remark;
}
