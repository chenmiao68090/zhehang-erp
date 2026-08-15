package com.zhehang.erp.modules.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zhehang.erp.modules.system.domain.entity.SysMenu;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface SysMenuMapper extends BaseMapper<SysMenu> {
    List<SysMenu> selectMenusByUserId(@Param("userId") Long userId);
    List<Long> selectMenuIdsByRoleId(@Param("roleId") Long roleId);

    /** 锁定当前租户菜单行；角色分配菜单也复用该锁，避免校验后菜单被并发删除。 */
    SysMenu selectMenuForUpdate(@Param("menuId") Long menuId, @Param("tenantId") Long tenantId);

    /** 查询通过活跃角色关联该菜单的当前租户用户，用于精准作废权限缓存。 */
    List<Long> selectActiveUserIdsByMenuId(@Param("menuId") Long menuId,
                                           @Param("tenantId") Long tenantId);

    /** 删除菜单时同步清理无租户列的角色-菜单关联。 */
    int deleteRoleMenuRelations(@Param("menuId") Long menuId);
}
