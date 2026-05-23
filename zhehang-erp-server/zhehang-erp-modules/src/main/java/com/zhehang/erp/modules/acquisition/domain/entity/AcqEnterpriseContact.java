package com.zhehang.erp.modules.acquisition.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("acq_enterprise_contact")
public class AcqEnterpriseContact extends BaseEntity {
    /** 企业ID */
    private Long enterpriseId;
    /** 类型(phone/mobile/email/fax) */
    private String contactType;
    /** 联系方式值 */
    private String contactValue;
    /** 联系人姓名 */
    private String contactName;
    /** 职位 */
    private String contactPosition;
    /** 来源 */
    private String source;
    /** 是否已解锁 */
    private Integer isUnlocked;
    /** 解锁时间 */
    private LocalDateTime unlockTime;
    /** 解锁人ID */
    private Long unlockBy;
}
