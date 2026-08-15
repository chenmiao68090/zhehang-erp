package com.zhehang.erp.modules.finance.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zhehang.erp.modules.finance.domain.entity.FinCashMatch;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/** 收款核销关系 Mapper。 */
@Mapper
public interface FinCashMatchMapper extends BaseMapper<FinCashMatch> {

    @Select("SELECT * FROM fin_cash_match WHERE id = #{id} AND deleted = 0 FOR UPDATE")
    FinCashMatch selectForUpdate(@Param("id") Long id);

    @Select("SELECT id FROM biz_bookkeeping_order WHERE id = #{id} AND deleted = 0 FOR UPDATE")
    Long lockBookkeeping(@Param("id") Long id);

    @Select("SELECT id FROM biz_address_order WHERE id = #{id} AND deleted = 0 FOR UPDATE")
    Long lockAddress(@Param("id") Long id);

    @Select("SELECT id FROM biz_gs_order WHERE id = #{id} AND deleted = 0 FOR UPDATE")
    Long lockGs(@Param("id") Long id);

    @Select("SELECT id FROM biz_seal_order WHERE id = #{id} AND deleted = 0 FOR UPDATE")
    Long lockSeal(@Param("id") Long id);

    /** 月度收入结构按有效核销金额统计，未核销余额单独展示。 */
    @Select("SELECT m.biz_type AS bizType, COALESCE(SUM(m.matched_amount),0) AS amount "
            + "FROM fin_cash_match m JOIN fin_cash_journal j ON j.id = m.journal_id "
            + "WHERE m.deleted = 0 AND m.match_status = 'active' "
            + "AND j.deleted = 0 AND j.record_status = 'active' "
            + "AND j.receipt_date >= #{start} AND j.receipt_date < #{end} "
            + "GROUP BY m.biz_type ORDER BY m.biz_type")
    List<Map<String, Object>> selectMonthlyStructure(@Param("start") LocalDate start,
                                                     @Param("end") LocalDate end);
}
