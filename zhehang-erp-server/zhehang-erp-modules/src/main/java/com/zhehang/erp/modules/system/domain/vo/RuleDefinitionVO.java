package com.zhehang.erp.modules.system.domain.vo;

import lombok.Builder;
import lombok.Getter;

/**
 * 规则中心目录项。
 *
 * <p>这里只描述规则的治理元数据，规则值仍由对应领域服务和事实表负责，
 * 避免再造一个可以绕过领域校验的“万能规则表”。</p>
 */
@Getter
@Builder
public class RuleDefinitionVO {
    private final String code;
    private final String name;
    private final String domainCode;
    private final String domainName;
    private final String type;
    private final String sourceKind;
    private final String sourceName;
    private final String sourceTable;
    private final String manageRoute;
    private final String riskLevel;
    private final String changeMode;
    private final String integrationState;
    private final boolean supportsSimulation;
    private final boolean supportsRollback;
    private final String summary;
    private final String impactScope;
    private final String legacyWarning;
    private final Integer sort;
}
