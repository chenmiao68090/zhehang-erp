package com.zhehang.erp.modules.system.domain.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.util.List;

@Data
public class UserDTO {
    private Long id;
    @NotBlank(message = "用户名不能为空")
    @Size(min = 2, max = 30, message = "用户名长度2-30")
    private String username;
    @NotBlank(message = "昵称不能为空")
    private String nickname;
    private String email;
    private String phone;
    private Integer gender;
    private Integer status;
    private Long deptId;
    private String remark;
    private List<Long> roleIds;
}
