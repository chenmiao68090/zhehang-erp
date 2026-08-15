package com.zhehang.erp.modules.crm.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
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
import com.zhehang.erp.modules.crm.support.CrmLeadSource;
import com.zhehang.erp.modules.finance.domain.entity.FinReceivableRenewal;
import com.zhehang.erp.modules.finance.mapper.FinReceivableRenewalMapper;
import com.zhehang.erp.modules.order.domain.BizOrder;
import com.zhehang.erp.modules.order.mapper.BizOrderMapper;
import com.zhehang.erp.modules.receipt.domain.BizReceipt;
import com.zhehang.erp.modules.receipt.mapper.BizReceiptMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

/**
 * 按线索聚合销售可见的客户资料、沟通、交易和服务记录。
 */
@Service
@RequiredArgsConstructor
public class CrmCustomer360Service {

    private static final int TIMELINE_LIMIT = 100;
    private static final int RELATED_LIMIT = 50;

    private final CrmLeadMapper leadMapper;
    private final CrmCustomerMapper customerMapper;
    private final CrmContactMapper contactMapper;
    private final CrmFollowMapper followMapper;
    private final BizCallRecordMapper callRecordMapper;
    private final CrmOpportunityMapper opportunityMapper;
    private final BizOrderMapper orderMapper;
    private final BizContractMapper contractMapper;
    private final BizReceiptMapper receiptMapper;
    private final FinReceivableRenewalMapper receivableRenewalMapper;
    private final CrmCustomerIssueMapper customerIssueMapper;
    private final DataScopeHelper dataScopeHelper;

    @Transactional(readOnly = true)
    public CrmCustomer360VO getByLeadId(Long leadId) {
        if (leadId == null) {
            throw new BusinessException("线索ID不能为空");
        }
        CrmLead lead = leadMapper.selectById(leadId);
        if (lead == null) {
            throw new BusinessException("线索不存在或已删除");
        }

        boolean publicPool = "pool".equalsIgnoreCase(lead.getOwnership());
        if (!publicPool && !dataScopeHelper.canAccess(lead.getOwnerId(), lead.getDeptId())) {
            throw new BusinessException("无权查看该客户360");
        }

        CrmCustomer360VO result = new CrmCustomer360VO();

        // 公海普通员工只看领取决策所需的线索基础资料。这里必须在查询正式客户和联系人前返回，
        // 避免历史上已关联客户的公海数据通过 360 侧向泄露。
        if (publicPool && !dataScopeHelper.isManagerOrAdmin()) {
            fillOverview(result.getOverview(), lead, null, List.of());
            result.getOverview().setCustomerId(null);
            result.getOverview().setOwnerId(null);
            result.getOverview().setOwnerName(null);
            result.getOverview().setDeptId(null);
            result.getOverview().setPhone(maskContact(result.getOverview().getPhone()));
            result.getOverview().setWechat(null);
            result.getOverview().setEmail(null);
            result.getOverview().setCompanyPhone(maskContact(result.getOverview().getCompanyPhone()));
            result.getOverview().setQuoteStatus(null);
            result.getOverview().setQuotedPrice(null);
            result.getOverview().setDealAmount(null);
            result.getOverview().setLastFollowTime(null);
            result.getOverview().setLastFollowContent(null);
            result.getOverview().setNextActionType(null);
            result.getOverview().setNextActionTime(null);
            result.getOverview().setNextActionContent(null);
            result.getOverview().setServiceExpireDate(null);
            result.getOverview().setCustomerDataRestricted(true);
            return result;
        }

        CrmCustomer customer = loadAccessibleCustomer(lead, result.getOverview());
        return assemble(result, lead, customer, customer != null && lead.getConvertedCustomerId() != null);
    }

    @Transactional(readOnly = true)
    public CrmCustomer360VO getByCustomerId(Long customerId) {
        if (customerId == null) {
            throw new BusinessException("客户ID不能为空");
        }
        CrmCustomer customer = customerMapper.selectById(customerId);
        if (customer == null) {
            throw new BusinessException("客户不存在或已删除");
        }
        if (!dataScopeHelper.canAccess(customer.getOwnerId(), customer.getDeptId())) {
            throw new BusinessException("无权查看该客户360");
        }

        CrmLead linkedLead = leadMapper.selectOne(new LambdaQueryWrapper<CrmLead>()
                .eq(CrmLead::getConvertedCustomerId, customerId)
                .orderByDesc(CrmLead::getUpdateTime)
                .orderByDesc(CrmLead::getId)
                .last("LIMIT 1"));
        CrmLead context = linkedLead == null ? formalCustomerContext(customer) : linkedLead;
        context.setConvertedCustomerId(customerId);
        context.setStatus(3);
        context.setOwnership("private");
        context.setOwnerId(customer.getOwnerId());
        context.setDeptId(customer.getDeptId());
        if (!StringUtils.hasText(context.getCustomerLevel())) {
            context.setCustomerLevel(customer.getLevel());
        }
        return assemble(new CrmCustomer360VO(), context, customer, true);
    }

