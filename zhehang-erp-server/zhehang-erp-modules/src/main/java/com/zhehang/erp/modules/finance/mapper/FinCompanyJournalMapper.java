package com.zhehang.erp.modules.finance.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zhehang.erp.modules.finance.domain.entity.FinCompanyJournal;
import org.apache.ibatis.annotations.Mapper;

/**
 * 收款登记 / 公司日记账 Mapper。标准 CRUD 直接继承 BaseMapper,无需 XML。
 */
@Mapper
public interface FinCompanyJournalMapper extends BaseMapper<FinCompanyJournal> {
}
