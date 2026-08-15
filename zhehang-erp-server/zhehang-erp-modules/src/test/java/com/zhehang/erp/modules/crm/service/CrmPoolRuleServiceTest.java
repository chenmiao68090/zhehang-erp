package com.zhehang.erp.modules.crm.service;

import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.crm.domain.dto.CrmPoolRuleConfigDTO;
import com.zhehang.erp.modules.crm.domain.entity.CrmPoolRuleVersion;
import com.zhehang.erp.modules.crm.mapper.CrmPoolRuleUsageMapper;
import com.zhehang.erp.modules.crm.mapper.CrmPoolRuleVersionMapper;
import com.zhehang.erp.security.domain.LoginUser;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CrmPoolRuleServiceTest {
    @Mock private CrmPoolRuleVersionMapper versionMapper;
    @Mock private CrmPoolRuleUsageMapper usageMapper;
    @Mock private StringRedisTemplate redisTemplate;
    private CrmPoolRuleService service;

    @BeforeEach
    void setUp() {
        LoginUser user = new LoginUser();
        user.setUserId(88L);
        user.setTenantId(9L);
        user.setUsername("boss");
        user.setRoleKeys(List.of("super_admin"));
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(user, null, List.of()));
        service = new CrmPoolRuleService(versionMapper, usageMapper, redisTemplate);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void missingDatabaseRuleUsesCompatibleDefaults() {
        when(versionMapper.selectOne(any())).thenReturn(null);

        CrmPoolRuleVersion current = service.current();

        assertThat(current.getDailyClaimLimit()).isEqualTo(1000);
        assertThat(current.getPrivateHoldingLimit()).isEqualTo(1000);
        assertThat(current.getProtectionDays()).isEqualTo(15);
    }

    @Test
    void draftRejectsSingleLimitAboveDailyLimit() {
        CrmPoolRuleConfigDTO config = validConfig();
        config.setSingleClaimLimit(501);
        config.setDailyClaimLimit(500);

        assertThatThrownBy(() -> service.saveDraft(config))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("单次领取上限不能大于每日领取上限");
    }

    @Test
    void draftAllowsSingleLimitsAboveLegacyThousandCeilingWhenWithinDailyLimits() {
        when(versionMapper.selectList(any())).thenReturn(List.of());
        CrmPoolRuleConfigDTO config = validConfig();
        config.setDailyClaimLimit(6_000);
        config.setSingleClaimLimit(5_000);
        config.setDailyImportLimit(50_000);
        config.setSingleImportLimit(30_000);

        CrmPoolRuleVersion draft = service.saveDraft(config);

        assertThat(draft.getSingleClaimLimit()).isEqualTo(5_000);
        assertThat(draft.getSingleImportLimit()).isEqualTo(30_000);
    }

    @Test
    void draftRejectsSingleClaimAboveExpandedSafetyCeiling() {
        CrmPoolRuleConfigDTO config = validConfig();
        config.setDailyClaimLimit(10_000);
        config.setSingleClaimLimit(10_001);

        assertThatThrownBy(() -> service.saveDraft(config))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("单次领取上限应在 1 至 10000 之间");
    }

    @Test
    void draftRejectsSingleImportAboveExpandedSafetyCeiling() {
        CrmPoolRuleConfigDTO config = validConfig();
        config.setDailyImportLimit(100_000);
        config.setSingleImportLimit(100_001);

        assertThatThrownBy(() -> service.saveDraft(config))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("单次导入上限应在 1 至 100000 之间");
    }

    @Test
    void simulationIsReadOnlyAndReturnsImpactCounts() {
        when(versionMapper.countOwnersOverHolding(9L, 800)).thenReturn(3L);
        when(versionMapper.countRecycleCandidates(any(), any(), any())).thenReturn(17L);

        var result = service.simulate(validConfig());

        assertThat(result.get("ownersOverHolding")).isEqualTo(3L);
        assertThat(result.get("recycleCandidates")).isEqualTo(17L);
        assertThat(result.get("readOnly")).isEqualTo(true);
    }

    @Test
    void ordinarySalesCannotSaveDraft() {
        LoginUser sales = new LoginUser();
        sales.setUserId(99L);
        sales.setTenantId(9L);
        sales.setUsername("sales");
        sales.setRoleKeys(List.of("sales"));
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(sales, null, List.of()));

        assertThatThrownBy(() -> service.saveDraft(validConfig()))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("仅老板或超级管理员");
    }

    @Test
    void dueScheduledVersionIsDisplayedAsActive() {
        CrmPoolRuleVersion due = new CrmPoolRuleVersion();
        due.setId(12L);
        due.setVersionNo(3);
        due.setStatus("SCHEDULED");
        CrmPoolRuleVersion previous = new CrmPoolRuleVersion();
        previous.setId(11L);
        previous.setVersionNo(2);
        previous.setStatus("ACTIVE");
        when(versionMapper.selectList(any())).thenReturn(List.of(due, previous));
        when(versionMapper.selectOne(any())).thenReturn(due);

        List<CrmPoolRuleVersion> versions = service.versions();

        assertThat(versions.get(0).getStatus()).isEqualTo("ACTIVE");
        assertThat(versions.get(1).getStatus()).isEqualTo("ARCHIVED");
    }

    private CrmPoolRuleConfigDTO validConfig() {
        CrmPoolRuleConfigDTO c = new CrmPoolRuleConfigDTO();
        c.setDailyClaimLimit(1000);
        c.setSingleClaimLimit(100);
        c.setDailyManualEntryLimit(1000);
        c.setSingleImportLimit(1000);
        c.setDailyImportLimit(10000);
        c.setPrivateHoldingLimit(800);
        c.setPrivateWarningPercent(90);
        c.setProtectionDays(15);
        c.setRecycleNoFollowDays(15);
        c.setRecycleWarningDays(3);
        c.setReleaseCooldownDays(15);
        c.setDuplicateBlockEnabled(true);
        c.setChangeSummary("测试规则");
        return c;
    }
}
