package com.zhehang.erp.modules.system.domain.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_user")
public class SysUser extends BaseEntity {
    private String username;
    @JsonIgnore
    private String password;
    private String nickname;
    private String email;
    private String phone;
    @TableField("sex")
    private Integer gender;
    private String avatar;
    private Integer status;
    private Long deptId;
    private String remark;
    private Integer mustChangePassword;
    private LocalDateTime passwordChangedAt;
    private Integer mfaEnabled;
    @JsonIgnore
    private String mfaSecret;
    private LocalDateTime mfaEnrolledAt;
}
