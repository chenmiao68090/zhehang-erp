package com.zhehang.erp.modules.crm.domain;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 云客集成配置(单行):云客开放平台对接凭证。
 * 签名KEY 敏感,读取时脱敏返回前端;实际调用由 YunkeClient 用库中原值。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("biz_yunke_config")
public class YunkeConfig extends BaseEntity {
    /** 企业串码(公司码) */
    private String company;
    /** 管理员ID(查全公司数据用) */
    private String partnerId;
    /** 接口签名KEY(敏感) */
    private String signKey;
    /** 接口地址 */
    private String baseUrl;
    /** 是否启用:0否 1是 */
    private Integer enabled;
    /** 聊天同步游标(上次拉取的end时间戳,13位毫秒) */
    private Long chatCursor;
    /** 好友信息增量同步游标(末条updateTime,yyyy-MM-dd HH:mm:ss);V169 */
    private String friendCursor;
    /** 群信息增量同步游标(末条updateTime,yyyy-MM-dd HH:mm:ss);V169 */
    private String groupCursor;
}
