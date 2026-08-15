package com.zhehang.erp.modules.crm.domain.dto;

import lombok.Data;

/**
 * 公司资源导入行。金额和日期保留为文本，由预检逐行解析并返回可理解的错误，
 * 避免一个坏单元格让整个请求在 JSON 反序列化阶段失败。
 */
@Data
public class CrmLeadImportRowDTO {
    private Integer rowNumber;
    private String company;
    private String legalPerson;
    private String phone;
    private String companyPhone;
    private String wechatNo;
    private String creditCode;
    private String email;
    private String registerStatus;
    private String region;
    private String enterpriseScale;
    private String enterpriseType;
    private String registeredCapital;
    private String paidCapital;
    private String establishedDate;
    private String approvedDate;
    private String insuredCount;
    private String insuredYear;
    private String registerAddress;
    private String latestAddress;
    private String businessScope;
    /** 行业门类当前没有独立列，确认导入时以“行业门类: xxx”追加到备注。 */
    private String industry;
    private String remark;
}
