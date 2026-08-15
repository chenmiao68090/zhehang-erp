package com.zhehang.erp.modules.order.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.file.domain.entity.FileInfo;
import com.zhehang.erp.modules.file.mapper.FileInfoMapper;
import com.zhehang.erp.modules.order.domain.BizAddressOrder;
import com.zhehang.erp.modules.order.mapper.BizAddressOrderMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class BizAddressOrderControllerRebateTest {

    private BizAddressOrderMapper orderMapper;
    private FileInfoMapper fileInfoMapper;
    private BizAddressOrderController controller;

    @BeforeEach
    void setUp() {
        orderMapper = mock(BizAddressOrderMapper.class);
        fileInfoMapper = mock(FileInfoMapper.class);
        controller = new BizAddressOrderController(orderMapper, fileInfoMapper,
                mock(com.zhehang.erp.modules.review.service.OrderReviewService.class),
                mock(com.zhehang.erp.modules.system.mapper.SysUserMapper.class));
    }

    @Test
    void noRebateClearsForgedRecipientAndQrBeforeInsert() {
        BizAddressOrder order = new BizAddressOrder();
        order.setCompanyName("测试企业");
        order.setHasRebate(0);
        order.setRebateRecipient("不应保留");
        order.setRebateAlipayQrFileId(99L);

        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(SecurityUtils::getCurrentUserId).thenReturn(42L);
            R<Long> result = controller.save(order);

            assertThat(result.getCode()).isEqualTo(200);
            assertThat(order.getHasRebate()).isZero();
            assertThat(order.getRebateRecipient()).isNull();
            assertThat(order.getRebateAlipayQrFileId()).isNull();
            verify(orderMapper).insert(order);
            verify(fileInfoMapper, never()).selectById(any());
        }
    }

    @Test
    void draftMayTemporarilyKeepIncompleteRebateDetails() {
        BizAddressOrder order = new BizAddressOrder();
        order.setCompanyName("测试企业");
        order.setHasRebate(1);

        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(SecurityUtils::getCurrentUserId).thenReturn(42L);
            R<Long> draft = controller.save(order);
            assertThat(draft.getCode()).isEqualTo(200);
            assertThat(order.getStatus()).isEqualTo("draft");
            verify(orderMapper).insert(order);
        }
    }

    @Test
    void incompleteRebateDraftCannotBeSubmitted() {
        BizAddressOrder order = new BizAddressOrder();
        order.setId(10L);
        order.setCreateBy(42L);
        order.setStatus("draft");
        order.setCompanyName("测试企业");
        order.setCustomerSource("老客-续费");
        order.setCompanyAddress("测试地址");
        order.setLegalName("测试法人");
        order.setLegalPhone("13800138000");
        order.setHasRebate(1);
        when(orderMapper.selectById(10L)).thenReturn(order);

        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(SecurityUtils::getCurrentUserId).thenReturn(42L);
            R<Void> result = controller.submit(10L);
            assertThat(result.getCode()).isEqualTo(400);
            assertThat(result.getMessage()).contains("返款对象");
            verify(orderMapper, never()).update(any(), any());
        }
    }

    @Test
    void rebateRejectsAnotherUsersFileAndUnsupportedFileType() {
        BizAddressOrder order = rebateOrder();
        FileInfo anotherUsersFile = file(99L, "png");
        when(fileInfoMapper.selectById(88L)).thenReturn(anotherUsersFile);

        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(SecurityUtils::getCurrentUserId).thenReturn(42L);
            R<Long> foreign = controller.save(order);
            assertThat(foreign.getCode()).isEqualTo(400);
            assertThat(foreign.getMessage()).contains("当前操作人上传");

            FileInfo badType = file(42L, "zip");
            when(fileInfoMapper.selectById(88L)).thenReturn(badType);
            R<Long> unsupported = controller.save(order);
            assertThat(unsupported.getCode()).isEqualTo(400);
            assertThat(unsupported.getMessage()).contains("JPG");
            verify(orderMapper, never()).insert(any());
        }
    }

    @Test
    void validRebateNormalizesRecipientAndPersistsOnlyFileReference() {
        BizAddressOrder order = rebateOrder();
        when(fileInfoMapper.selectById(88L)).thenReturn(file(42L, "png"));

        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(SecurityUtils::getCurrentUserId).thenReturn(42L);
            R<Long> result = controller.save(order);

            assertThat(result.getCode()).isEqualTo(200);
            assertThat(order.getRebateRecipient()).isEqualTo("某收款人");
            assertThat(order.getRebateAlipayQrFileId()).isEqualTo(88L);
            assertThat(order.getCreateBy()).isEqualTo(42L);
            verify(orderMapper).insert(order);
        }
    }

    @Test
    void rebateDetailsAreOwnerOnlyAndSensitiveFieldsStayOutOfGenericJson() throws Exception {
        BizAddressOrder order = rebateOrder();
        order.setId(10L);
        order.setCreateBy(42L);
        when(orderMapper.selectById(10L)).thenReturn(order);

        String genericJson = new ObjectMapper().findAndRegisterModules().writeValueAsString(order);
        assertThat(genericJson).doesNotContain("rebateRecipient", "rebateAlipayQrFileId", "某收款人");

        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(SecurityUtils::getCurrentUserId).thenReturn(7L);
            assertThat(controller.rebate(10L).getCode()).isEqualTo(403);

            security.when(SecurityUtils::getCurrentUserId).thenReturn(42L);
            R<Map<String, Object>> allowed = controller.rebate(10L);
            assertThat(allowed.getCode()).isEqualTo(200);
            assertThat(allowed.getData()).containsEntry("rebateRecipient", "  某收款人  ");
            assertThat(allowed.getData()).containsEntry("rebateAlipayQrFileId", 88L);
        }
    }

    private BizAddressOrder rebateOrder() {
        BizAddressOrder order = new BizAddressOrder();
        order.setCompanyName("测试企业");
        order.setHasRebate(1);
        order.setRebateRecipient("  某收款人  ");
        order.setRebateAlipayQrFileId(88L);
        return order;
    }

    private FileInfo file(Long creator, String type) {
        FileInfo file = new FileInfo();
        file.setId(88L);
        file.setCreateBy(creator);
        file.setFileType(type);
        file.setOriginalName("收款码." + type);
        return file;
    }
}
