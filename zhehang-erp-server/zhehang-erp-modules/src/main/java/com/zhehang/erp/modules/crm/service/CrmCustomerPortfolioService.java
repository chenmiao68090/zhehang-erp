package com.zhehang.erp.modules.crm.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
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
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 销售正式客户工作台。复用现有客户、跟进、合同、交接和应收表，不维护第二套客户台账。
 */
@Service
@RequiredArgsConstructor
public class CrmCustomerPortfolioService {

    private static final Set<String> LEVELS = Set.of("A", "B", "C", "D", "E");
    private static final Set<String> ATTENTION_FILTERS = Set.of("all", "today", "overdue", "handover", "arrears");

    private final CrmCustomerMapper customerMapper;
    private final CrmContactMapper contactMapper;
    private final CrmLeadMapper leadMapper;
    private final CrmFollowMapper followMapper;
    private final BizContractMapper contractMapper;
    private final BizTaskHandoverMapper handoverMapper;
    private final FinReceivableRenewalMapper receivableMapper;
    private final DataScopeHelper dataScopeHelper;

    @Transactional(readOnly = true)
    public CrmCustomerPortfolioPageVO page(int pageNum, int pageSize, String keyword, String level,
                                           Integer status, Long ownerId, String serviceType, String attention) {
        int safePage = Math.max(1, pageNum);
        int safeSize = Math.min(100, Math.max(1, pageSize));
        String normalizedAttention = normalizeAttention(attention);

        LambdaQueryWrapper<CrmCustomer> customerQuery = new LambdaQueryWrapper<>();
        dataScopeHelper.apply(customerQuery, CrmCustomer::getOwnerId, CrmCustomer::getDeptId);
        customerQuery.eq(StringUtils.hasText(level), CrmCustomer::getLevel,
                        StringUtils.hasText(level) ? level.trim().toUpperCase(Locale.ROOT) : null)
                .eq(status != null, CrmCustomer::getStatus, status)
                .eq(ownerId != null, CrmCustomer::getOwnerId, ownerId)
                .orderByDesc(CrmCustomer::getCreateTime)
                .orderByDesc(CrmCustomer::getId);
        List<CrmCustomer> customers = safeList(customerMapper.selectList(customerQuery));

        CrmCustomerPortfolioPageVO result = new CrmCustomerPortfolioPageVO();
        result.setPageNum(safePage);
        result.setPageSize(safeSize);
        if (customers.isEmpty()) {
            return result;
        }

        List<Long> customerIds = customers.stream().map(CrmCustomer::getId)
                .filter(Objects::nonNull).distinct().collect(Collectors.toList());
        RelatedData related = loadRelated(customerIds);
        Map<Long, String> ownerNames = dataScopeHelper.resolveUserNames(customers.stream()
                .map(CrmCustomer::getOwnerId).filter(Objects::nonNull).collect(Collectors.toSet()));

        List<CrmCustomerPortfolioVO> rows = customers.stream()
                .map(customer -> toRow(customer, related, ownerNames))
                .filter(row -> matchesKeyword(row, keyword))
                .filter(row -> !StringUtils.hasText(serviceType)
                        || containsIgnoreCase(row.getServicePackage(), serviceType.trim()))
                .collect(Collectors.toCollection(ArrayList::new));

        result.setStats(buildStats(rows));
        rows.removeIf(row -> !matchesAttention(row, normalizedAttention));
        rows.sort(this::compareRows);

        result.setTotal(rows.size());
        long requestedFrom = (long) (safePage - 1) * safeSize;
        int from = (int) Math.min(rows.size(), requestedFrom);
        int to = Math.min(rows.size(), from + safeSize);
        result.setRecords(new ArrayList<>(rows.subList(from, to)));
        return result;
    }

