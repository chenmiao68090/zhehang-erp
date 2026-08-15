package com.zhehang.erp.modules.hrm.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("hrm_recruit")
public class HrmRecruit extends BaseEntity {
    private Long deptId;
    private Long postId;
    private String title;
    private Integer headcount;
    private BigDecimal salaryMin;
    private BigDecimal salaryMax;
    private String requirements;
    private Integer status;
    private LocalDate publishDate;
    private LocalDate startDate;
    private LocalDate planFinishDate;
    private String jobOwner;
    private String recruitOwner;
}
