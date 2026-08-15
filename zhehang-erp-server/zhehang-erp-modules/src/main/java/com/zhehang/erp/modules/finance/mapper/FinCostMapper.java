package com.zhehang.erp.modules.finance.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zhehang.erp.modules.finance.domain.entity.FinCost;
import org.apache.ibatis.annotations.Mapper;

/** 管理成本 Mapper(纯 MyBatis-Plus,无 XML) */
@Mapper
public interface FinCostMapper extends BaseMapper<FinCost> {
}