    @Transactional(rollbackFor = Exception.class)
    public void addFollow(Long customerId, CrmCustomerFollowDTO dto) {
        if (customerId == null) {
            throw new BusinessException("客户ID不能为空");
        }
        if (dto == null || !StringUtils.hasText(dto.getContent())) {
            throw new BusinessException("请填写本次沟通内容");
        }
        if (dto.getType() == null || dto.getType() < 1 || dto.getType() > 5) {
            throw new BusinessException("请选择正确的跟进方式");
        }
        if (dto.getNextTime() == null || !StringUtils.hasText(dto.getNextContent())) {
            throw new BusinessException("请安排下一步时间并写清具体计划");
        }
        if (dto.getNextTime().isBefore(LocalDateTime.now().minusMinutes(1))) {
            throw new BusinessException("下一步跟进时间不能早于当前时间");
        }
        String level = StringUtils.hasText(dto.getCustomerLevel())
                ? dto.getCustomerLevel().trim().toUpperCase(Locale.ROOT) : null;
        if ("F".equals(level)) {
            level = "E";
        }
        if (level != null && !LEVELS.contains(level)) {
            throw new BusinessException("客户分级不正确");
        }

        CrmCustomer customer = customerMapper.selectById(customerId);
        if (customer == null) {
            throw new BusinessException("客户不存在或已删除");
        }
        if (!dataScopeHelper.canAccess(customer.getOwnerId(), customer.getDeptId())) {
            throw new BusinessException("无权跟进该客户");
        }
        if (Objects.equals(customer.getStatus(), 1)) {
            throw new BusinessException("停用客户不能新增跟进");
        }

        CrmFollow follow = new CrmFollow();
        follow.setCustomerId(customerId);
        follow.setType(dto.getType());
        follow.setContent(limit(dto.getContent(), 500));
        follow.setNextTime(dto.getNextTime());
        follow.setNextContent(limit(dto.getNextContent(), 500));
        followMapper.insert(follow);

        if (level != null && !Objects.equals(level, customer.getLevel())) {
            CrmCustomer update = new CrmCustomer();
            update.setId(customerId);
            update.setLevel(level);
            customerMapper.updateById(update);
        }
    }

    private RelatedData loadRelated(List<Long> customerIds) {
        RelatedData data = new RelatedData();
        if (customerIds.isEmpty()) {
            return data;
        }

        safeList(contactMapper.selectList(new LambdaQueryWrapper<CrmContact>()
                        .in(CrmContact::getCustomerId, customerIds)
                        .orderByDesc(CrmContact::getIsPrimary)
                        .orderByDesc(CrmContact::getUpdateTime)
                        .orderByDesc(CrmContact::getId)))
                .forEach(contact -> data.contacts.putIfAbsent(contact.getCustomerId(), contact));

        safeList(leadMapper.selectList(new LambdaQueryWrapper<CrmLead>()
                        .in(CrmLead::getConvertedCustomerId, customerIds)
                        .orderByDesc(CrmLead::getUpdateTime)
                        .orderByDesc(CrmLead::getId)))
                .forEach(lead -> data.leads.putIfAbsent(lead.getConvertedCustomerId(), lead));

        safeList(followMapper.selectList(new LambdaQueryWrapper<CrmFollow>()
                        .in(CrmFollow::getCustomerId, customerIds)
                        .orderByDesc(CrmFollow::getCreateTime)
                        .orderByDesc(CrmFollow::getId)))
                .forEach(follow -> data.follows.putIfAbsent(follow.getCustomerId(), follow));

        LambdaQueryWrapper<BizContract> contractQuery = new LambdaQueryWrapper<BizContract>()
                .in(BizContract::getCustomerId, customerIds);
        dataScopeHelper.applyFinancial(contractQuery, BizContract::getSalesmanId, BizContract::getDeptId);
        safeList(contractMapper.selectList(contractQuery.orderByDesc(BizContract::getCreateTime)
                        .orderByDesc(BizContract::getId)))
                .forEach(contract -> {
                    data.contractCounts.merge(contract.getCustomerId(), 1, Integer::sum);
                    data.contracts.putIfAbsent(contract.getCustomerId(), contract);
                });

        LambdaQueryWrapper<BizTaskHandover> handoverQuery = new LambdaQueryWrapper<BizTaskHandover>()
                .in(BizTaskHandover::getCustomerId, customerIds);
        List<Long> visibleUserIds = dataScopeHelper.getVisibleUserIds();
        if (visibleUserIds != null) {
            handoverQuery.and(w -> w.in(BizTaskHandover::getSalesId, visibleUserIds)
                    .or().in(BizTaskHandover::getAccountantId, visibleUserIds));
        }
        safeList(handoverMapper.selectList(handoverQuery.orderByDesc(BizTaskHandover::getCreateTime)
                        .orderByDesc(BizTaskHandover::getId)))
                .forEach(handover -> data.handovers.merge(handover.getCustomerId(), handover,
                        this::preferHandover));

        LambdaQueryWrapper<FinReceivableRenewal> receivableQuery = new LambdaQueryWrapper<FinReceivableRenewal>()
                .in(FinReceivableRenewal::getCustomerId, customerIds);
        dataScopeHelper.applyFinancial(receivableQuery, FinReceivableRenewal::getCollectorId,
                FinReceivableRenewal::getCollectorDeptId);
        safeList(receivableMapper.selectList(receivableQuery.orderByAsc(FinReceivableRenewal::getDueDate)))
                .forEach(receivable -> data.receivables.computeIfAbsent(receivable.getCustomerId(), id -> new ArrayList<>())
                        .add(receivable));
        return data;
    }

