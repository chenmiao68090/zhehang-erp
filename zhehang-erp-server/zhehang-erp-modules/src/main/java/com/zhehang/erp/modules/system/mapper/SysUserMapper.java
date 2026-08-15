package com.zhehang.erp.modules.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zhehang.erp.modules.system.domain.entity.SysUser;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;
import java.util.Map;

@Mapper
public interface SysUserMapper extends BaseMapper<SysUser> {
    List<String> selectPermsByUserId(@Param("userId") Long userId);
    List<String> selectRoleKeysByUserId(@Param("userId") Long userId);
    List<Long> selectRoleIdsByUserId(@Param("userId") Long userId);

    /** 批量查多个用户的角色关联(消除按用户逐个查的N+1),返回每行 {userId, roleId} */
    List<Map<String, Object>> selectUserRoleMappings(@Param("userIds") List<Long> userIds);
    Long selectFirstUserIdByRoleKey(@Param("roleKey") String roleKey);

    /** 某角色下全部可用用户ID(按 u.id 升序);审批人解析用,可跳过发起人本人避免自审 */
    List<Long> selectUserIdsByRoleKey(@Param("roleKey") String roleKey);

    /** 该用户所有有效角色里数值最小的 data_scope(=范围最大);无角色时返回 null */
    Integer selectMinDataScopeByUserId(@Param("userId") Long userId);

    /** 同租户存在未删除的离职员工档案时，账号不得登录或被重新启用。 */
    boolean existsResignedEmployee(@Param("userId") Long userId,
                                   @Param("tenantId") Long tenantId);

    /**
     * 代登录专用最小认证快照：只读取身份/租户/部门/状态，绝不读取密码或个人敏感信息。
     * SQL 同时复核租户、账号状态和在职/试用员工档案，防止构造 targetUserId 越权。
     */
    SysUser selectActiveForImpersonation(@Param("targetUserId") Long targetUserId,
                                         @Param("tenantId") Long tenantId);
}
