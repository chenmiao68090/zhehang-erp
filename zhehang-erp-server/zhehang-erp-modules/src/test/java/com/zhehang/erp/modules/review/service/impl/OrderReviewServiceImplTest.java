package com.zhehang.erp.modules.review.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.file.domain.entity.FileInfo;
import com.zhehang.erp.modules.file.service.IFileInfoService;
import com.zhehang.erp.modules.order.domain.BizOrder;
import com.zhehang.erp.modules.order.domain.BizOrderApproval;
import com.zhehang.erp.modules.order.mapper.BizOrderApprovalMapper;
import com.zhehang.erp.modules.review.constant.ReviewConst;
import com.zhehang.erp.modules.review.domain.dto.ReviewActionDTO;
import com.zhehang.erp.modules.review.domain.entity.OrderReview;
import com.zhehang.erp.modules.review.domain.entity.OrderReviewAccept;
import com.zhehang.erp.modules.review.domain.entity.OrderReviewComplete;
import com.zhehang.erp.modules.review.domain.entity.OrderReviewContract;
import com.zhehang.erp.modules.review.domain.entity.OrderReviewPayment;
import com.zhehang.erp.modules.review.domain.entity.OrderReviewRecord;
import com.zhehang.erp.modules.review.mapper.OrderReviewAcceptMapper;
import com.zhehang.erp.modules.review.mapper.OrderReviewCompleteMapper;
import com.zhehang.erp.modules.review.mapper.OrderReviewContractMapper;
import com.zhehang.erp.modules.review.mapper.OrderReviewMapper;
import com.zhehang.erp.modules.review.mapper.OrderReviewPaymentMapper;
import com.zhehang.erp.modules.review.mapper.OrderReviewRecordMapper;
import com.zhehang.erp.modules.review.service.ReviewImNotificationService;
import com.zhehang.erp.modules.system.domain.entity.SysUser;
import com.zhehang.erp.modules.system.mapper.SysUserMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.MockedStatic;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class OrderReviewServiceImplTest {
    private OrderReviewMapper reviewMapper;
    private OrderReviewRecordMapper recordMapper;
    private OrderReviewContractMapper contractMapper;
    private OrderReviewPaymentMapper paymentMapper;
    private OrderReviewAcceptMapper acceptMapper;
    private OrderReviewCompleteMapper completeMapper;
    private BizOrderApprovalMapper approvalMapper;
    private SysUserMapper userMapper;
    private DataScopeHelper dataScopeHelper;
    private IFileInfoService fileInfoService;
    private ReviewImNotificationService notificationService;
    private ObjectMapper objectMapper;
    private OrderReviewServiceImpl service;

    @BeforeEach
    void setUp() {
        reviewMapper = mock(OrderReviewMapper.class);
        recordMapper = mock(OrderReviewRecordMapper.class);
        contractMapper = mock(OrderReviewContractMapper.class);
        paymentMapper = mock(OrderReviewPaymentMapper.class);
        acceptMapper = mock(OrderReviewAcceptMapper.class);
        completeMapper = mock(OrderReviewCompleteMapper.class);
        approvalMapper = mock(BizOrderApprovalMapper.class);
        userMapper = mock(SysUserMapper.class);
        dataScopeHelper = mock(DataScopeHelper.class);
        fileInfoService = mock(IFileInfoService.class);
        notificationService = mock(ReviewImNotificationService.class);
        objectMapper = new ObjectMapper();
        service = new OrderReviewServiceImpl(reviewMapper, recordMapper, contractMapper,
                paymentMapper, acceptMapper, completeMapper, approvalMapper,
                mock(com.zhehang.erp.modules.order.mapper.BizAddressOrderMapper.class),
                mock(com.zhehang.erp.modules.order.mapper.BizBookkeepingOrderMapper.class),
                mock(com.zhehang.erp.modules.order.mapper.BizRenewalOrderMapper.class),
                userMapper, dataScopeHelper, fileInfoService, objectMapper, notificationService);
        when(dataScopeHelper.resolveUserNames(any())).thenAnswer(invocation -> {
            List<Long> ids = invocation.getArgument(0);
            return ids.stream().collect(java.util.stream.Collectors.toMap(id -> id, id -> "用户" + id));
        });
    }

    @Test
    void financeConfirmationCreatesReviewAndHistoricalNodeSnapshots() {
        AtomicLong recordIds = new AtomicLong(700L);
        doAnswer(invocation -> {
            OrderReview review = invocation.getArgument(0);
            review.setId(100L);
            return 1;
        }).when(reviewMapper).insert(any());
        doAnswer(invocation -> {
            OrderReviewRecord record = invocation.getArgument(0);
            record.setId(recordIds.incrementAndGet());
            return 1;
        }).when(recordMapper).insert(any());
        BizOrderApproval managerApproval = new BizOrderApproval();
        managerApproval.setApproverId(21L);
        managerApproval.setApproverName("销售主管");
        managerApproval.setComment("合同核验通过");
        when(approvalMapper.selectOne(any())).thenReturn(managerApproval);

        Long reviewId = service.activateFromFinanceConfirmed(order(), 30L, 502L, "到账无误");

        assertThat(reviewId).isEqualTo(100L);
        ArgumentCaptor<OrderReview> review = ArgumentCaptor.forClass(OrderReview.class);
        verify(reviewMapper).insert(review.capture());
        assertThat(review.getValue().getReviewStatus()).isEqualTo(ReviewConst.ACCEPT_PENDING);
        assertThat(review.getValue().getReviewNo()).startsWith("SD");
        ArgumentCaptor<OrderReviewContract> contract = ArgumentCaptor.forClass(OrderReviewContract.class);
        verify(contractMapper).insert(contract.capture());
        assertThat(contract.getValue().getReviewResult()).isEqualTo("pass");
        ArgumentCaptor<OrderReviewPayment> payment = ArgumentCaptor.forClass(OrderReviewPayment.class);
        verify(paymentMapper).insert(payment.capture());
        assertThat(payment.getValue().getConfirmerId()).isEqualTo(30L);
        verify(notificationService).notifyTransition(review.getValue(),
                ReviewImNotificationService.ACTIVATED, 702L, 30L, "到账无误");
    }

    @Test
    void managerAssignmentUsesRealUserAndMovesReviewToPendingAccept() {
        OrderReview review = pendingReview();
        when(reviewMapper.selectOne(any())).thenReturn(review);
        when(acceptMapper.selectOne(any())).thenReturn(null);
        SysUser handler = activeUser(40L, 7L);
        when(userMapper.selectById(40L)).thenReturn(handler);
        doAnswer(invocation -> {
            OrderReviewRecord record = invocation.getArgument(0);
            record.setId(801L);
            return 1;
        }).when(recordMapper).insert(any());
        when(dataScopeHelper.isManagerOrAdmin()).thenReturn(true);
        when(dataScopeHelper.canAccess(9L, 5L)).thenReturn(true);
        ReviewActionDTO.AssignHandler request = new ReviewActionDTO.AssignHandler();
        request.setHandlerUserId(40L);
        request.setDeadline(LocalDateTime.now().plusDays(2));
        request.setRemark("两天内完成");

        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(SecurityUtils::isCurrentAdmin).thenReturn(false);
            security.when(() -> SecurityUtils.hasAnyRole("boss")).thenReturn(false);
            security.when(SecurityUtils::getCurrentUserId).thenReturn(21L);
            service.assignHandler(100L, request);
        }

        assertThat(review.getHandlerUserId()).isEqualTo(40L);
        assertThat(review.getReviewStatus()).isEqualTo(ReviewConst.ACCEPT_PENDING);
        ArgumentCaptor<OrderReviewAccept> accept = ArgumentCaptor.forClass(OrderReviewAccept.class);
        verify(acceptMapper).insert(accept.capture());
        assertThat(accept.getValue().getHandlerUserId()).isEqualTo(40L);
        verify(notificationService).notifyTransition(review,
                ReviewImNotificationService.HANDLER_ASSIGNED, 801L, 21L, "两天内完成");
    }

    @Test
    void employeeCannotAcceptReviewAssignedToSomeoneElse() {
        OrderReview review = pendingReview();
        review.setHandlerUserId(40L);
        when(reviewMapper.selectOne(any())).thenReturn(review);
        ReviewActionDTO.Accept request = new ReviewActionDTO.Accept();
        request.setMaterialsReady(true);
        request.setExpectedCompleteTime(LocalDateTime.now().plusDays(1));

        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(SecurityUtils::getCurrentUserId).thenReturn(41L);
            assertThatThrownBy(() -> service.accept(100L, request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("只有被分配的办事人员");
        }

        verify(acceptMapper, never()).updateById(any());
        verify(reviewMapper, never()).updateById(any());
    }

    @Test
    void handlerCannotExtendTheManagersDeadlineWhileAccepting() {
        OrderReview review = pendingReview();
        review.setHandlerUserId(40L);
        review.setDeadline(LocalDateTime.now().plusDays(1));
        when(reviewMapper.selectOne(any())).thenReturn(review);
        ReviewActionDTO.Accept request = new ReviewActionDTO.Accept();
        request.setMaterialsReady(true);
        request.setExpectedCompleteTime(LocalDateTime.now().plusDays(2));

        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(SecurityUtils::getCurrentUserId).thenReturn(40L);
            assertThatThrownBy(() -> service.accept(100L, request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("不能晚于主管设置");
        }

        verify(acceptMapper, never()).updateById(any());
        verify(reviewMapper, never()).updateById(any());
    }

    @Test
    void handlerFromAnotherTenantCannotBeAssigned() {
        OrderReview review = pendingReview();
        when(reviewMapper.selectOne(any())).thenReturn(review);
        when(userMapper.selectById(40L)).thenReturn(activeUser(40L, 8L));
        ReviewActionDTO.AssignHandler request = new ReviewActionDTO.AssignHandler();
        request.setHandlerUserId(40L);
        request.setDeadline(LocalDateTime.now().plusDays(1));

        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(SecurityUtils::isCurrentAdmin).thenReturn(true);
            assertThatThrownBy(() -> service.assignHandler(100L, request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("不属于当前公司");
        }

        verify(acceptMapper, never()).insert(any());
    }

    @Test
    void completionEvidenceUsesServerFileMetadataInsteadOfClientSnapshot() throws Exception {
        OrderReview review = pendingReview();
        review.setHandlerUserId(40L);
        review.setReviewStatus(ReviewConst.PROCESSING);
        when(reviewMapper.selectOne(any())).thenReturn(review);
        when(completeMapper.selectOne(any())).thenReturn(null);
        FileInfo file = new FileInfo();
        file.setId(88L);
        file.setTenantId(7L);
        file.setName("stored-name.pdf");
        file.setOriginalName("真实办理凭证.pdf");
        file.setMimeType("application/pdf");
        file.setFileSize(2048L);
        when(fileInfoService.listByIds(anyCollection())).thenReturn(List.of(file));
        doAnswer(invocation -> {
            OrderReviewRecord record = invocation.getArgument(0);
            record.setId(901L);
            return 1;
        }).when(recordMapper).insert(any());
        ReviewActionDTO.AttachmentRef attachment = new ReviewActionDTO.AttachmentRef();
        attachment.setId(88L);
        attachment.setName("伪造文件名.exe");
        attachment.setMimeType("application/x-msdownload");
        attachment.setSize(1L);
        ReviewActionDTO.SubmitComplete request = new ReviewActionDTO.SubmitComplete();
        request.setResultDesc("工商变更已办结");
        request.setAttachments(List.of(attachment));

        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(SecurityUtils::getCurrentUserId).thenReturn(40L);
            service.submitComplete(100L, request);
        }

        ArgumentCaptor<OrderReviewComplete> complete = ArgumentCaptor.forClass(OrderReviewComplete.class);
        verify(completeMapper).insert(complete.capture());
        JsonNode snapshot = objectMapper.readTree(complete.getValue().getCompleteVoucher()).get(0);
        assertThat(snapshot.get("name").asText()).isEqualTo("真实办理凭证.pdf");
        assertThat(snapshot.get("mimeType").asText()).isEqualTo("application/pdf");
        assertThat(snapshot.get("size").asLong()).isEqualTo(2048L);
        assertThat(review.getReviewStatus()).isEqualTo(ReviewConst.COMPLETE_PENDING);
        verify(notificationService).notifyTransition(review,
                ReviewImNotificationService.COMPLETE_SUBMITTED, 901L, 40L, null);
    }

    @Test
    void attachmentDownloadRequiresBothReviewAccessAndARecordedFileLink() {
        OrderReview review = pendingReview();
        OrderReviewComplete complete = new OrderReviewComplete();
        complete.setReviewId(100L);
        complete.setCompleteVoucher("[{\"id\":88,\"name\":\"凭证.pdf\"}]");
        when(reviewMapper.selectOne(any())).thenReturn(review);
        when(completeMapper.selectOne(any())).thenReturn(complete);
        when(fileInfoService.downloadFile(88L)).thenReturn(Map.of(
                "filePath", "/tmp/evidence.pdf", "fileName", "凭证.pdf"));

        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(SecurityUtils::getCurrentUserId).thenReturn(9L);
            assertThat(service.downloadAttachment(100L, 88L))
                    .containsEntry("fileName", "凭证.pdf");
            assertThatThrownBy(() -> service.downloadAttachment(100L, 99L))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("不属于当前审单");
        }

        verify(fileInfoService).downloadFile(88L);
        verify(fileInfoService, never()).downloadFile(99L);
    }

    @Test
    void oversizedEvidenceIsRejectedEvenWhenTheClientBypassesThePage() {
        OrderReview review = pendingReview();
        review.setHandlerUserId(40L);
        review.setReviewStatus(ReviewConst.PROCESSING);
        when(reviewMapper.selectOne(any())).thenReturn(review);
        FileInfo file = new FileInfo();
        file.setId(89L);
        file.setTenantId(7L);
        file.setOriginalName("超大凭证.pdf");
        file.setMimeType("application/pdf");
        file.setFileSize(21L * 1024L * 1024L);
        when(fileInfoService.listByIds(anyCollection())).thenReturn(List.of(file));
        ReviewActionDTO.AttachmentRef attachment = new ReviewActionDTO.AttachmentRef();
        attachment.setId(89L);
        attachment.setName("超大凭证.pdf");
        ReviewActionDTO.SubmitComplete request = new ReviewActionDTO.SubmitComplete();
        request.setResultDesc("已办理");
        request.setAttachments(List.of(attachment));

        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(SecurityUtils::getCurrentUserId).thenReturn(40L);
            assertThatThrownBy(() -> service.submitComplete(100L, request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("不能超过20MB");
        }

        verify(completeMapper, never()).insert(any());
        verify(reviewMapper, never()).updateById(any());
    }

    private BizOrder order() {
        BizOrder order = new BizOrder();
        order.setId(10L);
        order.setTenantId(7L);
        order.setOrderNo("ORD-20260712-10");
        order.setCustomerId(18L);
        order.setCustomerName("示例客户");
        order.setServiceType("bookkeeping");
        order.setPayableAmount(new BigDecimal("9800.00"));
        order.setSalesmanId(9L);
        order.setSalesmanName("销售甲");
        order.setDeptId(5L);
        order.setCreateBy(9L);
        order.setAttachments("[]");
        return order;
    }

    private OrderReview pendingReview() {
        OrderReview review = new OrderReview();
        review.setId(100L);
        review.setTenantId(7L);
        review.setOrderType("order");
        review.setOrderId(10L);
        review.setReviewNo("SD202607120000100");
        review.setCustomerName("示例客户");
        review.setSalesUserId(9L);
        review.setDeptId(5L);
        review.setCurrentNode(ReviewConst.NODE_ACCEPT);
        review.setReviewStatus(ReviewConst.ACCEPT_PENDING);
        return review;
    }

    private SysUser activeUser(Long id, Long tenantId) {
        SysUser user = new SysUser();
        user.setId(id);
        user.setTenantId(tenantId);
        user.setStatus(0);
        user.setNickname("办事员");
        user.setDeptId(6L);
        return user;
    }
}
