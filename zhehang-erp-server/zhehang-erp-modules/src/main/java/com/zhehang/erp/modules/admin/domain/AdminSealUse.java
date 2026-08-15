package com.zhehang.erp.modules.admin.domain;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

/**
 * 行政·印章登记(用印申请闭环)。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("admin_seal_use")
public class AdminSealUse extends BaseEntity {
    /** 用印日期 */
    private LocalDate useDate;
    /** 编号 如 20260625001 */
    private String serialNo;
    /** 申请人 */
    private String applicant;
    /** 用印事由 */
    private String reason;
    /** 文件名称 */
    private String fileName;
    /** 用印类型:公章/法人章/财务章/合同章 */
    private String sealType;
    /** 用印位置 多选存逗号串:开头/骑缝章/落款 */
    private String usePosition;
    /** 用印页数 */
    private Integer pageCount;
    /** 文件附件 URL/说明 */
    private String fileAttach;
    /** 用印人确认 1是0否 */
    private Integer userConfirm;
    /** 备注 */
    private String remark;
}
