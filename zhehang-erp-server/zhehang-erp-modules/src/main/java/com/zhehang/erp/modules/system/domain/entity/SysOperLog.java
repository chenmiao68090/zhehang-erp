package com.zhehang.erp.modules.system.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@TableName("sys_oper_log")
public class SysOperLog implements Serializable {
    private static final long serialVersionUID = 1L;

    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    /** Module name */
    private String module;

    /** Operation type (INSERT, UPDATE, DELETE, EXPORT, OTHER) */
    private String operType;

    /** Operator username */
    private String operator;

    /** Operator ID */
    private Long operatorId;

    /** Request method (class.method) */
    private String method;

    /** Request URI */
    private String requestUri;

    /** Request method (GET/POST/PUT/DELETE) */
    private String requestMethod;

    /** Request parameters */
    private String requestParams;

    /** Response result */
    private String responseResult;

    /** Operation status (0=success, 1=fail) */
    private Integer status;

    /** Error message */
    private String errorMsg;

    /** IP address */
    private String ipAddr;

    /** Cost time in ms */
    private Long costTime;

    /** Operation time */
    private LocalDateTime operTime;

    /** Tenant ID */
    private Long tenantId;
}
