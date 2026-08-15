package com.zhehang.erp.modules.crm.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zhehang.erp.modules.crm.domain.entity.CrmPoolRuleVersion;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface CrmPoolRuleVersionMapper extends BaseMapper<CrmPoolRuleVersion> {
    @Select("SELECT COUNT(*) FROM (SELECT owner_id FROM crm_lead WHERE tenant_id=#{tenantId} "
            + "AND deleted=0 AND ownership='private' AND status IN (1,2) AND owner_id IS NOT NULL "
            + "GROUP BY owner_id HAVING COUNT(*) > #{holdingLimit}) x")
    long countOwnersOverHolding(@Param("tenantId") Long tenantId,
                                @Param("holdingLimit") Integer holdingLimit);

    @Select("SELECT COUNT(*) FROM crm_lead WHERE tenant_id=#{tenantId} AND deleted=0 "
            + "AND ownership='private' AND status IN (1,2) AND owner_id IS NOT NULL "
            + "AND (protection_expire_date < #{today} OR protection_expire_date IS NULL) "
            + "AND COALESCE(last_follow_time, claim_time, '1970-01-01 00:00:00') < #{staleBefore}")
    long countRecycleCandidates(@Param("tenantId") Long tenantId,
                                @Param("today") LocalDate today,
                                @Param("staleBefore") LocalDateTime staleBefore);

    @Select("SELECT DISTINCT tenant_id FROM crm_lead WHERE tenant_id IS NOT NULL AND deleted=0")
    List<Long> selectLeadTenantIds();
}