    private CrmCustomerPortfolioVO toRow(CrmCustomer customer, RelatedData related,
                                         Map<Long, String> ownerNames) {
        CrmCustomerPortfolioVO row = new CrmCustomerPortfolioVO();
        row.setId(customer.getId());
        row.setName(customer.getName());
        row.setShortName(customer.getShortName());
        row.setLevel(customer.getLevel());
        row.setStatus(customer.getStatus());
        row.setOwnerId(customer.getOwnerId());
        row.setOwnerName(customer.getOwnerId() == null
                ? "未分配" : ownerNames.getOrDefault(customer.getOwnerId(), "未分配"));
        row.setDeptId(customer.getDeptId());
        row.setSource(customer.getSource());
        row.setServicePackage(customer.getServicePackage());
        row.setBillingCycle(customer.getBillingCycle());
        row.setCreateTime(customer.getCreateTime());

        CrmLead lead = related.leads.get(customer.getId());
        if (lead != null) {
            row.setLeadId(lead.getId());
        }
        CrmContact contact = related.contacts.get(customer.getId());
        if (contact != null) {
            row.setContactName(contact.getName());
            row.setContactPhone(firstText(contact.getMobile(), contact.getPhone()));
        }

        CrmFollow follow = related.follows.get(customer.getId());
        if (follow != null) {
            row.setLastFollowTime(follow.getCreateTime());
            row.setLastFollowContent(follow.getContent());
            row.setNextFollowTime(follow.getNextTime());
            row.setNextFollowContent(follow.getNextContent());
        } else if (lead != null) {
            row.setLastFollowTime(lead.getLastFollowTime());
            row.setLastFollowContent(lead.getLastFollowContent());
            row.setNextFollowTime(lead.getNextActionTime());
            row.setNextFollowContent(lead.getNextActionType());
        }
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime nextTime = row.getNextFollowTime();
        boolean overdue = nextTime != null && nextTime.isBefore(now);
        row.setFollowOverdue(overdue);
        row.setFollowDueToday(nextTime != null && !overdue && nextTime.toLocalDate().equals(LocalDate.now()));

        BizContract contract = related.contracts.get(customer.getId());
        row.setContractCount(related.contractCounts.getOrDefault(customer.getId(), 0));
        if (contract != null) {
            row.setLatestContractId(contract.getId());
            row.setLatestContractNo(contract.getContractNo());
            row.setLatestContractStatus(contract.getStatus());
            row.setContractEndDate(contract.getEndDate());
        }

        BizTaskHandover handover = related.handovers.get(customer.getId());
        if (handover != null) {
            row.setHandoverId(handover.getId());
            row.setHandoverNo(handover.getHandoverNo());
            row.setHandoverStatus(handover.getStatus());
            row.setHandoverDeadline(handover.getDeadline());
            row.setHandoverOverdue(!"completed".equals(handover.getStatus())
                    && handover.getDeadline() != null && handover.getDeadline().isBefore(LocalDate.now()));
        } else {
            row.setHandoverOverdue(false);
        }

        List<FinReceivableRenewal> receivables = related.receivables.getOrDefault(customer.getId(), List.of());
        BigDecimal arrears = receivables.stream().map(FinReceivableRenewal::getArrearsAmount)
                .filter(Objects::nonNull).filter(amount -> amount.compareTo(BigDecimal.ZERO) > 0)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        row.setArrearsAmount(arrears);
        row.setReceivableDueDate(receivables.stream()
                .filter(item -> positive(item.getArrearsAmount()))
                .map(FinReceivableRenewal::getDueDate).filter(Objects::nonNull)
                .min(LocalDate::compareTo).orElse(null));
        row.setBadDebtRisk(receivables.stream().anyMatch(item -> "坏账风险".equals(item.getCollectionStatus())));
        row.setPausedService(receivables.stream().anyMatch(item -> Objects.equals(item.getPausedService(), 1)));
        return row;
    }

    private CrmCustomerPortfolioPageVO.Stats buildStats(List<CrmCustomerPortfolioVO> rows) {
        CrmCustomerPortfolioPageVO.Stats stats = new CrmCustomerPortfolioPageVO.Stats();
        stats.setTotal(rows.size());
        stats.setActive(rows.stream().filter(row -> !Objects.equals(row.getStatus(), 1)).count());
        stats.setDueToday(rows.stream().filter(row -> Boolean.TRUE.equals(row.getFollowDueToday())).count());
        stats.setOverdue(rows.stream().filter(row -> Boolean.TRUE.equals(row.getFollowOverdue())).count());
        stats.setHandoverPending(rows.stream().filter(row -> StringUtils.hasText(row.getHandoverStatus())
                && !"completed".equals(row.getHandoverStatus())).count());
        stats.setArrearsCustomers(rows.stream().filter(row -> positive(row.getArrearsAmount())).count());
        stats.setArrearsAmount(rows.stream().map(CrmCustomerPortfolioVO::getArrearsAmount)
                .filter(Objects::nonNull).reduce(BigDecimal.ZERO, BigDecimal::add));
        return stats;
    }

