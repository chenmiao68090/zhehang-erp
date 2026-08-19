package com.zhehang.erp.modules.feigeorder.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.feigeorder.domain.dto.FeigeOrderRequest;
import com.zhehang.erp.modules.feigeorder.domain.dto.FeigePaymentRequest;
import com.zhehang.erp.modules.feigeorder.domain.entity.FeigeOrder;
import com.zhehang.erp.modules.feigeorder.domain.entity.FeigeOrderOperationLog;
import com.zhehang.erp.modules.feigeorder.domain.entity.FeigeOrderPayment;
import com.zhehang.erp.modules.feigeorder.domain.entity.FeigeOrderStep;
import com.zhehang.erp.modules.feigeorder.mapper.FeigeOrderMapper;
import com.zhehang.erp.modules.feigeorder.mapper.FeigeOrderPaymentMapper;
import com.zhehang.erp.modules.feigeorder.service.FeigeOrderSupport.Owner;
import com.zhehang.erp.modules.feigetask.service.FeigeOrderTaskBridgeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import static com.zhehang.erp.modules.feigeorder.service.FeigeOrderConstants.ORDER_CANCELLED;
import static com.zhehang.erp.modules.feigeorder.service.FeigeOrderConstants.ORDER_COMPLETED;
import static com.zhehang.erp.modules.feigeorder.service.FeigeOrderConstants.ORDER_IN_PROGRESS;
import static com.zhehang.erp.modules.feigeorder.service.FeigeOrderConstants.ORDER_PENDING;
import static com.zhehang.erp.modules.feigeorder.service.FeigeOrderConstants.ORDER_REFUNDED;
import static com.zhehang.erp.modules.feigeorder.service.FeigeOrderConstants.ORDER_REFUND_PENDING;
import static com.zhehang.erp.modules.feigeorder.service.FeigeOrderConstants.ZERO;
import static com.zhehang.erp.modules.feigeorder.service.FeigeOrderSupport.defaultText;
import static com.zhehang.erp.modules.feigeorder.service.FeigeOrderSupport.fillOutstanding;
import static com.zhehang.erp.modules.feigeorder.service.FeigeOrderSupport.isSealBusiness;
import static com.zhehang.erp.modules.feigeorder.service.FeigeOrderSupport.money;
import static com.zhehang.erp.modules.feigeorder.service.FeigeOrderSupport.nextNo;
import static com.zhehang.erp.modules.feigeorder.service.FeigeOrderSupport.nonNegative;
import static com.zhehang.erp.modules.feigeorder.service.FeigeOrderSupport.page;
import static com.zhehang.erp.modules.feigeorder.service.FeigeOrderSupport.syntheticOrderSteps;
import static com.zhehang.erp.modules.feigeorder.service.FeigeOrderSupport.trimToNull;
import static com.zhehang.erp.modules.feigeorder.service.FeigeOrderSupport.validateOrderAmounts;

/**
 * 飞哥版订单核心域：看板汇总、订单增改查、流程步骤展示、收款登记与操作日志查询。
 *
 * <p>审核流转在 {@link FeigeOrderAuditService}，合同在 {@link FeigeContractService}，
 * 退费在 {@link FeigeRefundService}。新单勾选“同时建立合同”时委托合同域完成，事务由本方法统一开启。</p>
 */
@Service
@RequiredArgsConstructor
public class FeigeOrderService {

    private final FeigeOrderMapper orderMapper;
    private final FeigeOrderPaymentMapper paymentMapper;
    private final DataScopeHelper dataScopeHelper;
    private final FeigeOrderSupport support;
    private final FeigeContractService contractService;

