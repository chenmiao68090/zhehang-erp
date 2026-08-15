package com.zhehang.erp.modules.crm.service;

import com.baomidou.mybatisplus.core.MybatisConfiguration;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.company.service.CompanyInfoService;
import com.zhehang.erp.modules.crm.domain.dto.CrmLeadFollowDTO;
import com.zhehang.erp.modules.crm.domain.entity.CrmCustomer;
import com.zhehang.erp.modules.crm.domain.entity.CrmFollow;
import com.zhehang.erp.modules.crm.domain.entity.CrmLead;
import com.zhehang.erp.modules.crm.domain.entity.CrmPoolRuleVersion;
import com.zhehang.erp.modules.crm.mapper.CrmContactMapper;
import com.zhehang.erp.modules.crm.mapper.CrmCustomerMapper;
import com.zhehang.erp.modules.crm.mapper.CrmFollowMapper;
import com.zhehang.erp.modules.crm.mapper.CrmLeadMapper;
import com.zhehang.erp.modules.crm.service.impl.CrmLeadServiceImpl;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.system.service.GovernedFieldValueValidator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.apache.ibatis.builder.MapperBuilderAssistant;
import org.mockito.Mock;
import org.mockito.ArgumentCaptor;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Map;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CrmLeadServiceImplTest {

    @Mock
    private CrmLeadMapper leadMapper;
    @Mock
    private CrmCustomerMapper customerMapper;
    @Mock
    private CrmContactMapper contactMapper;
    @Mock
    private CrmFollowMapper followMapper;
    @Mock
    private StringRedisTemplate stringRedisTemplate;
    @Mock
    private ICrmHoldingService holdingService;
    @Mock
    private DataScopeHelper dataScopeHelper;
    @Mock
    private CompanyInfoService companyInfoService;
    @Mock
    private CrmLeadStageRecorder stageRecorder;
    @Mock
    private CrmPoolRuleService ruleService;
    @Mock
    private GovernedFieldValueValidator governedFieldValueValidator;

    private CrmLeadServiceImpl service;

    @BeforeEach
    void setUp() {
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new MybatisConfiguration(), ""), CrmLead.class);
        service = new CrmLeadServiceImpl(leadMapper, customerMapper, contactMapper, followMapper,
                stringRedisTemplate, holdingService, dataScopeHelper, companyInfoService, stageRecorder, ruleService,
                governedFieldValueValidator);
        ReflectionTestUtils.setField(service, "baseMapper", leadMapper);
    }

    @Test
    void ordinaryFollowMustCreateNextAction() {
        CrmLeadFollowDTO follow = new CrmLeadFollowDTO();
        follow.setType(1);
        follow.setContent("客户需要一份代理记账报价");

        BusinessException error = assertThrows(BusinessException.class,
                () -> service.addFollow(11L, follow));

        assertTrue(error.getMessage().contains("下一步动作"));
    }

    @Test
    void legacyFIntentIsRejectedBeforeAnyBusinessWrite() {
        CrmLeadFollowDTO follow = new CrmLeadFollowDTO();
        follow.setType(1);
        follow.setContent("历史数据仍带有F等级");
        follow.setCustomerLevel("F");
        follow.setNextTime(LocalDateTime.now().plusDays(1));
        follow.setNextActionType("电话");

        BusinessException error = assertThrows(BusinessException.class,
                () -> service.addFollow(11L, follow));

        assertTrue(error.getMessage().contains("A、B、C、D、E"));
        verify(leadMapper, never()).selectById(any());
        verify(followMapper, never()).insert(any());
    }

    @Test
    void intentChangeEvidenceUsesCanonicalIntentLevelInsteadOfLegacyCustomerLevel() {
        CrmLead lead = new CrmLead();
        lead.setId(11L);
        lead.setOwnerId(7L);
        lead.setDeptId(3L);
        lead.setStatus(2);
        lead.setFollowStatus("需求沟通");
        lead.setIntentLevel("B");
        lead.setCustomerLevel("C");
        CrmPoolRuleVersion rule = new CrmPoolRuleVersion();
        rule.setProtectionDays(30);
        when(leadMapper.selectById(11L)).thenReturn(lead);
        when(dataScopeHelper.canAccess(7L, 3L)).thenReturn(true);
        when(ruleService.current()).thenReturn(rule);
        when(leadMapper.update(any(), any())).thenReturn(1);

        CrmLeadFollowDTO follow = new CrmLeadFollowDTO();
        follow.setType(1);
        follow.setContent("客户确认本周查看报价方案");
        follow.setCustomerLevel("A");
        follow.setNextTime(LocalDateTime.now().plusDays(1));
        follow.setNextActionType("报价");

        service.addFollow(11L, follow);

        ArgumentCaptor<CrmFollow> followCaptor = ArgumentCaptor.forClass(CrmFollow.class);
        verify(followMapper).insert(followCaptor.capture());
        assertThat(followCaptor.getValue().getContent())
                .startsWith("【意向等级：B→A】")
                .contains("客户确认本周查看报价方案");
    }

    @Test
    void dIntentFollowMovesLeadToHistoryAndClearsNextAction() {
        CrmLead lead = new CrmLead();
        lead.setId(11L);
        lead.setOwnerId(7L);
        lead.setDeptId(3L);
        lead.setStatus(2);
        lead.setFollowStatus("需求沟通");
        lead.setNextActionTime(LocalDateTime.now().plusDays(2));
        CrmPoolRuleVersion rule = new CrmPoolRuleVersion();
        rule.setProtectionDays(30);
        when(leadMapper.selectById(11L)).thenReturn(lead);
        when(dataScopeHelper.canAccess(7L, 3L)).thenReturn(true);
        when(ruleService.current()).thenReturn(rule);
        when(leadMapper.update(any(), any())).thenReturn(1);

        CrmLeadFollowDTO follow = new CrmLeadFollowDTO();
        follow.setType(1);
        follow.setContent("客户目前没有需求，转长期培育");
        follow.setCustomerLevel("D");

        service.addFollow(11L, follow);

        assertThat(follow.getNextTime()).isNull();
        assertThat(follow.getNextActionType()).isNull();
        ArgumentCaptor<LambdaUpdateWrapper<CrmLead>> wrapperCaptor =
                ArgumentCaptor.forClass(LambdaUpdateWrapper.class);
        verify(leadMapper).update(any(), wrapperCaptor.capture());
        assertThat(wrapperCaptor.getValue().getSqlSet())
                .contains("status", "customer_level", "intent_level", "invalid_reason");
        verify(stageRecorder).recordTransition(eq(lead), eq("需求沟通"), eq(4),
                eq(7L), eq(3L), eq("STAGE_CHANGED"), eq("FOLLOW"), any(), any());
    }

    @Test
    void newSourceDetailNeverBecomesCustomerIndustry() {
        CrmLead lead = new CrmLead();
        lead.setId(11L);
        lead.setCompany("杭州某科技有限公司");
        lead.setName("陈女士");
        lead.setStatus(1);
        lead.setSourcePlatform("美团");
        lead.setChannel("2026年7月美团批次");
        lead.setSourceDetail("美团开户优惠活动");
        lead.setRemark("待联系\n行业门类: 软件和信息技术服务业");
        when(leadMapper.selectById(11L)).thenReturn(lead);
        when(dataScopeHelper.canAccess(any(), any())).thenReturn(true);
        when(customerMapper.insert(any())).thenAnswer(invocation -> {
            CrmCustomer customer = invocation.getArgument(0);
            customer.setId(99L);
            return 1;
        });
        when(leadMapper.update(any(), any())).thenReturn(1);

        service.convertToCustomer(11L);

        org.mockito.ArgumentCaptor<CrmCustomer> captor = org.mockito.ArgumentCaptor.forClass(CrmCustomer.class);
        verify(customerMapper).insert(captor.capture());
        assertThat(captor.getValue().getIndustry()).isEqualTo("软件和信息技术服务业");
        assertThat(captor.getValue().getIndustry()).isNotEqualTo("美团开户优惠活动");
    }

    @Test
    void manualEntryRejectsPhoneAlreadyOwnedByCustomerContact() {
        CrmPoolRuleVersion rule = new CrmPoolRuleVersion();
        rule.setDuplicateBlockEnabled(1);
        when(ruleService.current()).thenReturn(rule);
        when(contactMapper.selectCount(any())).thenReturn(1L);
        CrmLead lead = new CrmLead();
        lead.setCompany("杭州测试企业有限公司");
        lead.setPhone("13800000000");

        BusinessException error = assertThrows(BusinessException.class,
                () -> service.createManualLead(lead));

        assertThat(error.getMessage()).contains("联系电话已属于正式客户");
        verify(ruleService, never()).consumeDaily(any(), anyInt());
    }

    @Test
    void directServiceSaveValidatesAndNormalizesConsultAndDealBusiness() {
        CrmLead lead = new CrmLead();
        lead.setConsultBusiness(" 刻章业务 ");
        lead.setDealBusiness(" 代账，工商注册 ");
        when(governedFieldValueValidator.validateNewValue(
                GovernedFieldValueValidator.CRM_CONSULT_BUSINESS,
                "咨询业务", " 刻章业务 ", false)).thenReturn("刻章业务");
        when(governedFieldValueValidator.validateNewValue(
                GovernedFieldValueValidator.CRM_CONSULT_BUSINESS,
                "实际成交业务", " 代账，工商注册 ", true)).thenReturn("代账,工商注册");
        when(leadMapper.insert(any(CrmLead.class))).thenReturn(1);

        assertThat(service.save(lead)).isTrue();

        assertThat(lead.getConsultBusiness()).isEqualTo("刻章业务");
        assertThat(lead.getDealBusiness()).isEqualTo("代账,工商注册");
        verify(leadMapper).insert(lead);
    }

    @Test
    void directServiceUpdateCannotBypassGovernedConsultBusinessValidation() {
        CrmLead existing = new CrmLead();
        existing.setId(21L);
        existing.setOwnerId(7L);
        existing.setDeptId(3L);
        existing.setOwnership("private");
        existing.setConsultBusiness("代账");
        when(leadMapper.selectById(21L)).thenReturn(existing);
        when(dataScopeHelper.canAccess(7L, 3L)).thenReturn(true);
        when(governedFieldValueValidator.validateChangedValue(
                GovernedFieldValueValidator.CRM_CONSULT_BUSINESS,
                "咨询业务", "代账", "任意业务", false))
                .thenThrow(new BusinessException(400, "咨询业务包含未启用或不存在的值：任意业务"));

        CrmLead patch = new CrmLead();
        patch.setId(21L);
        patch.setConsultBusiness("任意业务");

        assertThatThrownBy(() -> service.updateLead(patch))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("任意业务");
        verify(leadMapper, never()).updateById(any(CrmLead.class));
    }

    @Test
    void historyPageKeepsExplicitInvalidStatusInsteadOfFallingBackToActiveOnly() {
        when(leadMapper.selectPage(any(), any())).thenReturn(new Page<>());

        service.selectMyPage(1, 20, null, null, 4, null, null, "all");

        @SuppressWarnings("unchecked")
        ArgumentCaptor<LambdaQueryWrapper<CrmLead>> wrapperCaptor = ArgumentCaptor.forClass(LambdaQueryWrapper.class);
        verify(leadMapper).selectPage(any(), wrapperCaptor.capture());
        assertThat(wrapperCaptor.getValue().getSqlSegment())
                .contains("ownership", "status", "=")
                .doesNotContain("status IN");
    }

    @Test
    void myIntentLevelFilterSupportsAToEExactly() {
        when(leadMapper.selectPage(any(), any())).thenReturn(new Page<>());

        service.selectMyPage(1, 20, null, null, null, null, "a", "all");

        @SuppressWarnings("unchecked")
        ArgumentCaptor<LambdaQueryWrapper<CrmLead>> wrapperCaptor = ArgumentCaptor.forClass(LambdaQueryWrapper.class);
        verify(leadMapper).selectPage(any(), wrapperCaptor.capture());
        assertThat(wrapperCaptor.getValue().getSqlSegment()).contains("intent_level");
        assertThat(wrapperCaptor.getValue().getParamNameValuePairs()).containsValue("A");
    }

    @Test
    void myIntentLevelFilterRejectsValuesOutsideAToE() {
        BusinessException error = assertThrows(BusinessException.class,
                () -> service.selectMyPage(1, 20, null, null, null, null, "F", "all"));

        assertThat(error.getMessage()).contains("A-E");
        verify(leadMapper, never()).selectPage(any(), any());
    }

    @Test
    void ownerCanReactivateOwnHistoryLeadAndAuditIsRecorded() {
        CrmLead lead = historyLead(71L, 9L);
        CrmPoolRuleVersion rule = new CrmPoolRuleVersion();
        rule.setProtectionDays(30);
        when(leadMapper.selectBatchIds(List.of(71L))).thenReturn(List.of(lead));
        when(holdingService.currentHolding(9L)).thenReturn(Map.of("current", 3L, "max", 100));
        when(ruleService.current()).thenReturn(rule);
        when(dataScopeHelper.deptIdOfUser(9L)).thenReturn(6L);
        when(leadMapper.update(any(), any())).thenReturn(1);

        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(SecurityUtils::getCurrentUserId).thenReturn(9L);
            service.reactivateHistory(List.of(71L));
        }

        @SuppressWarnings("unchecked")
        ArgumentCaptor<com.baomidou.mybatisplus.core.conditions.Wrapper<CrmLead>> wrapperCaptor =
                ArgumentCaptor.forClass(com.baomidou.mybatisplus.core.conditions.Wrapper.class);
        verify(leadMapper).update(any(), wrapperCaptor.capture());
        String sql = wrapperCaptor.getValue().getSqlSegment();
        assertThat(sql).contains("id", "owner_id", "ownership", "status");
        verify(stageRecorder).recordTransition(eq(lead), eq("需求沟通"), eq(2),
                eq(9L), eq(6L), eq("STAGE_CHANGED"), eq("REACTIVATE"), eq(71L), any());
    }

    @Test
    void ordinarySalesCannotReactivateAnotherOwnersHistoryLead() {
        CrmLead lead = historyLead(72L, 10L);
        when(leadMapper.selectBatchIds(List.of(72L))).thenReturn(List.of(lead));
        when(dataScopeHelper.isManagerOrAdmin()).thenReturn(false);

        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(SecurityUtils::getCurrentUserId).thenReturn(9L);
            BusinessException error = assertThrows(BusinessException.class,
                    () -> service.reactivateHistory(List.of(72L)));
            assertThat(error.getMessage()).contains("只能领取本人或管理范围");
        }

        verify(leadMapper, never()).update(any(), any());
        verify(holdingService, never()).currentHolding(any());
    }

    @Test
    void managerCanClaimVisibleTeamHistoryLeadIntoOwnPortfolio() {
        CrmLead lead = historyLead(75L, 10L);
        CrmPoolRuleVersion rule = new CrmPoolRuleVersion();
        rule.setProtectionDays(30);
        when(leadMapper.selectBatchIds(List.of(75L))).thenReturn(List.of(lead));
        when(dataScopeHelper.isManagerOrAdmin()).thenReturn(true);
        when(dataScopeHelper.canAccess(10L, 6L)).thenReturn(true);
        when(holdingService.currentHolding(9L)).thenReturn(Map.of("current", 3L, "max", 100));
        when(ruleService.current()).thenReturn(rule);
        when(dataScopeHelper.deptIdOfUser(9L)).thenReturn(6L);
        when(leadMapper.update(any(), any())).thenReturn(1);

        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(SecurityUtils::getCurrentUserId).thenReturn(9L);
            service.reactivateHistory(List.of(75L));
        }

        @SuppressWarnings("unchecked")
        ArgumentCaptor<com.baomidou.mybatisplus.core.conditions.Wrapper<CrmLead>> wrapperCaptor =
                ArgumentCaptor.forClass(com.baomidou.mybatisplus.core.conditions.Wrapper.class);
        verify(leadMapper).update(any(), wrapperCaptor.capture());
        assertThat(wrapperCaptor.getValue().getSqlSegment()).contains("owner_id", "ownership", "status");
        verify(stageRecorder).recordTransition(eq(lead), eq("需求沟通"), eq(2),
                eq(9L), eq(6L), eq("STAGE_CHANGED"), eq("REACTIVATE"), eq(75L), any());
    }

    @Test
    void managerCannotClaimHistoryOutsideVisibleScope() {
        CrmLead lead = historyLead(76L, 88L);
        when(leadMapper.selectBatchIds(List.of(76L))).thenReturn(List.of(lead));
        when(dataScopeHelper.isManagerOrAdmin()).thenReturn(true);
        when(dataScopeHelper.canAccess(88L, 6L)).thenReturn(false);

        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(SecurityUtils::getCurrentUserId).thenReturn(9L);
            BusinessException error = assertThrows(BusinessException.class,
                    () -> service.reactivateHistory(List.of(76L)));
            assertThat(error.getMessage()).contains("管理范围");
        }

        verify(leadMapper, never()).update(any(), any());
        verify(holdingService, never()).currentHolding(any());
    }

    @Test
    void cannotReactivateLeadThatIsNoLongerHistory() {
        CrmLead lead = historyLead(73L, 9L);
        lead.setStatus(2);
        when(leadMapper.selectBatchIds(List.of(73L))).thenReturn(List.of(lead));

        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(SecurityUtils::getCurrentUserId).thenReturn(9L);
            BusinessException error = assertThrows(BusinessException.class,
                    () -> service.reactivateHistory(List.of(73L)));
            assertThat(error.getMessage()).contains("已不是历史客资");
        }

        verify(leadMapper, never()).update(any(), any());
    }

    @Test
    void historyReactivationRespectsPrivateHoldingCapacity() {
        CrmLead lead = historyLead(74L, 9L);
        when(leadMapper.selectBatchIds(List.of(74L))).thenReturn(List.of(lead));
        when(holdingService.currentHolding(9L)).thenReturn(Map.of("current", 100L, "max", 100));

        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(SecurityUtils::getCurrentUserId).thenReturn(9L);
            BusinessException error = assertThrows(BusinessException.class,
                    () -> service.reactivateHistory(List.of(74L)));
            assertThat(error.getMessage()).contains("私海容量不足");
        }

        verify(leadMapper, never()).update(any(), any());
    }

    private CrmLead historyLead(Long id, Long ownerId) {
        CrmLead lead = new CrmLead();
        lead.setId(id);
        lead.setName("历史测试客户");
        lead.setOwnerId(ownerId);
        lead.setDeptId(6L);
        lead.setOwnership("private");
        lead.setStatus(4);
        lead.setValidity("无效");
        lead.setInvalidReason("暂不需要");
        lead.setFollowStatus("需求沟通");
        return lead;
    }
}
