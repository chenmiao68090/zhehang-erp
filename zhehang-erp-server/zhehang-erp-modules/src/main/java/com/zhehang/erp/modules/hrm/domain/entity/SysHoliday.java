package com.zhehang.erp.modules.hrm.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

/**
 * 法定节假日 / 调休补班日历。
 *
 * <p>供考勤模块计算「应出勤天数」使用：在基础的周一~周五工作日上，
 * 减去 {@code dayType=1}（放假）且落在工作日的法定节假日，
 * 加上 {@code dayType=2}（补班）且落在周六周日的调休补班日。</p>
 *
 * <p>仅考勤内部读取，不对外提供 Controller/Service，由
 * {@code HrmAttendanceServiceImpl} 直接注入 {@link com.zhehang.erp.modules.hrm.mapper.SysHolidayMapper} 查询。</p>
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_holiday")
public class SysHoliday extends BaseEntity {
    /** 节假日 / 补班日期 */
    private LocalDate holidayDate;
    /** 名称（如 元旦、春节、端午、国庆调休补班 等） */
    private String name;
    /** 日期类型：1=放假（应出勤减一天），2=补班（落在周末时应出勤加一天） */
    private Integer dayType;
}
