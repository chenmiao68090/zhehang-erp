package com.zhehang.erp.modules.org.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("org_employee")
public class OrgEmployee extends BaseEntity {
    /** 关联用户ID */
    private Long userId;
    /** 员工工号 */
    private String empCode;
    /** 姓名 */
    private String name;
    /** 性别（0男 1女） */
    private Integer gender;
    /** 出生日期 */
    private LocalDate birthDate;
    /** 身份证号 */
    private String idCard;
    /** 手机号 */
    private String phone;
    /** 邮箱 */
    private String email;
    /** 通讯地址 */
    private String address;
    /** 户口所在地 */
    private String householdLocation;
    /** 户口类型(本地城镇/本地农村/外地城镇/外地农村/本地居民户口/外地居民户口) */
    private String householdType;
    /** 籍贯 */
    private String nativePlace;
    /** 民族 */
    private String ethnicity;
    /** 政治面貌(党员/团员/群众/其他) */
    private String politicalStatus;
    /** 婚姻情况(已婚/未婚) */
    private String maritalStatus;
    /** HR附件JSON:离职证明/劳动合同/竞业/保密/会计补充协议 [{type,name,url}] */
    private String hrDocs;
    /** 部门ID */
    private Long deptId;
    /** 岗位ID */
    private Long postId;
    /** 岗位描述(岗位职责/任职要求/工作内容) */
    private String postDescription;
    /** 入职日期 */
    private LocalDate hireDate;
    /** 真实离职日期 */
    private LocalDate resignDate;
    /** 转正日期 */
    private LocalDate regularDate;
    /** 合同开始日期 */
    private LocalDate contractStart;
    /** 合同结束日期 */
    private LocalDate contractEnd;
    /** 学历 */
    private String education;
    /** 毕业院校 */
    private String university;
    /** 专业 */
    private String major;
    /** 紧急联系人 */
    private String emergencyContact;
    /** 紧急联系人电话 */
    private String emergencyPhone;
    /** 状态（1在职 2试用 3离职） */
    private Integer status;
    /** 备注 */
    private String remark;

    /** 头像(base64 或 URL,支持手动上传) */
    private String avatar;

    /** 年假总天数(HR 手工设置,支持半天) */
    private Double annualLeaveTotal;

    /** 已用年假天数(发起年假请假时扣减,驳回/撤销时退还) */
    private Double annualLeaveUsed;

    /** 直属上级(上级的用户ID,审批"直属上级"用) */
    private Long managerId;

    /** 简历档案文件ID */
    private Long resumeFileId;
    /** 简历档案文件名 */
    private String resumeFileName;
    /** 学历证书文件ID */
    private Long educationCertFileId;
    /** 学历证书文件名 */
    private String educationCertFileName;
    /** 技能证书文件ID */
    private Long skillCertFileId;
    /** 技能证书文件名 */
    private String skillCertFileName;
    /** 身份证正面文件ID */
    private Long idCardFrontFileId;
    /** 身份证正面文件名 */
    private String idCardFrontFileName;
    /** 身份证反面文件ID */
    private Long idCardBackFileId;
    /** 身份证反面文件名 */
    private String idCardBackFileName;
}
