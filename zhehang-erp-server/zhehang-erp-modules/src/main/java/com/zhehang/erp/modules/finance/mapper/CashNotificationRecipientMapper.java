package com.zhehang.erp.modules.finance.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/** 收款审核、日结和对账风险通知的收件人查询。 */
@Mapper
public interface CashNotificationRecipientMapper {
    @Select({"<script>",
            "SELECT DISTINCT u.id FROM sys_user u",
            "JOIN sys_user_role ur ON ur.user_id = u.id",
            "JOIN sys_role r ON r.id = ur.role_id",
            "WHERE u.deleted = 0 AND u.status = 0 AND r.deleted = 0 AND r.status = 0",
            "AND r.role_key IN",
            "<foreach collection='roleKeys' item='role' open='(' separator=',' close=')'>#{role}</foreach>",
            "</script>"})
    List<Long> selectActiveUserIdsByRoles(@Param("roleKeys") List<String> roleKeys);

    @Select({"<script>",
            "SELECT DISTINCT u.id FROM sys_user u",
            "JOIN sys_user_role ur ON ur.user_id = u.id",
            "JOIN sys_role r ON r.id = ur.role_id",
            "WHERE u.deleted = 0 AND u.status = 0 AND r.deleted = 0 AND r.status = 0",
            "AND u.tenant_id = #{tenantId} AND r.tenant_id = #{tenantId}",
            "AND r.role_key IN",
            "<foreach collection='roleKeys' item='role' open='(' separator=',' close=')'>#{role}</foreach>",
            "</script>"})
    List<Long> selectActiveUserIdsByRolesAndTenant(@Param("roleKeys") List<String> roleKeys,
                                                   @Param("tenantId") Long tenantId);

    /** 员工档案中的直属上级，必须仍是同租户启用账号。 */
    @Select("SELECT e.manager_id FROM org_employee e "
            + "JOIN sys_user u ON u.id = e.manager_id "
            + "WHERE e.deleted = 0 AND u.deleted = 0 AND u.status = 0 "
            + "AND e.user_id = #{ownerId} AND e.tenant_id = #{tenantId} AND u.tenant_id = #{tenantId} "
            + "LIMIT 1")
    Long selectActiveSupervisorId(@Param("ownerId") Long ownerId, @Param("tenantId") Long tenantId);
}
