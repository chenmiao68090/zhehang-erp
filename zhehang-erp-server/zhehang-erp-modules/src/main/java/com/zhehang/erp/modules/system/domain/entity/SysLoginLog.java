package com.zhehang.erp.modules.system.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@TableName("sys_login_log")
public class SysLoginLog implements Serializable {
    private static final long serialVersionUID = 1L;

    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    /** Login username */
    private String username;

    /** IP address */
    private String ipAddr;

    /** Login location */
    private String loginLocation;

    /** Browser */
    private String browser;

    /** Operating system */
    private String os;

    /** Login status (0=success, 1=fail) */
    private Integer status;

    /** Message */
    private String msg;

    /** Login time */
    private LocalDateTime loginTime;

    /** Tenant ID */
    private Long tenantId;
}
