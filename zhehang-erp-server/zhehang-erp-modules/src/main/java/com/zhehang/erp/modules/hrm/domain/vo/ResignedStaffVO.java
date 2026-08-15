package com.zhehang.erp.modules.hrm.domain.vo;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 离职人员中心的最小安全视图。
 * 不包含手机号、身份证、住址、薪资等隐私字段。
 */
@Data
public class ResignedStaffVO {
    private Long employeeId;
    private String empCode;
    private String name;
    private Long deptId;
    private String deptName;
    private Long postId;
    private String postName;
    private LocalDate hireDate;
    private LocalDate resignDate;

    /** 0可登录 / 1已停用 / 2未开通 / 3账号关联异常 */
    private Integer accountStatus;
    private Boolean accountEnabled;

    private Long handoverId;
    private LocalDate handoverDate;
    private Long handoverToEmployeeId;
    private String handoverTo;
    /** 0待交接 / 1交接中 / 2已闭环 */
    private Integer status;
    private Integer customerCheckStatus;
    private Integer taskCheckStatus;
    private Integer documentCheckStatus;
    private Integer assetCheckStatus;
    private Integer settlementCheckStatus;
    private LocalDateTime archiveTime;

    /** 账号风险+五项未完成的总数 */
    private Integer riskCount;
    /** HIGH / MEDIUM / CLOSED */
    private String riskLevel;
}