    public Map<String, Object> dashboard() {
        LambdaQueryWrapper<FeigeOrder> query = new LambdaQueryWrapper<>();
        dataScopeHelper.applyFinancial(query, FeigeOrder::getSalesmanId, FeigeOrder::getDeptId);
        List<FeigeOrder> orders = orderMapper.selectList(query);
        BigDecimal contractAmount = ZERO;
        BigDecimal receivedAmount = ZERO;
        long inProgress = 0;
        long completed = 0;
        long refunding = 0;
        for (FeigeOrder order : orders) {
            contractAmount = contractAmount.add(money(order.getContractAmount()));
            receivedAmount = receivedAmount.add(money(order.getReceivedAmount()));
            if (ORDER_IN_PROGRESS.equals(order.getStatus()) || ORDER_PENDING.equals(order.getStatus())) inProgress++;
            if (ORDER_COMPLETED.equals(order.getStatus())) completed++;
            if (ORDER_REFUND_PENDING.equals(order.getStatus())) refunding++;
        }
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", orders.size());
        result.put("inProgress", inProgress);
        result.put("completed", completed);
        result.put("refunding", refunding);
        result.put("contractAmount", contractAmount);
        result.put("receivedAmount", receivedAmount);
        result.put("outstandingAmount", nonNegative(contractAmount.subtract(receivedAmount)));
        return result;
    }

    public IPage<FeigeOrder> listOrders(int pageNum, int pageSize, String keyword, String status,
                                         String businessType, String customerSource, Long salesmanId,
                                         LocalDate startDate, LocalDate endDate) {
        LambdaQueryWrapper<FeigeOrder> query = new LambdaQueryWrapper<>();
        dataScopeHelper.applyFinancial(query, FeigeOrder::getSalesmanId, FeigeOrder::getDeptId);
        applyOrderFilters(query, keyword, status, businessType, customerSource, salesmanId,
                startDate, endDate);
        query.orderByDesc(FeigeOrder::getOrderDate).orderByDesc(FeigeOrder::getCreateTime);
        IPage<FeigeOrder> page = orderMapper.selectPage(page(pageNum, pageSize), query);
        page.getRecords().forEach(FeigeOrderSupport::fillOutstanding);
        return page;
    }

    public IPage<FeigeOrder> listUnreceived(int pageNum, int pageSize, String keyword, Long salesmanId) {
        LambdaQueryWrapper<FeigeOrder> query = new LambdaQueryWrapper<>();
        dataScopeHelper.applyFinancial(query, FeigeOrder::getSalesmanId, FeigeOrder::getDeptId);
        if (StringUtils.hasText(keyword)) {
            query.and(w -> w.like(FeigeOrder::getCompanyName, keyword)
                    .or().like(FeigeOrder::getOrderNo, keyword)
                    .or().like(FeigeOrder::getContacts, keyword));
        }
        query.eq(salesmanId != null, FeigeOrder::getSalesmanId, salesmanId);
        query.apply("COALESCE(contract_amount, 0) > COALESCE(received_amount, 0)")
                .notIn(FeigeOrder::getStatus, ORDER_REFUNDED, ORDER_CANCELLED)
                .orderByDesc(FeigeOrder::getOrderDate)
                .orderByDesc(FeigeOrder::getCreateTime);
        IPage<FeigeOrder> page = orderMapper.selectPage(page(pageNum, pageSize), query);
        page.getRecords().forEach(FeigeOrderSupport::fillOutstanding);
        return page;
    }

    public FeigeOrder getOrder(Long id) {
        FeigeOrder order = support.requireOrder(id, false);
        fillOutstanding(order);
        return order;
    }

    @Transactional(rollbackFor = Exception.class)
    public Long createOrder(FeigeOrderRequest request) {
        rejectSealOrderCreation(request);
        Owner owner = support.resolveOwner(request.getSalesmanId());
        FeigeOrder order = new FeigeOrder();
        applyOrderFields(order, request, true);
        order.setOrderNo(nextNo("FG"));
        order.setSalesmanId(owner.userId());
        order.setSalesmanName(owner.name());
        order.setDeptId(owner.deptId());
        if (owner.deptId() != null && !StringUtils.hasText(order.getTeamName())) {
            order.setTeamName(support.resolveDeptNames(List.of(owner.deptId())).get(owner.deptId()));
        }
        order.setStatus(ORDER_PENDING);
        order.setAuditStatus("pending");
        order.setFlowProgress("20%");
        order.setCurrentStep("财务审核");
        order.setTaskStatus("processing");
        validateOrderAmounts(order);
        orderMapper.insert(order);
        support.createDefaultOrderSteps(order);

        if (money(order.getReceivedAmount()).compareTo(ZERO) > 0) {
            FeigeOrderPayment opening = new FeigeOrderPayment();
            opening.setOrderId(order.getId());
            opening.setPaymentTime(order.getCollectionTime() != null ? order.getCollectionTime() : LocalDateTime.now());
            opening.setAmount(order.getReceivedAmount());
            opening.setPaymentMethod("opening");
            opening.setAccountNumber(order.getCollectionAccountNumber());
            opening.setStatus("confirmed");
            opening.setVoucher(order.getVoucher());
            opening.setRemarks("新单录入时登记的已收款");
            paymentMapper.insert(opening);
        }

        if (Boolean.TRUE.equals(request.getCreateContract())) {
            contractService.createContractFromOrder(order, request);
        }
        support.log(order.getId(), "create", "录入飞哥版订单", null);
        support.enqueueTaskBridge(order, FeigeOrderTaskBridgeService.ORDER_CREATED);
        return order.getId();
    }