    private CrmCustomer360VO assemble(CrmCustomer360VO result, CrmLead lead, CrmCustomer customer,
                                      boolean formalCustomer) {
        List<CrmContact> contacts = customer == null ? List.of() : loadContacts(customer.getId());
        fillOverview(result.getOverview(), lead, customer, contacts);
        if (formalCustomer && customer != null) {
            CrmContact primary = primaryContact(contacts);
            result.getOverview().setCustomerId(customer.getId());
            result.getOverview().setCompanyName(firstText(customer.getName(), result.getOverview().getCompanyName(), "未命名客户"));
            result.getOverview().setContactName(firstText(contactName(primary), result.getOverview().getContactName(), ""));
            result.getOverview().setPhone(firstText(contactMobile(primary), result.getOverview().getPhone(), ""));
            result.getOverview().setWechat(firstText(contactWechat(primary), result.getOverview().getWechat(), ""));
            result.getOverview().setEmail(firstText(contactEmail(primary), result.getOverview().getEmail(), ""));
            result.getOverview().setOwnerId(customer.getOwnerId());
            result.getOverview().setDeptId(customer.getDeptId());
            result.getOverview().setCustomerStatus(customer.getStatus());
            result.getOverview().setCustomerLevel(firstText(customer.getLevel(), result.getOverview().getCustomerLevel()));
            result.getOverview().setSource(firstText(customer.getSource(), result.getOverview().getSource()));
            result.getOverview().setServiceType(firstText(customer.getServicePackage(), result.getOverview().getServiceType()));
            result.getOverview().setFollowStatus("正式客户维护");
            result.getOverview().setConverted(true);
        }

        Long customerId = customer == null ? null : customer.getId();
        Long leadId = lead.getId();
        List<CrmFollow> follows = loadFollows(leadId, customerId);
        List<BizCallRecord> calls = loadCalls(leadId);
        fillLatestAction(result.getOverview(), follows, formalCustomer);

        List<CrmOpportunity> opportunities = customerId == null ? List.of() : loadOpportunities(customerId);
        List<BizOrder> orders = customerId == null ? List.of() : loadOrders(customerId);
        List<BizContract> contracts = customerId == null ? List.of() : loadContracts(customerId);
        List<BizReceipt> receipts = customerId == null ? List.of() : loadReceipts(customerId);
        List<FinReceivableRenewal> receivables = customerId == null ? List.of() : loadReceivables(customerId);
        List<CrmCustomerIssue> issues = customerId == null ? List.of() : loadIssues(customerId);

        Set<Long> userIds = collectUserIds(lead, follows, calls, opportunities, orders, contracts, receipts, receivables, issues);
        if (customer != null && customer.getOwnerId() != null) {
            userIds.add(customer.getOwnerId());
        }
        Map<Long, String> userNames = dataScopeHelper.resolveUserNames(userIds);
        Long ownerId = formalCustomer && customer != null ? customer.getOwnerId() : lead.getOwnerId();
        result.getOverview().setOwnerName(displayName(userNames, ownerId, lead.getOwnerName()));

        result.setContacts(toContacts(contacts));
        result.setOpportunities(toOpportunities(opportunities, userNames));
        result.setTransactions(toTransactions(orders, contracts, receipts, receivables));
        result.setServices(toServices(issues, userNames));
        result.setStats(buildStats(leadId, customerId, opportunities, orders, receipts, receivables, issues));
        result.setTimeline(buildTimeline(lead, customer, follows, calls, opportunities, orders,
                contracts, receipts, receivables, issues, userNames));
        return result;
    }

    private CrmLead formalCustomerContext(CrmCustomer customer) {
        CrmLead lead = new CrmLead();
        lead.setCompany(customer.getName());
        lead.setOwnerId(customer.getOwnerId());
        lead.setDeptId(customer.getDeptId());
        lead.setCustomerLevel(customer.getLevel());
        lead.setConsultBusiness(customer.getServicePackage());
        lead.setConvertedCustomerId(customer.getId());
        lead.setOwnership("private");
        lead.setStatus(3);
        lead.setCreateTime(customer.getCreateTime());
        return lead;
    }

    private CrmCustomer loadAccessibleCustomer(CrmLead lead, CrmCustomer360VO.Overview overview) {
        Long customerId = lead.getConvertedCustomerId();
        if (customerId == null) {
            return null;
        }
        CrmCustomer customer = customerMapper.selectById(customerId);
        if (customer == null) {
            return null;
        }
        if (!dataScopeHelper.canAccess(customer.getOwnerId(), customer.getDeptId())) {
            overview.setCustomerId(customerId);
            overview.setCustomerDataRestricted(true);
            return null;
        }
        return customer;
    }

