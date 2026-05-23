package com.zhehang.erp.modules.dashboard.controller;

import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.dashboard.domain.vo.DashboardStatsVO;
import com.zhehang.erp.modules.dashboard.domain.vo.NoticeVO;
import com.zhehang.erp.modules.dashboard.domain.vo.TodoVO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    @GetMapping("/stats")
    public R<DashboardStatsVO> getStats() {
        DashboardStatsVO stats = new DashboardStatsVO();
        stats.setTodoCount(12);
        stats.setApprovalCount(5);
        stats.setCustomerFollowCount(8);
        stats.setMonthlyPerformance(1286000.00);
        return R.ok(stats);
    }

    @GetMapping("/todo/list")
    public R<List<TodoVO>> getTodoList(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        List<TodoVO> list = new ArrayList<>();
        list.add(new TodoVO(1L, "审批张三的报销申请 (¥3,200)", "approval", "high", "pending", "今天 17:00", "/workflow/todo"));
        list.add(new TodoVO(2L, "跟进杭州科技有限公司合同续签", "follow", "high", "pending", "今天 15:00", "/crm/contract"));
        list.add(new TodoVO(3L, "完成月度销售报告", "task", "medium", "pending", "明天 12:00", null));
        list.add(new TodoVO(4L, "回复宁波客户技术咨询", "follow", "medium", "pending", "明天 10:00", "/crm/customer"));
        list.add(new TodoVO(5L, "检查系统安全日志", "other", "low", "done", "昨天", "/system/oper-log"));
        return R.ok(list);
    }

    @GetMapping("/notices")
    public R<List<NoticeVO>> getRecentNotices() {
        List<NoticeVO> list = new ArrayList<>();
        list.add(new NoticeVO(1L, "2026年端午节放假通知", "announcement", "05-16", "行政部"));
        list.add(new NoticeVO(2L, "ERP系统本周日凌晨升级维护", "notice", "05-15", "技术部"));
        list.add(new NoticeVO(3L, "关于规范出差报销流程的通知", "announcement", "05-13", "财务部"));
        list.add(new NoticeVO(4L, "5月份团建活动报名开始", "notice", "05-10", "行政部"));
        list.add(new NoticeVO(5L, "新客户管理规范发布", "announcement", "05-08", "销售部"));
        return R.ok(list);
    }
}