    private boolean matchesKeyword(CrmCustomerPortfolioVO row, String keyword) {
        if (!StringUtils.hasText(keyword)) {
            return true;
        }
        String term = keyword.trim();
        return containsIgnoreCase(row.getName(), term) || containsIgnoreCase(row.getShortName(), term)
                || containsIgnoreCase(row.getContactName(), term) || containsIgnoreCase(row.getContactPhone(), term)
                || containsIgnoreCase(row.getOwnerName(), term);
    }

    private boolean matchesAttention(CrmCustomerPortfolioVO row, String attention) {
        return switch (attention) {
            case "today" -> Boolean.TRUE.equals(row.getFollowDueToday());
            case "overdue" -> Boolean.TRUE.equals(row.getFollowOverdue());
            case "handover" -> StringUtils.hasText(row.getHandoverStatus())
                    && !"completed".equals(row.getHandoverStatus());
            case "arrears" -> positive(row.getArrearsAmount());
            default -> true;
        };
    }

    private int compareRows(CrmCustomerPortfolioVO left, CrmCustomerPortfolioVO right) {
        int rank = Integer.compare(attentionRank(right), attentionRank(left));
        if (rank != 0) {
            return rank;
        }
        if (left.getNextFollowTime() != null && right.getNextFollowTime() != null) {
            int next = left.getNextFollowTime().compareTo(right.getNextFollowTime());
            if (next != 0) {
                return next;
            }
        } else if (left.getNextFollowTime() != null) {
            return -1;
        } else if (right.getNextFollowTime() != null) {
            return 1;
        }
        return compareNullableTime(right.getCreateTime(), left.getCreateTime());
    }

    private int attentionRank(CrmCustomerPortfolioVO row) {
        if (Boolean.TRUE.equals(row.getFollowOverdue())) return 5;
        if (Boolean.TRUE.equals(row.getFollowDueToday())) return 4;
        if (StringUtils.hasText(row.getHandoverStatus()) && !"completed".equals(row.getHandoverStatus())) return 3;
        if (positive(row.getArrearsAmount())) return 2;
        return 1;
    }

    private BizTaskHandover preferHandover(BizTaskHandover current, BizTaskHandover candidate) {
        boolean currentActive = !"completed".equals(current.getStatus());
        boolean candidateActive = !"completed".equals(candidate.getStatus());
        if (candidateActive && !currentActive) return candidate;
        if (currentActive && !candidateActive) return current;
        return newer(candidate.getCreateTime(), current.getCreateTime()) ? candidate : current;
    }

    private String normalizeAttention(String attention) {
        String value = StringUtils.hasText(attention) ? attention.trim().toLowerCase(Locale.ROOT) : "all";
        if (!ATTENTION_FILTERS.contains(value)) {
            throw new BusinessException("客户关注筛选值不正确");
        }
        return value;
    }

    private boolean containsIgnoreCase(String value, String term) {
        return StringUtils.hasText(value) && value.toLowerCase(Locale.ROOT)
                .contains(term.toLowerCase(Locale.ROOT));
    }

    private int compareNullableTime(LocalDateTime left, LocalDateTime right) {
        if (left == null && right == null) return 0;
        if (left == null) return 1;
        if (right == null) return -1;
        return left.compareTo(right);
    }

    private boolean newer(LocalDateTime candidate, LocalDateTime current) {
        return candidate != null && (current == null || candidate.isAfter(current));
    }

    private boolean positive(BigDecimal amount) {
        return amount != null && amount.compareTo(BigDecimal.ZERO) > 0;
    }

    private String firstText(String... values) {
        for (String value : values) {
            if (StringUtils.hasText(value)) return value;
        }
        return null;
    }

    private String limit(String value, int max) {
        String text = value == null ? null : value.trim();
        return text == null || text.length() <= max ? text : text.substring(0, max);
    }

    private <T> List<T> safeList(List<T> values) {
        return values == null ? List.of() : values;
    }

    private static final class RelatedData {
        private final Map<Long, CrmContact> contacts = new LinkedHashMap<>();
        private final Map<Long, CrmLead> leads = new LinkedHashMap<>();
        private final Map<Long, CrmFollow> follows = new LinkedHashMap<>();
        private final Map<Long, BizContract> contracts = new LinkedHashMap<>();
        private final Map<Long, Integer> contractCounts = new HashMap<>();
        private final Map<Long, BizTaskHandover> handovers = new LinkedHashMap<>();
        private final Map<Long, List<FinReceivableRenewal>> receivables = new HashMap<>();
    }
}
