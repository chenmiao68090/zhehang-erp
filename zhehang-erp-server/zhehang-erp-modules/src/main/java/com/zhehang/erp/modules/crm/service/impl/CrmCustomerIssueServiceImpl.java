package com.zhehang.erp.modules.crm.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.crm.domain.entity.CrmCustomerIssue;
import com.zhehang.erp.modules.crm.domain.entity.CrmCustomerIssueLog;
import com.zhehang.erp.modules.crm.mapper.CrmCustomerIssueLogMapper;
import com.zhehang.erp.modules.crm.mapper.CrmCustomerIssueMapper;
import com.zhehang.erp.modules.crm.service.ICrmCustomerIssueService;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.im.domain.ImModels;
import com.zhehang.erp.modules.im.domain.ImEntities;
import com.zhehang.erp.modules.im.mapper.ImMessageMapper;
import com.zhehang.erp.modules.im.mapper.ImTaskQueryMapper;
import com.zhehang.erp.modules.im.service.ImAccessService;
import com.zhehang.erp.modules.im.service.ImMessagingService;
import com.zhehang.erp.modules.im.service.ImNotificationOutboxService;
import com.zhehang.erp.modules.system.domain.entity.SysUser;
import com.zhehang.erp.modules.system.mapper.SysUserMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 客户服务工单 Service 实现。
 *
 * <p>数据范围收敛口径(参照 task 模块):老板/超管/data_scope=1 看全部;部门主管看本部门(及以下)
 * +与自己相关的;普通员工看"负责人=我 OR 协助人=我 OR 创建人=我"。统计接口复用同口径,避免越权看全公司。</p>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CrmCustomerIssueServiceImpl extends ServiceImpl<CrmCustomerIssueMapper, CrmCustomerIssue>
        implements ICrmCustomerIssueService {

    private static final String ST_COMPLETED = "completed";
    private final ImMessageMapper imMessageMapper;
    private final ImAccessService imAccessService;
    private final ImMessagingService imMessagingService;
    private static final String ST_CLOSED = "closed";
    private static final List<String> ALLOWED_STATUS = List.of("pending", "processing", "waiting", ST_COMPLETED, ST_CLOSED);

    private final CrmCustomerIssueLogMapper logMapper;
    private final DataScopeHelper dataScopeHelper;
    // 注入 SysUserMapper 取昵称写入流转记录操作人(crm 可跨 domain 注入,登录即可查)
    private final SysUserMapper sysUserMapper;
    private final ImNotificationOutboxService imOutboxService;
    private final ImTaskQueryMapper imTaskQueryMapper;

    @Override
    public IPage<CrmCustomerIssue> selectPage(int pageNum, int pageSize, String keyword, String status,
                                              Long ownerId, String priority, String issueType, Boolean overdue,
                                              Boolean openOnly, Boolean unhandled) {
        LambdaQueryWrapper<CrmCustomerIssue> wrapper = new LambdaQueryWrapper<>();
        applyIssueScope(wrapper);
        if (StringUtils.hasText(keyword)) {
            wrapper.and(w -> w.like(CrmCustomerIssue::getCustomerName, keyword)
                    .or().like(CrmCustomerIssue::getIssueNo, keyword)
                    .or().like(CrmCustomerIssue::getDescription, keyword));
        }
        if (Boolean.TRUE.equals(unhandled)) {
            wrapper.in(CrmCustomerIssue::getStatus, "pending", "processing", "waiting");
        } else {
            wrapper.eq(StringUtils.hasText(status), CrmCustomerIssue::getStatus, status);
        }
        wrapper
                .eq(ownerId != null, CrmCustomerIssue::getOwnerId, ownerId)
                .eq(StringUtils.hasText(priority), CrmCustomerIssue::getPriority, priority)
                .eq(StringUtils.hasText(issueType), CrmCustomerIssue::getIssueType, issueType);
        if (Boolean.TRUE.equals(openOnly)) {
            wrapper.notIn(CrmCustomerIssue::getStatus, ST_COMPLETED, ST_CLOSED);
        }
        if (Boolean.TRUE.equals(overdue)) {
            wrapper.lt(CrmCustomerIssue::getDeadline, LocalDateTime.now())
                    .notIn(CrmCustomerIssue::getStatus, ST_COMPLETED, ST_CLOSED);
        }
        wrapper.orderByDesc(CrmCustomerIssue::getCreateTime);
        return baseMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long createIssue(CrmCustomerIssue issue) {
        validateIssueForSave(issue);
        if (!StringUtils.hasText(issue.getIssueNo())) {
            issue.setIssueNo(genIssueNo());
        }
        if (!StringUtils.hasText(issue.getStatus())) {
            issue.setStatus("pending");
        }
        if (!StringUtils.hasText(issue.getPriority())) {
            issue.setPriority("P2");
        }
        // 有负责人时按其部门写归属部门,供部门主管按部门筛选
        if (issue.getOwnerId() != null && issue.getDeptId() == null) {
            issue.setDeptId(dataScopeHelper.deptIdOfUser(issue.getOwnerId()));
        }
        fillAssigneeNames(issue);
        if (issue.getBossInvolved() == null) {
            issue.setBossInvolved(0);
        }
        if (issue.getNeedReview() == null) {
            issue.setNeedReview(0);
        }
        if (ST_COMPLETED.equals(issue.getStatus())) {
            issue.setResolveTime(LocalDateTime.now());
        }
        baseMapper.insert(issue);
        writeLog(issue.getId(), "create", null, issue.getStatus(), "创建工单");
        notifyIssue(issue, "created", "新客户问题待处理", "请在截止时间前接收并处理", issue.getPriority());
        return issue.getId();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long createIssueFromMessage(Long messageId, String description, Long ownerId,
                                       LocalDateTime deadline, String priority, String issueType,
                                       Long customerId, String customerName) {
        if (messageId == null) {
            throw new BusinessException("缺少消息ID");
        }
        ImEntities.Message sourceMessage = imMessageMapper.selectById(messageId);
        if (sourceMessage == null) {
            throw new BusinessException("消息不存在");
        }
        if ("recalled".equalsIgnoreCase(sourceMessage.getStatus())) {
            throw new BusinessException("已撤回的消息不能下发任务工单");
        }
        // 当前用户必须是该消息所在会话的成员(与消息中心读权限一致)
        imAccessService.requireMember(sourceMessage.getConversationId());
        if (!StringUtils.hasText(description)) {
            throw new BusinessException("请填写任务内容");
        }
        if (deadline == null) {
            throw new BusinessException("请填写截止时间");
        }
        if (ownerId == null) {
            throw new BusinessException("请选择主办人");
        }

        CrmCustomerIssue issue = new CrmCustomerIssue();
        issue.setCustomerId(customerId);
        issue.setCustomerName(customerName);
        issue.setSource("im");
        issue.setSourceConversationId(sourceMessage.getConversationId());
        issue.setSourceMessageId(sourceMessage.getId());
        issue.setIssueType(StringUtils.hasText(issueType) ? issueType : "other");
        issue.setPriority(StringUtils.hasText(priority) ? priority : "P2");
        issue.setDescription(description);
        issue.setOwnerId(ownerId);
        issue.setDeadline(deadline);
        issue.setStatus("pending");
        issue.setIssueNo(genIssueNo());
        if (issue.getDeptId() == null) {
            issue.setDeptId(dataScopeHelper.deptIdOfUser(ownerId));
        }
        fillAssigneeNames(issue);
        issue.setBossInvolved(0);
        issue.setNeedReview(0);
        baseMapper.insert(issue);
        writeLog(issue.getId(), "create", null, issue.getStatus(), "从聊天消息下发任务工单");
        notifyIssue(issue, "created", "新任务工单待处理", "请确认接收并按截止时间处理", issue.getPriority());

        // 会话内插入工单业务卡(BusinessCard 已支持 issue 类型),@ 接收人仅在主办人是会话成员时生效
        Map<String, Object> extra = new LinkedHashMap<>();
        extra.put("eventId", "crm-issue:" + issue.getId() + ":created");
        extra.put("eventType", "customer_issue.created");
        extra.put("title", "任务工单已下发：" + issue.getIssueNo());
        extra.put("businessType", "issue");
        extra.put("businessId", issue.getId());
        extra.put("currentStatus", issue.getStatus());
        extra.put("responsibleId", issue.getOwnerId());
        extra.put("responsibleName", issue.getOwnerName());
        extra.put("operatorId", SecurityUtils.getCurrentUserId());
        extra.put("operatorName", SecurityUtils.getCurrentUsername());
        extra.put("occurredAt", LocalDateTime.now());
        String requirement = (StringUtils.hasText(issue.getCustomerName()) ? issue.getCustomerName() + " · " : "")
                + description + (issue.getDeadline() != null ? "（截止 " + issue.getDeadline() + "）" : "");
        extra.put("requirement", requirement);
        extra.put("actionLabel", "去处理");
        extra.put("actionUrl", "/customer-issue/list?issueId=" + issue.getId());
        imMessagingService.sendStructuredMessage(
                sourceMessage.getConversationId(),
                "issue:" + issue.getId() + ":created",
                "business",
                "任务工单已下发：" + issue.getIssueNo(),
                extra, false, List.of());
        return issue.getId();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateIssue(CrmCustomerIssue issue) {
        CrmCustomerIssue old = baseMapper.selectById(issue.getId());
        if (old == null) {
            throw new BusinessException("工单不存在");
        }
        if (!StringUtils.hasText(issue.getStatus())) {
            issue.setStatus(old.getStatus());
        }
        validateIssueForSave(issue);
        fillAssigneeNames(issue);
        Long deptId = dataScopeHelper.deptIdOfUser(issue.getOwnerId());
        LocalDateTime resolveTime = old.getResolveTime();
        if (ST_COMPLETED.equals(issue.getStatus()) && resolveTime == null) {
            resolveTime = LocalDateTime.now();
        }
        lambdaUpdate()
                .eq(CrmCustomerIssue::getId, issue.getId())
                .set(CrmCustomerIssue::getCustomerId, issue.getCustomerId())
                .set(CrmCustomerIssue::getCustomerName, issue.getCustomerName())
                .set(CrmCustomerIssue::getSource, issue.getSource())
                .set(CrmCustomerIssue::getIssueType, issue.getIssueType())
                .set(CrmCustomerIssue::getPriority, issue.getPriority())
                .set(CrmCustomerIssue::getDescription, issue.getDescription())
                .set(CrmCustomerIssue::getOwnerId, issue.getOwnerId())
                .set(CrmCustomerIssue::getOwnerName, issue.getOwnerName())
                .set(CrmCustomerIssue::getAssistId, issue.getAssistId())
                .set(CrmCustomerIssue::getAssistName, issue.getAssistName())
                .set(CrmCustomerIssue::getDeptId, deptId)
                .set(CrmCustomerIssue::getDeadline, issue.getDeadline())
                .set(CrmCustomerIssue::getStatus, issue.getStatus())
                .set(CrmCustomerIssue::getResult, issue.getResult())
                .set(CrmCustomerIssue::getResolveTime, resolveTime)
                .set(CrmCustomerIssue::getBossInvolved, issue.getBossInvolved() == null ? 0 : issue.getBossInvolved())
                .set(CrmCustomerIssue::getNeedReview, issue.getNeedReview() == null ? 0 : issue.getNeedReview())
                .set(CrmCustomerIssue::getReviewNote, issue.getReviewNote())
                .update();
        writeLog(issue.getId(), "update", old.getStatus(), issue.getStatus(), "更新服务任务信息");
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void assign(Long id, Long ownerId, String ownerName, Long assistId, String assistName) {
        CrmCustomerIssue issue = baseMapper.selectById(id);
        if (issue == null) {
            throw new BusinessException("工单不存在");
        }
        if (ownerId == null) {
            throw new BusinessException("请选择主办人");
        }
        if (!StringUtils.hasText(ownerName)) {
            ownerName = userName(ownerId);
        }
        if (assistId != null && !StringUtils.hasText(assistName)) {
            assistName = userName(assistId);
        }
        issue.setOwnerId(ownerId);
        issue.setOwnerName(ownerName);
        issue.setAssistId(assistId);
        issue.setAssistName(assistName);
        issue.setDeptId(dataScopeHelper.deptIdOfUser(ownerId));
        lambdaUpdate()
                .eq(CrmCustomerIssue::getId, id)
                .set(CrmCustomerIssue::getOwnerId, ownerId)
                .set(CrmCustomerIssue::getOwnerName, ownerName)
                .set(CrmCustomerIssue::getAssistId, assistId)
                .set(CrmCustomerIssue::getAssistName, assistName)
                .set(CrmCustomerIssue::getDeptId, issue.getDeptId())
                .update();
        Long assignmentLogId = writeLog(id, "assign", issue.getStatus(), issue.getStatus(),
                "主办人:" + (StringUtils.hasText(ownerName) ? ownerName : ownerId)
                        + (StringUtils.hasText(assistName) ? ",协同:" + assistName : ""));
        notifyIssue(issue, "assigned_" + assignmentLogId, "客户问题已分配", "请确认责任并及时跟进", issue.getPriority());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void changeStatus(Long id, String status, String result, String remark) {
        CrmCustomerIssue issue = baseMapper.selectById(id);
        if (issue == null) {
            throw new BusinessException("工单不存在");
        }
        if (!ALLOWED_STATUS.contains(status)) {
            throw new BusinessException("工单状态不正确");
        }
        // 完成工单前必须有处理结果(本次提交或历史已填)
        if (ST_COMPLETED.equals(status)
                && !StringUtils.hasText(result) && !StringUtils.hasText(issue.getResult())) {
            throw new BusinessException("完成工单前必须填写处理结果");
        }
        String from = issue.getStatus();
        issue.setStatus(status);
        if (StringUtils.hasText(result)) {
            issue.setResult(result);
        }
        if (ST_COMPLETED.equals(status)) {
            issue.setResolveTime(LocalDateTime.now());
        }
        baseMapper.updateById(issue);
        writeLog(id, "status", from, status, remark);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void close(Long id, String remark) {
        CrmCustomerIssue issue = baseMapper.selectById(id);
        if (issue == null) {
            throw new BusinessException("工单不存在");
        }
        String from = issue.getStatus();
        issue.setStatus(ST_CLOSED);
        baseMapper.updateById(issue);
        writeLog(id, "close", from, ST_CLOSED, StringUtils.hasText(remark) ? remark : "关闭工单");
    }

    @Override
    public Map<String, Object> detail(Long id) {
        Map<String, Object> map = new HashMap<>();
        map.put("issue", baseMapper.selectById(id));
        List<CrmCustomerIssueLog> logs = logMapper.selectList(new LambdaQueryWrapper<CrmCustomerIssueLog>()
                .eq(CrmCustomerIssueLog::getIssueId, id)
                .orderByAsc(CrmCustomerIssueLog::getCreateTime));
        map.put("logs", logs);
        return map;
    }

    @Override
    public Map<String, Object> stats() {
        Map<String, Object> result = new HashMap<>();
        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        LocalDateTime now = LocalDateTime.now();

        // 今日新增
        LambdaQueryWrapper<CrmCustomerIssue> todayW = new LambdaQueryWrapper<>();
        applyIssueScope(todayW);
        todayW.ge(CrmCustomerIssue::getCreateTime, todayStart);
        result.put("todayNew", baseMapper.selectCount(todayW));

        // 未处理(待处理)
        LambdaQueryWrapper<CrmCustomerIssue> pendW = new LambdaQueryWrapper<>();
        applyIssueScope(pendW);
        pendW.eq(CrmCustomerIssue::getStatus, "pending");
        result.put("unhandled", baseMapper.selectCount(pendW));

        // 逾期(未完成未关闭 且 截止时间已过)
        LambdaQueryWrapper<CrmCustomerIssue> overW = new LambdaQueryWrapper<>();
        applyIssueScope(overW);
        overW.lt(CrmCustomerIssue::getDeadline, now)
                .notIn(CrmCustomerIssue::getStatus, ST_COMPLETED, ST_CLOSED);
        result.put("overdue", baseMapper.selectCount(overW));

        // P0(未完成未关闭)
        LambdaQueryWrapper<CrmCustomerIssue> p0W = new LambdaQueryWrapper<>();
        applyIssueScope(p0W);
        p0W.eq(CrmCustomerIssue::getPriority, "P0")
                .notIn(CrmCustomerIssue::getStatus, ST_COMPLETED, ST_CLOSED);
        result.put("p0", baseMapper.selectCount(p0W));

        return result;
    }

    /** 保存前的硬规则:工单必须能被一个人闭环,且完成时要能给客户交代结果。 */
    private void validateIssueForSave(CrmCustomerIssue issue) {
        if (!StringUtils.hasText(issue.getCustomerName())) {
            throw new BusinessException("请选择或填写客户");
        }
        if (!StringUtils.hasText(issue.getDescription())) {
            throw new BusinessException("请填写问题描述");
        }
        if (issue.getOwnerId() == null) {
            throw new BusinessException("请选择主办人");
        }
        if (issue.getDeadline() == null) {
            throw new BusinessException("请填写截止时间");
        }
        if (StringUtils.hasText(issue.getStatus()) && !ALLOWED_STATUS.contains(issue.getStatus())) {
            throw new BusinessException("工单状态不正确");
        }
        if (ST_COMPLETED.equals(issue.getStatus()) && !StringUtils.hasText(issue.getResult())) {
            throw new BusinessException("完成工单前必须填写处理结果");
        }
    }

    /** 前端未带姓名时兜底补全,避免列表只显示 ID 或空白。 */
    private void fillAssigneeNames(CrmCustomerIssue issue) {
        if (issue.getOwnerId() != null && !StringUtils.hasText(issue.getOwnerName())) {
            issue.setOwnerName(userName(issue.getOwnerId()));
        }
        if (issue.getAssistId() != null && !StringUtils.hasText(issue.getAssistName())) {
            issue.setAssistName(userName(issue.getAssistId()));
        }
    }

    /**
     * 工单数据范围收敛:老板/超管/data_scope=1 看全部;部门主管看本部门(及以下)+与自己相关;
     * 其余员工看"负责人=我 OR 协助人=我 OR 创建人=我"。selectPage 与 stats 复用,口径一致防越权。
     */
    private void applyIssueScope(LambdaQueryWrapper<CrmCustomerIssue> wrapper) {
        Integer scope = SecurityUtils.getCurrentDataScope();
        boolean seeAll = SecurityUtils.isCurrentAdmin()
                || SecurityUtils.hasAnyRole("boss")
                || (scope != null && scope == 1);
        if (seeAll) {
            return;
        }
        Long uid = SecurityUtils.getCurrentUserId();
        if (SecurityUtils.hasAnyRole("dept_manager", "manager")) {
            Long myDept = SecurityUtils.getCurrentDeptId();
            if (myDept != null) {
                List<Long> deptIds = dataScopeHelper.deptSelfAndChildren(myDept);
                wrapper.and(w -> w.in(CrmCustomerIssue::getDeptId, deptIds)
                        .or().eq(CrmCustomerIssue::getOwnerId, uid)
                        .or().eq(CrmCustomerIssue::getAssistId, uid)
                        .or().eq(CrmCustomerIssue::getCreateBy, uid));
                return;
            }
        }
        // 普通员工/主管无部门:仅与自己相关
        wrapper.and(w -> w.eq(CrmCustomerIssue::getOwnerId, uid)
                .or().eq(CrmCustomerIssue::getAssistId, uid)
                .or().eq(CrmCustomerIssue::getCreateBy, uid));
    }

    /** 生成工单编号:GD + yyyyMMdd + 当天3位流水(同租户内当天计数) */
    private String genIssueNo() {
        String day = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        Long cnt = baseMapper.selectCount(new LambdaQueryWrapper<CrmCustomerIssue>()
                .likeRight(CrmCustomerIssue::getIssueNo, "GD" + day));
        long seq = (cnt == null ? 0L : cnt) + 1;
        return "GD" + day + String.format("%03d", seq);
    }

    /** 写一条流转记录(操作人取当前登录用户昵称) */
    private Long writeLog(Long issueId, String action, String fromStatus, String toStatus, String remark) {
        CrmCustomerIssueLog logRow = new CrmCustomerIssueLog();
        logRow.setIssueId(issueId);
        logRow.setAction(action);
        logRow.setFromStatus(fromStatus);
        logRow.setToStatus(toStatus);
        logRow.setOperatorId(SecurityUtils.getCurrentUserId());
        logRow.setOperatorName(currentUserName());
        logRow.setRemark(remark);
        logMapper.insert(logRow);
        return logRow.getId();
    }

    /** 当前登录用户昵称,取不到时回退登录名 */
    private String currentUserName() {
        Long uid = SecurityUtils.getCurrentUserId();
        String name = userName(uid);
        return StringUtils.hasText(name) ? name : SecurityUtils.getCurrentUsername();
    }

    private String userName(Long uid) {
        if (uid != null) {
            SysUser u = sysUserMapper.selectById(uid);
            if (u != null && StringUtils.hasText(u.getNickname())) {
                return u.getNickname();
            }
            if (u != null && StringUtils.hasText(u.getUsername())) {
                return u.getUsername();
            }
        }
        return null;
    }

    private void notifyIssue(CrmCustomerIssue issue, String eventSuffix, String title,
                             String requirement, String priority) {
        if (issue == null || issue.getId() == null || issue.getOwnerId() == null) return;
        ImModels.BusinessNotification event = new ImModels.BusinessNotification();
        event.setEventId("crm-issue:" + issue.getId() + ":" + eventSuffix);
        event.setEventType("customer_issue." + eventSuffix.replaceAll("_[0-9]+$", ""));
        event.setTitle(title);
        event.setText((StringUtils.hasText(issue.getCustomerName()) ? issue.getCustomerName() : "客户")
                + " · " + (StringUtils.hasText(issue.getIssueNo()) ? issue.getIssueNo() : "客户问题"));
        java.util.LinkedHashSet<Long> recipients = new java.util.LinkedHashSet<>();
        recipients.add(issue.getOwnerId());
        if (issue.getAssistId() != null) recipients.add(issue.getAssistId());
        if (issue.getDeptId() != null) {
            recipients.addAll(imTaskQueryMapper.departmentManagerIds(issue.getDeptId(), SecurityUtils.getCurrentTenantId()));
        }
        event.setRecipientIds(new java.util.ArrayList<>(recipients));
        event.setBusinessType("issue");
        event.setBusinessId(issue.getId());
        event.setCurrentStatus(issue.getStatus());
        event.setResponsibleId(issue.getOwnerId());
        event.setOperatorId(SecurityUtils.getCurrentUserId());
        event.setOccurredAt(LocalDateTime.now());
        event.setRequirement(requirement + (issue.getDeadline() != null ? "（截止 " + issue.getDeadline() + "）" : ""));
        event.setActionLabel("去处理");
        event.setActionUrl("/customer-issue/list?issueId=" + issue.getId());
        event.setImportant("P0".equalsIgnoreCase(priority) || "P1".equalsIgnoreCase(priority));
        imOutboxService.enqueueBusinessEvent(event);
    }
}
