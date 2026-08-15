package com.zhehang.erp.modules.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zhehang.erp.modules.system.domain.entity.SysRole;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;
import java.util.Map;

@Mapper
public interface SysRoleMapper extends BaseMapper<SysRole> {
    void insertRoleMenus(@Param("roleId") Long roleId, @Param("menuIds") List<Long> menuIds);
    void deleteRoleMenus(@Param("roleId") Long roleId);
    List<Long> selectMenuIdsByRoleId(@Param("roleId") Long roleId);
    void insertUserRoles(@Param("userId") Long userId, @Param("roleIds") List<Long> roleIds);
    void deleteUserRoles(@Param("userId") Long userId);

    /** 查某角色下已绑定的成员(sys_user_role 关联 sys_user;不 join 部门表以免无部门用户被租户条件过滤) */
    List<Map<String, Object>> selectRoleMembers(@Param("roleId") Long roleId, @Param("tenantId") Long tenantId);

    /** 候选员工列表(启用状态,按昵称/账号/手机模糊;限 100 条),用于加入角色时挑人 */
    List<Map<String, Object>> selectMemberCandidates(@Param("keyword") String keyword,
                                                     @Param("tenantId") Long tenantId);

    /** 幂等新增一条角色-用户绑定(已存在则不插),返回受影响行数 */
    int insertRoleMemberIfAbsent(@Param("roleId") Long roleId, @Param("userId") Long userId);

    /** 移除一条角色-用户绑定 */
    int deleteRoleMember(@Param("roleId") Long roleId, @Param("userId") Long userId);

    /** 查询当前租户内的角色成员ID，用于精准作废权限缓存。 */
    List<Long> selectUserIdsByRoleId(@Param("roleId") Long roleId, @Param("tenantId") Long tenantId);

    /** 锁定当前租户角色行，串行化删除与成员增删。 */
    SysRole selectRoleForUpdate(@Param("roleId") Long roleId, @Param("tenantId") Long tenantId);

    /** 原始关联计数；删除保护必须覆盖已删用户或异常跨租户脏关联。 */
    int countRoleMemberRelations(@Param("roleId") Long roleId);

    /** 当前租户内已软删除用户的历史关联，可随角色删除一并清理。 */
    int countDeletedRoleMemberRelations(@Param("roleId") Long roleId, @Param("tenantId") Long tenantId);

    /** 角色删除成功后清理其全部成员关系，避免留下 sys_user_role 孤儿。 */
    int deleteRoleMembers(@Param("roleId") Long roleId);
}
