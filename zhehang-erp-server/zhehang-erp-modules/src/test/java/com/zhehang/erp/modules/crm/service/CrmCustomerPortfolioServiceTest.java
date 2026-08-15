package com.zhehang.erp.modules.crm.service;

import com.baomidou.mybatisplus.core.MybatisConfiguration;
import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.contract.domain.BizContract;
import com.zhehang.erp.modules.contract.mapper.BizContractMapper;
import com.zhehang.erp.modules.crm.domain.dto.CrmCustomerFollowDTO;
import com.zhehang.erp.modules.crm.domain.entity.CrmContact;
import com.zhehang.erp.modules.crm.domain.entity.CrmCustomer;
import com.zhehang.erp.modules.crm.domain.entity.CrmFollow;
import com.zhehang.erp.modules.crm.domain.entity.CrmLead;
import com.zhehang.erp.modules.crm.domain.vo.CrmCustomerPortfolioPageVO;
import com.zhehang.erp.modules.crm.domain.vo.CrmCustomerPortfolioVO;
import com.zhehang.erp.modules.crm.mapper.CrmContactMapper;
import com.zhehang.erp.modules.crm.mapper.CrmCustomerMapper;
import com.zhehang.erp.modules.crm.mapper.CrmFollowMapper;
import com.zhehang.erp.modules.crm.mapper.CrmLeadMapper;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.finance.domain.entity.FinReceivableRenewal;
import com.zhehang.erp.modules.finance.mapper.FinReceivableRenewalMapper;
import com.zhehang.erp.modules.task.domain.BizTaskHandover;
import com.zhehang.erp.modules.task.mapper.BizTaskHandoverMapper;
import org.apache.ibatis.builder.MapperBuilderAssistant;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CrmCustomerPortfolioServiceTest {

    @Mock private CrmCustomerMapper customerMapper;
    @Mock private CrmContactMapper contactMapper;
    @Mock private CrmLeadMapper leadMapper;
    @Mock private CrmFollowMapper followMapper;
    @Mock private BizContractMapper contractMapper;
    @Mock private BizTaskHandoverMapper handoverMapper;
    @Mock private FinReceivableRenewalMapper receivableMapper;
    @Mock private DataScopeHelper dataScopeHelper;

    private CrmCustomerPortfolioService service;

    @BeforeEach
    void setUp() {
        initTable(CrmCustomer.class);
        initTable(CrmContact.class);
        initTable(CrmLead.class);
        initTable(CrmFollow.class);
        initTable(BizContract.class);
        initTable(BizTaskHandover.class);
        initTable(FinReceivableRenewal.class);

        service = new CrmCustomerPortfolioService(customerMapper, contactMapper, leadMapper, followMapper,
                contractMapper, handoverMapper, receivableMapper, dataScopeHelper);
        lenient().when(contactMapper.selectList(any())).thenReturn(List.of());
        lenient().when(leadMapper.selectList(any())).thenReturn(List.of());
        lenient().when(followMapper.selectList(any())).thenReturn(List.of());
        lenient().when(contractMapper.selectList(any())).thenReturn(List.of());
        lenient().when(handoverMapper.selectList(any())).thenReturn(List.of());
        lenient().when(receivableMapper.selectList(any())).thenReturn(List.of());
        lenient().when(dataScopeHelper.resolveUserNames(any())).thenReturn(Map.of(7L, "销售甲"));
    }

    @Test
    void portfolioAggregatesFollowContractHandoverAndArrears() {
        CrmCustomer customer = customer(88L, "杭州示例科技有限公司");
        when(customerMapper.selectList(any())).thenReturn(List.of(customer));

        CrmContact contact = new CrmContact();
        contact.setId(10L);
        contact.setCustomerId(88L);
        contact.setName("王经理");
        contact.setMobile("13800000000");
        contact.setIsPrimary(1);
        when(contactMapper.selectList(any())).thenReturn(List.of(contact));

        CrmLead lead = new CrmLead();
        lead.setId(11L);
        lead.setConvertedCustomerId(88L);
        when(leadMapper.selectList(any())).thenReturn(List.of(lead));

        CrmFollow follow = new CrmFollow();
        follow.setId(12L);
        follow.setCustomerId(88L);
        follow.setContent("客户确认续费范围");
        follow.setNextContent("发送续费合同并确认付款日期");
        follow.setNextTime(LocalDateTime.now().minusHours(2));
        follow.setCreateTime(LocalDateTime.now().minusDays(1));
        when(followMapper.selectList(any())).thenReturn(List.of(follow));

        BizContract contract = new BizContract();
        contract.setId(13L);
        contract.setCustomerId(88L);
        contract.setContractNo("HT202607001");
        contract.setStatus(5);
        contract.setEndDate(LocalDate.now().plusMonths(1));
        when(contractMapper.selectList(any())).thenReturn(List.of(contract));

        BizTaskHandover handover = new BizTaskHandover();
        handover.setId(14L);
        handover.setCustomerId(88L);
        handover.setHandoverNo("HOV202607001");
        handover.setStatus("in_progress");
        handover.setDeadline(LocalDate.now().plusDays(2));
        when(handoverMapper.selectList(any())).thenReturn(List.of(handover));

        FinReceivableRenewal receivable = new FinReceivableRenewal();
        receivable.setId(15L);
        receivable.setCustomerId(88L);
        receivable.setArrearsAmount(new BigDecimal("3200"));
        receivable.setDueDate(LocalDate.now().minusDays(3));
        receivable.setCollectionStatus("坏账风险");
        when(receivableMapper.selectList(any())).thenReturn(List.of(receivable));

        CrmCustomerPortfolioPageVO result = service.page(1, 20, null, null, null,
                null, null, "all");

        assertEquals(1, result.getTotal());
        CrmCustomerPortfolioVO row = result.getRecords().get(0);
        assertEquals("王经理", row.getContactName());
        assertEquals("销售甲", row.getOwnerName());
        assertEquals(11L, row.getLeadId());
        assertTrue(row.getFollowOverdue());
        assertEquals("HT202607001", row.getLatestContractNo());
        assertEquals("in_progress", row.getHandoverStatus());
        assertEquals(new BigDecimal("3200"), row.getArrearsAmount());
        assertTrue(row.getBadDebtRisk());
        assertEquals(1, result.getStats().getOverdue());
        assertEquals(1, result.getStats().getHandoverPending());
        assertEquals(1, result.getStats().getArrearsCustomers());
        verify(dataScopeHelper).apply(any(), any(), any());
        verify(dataScopeHelper, times(2)).applyFinancial(any(), any(), any());
    }

    @Test
    void attentionAndKeywordFilterUseEnrichedCustomerData() {
        CrmCustomer first = customer(88L, "杭州甲公司");
        CrmCustomer second = customer(89L, "杭州乙公司");
        when(customerMapper.selectList(any())).thenReturn(List.of(first, second));

        CrmContact contact = new CrmContact();
        contact.setCustomerId(89L);
        contact.setName("周负责人");
        contact.setMobile("13900000000");
        when(contactMapper.selectList(any())).thenReturn(List.of(contact));

        CrmFollow overdue = new CrmFollow();
        overdue.setCustomerId(89L);
        overdue.setNextTime(LocalDateTime.now().minusMinutes(5));
        overdue.setCreateTime(LocalDateTime.now().minusDays(1));
        when(followMapper.selectList(any())).thenReturn(List.of(overdue));

        CrmCustomerPortfolioPageVO result = service.page(1, 20, "1390000", null,
                null, null, null, "overdue");

        assertEquals(1, result.getTotal());
        assertEquals(89L, result.getRecords().get(0).getId());
        assertEquals(1, result.getStats().getOverdue());
    }

    @Test
    void addFollowPersistsCustomerTaskAndLevel() {
        CrmCustomer customer = customer(88L, "杭州示例科技有限公司");
        customer.setLevel("B");
        when(customerMapper.selectById(88L)).thenReturn(customer);
        when(dataScopeHelper.canAccess(7L, 3L)).thenReturn(true);

        CrmCustomerFollowDTO dto = new CrmCustomerFollowDTO();
        dto.setType(2);
        dto.setContent("客户确认继续合作");
        dto.setNextTime(LocalDateTime.now().plusDays(1));
        dto.setNextContent("发送续费方案并电话确认");
        dto.setCustomerLevel("A");

        service.addFollow(88L, dto);

        ArgumentCaptor<CrmFollow> followCaptor = ArgumentCaptor.forClass(CrmFollow.class);
        verify(followMapper).insert(followCaptor.capture());
        assertEquals(88L, followCaptor.getValue().getCustomerId());
        assertEquals("发送续费方案并电话确认", followCaptor.getValue().getNextContent());
        ArgumentCaptor<CrmCustomer> customerCaptor = ArgumentCaptor.forClass(CrmCustomer.class);
        verify(customerMapper).updateById(customerCaptor.capture());
        assertEquals("A", customerCaptor.getValue().getLevel());
    }

    @Test
    void addFollowRejectsCustomerOutsideDataScope() {
        CrmCustomer customer = customer(88L, "杭州示例科技有限公司");
        when(customerMapper.selectById(88L)).thenReturn(customer);
        when(dataScopeHelper.canAccess(7L, 3L)).thenReturn(false);

        CrmCustomerFollowDTO dto = validFollow();
        BusinessException error = assertThrows(BusinessException.class, () -> service.addFollow(88L, dto));

        assertTrue(error.getMessage().contains("无权"));
        verify(followMapper, never()).insert(any());
    }

    @Test
    void addFollowRejectsDisabledCustomer() {
        CrmCustomer customer = customer(88L, "杭州示例科技有限公司");
        customer.setStatus(1);
        when(customerMapper.selectById(88L)).thenReturn(customer);
        when(dataScopeHelper.canAccess(7L, 3L)).thenReturn(true);

        BusinessException error = assertThrows(BusinessException.class,
                () -> service.addFollow(88L, validFollow()));

        assertTrue(error.getMessage().contains("停用客户"));
        verify(followMapper, never()).insert(any());
    }

    @Test
    void addFollowRequiresConcreteNextAction() {
        CrmCustomerFollowDTO dto = validFollow();
        dto.setNextContent(" ");

        BusinessException error = assertThrows(BusinessException.class, () -> service.addFollow(88L, dto));

        assertTrue(error.getMessage().contains("下一步"));
        verify(customerMapper, never()).selectById(any());
    }

    private CrmCustomer customer(Long id, String name) {
        CrmCustomer customer = new CrmCustomer();
        customer.setId(id);
        customer.setName(name);
        customer.setStatus(0);
        customer.setOwnerId(7L);
        customer.setDeptId(3L);
        customer.setLevel("B");
        customer.setServicePackage("代理记账");
        customer.setCreateTime(LocalDateTime.now().minusMonths(1));
        return customer;
    }

    private CrmCustomerFollowDTO validFollow() {
        CrmCustomerFollowDTO dto = new CrmCustomerFollowDTO();
        dto.setType(1);
        dto.setContent("正常沟通");
        dto.setNextTime(LocalDateTime.now().plusDays(1));
        dto.setNextContent("明天再次联系");
        return dto;
    }

    private void initTable(Class<?> entityType) {
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new MybatisConfiguration(), ""), entityType);
    }
}
