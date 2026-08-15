package com.zhehang.erp.modules.system.domain.vo;

import lombok.AllArgsConstructor;
import lombok.Data;

/** 初始口令只在本次响应中展示一次，服务端不保存明文。 */
@Data
@AllArgsConstructor
public class InitialCredentialVO {
    private String username;
    private String initialPassword;
    private boolean mustChangePassword;
}