    private void fillOverview(CrmCustomer360VO.Overview out, CrmLead lead, CrmCustomer customer,
                              List<CrmContact> contacts) {
        CrmContact primary = primaryContact(contacts);
        out.setLeadId(lead.getId());
        out.setCustomerId(customer != null ? customer.getId() : lead.getConvertedCustomerId());
        out.setLeadNo(lead.getLeadNo());
        out.setCompanyName(firstText(lead.getCompany(), customer == null ? null : customer.getName(), lead.getName(), "未命名客户"));
        out.setContactName(firstText(lead.getLegalPerson(), contactName(primary), lead.getName(), ""));
        out.setPhone(firstText(lead.getPhone(), contactMobile(primary), lead.getCompanyPhone(), ""));
        out.setWechat(firstText(lead.getWechatNo(), lead.getWechat(), contactWechat(primary), ""));
        out.setEmail(firstText(lead.getEmail(), contactEmail(primary), ""));
        out.setOwnerId(lead.getOwnerId());
        out.setOwnerName(lead.getOwnerName());
        out.setDeptId(lead.getDeptId());
        out.setOwnership(lead.getOwnership());
        out.setLifecycleStatus(lead.getStatus());
        out.setCustomerStatus(customer == null ? null : customer.getStatus());
        out.setFollowStatus(firstText(lead.getFollowStatus(), lifecycleFallback(lead.getStatus())));
        out.setCustomerLevel(firstText(lead.getCustomerLevel(), customer == null ? null : customer.getLevel(), ""));
        out.setIntentLevel(lead.getIntentLevel());
        out.setSource(sourceLabel(lead));
        out.setServiceType(firstText(lead.getConsultBusiness(), lead.getServiceType(),
                customer == null ? null : customer.getServicePackage(), ""));
        out.setQuoteStatus(lead.getQuoteStatus());
        out.setQuotedPrice(lead.getQuotedPrice());
        out.setDealAmount(lead.getDealAmount());
        out.setLastFollowTime(lead.getLastFollowTime());
        out.setLastFollowContent(lead.getLastFollowContent());
        out.setNextActionType(lead.getNextActionType());
        out.setNextActionTime(lead.getNextActionTime());
        out.setServiceExpireDate(lead.getServiceExpireDate());
        out.setConverted(Objects.equals(lead.getStatus(), 3) || lead.getConvertedCustomerId() != null);
        // ===== 资料tab工商信息补齐(取自线索工商字段) =====
        out.setLegalPerson(lead.getLegalPerson());
        out.setCompanyPhone(lead.getCompanyPhone());
        out.setRegisterStatus(lead.getRegisterStatus());
        out.setEnterpriseType(lead.getEnterpriseType());
        out.setEnterpriseScale(lead.getEnterpriseScale());
        out.setRegisteredCapital(lead.getRegisteredCapital());
        out.setPaidCapital(lead.getPaidCapital());
        out.setCreditCode(lead.getCreditCode());
        out.setEstablishedDate(lead.getEstablishedDate());
        out.setRegion(lead.getRegion());
        out.setRegisterAddress(lead.getRegisterAddress());
        out.setLatestAddress(lead.getLatestAddress());
        out.setBusinessScope(lead.getBusinessScope());
        out.setInsuredCount(lead.getInsuredCount());
        out.setInsuredYear(lead.getInsuredYear());
        out.setIndustry(lead.getSourceDetail());
    }

    private CrmContact primaryContact(List<CrmContact> contacts) {
        return contacts.stream().filter(c -> Objects.equals(c.getIsPrimary(), 1)).findFirst()
                .orElse(contacts.isEmpty() ? null : contacts.get(0));
    }

    private void fillLatestAction(CrmCustomer360VO.Overview overview, List<CrmFollow> follows,
                                  boolean formalCustomer) {
        if (follows.isEmpty()) {
            return;
        }
        CrmFollow latest = follows.get(0);
        if (formalCustomer || !StringUtils.hasText(overview.getLastFollowContent())) {
            overview.setLastFollowTime(latest.getCreateTime());
            overview.setLastFollowContent(latest.getContent());
        }
        overview.setNextActionContent(latest.getNextContent());
        if (formalCustomer || overview.getNextActionTime() == null) {
            overview.setNextActionTime(latest.getNextTime());
        }
        if (formalCustomer && latest.getNextTime() != null) {
            overview.setNextActionType("客户维护");
        }
    }

    private List<CrmContact> loadContacts(Long customerId) {
        return safeList(contactMapper.selectList(new LambdaQueryWrapper<CrmContact>()
                .eq(CrmContact::getCustomerId, customerId)
                .orderByDesc(CrmContact::getIsPrimary)
                .orderByDesc(CrmContact::getUpdateTime)
                .last("LIMIT " + RELATED_LIMIT)));
    }

    private List<CrmFollow> loadFollows(Long leadId, Long customerId) {
        LambdaQueryWrapper<CrmFollow> query = followQuery(leadId, customerId)
                .orderByDesc(CrmFollow::getCreateTime)
                .last("LIMIT " + TIMELINE_LIMIT);
        return safeList(followMapper.selectList(query));
    }

    private LambdaQueryWrapper<CrmFollow> followQuery(Long leadId, Long customerId) {
        LambdaQueryWrapper<CrmFollow> query = new LambdaQueryWrapper<>();
        query.and(w -> {
            if (leadId != null) {
                w.eq(CrmFollow::getLeadId, leadId);
            }
            if (customerId != null) {
                if (leadId != null) {
                    w.or();
                }
                w.eq(CrmFollow::getCustomerId, customerId);
            }
        });
        return query;
    }

