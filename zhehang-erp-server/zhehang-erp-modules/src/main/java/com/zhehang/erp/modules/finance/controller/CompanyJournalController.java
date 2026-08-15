package com.zhehang.erp.modules.finance.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.annotation.DenyDuringImpersonation;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.finance.domain.dto.CompanyJournalQuery;
import com.zhehang.erp.modules.finance.domain.entity.FinCompanyJournal;
import com.zhehang.erp.modules.finance.service.ICompanyJournalService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 收款登记 / 公司日记账。对齐飞书多维表格「公司日记账(2026年度)」的 59 字段登记。
 */
@RestController
@RequestMapping("/finance/company-journal")
@RequiredArgsConstructor
@PreAuthorize("@perm.hasPermission('finance:company-journal:list')")
@DenyDuringImpersonation(reason = "公司日记账包含法人身份证和收款账号")
public class CompanyJournalController {

    private final ICompanyJournalService companyJournalService;

    /** 1. 台账列表(多条件筛选 + 收款日期倒序)。 */
    @GetMapping("/list")
    public R<IPage<FinCompanyJournal>> list(CompanyJournalQuery query) {
        return R.ok(companyJournalService.selectPage(query));
    }

    /** 2. 明细。 */
    @GetMapping("/{id}")
    public R<FinCompanyJournal> detail(@PathVariable Long id) {
        return R.ok(companyJournalService.getById(id));
    }

    /** 3. 新增/编辑登记(无 id=新增,带 id=编辑),返回 id。 */
    @PostMapping("/save")
    @Log(module = "收款登记", type = Log.OperationType.INSERT)
    public R<Long> save(@RequestBody FinCompanyJournal entity) {
        return R.ok(companyJournalService.saveJournal(entity));
    }

    /** 4. 删除(逻辑删除)。 */
    @DeleteMapping("/{id}")
    @Log(module = "收款登记", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        companyJournalService.removeJournal(id);
        return R.ok();
    }
}
