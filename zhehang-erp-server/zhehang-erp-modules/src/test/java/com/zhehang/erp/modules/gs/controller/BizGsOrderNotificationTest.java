package com.zhehang.erp.modules.gs.controller;

import com.baomidou.mybatisplus.core.MybatisConfiguration;
import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.gs.domain.BizGsOrder;
import com.zhehang.erp.modules.gs.mapper.BizGsOrderMapper;
import com.zhehang.erp.modules.im.service.ImBusinessNotificationPublisher;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.apache.ibatis.builder.MapperBuilderAssistant;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class BizGsOrderNotificationTest {
    private BizGsOrderMapper orderMapper;
    private DataScopeHelper dataScopeHelper;
    private ImBusinessNotificationPublisher publisher;
    private BizGsOrderController controller;

    @BeforeEach
    void setUp() {
        initTable(BizGsOrder.class);
        orderMapper = mock(BizGsOrderMapper.class);
        dataScopeHelper = mock(DataScopeHelper.class);
        publisher = mock(ImBusinessNotificationPublisher.class);
        controller = new BizGsOrderController(orderMapper, dataScopeHelper, publisher);
        when(dataScopeHelper.isManagerOrAdmin()).thenReturn(true);
    }

    @Test
    void assignmentRegistersDeterministicBusinessEventAndRealLink() {
        when(orderMapper.selectById(10L)).thenReturn(order(10L, null, "pending"));

        controller.assign(Map.of("id", 10L, "assigneeId", 21L, "handler", "办事员甲"));

        ArgumentCaptor<ImBusinessNotificationPublisher.Notice> notice =
                ArgumentCaptor.forClass(ImBusinessNotificationPublisher.Notice.class);
        verify(publisher).publish(notice.capture());
        assertThat(notice.getValue().getEventId()).isEqualTo("gs-order:10:assigned:21:1");
        assertThat(notice.getValue().getEventType()).isEqualTo("gs_order.assigned");
        assertThat(notice.getValue().getRecipientIds()).containsExactly(21L);
        assertThat(notice.getValue().getActionUrl()).isEqualTo("/gs/order");
    }

    @Test
    void repeatedAssignmentToSameHandlerDoesNotWriteOrNotifyAgain() {
        when(orderMapper.selectById(10L)).thenReturn(order(10L, 21L, "processing"));

        controller.assign(Map.of("id", 10L, "assigneeId", 21L));

        verify(orderMapper, never()).update(any(), any());
        verify(publisher, never()).publish(any());
    }

    @Test
    void strictOutboxFailureEscapesForTransactionRollback() {
        when(orderMapper.selectById(10L)).thenReturn(order(10L, null, "pending"));
        doThrow(new IllegalStateException("outbox unavailable")).when(publisher).publish(any());

        assertThatThrownBy(() -> controller.assign(Map.of("id", 10L, "assigneeId", 21L)))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("outbox unavailable");
    }

    private BizGsOrder order(Long id, Long assigneeId, String status) {
        BizGsOrder order = new BizGsOrder();
        order.setId(id);
        order.setAssigneeId(assigneeId);
        order.setStatus(status);
        order.setCompanyName("示例客户");
        return order;
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
