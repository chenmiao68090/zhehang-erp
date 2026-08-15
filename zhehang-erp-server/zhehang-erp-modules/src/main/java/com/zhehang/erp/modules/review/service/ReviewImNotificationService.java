package com.zhehang.erp.modules.review.service;

import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.im.domain.ImModels;
import com.zhehang.erp.modules.im.mapper.ImTaskQueryMapper;
import com.zhehang.erp.modules.im.service.ImNotificationOutboxService;
import com.zhehang.erp.modules.review.domain.entity.OrderReview;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;

/** 将审单节点转换为带唯一流水号的 IM 业务卡片。 */
@Service
@RequiredArgsConstructor
public class ReviewImNotificationService {
    public static final String ACTIVATED = "activated";
    public static final String HANDLER_ASSIGNED = "handler_assigned";
    public static final String ACCEPTED = "accepted";
    public static final String ACCEPT_REJECTED = "accept_rejected";
    public static final String COMPLETE_SUBMITTED = "complete_submitted";
    public static final String COMPLETED = "completed";
    public static final String COMPLETE_REJECTED = "complete_rejected";

    private final ImNotificationOutboxService outboxService;
    private final ImTaskQueryMapper recipientMapper;

    public void notifyTransition(OrderReview review, String transition, Long recordId,
                                 Long operatorId, String detail) {
        if (review == null || review.getId() == null || recordId == null
                || !StringUtils.hasText(transition)) {
            return;
        }
        Long tenantId = review.getTenantId() != null
                ? review.getTenantId() : SecurityUtils.getCurrentTenantId();
        if (tenantId == null) throw new BusinessException("审单通知缺少公司信息");
        LinkedHashSet<Long> recipients = recipients(review, transition, tenantId);
        recipients.remove(null);
        if (operatorId != null && recipients.size() > 1) recipients.remove(operatorId);
        if (recipients.isEmpty()) throw new BusinessException("未配置审单消息接收人");

        ImModels.BusinessNotification event = new ImModels.BusinessNotification();
        event.setEventId(eventId(review, transition, recordId));
        event.setEventType("review." + transition);
        event.setTitle(title(transition));
        event.setText(summary(review));
        event.setRecipientIds(new ArrayList<>(recipients));
        event.setBusinessType("review");
        event.setBusinessId(review.getId());
        event.setCurrentStatus(currentStatus(transition));
        event.setResponsibleId(responsibleId(review, transition, recipients));
        event.setOperatorId(operatorId);
        event.setOccurredAt(LocalDateTime.now());
        event.setRequirement(requirement(transition, detail));
        event.setActionLabel(actionLabel(transition));
        event.setActionUrl("/business-review?reviewId=" + review.getId());
        event.setImportant(ACCEPT_REJECTED.equals(transition)
                || COMPLETE_REJECTED.equals(transition));
        outboxService.enqueueBusinessEvent(event);
    }

    private LinkedHashSet<Long> recipients(OrderReview review, String transition, Long tenantId) {
        LinkedHashSet<Long> result = new LinkedHashSet<>();
        if (ACTIVATED.equals(transition)) {
            List<Long> managers = departmentManagers(review, tenantId);
            result.addAll(managers);
            if (managers.isEmpty()) {
                List<Long> bosses = recipientMapper.activeUserIdsByRoleKeys(List.of("boss"), tenantId);
                if (bosses != null) {
                    result.addAll(bosses);
                }
            }
            result.add(review.getSalesUserId());
            return result;
        }
        if (HANDLER_ASSIGNED.equals(transition) || COMPLETED.equals(transition)
                || COMPLETE_REJECTED.equals(transition)) {
            result.add(review.getHandlerUserId());
        } else {
            result.add(review.getSalesUserId());
            result.addAll(departmentManagers(review, tenantId));
        }
        if (result.isEmpty() || result.stream().allMatch(java.util.Objects::isNull)) {
            List<Long> bosses = recipientMapper.activeUserIdsByRoleKeys(List.of("boss"), tenantId);
            if (bosses != null) {
                result.addAll(bosses);
            }
        }
        return result;
    }

