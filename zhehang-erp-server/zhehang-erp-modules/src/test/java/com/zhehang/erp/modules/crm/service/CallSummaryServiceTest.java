package com.zhehang.erp.modules.crm.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.MybatisConfiguration;
import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import com.zhehang.erp.common.core.domain.AuthUser;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.crm.domain.BizCallRecord;
import com.zhehang.erp.modules.crm.domain.dto.CallSummaryDTO;
import com.zhehang.erp.modules.crm.domain.dto.CrmLeadFollowDTO;
import com.zhehang.erp.modules.crm.domain.entity.CrmLead;
import com.zhehang.erp.modules.crm.mapper.BizCallRecordMapper;
import com.zhehang.erp.modules.crm.mapper.CrmLeadMapper;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.apache.ibatis.builder.MapperBuilderAssistant;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CallSummaryServiceTest {

    @Mock
    private BizCallRecordMapper callRecordMapper;
    @Mock
    private CrmLeadMapper leadMapper;
    @Mock
    private ICrmLeadService leadService;
    @Mock
    private DataScopeHelper dataScopeHelper;

    private CallSummaryService service;

    @BeforeEach
    void setUp() {
        TableInfoHelper.initTableInfo(
                new MapperBuilderAssistant(new MybatisConfiguration(), ""), CrmLead.class);
        service = new CallSummaryService(callRecordMapper, leadMapper, leadService, dataScopeHelper);
        AuthUser authUser = org.mockito.Mockito.mock(AuthUser.class);
        lenient().when(authUser.getUserId()).thenReturn(7L);
        lenient().when(authUser.getTenantId()).thenReturn(1L);
        lenient().when(authUser.getUsername()).thenReturn("sales01");
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(authUser, null));
        lenient().when(dataScopeHelper.resolveUserNames(any())).thenReturn(Map.of(7L, "销售甲"));
        lenient().when(callRecordMapper.insert(any(BizCallRecord.class))).thenAnswer(invocation -> {
            BizCallRecord record = invocation.getArgument(0);
            record.setId(100L);
            return 1;
        });
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void connectedCallCreatesCallRecordAndFollowupTask() {
        CrmLead lead = accessibleLead();
        when(leadMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(lead);
        when(dataScopeHelper.canAccess(7L, 3L)).thenReturn(true);

        CallSummaryDTO summary = baseSummary();
        summary.setConnected(1);
        summary.setResult("接通");
        summary.setRemark("客户需要代理记账报价");
        summary.setCustomerLevel("A");
        summary.setNextActionTime(LocalDateTime.now().plusDays(1));
        summary.setNextActionType("报价");
        summary.setFollowStatus("需求沟通");

        assertEquals(100L, service.saveSummary(summary));

        ArgumentCaptor<BizCallRecord> recordCaptor = ArgumentCaptor.forClass(BizCallRecord.class);
        verify(callRecordMapper).insert(recordCaptor.capture());
        assertEquals("platform", recordCaptor.getValue().getCallType());
        assertEquals(7L, recordCaptor.getValue().getAgentId());
        assertEquals("销售甲", recordCaptor.getValue().getAgentName());

        ArgumentCaptor<CrmLeadFollowDTO> followCaptor = ArgumentCaptor.forClass(CrmLeadFollowDTO.class);
        verify(leadService).addFollow(eq(11L), followCaptor.capture(), eq(false));
        assertEquals("报价", followCaptor.getValue().getNextActionType());
        assertEquals("需求沟通", followCaptor.getValue().getFollowStatus());
        verify(leadMapper).update(isNull(), any(LambdaUpdateWrapper.class));
    }

    @Test
    void ongoingCallMustHaveNextAction() {
        CallSummaryDTO summary = baseSummary();
        summary.setConnected(0);
        summary.setResult("无人接听");

        BusinessException error = assertThrows(BusinessException.class, () -> service.saveSummary(summary));
        assertTrue(error.getMessage().contains("下一步跟进时间"));
        verify(callRecordMapper, never()).insert(any());
    }

    @Test
    void unansweredCallSavesFollowupWithoutEmptyLeadUpdate() {
        CrmLead lead = accessibleLead();
        when(leadMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(lead);
        when(dataScopeHelper.canAccess(7L, 3L)).thenReturn(true);

        CallSummaryDTO summary = baseSummary();
        summary.setConnected(0);
        summary.setResult("无人接听");
        summary.setNextActionTime(LocalDateTime.now().plusDays(1));
        summary.setNextActionType("电话");

        assertEquals(100L, service.saveSummary(summary));

        ArgumentCaptor<CrmLeadFollowDTO> followCaptor = ArgumentCaptor.forClass(CrmLeadFollowDTO.class);
        verify(leadService).addFollow(eq(11L), followCaptor.capture(), eq(false));
        assertEquals("电话", followCaptor.getValue().getNextActionType());
        assertNull(followCaptor.getValue().getCustomerLevel());
        verify(leadMapper, never()).update(isNull(), any(LambdaUpdateWrapper.class));
    }

    @Test
    void connectedCallMustHaveConclusion() {
        CallSummaryDTO summary = baseSummary();
        summary.setConnected(1);
        summary.setResult("接通");
        summary.setNextActionTime(LocalDateTime.now().plusDays(1));
        summary.setNextActionType("电话");
        summary.setCustomerLevel("B");

        BusinessException error = assertThrows(BusinessException.class, () -> service.saveSummary(summary));
        assertTrue(error.getMessage().contains("客户反馈"));
    }

    @Test
    void completedQuoteFallsBackToCollectionStage() {
        CrmLead lead = accessibleLead();
        when(leadMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(lead);
        when(dataScopeHelper.canAccess(7L, 3L)).thenReturn(true);

        CallSummaryDTO summary = baseSummary();
        summary.setConnected(1);
        summary.setResult("接通");
        summary.setRemark("客户确认签约,等待收款");
        summary.setCustomerLevel("A");
        summary.setQuoteStatus("已成交");
        summary.setNextActionTime(LocalDateTime.now().plusDays(1));
        summary.setNextActionType("收款");

        service.saveSummary(summary);

        ArgumentCaptor<CrmLeadFollowDTO> followCaptor = ArgumentCaptor.forClass(CrmLeadFollowDTO.class);
        verify(leadService).addFollow(eq(11L), followCaptor.capture(), eq(false));
        assertEquals("签单收款", followCaptor.getValue().getFollowStatus());
    }

    @Test
    void anotherAgentsPlatformRecordCannotBeOverwritten() {
        CrmLead lead = accessibleLead();
        when(leadMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(lead);
        when(dataScopeHelper.canAccess(7L, 3L)).thenReturn(true);
        BizCallRecord existing = new BizCallRecord();
        existing.setId(88L);
        existing.setTenantId(1L);
        existing.setAgentId(9L);
        existing.setPlatformCallId("call-001");
        when(callRecordMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(existing);
        when(dataScopeHelper.canAccessOwner(9L)).thenReturn(false);

        CallSummaryDTO summary = baseSummary();
        summary.setConnected(0);
        summary.setResult("号码无效");

        AccessDeniedException error = assertThrows(AccessDeniedException.class, () -> service.saveSummary(summary));
        assertTrue(error.getMessage().contains("其他坐席"));
        verify(callRecordMapper, never()).updateById(any());
    }

    @Test
    void inaccessibleLeadIsRejected() {
        CrmLead lead = accessibleLead();
        when(leadMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(lead);
        when(dataScopeHelper.canAccess(7L, 3L)).thenReturn(false);
        CallSummaryDTO summary = baseSummary();
        summary.setConnected(0);
        summary.setResult("号码无效");

        AccessDeniedException error = assertThrows(AccessDeniedException.class, () -> service.saveSummary(summary));
        assertTrue(error.getMessage().contains("无权操作"));
        verify(callRecordMapper, never()).insert(any());
    }

    @Test
    void legacyFIntentIsRejectedInsteadOfSilentlyReclassified() {
        CallSummaryDTO summary = baseSummary();
        summary.setConnected(1);
        summary.setResult("接通");
        summary.setRemark("客户愿意继续沟通");
        summary.setCustomerLevel("F");
        summary.setNextActionTime(LocalDateTime.now().plusDays(1));
        summary.setNextActionType("电话");

        BusinessException error = assertThrows(BusinessException.class, () -> service.saveSummary(summary));

        assertTrue(error.getMessage().contains("A、B、C、D、E"));
        verify(callRecordMapper, never()).insert(any());
        verify(leadService, never()).addFollow(any(), any(), anyBoolean());
    }

    @Test
    void invalidNumberCanCloseWithoutAnotherTask() {
        CrmLead lead = accessibleLead();
        when(leadMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(lead);
        when(dataScopeHelper.canAccess(7L, 3L)).thenReturn(true);
        CallSummaryDTO summary = baseSummary();
        summary.setConnected(0);
        summary.setResult("号码无效");

        service.saveSummary(summary);

        ArgumentCaptor<CrmLeadFollowDTO> followCaptor = ArgumentCaptor.forClass(CrmLeadFollowDTO.class);
        verify(leadService).addFollow(eq(11L), followCaptor.capture(), eq(true));
        assertNull(followCaptor.getValue().getNextTime());
        assertEquals("E", followCaptor.getValue().getCustomerLevel());
        ArgumentCaptor<LambdaUpdateWrapper<CrmLead>> updateCaptor = ArgumentCaptor.forClass(LambdaUpdateWrapper.class);
        verify(leadMapper).update(isNull(), updateCaptor.capture());
        assertTrue(updateCaptor.getValue().getSqlSet().contains("status"));
        assertTrue(updateCaptor.getValue().getSqlSet().contains("invalid_reason"));
    }

    @Test
    void connectedCallMustChooseIntentLevel() {
        CallSummaryDTO summary = baseSummary();
        summary.setConnected(1);
        summary.setResult("接通");
        summary.setRemark("客户愿意继续沟通");
        summary.setNextActionTime(LocalDateTime.now().plusDays(1));
        summary.setNextActionType("电话");

        BusinessException error = assertThrows(BusinessException.class, () -> service.saveSummary(summary));

        assertTrue(error.getMessage().contains("意向等级"));
        verify(callRecordMapper, never()).insert(any());
    }

    @Test
    void dIntentMovesLeadToHistoryWithoutNextAction() {
        CrmLead lead = accessibleLead();
        when(leadMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(lead);
        when(dataScopeHelper.canAccess(7L, 3L)).thenReturn(true);
        CallSummaryDTO summary = baseSummary();
        summary.setConnected(1);
        summary.setResult("接通");
        summary.setRemark("客户明确表示目前没有需求");
        summary.setCustomerLevel("D");

        service.saveSummary(summary);

        ArgumentCaptor<CrmLeadFollowDTO> followCaptor = ArgumentCaptor.forClass(CrmLeadFollowDTO.class);
        verify(leadService).addFollow(eq(11L), followCaptor.capture(), eq(true));
        assertEquals("D", followCaptor.getValue().getCustomerLevel());
        assertNull(followCaptor.getValue().getNextTime());
        ArgumentCaptor<LambdaUpdateWrapper<CrmLead>> updateCaptor = ArgumentCaptor.forClass(LambdaUpdateWrapper.class);
        verify(leadMapper).update(isNull(), updateCaptor.capture());
        assertTrue(updateCaptor.getValue().getSqlSet().contains("status"));
        assertTrue(updateCaptor.getValue().getSqlSet().contains("customer_level"));
    }

    @Test
    void manualRecordCannotInjectOrOverwritePlatformRecordingUrl() {
        BizCallRecord existing = new BizCallRecord();
        existing.setId(88L);
        existing.setTenantId(1L);
        existing.setAgentId(7L);
        existing.setPlatformCallId("call-001");
        existing.setRecordUrl("https://trusted.yunke.example/original.mp3");
        when(callRecordMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(existing);
        when(dataScopeHelper.canAccessOwner(7L)).thenReturn(true);

        BizCallRecord input = new BizCallRecord();
        input.setPlatformCallId("call-001");
        input.setRecordUrl("javascript:alert(1)");
        input.setResult("接通");

        assertEquals(88L, service.saveRecordOnly(input));

        ArgumentCaptor<BizCallRecord> captor = ArgumentCaptor.forClass(BizCallRecord.class);
        verify(callRecordMapper).updateById(captor.capture());
        assertEquals("https://trusted.yunke.example/original.mp3", captor.getValue().getRecordUrl());
    }

    private CrmLead accessibleLead() {
        CrmLead lead = new CrmLead();
        lead.setId(11L);
        lead.setOwnerId(7L);
        lead.setDeptId(3L);
        lead.setStatus(2);
        lead.setFollowStatus("需求沟通");
        return lead;
    }

    private CallSummaryDTO baseSummary() {
        CallSummaryDTO summary = new CallSummaryDTO();
        summary.setLeadId(11L);
        summary.setCustomerName("测试客户");
        summary.setPhone("13800000000");
        summary.setPlatformCallId("call-001");
        summary.setDuration(30);
        return summary;
    }
}
