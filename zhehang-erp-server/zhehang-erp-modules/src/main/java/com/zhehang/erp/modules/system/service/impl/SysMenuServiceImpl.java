package com.zhehang.erp.modules.system.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.system.domain.entity.SysMenu;
import com.zhehang.erp.modules.system.domain.vo.MenuTreeVO;
import com.zhehang.erp.modules.system.domain.vo.RouterVO;
import com.zhehang.erp.modules.system.mapper.SysMenuMapper;
import com.zhehang.erp.modules.system.service.ISysMenuService;
import com.zhehang.erp.security.service.TokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SysMenuServiceImpl extends ServiceImpl<SysMenuMapper, SysMenu> implements ISysMenuService {

    private static final Set<String> MENU_TYPES = Set.of("M", "C", "F");

    private final SysMenuMapper menuMapper;
    private final TokenService tokenService;

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
    public List<Long> selectMenuIdsByRoleId(Long roleId) {
        return menuMapper.selectMenuIdsByRoleId(roleId);
    }

    @Override
    public List<Long> selectCheckedMenuIdsByRoleId(Long roleId) {
        List<Long> menuIds = selectMenuIdsByRoleId(roleId);
        if (menuIds.isEmpty()) {
            return new ArrayList<>();
        }

        Set<Long> parentIds = menuMapper.selectList(new LambdaQueryWrapper<SysMenu>())
            .stream()
            .map(SysMenu::getParentId)
            .filter(Objects::nonNull)
            .collect(Collectors.toSet());

        return menuIds.stream()
            .filter(menuId -> !parentIds.contains(menuId))
            .collect(Collectors.toList());
    }

    @Override
    public List<RouterVO> buildRouters(Long userId) {
        List<SysMenu> menus = menuMapper.selectMenusByUserId(userId);
        return buildRouterTree(menus.stream().filter(menu -> !"F".equals(menu.getMenuType())).toList(), 0L);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void createMenu(SysMenu menu) {
        if (menu == null) {
            throw new BusinessException("菜单数据不能为空");
        }
        validateMenuFields(menu);
        Long tenantId = requireCurrentTenantId();
        validateAndLockParentForCreate(menu, tenantId);
        normalizeMenu(menu);
        // Controller 直接接收实体；新增时租户只能来自当前登录态。
        menu.setTenantId(tenantId);
        menu.setDeleted(0);
        if (menuMapper.insert(menu) <= 0) {
            throw new BusinessException("菜单创建失败");
        }
        // 新菜单尚未绑定角色，不影响任何现有登录态。
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateMenu(SysMenu menu) {
        if (menu == null || menu.getId() == null) {
            throw new BusinessException("缺少菜单ID");
        }
        validateMenuFields(menu);
        Long tenantId = requireCurrentTenantId();
        SysMenu existing = lockMenuAndParentForUpdate(menu, tenantId);
        normalizeMenu(menu);
        // Controller 直接接收实体，禁止客户端借更新菜单篡改 tenant_id。
        menu.setTenantId(existing.getTenantId());
        // 删除必须走 deleteMenu 完成子菜单校验、关联清理和精准收权。
        menu.setDeleted(existing.getDeleted());
        if (sameMenuSettings(existing, menu)) {
            return;
        }
        List<Long> affectedUserIds = menuMapper.selectActiveUserIdsByMenuId(menu.getId(), tenantId);
        if (menuMapper.updateById(menu) <= 0) {
            throw new BusinessException("菜单不存在或无权修改");
        }
        if ("F".equals(menu.getMenuType())) {
            // F(按钮)型菜单的 path/component/icon 需强制置空;updateById 跳过 null 字段会残留旧值
            menuMapper.update(null, new LambdaUpdateWrapper<SysMenu>()
                .eq(SysMenu::getId, menu.getId())
                .set(SysMenu::getPath, null)
                .set(SysMenu::getComponent, null)
                .set(SysMenu::getIcon, null));
        }
        invalidateUsersSafely(affectedUserIds);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteMenu(Long menuId) {
        requireCurrentTenantMenuForUpdate(menuId);
        long count = menuMapper.selectCount(new LambdaQueryWrapper<SysMenu>().eq(SysMenu::getParentId, menuId));
        if (count > 0) {
            throw new BusinessException("存在子菜单，不允许删除");
        }
        Long tenantId = requireCurrentTenantId();
        List<Long> affectedUserIds = menuMapper.selectActiveUserIdsByMenuId(menuId, tenantId);
        if (menuMapper.deleteById(menuId) <= 0) {
            throw new BusinessException("菜单不存在或无权删除");
        }
        menuMapper.deleteRoleMenuRelations(menuId);
        invalidateUsersSafely(affectedUserIds);
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
            meta.setHidden(menu.getVisible() != null && menu.getVisible() == 0);
            router.setMeta(meta);

            router.setChildren(buildRouterTree(menus, menu.getId()));
            routers.add(router);
        }
        return routers;
    }

    private void normalizeMenu(SysMenu menu) {
        if (menu.getVisible() == null) {
            menu.setVisible(1);
        }
        if ("F".equals(menu.getMenuType())) {
            menu.setPath(null);
            menu.setComponent(null);
            menu.setIcon(null);
            menu.setVisible(0);
        }
    }

    private void validateMenuFields(SysMenu menu) {
        if (menu.getStatus() == null || (menu.getStatus() != 0 && menu.getStatus() != 1)) {
            throw new BusinessException("菜单状态只能是正常或停用");
        }
        if (!MENU_TYPES.contains(menu.getMenuType())) {
            throw new BusinessException("菜单类型只能是目录、菜单或按钮");
        }
    }

    private boolean sameMenuSettings(SysMenu left, SysMenu right) {
        return Objects.equals(left.getMenuName(), right.getMenuName())
            && Objects.equals(left.getParentId(), right.getParentId())
            && Objects.equals(left.getOrderNum(), right.getOrderNum())
            && Objects.equals(left.getPath(), right.getPath())
            && Objects.equals(left.getComponent(), right.getComponent())
            && Objects.equals(left.getMenuType(), right.getMenuType())
            && Objects.equals(left.getVisible(), right.getVisible())
            && Objects.equals(left.getStatus(), right.getStatus())
            && Objects.equals(left.getPerms(), right.getPerms())
            && Objects.equals(left.getIcon(), right.getIcon())
            && Objects.equals(left.getRemark(), right.getRemark());
    }

    private SysMenu requireCurrentTenantMenuForUpdate(Long menuId) {
        if (menuId == null) {
            throw new BusinessException("缺少菜单ID");
        }
        Long tenantId = requireCurrentTenantId();
        SysMenu menu = menuMapper.selectMenuForUpdate(menuId, tenantId);
        if (menu == null || !tenantId.equals(menu.getTenantId())) {
            throw new BusinessException("菜单不存在或不属于当前租户");
        }
        return menu;
    }

    /**
     * 更新菜单可能同时涉及目标菜单和新父菜单。统一按 ID 升序加锁，避免两个菜单互设父级时
     * 分别按“目标→父级”持锁形成 M1↔M2 死锁。
     */
    private SysMenu lockMenuAndParentForUpdate(SysMenu menu, Long tenantId) {
        Long menuId = menu.getId();
        Long parentId = menu.getParentId();
        if (parentId != null && parentId > 0 && parentId.equals(menuId)) {
            throw new BusinessException("上级菜单不能选择自身");
        }

        List<Long> lockIds = new ArrayList<>();
        lockIds.add(menuId);
        if (parentId != null && parentId > 0) {
            lockIds.add(parentId);
        }

        SysMenu target = null;
        SysMenu parent = null;
        for (Long lockId : lockIds.stream().distinct().sorted().toList()) {
            SysMenu locked = menuMapper.selectMenuForUpdate(lockId, tenantId);
            if (menuId.equals(lockId)) {
                target = locked;
            }
            if (parentId != null && parentId.equals(lockId)) {
                parent = locked;
            }
        }
        if (target == null || !tenantId.equals(target.getTenantId())) {
            throw new BusinessException("菜单不存在或不属于当前租户");
        }
        if (parentId != null && parentId > 0
                && (parent == null || !tenantId.equals(parent.getTenantId()))) {
            throw new BusinessException("上级菜单不存在或不属于当前租户");
        }
        return target;
    }

    private void validateAndLockParentForCreate(SysMenu menu, Long tenantId) {
        Long parentId = menu.getParentId();
        if (parentId == null || parentId <= 0) {
            return;
        }
        if (menu.getId() != null && parentId.equals(menu.getId())) {
            throw new BusinessException("上级菜单不能选择自身");
        }
        SysMenu parent = menuMapper.selectMenuForUpdate(parentId, tenantId);
        if (parent == null || !tenantId.equals(parent.getTenantId())) {
            throw new BusinessException("上级菜单不存在或不属于当前租户");
        }
    }

    private Long requireCurrentTenantId() {
        Long tenantId = SecurityUtils.getCurrentTenantId();
        if (tenantId == null) {
            throw new BusinessException("无法识别当前租户");
        }
        return tenantId;
    }

    private void invalidateUsersSafely(List<Long> userIds) {
        if (CollectionUtils.isEmpty(userIds)) {
            return;
        }
        userIds.stream()
            .filter(Objects::nonNull)
            .distinct()
            .forEach(tokenService::invalidateLoginUserSafely);
    }
}