    public List<FeigeOrderStep> listOrderSteps(Long orderId) {
        FeigeOrder order = support.requireOrder(orderId, false);
        List<FeigeOrderStep> steps = support.selectOrderSteps(orderId);
        return steps.isEmpty() ? syntheticOrderSteps(order) : steps;
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateOrder(Long id, FeigeOrderRequest request) {
        FeigeOrder order = support.requireOrder(id, true);
        if (ORDER_REFUNDED.equals(order.getStatus()) || ORDER_CANCELLED.equals(order.getStatus())) {
            throw new BusinessException("当前订单状态不能修改");
        }
        if (isSealBusiness(order.getBusinessType()) != isSealBusiness(request.getBusinessType())) {
            throw new BusinessException(409, "刻章业务必须使用原刻章提单，不能与通用订单互转");
        }
        BigDecimal received = money(order.getReceivedAmount());
        applyOrderFields(order, request, false);
        order.setReceivedAmount(received);
        if (request.getSalesmanId() != null && !Objects.equals(request.getSalesmanId(), order.getSalesmanId())) {
            Owner owner = support.resolveOwner(request.getSalesmanId());
            order.setSalesmanId(owner.userId());
            order.setSalesmanName(owner.name());
            order.setDeptId(owner.deptId());
        }
        validateOrderAmounts(order);
        orderMapper.updateById(order);
        support.log(order.getId(), "update", "修改飞哥版订单", null);
    }

    @Transactional(rollbackFor = Exception.class)
    public void completeOrder(Long id) {
        FeigeOrder order = support.requireOrder(id, true);
        if (!"approved".equals(order.getAuditStatus()) || !ORDER_IN_PROGRESS.equals(order.getStatus())) {
            throw new BusinessException("只有财务审核通过且办理中的订单才能完成");
        }
        order.setStatus(ORDER_COMPLETED);
        order.setFlowProgress("100%");
        order.setCurrentStep("已完成");
        order.setTaskStatus("completed");
        orderMapper.updateById(order);
        support.completeAllOrderSteps(order);
        support.log(id, "complete", "标记订单已完成", null);
    }

    public List<FeigeOrderPayment> listPayments(Long orderId) {
        support.requireOrder(orderId, false);
        return paymentMapper.selectList(new LambdaQueryWrapper<FeigeOrderPayment>()
                .eq(FeigeOrderPayment::getOrderId, orderId)
                .orderByDesc(FeigeOrderPayment::getPaymentTime)
                .orderByDesc(FeigeOrderPayment::getCreateTime));
    }

    @Transactional(rollbackFor = Exception.class)
    public Long addPayment(Long orderId, FeigePaymentRequest request) {
        FeigeOrder order = support.requireOrder(orderId, true);
        if (ORDER_REFUNDED.equals(order.getStatus()) || ORDER_CANCELLED.equals(order.getStatus())) {
            throw new BusinessException("当前订单不能登记收款");
        }
        BigDecimal newReceived = money(order.getReceivedAmount()).add(money(request.getAmount()));
        if (newReceived.compareTo(money(order.getContractAmount())) > 0) {
            throw new BusinessException("本次收款后将超过合同金额");
        }
        FeigeOrderPayment payment = new FeigeOrderPayment();
        payment.setOrderId(orderId);
        payment.setPaymentTime(request.getPaymentTime() != null ? request.getPaymentTime() : LocalDateTime.now());
        payment.setAmount(money(request.getAmount()));
        payment.setPaymentMethod(defaultText(request.getPaymentMethod(), "other"));
        payment.setAccountNumber(request.getAccountNumber());
        payment.setStatus("confirmed");
        payment.setVoucher(request.getVoucher());
        payment.setRemarks(request.getRemarks());
        paymentMapper.insert(payment);
        order.setReceivedAmount(newReceived);
        order.setCollectionTime(payment.getPaymentTime());
        order.setCollectionAccountNumber(payment.getAccountNumber());
        orderMapper.updateById(order);
        support.log(orderId, "payment", "登记收款 " + money(request.getAmount()).toPlainString() + " 元", request.getRemarks());
        return payment.getId();
    }

    public List<FeigeOrderOperationLog> listLogs(Long orderId) {
        support.requireOrder(orderId, false);
        return support.selectLogs(orderId);
    }

    private void applyOrderFilters(LambdaQueryWrapper<FeigeOrder> query, String keyword, String status,
                                   String businessType, String customerSource, Long salesmanId,
                                   LocalDate startDate, LocalDate endDate) {
        query.eq(StringUtils.hasText(status), FeigeOrder::getStatus, status)
                .eq(StringUtils.hasText(businessType), FeigeOrder::getBusinessType, businessType)
                .eq(StringUtils.hasText(customerSource), FeigeOrder::getCustomerSource, customerSource)
                .eq(salesmanId != null, FeigeOrder::getSalesmanId, salesmanId)
                .ge(startDate != null, FeigeOrder::getOrderDate, startDate)
                .le(endDate != null, FeigeOrder::getOrderDate, endDate);
        if (StringUtils.hasText(keyword)) {
            query.and(w -> w.like(FeigeOrder::getCompanyName, keyword)
                    .or().like(FeigeOrder::getOrderNo, keyword)
                    .or().like(FeigeOrder::getContacts, keyword)
                    .or().like(FeigeOrder::getContactPhone, keyword));
        }
    }

    private void applyOrderFields(FeigeOrder order, FeigeOrderRequest request, boolean includeReceived) {
        order.setOrderDate(request.getOrderDate() != null ? request.getOrderDate() : LocalDate.now());
        order.setCompanyName(request.getCompanyName().trim());
        order.setContacts(trimToNull(request.getContacts()));
        order.setContactPhone(trimToNull(request.getContactPhone()));
        order.setRegion(trimToNull(request.getRegion()));
        order.setAddress(trimToNull(request.getAddress()));
        order.setBusinessType(request.getBusinessType());
        order.setOpportunitySource(trimToNull(request.getOpportunitySource()));
        order.setDeliveryMethod(trimToNull(request.getDeliveryMethod()));
        order.setOrderAmount(money(request.getOrderAmount()));
        order.setContractAmount(money(request.getContractAmount()));
        order.setFinalPaymentAmount(money(request.getFinalPaymentAmount()));
        if (includeReceived) order.setReceivedAmount(money(request.getReceivedAmount()));
        order.setCollectionTime(request.getCollectionTime());
        order.setCollectionAccountNumber(trimToNull(request.getCollectionAccountNumber()));
        order.setRecurring(request.getRecurring() == null ? 0 : (request.getRecurring() == 1 ? 1 : 0));
        order.setVoucher(trimToNull(request.getVoucher()));
        order.setRemarks(trimToNull(request.getRemarks()));
        order.setTeamName(trimToNull(request.getTeamName()));
        order.setCompanyId(request.getCompanyId());
        order.setCustomerSource(trimToNull(defaultText(request.getCustomerSource(), request.getOpportunitySource())));
        order.setSourceDetail(trimToNull(request.getSourceDetail()));
        order.setRepurchaseCount(order.getRepurchaseCount() == null
                ? (Integer.valueOf(1).equals(request.getRecurring()) ? 1 : 0) : order.getRepurchaseCount());
        order.setCompanyNature(trimToNull(defaultText(request.getCompanyNature(), request.getEnterpriseNature())));
        order.setBusinessData(support.writeJson(request.getBusinessData()));
    }

    private void rejectSealOrderCreation(FeigeOrderRequest request) {
        if (request != null && isSealBusiness(request.getBusinessType())) {
            throw new BusinessException(409, "刻章业务请使用订单管理中的完整刻章提单");
        }
    }
}
