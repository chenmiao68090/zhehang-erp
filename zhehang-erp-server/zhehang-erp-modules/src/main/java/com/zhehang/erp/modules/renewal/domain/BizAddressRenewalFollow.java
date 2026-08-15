package com.zhehang.erp.modules.renewal.domain;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 地址续费·催收跟进记录(永久不可删)。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("biz_address_renewal_follow")
public class BizAddressRenewalFollow extends BaseEntity {
    private Long renewalId;
    private String type;
    private String content;
    private LocalDateTime nextTime;
    /** 操作人(强制留痕,不可改) */
    private Long operatorId;
    private String operatorName;
}
