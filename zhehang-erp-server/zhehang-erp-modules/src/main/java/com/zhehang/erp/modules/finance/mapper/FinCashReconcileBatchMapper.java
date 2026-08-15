package com.zhehang.erp.modules.finance.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zhehang.erp.modules.finance.domain.entity.FinCashReconcileBatch;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

/** 渠道对账批次 Mapper。 */
@Mapper
public interface FinCashReconcileBatchMapper extends BaseMapper<FinCashReconcileBatch> {
    @Select("SELECT * FROM fin_cash_reconcile_batch WHERE id = #{id} AND deleted = 0 FOR UPDATE")
    FinCashReconcileBatch selectForUpdate(@Param("id") Long id);
}
