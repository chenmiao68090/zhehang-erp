package com.zhehang.erp.modules.task.service;

import com.baomidou.mybatisplus.core.MybatisConfiguration;
import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.contract.domain.BizContract;
import com.zhehang.erp.modules.contract.mapper.BizContractMapper;
import com.zhehang.erp.modules.crm.domain.entity.CrmCustomer;
import com.zhehang.erp.modules.crm.mapper.CrmCustomerMapper;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.im.service.ImBusinessNotificationPublisher;
import com.zhehang.erp.modules.task.domain.BizTask;
import com.zhehang.erp.modules.task.domain.BizTaskHandover;
import com.zhehang.erp.modules.task.domain.BizTaskHandoverItem;
import com.zhehang.erp.modules.task.domain.dto.HandoverCreateDTO;
import com.zhehang.erp.modules.task.domain.dto.HandoverItemUpdateDTO;
import com.zhehang.erp.modules.task.mapper.BizTaskHandoverItemMapper;
import com.zhehang.erp.modules.task.mapper.BizTaskHandoverMapper;
import com.zhehang.erp.modules.task.mapper.BizTaskMapper;
import com.zhehang.erp.modules.task.service.impl.BizTaskServiceImpl;
import com.zhehang.erp.security.domain.LoginUser;
import org.apache.ibatis.builder.MapperBuilderAssistant;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BizTaskHandoverServiceTest {

    @Mock private BizTaskMapper taskMapper;
    @Mock private BizTaskHandoverMapper handoverMapper;
    @Mock private BizTaskHandoverItemMapper handoverItemMapper;
    @Mock private BizContractMapper contractMapper;
    @Mock private CrmCustomerMapper customerMapper;
    @Mock private DataScopeHelper dataScopeHelper;
    @Mock private ImBusinessNotificationPublisher notificationPublisher;

    private BizTaskServiceImpl service;

    @BeforeEach
    void setUp() {
        initTable(BizTask.class);
        initTable(BizTaskHandover.class);
        initTable(BizTaskHandoverItem.class);
        initTable(BizContract.class);
        initTable(CrmCustomer.class);
        loginAs(7L);
        service = new BizTaskServiceImpl(taskMapper, handoverMapper, handoverItemMapper,
                contractMapper, customerMapper, dataScopeHelper, notificationPublisher);
        lenient().when(dataScopeHelper.getVisibleUserIds()).thenReturn(List.of(7L));
        lenient().when(dataScopeHelper.isManagerOrAdmin()).thenReturn(false);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void createsHandoverFromSignedAccessibleContractAndCopiesServerChecklist() {
        BizContract contract = signedContract();
        when(contractMapper.selectOne(any())).thenReturn(contract);
        when(dataScopeHelper.canAccess(7L, 3L)).thenReturn(true);
        when(dataScopeHelper.resolveUserNames(List.of(9L))).thenReturn(Map.of(9L, "会计乙"));
        when(handoverMapper.selectCount(any())).thenReturn(0L);
        when(handoverItemMapper.selectList(any())).thenReturn(List.of(
                templateItem(1, "营业执照", true),
                templateItem(2, "历史账套", true)
        ));
        doAnswer(invocation -> {
            BizTaskHandover handover = invocation.getArgument(0);
            handover.setId(101L);
            return 1;
        }).when(handoverMapper).insert(any(BizTaskHandover.class));

        HandoverCreateDTO dto = createDto();
        Long id = service.createHandover(dto);

        assertThat(id).isEqualTo(101L);
        ArgumentCaptor<BizTaskHandover> handoverCaptor = ArgumentCaptor.forClass(BizTaskHandover.class);
        verify(handoverMapper).insert(handoverCaptor.capture());
        BizTaskHandover saved = handoverCaptor.getValue();
        assertThat(saved.getContractId()).isEqualTo(21L);
        assertThat(saved.getCustomerId()).isEqualTo(31L);
        assertThat(saved.getSalesId()).isEqualTo(7L);
        assertThat(saved.getAccountantId()).isEqualTo(9L);
        assertThat(saved.getStatus()).isEqualTo("pending");
        assertThat(saved.getNote()).isEqualTo("需核对历史账套");
        verify(handoverItemMapper, times(2)).insert(any(BizTaskHandoverItem.class));
        ArgumentCaptor<ImBusinessNotificationPublisher.Notice> notice =
                ArgumentCaptor.forClass(ImBusinessNotificationPublisher.Notice.class);
        verify(notificationPublisher).publish(notice.capture());
        assertThat(notice.getValue().getEventId()).isEqualTo("handover:101:created");
        assertThat(notice.getValue().getActionUrl()).isEqualTo("/business-handover?handoverId=101");
    }

    @Test
    void outboxFailureEscapesForHandoverTransactionRollback() {
        when(contractMapper.selectOne(any())).thenReturn(signedContract());
        when(dataScopeHelper.canAccess(7L, 3L)).thenReturn(true);
        when(dataScopeHelper.resolveUserNames(List.of(9L))).thenReturn(Map.of(9L, "会计乙"));
        when(handoverMapper.selectCount(any())).thenReturn(0L);
        when(handoverItemMapper.selectList(any())).thenReturn(List.of());
        doAnswer(invocation -> {
            BizTaskHandover handover = invocation.getArgument(0);
            handover.setId(101L);
            return 1;
        }).when(handoverMapper).insert(any(BizTaskHandover.class));
        doThrow(new IllegalStateException("outbox unavailable"))
                .when(notificationPublisher).publish(any());

        assertThatThrownBy(() -> service.createHandover(createDto()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("outbox unavailable");
    }

    @Test
    void rejectsUnsignedContractBeforeWritingHandover() {
        BizContract contract = signedContract();
        contract.setStatus(3);
        when(contractMapper.selectOne(any())).thenReturn(contract);
        when(dataScopeHelper.canAccess(7L, 3L)).thenReturn(true);

        assertThatThrownBy(() -> service.createHandover(createDto()))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("尚未完成签署");
        verify(handoverMapper, never()).insert(any());
    }

    @Test
    void rejectsDuplicateActiveHandoverForSameContract() {
        when(contractMapper.selectOne(any())).thenReturn(signedContract());
        when(dataScopeHelper.canAccess(7L, 3L)).thenReturn(true);
        when(dataScopeHelper.resolveUserNames(List.of(9L))).thenReturn(Map.of(9L, "会计乙"));
        when(handoverMapper.selectCount(any())).thenReturn(1L);

        assertThatThrownBy(() -> service.createHandover(createDto()))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("请勿重复发起");
        verify(handoverMapper, never()).insert(any());
    }

    @Test
    void allScopeNonManagerCannotInitiateForAnotherSalesperson() {
        loginAs(18L);
        when(contractMapper.selectOne(any())).thenReturn(signedContract());
        when(dataScopeHelper.canAccess(7L, 3L)).thenReturn(true);
        when(dataScopeHelper.isManagerOrAdmin()).thenReturn(false);

        assertThatThrownBy(() -> service.createHandover(createDto()))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("只有合同销售或其管理人员");
        verify(handoverMapper, never()).insert(any());
    }

    @Test
    void receiverCannotConfirmItemBeforeSalesMarksProvided() {
        loginAs(9L);
        when(dataScopeHelper.getVisibleUserIds()).thenReturn(List.of(9L));
        BizTaskHandover handover = activeHandover();
        when(handoverMapper.selectById(101L)).thenReturn(handover);
        BizTaskHandoverItem item = templateItem(1, "营业执照", true);
        item.setId(201L);
        item.setHandoverId(101L);
        item.setSalesStatus("pending_supply");
        when(handoverItemMapper.selectById(201L)).thenReturn(item);

        HandoverItemUpdateDTO dto = new HandoverItemUpdateDTO();
        dto.setItemId(201L);
        dto.setAccountantStatus("confirmed");

        assertThatThrownBy(() -> service.updateHandoverItem(101L, dto))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("尚未标记已提供");
        verify(handoverItemMapper, never()).update(any(), any());
    }

    @Test
    void allScopeNonManagerCannotConfirmForDesignatedReceiver() {
        loginAs(18L);
        when(dataScopeHelper.getVisibleUserIds()).thenReturn(null);
        when(dataScopeHelper.isManagerOrAdmin()).thenReturn(false);
        when(handoverMapper.selectById(101L)).thenReturn(activeHandover());
        BizTaskHandoverItem item = templateItem(1, "营业执照", true);
        item.setId(201L);
        item.setHandoverId(101L);
        item.setSalesStatus("provided");
        when(handoverItemMapper.selectById(201L)).thenReturn(item);

        HandoverItemUpdateDTO dto = new HandoverItemUpdateDTO();
        dto.setItemId(201L);
        dto.setAccountantStatus("confirmed");

        assertThatThrownBy(() -> service.updateHandoverItem(101L, dto))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("只有指定接收人或其主管");
        verify(handoverItemMapper, never()).update(any(), any());
    }

    @Test
    void requiredUnconfirmedItemBlocksCompletion() {
        loginAs(9L);
        when(dataScopeHelper.getVisibleUserIds()).thenReturn(List.of(9L));
        when(handoverMapper.selectById(101L)).thenReturn(activeHandover());
        when(handoverItemMapper.selectCount(any())).thenReturn(1L);

        assertThatThrownBy(() -> service.completeHandover(101L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("必需交接项未验收合格");
        verify(handoverMapper, never()).update(any(), any());
    }

    @Test
    void receiverCompletesWhenEveryRequiredItemIsConfirmed() {
        loginAs(9L);
        when(dataScopeHelper.getVisibleUserIds()).thenReturn(List.of(9L));
        when(handoverMapper.selectById(101L)).thenReturn(activeHandover());
        when(handoverItemMapper.selectCount(any())).thenReturn(0L);

        service.completeHandover(101L);

        verify(handoverMapper).update(any(), any());
    }

    @Test
    void unrelatedUserCannotReadHandoverDetail() {
        when(dataScopeHelper.getVisibleUserIds()).thenReturn(List.of(99L));
        when(handoverMapper.selectById(101L)).thenReturn(activeHandover());

        assertThatThrownBy(() -> service.handoverDetail(101L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("无权查看");
        verify(handoverItemMapper, never()).selectList(any());
    }

    private HandoverCreateDTO createDto() {
        HandoverCreateDTO dto = new HandoverCreateDTO();
        dto.setContractId(21L);
        dto.setAccountantId(9L);
        dto.setDeadline(LocalDate.now().plusDays(3));
        dto.setNote("  需核对历史账套  ");
        return dto;
    }

    private BizContract signedContract() {
        BizContract contract = new BizContract();
        contract.setId(21L);
        contract.setCustomerId(31L);
        contract.setSalesmanId(7L);
        contract.setDeptId(3L);
        contract.setStatus(4);
        return contract;
    }

    private BizTaskHandover activeHandover() {
        BizTaskHandover handover = new BizTaskHandover();
        handover.setId(101L);
        handover.setSalesId(7L);
        handover.setAccountantId(9L);
        handover.setStatus("in_progress");
        return handover;
    }

    private BizTaskHandoverItem templateItem(int order, String name, boolean required) {
        BizTaskHandoverItem item = new BizTaskHandoverItem();
        item.setItemOrder(order);
        item.setItemName(name);
        item.setIsRequired(required ? 1 : 0);
        item.setDescription("验收标准");
        return item;
    }

    private void loginAs(Long userId) {
        LoginUser user = new LoginUser();
        user.setUserId(userId);
        user.setTenantId(1L);
        user.setUsername("user-" + userId);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(user, null, List.of()));
    }

    private static void initTable(Class<?> entityClass) {
        if (TableInfoHelper.getTableInfo(entityClass) != null) {
            return;
        }
        MybatisConfiguration configuration = new MybatisConfiguration();
        MapperBuilderAssistant assistant = new MapperBuilderAssistant(configuration, entityClass.getName());
        assistant.setCurrentNamespace(entityClass.getName());
        TableInfoHelper.initTableInfo(assistant, entityClass);
    }
}
