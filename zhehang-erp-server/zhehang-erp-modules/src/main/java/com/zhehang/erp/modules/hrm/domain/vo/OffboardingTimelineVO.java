package com.zhehang.erp.modules.hrm.domain.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/** 由真实离职日期与交接记录时间组成的时间轴节点。 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OffboardingTimelineVO {
    private String type;
    private String title;
    private String description;
    private LocalDateTime time;
}
