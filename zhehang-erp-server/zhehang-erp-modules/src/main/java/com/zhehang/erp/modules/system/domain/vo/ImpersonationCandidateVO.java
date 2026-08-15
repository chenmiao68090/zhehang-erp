package com.zhehang.erp.modules.system.domain.vo;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ImpersonationCandidateVO {
    private Long userId;
    private String displayName;
    private Long deptId;
    private String deptName;
    private List<String> roleNames;
    private List<String> roleKeys;
    private Integer roleCount;
    private boolean multipleRoles;
}
