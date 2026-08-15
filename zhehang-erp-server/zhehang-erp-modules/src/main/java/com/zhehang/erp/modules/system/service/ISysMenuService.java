package com.zhehang.erp.modules.system.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.zhehang.erp.modules.system.domain.entity.SysMenu;
import com.zhehang.erp.modules.system.domain.vo.MenuTreeVO;
import com.zhehang.erp.modules.system.domain.vo.RouterVO;

import java.util.List;

public interface ISysMenuService extends IService<SysMenu> {
    List<SysMenu> selectMenuList(String menuName, Integer status);
    List<MenuTreeVO> selectMenuTree();
    List<MenuTreeVO> selectMenuTreeByRoleId(Long roleId);
    List<Long> selectMenuIdsByRoleId(Long roleId);
    List<Long> selectCheckedMenuIdsByRoleId(Long roleId);
    List<RouterVO> buildRouters(Long userId);
    void createMenu(SysMenu menu);
    void updateMenu(SysMenu menu);
    void deleteMenu(Long menuId);
}
