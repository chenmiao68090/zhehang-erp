package com.zhehang.erp.modules.review.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.core.JsonProcessingException;
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
import com.zhehang.erp.modules.order.domain.BizAddressOrder;
import com.zhehang.erp.modules.order.domain.BizBookkeepingOrder;
import com.zhehang.erp.modules.order.domain.BizRenewalOrder;
import com.zhehang.erp.modules.order.mapper.BizAddressOrderMapper;
import com.zhehang.erp.modules.order.mapper.BizBookkeepingOrderMapper;
import com.zhehang.erp.modules.order.mapper.BizRenewalOrderMapper;
import com.zhehang.erp.modules.review.constant.ReviewConst;
import com.zhehang.erp.modules.review.domain.dto.ReviewActionDTO;
import com.zhehang.erp.modules.review.domain.dto.ReviewCreateDTO;
import com.zhehang.erp.modules.review.domain.entity.OrderReview;
import com.zhehang.erp.modules.review.domain.entity.OrderReviewAccept;
import com.zhehang.erp.modules.review.domain.entity.OrderReviewComplete;
import com.zhehang.erp.modules.review.domain.entity.OrderReviewContract;
import com.zhehang.erp.modules.review.domain.entity.OrderReviewPayment;
import com.zhehang.erp.modules.review.domain.entity.OrderReviewRecord;
import com.zhehang.erp.modules.review.domain.vo.OrderReviewDetailVO;
import com.zhehang.erp.modules.review.mapper.OrderReviewAcceptMapper;
import com.zhehang.erp.modules.review.mapper.OrderReviewCompleteMapper;
import com.zhehang.erp.modules.review.mapper.OrderReviewContractMapper;
import com.zhehang.erp.modules.review.mapper.OrderReviewMapper;
import com.zhehang.erp.modules.review.mapper.OrderReviewPaymentMapper;
import com.zhehang.erp.modules.review.mapper.OrderReviewRecordMapper;
import com.zhehang.erp.modules.review.service.OrderReviewService;
import com.zhehang.erp.modules.review.service.ReviewImNotificationService;
import com.zhehang.erp.modules.system.domain.entity.SysUser;
import com.zhehang.erp.modules.system.mapper.SysUserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class OrderReviewServiceImpl implements OrderReviewService {
    private static final DateTimeFormatter REVIEW_DATE = DateTimeFormatter.ofPattern("yyyyMMdd");
    private static final Set<String> TERMINAL = Set.of(ReviewConst.COMPLETED, ReviewConst.VOIDED);
    /** 提单类审核单的 order_type(走真人合同审理/到款确认两节点;"order"保持原财务确认快照链路不受影响)。
     *  注意 biz_order_review.order_type 是 VARCHAR(16),续费用短标识 renewal_addr/renewal_bk。 */
    private static final Set<String> TICKET_TYPES = Set.of(
            "address", "bookkeeping", "renewal_addr", "renewal_bk");
    /** 提单被驳回后允许重新提交复位的审核单状态 */
    private static final Set<String> RESUBMITTABLE = Set.of(
            ReviewConst.CONTRACT_REJECTED, ReviewConst.PAYMENT_REJECTED);
    private static final long MAX_EVIDENCE_SIZE = 20L * 1024L * 1024L;
    private static final Set<String> EVIDENCE_EXTENSIONS = Set.of(
            "jpg", "jpeg", "png", "pdf", "doc", "docx", "xls", "xlsx");

    private final OrderReviewMapper reviewMapper;
    private final OrderReviewRecordMapper recordMapper;
    private final OrderReviewContractMapper contractMapper;
    private final OrderReviewPaymentMapper paymentMapper;
    private final OrderReviewAcceptMapper acceptMapper;
    private final OrderReviewCompleteMapper completeMapper;
    private final BizOrderApprovalMapper approvalMapper;
    private final BizAddressOrderMapper addressOrderMapper;
    private final BizBookkeepingOrderMapper bookkeepingOrderMapper;
    private final BizRenewalOrderMapper renewalOrderMapper;
    private final SysUserMapper userMapper;
    private final DataScopeHelper dataScopeHelper;
    private final IFileInfoService fileInfoService;
    private final ObjectMapper objectMapper;
    private final ReviewImNotificationService notificationService;

    @Override
    public IPage<OrderReview> list(int pageNum, int pageSize, String status, String keyword) {
        int safePage = Math.max(1, pageNum);
        int safeSize = Math.min(100, Math.max(10, pageSize));
        LambdaQueryWrapper<OrderReview> wrapper = new LambdaQueryWrapper<>();
        applyScope(wrapper);
        applyStatus(wrapper, status);
        if (StringUtils.hasText(keyword)) {
            String value = keyword.trim();
            wrapper.and(w -> w.like(OrderReview::getReviewNo, value)
                    .or().like(OrderReview::getOrderNo, value)
                    .or().like(OrderReview::getCustomerName, value)
                    .or().like(OrderReview::getHandlerName, value));
        }
        wrapper.orderByAsc(OrderReview::getDeadline)
                .orderByDesc(OrderReview::getUpdateTime)
                .orderByDesc(OrderReview::getId);
        return reviewMapper.selectPage(new Page<>(safePage, safeSize), wrapper);
    }

    @Override
    public Map<String, Long> stats() {
        Map<String, Long> result = new LinkedHashMap<>();
        result.put("total", countMatching(wrapper -> { }));
        result.put("pendingContract", countMatching(wrapper -> wrapper
                .eq(OrderReview::getReviewStatus, ReviewConst.CONTRACT_PENDING)));
        result.put("pendingPayment", countMatching(wrapper -> wrapper
                .eq(OrderReview::getReviewStatus, ReviewConst.PAYMENT_PENDING)));
        result.put("pendingAssign", countMatching(wrapper -> wrapper
                .eq(OrderReview::getReviewStatus, ReviewConst.ACCEPT_PENDING)
                .isNull(OrderReview::getHandlerUserId)));
        result.put("pendingAccept", countMatching(wrapper -> wrapper
                .eq(OrderReview::getReviewStatus, ReviewConst.ACCEPT_PENDING)
                .isNotNull(OrderReview::getHandlerUserId)));
        result.put("processing", countMatching(wrapper -> wrapper.in(OrderReview::getReviewStatus,
                List.of(ReviewConst.PROCESSING, ReviewConst.COMPLETE_REJECTED))));
        result.put("pendingConfirm", countMatching(wrapper -> wrapper
                .eq(OrderReview::getReviewStatus, ReviewConst.COMPLETE_PENDING)));
        result.put("completed", countMatching(wrapper -> wrapper
                .eq(OrderReview::getReviewStatus, ReviewConst.COMPLETED)));
        result.put("rejected", countMatching(wrapper -> wrapper.in(OrderReview::getReviewStatus,
                List.of(ReviewConst.ACCEPT_REJECTED, ReviewConst.COMPLETE_REJECTED,
                        ReviewConst.CONTRACT_REJECTED, ReviewConst.PAYMENT_REJECTED))));
        result.put("overdue", countMatching(wrapper -> wrapper
                .lt(OrderReview::getDeadline, LocalDateTime.now())
                .notIn(OrderReview::getReviewStatus, TERMINAL)));
        return result;
    }

    @Override
    public OrderReviewDetailVO detail(Long reviewId) {
        OrderReview review = requireReview(reviewId, false);
        requireView(review);
        OrderReviewDetailVO detail = new OrderReviewDetailVO();
        detail.setReview(review);
        detail.setContract(contractMapper.selectOne(byReviewId(OrderReviewContract::getReviewId, reviewId)));
        detail.setPayment(paymentMapper.selectOne(byReviewId(OrderReviewPayment::getReviewId, reviewId)));
        detail.setAccept(acceptMapper.selectOne(byReviewId(OrderReviewAccept::getReviewId, reviewId)));
        detail.setComplete(completeMapper.selectOne(byReviewId(OrderReviewComplete::getReviewId, reviewId)));
        detail.setRecords(recordMapper.selectList(new LambdaQueryWrapper<OrderReviewRecord>()
                .eq(OrderReviewRecord::getReviewId, reviewId)
                .orderByAsc(OrderReviewRecord::getOperatedAt)
                .orderByAsc(OrderReviewRecord::getId)));
        return detail;
    }

    @Override
    public Map<String, Object> downloadAttachment(Long reviewId, Long fileId) {
        if (fileId == null) {
            throw new BusinessException("文件ID不能为空");
        }
        OrderReview review = requireReview(reviewId, false);
        requireView(review);
        OrderReviewComplete complete = completeMapper.selectOne(
                byReviewId(OrderReviewComplete::getReviewId, reviewId));
        OrderReviewContract contract = contractMapper.selectOne(
                byReviewId(OrderReviewContract::getReviewId, reviewId));
        boolean linked = complete != null && snapshotContainsFile(
                complete.getCompleteVoucher(), fileId);
        linked = linked || (contract != null && snapshotContainsFile(
                contract.getContractFile(), fileId));
        if (!linked) {
            throw new BusinessException("该文件不属于当前审单或已失效");
        }
        return fileInfoService.downloadFile(fileId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long activateFromFinanceConfirmed(BizOrder order, Long financeUserId,
                                             Long financeApprovalId, String comment) {
        if (order == null || order.getId() == null) {
            throw new BusinessException("财务确认缺少提单信息");
        }
        OrderReview existing = reviewMapper.selectOne(new LambdaQueryWrapper<OrderReview>()
                .eq(OrderReview::getOrderType, "order")
                .eq(OrderReview::getOrderId, order.getId())
                .last("LIMIT 1"));
        if (existing != null) {
            return existing.getId();
        }
        Long tenantId = order.getTenantId() != null
                ? order.getTenantId() : SecurityUtils.getCurrentTenantId();
        if (tenantId == null) {
            throw new BusinessException("审单缺少公司信息");
        }
        Long actorId = financeUserId != null ? financeUserId : SecurityUtils.getCurrentUserId();
        LocalDateTime now = LocalDateTime.now();
        BigDecimal amount = amount(order);

        OrderReview review = new OrderReview();
        review.setTenantId(tenantId);
        review.setOrderType("order");
        review.setOrderId(order.getId());
        review.setOrderNo(limit(order.getOrderNo(), 64));
        review.setCustomerId(order.getCustomerId());
        review.setCustomerName(limit(order.getCustomerName(), 200));
        review.setBusinessType(limit(order.getServiceType(), 64));
        review.setReceivableAmount(amount);
        review.setReceivedAmount(amount);
        review.setSalesUserId(order.getSalesmanId() != null ? order.getSalesmanId() : order.getCreateBy());
        review.setSalesName(limit(order.getSalesmanName(), 64));
        review.setDeptId(order.getDeptId());
        review.setCurrentNode(ReviewConst.NODE_ACCEPT);
        review.setReviewStatus(ReviewConst.ACCEPT_PENDING);
        review.setSubmittedAt(order.getSubmitTime() != null ? order.getSubmitTime() : now);
        review.setRemark(limit(order.getRemark(), 500));
        reviewMapper.insert(review);
        review.setReviewNo("SD" + REVIEW_DATE.format(LocalDate.now())
                + String.format("%07d", review.getId()));
        reviewMapper.updateById(review);

        BizOrderApproval managerApproval = approvalMapper.selectOne(
                new LambdaQueryWrapper<BizOrderApproval>()
                        .eq(BizOrderApproval::getOrderId, order.getId())
                        .eq(BizOrderApproval::getNode, "approve")
                        .orderByDesc(BizOrderApproval::getId)
                        .last("LIMIT 1"));
        Long managerId = managerApproval == null ? null : managerApproval.getApproverId();
        String managerName = managerApproval == null ? null : managerApproval.getApproverName();
        if (!StringUtils.hasText(managerName)) {
            managerName = userName(managerId);
        }

        OrderReviewContract contract = new OrderReviewContract();
        contract.setTenantId(tenantId);
        contract.setReviewId(review.getId());
        contract.setOrderId(order.getId());
        contract.setCustomerInfoOk(1);
        contract.setBusinessType(limit(order.getServiceType(), 64));
        contract.setContractFile(validJsonSnapshot(order.getAttachments(), 2000));
        contract.setContractAmount(amount);
        contract.setServicePeriod(servicePeriod(order));
        contract.setSalesRemark(limit(order.getRemark(), 500));
        contract.setReviewerId(managerId);
        contract.setReviewerName(limit(managerName, 64));
        contract.setReviewTime(order.getApproveTime());
        contract.setReviewResult("pass");
        contract.setReviewRemark(managerApproval == null ? null : limit(managerApproval.getComment(), 500));
        contractMapper.insert(contract);

        OrderReviewPayment payment = new OrderReviewPayment();
        payment.setTenantId(tenantId);
        payment.setReviewId(review.getId());
        payment.setOrderId(order.getId());
        payment.setReceivableAmount(amount);
        payment.setReceivedAmount(amount);
        payment.setReceivedDate(LocalDate.now());
        payment.setPayer(limit(order.getCustomerName(), 200));
        payment.setConfirmerId(actorId);
        payment.setConfirmerName(limit(userName(actorId), 64));
        payment.setConfirmTime(now);
        payment.setFinanceRemark(limit(comment, 500));
        paymentMapper.insert(payment);

        appendRecord(review, ReviewConst.NODE_CONTRACT, "approve", "pass", managerId,
                managerApproval == null ? null : managerApproval.getComment(), ReviewConst.CONTRACT_PENDING,
                ReviewConst.PAYMENT_PENDING, null);
        Long paymentRecordId = appendRecord(review, ReviewConst.NODE_PAYMENT, "confirm", "pass", actorId,
                comment, ReviewConst.PAYMENT_PENDING, ReviewConst.ACCEPT_PENDING, null);
        notificationService.notifyTransition(review, ReviewImNotificationService.ACTIVATED,
                paymentRecordId, actorId, comment);
        return review.getId();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void assignHandler(Long reviewId, ReviewActionDTO.AssignHandler request) {
        OrderReview review = requireReview(reviewId, true);
        requireManage(review);
        if (!ReviewConst.ACCEPT_PENDING.equals(review.getReviewStatus())
                && !ReviewConst.ACCEPT_REJECTED.equals(review.getReviewStatus())) {
            throw new BusinessException("当前审单状态不能分配办事人员");
        }
        if (request.getDeadline() == null || !request.getDeadline().isAfter(LocalDateTime.now())) {
            throw new BusinessException("办理截止时间必须晚于当前时间");
        }
        SysUser handler = activeUser(request.getHandlerUserId(), review.getTenantId());
        String before = review.getReviewStatus();
        review.setHandlerUserId(handler.getId());
        review.setHandlerName(limit(displayName(handler), 64));
        review.setCurrentNode(ReviewConst.NODE_ACCEPT);
        review.setReviewStatus(ReviewConst.ACCEPT_PENDING);
        review.setDeadline(request.getDeadline());
        reviewMapper.updateById(review);

        OrderReviewAccept accept = acceptMapper.selectOne(byReviewId(OrderReviewAccept::getReviewId, reviewId));
        if (accept == null) {
            accept = new OrderReviewAccept();
            accept.setTenantId(review.getTenantId());
            accept.setReviewId(reviewId);
            accept.setOrderId(review.getOrderId());
        }
        accept.setHandlerUserId(handler.getId());
        accept.setHandlerName(limit(displayName(handler), 64));
        accept.setDeptId(handler.getDeptId());
        accept.setAcceptTime(null);
        accept.setExpectedCompleteTime(null);
        accept.setMaterialsReady(null);
        accept.setAcceptRemark(limit(request.getRemark(), 500));
        if (accept.getId() == null) {
            acceptMapper.insert(accept);
        } else {
            acceptMapper.updateById(accept);
        }
        Long recordId = appendRecord(review, ReviewConst.NODE_ACCEPT, "assign", "assigned",
                currentUserId(), request.getRemark(), before, ReviewConst.ACCEPT_PENDING, null);
        notificationService.notifyTransition(review, ReviewImNotificationService.HANDLER_ASSIGNED,
                recordId, currentUserId(), request.getRemark());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void accept(Long reviewId, ReviewActionDTO.Accept request) {
        OrderReview review = requireReview(reviewId, true);
        Long actorId = currentUserId();
        if (review.getHandlerUserId() == null || !review.getHandlerUserId().equals(actorId)) {
            throw new BusinessException("只有被分配的办事人员可以接收或退回");
        }
        if (!ReviewConst.ACCEPT_PENDING.equals(review.getReviewStatus())) {
            throw new BusinessException("当前审单不在待接收状态");
        }
        boolean ready = Boolean.TRUE.equals(request.getMaterialsReady());
        if (ready && (request.getExpectedCompleteTime() == null
                || !request.getExpectedCompleteTime().isAfter(LocalDateTime.now()))) {
            throw new BusinessException("接收时必须填写有效的预计完成时间");
        }
        if (ready && review.getDeadline() != null
                && request.getExpectedCompleteTime().isAfter(review.getDeadline())) {
            throw new BusinessException("预计完成时间不能晚于主管设置的办理截止时间");
        }
        if (!ready && !StringUtils.hasText(request.getRemark())) {
            throw new BusinessException("退回资料必须填写原因");
        }
        OrderReviewAccept accept = acceptMapper.selectOne(byReviewId(OrderReviewAccept::getReviewId, reviewId));
        if (accept == null) {
            throw new BusinessException("审单尚未分配办事人员");
        }
        String before = review.getReviewStatus();
        accept.setMaterialsReady(ready ? 1 : 0);
        accept.setAcceptRemark(limit(request.getRemark(), 500));
        if (ready) {
            accept.setAcceptTime(LocalDateTime.now());
            accept.setExpectedCompleteTime(request.getExpectedCompleteTime());
            review.setCurrentNode(ReviewConst.NODE_PROCESS);
            review.setReviewStatus(ReviewConst.PROCESSING);
        } else {
            accept.setAcceptTime(null);
            accept.setExpectedCompleteTime(null);
            review.setCurrentNode(ReviewConst.NODE_ACCEPT);
            review.setReviewStatus(ReviewConst.ACCEPT_REJECTED);
            review.setDeadline(null);
        }
        acceptMapper.updateById(accept);
        reviewMapper.updateById(review);
        Long recordId = appendRecord(review, ReviewConst.NODE_ACCEPT, ready ? "accept" : "reject",
                ready ? "accepted" : "rejected", actorId, request.getRemark(), before,
                review.getReviewStatus(), null);
        notificationService.notifyTransition(review, ready ? ReviewImNotificationService.ACCEPTED
                        : ReviewImNotificationService.ACCEPT_REJECTED,
                recordId, actorId, request.getRemark());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void submitComplete(Long reviewId, ReviewActionDTO.SubmitComplete request) {
        OrderReview review = requireReview(reviewId, true);
        Long actorId = currentUserId();
        if (review.getHandlerUserId() == null || !review.getHandlerUserId().equals(actorId)) {
            throw new BusinessException("只有办事人员可以提交办理结果");
        }
        if (!ReviewConst.PROCESSING.equals(review.getReviewStatus())
                && !ReviewConst.COMPLETE_REJECTED.equals(review.getReviewStatus())) {
            throw new BusinessException("当前审单状态不能提交办理结果");
        }
        String attachments = serializeAttachments(request.getAttachments(), review.getTenantId());
        OrderReviewComplete complete = completeMapper.selectOne(
                byReviewId(OrderReviewComplete::getReviewId, reviewId));
        if (complete == null) {
            complete = new OrderReviewComplete();
            complete.setTenantId(review.getTenantId());
            complete.setReviewId(reviewId);
            complete.setOrderId(review.getOrderId());
        }
        complete.setCompleteTime(LocalDateTime.now());
        complete.setResultDesc(limitRequired(request.getResultDesc(), 1000, "办理结果不能为空"));
        complete.setCompleteVoucher(attachments);
        complete.setSubmitterId(actorId);
        complete.setSubmitterName(limit(userName(actorId), 64));
        complete.setConfirmerId(null);
        complete.setConfirmerName(null);
        complete.setConfirmTime(null);
        complete.setCompleteRemark(limit(request.getRemark(), 500));
        if (complete.getId() == null) {
            completeMapper.insert(complete);
        } else {
            completeMapper.updateById(complete);
        }
        String before = review.getReviewStatus();
        review.setCurrentNode(ReviewConst.NODE_COMPLETE);
        review.setReviewStatus(ReviewConst.COMPLETE_PENDING);
        reviewMapper.updateById(review);
        Long recordId = appendRecord(review, ReviewConst.NODE_COMPLETE, "submit", "pending_confirm",
                actorId, request.getRemark(), before, ReviewConst.COMPLETE_PENDING, attachments);
        notificationService.notifyTransition(review, ReviewImNotificationService.COMPLETE_SUBMITTED,
                recordId, actorId, request.getRemark());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void confirmComplete(Long reviewId, ReviewActionDTO.ConfirmComplete request) {
        OrderReview review = requireReview(reviewId, true);
        requireConfirm(review);
        if (!ReviewConst.COMPLETE_PENDING.equals(review.getReviewStatus())) {
            throw new BusinessException("当前审单不在待验收状态");
        }
        boolean pass = Boolean.TRUE.equals(request.getPass());
        if (!pass && !StringUtils.hasText(request.getOpinion())) {
            throw new BusinessException("驳回办理结果必须填写原因");
        }
        OrderReviewComplete complete = completeMapper.selectOne(
                byReviewId(OrderReviewComplete::getReviewId, reviewId));
        if (complete == null) {
            throw new BusinessException("办理结果不存在");
        }
        Long actorId = currentUserId();
        String before = review.getReviewStatus();
        complete.setConfirmerId(actorId);
        complete.setConfirmerName(limit(userName(actorId), 64));
        complete.setConfirmTime(LocalDateTime.now());
        complete.setCompleteRemark(limit(request.getOpinion(), 500));
        completeMapper.updateById(complete);
        if (pass) {
            review.setCurrentNode(ReviewConst.NODE_COMPLETE);
            review.setReviewStatus(ReviewConst.COMPLETED);
            review.setCompletedAt(LocalDateTime.now());
        } else {
            review.setCurrentNode(ReviewConst.NODE_PROCESS);
            review.setReviewStatus(ReviewConst.COMPLETE_REJECTED);
            review.setCompletedAt(null);
        }
        reviewMapper.updateById(review);
        Long recordId = appendRecord(review, ReviewConst.NODE_COMPLETE,
                pass ? "confirm" : "reject", pass ? "completed" : "rejected", actorId,
                request.getOpinion(), before, review.getReviewStatus(), null);
        notificationService.notifyTransition(review, pass ? ReviewImNotificationService.COMPLETED
                        : ReviewImNotificationService.COMPLETE_REJECTED,
                recordId, actorId, request.getOpinion());
        // 提单类审核单:验收通过即回写源提单为已确认(与验收同事务)
        if (pass) {
            writeBackSource(review, "confirmed");
        }
    }

    // ==================== 提单类审核单:真人合同审理/到款确认(2026-07-23 新增,不影响 "order" 财务确认快照链路) ====================

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long activateFromTicket(ReviewCreateDTO request) {
        if (request == null || request.getOrderId() == null
                || !TICKET_TYPES.contains(request.getOrderType())) {
            throw new BusinessException("提交审核缺少提单信息");
        }
        if (!StringUtils.hasText(request.getCustomerName())) {
            throw new BusinessException("提交审核缺少客户名称");
        }
        Long tenantId = SecurityUtils.getCurrentTenantId();
        if (tenantId == null) {
            throw new BusinessException("审单缺少公司信息");
        }
        Long actorId = currentUserId();
        LocalDateTime now = LocalDateTime.now();
        OrderReview existing = reviewMapper.selectOne(new LambdaQueryWrapper<OrderReview>()
                .eq(OrderReview::getOrderType, request.getOrderType())
                .eq(OrderReview::getOrderId, request.getOrderId())
                .last("LIMIT 1 FOR UPDATE"));
        if (existing != null && !RESUBMITTABLE.contains(existing.getReviewStatus())) {
            throw new BusinessException(ReviewConst.COMPLETED.equals(existing.getReviewStatus())
                    ? "该提单的审核已完成,不能重复提交" : "该提单已有进行中的审核单");
        }

        OrderReview review = existing != null ? existing : new OrderReview();
        String before = existing != null ? existing.getReviewStatus() : null;
        review.setTenantId(tenantId);
        review.setOrderType(request.getOrderType());
        review.setOrderId(request.getOrderId());
        review.setOrderNo(limit(request.getOrderNo(), 64));
        review.setCustomerId(request.getCustomerId());
        review.setCustomerName(limit(request.getCustomerName(), 200));
        review.setBusinessType(limit(request.getBusinessType(), 64));
        review.setReceivableAmount(request.getReceivableAmount());
        review.setSalesUserId(request.getSalesUserId() != null ? request.getSalesUserId() : actorId);
        review.setSalesName(limit(request.getSalesName(), 64));
        review.setDeptId(request.getDeptId());
        review.setCurrentNode(ReviewConst.NODE_CONTRACT);
        review.setReviewStatus(ReviewConst.CONTRACT_PENDING);
        review.setSubmittedAt(now);
        review.setRemark(limit(request.getRemark(), 500));
        if (existing == null) {
            reviewMapper.insert(review);
            review.setReviewNo("SD" + REVIEW_DATE.format(LocalDate.now())
                    + String.format("%07d", review.getId()));
            reviewMapper.updateById(review);
        } else {
            // 重提复位:updateById 跳过 null 字段(项目已咬过多次),置空必须 wrapper 显式 set
            reviewMapper.update(null, new com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper<OrderReview>()
                    .eq(OrderReview::getId, review.getId())
                    .set(OrderReview::getOrderNo, review.getOrderNo())
                    .set(OrderReview::getCustomerId, review.getCustomerId())
                    .set(OrderReview::getCustomerName, review.getCustomerName())
                    .set(OrderReview::getBusinessType, review.getBusinessType())
                    .set(OrderReview::getReceivableAmount, review.getReceivableAmount())
                    .set(OrderReview::getReceivedAmount, null)
                    .set(OrderReview::getSalesUserId, review.getSalesUserId())
                    .set(OrderReview::getSalesName, review.getSalesName())
                    .set(OrderReview::getDeptId, review.getDeptId())
                    .set(OrderReview::getHandlerUserId, null)
                    .set(OrderReview::getHandlerName, null)
                    .set(OrderReview::getCurrentNode, ReviewConst.NODE_CONTRACT)
                    .set(OrderReview::getReviewStatus, ReviewConst.CONTRACT_PENDING)
                    .set(OrderReview::getDeadline, null)
                    .set(OrderReview::getSubmittedAt, now)
                    .set(OrderReview::getCompletedAt, null)
                    .set(OrderReview::getRemark, review.getRemark()));
        }

        // 合同审理明细:重提时复位为待审(同样必须 wrapper 显式置空;表有 uk(tenant,review_id),不能删了重建)
        OrderReviewContract contract = contractMapper.selectOne(
                byReviewId(OrderReviewContract::getReviewId, review.getId()));
        if (contract == null) {
            contract = new OrderReviewContract();
            contract.setTenantId(tenantId);
            contract.setReviewId(review.getId());
            contract.setOrderId(request.getOrderId());
            contract.setBusinessType(limit(request.getBusinessType(), 64));
            contract.setContractFile(validJsonSnapshot(request.getContractFile(), 2000));
            contract.setContractAmount(request.getReceivableAmount());
            contract.setServicePeriod(limit(request.getServicePeriod(), 100));
            contract.setSalesRemark(limit(request.getSalesRemark(), 500));
            contractMapper.insert(contract);
        } else {
            contractMapper.update(null, new com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper<OrderReviewContract>()
                    .eq(OrderReviewContract::getId, contract.getId())
                    .set(OrderReviewContract::getOrderId, request.getOrderId())
                    .set(OrderReviewContract::getBusinessType, limit(request.getBusinessType(), 64))
                    .set(OrderReviewContract::getContractFile, validJsonSnapshot(request.getContractFile(), 2000))
                    .set(OrderReviewContract::getContractAmount, request.getReceivableAmount())
                    .set(OrderReviewContract::getServicePeriod, limit(request.getServicePeriod(), 100))
                    .set(OrderReviewContract::getSalesRemark, limit(request.getSalesRemark(), 500))
                    .set(OrderReviewContract::getCustomerInfoOk, null)
                    .set(OrderReviewContract::getReviewerId, null)
                    .set(OrderReviewContract::getReviewerName, null)
                    .set(OrderReviewContract::getReviewTime, null)
                    .set(OrderReviewContract::getReviewResult, null)
                    .set(OrderReviewContract::getReviewRemark, null));
        }
        // 重提时清掉上一轮的到款确认残留(不能逻辑删——uk(tenant,review_id) 会被软删行占住,wrapper 置空复用该行)
        if (existing != null) {
            OrderReviewPayment stalePayment = paymentMapper.selectOne(
                    byReviewId(OrderReviewPayment::getReviewId, review.getId()));
            if (stalePayment != null) {
                paymentMapper.update(null, new com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper<OrderReviewPayment>()
                        .eq(OrderReviewPayment::getId, stalePayment.getId())
                        .set(OrderReviewPayment::getReceivedAmount, null)
                        .set(OrderReviewPayment::getReceivedDate, null)
                        .set(OrderReviewPayment::getConfirmerId, null)
                        .set(OrderReviewPayment::getConfirmerName, null)
                        .set(OrderReviewPayment::getConfirmTime, null)
                        .set(OrderReviewPayment::getFinanceRemark, null));
            }
        }
        appendRecord(review, ReviewConst.NODE_CONTRACT, existing == null ? "submit" : "resubmit",
                "pending", actorId, request.getRemark(), before, ReviewConst.CONTRACT_PENDING, null);
        // 源提单锁定为审核中——与激活同事务;条件更新防 TOCTOU,0 行说明状态已被并发改动,整体回滚
        lockSourceForReview(review);
        return review.getId();
    }

    /** 提交审核时把源提单 status 从 pending/rejected 置为 reviewing(条件更新,影响行数!=1 即抛错回滚)。 */
    private void lockSourceForReview(OrderReview review) {
        int updated = switch (review.getOrderType()) {
            case "address" -> addressOrderMapper.update(null,
                    new com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper<BizAddressOrder>()
                            .eq(BizAddressOrder::getId, review.getOrderId())
                            // 地址报单有草稿机制(Codex V194):draft/rejected 可提交;pending 兼容历史行
                            .in(BizAddressOrder::getStatus, "draft", "rejected", "pending")
                            .set(BizAddressOrder::getStatus, "reviewing"));
            case "bookkeeping" -> bookkeepingOrderMapper.update(null,
                    new com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper<BizBookkeepingOrder>()
                            .eq(BizBookkeepingOrder::getId, review.getOrderId())
                            .and(w -> w.in(BizBookkeepingOrder::getStatus, "pending", "rejected")
                                    .or().isNull(BizBookkeepingOrder::getStatus))
                            .set(BizBookkeepingOrder::getStatus, "reviewing"));
            case "renewal_addr", "renewal_bk" -> renewalOrderMapper.update(null,
                    new com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper<BizRenewalOrder>()
                            .eq(BizRenewalOrder::getId, review.getOrderId())
                            .in(BizRenewalOrder::getStatus, "pending", "rejected")
                            .set(BizRenewalOrder::getStatus, "reviewing"));
            default -> 1;
        };
        if (updated != 1) {
            throw new BusinessException("提单状态已变化,请刷新后重试");
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void contractReview(Long reviewId, ReviewActionDTO.NodeReview request) {
        OrderReview review = requireReview(reviewId, true);
        requireTicket(review);
        requireContractRole(review);
        if (!ReviewConst.CONTRACT_PENDING.equals(review.getReviewStatus())) {
            throw new BusinessException("当前审单不在合同审理节点");
        }
        boolean pass = Boolean.TRUE.equals(request.getPass());
        if (!pass && !StringUtils.hasText(request.getOpinion())) {
            throw new BusinessException("驳回必须填写原因");
        }
        Long actorId = currentUserId();
        OrderReviewContract contract = contractMapper.selectOne(
                byReviewId(OrderReviewContract::getReviewId, reviewId));
        if (contract == null) {
            throw new BusinessException("合同审理明细不存在");
        }
        contract.setReviewerId(actorId);
        contract.setReviewerName(limit(userName(actorId), 64));
        contract.setReviewTime(LocalDateTime.now());
        contract.setReviewResult(pass ? "pass" : "reject");
        contract.setReviewRemark(limit(request.getOpinion(), 500));
        contractMapper.updateById(contract);

        String before = review.getReviewStatus();
        if (pass) {
            review.setCurrentNode(ReviewConst.NODE_PAYMENT);
            review.setReviewStatus(ReviewConst.PAYMENT_PENDING);
        } else {
            review.setCurrentNode(ReviewConst.NODE_CONTRACT);
            review.setReviewStatus(ReviewConst.CONTRACT_REJECTED);
        }
        reviewMapper.updateById(review);
        appendRecord(review, ReviewConst.NODE_CONTRACT, pass ? "approve" : "reject",
                pass ? "pass" : "rejected", actorId, request.getOpinion(), before,
                review.getReviewStatus(), null);
        if (!pass) {
            writeBackSource(review, "rejected");
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void paymentReview(Long reviewId, ReviewActionDTO.NodeReview request) {
        OrderReview review = requireReview(reviewId, true);
        requireTicket(review);
        requirePaymentRole();
        if (!ReviewConst.PAYMENT_PENDING.equals(review.getReviewStatus())) {
            throw new BusinessException("当前审单不在到款确认节点");
        }
        boolean pass = Boolean.TRUE.equals(request.getPass());
        if (!pass && !StringUtils.hasText(request.getOpinion())) {
            throw new BusinessException("驳回必须填写原因");
        }
        Long actorId = currentUserId();
        String before = review.getReviewStatus();
        if (pass) {
            OrderReviewPayment payment = paymentMapper.selectOne(
                    byReviewId(OrderReviewPayment::getReviewId, reviewId));
            if (payment == null) {
                payment = new OrderReviewPayment();
                payment.setTenantId(review.getTenantId());
                payment.setReviewId(reviewId);
            }
            payment.setOrderId(review.getOrderId());
            payment.setReceivableAmount(review.getReceivableAmount());
            payment.setReceivedAmount(review.getReceivableAmount());
            payment.setReceivedDate(LocalDate.now());
            payment.setPayer(limit(review.getCustomerName(), 200));
            payment.setConfirmerId(actorId);
            payment.setConfirmerName(limit(userName(actorId), 64));
            payment.setConfirmTime(LocalDateTime.now());
            payment.setFinanceRemark(limit(request.getOpinion(), 500));
            if (payment.getId() == null) {
                paymentMapper.insert(payment);
            } else {
                paymentMapper.updateById(payment);
            }
            review.setReceivedAmount(review.getReceivableAmount());
            review.setCurrentNode(ReviewConst.NODE_ACCEPT);
            review.setReviewStatus(ReviewConst.ACCEPT_PENDING);
        } else {
            review.setCurrentNode(ReviewConst.NODE_PAYMENT);
            review.setReviewStatus(ReviewConst.PAYMENT_REJECTED);
        }
        reviewMapper.updateById(review);
        appendRecord(review, ReviewConst.NODE_PAYMENT, pass ? "confirm" : "reject",
                pass ? "pass" : "rejected", actorId, request.getOpinion(), before,
                review.getReviewStatus(), null);
        if (!pass) {
            writeBackSource(review, "rejected");
        }
    }

    /** 审核结果回写源提单 status(confirmed/rejected)。仅提单类 order_type;与审核动作同事务。 */
    private void writeBackSource(OrderReview review, String status) {
        if (!TICKET_TYPES.contains(review.getOrderType())) {
            return;
        }
        switch (review.getOrderType()) {
            case "address" -> addressOrderMapper.update(null,
                    new com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper<BizAddressOrder>()
                            .eq(BizAddressOrder::getId, review.getOrderId())
                            .set(BizAddressOrder::getStatus, status));
            case "bookkeeping" -> bookkeepingOrderMapper.update(null,
                    new com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper<BizBookkeepingOrder>()
                            .eq(BizBookkeepingOrder::getId, review.getOrderId())
                            .set(BizBookkeepingOrder::getStatus, status));
            case "renewal_addr", "renewal_bk" -> renewalOrderMapper.update(null,
                    new com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper<BizRenewalOrder>()
                            .eq(BizRenewalOrder::getId, review.getOrderId())
                            .set(BizRenewalOrder::getStatus, status));
            default -> { }
        }
    }

    private void requireTicket(OrderReview review) {
        if (!TICKET_TYPES.contains(review.getOrderType())) {
            throw new BusinessException("该审单不支持此节点操作");
        }
    }

    /** 合同审理权限:本部门主管/admin/boss(口径同 requireManage,报错文案不同);主管不得审自己提交的单。 */
    private void requireContractRole(OrderReview review) {
        if (SecurityUtils.isCurrentAdmin() || SecurityUtils.hasAnyRole("boss")) {
            return;
        }
        if (Objects.equals(currentUserId(), review.getSalesUserId())) {
            throw new BusinessException("不能审理自己提交的提单,请由上级或其他主管处理");
        }
        if (!dataScopeHelper.isManagerOrAdmin()
                || !dataScopeHelper.canAccess(review.getSalesUserId(), review.getDeptId())) {
            throw new BusinessException("只有提单人所在部门的主管可以进行合同审理");
        }
    }

    /** 到款确认权限:财务/admin/boss。 */
    private void requirePaymentRole() {
        if (SecurityUtils.isCurrentAdmin() || SecurityUtils.hasAnyRole("boss", "finance", "finance_hq")) {
            return;
        }
        throw new BusinessException("只有财务可以进行到款确认");
    }

    private void applyScope(LambdaQueryWrapper<OrderReview> wrapper) {
        if (SecurityUtils.isCurrentAdmin() || SecurityUtils.hasAnyRole("boss")
                || Integer.valueOf(1).equals(SecurityUtils.getCurrentDataScope())) {
            return;
        }
        Long userId = currentUserId();
        Long tenantId = SecurityUtils.getCurrentTenantId();
        if (SecurityUtils.hasAnyRole("finance_hq", "finance")) {
            wrapper.and(w -> w.eq(OrderReview::getCurrentNode, ReviewConst.NODE_PAYMENT)
                    .or().eq(OrderReview::getSalesUserId, userId)
                    .or().eq(OrderReview::getHandlerUserId, userId)
                    .or().apply("EXISTS (SELECT 1 FROM biz_order_review_payment rp "
                                    + "WHERE rp.review_id = biz_order_review.id AND rp.tenant_id = {0} "
                                    + "AND rp.confirmer_id = {1} AND rp.deleted = 0)",
                            tenantId == null ? -1L : tenantId, userId));
            return;
        }
        Integer scope = SecurityUtils.getCurrentDataScope();
        Long deptId = SecurityUtils.getCurrentDeptId();
        if (deptId != null && Integer.valueOf(3).equals(scope)) {
            wrapper.and(w -> w.eq(OrderReview::getDeptId, deptId)
                    .or().eq(OrderReview::getHandlerUserId, userId));
            return;
        }
        if (deptId != null && Integer.valueOf(4).equals(scope)) {
            wrapper.and(w -> w.in(OrderReview::getDeptId, dataScopeHelper.deptSelfAndChildren(deptId))
                    .or().eq(OrderReview::getHandlerUserId, userId));
            return;
        }
        wrapper.and(w -> w.eq(OrderReview::getSalesUserId, userId)
                .or().eq(OrderReview::getHandlerUserId, userId));
    }

    private void applyStatus(LambdaQueryWrapper<OrderReview> wrapper, String status) {
        if (!StringUtils.hasText(status) || "all".equalsIgnoreCase(status)) {
            return;
        }
        switch (status.trim().toLowerCase()) {
            case "pending_assign" -> wrapper.eq(OrderReview::getReviewStatus, ReviewConst.ACCEPT_PENDING)
                    .isNull(OrderReview::getHandlerUserId);
            case "pending_accept" -> wrapper.eq(OrderReview::getReviewStatus, ReviewConst.ACCEPT_PENDING)
                    .isNotNull(OrderReview::getHandlerUserId);
            case "processing" -> wrapper.in(OrderReview::getReviewStatus,
                    List.of(ReviewConst.PROCESSING, ReviewConst.COMPLETE_REJECTED));
            case "pending_confirm" -> wrapper.eq(OrderReview::getReviewStatus, ReviewConst.COMPLETE_PENDING);
            case "completed" -> wrapper.eq(OrderReview::getReviewStatus, ReviewConst.COMPLETED);
            case "rejected" -> wrapper.in(OrderReview::getReviewStatus,
                    List.of(ReviewConst.ACCEPT_REJECTED, ReviewConst.COMPLETE_REJECTED,
                            ReviewConst.CONTRACT_REJECTED, ReviewConst.PAYMENT_REJECTED));
            case "overdue" -> wrapper.lt(OrderReview::getDeadline, LocalDateTime.now())
                    .notIn(OrderReview::getReviewStatus, TERMINAL);
            default -> wrapper.eq(OrderReview::getReviewStatus, status.trim().toUpperCase());
        }
    }

    private OrderReview requireReview(Long reviewId, boolean lock) {
        if (reviewId == null) {
            throw new BusinessException("审单ID不能为空");
        }
        LambdaQueryWrapper<OrderReview> wrapper = new LambdaQueryWrapper<OrderReview>()
                .eq(OrderReview::getId, reviewId);
        if (lock) {
            wrapper.last("FOR UPDATE");
        }
        OrderReview review = reviewMapper.selectOne(wrapper);
        if (review == null) {
            throw new BusinessException("审单不存在");
        }
        return review;
    }

    private void requireView(OrderReview review) {
        if (!canView(review)) {
            throw new BusinessException("无权查看该审单");
        }
    }

    private boolean canView(OrderReview review) {
        if (SecurityUtils.isCurrentAdmin() || SecurityUtils.hasAnyRole("boss")
                || Integer.valueOf(1).equals(SecurityUtils.getCurrentDataScope())) {
            return true;
        }
        Long userId = currentUserId();
        if (Objects.equals(review.getSalesUserId(), userId)
                || Objects.equals(review.getHandlerUserId(), userId)) {
            return true;
        }
        if (SecurityUtils.hasAnyRole("finance_hq", "finance")) {
            if (ReviewConst.NODE_PAYMENT.equals(review.getCurrentNode())) {
                return true;
            }
            return paymentMapper.selectCount(new LambdaQueryWrapper<OrderReviewPayment>()
                    .eq(OrderReviewPayment::getReviewId, review.getId())
                    .eq(OrderReviewPayment::getConfirmerId, userId)) > 0;
        }
        return dataScopeHelper.isManagerOrAdmin()
                && dataScopeHelper.canAccess(review.getSalesUserId(), review.getDeptId());
    }

    private void requireManage(OrderReview review) {
        if (SecurityUtils.isCurrentAdmin() || SecurityUtils.hasAnyRole("boss")) {
            return;
        }
        if (!dataScopeHelper.isManagerOrAdmin()
                || !dataScopeHelper.canAccess(review.getSalesUserId(), review.getDeptId())) {
            throw new BusinessException("只有本部门主管可以分配该审单");
        }
    }

    private void requireConfirm(OrderReview review) {
        Long userId = currentUserId();
        if (Objects.equals(review.getSalesUserId(), userId)) {
            return;
        }
        if (SecurityUtils.isCurrentAdmin() || SecurityUtils.hasAnyRole("boss")) {
            return;
        }
        if (!dataScopeHelper.isManagerOrAdmin()
                || !dataScopeHelper.canAccess(review.getSalesUserId(), review.getDeptId())) {
            throw new BusinessException("只有提单人或本部门主管可以验收");
        }
    }

    private SysUser activeUser(Long userId, Long tenantId) {
        if (userId == null) {
            throw new BusinessException("请选择办事人员");
        }
        SysUser user = userMapper.selectById(userId);
        if (user == null || !Integer.valueOf(0).equals(user.getStatus())
                || (tenantId != null && !tenantId.equals(user.getTenantId()))) {
            throw new BusinessException("办事人员不存在、已停用或不属于当前公司");
        }
        return user;
    }

    private String serializeAttachments(List<ReviewActionDTO.AttachmentRef> attachments,
                                        Long tenantId) {
        if (attachments == null || attachments.isEmpty()) {
            throw new BusinessException("请至少上传一份办理凭证");
        }
        if (attachments.size() > 10) {
            throw new BusinessException("办理凭证最多上传10个文件");
        }
        LinkedHashSet<Long> ids = new LinkedHashSet<>();
        for (ReviewActionDTO.AttachmentRef attachment : attachments) {
            if (attachment == null || attachment.getId() == null || !ids.add(attachment.getId())) {
                throw new BusinessException("办理凭证包含空值或重复文件");
            }
        }
        List<FileInfo> files = fileInfoService.listByIds(ids);
        if (files.size() != ids.size()) {
            throw new BusinessException("办理凭证不存在或无权访问");
        }
        Map<Long, FileInfo> fileById = new LinkedHashMap<>();
        for (FileInfo file : files) {
            if (file.getId() == null || (tenantId != null
                    && !Objects.equals(tenantId, file.getTenantId()))) {
                throw new BusinessException("办理凭证不存在或无权访问");
            }
            fileById.put(file.getId(), file);
        }
        List<ReviewActionDTO.AttachmentRef> safeAttachments = new ArrayList<>();
        for (Long id : ids) {
            FileInfo file = fileById.get(id);
            if (file == null) {
                throw new BusinessException("办理凭证不存在或无权访问");
            }
            String actualName = StringUtils.hasText(file.getOriginalName())
                    ? file.getOriginalName() : file.getName();
            if (!StringUtils.hasText(actualName)) {
                actualName = "文件_" + file.getId();
            }
            String extension = actualName.contains(".")
                    ? actualName.substring(actualName.lastIndexOf('.') + 1).toLowerCase()
                    : "";
            if (!EVIDENCE_EXTENSIONS.contains(extension)) {
                throw new BusinessException("办理凭证仅支持图片、PDF、Word和Excel文件");
            }
            if (file.getFileSize() == null || file.getFileSize() <= 0
                    || file.getFileSize() > MAX_EVIDENCE_SIZE) {
                throw new BusinessException("办理凭证不能为空且单个不能超过20MB");
            }
            ReviewActionDTO.AttachmentRef safe = new ReviewActionDTO.AttachmentRef();
            safe.setId(file.getId());
            safe.setName(limit(actualName, 255));
            safe.setMimeType(limit(file.getMimeType(), 100));
            safe.setSize(file.getFileSize());
            safeAttachments.add(safe);
        }
        try {
            String json = objectMapper.writeValueAsString(safeAttachments);
            if (json.length() > 2000) {
                throw new BusinessException("办理凭证信息过长，请减少文件数量或文件名长度");
            }
            return json;
        } catch (JsonProcessingException error) {
            throw new BusinessException("办理凭证格式不正确");
        }
    }

    private Long appendRecord(OrderReview review, String node, String action, String result,
                              Long operatorId, String opinion, String before, String after,
                              String attachments) {
        OrderReviewRecord record = new OrderReviewRecord();
        record.setTenantId(review.getTenantId());
        record.setReviewId(review.getId());
        record.setOrderId(review.getOrderId());
        record.setOrderType(review.getOrderType());
        record.setNodeCode(node);
        record.setNodeName(ReviewConst.nodeName(node));
        record.setAction(action);
        record.setResult(result);
        record.setOperatorId(operatorId);
        record.setOperatorName(limit(userName(operatorId), 64));
        record.setOpinion(limit(opinion, 1000));
        record.setAttachments(attachments);
        record.setBeforeStatus(before);
        record.setAfterStatus(after);
        record.setOperatedAt(LocalDateTime.now());
        recordMapper.insert(record);
        return record.getId();
    }

    private <T> LambdaQueryWrapper<T> byReviewId(
            com.baomidou.mybatisplus.core.toolkit.support.SFunction<T, ?> column, Long reviewId) {
        return new LambdaQueryWrapper<T>().eq(column, reviewId).last("LIMIT 1");
    }

    private long countMatching(java.util.function.Consumer<LambdaQueryWrapper<OrderReview>> condition) {
        LambdaQueryWrapper<OrderReview> wrapper = new LambdaQueryWrapper<>();
        applyScope(wrapper);
        condition.accept(wrapper);
        Long count = reviewMapper.selectCount(wrapper);
        return count == null ? 0L : count;
    }

    private Long currentUserId() {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new BusinessException("登录身份已失效");
        }
        return userId;
    }

    private String userName(Long userId) {
        if (userId == null) {
            return null;
        }
        return dataScopeHelper.resolveUserNames(List.of(userId)).get(userId);
    }

    private String displayName(SysUser user) {
        return StringUtils.hasText(user.getNickname()) ? user.getNickname() : user.getUsername();
    }

    private BigDecimal amount(BizOrder order) {
        if (order.getPayableAmount() != null) {
            return order.getPayableAmount();
        }
        return order.getTotalAmount() == null ? BigDecimal.ZERO : order.getTotalAmount();
    }

    private String servicePeriod(BizOrder order) {
        if (order.getServiceStartDate() == null && order.getServiceEndDate() == null) {
            return null;
        }
        return (order.getServiceStartDate() == null ? "" : order.getServiceStartDate().toString())
                + " ~ "
                + (order.getServiceEndDate() == null ? "" : order.getServiceEndDate().toString());
    }

    private String validJsonSnapshot(String value, int max) {
        if (!StringUtils.hasText(value) || value.length() > max) {
            return null;
        }
        try {
            objectMapper.readTree(value);
            return value;
        } catch (JsonProcessingException error) {
            return null;
        }
    }

    private boolean snapshotContainsFile(String value, Long fileId) {
        if (!StringUtils.hasText(value) || fileId == null) {
            return false;
        }
        try {
            JsonNode root = objectMapper.readTree(value);
            if (!root.isArray()) {
                return false;
            }
            for (JsonNode item : root) {
                JsonNode id = item.get("id");
                if (id == null) {
                    id = item.get("fileId");
                }
                if (id != null && id.canConvertToLong() && fileId.equals(id.asLong())) {
                    return true;
                }
            }
            return false;
        } catch (JsonProcessingException error) {
            return false;
        }
    }

    private String limitRequired(String value, int max, String message) {
        if (!StringUtils.hasText(value)) {
            throw new BusinessException(message);
        }
        return limit(value, max);
    }

    private String limit(String value, int max) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        String text = value.trim();
        return text.length() <= max ? text : text.substring(0, max);
    }
}
