package com.zhehang.erp.modules.dashboard.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.channel.domain.BizProcurement;
import com.zhehang.erp.modules.channel.mapper.BizProcurementMapper;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.dashboard.domain.vo.DashboardStatsVO;
import com.zhehang.erp.modules.dashboard.domain.vo.NoticeVO;
import com.zhehang.erp.modules.dashboard.domain.vo.TodoVO;
import com.zhehang.erp.modules.finance.domain.entity.FinanceReimburse;
import com.zhehang.erp.modules.finance.mapper.FinanceReimburseMapper;
import com.zhehang.erp.modules.order.domain.BizOrder;
import com.zhehang.erp.modules.order.mapper.BizOrderMapper;
import com.zhehang.erp.modules.receipt.domain.BizRefundRequest;
import com.zhehang.erp.modules.receipt.mapper.BizRefundRequestMapper;
import com.zhehang.erp.modules.task.domain.BizCommission;
import com.zhehang.erp.modules.task.mapper.BizCommissionMapper;
import com.zhehang.erp.modules.workflow.domain.entity.WfTask;
import com.zhehang.erp.modules.workflow.domain.vo.WfTaskVO;
import com.zhehang.erp.modules.workflow.mapper.WfTaskMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final WfTaskMapper wfTaskMapper;
    private final BizOrderMapper bizOrderMapper;
    private final BizRefundRequestMapper refundMapper;
    private final BizCommissionMapper commissionMapper;
    private final BizProcurementMapper procurementMapper;
    private final FinanceReimburseMapper reimburseMapper;
    private final DataScopeHelper dataScopeHelper;

    private static final DateTimeFormatter DUE_FMT = DateTimeFormatter.ofPattern("MM-dd HH:mm");

    /**
     * 首页"待我审批"聚合:审批中心待办 + 各业务侧待批(按当前人角色可批的池子)。
     * 提单status=2待主管/3待财务;退款pending待主管/approved待财务;
     * 提成status=2待主管/3待财务/4待老板/1待本人(销售)确认;采购pending_approval待主管/pending_boss待老板;
     * 报销status=1待审(审批角色)。无权批的人对应项为0,不虚报。
     */
    @GetMapping("/approval-summary")
    public R<Map<String, Long>> approvalSummary() {
        Long uid = SecurityUtils.getCurrentUserId();
        Map<String, Long> m = new LinkedHashMap<>();
        long wfTodo = uid == null ? 0 : wfTaskMapper.selectCount(new LambdaQueryWrapper<WfTask>()
                .eq(WfTask::getAssigneeId, uid).eq(WfTask::getStatus, 0));
        boolean manager = dataScopeHelper.isManagerOrAdmin();
        boolean finance = SecurityUtils.isCurrentAdmin() || SecurityUtils.hasAnyRole("finance", "finance_hq");
        boolean boss = SecurityUtils.isCurrentAdmin() || SecurityUtils.hasAnyRole("boss");

        long bizOrder = 0;
        if (manager) {
            bizOrder += bizOrderMapper.selectCount(new LambdaQueryWrapper<BizOrder>().eq(BizOrder::getStatus, 2));
        }
        if (finance) {
            bizOrder += bizOrderMapper.selectCount(new LambdaQueryWrapper<BizOrder>().eq(BizOrder::getStatus, 3));
        }
        long refund = 0;
        if (manager) {
            refund += refundMapper.selectCount(new LambdaQueryWrapper<BizRefundRequest>().eq(BizRefundRequest::getStatus, "pending"));
        }
        if (finance) {
            refund += refundMapper.selectCount(new LambdaQueryWrapper<BizRefundRequest>().eq(BizRefundRequest::getStatus, "approved"));
        }
        long commission = 0;
        if (uid != null) {
            commission += commissionMapper.selectCount(new LambdaQueryWrapper<BizCommission>()
                    .eq(BizCommission::getStatus, 1).eq(BizCommission::getSalesmanId, uid));
        }
        if (manager) {
            commission += commissionMapper.selectCount(new LambdaQueryWrapper<BizCommission>().eq(BizCommission::getStatus, 2));
        }
        if (finance) {
            commission += commissionMapper.selectCount(new LambdaQueryWrapper<BizCommission>().eq(BizCommission::getStatus, 3));
        }
        if (boss) {
            commission += commissionMapper.selectCount(new LambdaQueryWrapper<BizCommission>().eq(BizCommission::getStatus, 4));
        }
        long procurement = 0;
        if (manager) {
            procurement += procurementMapper.selectCount(new LambdaQueryWrapper<BizProcurement>().eq(BizProcurement::getStatus, "pending_approval"));
        }
        if (boss) {
            procurement += procurementMapper.selectCount(new LambdaQueryWrapper<BizProcurement>().eq(BizProcurement::getStatus, "pending_boss"));
        }
        // 报销已收编进审批中心(expense 流程),其待办已计入 wfTodo,这里不再单算防重复计数;
        // 仅剩的存量直批单(无 wf 关联)数量极少,由财务在报销台账处理
        long reimburse = 0;
        m.put("wfTodo", wfTodo);
        m.put("bizOrder", bizOrder);
        m.put("refund", refund);
        m.put("commission", commission);
        m.put("procurement", procurement);
        m.put("reimburse", reimburse);
        m.put("total", wfTodo + bizOrder + refund + commission + procurement + reimburse);
        return R.ok(m);
    }

    @GetMapping("/stats")
    public R<DashboardStatsVO> getStats() {
        DashboardStatsVO stats = new DashboardStatsVO();
        Long userId = SecurityUtils.getCurrentUserId();
        long approvalCount = userId == null ? 0 : wfTaskMapper.selectCount(new LambdaQueryWrapper<WfTask>()
                .eq(WfTask::getAssigneeId, userId)
                .eq(WfTask::getStatus, 0));
        stats.setApprovalCount((int) approvalCount);
        // 目前个人待办的真实来源只有审批待办;任务中心接入后在此叠加
        stats.setTodoCount((int) approvalCount);
        // 客户跟进数/月度业绩尚无真实取数口径:宁可为0,不再返回编造的数字冒充数据
        stats.setCustomerFollowCount(0);
        stats.setMonthlyPerformance(0.0);
        return R.ok(stats);
    }

    @GetMapping("/todo/list")
    public R<List<TodoVO>> getTodoList(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        List<TodoVO> list = new ArrayList<>();
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId != null) {
            int size = Math.min(pageSize == null || pageSize < 1 ? 10 : pageSize, 20);
            Page<WfTaskVO> pageReq = new Page<>(1, size);
            IPage<WfTaskVO> page = wfTaskMapper.selectTodoPage(pageReq, userId, null);
            for (WfTaskVO t : page.getRecords()) {
                String title = "审批:" + (t.getInstanceTitle() != null ? t.getInstanceTitle() : t.getProcessName());
                if (t.getInitiatorName() != null) {
                    title += "(" + t.getInitiatorName() + ")";
                }
                String arrived = t.getStartTime() != null ? t.getStartTime().format(DUE_FMT) : "";
                list.add(new TodoVO(t.getId(), title, "approval", "high", "pending", arrived, "/approval/center"));
            }
        }
        return R.ok(list);
    }

    @GetMapping("/notices")
    public R<List<NoticeVO>> getRecentNotices() {
        // 公告后端尚无真实数据源:返回空列表,不再返回编造的假公告
        return R.ok(new ArrayList<>());
    }
}