    private List<BizCallRecord> loadCalls(Long leadId) {
        if (leadId == null) {
            return List.of();
        }
        return safeList(callRecordMapper.selectList(new LambdaQueryWrapper<BizCallRecord>()
                .eq(BizCallRecord::getLeadId, leadId)
                .orderByDesc(BizCallRecord::getCallTime)
                .last("LIMIT " + TIMELINE_LIMIT)));
    }

    private List<CrmOpportunity> loadOpportunities(Long customerId) {
        LambdaQueryWrapper<CrmOpportunity> query = new LambdaQueryWrapper<CrmOpportunity>()
                .eq(CrmOpportunity::getCustomerId, customerId);
        dataScopeHelper.applyByVisibleUsers(query, CrmOpportunity::getOwnerId);
        query.orderByDesc(CrmOpportunity::getUpdateTime).last("LIMIT " + RELATED_LIMIT);
        return safeList(opportunityMapper.selectList(query));
    }

    private List<BizOrder> loadOrders(Long customerId) {
        LambdaQueryWrapper<BizOrder> query = new LambdaQueryWrapper<BizOrder>()
                .eq(BizOrder::getCustomerId, customerId);
        dataScopeHelper.applyFinancial(query, BizOrder::getSalesmanId, BizOrder::getDeptId);
        query.orderByDesc(BizOrder::getCreateTime).last("LIMIT " + RELATED_LIMIT);
        return safeList(orderMapper.selectList(query));
    }

    private List<BizContract> loadContracts(Long customerId) {
        LambdaQueryWrapper<BizContract> query = new LambdaQueryWrapper<BizContract>()
                .eq(BizContract::getCustomerId, customerId);
        dataScopeHelper.applyFinancial(query, BizContract::getSalesmanId, BizContract::getDeptId);
        query.orderByDesc(BizContract::getCreateTime).last("LIMIT " + RELATED_LIMIT);
        return safeList(contractMapper.selectList(query));
    }

    private List<BizReceipt> loadReceipts(Long customerId) {
        LambdaQueryWrapper<BizReceipt> query = new LambdaQueryWrapper<BizReceipt>()
                .eq(BizReceipt::getCustomerId, customerId);
        dataScopeHelper.applyFinancial(query, BizReceipt::getSalesmanId, BizReceipt::getDeptId);
        query.orderByDesc(BizReceipt::getReceiveTime).last("LIMIT " + RELATED_LIMIT);
        return safeList(receiptMapper.selectList(query));
    }

    private List<FinReceivableRenewal> loadReceivables(Long customerId) {
        LambdaQueryWrapper<FinReceivableRenewal> query = new LambdaQueryWrapper<FinReceivableRenewal>()
                .eq(FinReceivableRenewal::getCustomerId, customerId);
        dataScopeHelper.applyFinancial(query, FinReceivableRenewal::getCollectorId,
                FinReceivableRenewal::getCollectorDeptId);
        query.orderByDesc(FinReceivableRenewal::getDueDate).last("LIMIT " + RELATED_LIMIT);
        return safeList(receivableRenewalMapper.selectList(query));
    }

    private List<CrmCustomerIssue> loadIssues(Long customerId) {
        LambdaQueryWrapper<CrmCustomerIssue> query = new LambdaQueryWrapper<CrmCustomerIssue>()
                .eq(CrmCustomerIssue::getCustomerId, customerId);
        dataScopeHelper.apply(query, CrmCustomerIssue::getOwnerId, CrmCustomerIssue::getDeptId);
        query.orderByDesc(CrmCustomerIssue::getCreateTime).last("LIMIT " + RELATED_LIMIT);
        return safeList(customerIssueMapper.selectList(query));
    }

    private Set<Long> collectUserIds(CrmLead lead, List<CrmFollow> follows, List<BizCallRecord> calls,
                                     List<CrmOpportunity> opportunities, List<BizOrder> orders,
                                     List<BizContract> contracts, List<BizReceipt> receipts,
                                     List<FinReceivableRenewal> receivables, List<CrmCustomerIssue> issues) {
        Set<Long> ids = new LinkedHashSet<>();
        ids.add(lead.getOwnerId());
        follows.forEach(v -> ids.add(v.getCreateBy()));
        calls.forEach(v -> ids.add(v.getAgentId()));
        opportunities.forEach(v -> ids.add(v.getOwnerId()));
        orders.forEach(v -> ids.add(v.getSalesmanId()));
        contracts.forEach(v -> ids.add(v.getSalesmanId()));
        receipts.forEach(v -> ids.add(v.getSalesmanId()));
        receivables.forEach(v -> ids.add(v.getCollectorId()));
        issues.forEach(v -> ids.add(v.getOwnerId()));
        ids.remove(null);
        return ids;
    }

