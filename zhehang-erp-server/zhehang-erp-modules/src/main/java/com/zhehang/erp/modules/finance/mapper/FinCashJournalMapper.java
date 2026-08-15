package com.zhehang.erp.modules.finance.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zhehang.erp.modules.finance.domain.entity.FinCashJournal;
import com.zhehang.erp.modules.finance.domain.vo.CashCustomerOptionVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/** 收款日记账 Mapper。 */
@Mapper
public interface FinCashJournalMapper extends BaseMapper<FinCashJournal> {

    /** 客户下拉:直查 crm_customer,仅返回少量必要字段(登录即可,不需 system 权限)。 */
    @Select("SELECT id, name, short_name AS shortName "
            + "FROM crm_customer "
            + "WHERE deleted = 0 "
            + "AND (#{keyword} IS NULL OR #{keyword} = '' "
            + "  OR name LIKE CONCAT('%', #{keyword}, '%') "
            + "  OR short_name LIKE CONCAT('%', #{keyword}, '%')) "
            + "ORDER BY update_time DESC, id DESC LIMIT 50")
    List<CashCustomerOptionVO> selectCustomerOptions(@Param("keyword") String keyword);

    /** 按客户ID取客户名(核销列表用 customerId 过滤报单时,报单表按公司名匹配)。 */
    @Select("SELECT name FROM crm_customer WHERE id = #{id} AND deleted = 0 LIMIT 1")
    String selectCustomerNameById(@Param("id") Long id);

    /** 核销、审核等资金动作先锁收款主记录，避免并发超额或重复状态跳转。 */
    @Select("SELECT * FROM fin_cash_journal WHERE id = #{id} AND deleted = 0 FOR UPDATE")
    FinCashJournal selectForUpdate(@Param("id") Long id);

    /** 数据库聚合统计，避免把全部收款加载到 Java 内存。 */
    @Select({"<script>", "SELECT "
            + "COALESCE(SUM(CASE WHEN receipt_date = #{today} THEN amount ELSE 0 END),0) AS todayAmount, "
            + "COALESCE(SUM(CASE WHEN receipt_date = #{today} THEN 1 ELSE 0 END),0) AS todayCount, "
            + "COALESCE(SUM(CASE WHEN receipt_date = #{today} THEN matched_amount ELSE 0 END),0) AS todayMatched, "
            + "COALESCE(SUM(CASE WHEN receipt_date = #{today} THEN unmatched_amount ELSE 0 END),0) AS todayUnmatched, "
            + "COALESCE(SUM(CASE WHEN receipt_date >= #{monthStart} AND receipt_date &lt; #{nextMonth} THEN amount ELSE 0 END),0) AS monthAmount, "
            + "COALESCE(SUM(CASE WHEN receipt_date >= #{monthStart} AND receipt_date &lt; #{nextMonth} THEN matched_amount ELSE 0 END),0) AS monthMatched, "
            + "COALESCE(SUM(CASE WHEN receipt_date >= #{monthStart} AND receipt_date &lt; #{nextMonth} THEN unmatched_amount ELSE 0 END),0) AS monthUnmatched, "
            + "COALESCE(SUM(CASE WHEN match_status = 'waiting' THEN 1 ELSE 0 END),0) AS waitingCount, "
            + "COALESCE(SUM(CASE WHEN match_status = 'partial' THEN 1 ELSE 0 END),0) AS partialCount, "
            + "COALESCE(SUM(CASE WHEN review_status = 'pending' THEN 1 ELSE 0 END),0) AS pendingReviewCount, "
            + "COALESCE(SUM(CASE WHEN exception_status IN ('pending','processing') THEN 1 ELSE 0 END),0) AS exceptionCount, "
            + "COALESCE(SUM(CASE WHEN unmatched_amount > 0 AND COALESCE(receipt_time, create_time) &lt; DATE_SUB(NOW(), INTERVAL 24 HOUR) THEN 1 ELSE 0 END),0) AS over24hCount "
            + "FROM fin_cash_journal WHERE deleted = 0 AND record_status = 'active'",
            "<if test='visibleOwnerIds != null'>",
            "AND owner_id IN",
            "<foreach collection='visibleOwnerIds' item='ownerId' open='(' separator=',' close=')'>#{ownerId}</foreach>",
            "</if>",
            "</script>"})
    Map<String, Object> selectSummary(@Param("today") LocalDate today,
                                      @Param("monthStart") LocalDate monthStart,
                                      @Param("nextMonth") LocalDate nextMonth,
                                      @Param("visibleOwnerIds") List<Long> visibleOwnerIds);

    /** 某日按收款账户汇总，供日结预览与提交时重新校验。 */
    @Select("SELECT COALESCE(NULLIF(receive_account,''),'未填写账户') AS accountName, "
            + "COUNT(*) AS systemCount, COALESCE(SUM(amount),0) AS systemAmount "
            + "FROM fin_cash_journal "
            + "WHERE deleted = 0 AND record_status = 'active' AND receipt_date = #{date} "
            + "GROUP BY COALESCE(NULLIF(receive_account,''),'未填写账户') ORDER BY accountName")
    List<Map<String, Object>> selectDailyAccountSummary(@Param("date") LocalDate date);
}
