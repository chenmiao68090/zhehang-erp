package com.zhehang.erp.modules.company.domain;

import lombok.Data;
import lombok.experimental.Accessors;

import java.util.List;

/**
 * 工商企业信息（统一企业主体）。
 *
 * <p>字段与前端 EnterpriseEntity 对齐，用于「填公司名自动带出工商信息」。
 * 数据来源由 {@link com.zhehang.erp.modules.company.provider.CompanyDataProvider} 提供：
 * 当前默认实现是内置示例库（免密钥、可演示），未来可切换为天眼查 / 企查查等真实接口，
 * 前端与上层 Service 都无需改动。</p>
 */
@Data
@Accessors(chain = true)
public class CompanyInfo {
    /** 内部主体ID（示例库固定；接真实接口时可用其唯一键映射） */
    private Long id;
    /** 企业全称 */
    private String name;
    /** 企业简称 */
    private String shortName;
    /** 统一社会信用代码 */
    private String creditCode;
    /** 纳税人识别号（通常等于统一社会信用代码） */
    private String taxNo;
    /** 法定代表人 */
    private String legalPerson;
    /** 注册资本 */
    private String registeredCapital;
    /** 成立日期 yyyy-MM-dd */
    private String establishDate;
    /** 经营状态：营业 / 存续 / 迁出 / 注销 / 异常 */
    private String businessStatus;
    /** 省 */
    private String province;
    /** 市 */
    private String city;
    /** 区县 */
    private String district;
    /** 注册地址 */
    private String address;
    /** 所属行业 */
    private String industry;
    /** 企业类型 */
    private String companyType;
    /** 人员规模 */
    private String employeeScale;
    /** 年营收区间 */
    private String annualRevenue;
    /** 税务资质：一般纳税人 / 小规模纳税人 / 未核定 等 */
    private String taxQualification;
    /** 风险 / 商机标签 */
    private List<String> riskTags;
    /** 联系方式数量 */
    private Integer contactCount;
    /** 联系人列表 */
    private List<CompanyContact> contacts;
    /** 数据来源说明 */
    private String source;
    /** 数据更新时间 */
    private String updateTime;
}