    private List<CrmCustomer360VO.ContactItem> toContacts(List<CrmContact> contacts) {
        List<CrmCustomer360VO.ContactItem> items = new ArrayList<>();
        for (CrmContact contact : contacts) {
            CrmCustomer360VO.ContactItem item = new CrmCustomer360VO.ContactItem();
            item.setId(contact.getId());
            item.setName(contact.getName());
            item.setPosition(contact.getPosition());
            item.setMobile(contact.getMobile());
            item.setPhone(contact.getPhone());
            item.setWechat(contact.getWechat());
            item.setEmail(contact.getEmail());
            item.setPrimary(Objects.equals(contact.getIsPrimary(), 1));
            items.add(item);
        }
        return items;
    }

    private List<CrmCustomer360VO.OpportunityItem> toOpportunities(List<CrmOpportunity> opportunities,
                                                                    Map<Long, String> userNames) {
        List<CrmCustomer360VO.OpportunityItem> items = new ArrayList<>();
        for (CrmOpportunity opportunity : opportunities) {
            CrmCustomer360VO.OpportunityItem item = new CrmCustomer360VO.OpportunityItem();
            item.setId(opportunity.getId());
            item.setName(opportunity.getName());
            item.setAmount(opportunity.getAmount());
            item.setStage(opportunity.getStage());
            item.setStageName(opportunityStage(opportunity.getStage()));
            item.setWinRate(opportunity.getWinRate());
            item.setExpectedDate(opportunity.getExpectedDate());
            item.setOwnerId(opportunity.getOwnerId());
            item.setOwnerName(displayName(userNames, opportunity.getOwnerId(), null));
            item.setRemark(opportunity.getRemark());
            items.add(item);
        }
        return items;
    }

    private List<CrmCustomer360VO.TransactionItem> toTransactions(List<BizOrder> orders,
                                                                   List<BizContract> contracts,
                                                                   List<BizReceipt> receipts,
                                                                   List<FinReceivableRenewal> receivables) {
        List<CrmCustomer360VO.TransactionItem> items = new ArrayList<>();
        for (BizOrder order : orders) {
            CrmCustomer360VO.TransactionItem item = transaction("order", order.getId(), order.getOrderNo(),
                    firstText(order.getServiceType(), "业务订单"), orderStatus(order.getStatus()),
                    firstAmount(order.getPayableAmount(), order.getTotalAmount()), order.getCreateTime());
            items.add(item);
        }
        for (BizContract contract : contracts) {
            LocalDateTime eventTime = contract.getConfirmSignTime();
            if (eventTime == null && contract.getSignDate() != null) {
                eventTime = contract.getSignDate().atStartOfDay();
            }
            if (eventTime == null) {
                eventTime = contract.getCreateTime();
            }
            items.add(transaction("contract", contract.getId(), contract.getContractNo(),
                    firstText(contract.getTitle(), "业务合同"), contractStatus(contract.getStatus()),
                    contract.getAmount(), eventTime));
        }
        for (BizReceipt receipt : receipts) {
            items.add(transaction("receipt", receipt.getId(), receipt.getReceiptNo(),
                    paymentMethod(receipt.getPaymentMethod()) + "收款", receiptStatus(receipt.getStatus()),
                    receipt.getAmount(), firstTime(receipt.getReceiveTime(), receipt.getCreateTime())));
        }
        for (FinReceivableRenewal receivable : receivables) {
            CrmCustomer360VO.TransactionItem item = transaction("receivable", receivable.getId(), null,
                    firstText(receivable.getServiceType(), "应收续费"), receivableStatus(receivable.getReceivableStatus()),
                    receivable.getReceivableAmount(), dateTime(receivable.getDueDate()));
            item.setReceivedAmount(receivable.getReceivedAmount());
            item.setArrearsAmount(receivable.getArrearsAmount());
            items.add(item);
        }
        items.sort(Comparator.comparing(CrmCustomer360VO.TransactionItem::getEventTime,
                Comparator.nullsLast(Comparator.reverseOrder())));
        return items;
    }

    private CrmCustomer360VO.TransactionItem transaction(String type, Long id, String number, String title,
                                                          String status, BigDecimal amount, LocalDateTime eventTime) {
        CrmCustomer360VO.TransactionItem item = new CrmCustomer360VO.TransactionItem();
        item.setType(type);
        item.setId(id);
        item.setNumber(number);
        item.setTitle(title);
        item.setStatus(status);
        item.setAmount(amount);
        item.setEventTime(eventTime);
        return item;
    }

    private List<CrmCustomer360VO.ServiceItem> toServices(List<CrmCustomerIssue> issues,
                                                           Map<Long, String> userNames) {
        List<CrmCustomer360VO.ServiceItem> items = new ArrayList<>();
        for (CrmCustomerIssue issue : issues) {
            CrmCustomer360VO.ServiceItem item = new CrmCustomer360VO.ServiceItem();
            item.setId(issue.getId());
            item.setNumber(issue.getIssueNo());
            item.setType(issueType(issue.getIssueType()));
            item.setTitle(firstText(issue.getDescription(), "客户问题"));
            item.setPriority(issue.getPriority());
            item.setStatus(issueStatus(issue.getStatus()));
            item.setOwnerName(displayName(userNames, issue.getOwnerId(), issue.getOwnerName()));
            item.setDeadline(issue.getDeadline());
            item.setOverdue(issue.getDeadline() != null && issue.getDeadline().isBefore(LocalDateTime.now())
                    && !"completed".equals(issue.getStatus()) && !"closed".equals(issue.getStatus()));
            items.add(item);
        }
        return items;
    }

