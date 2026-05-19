package com.zhehang.erp.modules.system.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.modules.system.domain.entity.SysMenu;
import com.zhehang.erp.modules.system.domain.vo.MenuTreeVO;
import com.zhehang.erp.modules.system.domain.vo.RouterVO;
import com.zhehang.erp.modules.system.mapper.SysMenuMapper;
import com.zhehang.erp.modules.system.service.ISysMenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SysMenuServiceImpl extends ServiceImpl<SysMenuMapper, SysMenu> implements ISysMenuService {

    private final SysMenuMapper menuMapper;

    @Override
    public List<SysMenu> selectMenuList(String menuName, Integer status) {
        LambdaQueryWrapper<SysMenu> wrapper = new LambdaQueryWrapper<>();
        wrapper.like(StringUtils.hasText(menuName), SysMenu::getMenuName, menuName)
               .eq(status != null, SysMenu::getStatus, status)
               .orderByAsc(SysMenu::getOrderNum);
        return menuMapper.selectList(wrapper);
    }

    @Override
    public List<MenuTreeVO> selectMenuTree() {
        List<SysMenu> menus = menuMapper.selectList(
            new LambdaQueryWrapper<SysMenu>().orderByAsc(SysMenu::getOrderNum)
        );
        return buildMenuTree(menus, 0L);
    }

    @Override
    public List<MenuTreeVO> selectMenuTreeByRoleId(Long roleId) {
        List<Long> menuIds = menuMapper.selectMenuIdsByRoleId(roleId);
        if (menuIds.isEmpty()) {
            return new ArrayList<>();
        }
        List<SysMenu> menus = menuMapper.selectList(
            new LambdaQueryWrapper<SysMenu>().in(SysMenu::getId, menuIds).orderByAsc(SysMenu::getOrderNum)
        );
        return buildMenuTree(menus, 0L);
    }

    @Override
    public List<RouterVO> buildRouters(Long userId) {
        List<SysMenu> menus = menuMapper.selectMenusByUserId(userId);
        return buildRouterTree(menus, 0L);
    }

    @Override
    public void createMenu(SysMenu menu) {
        menuMapper.insert(menu);
    }

    @Override
    public void updateMenu(SysMenu menu) {
        menuMapper.updateById(menu);
    }

    @Override
    public void deleteMenu(Long menuId) {
        long count = count(new LambdaQueryWrapper<SysMenu>().eq(SysMenu::getParentId, menuId));
        if (count > 0) {
            throw new com.zhehang.erp.common.core.exception.BusinessException("存在子菜单，不允许删除");
        }
        menuMapper.deleteById(menuId);
    }

    private List<MenuTreeVO> buildMenuTree(List<SysMenu> menus, Long parentId) {
        return menus.stream()
            .filter(m -> parentId.equals(m.getParentId()))
            .map(m -> {
                MenuTreeVO node = new MenuTreeVO();
                node.setId(m.getId());
                node.setLabel(m.getMenuName());
                node.setParentId(m.getParentId());
                node.setOrderNum(m.getOrderNum());
                node.setChildren(buildMenuTree(menus, m.getId()));
                return node;
            })
            .collect(Collectors.toList());
    }

    private List<RouterVO> buildRouterTree(List<SysMenu> menus, Long parentId) {
        List<RouterVO> routers = new ArrayList<>();
        List<SysMenu> children = menus.stream()
            .filter(m -> parentId.equals(m.getParentId()))
            .collect(Collectors.toList());

        for (SysMenu menu : children) {
            RouterVO router = new RouterVO();
            router.setName(menu.getMenuName());
            router.setPath(menu.getPath());
            router.setComponent(StringUtils.hasText(menu.getComponent()) ? menu.getComponent() : "Layout");

            RouterVO.MetaVO meta = new RouterVO.MetaVO();
            meta.setTitle(menu.getMenuName());
            meta.setIcon(menu.getIcon());
            meta.setHidden(menu.getVisible() != null && menu.getVisible() == 1);
            router.setMeta(meta);

            router.setChildren(buildRouterTree(menus, menu.getId()));
            routers.add(router);
        }
        return routers;
    }
}
