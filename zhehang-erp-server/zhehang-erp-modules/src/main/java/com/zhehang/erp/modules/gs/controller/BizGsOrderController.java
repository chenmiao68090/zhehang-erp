package com.zhehang.erp.modules.gs.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.annotation.DenyDuringImpersonation;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.gs.domain.BizGsOrder;
import com.zhehang.erp.modules.gs.domain.GsColleagueVO;
import com.zhehang.erp.modules.gs.mapper.BizGsOrderMapper;
import com.zhehang.erp.modules.im.service.ImBusinessNotificationPublisher;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * 工商业务·工商订单与办理进度。
 *
 * <p>外勤工单跟踪:提单审核后由「分配人」(工商主管/管理员)分配给办事员;
 * 分配人看全部工单 + 各办事员办理状态并做分配;办事员只看分配给自己的工单,
 * 并能更新办理进度/状态(带归属校验,非本人分配的改不动)。</p>
 */
@RestController
@RequestMapping("/gs/order")
@RequiredArgsConstructor
@DenyDuringImpersonation(reason = "工商订单附件包含法人身份证等个人敏感资料")
public class BizGsOrderController {

    private final BizGsOrderMapper orderMapper;
    private final DataScopeHelper dataScopeHelper;
    private final ImBusinessNotificationPublisher notificationPublisher;

