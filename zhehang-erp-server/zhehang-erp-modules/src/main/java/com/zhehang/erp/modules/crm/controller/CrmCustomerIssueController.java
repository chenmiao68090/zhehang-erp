package com.zhehang.erp.modules.crm.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.crm.domain.entity.CrmCustomerIssue;
import com.zhehang.erp.modules.crm.service.ICrmCustomerIssueService;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.time.LocalDateTime;

/**
 * 任务工单。
 *
 * <p>权限:所有登录员工可建单、可看与自己相关的工单(数据范围在 Service 收敛);
 * 分配负责人限老板/超管/部门主管;关闭工单限老板/超管;编辑与推进状态限创建人/负责人/协助人/管理层。</p>
 */
@RestController
@RequestMapping("/crm/issue")
@RequiredArgsConstructor
public class CrmCustomerIssueController {

    private final ICrmCustomerIssueService issueService;
    private final DataScopeHelper dataScopeHelper;

    @GetMapping("/list")
    public R<IPage<CrmCustomerIssue>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long ownerId,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String issueType,
            @RequestParam(required = false) Boolean overdue,
            @RequestParam(required = false) Boolean openOnly,
            @RequestParam(required = false) Boolean unhandled) {
        return R.ok(issueService.selectPage(pageNum, pageSize, keyword, status, ownerId, priority, issueType,
                overdue, openOnly, unhandled));
    }

    @GetMapping("/{id}")
    public R<Map<String, Object>> detail(@PathVariable Long id) {
        CrmCustomerIssue existing = issueService.getById(id);
        if (existing == null) {
            return R.fail("工单不存在");
        }
        if (!canEdit(existing)) {
            return R.fail("无权查看该工单");
        }
        return R.ok(issueService.detail(id));
    }

    @GetMapping("/stats")
    public R<Map<String, Object>> stats() {
        return R.ok(issueService.stats());
    }

    @PostMapping
    @Log(module = "任务工单", type = Log.OperationType.INSERT)
    public R<Long> add(@RequestBody CrmCustomerIssue issue) {
        if (!StringUtils.hasText(issue.getCustomerName())) {
            return R.fail("请选择或填写客户");
        }
        if (issue.getDeadline() == null) {
            return R.fail("请填写截止时间");
        }
        if (issue.getOwnerId() == null) {
            return R.fail("请选择主办人");
        }
        return R.ok(issueService.createIssue(issue));
    }

    @PostMapping("/from-message")
    @Log(module = "任务工单", type = Log.OperationType.INSERT)
    public R<Long> addFromMessage(@RequestBody Map<String, Object> body) {
        Long messageId = toLong(body.get("messageId"));
        if (messageId == null) {
            return R.fail("缺少消息ID");
        }
        LocalDateTime deadline = toLocalDateTime(body.get("deadline"));
        return R.ok(issueService.createIssueFromMessage(
                messageId,
                toStr(body.get("description")),
                toLong(body.get("ownerId")),
                deadline,
                toStr(body.get("priority")),
                toStr(body.get("issueType")),
                toLong(body.get("customerId")),
                toStr(body.get("customerName"))));
    }

    @PutMapping
    @Log(module = "任务工单", type = Log.OperationType.UPDATE)
    public R<Void> edit(@RequestBody CrmCustomerIssue issue) {
        CrmCustomerIssue existing = issueService.getById(issue.getId());
        if (existing == null) {
            return R.fail("工单不存在");
        }
        if (!canEdit(existing)) {
            return R.fail("无权修改他人工单");
        }
        if (issue.getOwnerId() == null) {
            return R.fail("请选择主办人");
        }
        issueService.updateIssue(issue);
        return R.ok();
    }

    @PostMapping("/{id}/assign")
    @Log(module = "任务工单", type = Log.OperationType.UPDATE)
    public R<Void> assign(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        if (!dataScopeHelper.isManagerOrAdmin()) {
            return R.fail("无权操作,仅老板/主管可分配负责人");
        }
        if (toLong(body.get("ownerId")) == null) {
            return R.fail("请选择主办人");
        }
        issueService.assign(id, toLong(body.get("ownerId")), toStr(body.get("ownerName")),
                toLong(body.get("assistId")), toStr(body.get("assistName")));
        return R.ok();
    }

    @PostMapping("/{id}/status")
    @Log(module = "任务工单", type = Log.OperationType.UPDATE)
    public R<Void> changeStatus(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        CrmCustomerIssue existing = issueService.getById(id);
        if (existing == null) {
            return R.fail("工单不存在");
        }
        if (!canEdit(existing)) {
            return R.fail("无权处理该工单");
        }
        issueService.changeStatus(id, toStr(body.get("status")), toStr(body.get("result")), toStr(body.get("remark")));
        return R.ok();
    }

    @PostMapping("/{id}/close")
    @Log(module = "任务工单", type = Log.OperationType.UPDATE)
    public R<Void> close(@PathVariable Long id, @RequestBody(required = false) Map<String, Object> body) {
        if (!(SecurityUtils.isCurrentAdmin() || SecurityUtils.hasAnyRole("boss"))) {
            return R.fail("无权操作,仅老板/超管可关闭工单");
        }
        issueService.close(id, body != null ? toStr(body.get("remark")) : null);
        return R.ok();
    }

    /** 创建人 / 负责人 / 协助人 / 管理层 可编辑与推进状态 */
    private boolean canEdit(CrmCustomerIssue issue) {
        if (dataScopeHelper.isManagerOrAdmin()) {
            return true;
        }
        Long uid = SecurityUtils.getCurrentUserId();
        return uid != null && (uid.equals(issue.getCreateBy())
                || uid.equals(issue.getOwnerId()) || uid.equals(issue.getAssistId()));
    }

    private Long toLong(Object o) {
        return o != null && StringUtils.hasText(o.toString()) ? Long.valueOf(o.toString()) : null;
    }

    private String toStr(Object o) {
        return o != null ? o.toString() : null;
    }

    private LocalDateTime toLocalDateTime(Object o) {
        if (o == null || !StringUtils.hasText(o.toString())) {
            return null;
        }
        try {
            return LocalDateTime.parse(o.toString().replace(" ", "T"));
        } catch (Exception e) {
            return null;
        }
    }
}
