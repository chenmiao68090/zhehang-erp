package com.zhehang.erp.modules.crm.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zhehang.erp.modules.crm.domain.entity.CrmPoolRuleUsage;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.time.LocalDate;

@Mapper
public interface CrmPoolRuleUsageMapper extends BaseMapper<CrmPoolRuleUsage> {
    @Insert("INSERT IGNORE INTO crm_pool_rule_usage "
            + "(tenant_id, usage_date, user_id, metric_code, used_count, create_time, update_time, create_by, update_by, deleted) "
            + "VALUES (#{tenantId}, #{usageDate}, #{userId}, #{metricCode}, 0, NOW(), NOW(), #{userId}, #{userId}, 0)")
    int ensureRow(@Param("tenantId") Long tenantId, @Param("usageDate") LocalDate usageDate,
                  @Param("userId") Long userId, @Param("metricCode") String metricCode);

    @Select("SELECT used_count FROM crm_pool_rule_usage WHERE tenant_id=#{tenantId} AND usage_date=#{usageDate} "
            + "AND user_id=#{userId} AND metric_code=#{metricCode} AND deleted=0 FOR UPDATE")
    Integer selectUsedForUpdate(@Param("tenantId") Long tenantId, @Param("usageDate") LocalDate usageDate,
                                @Param("userId") Long userId, @Param("metricCode") String metricCode);

    @Update("UPDATE crm_pool_rule_usage SET used_count=used_count+#{delta}, update_time=NOW(), update_by=#{userId} "
            + "WHERE tenant_id=#{tenantId} AND usage_date=#{usageDate} AND user_id=#{userId} "
            + "AND metric_code=#{metricCode} AND deleted=0")
    int addUsed(@Param("tenantId") Long tenantId, @Param("usageDate") LocalDate usageDate,
                @Param("userId") Long userId, @Param("metricCode") String metricCode,
                @Param("delta") int delta);

    @Select("SELECT COALESCE(used_count,0) FROM crm_pool_rule_usage WHERE tenant_id=#{tenantId} "
            + "AND usage_date=#{usageDate} AND user_id=#{userId} AND metric_code=#{metricCode} AND deleted=0 LIMIT 1")
    Integer selectUsed(@Param("tenantId") Long tenantId, @Param("usageDate") LocalDate usageDate,
                       @Param("userId") Long userId, @Param("metricCode") String metricCode);
}
