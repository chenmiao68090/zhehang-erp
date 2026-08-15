package com.zhehang.erp.modules.dashboard.owner.controller;

import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.finance.service.ICashJournalService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * 经营监控中心的可信事实接口。
 *
 * <p>不复制财务数据，也不重新计算“到账”：直接复用收款日记账的统一登记统计服务。
 * 该统计包含全部未作废登记（草稿、待审、驳回待修和反审核），不能解释为银行终审余额。
 * 仅老板/平台最高账号读取当前租户全公司统计；普通管理角色不复用老板口径。</p>
 */
@RestController
@RequestMapping("/dashboard/owner-monitor")
@RequiredArgsConstructor
@PreAuthorize("@perm.hasAnyRole('boss', 'super_admin')")
public class OwnerMonitorController {

    private final ICashJournalService cashJournalService;

    @GetMapping("/cash-stats")
    public R<Map<String, Object>> cashStats() {
        return R.ok(cashJournalService.stats());
    }
}
