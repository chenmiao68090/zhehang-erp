package com.zhehang.erp.modules.crm.domain;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 微信聊天记录(后台从云客 /open/wechat/allRecords 增量同步落库)。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("biz_wechat_chat")
public class BizWechatChat extends BaseEntity {
    /** 企业码 */
    private String companyCode;
    /** 员工微信ID */
    private String wechatId;
    /** 好友微信ID(群聊时为说话人/群id) */
    private String talker;
    /** 微信群ID(仅群聊) */
    private String roomid;
    /** 是否员工发送:0好友 1员工 */
    private Integer mine;
    /** 消息类型:1文本2图片3语音4视频8GIF9文件10链接13名片14定位15系统18小程序21引用22拍一拍 */
    private Integer msgType;
    /** 文本内容(type=1)/文件名(9)/标题(10)等 */
    private String content;
    /** 媒体链接:图片/文件/视频链接、语音id等 */
    private String fileUrl;
    /** 缩略图链接 */
    private String fileTh;
    /** 微信消息ID(去重用) */
    private String msgSvrId;
    /** 消息发送时间 */
    private LocalDateTime msgTime;
}
