package com.zhehang.erp.modules.org.domain.vo;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class EmployeeVO {
    private Long id;
    private Long userId;
    private String empCode;
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
    private Long deptId;
    private String deptName;
    private Long postId;
    private String postName;
    /** 岗位描述(岗位职责/任职要求/工作内容) */
    private String postDescription;
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
    /** 年假总天数(HR 设置) */
    private Double annualLeaveTotal;
    /** 已用年假天数 */
    private Double annualLeaveUsed;
    /** 直属上级(上级的用户ID) */
    private Long managerId;
    /** 直属上级姓名 */
    private String managerName;
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
    private LocalDateTime createTime;

    private String username;
    private Boolean accountEnabled;
    private Integer userStatus;
    private List<Long> roleIds;
    private List<String> roleNames;
}
