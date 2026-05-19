package com.zhehang.erp.modules.openapi.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("openapi_app")
public class OpenapiApp extends BaseEntity {

    /** 应用名称 */
    private String appName;

    /** 应用Key */
    private String appKey;

    /** 应用密钥(AES加密) */
    private String appSecret;

    /** 应用描述 */
    private String description;

    /** 授权范围(逗号分隔) */
    private String scopes;

    /** 每秒请求数限制 */
    private Integer rateLimit;

    /** 状态: 0-禁用 1-启用 */
    private Integer status;
}
