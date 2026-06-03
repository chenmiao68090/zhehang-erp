package com.zhehang.erp.modules.system.domain.vo;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class UserVO {
    private Long id;
    private String username;
    private String nickname;
    private String email;
    private String phone;
    private Integer gender;
    private String avatar;
    private Integer status;
    private Long deptId;
    private String deptName;
    private String remark;
    private List<Long> roleIds;
    private List<String> roleNames;
    private LocalDateTime createTime;
}
