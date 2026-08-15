package com.zhehang.erp.modules.finance.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zhehang.erp.modules.finance.domain.entity.BookkeepingColleagueVO;
import com.zhehang.erp.modules.finance.domain.entity.FinReceivableRenewal;
import com.zhehang.erp.modules.finance.domain.entity.ReceivableCustomerOptionVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.Map;

/** 回款续费应收台账 Mapper。 */
@Mapper
public interface FinReceivableRenewalMapper extends BaseMapper<FinReceivableRenewal> {

    /** 可选催收负责人:所有已开通账号的在职/试用员工。 */
    @Select("SELECT e.user_id AS userId, e.name AS name, d.dept_name AS deptName "
            + "FROM org_employee e "
            + "LEFT JOIN sys_dept d ON e.dept_id = d.id AND d.deleted = 0 "
            + "WHERE e.deleted = 0 AND e.user_id IS NOT NULL AND e.status IN (1,2) "
            + "ORDER BY e.dept_id, e.name")
    List<BookkeepingColleagueVO> selectColleagues();

    /** 客户下拉:仅返回少量必要字段,避免把客户敏感明细带到回款页面。 */
    @Select("SELECT id, name, short_name AS shortName, owner_id AS ownerId "
            + "FROM crm_customer "
            + "WHERE deleted = 0 "
            + "AND (#{keyword} IS NULL OR #{keyword} = '' "
            + "  OR name LIKE CONCAT('%', #{keyword}, '%') "
            + "  OR short_name LIKE CONCAT('%', #{keyword}, '%')) "
            + "ORDER BY update_time DESC, id DESC LIMIT 50")
    List<ReceivableCustomerOptionVO> selectCustomerOptions(@Param("keyword") String keyword);

    @Select("SELECT * FROM fin_receivable_renewal WHERE id = #{id} AND deleted = 0 FOR UPDATE")
    FinReceivableRenewal selectForUpdate(@Param("id") Long id);

    @Select("SELECT "
            + "COALESCE(SUM(CASE WHEN arrears_amount > 0 AND due_date < #{today} THEN arrears_amount ELSE 0 END),0) AS overdueAmount, "
            + "SUM(CASE WHEN arrears_amount > 0 AND due_date < #{today} THEN 1 ELSE 0 END) AS overdueCount, "
            + "COALESCE(SUM(CASE WHEN collection_status = '坏账风险' THEN arrears_amount ELSE 0 END),0) AS badRiskAmount, "
            + "SUM(CASE WHEN collection_status = '坏账风险' THEN 1 ELSE 0 END) AS badRiskCount "
            + "FROM fin_receivable_renewal WHERE deleted = 0")
    Map<String, Object> selectRiskSummary(@Param("today") java.time.LocalDate today);
}
