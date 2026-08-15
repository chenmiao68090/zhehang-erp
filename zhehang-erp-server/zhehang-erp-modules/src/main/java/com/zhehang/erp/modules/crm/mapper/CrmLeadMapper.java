package com.zhehang.erp.modules.crm.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zhehang.erp.modules.crm.domain.entity.CrmLead;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.Collection;
import java.util.List;

@Mapper
public interface CrmLeadMapper extends BaseMapper<CrmLead> {

    /** 按规范化号码批量查找当前租户线索，供历史话单补齐客户名称。 */
    @Select({
            "<script>",
            "SELECT id, name, company, legal_person, phone, company_phone, owner_id, dept_id, tenant_id, deleted",
            "FROM crm_lead",
            "WHERE tenant_id = #{tenantId} AND deleted = 0",
            "AND (",
            "RIGHT(REGEXP_REPLACE(COALESCE(phone, ''), '[^0-9]', ''), 11) IN",
            "<foreach collection='phones' item='phone' open='(' separator=',' close=')'>#{phone}</foreach>",
            "OR RIGHT(REGEXP_REPLACE(COALESCE(company_phone, ''), '[^0-9]', ''), 11) IN",
            "<foreach collection='phones' item='phone' open='(' separator=',' close=')'>#{phone}</foreach>",
            ")",
            "</script>"
    })
    List<CrmLead> selectByNormalizedPhones(@Param("tenantId") Long tenantId,
                                           @Param("phones") Collection<String> phones);

    /**
     * 按客户手机号取最新一条线索ID(云客话单自动关联线索用)。
     * 后台同步必须显式传入租户，禁止跨租户按手机号碰撞关联。
     */
    @Select("SELECT id FROM crm_lead WHERE tenant_id = #{tenantId} AND deleted = 0 "
            + "AND phone = #{phone} ORDER BY id DESC LIMIT 1")
    Long selectLatestLeadIdByPhone(@Param("tenantId") Long tenantId, @Param("phone") String phone);
}
