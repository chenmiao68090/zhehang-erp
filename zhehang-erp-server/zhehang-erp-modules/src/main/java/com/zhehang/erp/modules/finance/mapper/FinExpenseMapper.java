package com.zhehang.erp.modules.finance.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zhehang.erp.modules.finance.domain.entity.FinExpense;
import org.apache.ibatis.annotations.Mapper;

/** 业务支出 Mapper(纯 MyBatis-Plus,无 XML) */
@Mapper
public interface FinExpenseMapper extends BaseMapper<FinExpense> {
}
