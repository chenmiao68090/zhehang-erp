package com.zhehang.erp.modules.finance.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zhehang.erp.modules.finance.domain.entity.FinPayTransaction;
import org.apache.ibatis.annotations.Mapper;

/**
 * 收款中心-统一收款流水 Mapper。标准 CRUD 直接继承 BaseMapper,无需 XML。
 */
@Mapper
public interface FinPayTransactionMapper extends BaseMapper<FinPayTransaction> {
}
