package com.zhehang.erp.modules.org.domain.vo;

import lombok.Data;

import java.time.LocalDate;

/**
 * 劳动合同到期提醒的最小字段视图。
 * 不返回身份证、联系方式、人事附件或账号权限信息。
 */
@Data
public class EmployeeContractExpiryVO {
    private Long id;
    private String name;
    private Long deptId;
    private String deptName;
    private Long postId;
    private String postName;
    private LocalDate contractStart;
    private LocalDate contractEnd;
    private Integer status;
}
