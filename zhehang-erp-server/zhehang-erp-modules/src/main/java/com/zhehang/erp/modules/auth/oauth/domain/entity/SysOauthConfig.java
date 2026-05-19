package com.zhehang.erp.modules.auth.oauth.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_oauth_config")
public class SysOauthConfig extends BaseEntity {

    /** 供应商: wechat_work/dingtalk/feishu */
    private String provider;

    /** 应用ID */
    private String appId;

    /** 应用密钥(AES加密存储) */
    private String appSecret;

    /** 代理ID/AgentId */
    private String agentId;

    /** 回调地址 */
    private String redirectUri;

    /** 是否启用: 0-禁用 1-启用 */
    private Integer enabled;
}
