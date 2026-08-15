package com.zhehang.erp.modules.system.domain.dto;

import lombok.Data;

/** Mapper 内部投影：只读取候选列表需要的非敏感字段。 */
@Data
public class ImpersonationCandidateRow {
    private Long userId;
    private String displayName;
    private Long deptId;
    private String deptName;
    private String roleNamesJson;
    private String roleKeysJson;
    private Integer roleCount;
}
