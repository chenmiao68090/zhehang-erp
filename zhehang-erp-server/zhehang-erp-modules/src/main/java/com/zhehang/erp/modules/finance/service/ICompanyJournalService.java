package com.zhehang.erp.modules.finance.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.zhehang.erp.modules.finance.domain.dto.CompanyJournalQuery;
import com.zhehang.erp.modules.finance.domain.entity.FinCompanyJournal;

/**
 * 收款登记 / 公司日记账服务。
 */
public interface ICompanyJournalService extends IService<FinCompanyJournal> {

    /** 分页台账列表(多条件筛选 + 收款日期倒序)。 */
    IPage<FinCompanyJournal> selectPage(CompanyJournalQuery query);

    /** 新增/编辑登记(id 为空=新增)。自动生成编号、计算公式列。返回记录id。 */
    Long saveJournal(FinCompanyJournal entity);

    /** 逻辑删除一条登记。 */
    boolean removeJournal(Long id);
}