    @GetMapping("/list")
    public R<IPage<BizGsOrder>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String businessType,
            @RequestParam(required = false) String scope) {
        LambdaQueryWrapper<BizGsOrder> qw = new LambdaQueryWrapper<BizGsOrder>()
                .like(StringUtils.hasText(keyword), BizGsOrder::getCompanyName, keyword)
                .eq(StringUtils.hasText(status), BizGsOrder::getStatus, status)
                .eq(StringUtils.hasText(businessType), BizGsOrder::getBusinessType, businessType);
        boolean mineScope = "mine".equalsIgnoreCase(scope) || "submitted".equalsIgnoreCase(scope);
        boolean handlerScope = "handler".equalsIgnoreCase(scope) || "assigned".equalsIgnoreCase(scope);
        if (mineScope) {
            // 提单中心:提交人看自己提交的订单,便于被驳回后修改重提。
            qw.eq(BizGsOrder::getCreateBy, currentUserIdSafe());
        } else if (handlerScope || !isAssigner()) {
            // 办事员视角:handlerScope=分配人主动切换看"分配给我的工单",或本就是办事员→只看分配给自己的工单。
            qw.eq(BizGsOrder::getAssigneeId, currentUserIdSafe());
        }
        qw.orderByDesc(BizGsOrder::getReceivedDate).orderByDesc(BizGsOrder::getId);
        IPage<BizGsOrder> page = orderMapper.selectPage(new Page<>(pageNum, pageSize), qw);
        fillAssigneeName(page.getRecords());
        return R.ok(page);
    }

    /** 当前登录人是否为「分配人」视角(工商主管/管理员/老板)。 */
    @GetMapping("/is-assigner")
    public R<Boolean> isAssignerApi() {
        return R.ok(isAssigner());
    }

    /** 可分配的办事员列表(已开通账号的员工:userId + 姓名 + 部门)。 */
    @GetMapping("/colleagues")
    public R<List<GsColleagueVO>> colleagues() {
        return R.ok(orderMapper.selectColleagues());
    }

    @PostMapping
    @Log(module = "工商业务", type = Log.OperationType.INSERT)
    public R<Void> add(@RequestBody BizGsOrder order) {
        if (order.getStatus() == null || order.getStatus().isBlank()) {
            // 提单默认进入「待审核」,由分配人审核后再分配
            order.setStatus("reviewing");
        }
        orderMapper.insert(order);
        return R.ok();
    }

    @PutMapping
    @Log(module = "工商业务", type = Log.OperationType.UPDATE)
    public R<Void> edit(@RequestBody BizGsOrder order) {
        if (!isAssigner()) {
            BizGsOrder existing = order.getId() != null ? orderMapper.selectById(order.getId()) : null;
            if (existing == null) {
                return R.fail("工单不存在");
            }
            boolean ownRejected = Objects.equals(existing.getCreateBy(), currentUserIdSafe())
                    && "rejected".equals(existing.getStatus());
            if (!ownRejected) {
                return R.fail("仅可修改自己被驳回的工商提单");
            }
            order.setStatus("reviewing");
            order.setProgressNote(appendProgressNote(existing.getProgressNote(), "提交人修改后重新提交待审核"));
        }
        orderMapper.updateById(order);
        return R.ok();
    }

    /** 审核工单(分配人):审核通过 → 待分配(pending);驳回 → rejected。 */
    @PostMapping("/review")
    @Log(module = "工商业务", type = Log.OperationType.UPDATE)
    public R<Void> review(@RequestBody Map<String, Object> params) {
        if (!isAssigner()) {
            return R.fail("无权限审核工单");
        }
        Long id = parseId(params.get("id"));
        if (id == null) {
            return R.fail("缺少工单ID");
        }
        BizGsOrder existing = orderMapper.selectById(id);
        if (existing == null) {
            return R.fail("工单不存在");
        }
        boolean pass = !"false".equalsIgnoreCase(String.valueOf(params.get("pass")));
        String note = params.get("progressNote") == null ? "" : String.valueOf(params.get("progressNote")).trim();
        String line = pass ? "审核通过,进入待分配" : "审核驳回";
        if (StringUtils.hasText(note)) {
            line += ":" + note;
        }
        LambdaUpdateWrapper<BizGsOrder> uw = new LambdaUpdateWrapper<BizGsOrder>()
                .eq(BizGsOrder::getId, id)
                .set(BizGsOrder::getStatus, pass ? "pending" : "rejected")
                .set(BizGsOrder::getProgressNote, appendProgressNote(existing.getProgressNote(), line));
        orderMapper.update(null, uw);
        return R.ok();
    }

    /** 分配办事员(分配人):设 assigneeId + 状态置为办理中(processing)。 */
    @PostMapping("/assign")
    @Log(module = "工商业务", type = Log.OperationType.UPDATE)
    @Transactional(rollbackFor = Exception.class)
    public R<Void> assign(@RequestBody Map<String, Object> params) {
        if (!isAssigner()) {
            return R.fail("无权限分配工单");
        }
        Long id = parseId(params.get("id"));
        Long assigneeId = parseId(params.get("assigneeId"));
        if (id == null || assigneeId == null) {
            return R.fail("缺少工单ID或办事员");
        }
        BizGsOrder existing = orderMapper.selectById(id);
        if (existing == null) {
            return R.fail("工单不存在");
        }
        // 同一办事员的重复提交按幂等成功处理，避免重复写进度和重复发消息。
        if (Objects.equals(existing.getAssigneeId(), assigneeId)
                && "processing".equals(existing.getStatus())) {
            return R.ok();
        }
        String handler = params.get("handler") == null ? "" : String.valueOf(params.get("handler")).trim();
        int assignmentSequence = nextAssignmentSequence(existing.getProgressNote());
        LambdaUpdateWrapper<BizGsOrder> uw = new LambdaUpdateWrapper<BizGsOrder>()
                .eq(BizGsOrder::getId, id)
                .set(BizGsOrder::getAssigneeId, assigneeId)
                .set(BizGsOrder::getStatus, "processing")
                .set(BizGsOrder::getProgressNote, appendProgressNote(existing.getProgressNote(),
                        "分配给办事员" + (StringUtils.hasText(handler) ? "【" + handler + "】" : "") + ",进入办理中"));
        // 分配时可选带办理人姓名(与办事员一致,方便旧列表回显)
        if (StringUtils.hasText(handler)) {
            uw.set(BizGsOrder::getHandler, handler);
        }
        orderMapper.update(null, uw);
        // 与派单同事务登记 IM outbox；登记失败即回滚派单，杜绝“已派单但收不到消息”。
        String companyName = StringUtils.hasText(existing.getCompanyName())
                ? existing.getCompanyName().trim() : "工商客户";
        notificationPublisher.publish(ImBusinessNotificationPublisher.Notice.builder()
                .eventId("gs-order:" + id + ":assigned:" + assigneeId + ":" + assignmentSequence)
                .eventType("gs_order.assigned")
                .title("新工单待办理")
                .text(companyName + " · 工商工单已分配给你")
                .recipientIds(List.of(assigneeId))
                .businessType("gs_order")
                .businessId(id)
                .currentStatus("processing")
                .responsibleId(assigneeId)
                .requirement("请核对客户资料并及时更新办理进度")
                .actionLabel("去办理")
                .actionUrl("/gs/order")
                .build());
        return R.ok();
    }

    /** 更新办理进度(办事员填:状态 + 进度说明)。带归属校验:非本人分配的工单改不动。 */
    @PostMapping("/progress")
    @Log(module = "工商业务", type = Log.OperationType.UPDATE)
    public R<Void> updateProgress(@RequestBody Map<String, Object> params) {
        Long id = parseId(params.get("id"));
        if (id == null) {
            return R.fail("缺少工单ID");
        }
        BizGsOrder existing = orderMapper.selectById(id);
        if (existing == null) {
            return R.fail("工单不存在");
        }
        // 归属校验:分配人可改任意工单;办事员只能改分配给自己的
        Long uid = currentUserIdSafe();
        if (!isAssigner() && !Objects.equals(existing.getAssigneeId(), uid)) {
            return R.fail("只能更新分配给你自己的工单");
        }
        LambdaUpdateWrapper<BizGsOrder> uw = new LambdaUpdateWrapper<BizGsOrder>()
                .eq(BizGsOrder::getId, id);
        boolean touched = false;
        String status = null;
        if (params.get("status") != null) {
            status = String.valueOf(params.get("status"));
            uw.set(BizGsOrder::getStatus, status);
            touched = true;
        }
        String note = null;
        if (params.get("progressNote") != null) {
            note = String.valueOf(params.get("progressNote")).trim();
            touched = true;
        }
        if (!touched) {
            return R.ok();
        }
        StringBuilder line = new StringBuilder();
        if (StringUtils.hasText(status)) {
            line.append("更新进度为【").append(statusLabel(status)).append("】");
        } else {
            line.append("补充进度");
        }
        if (StringUtils.hasText(note)) {
            line.append(":").append(note);
        }
        uw.set(BizGsOrder::getProgressNote, appendProgressNote(existing.getProgressNote(), line.toString()));
        orderMapper.update(null, uw);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    @Log(module = "工商业务", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        if (!isAssigner()) {
            return R.fail("无权限删除工单");
        }
        orderMapper.deleteById(id);
        return R.ok();
    }

    // ---- helpers -------------------------------------------------------------

    /** 分配人视角:工商主管/管理员/老板(复用 DataScopeHelper.isManagerOrAdmin 口径)。 */
    private boolean isAssigner() {
        return dataScopeHelper.isManagerOrAdmin();
    }

    private Long currentUserIdSafe() {
        Long uid = SecurityUtils.getCurrentUserId();
        return uid != null ? uid : -1L;
    }

    private Long parseId(Object v) {
        if (v == null) {
            return null;
        }
        String s = String.valueOf(v).trim();
        if (s.isEmpty() || "null".equals(s)) {
            return null;
        }
        try {
            return Long.valueOf(s);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private String appendProgressNote(String oldNote, String line) {
        String cleanLine = line == null ? "" : line.trim();
        if (!StringUtils.hasText(cleanLine)) {
            return oldNote;
        }
        String operator = SecurityUtils.getCurrentUsername();
        String prefix = "[" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")) + "]";
        if (StringUtils.hasText(operator)) {
            prefix += "[" + operator + "]";
        }
        String next = prefix + " " + cleanLine;
        if (!StringUtils.hasText(oldNote)) {
            return next;
        }
        return oldNote.trim() + "\n" + next;
    }

    /** 以已落库的分配历史生成稳定序号；事务回滚后重试仍得到同一事件号。 */
    private int nextAssignmentSequence(String progressNote) {
        if (!StringUtils.hasText(progressNote)) {
            return 1;
        }
        int count = 0;
        int from = 0;
        String marker = "分配给办事员";
        while ((from = progressNote.indexOf(marker, from)) >= 0) {
            count++;
            from += marker.length();
        }
        return count + 1;
    }

    private String statusLabel(String status) {
        if ("reviewing".equals(status)) return "待审核";
        if ("pending".equals(status)) return "待分配";
        if ("collecting".equals(status)) return "资料收集";
        if ("submitted".equals(status)) return "已提交工商";
        if ("processing".equals(status)) return "办理中";
        if ("done".equals(status)) return "已完成";
        if ("rejected".equals(status)) return "已驳回";
        return status;
    }

    /** 批量回填办事员姓名(assigneeId -> org_employee.name)。 */
    private void fillAssigneeName(List<BizGsOrder> records) {
        if (records == null || records.isEmpty()) {
            return;
        }
        boolean hasAssignee = records.stream().anyMatch(r -> r.getAssigneeId() != null);
        if (!hasAssignee) {
            return;
        }
        Map<Long, String> nameByUserId = new HashMap<>();
        List<GsColleagueVO> names = orderMapper.selectUserNames();
        if (names != null) {
            nameByUserId = names.stream()
                    .filter(v -> v.getUserId() != null)
                    .collect(Collectors.toMap(GsColleagueVO::getUserId, GsColleagueVO::getName, (a, b) -> a));
        }
        for (BizGsOrder r : records) {
            if (r.getAssigneeId() != null) {
                r.setAssigneeName(nameByUserId.get(r.getAssigneeId()));
            }
        }
    }
}
