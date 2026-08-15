package com.zhehang.erp.modules.crm.service;

import com.baomidou.mybatisplus.core.MybatisConfiguration;
import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.contract.domain.BizContract;
import com.zhehang.erp.modules.contract.mapper.BizContractMapper;
import com.zhehang.erp.modules.crm.domain.BizCallRecord;
import com.zhehang.erp.modules.crm.domain.entity.CrmContact;
import com.zhehang.erp.modules.crm.domain.entity.CrmCustomer;
import com.zhehang.erp.modules.crm.domain.entity.CrmCustomerIssue;
import com.zhehang.erp.modules.crm.domain.entity.CrmFollow;
import com.zhehang.erp.modules.crm.domain.entity.CrmLead;
import com.zhehang.erp.modules.crm.domain.entity.CrmOpportunity;
import com.zhehang.erp.modules.crm.domain.vo.CrmCustomer360VO;
import com.zhehang.erp.modules.crm.mapper.BizCallRecordMapper;
import com.zhehang.erp.modules.crm.mapper.CrmContactMapper;
import com.zhehang.erp.modules.crm.mapper.CrmCustomerIssueMapper;
import com.zhehang.erp.modules.crm.mapper.CrmCustomerMapper;
import com.zhehang.erp.modules.crm.mapper.CrmFollowMapper;
import com.zhehang.erp.modules.crm.mapper.CrmLeadMapper;
import com.zhehang.erp.modules.crm.mapper.CrmOpportunityMapper;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.finance.domain.entity.FinReceivableRenewal;
import com.zhehang.erp.modules.finance.mapper.FinReceivableRenewalMapper;
import com.zhehang.erp.modules.order.domain.BizOrder;
import com.zhehang.erp.modules.order.mapper.BizOrderMapper;
import com.zhehang.erp.modules.receipt.domain.BizReceipt;
import com.zhehang.erp.modules.receipt.mapper.BizReceiptMapper;
import org.apache.ibatis.builder.MapperBuilderAssistant;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CrmCustomer360ServiceTest {

    @Mock private CrmLeadMapper leadMapper;
    @Mock private CrmCustomerMapper customerMapper;
    @Mock private CrmContactMapper contactMapper;
    @Mock private CrmFollowMapper followMapper;
    @Mock private BizCallRecordMapper callRecordMapper;
    @Mock private CrmOpportunityMapper opportunityMapper;
    @Mock private BizOrderMapper orderMapper;
    @Mock private BizContractMapper contractMapper;
    @Mock private BizReceiptMapper receiptMapper;
    @Mock private FinReceivableRenewalMapper receivableRenewalMapper;
    @Mock private CrmCustomerIssueMapper customerIssueMapper;
    @Mock private DataScopeHelper dataScopeHelper;

    private CrmCustomer360Service service;

    @BeforeEach
    void setUp() {
        initTable(CrmContact.class);
        initTable(CrmLead.class);
        initTable(CrmFollow.class);
        initTable(BizCallRecord.class);
        initTable(CrmOpportunity.class);
        initTable(BizOrder.class);
        initTable(BizContract.class);
        initTable(BizReceipt.class);
        initTable(FinReceivableRenewal.class);
        initTable(CrmCustomerIssue.class);

        service = new CrmCustomer360Service(leadMapper, customerMapper, contactMapper, followMapper,
                callRecordMapper, opportunityMapper, orderMapper, contractMapper, receiptMapper,
                receivableRenewalMapper, customerIssueMapper, dataScopeHelper);

        lenient().when(contactMapper.selectList(any())).thenReturn(List.of());
        lenient().when(followMapper.selectList(any())).thenReturn(List.of());
        lenient().when(callRecordMapper.selectList(any())).thenReturn(List.of());
        lenient().when(opportunityMapper.selectList(any())).thenReturn(List.of());
        lenient().when(orderMapper.selectList(any())).thenReturn(List.of());
        lenient().when(contractMapper.selectList(any())).thenReturn(List.of());
        lenient().when(receiptMapper.selectList(any())).thenReturn(List.of());
        lenient().when(receivableRenewalMapper.selectList(any())).thenReturn(List.of());
        lenient().when(customerIssueMapper.selectList(any())).thenReturn(List.of());
        lenient().when(followMapper.selectCount(any())).thenReturn(0L);
        lenient().when(callRecordMapper.selectCount(any())).thenReturn(0L);
        lenient().when(dataScopeHelper.resolveUserNames(any())).thenReturn(Map.of(7L, "销售甲"));
    }

    @Test
    void accessibleLeadMergesFollowAndCallTimeline() {
        CrmLead lead = privateLead();
        when(leadMapper.selectById(11L)).thenReturn(lead);
        when(dataScopeHelper.canAccess(7L, 3L)).thenReturn(true);

        CrmFollow follow = new CrmFollow();
        follow.setId(21L);
        follow.setType(2);
        follow.setContent("客户已确认服务范围");
        follow.setNextContent("明天下午确认报价");
        follow.setNextTime(LocalDateTime.of(2026, 7, 13, 14, 0));
        follow.setCreateTime(LocalDateTime.of(2026, 7, 12, 10, 0));
        follow.setCreateBy(7L);
        when(followMapper.selectList(any())).thenReturn(List.of(follow));
        when(followMapper.selectCount(any())).thenReturn(1L);

        BizCallRecord call = new BizCallRecord();
        call.setId(31L);
        call.setResult("接通");
        call.setConnected(1);
        call.setDuration(95);
        call.setAgentId(7L);
        call.setCallTime(LocalDateTime.of(2026, 7, 12, 9, 30));
        when(callRecordMapper.selectList(any())).thenReturn(List.of(call));
        when(callRecordMapper.selectCount(any())).thenReturn(1L);

        CrmCustomer360VO result = service.getByLeadId(11L);

        assertFalse(result.getOverview().isCustomerDataRestricted());
        assertEquals("销售甲", result.getOverview().getOwnerName());
        assertEquals("明天下午确认报价", result.getOverview().getNextActionContent());
        assertEquals(1, result.getStats().getFollowCount());
        assertEquals(1, result.getStats().getCallCount());
        assertTrue(result.getTimeline().stream().anyMatch(v -> "follow".equals(v.getType())));
        assertTrue(result.getTimeline().stream().anyMatch(v -> "call".equals(v.getType())));
    }

    @Test
    void publicPoolOrdinaryUserGetsBasicLeadOnly() {
        CrmLead lead = privateLead();
        lead.setOwnership("pool");
        lead.setOwnerId(99L);
        lead.setOwnerName("历史负责人");
        lead.setConvertedCustomerId(88L);
        lead.setLastFollowContent("历史报价与客户异议");
        lead.setDealAmount(new BigDecimal("8800"));
        lead.setWechat("private-wechat");
        lead.setEmail("private@example.com");
        when(leadMapper.selectById(11L)).thenReturn(lead);
        when(dataScopeHelper.isManagerOrAdmin()).thenReturn(false);

        CrmCustomer360VO result = service.getByLeadId(11L);

        assertTrue(result.getOverview().isCustomerDataRestricted());
        assertNull(result.getOverview().getCustomerId());
        assertNull(result.getOverview().getOwnerId());
        assertNull(result.getOverview().getOwnerName());
        assertNull(result.getOverview().getLastFollowContent());
        assertNull(result.getOverview().getDealAmount());
        assertEquals("138****0000", result.getOverview().getPhone());
        assertNull(result.getOverview().getWechat());
        assertNull(result.getOverview().getEmail());
        assertEquals("杭州示例科技有限公司", result.getOverview().getCompanyName());
        assertTrue(result.getContacts().isEmpty());
        assertTrue(result.getTimeline().isEmpty());
        verify(customerMapper, never()).selectById(any());
        verify(contactMapper, never()).selectList(any());
        verify(followMapper, never()).selectList(any());
    }

    @Test
    void inaccessiblePrivateLeadIsRejectedBeforeRelatedQueries() {
        CrmLead lead = privateLead();
        when(leadMapper.selectById(11L)).thenReturn(lead);
        when(dataScopeHelper.canAccess(7L, 3L)).thenReturn(false);

        BusinessException error = assertThrows(BusinessException.class, () -> service.getByLeadId(11L));

        assertTrue(error.getMessage().contains("无权查看"));
        verify(customerMapper, never()).selectById(any());
        verify(followMapper, never()).selectList(any());
    }

    @Test
    void convertedCustomerOutsideScopeHidesCustomerAndTransactions() {
        CrmLead lead = privateLead();
        lead.setConvertedCustomerId(88L);
        CrmCustomer customer = new CrmCustomer();
        customer.setId(88L);
        customer.setOwnerId(99L);
        customer.setDeptId(9L);
        when(leadMapper.selectById(11L)).thenReturn(lead);
        when(customerMapper.selectById(88L)).thenReturn(customer);
        when(dataScopeHelper.canAccess(7L, 3L)).thenReturn(true);
        when(dataScopeHelper.canAccess(99L, 9L)).thenReturn(false);

        CrmCustomer360VO result = service.getByLeadId(11L);

        assertTrue(result.getOverview().isCustomerDataRestricted());
        assertEquals(88L, result.getOverview().getCustomerId());
        assertTrue(result.getContacts().isEmpty());
        assertTrue(result.getTransactions().isEmpty());
        verify(contactMapper, never()).selectList(any());
        verify(orderMapper, never()).selectList(any());
        verify(receiptMapper, never()).selectList(any());
    }

    @Test
    void accessibleCustomerAggregatesOnlyScopedMapperResults() {
        CrmLead lead = privateLead();
        lead.setConvertedCustomerId(88L);
        CrmCustomer customer = new CrmCustomer();
        customer.setId(88L);
        customer.setName("杭州示例科技有限公司");
        customer.setOwnerId(7L);
        customer.setDeptId(3L);
        when(leadMapper.selectById(11L)).thenReturn(lead);
        when(customerMapper.selectById(88L)).thenReturn(customer);
        when(dataScopeHelper.canAccess(7L, 3L)).thenReturn(true);

        CrmOpportunity opportunity = new CrmOpportunity();
        opportunity.setId(41L);
        opportunity.setCustomerId(88L);
        opportunity.setName("代理记账续签");
        opportunity.setOwnerId(7L);
        opportunity.setStage(3);
        opportunity.setAmount(new BigDecimal("12000"));
        opportunity.setCreateTime(LocalDateTime.of(2026, 7, 1, 9, 0));
        when(opportunityMapper.selectList(any())).thenReturn(List.of(opportunity));

        BizOrder order = new BizOrder();
        order.setId(51L);
        order.setCustomerId(88L);
        order.setSalesmanId(7L);
        order.setDeptId(3L);
        order.setOrderNo("DD202607001");
        order.setStatus(5);
        order.setPayableAmount(new BigDecimal("9600"));
        order.setCreateTime(LocalDateTime.of(2026, 7, 2, 9, 0));
        when(orderMapper.selectList(any())).thenReturn(List.of(order));

        BizReceipt receipt = new BizReceipt();
        receipt.setId(61L);
        receipt.setCustomerId(88L);
        receipt.setSalesmanId(7L);
        receipt.setDeptId(3L);
        receipt.setStatus(2);
        receipt.setAmount(new BigDecimal("4000"));
        receipt.setReceiveTime(LocalDateTime.of(2026, 7, 3, 9, 0));
        when(receiptMapper.selectList(any())).thenReturn(List.of(receipt));

        FinReceivableRenewal receivable = new FinReceivableRenewal();
        receivable.setId(71L);
        receivable.setCustomerId(88L);
        receivable.setCollectorId(7L);
        receivable.setCollectorDeptId(3L);
        receivable.setReceivableAmount(new BigDecimal("9600"));
        receivable.setReceivedAmount(new BigDecimal("4000"));
        receivable.setArrearsAmount(new BigDecimal("5600"));
        receivable.setDueDate(LocalDate.of(2026, 7, 10));
        when(receivableRenewalMapper.selectList(any())).thenReturn(List.of(receivable));

        CrmCustomerIssue issue = new CrmCustomerIssue();
        issue.setId(81L);
        issue.setCustomerId(88L);
        issue.setOwnerId(7L);
        issue.setDeptId(3L);
        issue.setStatus("processing");
        issue.setCreateTime(LocalDateTime.of(2026, 7, 4, 9, 0));
        when(customerIssueMapper.selectList(any())).thenReturn(List.of(issue));

        CrmCustomer360VO result = service.getByLeadId(11L);

        assertEquals(1, result.getStats().getOpportunityCount());
        assertEquals(1, result.getStats().getOrderCount());
        assertEquals(new BigDecimal("4000"), result.getStats().getReceivedAmount());
        assertEquals(new BigDecimal("5600"), result.getStats().getArrearsAmount());
        assertEquals(3, result.getTransactions().size());
        assertEquals(1, result.getServices().size());
        verify(dataScopeHelper).applyByVisibleUsers(any(), any());
        verify(dataScopeHelper, times(4)).applyFinancial(any(), any(), any());
        verify(dataScopeHelper).apply(any(), any(), any());
    }

    @Test
    void convertedLeadUsesFormalCustomerOwnerAndLatestCustomerFollow() {
        CrmLead lead = privateLead();
        lead.setConvertedCustomerId(88L);
        lead.setStatus(3);
        lead.setNextActionTime(LocalDateTime.of(2026, 7, 10, 10, 0));
        lead.setLastFollowContent("线索阶段旧记录");
        CrmCustomer customer = new CrmCustomer();
        customer.setId(88L);
        customer.setName("杭州正式客户有限公司");
        customer.setOwnerId(8L);
        customer.setDeptId(4L);
        customer.setCreateTime(LocalDateTime.of(2026, 7, 1, 9, 0));
        when(leadMapper.selectById(11L)).thenReturn(lead);
        when(customerMapper.selectById(88L)).thenReturn(customer);
        when(dataScopeHelper.canAccess(7L, 3L)).thenReturn(true);
        when(dataScopeHelper.canAccess(8L, 4L)).thenReturn(true);
        when(dataScopeHelper.resolveUserNames(any())).thenReturn(Map.of(7L, "原线索负责人", 8L, "客户负责人"));

        CrmFollow follow = new CrmFollow();
        follow.setId(19L);
        follow.setCustomerId(88L);
        follow.setContent("客户阶段最新记录");
        follow.setNextContent("明天确认续费合同");
        follow.setNextTime(LocalDateTime.of(2026, 7, 15, 10, 0));
        follow.setCreateTime(LocalDateTime.of(2026, 7, 12, 11, 0));
        when(followMapper.selectList(any())).thenReturn(List.of(follow));

        CrmCustomer360VO result = service.getByLeadId(11L);

        assertEquals("客户负责人", result.getOverview().getOwnerName());
        assertEquals("正式客户维护", result.getOverview().getFollowStatus());
        assertEquals("客户阶段最新记录", result.getOverview().getLastFollowContent());
        assertEquals("明天确认续费合同", result.getOverview().getNextActionContent());
        assertEquals(LocalDateTime.of(2026, 7, 15, 10, 0), result.getOverview().getNextActionTime());
    }

    @Test
    void formalCustomerWithoutLeadStillGetsCustomer360AndNextAction() {
        CrmCustomer customer = new CrmCustomer();
        customer.setId(88L);
        customer.setName("杭州正式客户有限公司");
        customer.setOwnerId(7L);
        customer.setDeptId(3L);
        customer.setLevel("A");
        customer.setServicePackage("代理记账");
        customer.setCreateTime(LocalDateTime.of(2026, 7, 1, 9, 0));
        when(customerMapper.selectById(88L)).thenReturn(customer);
        when(dataScopeHelper.canAccess(7L, 3L)).thenReturn(true);
        when(leadMapper.selectOne(any())).thenReturn(null);

        CrmContact contact = new CrmContact();
        contact.setId(18L);
        contact.setCustomerId(88L);
        contact.setName("王经理");
        contact.setMobile("13800000000");
        contact.setIsPrimary(1);
        when(contactMapper.selectList(any())).thenReturn(List.of(contact));

        CrmFollow follow = new CrmFollow();
        follow.setId(19L);
        follow.setCustomerId(88L);
        follow.setContent("客户确认续费");
        follow.setNextContent("发送续费合同");
        follow.setNextTime(LocalDateTime.of(2026, 7, 15, 10, 0));
        follow.setCreateTime(LocalDateTime.of(2026, 7, 12, 11, 0));
        follow.setCreateBy(7L);
        when(followMapper.selectList(any())).thenReturn(List.of(follow));
        when(followMapper.selectCount(any())).thenReturn(1L);

        CrmCustomer360VO result = service.getByCustomerId(88L);

        assertEquals(88L, result.getOverview().getCustomerId());
        assertNull(result.getOverview().getLeadId());
        assertEquals("杭州正式客户有限公司", result.getOverview().getCompanyName());
        assertEquals("正式客户维护", result.getOverview().getFollowStatus());
        assertEquals("发送续费合同", result.getOverview().getNextActionContent());
        assertEquals("王经理", result.getOverview().getContactName());
        assertTrue(result.getOverview().isConverted());
        assertTrue(result.getTimeline().stream().noneMatch(item -> "lead".equals(item.getType())));
        assertTrue(result.getTimeline().stream().anyMatch(item -> "conversion".equals(item.getType())
                && "正式客户档案建立".equals(item.getTitle()) && "客户维护".equals(item.getStatus())));
    }

    @Test
    void formalCustomerShortNameDoesNotPretendToBeContact() {
        CrmCustomer customer = new CrmCustomer();
        customer.setId(88L);
        customer.setName("杭州正式客户有限公司");
        customer.setShortName("正式客户");
        customer.setOwnerId(7L);
        customer.setDeptId(3L);
        when(customerMapper.selectById(88L)).thenReturn(customer);
        when(dataScopeHelper.canAccess(7L, 3L)).thenReturn(true);
        when(leadMapper.selectOne(any())).thenReturn(null);

        CrmCustomer360VO result = service.getByCustomerId(88L);

        assertEquals("杭州正式客户有限公司", result.getOverview().getCompanyName());
        assertEquals("", result.getOverview().getContactName());
    }

    @Test
    void formalCustomerUsesCurrentProfileInsteadOfStaleLeadSnapshot() {
        CrmCustomer customer = new CrmCustomer();
        customer.setId(88L);
        customer.setName("杭州当前客户名称有限公司");
        customer.setOwnerId(7L);
        customer.setDeptId(3L);
        when(customerMapper.selectById(88L)).thenReturn(customer);
        when(dataScopeHelper.canAccess(7L, 3L)).thenReturn(true);

        CrmLead oldLead = privateLead();
        oldLead.setCompany("杭州旧线索名称有限公司");
        oldLead.setLegalPerson("旧联系人");
        oldLead.setPhone("13000000000");
        when(leadMapper.selectOne(any())).thenReturn(oldLead);

        CrmContact currentContact = new CrmContact();
        currentContact.setCustomerId(88L);
        currentContact.setName("新联系人");
        currentContact.setMobile("13900000000");
        currentContact.setIsPrimary(1);
        when(contactMapper.selectList(any())).thenReturn(List.of(currentContact));

        CrmCustomer360VO result = service.getByCustomerId(88L);

        assertEquals("杭州当前客户名称有限公司", result.getOverview().getCompanyName());
        assertEquals("新联系人", result.getOverview().getContactName());
        assertEquals("13900000000", result.getOverview().getPhone());
    }

    @Test
    void formalCustomerOutsideScopeIsRejectedBeforeRelatedQueries() {
        CrmCustomer customer = new CrmCustomer();
        customer.setId(88L);
        customer.setOwnerId(99L);
        customer.setDeptId(9L);
        when(customerMapper.selectById(88L)).thenReturn(customer);
        when(dataScopeHelper.canAccess(99L, 9L)).thenReturn(false);

        BusinessException error = assertThrows(BusinessException.class, () -> service.getByCustomerId(88L));

        assertTrue(error.getMessage().contains("无权查看"));
        verify(leadMapper, never()).selectOne(any());
        verify(contactMapper, never()).selectList(any());
    }

    private CrmLead privateLead() {
        CrmLead lead = new CrmLead();
        lead.setId(11L);
        lead.setCompany("杭州示例科技有限公司");
        lead.setPhone("13800000000");
        lead.setOwnerId(7L);
        lead.setOwnerName("销售甲");
        lead.setDeptId(3L);
        lead.setOwnership("private");
        lead.setStatus(2);
        lead.setFollowStatus("需求沟通");
        lead.setCreateTime(LocalDateTime.of(2026, 6, 20, 9, 0));
        return lead;
    }

    private void initTable(Class<?> entityType) {
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new MybatisConfiguration(), ""), entityType);
    }
}
