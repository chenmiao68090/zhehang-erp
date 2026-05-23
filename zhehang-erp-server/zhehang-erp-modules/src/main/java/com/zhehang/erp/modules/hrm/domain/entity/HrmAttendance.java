package com.zhehang.erp.modules.hrm.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("hrm_attendance")
public class HrmAttendance extends BaseEntity {
    private Long employeeId;
    private LocalDate attendanceDate;
    private LocalTime clockIn;
    private LocalTime clockOut;
    private Integer status;
    private BigDecimal workHours;
    private String remark;
}
