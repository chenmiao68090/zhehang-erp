package com.zhehang.erp.modules.finance.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.zhehang.erp.modules.finance.domain.entity.FinReceivableCollectionLog;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

/** 回款续费催收/收款历史 Mapper。 */
@Mapper
public interface FinReceivableCollectionLogMapper extends BaseMapper<FinReceivableCollectionLog> {

    @Select({
            "<script>",
            "SELECT l.* FROM fin_receivable_collection_log l",
            "LEFT JOIN fin_receivable_renewal r ON r.id = l.receivable_id AND r.deleted = 0",
            "WHERE l.deleted = 0 AND l.source_type = 'legacy' AND l.action_type = '记录收款'",
            "AND l.cash_journal_id IS NULL AND l.payment_amount &gt; 0",
            "<if test='keyword != null and keyword != \"\"'>",
            "AND (l.content LIKE CONCAT('%', #{keyword}, '%')",
            "OR r.customer_name LIKE CONCAT('%', #{keyword}, '%')",
            "OR r.service_type LIKE CONCAT('%', #{keyword}, '%')",
            "OR r.receivable_month LIKE CONCAT('%', #{keyword}, '%'))",
            "</if>",
            "ORDER BY l.action_time DESC, l.id DESC",
            "</script>"
    })
    IPage<FinReceivableCollectionLog> selectLegacyPage(Page<FinReceivableCollectionLog> page,
                                                       @Param("keyword") String keyword);

    @Select("SELECT * FROM fin_receivable_collection_log WHERE id = #{id} AND deleted = 0 FOR UPDATE")
    FinReceivableCollectionLog selectForUpdate(@Param("id") Long id);

    @Update("UPDATE fin_receivable_collection_log "
            + "SET cash_journal_id = #{journalId}, cash_match_id = #{matchId}, "
            + "source_type = 'cash_journal_linked', content = #{content}, update_time = NOW() "
            + "WHERE id = #{id} AND deleted = 0 AND source_type = 'legacy' AND cash_journal_id IS NULL")
    int markLegacyLinked(@Param("id") Long id,
                         @Param("journalId") Long journalId,
                         @Param("matchId") Long matchId,
                         @Param("content") String content);

    @Update("UPDATE fin_receivable_collection_log "
            + "SET cash_journal_id = NULL, cash_match_id = NULL, source_type = 'legacy', "
            + "content = LEFT(CONCAT(#{content}, '；上次关联记录：', COALESCE(content, '')), 1000), update_time = NOW() "
            + "WHERE cash_match_id = #{matchId} AND deleted = 0 AND source_type = 'cash_journal_linked'")
    int restoreLegacyLink(@Param("matchId") Long matchId, @Param("content") String content);
}
