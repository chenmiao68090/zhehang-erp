package com.zhehang.erp.modules.openapi.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("openapi_log")
public class OpenapiLog extends BaseEntity {

    /** 应用ID */
    private Long appId;

    /** 请求路径 */
    private String apiPath;

    /** 请求方法 */
    private String requestMethod;

    /** 请求IP */
    private String requestIp;

    /** 请求时间 */
    private LocalDateTime requestTime;

    /** 响应状态码 */
    private Integer responseStatus;

    /** 耗时(毫秒) */
    private Integer costMs;
}
