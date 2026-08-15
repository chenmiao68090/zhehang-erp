package com.zhehang.erp.modules.crm.domain;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 微信好友信息(从云客 getAllFriendsIncrement 同步):给聊天会话显示真实好友名+头像。
 * friend_wx_id = 聊天 talker;sales_wechat_id = 聊天 wechat_id。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("biz_wechat_friend_info")
public class BizWechatFriendInfo extends BaseEntity {
    /** 好友/群微信ID(=聊天talker) */
    private String friendWxId;
    /** 所属员工微信ID(=聊天wechat_id) */
    private String salesWechatId;
    /** 好友昵称/群名 */
    private String nickname;
    /** 微信号 */
    private String alias;
    /** 备注 */
    private String remark;
    /** 头像链接 */
    private String headUrl;
    /** 手机号 */
    private String phone;
    /** 性别 */
    private Integer gender;
    /** 地区 */
    private String region;
    /** 类型:1好友 2群 */
    private Integer friendType;
    /** 最后聊天时间 */
    private LocalDateTime lastChatTime;
}
