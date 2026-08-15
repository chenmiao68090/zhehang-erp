package com.zhehang.erp.modules.hrm.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 劳动合同管理(飞书建议 161)。
 * HR 端登记员工劳动合同台账(编号/类型/起止/签订日/约定薪资/附件),
 * 按到期日与状态跟进续签、终止,并对即将到期的合同主动提醒员工本人。
 *
 * <p>与既有依赖 org_employee.contract_start/contract_end 的只读「合同到期提醒」页并存:
 * 本表是独立、可维护多份合同历史的「劳动合同台账」,故新建独立表,不改 org/员工。</p>
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("hrm_labor_contract")
public class HrmLaborContract extends BaseEntity {
    /** 员工ID(org_employee.id) */
    private Long employeeId;
    private String employeeName;
    private String deptName;
    /** 合同编号 */
    private String contractNo;
    /** 合同类型:固定期限/无固定期限/以完成一定工作为期限 */
    private String contractType;
    /** 合同开始日期 */
    private LocalDate startDate;
    /** 合同结束日期(无固定期限可空) */
    private LocalDate endDate;
    /** 合同签订日期 */
    private LocalDate signDate;
    /** 状态:1生效/2即将到期/3已到期/4已终止/5已续签 */
    private Integer status;
    /** 约定薪资(可空) */
    private BigDecimal salaryAgreed;
    /** 合同附件(file_info.id,可空) */
    private Long attachmentFileId;
    private String remark;
}
