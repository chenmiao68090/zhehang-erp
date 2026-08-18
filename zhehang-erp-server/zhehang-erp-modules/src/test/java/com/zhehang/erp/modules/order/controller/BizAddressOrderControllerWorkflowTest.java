package com.zhehang.erp.modules.order.controller;

import com.baomidou.mybatisplus.core.MybatisConfiguration;
import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.file.mapper.FileInfoMapper;
import com.zhehang.erp.modules.order.domain.BizAddressOrder;
import com.zhehang.erp.modules.order.mapper.BizAddressOrderMapper;
import com.zhehang.erp.modules.review.domain.dto.ReviewCreateDTO;
import com.zhehang.erp.modules.review.service.OrderReviewService;
import com.zhehang.erp.modules.system.mapper.SysUserMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.apache.ibatis.builder.MapperBuilderAssistant;
import org.mockito.ArgumentCaptor;
import org.mockito.MockedStatic;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class BizAddressOrderControllerWorkflowTest {

    private BizAddressOrderMapper orderMapper;
    private OrderReviewService orderReviewService;
    private BizAddressOrderController controller;

    @BeforeEach
    void setUp() {
        if (TableInfoHelper.getTableInfo(BizAddressOrder.class) == null) {
            TableInfoHelper.initTableInfo(
                    new MapperBuilderAssistant(new MybatisConfiguration(), ""), BizAddressOrder.class);
        }
        orderMapper = mock(BizAddressOrderMapper.class);
        orderReviewService = mock(OrderReviewService.class);
        controller = new BizAddressOrderController(orderMapper, mock(FileInfoMapper.class),
                orderReviewService, mock(SysUserMapper.class));
    }

    @Test
    void newSaveAlwaysCreatesDraftEvenWhenClientForgesPending() {
        BizAddressOrder order = completeDraft();
        order.setStatus("pending");

        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(SecurityUtils::getCurrentUserId).thenReturn(42L);
            R<Long> result = controller.save(order);

            assertThat(result.getCode()).isEqualTo(200);
            assertThat(order.getStatus()).isEqualTo("draft");
            assertThat(order.getCreateBy()).isEqualTo(42L);
            verify(orderMapper).insert(order);
        }
    }

    @Test
    void submittedOrderCannotBeEditedOrDeletedBackIntoDraft() {
        BizAddressOrder existing = completeDraft();
        existing.setId(10L);
        existing.setCreateBy(42L);
        existing.setStatus("pending");
        when(orderMapper.selectById(10L)).thenReturn(existing);

        BizAddressOrder forgedUpdate = completeDraft();
        forgedUpdate.setId(10L);
        forgedUpdate.setStatus("draft");

        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(SecurityUtils::getCurrentUserId).thenReturn(42L);

            assertThat(controller.save(forgedUpdate).getCode()).isEqualTo(400);
            assertThat(controller.remove(10L).getCode()).isEqualTo(400);
            verify(orderMapper, never()).updateById(any());
            verify(orderMapper, never()).deleteById(10L);
        }
    }

    @Test
    void submitRejectsIncompleteDraftAndAnotherUsersDraft() {
        BizAddressOrder incomplete = new BizAddressOrder();
        incomplete.setId(10L);
        incomplete.setCreateBy(42L);
        incomplete.setStatus("draft");
        incomplete.setCompanyName("测试企业");
        when(orderMapper.selectById(10L)).thenReturn(incomplete);

        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(SecurityUtils::getCurrentUserId).thenReturn(42L);
            R<Void> missing = controller.submit(10L);
            assertThat(missing.getCode()).isEqualTo(400);
            assertThat(missing.getMessage()).contains("客户来源");

            incomplete.setCreateBy(7L);
            R<Void> foreign = controller.submit(10L);
            assertThat(foreign.getCode()).isEqualTo(403);
            verify(orderMapper, never()).update(isNull(), any());
        }
    }

    @Test
    void completeDraftTransitionsToPendingOnlyThroughSubmitEndpoint() {
        BizAddressOrder draft = completeDraft();
        draft.setId(10L);
        draft.setCreateBy(42L);
        draft.setStatus("draft");
        when(orderMapper.selectById(10L)).thenReturn(draft);

        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(SecurityUtils::getCurrentUserId).thenReturn(42L);
            R<Void> result = controller.submit(10L);

            assertThat(result.getCode()).isEqualTo(200);
            // 源单置 reviewing 由审单中心 activateFromTicket 同事务完成，不在 controller 直接 update
            ArgumentCaptor<ReviewCreateDTO> dtoCaptor = ArgumentCaptor.forClass(ReviewCreateDTO.class);
            verify(orderReviewService).activateFromTicket(dtoCaptor.capture());
            assertThat(dtoCaptor.getValue().getOrderType()).isEqualTo("address");
            assertThat(dtoCaptor.getValue().getOrderId()).isEqualTo(10L);
            assertThat(dtoCaptor.getValue().getCustomerName()).isEqualTo("测试企业");
        }
    }

    private BizAddressOrder completeDraft() {
        BizAddressOrder order = new BizAddressOrder();
        order.setCompanyName("测试企业");
        order.setCustomerSource("老客-续费");
        order.setCompanyAddress("测试地址");
        order.setLegalName("测试法人");
        order.setLegalPhone("13800138000");
        order.setHasRebate(0);
        return order;
    }
}
