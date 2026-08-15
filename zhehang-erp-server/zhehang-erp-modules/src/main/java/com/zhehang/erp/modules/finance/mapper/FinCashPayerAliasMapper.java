package com.zhehang.erp.modules.finance.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zhehang.erp.modules.finance.domain.entity.FinCashPayerAlias;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

/** 付款方别名 Mapper。 */
@Mapper
public interface FinCashPayerAliasMapper extends BaseMapper<FinCashPayerAlias> {
    @Select("SELECT * FROM fin_cash_payer_alias WHERE id = #{id} AND deleted = 0 FOR UPDATE")
    FinCashPayerAlias selectForUpdate(@Param("id") Long id);
}
