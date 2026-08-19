package com.zhehang.erp.modules.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zhehang.erp.modules.system.domain.entity.SysPermission;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface SysPermissionMapper extends BaseMapper<SysPermission> {

    /** 查某角色已关联的权限点 ID（升序）。 */
    List<Long> selectPermissionIdsByRoleId(@Param("roleId") Long roleId);

    /** 批量写入角色-权限点关联。 */
    void insertRolePermissions(@Param("roleId") Long roleId, @Param("permissionIds") List<Long> permissionIds);

    /** 删除某角色全部权限点关联。 */
    void deleteRolePermissions(@Param("roleId") Long roleId);

    /** 查某用户（经角色）拥有的业务权限点 code，供登录时并入权限集合。 */
    List<String> selectPermissionCodesByUserId(@Param("userId") Long userId);
}
