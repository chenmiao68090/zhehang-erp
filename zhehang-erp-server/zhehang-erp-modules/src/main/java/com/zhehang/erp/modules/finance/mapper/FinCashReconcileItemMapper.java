package com.zhehang.erp.modules.finance.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zhehang.erp.modules.finance.domain.entity.FinCashReconcileItem;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

/** 渠道对账明细 Mapper。 */
@Mapper
public interface FinCashReconcileItemMapper extends BaseMapper<FinCashReconcileItem> {
    @Select("SELECT * FROM fin_cash_reconcile_item WHERE id = #{id} AND deleted = 0 FOR UPDATE")
    FinCashReconcileItem selectForUpdate(@Param("id") Long id);
}
