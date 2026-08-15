package com.zhehang.erp.modules.order.service;

import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.im.domain.ImModels;
import com.zhehang.erp.modules.im.mapper.ImTaskQueryMapper;
import com.zhehang.erp.modules.im.service.ImNotificationOutboxService;
import com.zhehang.erp.modules.order.domain.BizOrder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;

/** 将提单状态变化转换为可靠、可追溯的 IM 业务事件。 */
@Service
@RequiredArgsConstructor
public class OrderImNotificationService {
    public static final String SUBMITTED = "submitted";
    public static final String APPROVED = "approved";
    public static final String REJECTED = "rejected";
    public static final String FINANCE_CONFIRMED = "finance_confirmed";

    private final ImNotificationOutboxService outboxService;
    private final ImTaskQueryMapper recipientMapper;

    /** 严格登记业务事件；收件人解析或 outbox 失败时回滚提单主事务。 */
    public void notifyTransition(BizOrder order, String transition, Long approvalRecordId,
                                 Long operatorId, String comment) {
        if (order == null || order.getId() == null || approvalRecordId == null
                || !StringUtils.hasText(transition)) {
            return;
        }
        Long tenantId = order.getTenantId() != null
                ? order.getTenantId() : SecurityUtils.getCurrentTenantId();
        if (tenantId == null) throw new BusinessException("提单通知缺少公司信息");

        LinkedHashSet<Long> recipients = resolveRecipients(order, transition, tenantId);
        recipients.remove(null);
        if (operatorId != null && recipients.size() > 1) recipients.remove(operatorId);
        if (recipients.isEmpty()) throw new BusinessException("未配置提单消息接收人");

        ImModels.BusinessNotification event = new ImModels.BusinessNotification();
        event.setEventId(eventId(order, transition, approvalRecordId));
        event.setEventType("order." + transition);
        event.setTitle(title(transition));
        event.setText(summary(order));
        event.setRecipientIds(new ArrayList<>(recipients));
        event.setBusinessType("order");
        event.setBusinessId(order.getId());
        event.setCurrentStatus(status(transition));
        event.setResponsibleId(responsibleId(order, recipients, transition));
        event.setOperatorId(operatorId);
        event.setOccurredAt(LocalDateTime.now());
        event.setRequirement(requirement(order, transition, comment));
        event.setActionLabel(actionLabel(transition));
        event.setActionUrl("/order/bill?orderId=" + order.getId());
        event.setImportant(REJECTED.equals(transition));
        outboxService.enqueueBusinessEvent(event);
    }

    private LinkedHashSet<Long> resolveRecipients(BizOrder order, String transition, Long tenantId) {
        LinkedHashSet<Long> recipients = new LinkedHashSet<>();
        if (SUBMITTED.equals(transition)) {
            recipients.addAll(departmentManagers(order, tenantId));
            addBossFallback(recipients, tenantId);
            return recipients;
        }
        if (APPROVED.equals(transition)) {
            List<Long> financeUsers = recipientMapper.activeUserIdsByRoleKeys(
                    List.of("finance_hq", "finance"), tenantId);
            if (financeUsers != null) {
                recipients.addAll(financeUsers);
            }
            addBossFallback(recipients, tenantId);
            return recipients;
        }

        if (order.getSalesmanId() != null) {
            recipients.add(order.getSalesmanId());
        }
        if (order.getCreateBy() != null) {
            recipients.add(order.getCreateBy());
        }
        recipients.addAll(departmentManagers(order, tenantId));
        addBossFallback(recipients, tenantId);
        return recipients;
    }

    private List<Long> departmentManagers(BizOrder order, Long tenantId) {
        if (order.getDeptId() == null) {
            return List.of();
        }
        List<Long> managers = recipientMapper.departmentManagerIds(order.getDeptId(), tenantId);
        return managers == null ? List.of() : managers;
    }

    private void addBossFallback(LinkedHashSet<Long> recipients, Long tenantId) {
        if (recipients.isEmpty()) {
            List<Long> bosses = recipientMapper.activeUserIdsByRoleKeys(List.of("boss"), tenantId);
            if (bosses != null) {
                recipients.addAll(bosses);
            }
        }
    }

    private Long responsibleId(BizOrder order, LinkedHashSet<Long> recipients, String transition) {
        if ((REJECTED.equals(transition) || FINANCE_CONFIRMED.equals(transition))
                && order.getSalesmanId() != null) {
            return order.getSalesmanId();
        }
        return recipients.iterator().next();
    }

    private String title(String transition) {
        return switch (transition) {
            case SUBMITTED -> "新提单待主管审批";
            case APPROVED -> "提单已通过，等待财务确认";
            case REJECTED -> "提单已驳回，请修改";
            case FINANCE_CONFIRMED -> "提单财务确认完成";
            default -> "提单状态已更新";
        };
    }

    private String status(String transition) {
        return switch (transition) {
            case SUBMITTED -> "reviewing";
            case APPROVED -> "pending_finance";
            case REJECTED -> "rejected";
            case FINANCE_CONFIRMED -> "confirmed";
            default -> "updated";
        };
    }

    private String actionLabel(String transition) {
        return switch (transition) {
            case SUBMITTED -> "去审单";
            case APPROVED -> "去确认";
            case REJECTED -> "去修改";
            default -> "查看提单";
        };
    }

    private String summary(BizOrder order) {
        String customer = abbreviate(order.getCustomerName(), 80, "客户");
        String orderNo = abbreviate(order.getOrderNo(), 64, "提单 #" + order.getId());
        String service = abbreviate(order.getServiceType(), 40, "业务提单");
        return customer + " · " + orderNo + " · " + service;
    }

    private String requirement(BizOrder order, String transition, String comment) {
        String amount = money(order.getPayableAmount() != null
                ? order.getPayableAmount() : order.getTotalAmount());
        return switch (transition) {
            case SUBMITTED -> "请核对客户、服务内容与金额" + amount + "并完成主管审批";
            case APPROVED -> "主管已审批，请核对到账" + amount + "并完成财务确认";
            case REJECTED -> "请按驳回要求修改后重新提交：" + abbreviate(comment, 300, "未填写驳回原因");
            case FINANCE_CONFIRMED -> "财务已确认，请继续完成合同和交付衔接";
            default -> "请查看提单最新状态";
        };
    }

    private String money(BigDecimal amount) {
        return amount == null ? "" : "（应付 ¥" + amount.stripTrailingZeros().toPlainString() + "）";
    }

    private String eventId(BizOrder order, String transition, Long approvalRecordId) {
        Long orderId = order == null ? null : order.getId();
        return "order:" + (orderId == null ? "unknown" : orderId) + ":"
                + (StringUtils.hasText(transition) ? transition : "unknown") + ":"
                + (approvalRecordId == null ? "unknown" : approvalRecordId);
    }

    private String abbreviate(String value, int max, String fallback) {
        String text = StringUtils.hasText(value) ? value.trim() : fallback;
        return text.length() <= max ? text : text.substring(0, max);
    }
}
