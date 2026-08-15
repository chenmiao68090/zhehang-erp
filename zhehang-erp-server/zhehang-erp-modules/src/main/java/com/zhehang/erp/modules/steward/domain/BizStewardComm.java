package com.zhehang.erp.modules.steward.domain;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 管家体系·沟通记录。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("biz_steward_comm")
public class BizStewardComm extends BaseEntity {
    /** 关联签约客户ID(可空) */
    private Long clientId;
    /** 客户名称 */
    private String clientName;
    /** 沟通方式(电话/微信/上门/其他) */
    private String commType;
    /** 沟通内容 */
    private String content;
    /** 沟通时间 */
    private LocalDateTime commTime;
    /** 负责管家 */
    private String steward;
    /** 下次跟进日期 */
    private LocalDate nextFollow;
    /** 备注 */
    private String remark;
}
