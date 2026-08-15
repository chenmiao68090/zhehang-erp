package com.zhehang.erp.modules.finance.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zhehang.erp.modules.finance.domain.entity.FinCashDailyClose;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDate;

@Mapper
public interface FinCashDailyCloseMapper extends BaseMapper<FinCashDailyClose> {
    @Select("SELECT * FROM fin_cash_daily_close WHERE id = #{id} AND deleted = 0 FOR UPDATE")
    FinCashDailyClose selectForUpdate(@Param("id") Long id);

    @Select("SELECT * FROM fin_cash_daily_close WHERE close_date = #{date} AND deleted = 0 LIMIT 1 FOR UPDATE")
    FinCashDailyClose selectForUpdateByDate(@Param("date") LocalDate date);
}