    private CrmCustomer360VO.Stats buildStats(Long leadId, Long customerId,
                                               List<CrmOpportunity> opportunities,
                                               List<BizOrder> orders, List<BizReceipt> receipts,
                                               List<FinReceivableRenewal> receivables,
                                               List<CrmCustomerIssue> issues) {
        CrmCustomer360VO.Stats stats = new CrmCustomer360VO.Stats();
        Long followCount = followMapper.selectCount(followQuery(leadId, customerId));
        Long callCount = leadId == null ? 0L : callRecordMapper.selectCount(new LambdaQueryWrapper<BizCallRecord>()
                .eq(BizCallRecord::getLeadId, leadId));
        stats.setFollowCount(followCount == null ? 0 : followCount);
        stats.setCallCount(callCount == null ? 0 : callCount);
        stats.setOpportunityCount(opportunities.size());
        stats.setOrderCount(orders.size());
        stats.setOpenIssueCount(issues.stream()
                .filter(v -> !"completed".equals(v.getStatus()) && !"closed".equals(v.getStatus())).count());
        stats.setOpportunityAmount(opportunities.stream()
                .filter(v -> !Objects.equals(v.getStage(), 6))
                .map(CrmOpportunity::getAmount).filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add));
        stats.setOrderAmount(orders.stream()
                .filter(v -> !Objects.equals(v.getStatus(), 6) && !Objects.equals(v.getStatus(), 7))
                .map(v -> firstAmount(v.getPayableAmount(), v.getTotalAmount()))
                .filter(Objects::nonNull).reduce(BigDecimal.ZERO, BigDecimal::add));
        stats.setReceivedAmount(receipts.stream().filter(v -> Objects.equals(v.getStatus(), 2))
                .map(BizReceipt::getAmount).filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add));
        stats.setArrearsAmount(receivables.stream().map(FinReceivableRenewal::getArrearsAmount)
                .filter(Objects::nonNull).reduce(BigDecimal.ZERO, BigDecimal::add));
        return stats;
    }

    private List<CrmCustomer360VO.TimelineItem> buildTimeline(CrmLead lead, CrmCustomer customer,
                                                               List<CrmFollow> follows,
                                                               List<BizCallRecord> calls,
                                                               List<CrmOpportunity> opportunities,
                                                               List<BizOrder> orders,
                                                               List<BizContract> contracts,
                                                               List<BizReceipt> receipts,
                                                               List<FinReceivableRenewal> receivables,
                                                               List<CrmCustomerIssue> issues,
        Map<Long, String> userNames) {
        List<CrmCustomer360VO.TimelineItem> items = new ArrayList<>();
        if (lead.getId() != null) {
            addTimeline(items, timeline("lead", lead.getId(), "线索进入销售流程",
                    firstText(lead.getSourceDetail(), sourceLabel(lead), ""), lifecycleName(lead.getStatus()),
                    displayName(userNames, lead.getOwnerId(), lead.getOwnerName()), lead.getCreateTime(), null, null));
        }
        if (customer != null) {
            boolean convertedFromLead = lead.getId() != null;
            Long customerOwnerId = customer.getOwnerId() == null ? lead.getOwnerId() : customer.getOwnerId();
            addTimeline(items, timeline("conversion", customer.getId(),
                    convertedFromLead ? "已转为正式客户" : "正式客户档案建立",
                    firstText(customer.getServicePackage(), lead.getDealBusiness(), ""),
                    convertedFromLead ? "成交交接" : "客户维护",
                    displayName(userNames, customerOwnerId, lead.getOwnerName()), customer.getCreateTime(),
                    lead.getDealAmount(), null));
        }
        for (CrmFollow follow : follows) {
            String next = follow.getNextTime() == null && !StringUtils.hasText(follow.getNextContent()) ? null
                    : "下一步: " + (follow.getNextTime() == null ? "" : follow.getNextTime())
                    + (StringUtils.hasText(follow.getNextContent()) ? " " + follow.getNextContent() : "");
            addTimeline(items, timeline("follow", follow.getId(), followType(follow.getType()) + "跟进",
                    joinText(follow.getContent(), next), null,
                    displayName(userNames, follow.getCreateBy(), null), follow.getCreateTime(), null, null));
        }
        for (BizCallRecord call : calls) {
            // 云客自动同步的技术串(外呼ID/员工手机/SIM等)不进时间线,只展示销售手写的通话小结;
            // 通话时长改走 durationSeconds 独立字段,由前端渲染成时长徽章。
            String remark = call.getRemark();
            String content = (StringUtils.hasText(remark) && !remark.startsWith("云客通话记录同步")) ? remark : "";
            CrmCustomer360VO.TimelineItem callItem = timeline("call", call.getId(),
                    firstText(call.getResult(), "电话外呼"), content,
                    Objects.equals(call.getConnected(), 1) ? "已接通" : "未接通",
                    firstText(call.getAgentName(), displayName(userNames, call.getAgentId(), null), ""),
                    firstTime(call.getCallTime(), call.getCreateTime()), null,
                    StringUtils.hasText(call.getRecordUrl()));
            callItem.setDurationSeconds(call.getDuration());
            addTimeline(items, callItem);
        }
        for (CrmOpportunity opportunity : opportunities) {
            addTimeline(items, timeline("opportunity", opportunity.getId(), "商机: " + firstText(opportunity.getName(), "未命名"),
                    opportunity.getRemark(), opportunityStage(opportunity.getStage()),
                    displayName(userNames, opportunity.getOwnerId(), null), opportunity.getCreateTime(),
                    opportunity.getAmount(), null));
        }
        for (BizOrder order : orders) {
            addTimeline(items, timeline("order", order.getId(), "订单 " + firstText(order.getOrderNo(), ""),
                    firstText(order.getServiceType(), order.getRemark(), ""), orderStatus(order.getStatus()),
                    firstText(order.getSalesmanName(), displayName(userNames, order.getSalesmanId(), null), ""),
                    order.getCreateTime(), firstAmount(order.getPayableAmount(), order.getTotalAmount()), null));
        }
        for (BizContract contract : contracts) {
            LocalDateTime time = firstTime(contract.getConfirmSignTime(), dateTime(contract.getSignDate()), contract.getCreateTime());
            addTimeline(items, timeline("contract", contract.getId(), "合同 " + firstText(contract.getContractNo(), ""),
                    firstText(contract.getTitle(), "业务合同"), contractStatus(contract.getStatus()),
                    displayName(userNames, contract.getSalesmanId(), null), time, contract.getAmount(), null));
        }
        for (BizReceipt receipt : receipts) {
            addTimeline(items, timeline("receipt", receipt.getId(), "收款 " + firstText(receipt.getReceiptNo(), ""),
                    paymentMethod(receipt.getPaymentMethod()), receiptStatus(receipt.getStatus()),
                    displayName(userNames, receipt.getSalesmanId(), null),
                    firstTime(receipt.getReceiveTime(), receipt.getCreateTime()), receipt.getAmount(), null));
        }
        for (FinReceivableRenewal receivable : receivables) {
            addTimeline(items, timeline("receivable", receivable.getId(),
                    firstText(receivable.getServiceType(), "服务") + "应收",
                    StringUtils.hasText(receivable.getRemark()) ? receivable.getRemark() : "到期日 " + receivable.getDueDate(),
                    receivableStatus(receivable.getReceivableStatus()),
                    displayName(userNames, receivable.getCollectorId(), receivable.getCollectorName()),
                    firstTime(receivable.getCreateTime(), dateTime(receivable.getDueDate())),
                    receivable.getReceivableAmount(), null));
        }
        for (CrmCustomerIssue issue : issues) {
            addTimeline(items, timeline("issue", issue.getId(), "客户问题 " + firstText(issue.getIssueNo(), ""),
                    issue.getDescription(), issueStatus(issue.getStatus()),
                    displayName(userNames, issue.getOwnerId(), issue.getOwnerName()), issue.getCreateTime(), null, null));
        }
        items.sort(Comparator.comparing(CrmCustomer360VO.TimelineItem::getOccurredAt).reversed());
        return items.size() > TIMELINE_LIMIT ? new ArrayList<>(items.subList(0, TIMELINE_LIMIT)) : items;
    }

    private CrmCustomer360VO.TimelineItem timeline(String type, Long id, String title, String content,
                                                    String status, String actor, LocalDateTime time,
                                                    BigDecimal amount, Boolean recordingAvailable) {
        CrmCustomer360VO.TimelineItem item = new CrmCustomer360VO.TimelineItem();
        item.setType(type);
        item.setId(id);
        item.setTitle(title);
        item.setContent(content);
        item.setStatus(status);
        item.setActorName(actor);
        item.setOccurredAt(time);
        item.setAmount(amount);
        item.setRecordingAvailable(Boolean.TRUE.equals(recordingAvailable));
        return item;
    }

    private void addTimeline(List<CrmCustomer360VO.TimelineItem> items, CrmCustomer360VO.TimelineItem item) {
        if (item.getOccurredAt() != null) {
            items.add(item);
        }
    }

    private String lifecycleName(Integer status) {
        if (Objects.equals(status, 2)) return "跟进中";
        if (Objects.equals(status, 3)) return "已转化";
        if (Objects.equals(status, 4)) return "无效";
        return "新建";
    }

    private String lifecycleFallback(Integer status) {
        if (Objects.equals(status, 2)) return "需求沟通";
        if (Objects.equals(status, 3)) return "移交结束交付";
        return "线索接收";
    }

    private String opportunityStage(Integer stage) {
        if (Objects.equals(stage, 2)) return "需求确认";
        if (Objects.equals(stage, 3)) return "方案报价";
        if (Objects.equals(stage, 4)) return "谈判";
        if (Objects.equals(stage, 5)) return "赢单";
        if (Objects.equals(stage, 6)) return "输单";
        return "初步接触";
    }

    private String orderStatus(Integer status) {
        if (Objects.equals(status, 2)) return "待审批";
        if (Objects.equals(status, 3)) return "主管已批";
        if (Objects.equals(status, 4)) return "财务已确认";
        if (Objects.equals(status, 5)) return "已完成";
        if (Objects.equals(status, 6)) return "已取消";
        if (Objects.equals(status, 7)) return "已驳回";
        return "草稿";
    }

    private String contractStatus(Integer status) {
        if (Objects.equals(status, 2)) return "待签署";
        if (Objects.equals(status, 3)) return "签署中";
        if (Objects.equals(status, 4)) return "已签署";
        if (Objects.equals(status, 5)) return "执行中";
        if (Objects.equals(status, 6)) return "已到期";
        if (Objects.equals(status, 7)) return "已终止";
        return "草稿";
    }

    private String receiptStatus(Integer status) {
        if (Objects.equals(status, 2)) return "已确认";
        if (Objects.equals(status, 3)) return "已退款";
        return "待确认";
    }

    private String receivableStatus(Integer status) {
        if (Objects.equals(status, 1)) return "部分收款";
        if (Objects.equals(status, 2)) return "已付款";
        if (Objects.equals(status, 3)) return "已逾期";
        return "待收";
    }

    private String issueStatus(String status) {
        if ("processing".equals(status)) return "处理中";
        if ("waiting".equals(status)) return "等客户";
        if ("completed".equals(status)) return "已完成";
        if ("closed".equals(status)) return "已关闭";
        return "待处理";
    }

    private String issueType(String type) {
        if ("complaint".equals(type)) return "投诉";
        if ("consult".equals(type)) return "咨询";
        if ("urge".equals(type)) return "催办";
        if ("tax".equals(type)) return "税务";
        if ("invoice".equals(type)) return "开票";
        if ("gs".equals(type)) return "工商";
        if ("fee".equals(type)) return "费用";
        return "其他";
    }

    private String followType(Integer type) {
        if (Objects.equals(type, 1)) return "电话";
        if (Objects.equals(type, 2)) return "微信";
        if (Objects.equals(type, 3)) return "面谈";
        if (Objects.equals(type, 4)) return "邮件";
        return "其他";
    }

    private String paymentMethod(String method) {
        if ("bank".equals(method)) return "银行";
        if ("alipay".equals(method)) return "支付宝";
        if ("wechat".equals(method)) return "微信";
        if ("cash".equals(method)) return "现金";
        return "其他";
    }

    private String sourceLabel(CrmLead lead) {
        if (StringUtils.hasText(lead.getSourcePlatform())) {
            return firstText(lead.getSourcePlatform(), lead.getSourceDetail(), "");
        }
        if (CrmLeadSource.isSupported(lead.getSource())) {
            return CrmLeadSource.labelOf(lead.getSource());
        }
        return firstText(lead.getSourceDetail(), "其他");
    }

    private String displayName(Map<Long, String> names, Long userId, String fallback) {
        return firstText(userId == null ? null : names.get(userId), fallback, "未分配");
    }

    private String contactName(CrmContact contact) {
        return contact == null ? null : contact.getName();
    }

    private String contactMobile(CrmContact contact) {
        return contact == null ? null : firstText(contact.getMobile(), contact.getPhone(), "");
    }

    private String contactWechat(CrmContact contact) {
        return contact == null ? null : contact.getWechat();
    }

    private String contactEmail(CrmContact contact) {
        return contact == null ? null : contact.getEmail();
    }

    private String joinText(String first, String second) {
        if (!StringUtils.hasText(first)) return second;
        if (!StringUtils.hasText(second)) return first;
        return first + "\n" + second;
    }

    private String maskContact(String raw) {
        if (!StringUtils.hasText(raw)) return "";
        String value = raw.trim();
        if (value.length() <= 4) return "****";
        int prefixLength = Math.min(3, value.length() - 2);
        int suffixLength = Math.min(4, value.length() - prefixLength);
        return value.substring(0, prefixLength) + "****" + value.substring(value.length() - suffixLength);
    }

    private String firstText(String... values) {
        for (String value : values) {
            if (StringUtils.hasText(value)) {
                return value.trim();
            }
        }
        return "";
    }

    private BigDecimal firstAmount(BigDecimal... values) {
        for (BigDecimal value : values) {
            if (value != null) return value;
        }
        return null;
    }

    private LocalDateTime firstTime(LocalDateTime... values) {
        for (LocalDateTime value : values) {
            if (value != null) return value;
        }
        return null;
    }

    private LocalDateTime dateTime(java.time.LocalDate value) {
        return value == null ? null : value.atStartOfDay();
    }

    private <T> List<T> safeList(List<T> values) {
        return values == null ? List.of() : values;
    }
}
