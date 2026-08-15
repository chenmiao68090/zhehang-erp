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

    @TableId(type = IdType.AUTO)
    private Long id;

    /** Module name */
    private String module;

    /** Operation type (INSERT, UPDATE, DELETE, EXPORT, OTHER) */
    private String operType;

    /** Operator username */
    private String operator;

    /** Operator ID */
    private Long operatorId;

    /** 实际发起操作的账号 ID；代登录时固定为平台超级管理员 */
    private Long actorUserId;

    /** 实际发起操作的账号名；用于审计快照，避免账号改名后无法还原当时责任人 */
    private String actorUsername;

    /** 实际承载业务权限和数据范围的账号 ID；代登录时为目标员工 */
    private Long effectiveUserId;

    /** 实际承载业务权限和数据范围的账号名 */
    private String effectiveUsername;

    /** 代登录审计会话 ID；普通请求为空 */
    private String impersonationSessionId;

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

    /** Operation status (0=success, 1=fail, 2=impersonation audit processing) */
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
