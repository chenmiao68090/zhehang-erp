package com.zhehang.erp.modules.finance.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/** 月结经营报告数据库聚合，避免把流水拉到 Java 内存。 */
@Mapper
public interface CashMonthlyReportMapper {

    @Select("SELECT COUNT(*) AS monthCount, COALESCE(SUM(amount),0) AS monthAmount, "
            + "COALESCE(SUM(matched_amount),0) AS monthMatched, "
            + "COALESCE(SUM(unmatched_amount),0) AS monthUnmatched "
            + "FROM fin_cash_journal WHERE deleted = 0 AND record_status = 'active' "
            + "AND receipt_date >= #{start} AND receipt_date < #{end}")
    Map<String, Object> selectReceiptSummary(@Param("start") LocalDate start, @Param("end") LocalDate end);

    @Select("SELECT COALESCE(NULLIF(receive_account,''),'未填写账户') AS name, COUNT(*) AS count, "
            + "COALESCE(SUM(amount),0) AS amount FROM fin_cash_journal "
            + "WHERE deleted = 0 AND record_status = 'active' "
            + "AND receipt_date >= #{start} AND receipt_date < #{end} "
            + "GROUP BY COALESCE(NULLIF(receive_account,''),'未填写账户') ORDER BY amount DESC")
    List<Map<String, Object>> selectAccountStructure(@Param("start") LocalDate start, @Param("end") LocalDate end);

    @Select("SELECT COALESCE(NULLIF(payment_method,''),'未填写方式') AS name, COUNT(*) AS count, "
            + "COALESCE(SUM(amount),0) AS amount FROM fin_cash_journal "
            + "WHERE deleted = 0 AND record_status = 'active' "
            + "AND receipt_date >= #{start} AND receipt_date < #{end} "
            + "GROUP BY COALESCE(NULLIF(payment_method,''),'未填写方式') ORDER BY amount DESC")
    List<Map<String, Object>> selectMethodStructure(@Param("start") LocalDate start, @Param("end") LocalDate end);

    @Select("SELECT COALESCE(NULLIF(fund_nature,''),'unknown') AS fundNature, COUNT(*) AS count, "
            + "COALESCE(SUM(amount),0) AS amount FROM fin_cash_journal "
            + "WHERE deleted = 0 AND record_status = 'active' "
            + "AND receipt_date >= #{start} AND receipt_date < #{end} "
            + "GROUP BY COALESCE(NULLIF(fund_nature,''),'unknown') ORDER BY amount DESC")
    List<Map<String, Object>> selectFundNatureStructure(@Param("start") LocalDate start, @Param("end") LocalDate end);

    @Select("SELECT "
            + "COALESCE(SUM(CASE WHEN j.receipt_date < #{start} "
            + "THEN j.unmatched_amount + COALESCE(m.matchedAfterStart,0) ELSE 0 END),0) AS monthStartUnmatched, "
            + "COALESCE(SUM(CASE WHEN j.receipt_date >= #{start} AND j.receipt_date < #{end} "
            + "THEN j.unmatched_amount + COALESCE(m.matchedAfterEnd,0) ELSE 0 END),0) AS monthNewUnmatched, "
            + "COALESCE(SUM(CASE WHEN j.receipt_date < #{end} "
            + "THEN j.unmatched_amount + COALESCE(m.matchedAfterEnd,0) ELSE 0 END),0) AS monthEndUnmatched "
            + "FROM fin_cash_journal j LEFT JOIN ("
            + "SELECT journal_id, "
            + "COALESCE(SUM(CASE WHEN matched_at >= #{start} THEN matched_amount ELSE 0 END),0) AS matchedAfterStart, "
            + "COALESCE(SUM(CASE WHEN matched_at >= #{end} THEN matched_amount ELSE 0 END),0) AS matchedAfterEnd "
            + "FROM fin_cash_match WHERE deleted = 0 AND match_status = 'active' GROUP BY journal_id"
            + ") m ON m.journal_id = j.id "
            + "WHERE j.deleted = 0 AND j.record_status = 'active'")
    Map<String, Object> selectUnmatchedMovement(@Param("start") LocalDate start, @Param("end") LocalDate end);

    @Select("SELECT COALESCE(SUM(m.matched_amount),0) AS monthResolvedUnmatched "
            + "FROM fin_cash_match m JOIN fin_cash_journal j ON j.id = m.journal_id "
            + "WHERE m.deleted = 0 AND m.match_status = 'active' AND j.deleted = 0 "
            + "AND j.receipt_date < #{start} AND m.matched_at >= #{start} AND m.matched_at < #{end}")
    Map<String, Object> selectResolvedBacklog(@Param("start") LocalDate start, @Param("end") LocalDate end);

    @Select("SELECT "
            + "SUM(CASE WHEN create_time >= #{start} AND create_time < #{end} THEN 1 ELSE 0 END) AS createdCount, "
            + "SUM(CASE WHEN resolved_at >= #{start} AND resolved_at < #{end} THEN 1 ELSE 0 END) AS resolvedCount, "
            + "SUM(CASE WHEN status <> 'resolved' AND create_time < #{end} THEN 1 ELSE 0 END) AS unresolvedCount, "
            + "SUM(CASE WHEN priority = 'P0' AND status <> 'resolved' AND create_time < #{end} THEN 1 ELSE 0 END) AS unresolvedP0Count, "
            + "COALESCE(AVG(CASE WHEN resolved_at >= #{start} AND resolved_at < #{end} "
            + "THEN TIMESTAMPDIFF(MINUTE, create_time, resolved_at) / 60.0 END),0) AS averageResolveHours "
            + "FROM fin_cash_exception_case WHERE deleted = 0")
    Map<String, Object> selectExceptionSummary(@Param("start") LocalDate start, @Param("end") LocalDate end);

    @Select("SELECT "
            + "SUM(CASE WHEN difference_amount <> 0 THEN 1 ELSE 0 END) AS differenceCount, "
            + "SUM(CASE WHEN difference_amount <> 0 AND status <> 'closed' THEN 1 ELSE 0 END) AS unresolvedDifferenceCount, "
            + "COALESCE(SUM(ABS(difference_amount)),0) AS differenceAmount "
            + "FROM fin_cash_daily_close WHERE deleted = 0 AND close_date >= #{start} AND close_date < #{end}")
    Map<String, Object> selectDailyCloseSummary(@Param("start") LocalDate start, @Param("end") LocalDate end);
}
