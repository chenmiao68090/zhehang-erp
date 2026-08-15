package com.zhehang.erp.modules.dashboard.controller;

import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.dashboard.domain.entity.DailyReport;
import com.zhehang.erp.modules.dashboard.domain.vo.ColleagueVO;
import com.zhehang.erp.modules.dashboard.domain.vo.DailyReportVO;
import com.zhehang.erp.modules.dashboard.service.IDailyReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/dashboard/daily-report")
@RequiredArgsConstructor
public class DailyReportController {

    private final IDailyReportService dailyReportService;

    @GetMapping("/list")
    public R<List<DailyReport>> list() {
        return R.ok(dailyReportService.listMine());
    }

    @PostMapping
    public R<Boolean> add(@RequestBody DailyReport report) {
        return R.ok(dailyReportService.add(report));
    }

    @DeleteMapping("/{id}")
    public R<Boolean> remove(@PathVariable Long id) {
        return R.ok(dailyReportService.removeMine(id));
    }

    /** 可抄送的同事列表(已开通账号的员工) */
    @GetMapping("/colleagues")
    public R<List<ColleagueVO>> colleagues() {
        return R.ok(dailyReportService.listColleagues());
    }

    /** 抄送给我的日报(含作者姓名) */
    @GetMapping("/cc-to-me")
    public R<List<DailyReportVO>> ccToMe() {
        return R.ok(dailyReportService.listCcToMe());
    }
}