    private List<Long> departmentManagers(OrderReview review, Long tenantId) {
        if (review.getDeptId() == null) {
            return List.of();
        }
        List<Long> rows = recipientMapper.departmentManagerIds(review.getDeptId(), tenantId);
        return rows == null ? List.of() : rows;
    }

    private Long responsibleId(OrderReview review, String transition, LinkedHashSet<Long> recipients) {
        if (ACTIVATED.equals(transition)) {
            return recipients.iterator().next();
        }
        if (HANDLER_ASSIGNED.equals(transition) || COMPLETE_REJECTED.equals(transition)) {
            return review.getHandlerUserId();
        }
        if (COMPLETE_SUBMITTED.equals(transition) && review.getSalesUserId() != null) {
            return review.getSalesUserId();
        }
        return recipients.iterator().next();
    }

    private String title(String transition) {
        return switch (transition) {
            case ACTIVATED -> "提单已确认，待分配办事人员";
            case HANDLER_ASSIGNED -> "新审单待接收";
            case ACCEPTED -> "办事人员已接收";
            case ACCEPT_REJECTED -> "审单资料被退回";
            case COMPLETE_SUBMITTED -> "办理完成，待验收";
            case COMPLETED -> "审单已验收完成";
            case COMPLETE_REJECTED -> "办理结果被驳回";
            default -> "审单状态已更新";
        };
    }

    private String actionLabel(String transition) {
        return switch (transition) {
            case ACTIVATED -> "去分配";
            case HANDLER_ASSIGNED -> "去接收";
            case ACCEPT_REJECTED -> "去补资料";
            case COMPLETE_SUBMITTED -> "去验收";
            case COMPLETE_REJECTED -> "去重新办理";
            default -> "查看审单";
        };
    }

    private String currentStatus(String transition) {
        return switch (transition) {
            case ACTIVATED -> "pending_assign";
            case HANDLER_ASSIGNED -> "pending_accept";
            case ACCEPTED -> "processing";
            case ACCEPT_REJECTED -> "accept_rejected";
            case COMPLETE_SUBMITTED -> "pending_confirm";
            case COMPLETED -> "completed";
            case COMPLETE_REJECTED -> "complete_rejected";
            default -> "updated";
        };
    }

    private String requirement(String transition, String detail) {
        String safeDetail = abbreviate(detail, 300, "请查看审单详情");
        return switch (transition) {
            case ACTIVATED -> "请主管指定办事人员并设置办理截止时间";
            case HANDLER_ASSIGNED -> "请核对资料，确认接收；资料不齐须填写退回原因";
            case ACCEPTED -> "办事人员已接收，请按截止时间跟进办理结果";
            case ACCEPT_REJECTED -> "请补齐或纠正资料后重新分配：" + safeDetail;
            case COMPLETE_SUBMITTED -> "请核对办理结果与凭证并完成验收";
            case COMPLETED -> "办理结果已验收，审单闭环完成";
            case COMPLETE_REJECTED -> "请按验收意见重新办理并提交凭证：" + safeDetail;
            default -> safeDetail;
        };
    }

    private String summary(OrderReview review) {
        String customer = abbreviate(review.getCustomerName(), 80, "客户");
        String number = abbreviate(review.getReviewNo(), 40, "审单 #" + review.getId());
        String amount = money(review.getReceivableAmount());
        return customer + " · " + number + amount;
    }

    private String money(BigDecimal amount) {
        return amount == null ? "" : " · ¥" + amount.stripTrailingZeros().toPlainString();
    }

    private String eventId(OrderReview review, String transition, Long recordId) {
        Long reviewId = review == null ? null : review.getId();
        return "review:" + (reviewId == null ? "unknown" : reviewId) + ":"
                + (StringUtils.hasText(transition) ? transition : "unknown") + ":"
                + (recordId == null ? "unknown" : recordId);
    }

    private String abbreviate(String value, int max, String fallback) {
        String text = StringUtils.hasText(value) ? value.trim() : fallback;
        return text.length() <= max ? text : text.substring(0, max);
    }
}
