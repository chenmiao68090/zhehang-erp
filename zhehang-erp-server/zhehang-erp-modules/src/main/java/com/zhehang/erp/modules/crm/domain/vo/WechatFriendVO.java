package com.zhehang.erp.modules.crm.domain.vo;

import lombok.Data;

import java.time.LocalDateTime;

/** 微信好友页兼容视图，字段名保持现有前端接口不变。 */
@Data
public class WechatFriendVO {
    private Long id;
    /** 所属员工微信ID，对应主动同步表 sales_wechat_id。 */
    private String wxId;
    private String friendWxId;
    private String friendNickname;
    private String friendRemark;
    private String friendAlias;
    private Integer gender;
    private String region;
    private String friendWxPhone;
    /** 数据来源固定为云客主动同步。 */
    private String fromType;
    private String headUrl;
    private LocalDateTime lastChatTime;
    private LocalDateTime updateTime;
}
