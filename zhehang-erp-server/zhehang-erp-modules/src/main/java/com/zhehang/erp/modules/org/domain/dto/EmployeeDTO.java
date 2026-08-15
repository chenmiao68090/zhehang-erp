package com.zhehang.erp.modules.org.domain.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class EmployeeDTO {
    private Long id;
    private Long userId;

    private String empCode;

    @NotBlank(message = "姓名不能为空")
    private String name;

    private Integer gender;
    private LocalDate birthDate;
    private String idCard;
    private String phone;
    private String email;
    private String address;
    private String householdLocation;
    private String householdType;
    private String nativePlace;
    private String ethnicity;
    private String politicalStatus;
    private String maritalStatus;

    @NotNull(message = "部门不能为空")
    private Long deptId;

    @NotNull(message = "岗位不能为空")
    private Long postId;

    private LocalDate hireDate;
    private LocalDate resignDate;
    private LocalDate regularDate;
    private LocalDate contractStart;
    private LocalDate contractEnd;
    private String education;
    private String university;
    private String major;
    private String emergencyContact;
    private String emergencyPhone;
    private Integer status;
    private String remark;
    private String avatar;
    /** 年假总天数(HR 设置,支持半天) */
    private Double annualLeaveTotal;
    /** 已用年假天数 */
    private Double annualLeaveUsed;
    /** 直属上级(上级的用户ID) */
    private Long managerId;

    /** 人事附件(离职证明/劳动合同/竞业/保密/会计补充协议)JSON:[{type,fileId,name,url}] */
    private String hrDocs;

    private Long resumeFileId;
    private String resumeFileName;
    private Long educationCertFileId;
    private String educationCertFileName;
    private Long skillCertFileId;
    private String skillCertFileName;
    private Long idCardFrontFileId;
    private String idCardFrontFileName;
    private Long idCardBackFileId;
    private String idCardBackFileName;

    /** 员工登录账号信息:原“用户管理”并入员工管理后由这里统一维护 */
    private String username;
    private Boolean accountEnabled;
    private List<Long> roleIds;
}
