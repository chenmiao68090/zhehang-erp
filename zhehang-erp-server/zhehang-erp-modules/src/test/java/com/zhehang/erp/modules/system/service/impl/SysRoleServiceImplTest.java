package com.zhehang.erp.modules.system.service.impl;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.core.MybatisConfiguration;
import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.system.domain.dto.RoleDTO;
import com.zhehang.erp.modules.system.domain.dto.RolePermissionSettingsDTO;
import com.zhehang.erp.modules.system.domain.entity.SysMenu;
import com.zhehang.erp.modules.system.domain.entity.SysRole;
import com.zhehang.erp.modules.system.domain.entity.SysUser;
import com.zhehang.erp.modules.system.mapper.SysMenuMapper;
import com.zhehang.erp.modules.system.mapper.SysRoleMapper;
import com.zhehang.erp.modules.system.mapper.SysUserMapper;
import com.zhehang.erp.security.domain.LoginUser;
import com.zhehang.erp.security.service.TokenService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.apache.ibatis.builder.MapperBuilderAssistant;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SysRoleServiceImplTest {

    @Mock
    private SysRoleMapper roleMapper;
    @Mock
    private SysUserMapper userMapper;
    @Mock
    private SysMenuMapper menuMapper;
    @Mock
    private TokenService tokenService;

    private SysRoleServiceImpl service;

    @BeforeEach
    void setUp() {
        if (TableInfoHelper.getTableInfo(SysRole.class) == null) {
            TableInfoHelper.initTableInfo(
                    new MapperBuilderAssistant(new MybatisConfiguration(), ""), SysRole.class);
        }
        service = new SysRoleServiceImpl(roleMapper, userMapper, menuMapper, tokenService);
        LoginUser loginUser = new LoginUser();
        loginUser.setUserId(1L);
        loginUser.setUsername("admin");
        loginUser.setTenantId(1L);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(loginUser, null, List.of()));
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void ordinaryEditKeepsExistingMenusWhenMenuIdsAreOmitted() {
        RoleDTO dto = editableRole();
        dto.setDataScope(null);
        when(roleMapper.selectRoleForUpdate(7L, 1L)).thenReturn(role(7L, 1L));
        when(roleMapper.updateById(any(SysRole.class))).thenReturn(1);

        service.updateRole(dto);

        verify(roleMapper).updateById(any(SysRole.class));
        verify(roleMapper, never()).deleteRoleMenus(7L);
        verify(roleMapper, never()).insertRoleMenus(any(), any());
    }

    @Test
    void genericRoleEditRejectsExplicitEmptyMenuIds() {
        RoleDTO dto = editableRole();
        dto.setDataScope(null);
        dto.setMenuIds(List.of());

        assertThatThrownBy(() -> service.updateRole(dto))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("统一通过角色管理权限设置");

        verify(roleMapper, never()).updateById(any(SysRole.class));
    }

    @Test
    void genericRoleEditRejectsDataScopeChanges() {
        RoleDTO dto = editableRole();

        assertThatThrownBy(() -> service.updateRole(dto))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("统一通过角色管理权限设置");

        verify(roleMapper, never()).updateById(any(SysRole.class));
    }

    @Test
    void failedOrCrossTenantRoleUpdateCannotChangeAnything() {
        RoleDTO dto = editableRole();
        dto.setDataScope(null);
        when(roleMapper.selectRoleForUpdate(7L, 1L)).thenReturn(role(7L, 1L));
        when(roleMapper.updateById(any(SysRole.class))).thenReturn(0);

        assertThatThrownBy(() -> service.updateRole(dto))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("无权修改");

        verify(roleMapper, never()).deleteRoleMenus(anyLong());
    }

    @Test
    void creatingPrivilegedRoleCopyIsRejectedBeforeInsert() {
        RoleDTO dto = editableRole();
        dto.setId(null);
        dto.setRoleKey("super_admin__copy");

        assertThatThrownBy(() -> service.createRole(dto))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("不允许复制");

        verify(roleMapper, never()).insert(any(SysRole.class));
    }

    @Test
    void invalidRoleStatusAndDataScopeAreRejectedBeforeWrite() {
        RoleDTO dto = editableRole();
        dto.setId(null);
        dto.setStatus(2);
        dto.setDataScope(6);

        assertThatThrownBy(() -> service.createRole(dto))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("角色状态");

        verify(roleMapper, never()).insert(any(SysRole.class));
    }

    @Test
    void createRoleRejectsMixedTenantMenusBeforeRoleInsert() {
        RoleDTO dto = editableRole();
        dto.setId(null);
        dto.setMenuIds(List.of(11L, 99L));
        when(menuMapper.selectMenuForUpdate(11L, 1L)).thenReturn(menu(11L, 1L));
        when(menuMapper.selectMenuForUpdate(99L, 1L)).thenReturn(menu(99L, 2L));

        assertThatThrownBy(() -> service.createRole(dto))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("不属于当前租户");

        verify(roleMapper, never()).insert(any(SysRole.class));
        verify(roleMapper, never()).insertRoleMenus(anyLong(), any());
    }

    @Test
    void changingRoleToPrivilegedCopyIsRejectedBeforeUpdate() {
        RoleDTO dto = editableRole();
        dto.setDataScope(null);
        dto.setRoleKey("boss__copy");
        SysRole existing = role(7L, 1L);
        existing.setRoleKey("tester");
        when(roleMapper.selectRoleForUpdate(7L, 1L)).thenReturn(existing);

        assertThatThrownBy(() -> service.updateRole(dto))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("不允许复制");

        verify(roleMapper, never()).updateById(any(SysRole.class));
        verify(roleMapper, never()).deleteRoleMenus(anyLong());
    }

    @Test
    void roleDetailReturnsCompleteMenuIdsForCopying() {
        SysRole role = new SysRole();
        role.setId(7L);
        role.setRoleName("测试角色");
        when(roleMapper.selectById(7L)).thenReturn(role);
        when(roleMapper.selectMenuIdsByRoleId(7L)).thenReturn(List.of(11L, 12L, 99L));

        SysRole detail = service.getRoleDetail(7L);

        assertThat(detail.getMenuIds()).containsExactly(11L, 12L, 99L);
    }

    @Test
    void roleDetailFailsClosedWhenMenuRelationQueryDoesNotReturnACollection() {
        SysRole role = new SysRole();
        role.setId(7L);
        when(roleMapper.selectById(7L)).thenReturn(role);
        when(roleMapper.selectMenuIdsByRoleId(7L)).thenReturn(null);

        assertThatThrownBy(() -> service.getRoleDetail(7L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("权限加载失败");
    }

    @Test
    void menuIdsAreResponseOnlyAndNeverMappedToSysRoleTable() throws Exception {
        TableField annotation = SysRole.class.getDeclaredField("menuIds").getAnnotation(TableField.class);

        assertThat(annotation).isNotNull();
        assertThat(annotation.exist()).isFalse();
    }

    @Test
    void atomicPermissionUpdateRejectsMissingMenuIdsBeforeDeletingAnything() {
        RolePermissionSettingsDTO dto = permissionSettings(7L, 3, "/customer");
        dto.setMenuIds(null);

        assertThatThrownBy(() -> service.updatePermissionSettings(dto))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("缺少操作权限数据");

        verify(roleMapper, never()).deleteRoleMenus(anyLong());
    }

    @Test
    void atomicPermissionUpdateDeduplicatesAndSortsMenuIds() {
        SysRole existing = role(7L, 1L);
        existing.setDataScope(3);
        existing.setVisibleModules("/customer");
        when(roleMapper.selectRoleForUpdate(7L, 1L)).thenReturn(existing);
        when(menuMapper.selectMenuForUpdate(11L, 1L)).thenReturn(menu(11L, 1L));
        when(menuMapper.selectMenuForUpdate(12L, 1L)).thenReturn(menu(12L, 1L));
        when(roleMapper.selectMenuIdsByRoleId(7L)).thenReturn(List.of(10L));

        RolePermissionSettingsDTO dto = permissionSettings(7L, 3, "/customer");
        dto.setMenuIds(List.of(12L, 11L, 12L));
        service.updatePermissionSettings(dto);

        org.mockito.InOrder ordered = inOrder(menuMapper);
        ordered.verify(menuMapper).selectMenuForUpdate(11L, 1L);
        ordered.verify(menuMapper).selectMenuForUpdate(12L, 1L);
        verify(roleMapper).deleteRoleMenus(7L);
        verify(roleMapper).insertRoleMenus(7L, List.of(11L, 12L));
    }

    @Test
    void atomicPermissionUpdateRejectsCrossTenantMenuBeforeAnyWrite() {
        SysRole existing = role(7L, 1L);
        existing.setDataScope(3);
        existing.setVisibleModules("/customer");
        when(roleMapper.selectRoleForUpdate(7L, 1L)).thenReturn(existing);
        when(menuMapper.selectMenuForUpdate(11L, 1L)).thenReturn(menu(11L, 1L));
        when(menuMapper.selectMenuForUpdate(99L, 1L)).thenReturn(menu(99L, 2L));

        RolePermissionSettingsDTO dto = permissionSettings(7L, 3, "/customer");
        dto.setMenuIds(List.of(11L, 99L));
        assertThatThrownBy(() -> service.updatePermissionSettings(dto))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("不属于当前租户");

        verify(roleMapper, never()).update(isNull(), any());
        verify(roleMapper, never()).deleteRoleMenus(anyLong());
        verify(roleMapper, never()).insertRoleMenus(anyLong(), any());
        verify(tokenService, never()).invalidateLoginUserSafely(anyLong());
    }

    @Test
    void atomicPermissionUpdateCanExplicitlyClearOperationPermissions() {
        SysRole existing = role(7L, 1L);
        existing.setDataScope(3);
        existing.setVisibleModules("/customer");
        when(roleMapper.selectRoleForUpdate(7L, 1L)).thenReturn(existing);
        when(roleMapper.selectMenuIdsByRoleId(7L)).thenReturn(List.of(11L));

        service.updatePermissionSettings(permissionSettings(7L, 3, "/customer"));

        verify(roleMapper).deleteRoleMenus(7L);
        verify(roleMapper, never()).insertRoleMenus(anyLong(), any());
    }

    @Test
    void roleWithMembersCannotBeDeleted() {
        when(roleMapper.selectRoleForUpdate(7L, 1L)).thenReturn(role(7L, 1L));
        when(roleMapper.countRoleMemberRelations(7L)).thenReturn(1);
        when(roleMapper.countDeletedRoleMemberRelations(7L, 1L)).thenReturn(0);

        assertThatThrownBy(() -> service.deleteRole(7L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("先移除全部成员");

        verify(roleMapper, never()).deleteById(anyLong());
        verify(roleMapper, never()).deleteRoleMenus(anyLong());
        verify(roleMapper, never()).deleteRoleMembers(anyLong());
    }

    @Test
    void roleUsedOnlyBySoftDeletedTenantUsersCanBeDeletedAndRelationsAreCleaned() {
        when(roleMapper.selectRoleForUpdate(7L, 1L)).thenReturn(role(7L, 1L));
        when(roleMapper.countRoleMemberRelations(7L)).thenReturn(2);
        when(roleMapper.countDeletedRoleMemberRelations(7L, 1L)).thenReturn(2);
        when(roleMapper.deleteById(7L)).thenReturn(1);

        service.deleteRole(7L);

        verify(roleMapper).deleteById(7L);
        verify(roleMapper).deleteRoleMenus(7L);
        verify(roleMapper).deleteRoleMembers(7L);
    }

    @Test
    void roleWithoutMembersStillPerformsDefensiveRelationCleanup() {
        when(roleMapper.selectRoleForUpdate(7L, 1L)).thenReturn(role(7L, 1L));
        when(roleMapper.countRoleMemberRelations(7L)).thenReturn(0);
        when(roleMapper.deleteById(7L)).thenReturn(1);

        service.deleteRole(7L);

        verify(roleMapper, never()).countDeletedRoleMemberRelations(anyLong(), anyLong());
        verify(roleMapper).deleteById(7L);
        verify(roleMapper).deleteRoleMenus(7L);
        verify(roleMapper).deleteRoleMembers(7L);
    }

    @Test
    void securityFieldChangeInvalidatesOnlyRoleMembersAfterSuccessfulWrite() {
        RoleDTO dto = editableRole();
        dto.setDataScope(null);
        SysRole existing = role(7L, 1L);
        existing.setRoleKey("tester");
        existing.setStatus(1);
        existing.setDataScope(5);
        when(roleMapper.selectRoleForUpdate(7L, 1L)).thenReturn(existing);
        when(roleMapper.updateById(any(SysRole.class))).thenReturn(1);
        when(roleMapper.selectUserIdsByRoleId(7L, 1L)).thenReturn(List.of(21L, 22L));

        service.updateRole(dto);

        org.mockito.InOrder order = inOrder(roleMapper, tokenService);
        order.verify(roleMapper).updateById(any(SysRole.class));
        order.verify(roleMapper).selectUserIdsByRoleId(7L, 1L);
        order.verify(tokenService).invalidateLoginUserSafely(21L);
        order.verify(tokenService).invalidateLoginUserSafely(22L);
    }

    @Test
    void basicOnlyRoleEditDoesNotInvalidateSessions() {
        RoleDTO dto = editableRole();
        dto.setDataScope(null);
        SysRole existing = role(7L, 1L);
        existing.setRoleKey(dto.getRoleKey());
        existing.setStatus(dto.getStatus());
        existing.setDataScope(dto.getDataScope());
        when(roleMapper.selectRoleForUpdate(7L, 1L)).thenReturn(existing);
        when(roleMapper.updateById(any(SysRole.class))).thenReturn(1);

        service.updateRole(dto);

        verify(roleMapper, never()).selectUserIdsByRoleId(anyLong(), anyLong());
        verify(tokenService, never()).invalidateLoginUserSafely(anyLong());
    }

    @Test
    void failedRoleWriteNeverInvalidatesSessions() {
        RoleDTO dto = editableRole();
        dto.setDataScope(null);
        SysRole existing = role(7L, 1L);
        existing.setRoleKey("old-key");
        when(roleMapper.selectRoleForUpdate(7L, 1L)).thenReturn(existing);
        when(roleMapper.updateById(any(SysRole.class))).thenReturn(0);

        assertThatThrownBy(() -> service.updateRole(dto)).isInstanceOf(BusinessException.class);

        verify(roleMapper, never()).selectUserIdsByRoleId(anyLong(), anyLong());
        verify(tokenService, never()).invalidateLoginUserSafely(anyLong());
    }

    @Test
    void permissionSettingsUpdateUsesOneWriteAndOneInvalidationPass() {
        SysRole existing = role(7L, 1L);
        existing.setDataScope(5);
        existing.setVisibleModules("/customer");
        when(roleMapper.selectRoleForUpdate(7L, 1L)).thenReturn(existing);
        when(roleMapper.update(isNull(), any())).thenReturn(1);
        when(roleMapper.selectUserIdsByRoleId(7L, 1L)).thenReturn(List.of(21L, 21L, 22L));
        RolePermissionSettingsDTO dto = permissionSettings(7L, 3, "/customer, /finance");

        service.updatePermissionSettings(dto);

        verify(roleMapper, times(1)).update(isNull(), any());
        verify(tokenService, times(1)).invalidateLoginUserSafely(21L);
        verify(tokenService, times(1)).invalidateLoginUserSafely(22L);
    }

    @Test
    void samePermissionSettingsDoNotWriteOrInvalidate() {
        SysRole existing = role(7L, 1L);
        existing.setDataScope(3);
        existing.setVisibleModules("/finance,/customer");
        when(roleMapper.selectRoleForUpdate(7L, 1L)).thenReturn(existing);

        service.updatePermissionSettings(permissionSettings(7L, 3, "/customer, /finance, /customer"));

        verify(roleMapper, never()).update(isNull(), any());
        verify(roleMapper, never()).selectUserIdsByRoleId(anyLong(), anyLong());
        verify(tokenService, never()).invalidateLoginUserSafely(anyLong());
    }

    @Test
    void invalidPermissionDataScopeIsRejectedBeforeRoleReadOrWrite() {
        assertThatThrownBy(() -> service.updatePermissionSettings(permissionSettings(7L, 0, null)))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("1到5");

        verify(roleMapper, never()).selectById(anyLong());
        verify(roleMapper, never()).selectRoleForUpdate(anyLong(), anyLong());
        verify(roleMapper, never()).update(isNull(), any());
        verify(tokenService, never()).invalidateLoginUserSafely(anyLong());
    }

    @ParameterizedTest
    @ValueSource(strings = {"   ", ", ,"})
    void blankVisibleModulesAreRejectedBeforeRoleReadWriteOrInvalidation(String visibleModules) {
        assertThatThrownBy(() -> service.updatePermissionSettings(permissionSettings(7L, 3, visibleModules)))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("至少保留一个可见模块");

        verify(roleMapper, never()).selectById(anyLong());
        verify(roleMapper, never()).selectRoleForUpdate(anyLong(), anyLong());
        verify(roleMapper, never()).update(isNull(), any());
        verify(roleMapper, never()).updateById(any(SysRole.class));
        verify(roleMapper, never()).selectUserIdsByRoleId(anyLong(), anyLong());
        verify(tokenService, never()).invalidateLoginUserSafely(anyLong());
    }

    @Test
    void roleMemberListRejectsRoleFromAnotherTenantBeforeQueryingAssociation() {
        SysRole foreignRole = role(7L, 2L);
        when(roleMapper.selectById(7L)).thenReturn(foreignRole);

        assertThatThrownBy(() -> service.listRoleMembers(7L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("无权管理成员");

        verify(roleMapper, never()).selectRoleMembers(anyLong(), anyLong());
    }

    @Test
    void addingRoleMembersRejectsAnyUserFromAnotherTenantBeforeWriting() {
        when(roleMapper.selectRoleForUpdate(7L, 1L)).thenReturn(role(7L, 1L));
        when(userMapper.selectBatchIds(List.of(11L, 12L)))
                .thenReturn(List.of(user(11L, 1L), user(12L, 2L)));

        assertThatThrownBy(() -> service.addRoleMembers(7L, List.of(11L, 12L)))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("不属于当前租户");

        verify(roleMapper, never()).insertRoleMemberIfAbsent(anyLong(), anyLong());
    }

    @Test
    void addingRoleMembersRejectsUnknownUserBeforeWriting() {
        when(roleMapper.selectRoleForUpdate(7L, 1L)).thenReturn(role(7L, 1L));
        when(userMapper.selectBatchIds(List.of(11L, 12L)))
                .thenReturn(List.of(user(11L, 1L)));

        assertThatThrownBy(() -> service.addRoleMembers(7L, List.of(11L, 12L)))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("用户不存在");

        verify(roleMapper, never()).insertRoleMemberIfAbsent(anyLong(), anyLong());
    }

    @Test
    void validRoleMembersAreValidatedDeduplicatedAndAdded() {
        when(roleMapper.selectRoleForUpdate(7L, 1L)).thenReturn(role(7L, 1L));
        when(userMapper.selectBatchIds(List.of(11L, 12L)))
                .thenReturn(List.of(user(11L, 1L), user(12L, 1L)));
        when(roleMapper.insertRoleMemberIfAbsent(7L, 11L)).thenReturn(1);
        when(roleMapper.insertRoleMemberIfAbsent(7L, 12L)).thenReturn(1);

        int added = service.addRoleMembers(7L, List.of(11L, 11L, 12L));

        assertThat(added).isEqualTo(2);
        verify(roleMapper, times(1)).insertRoleMemberIfAbsent(7L, 11L);
        verify(roleMapper, times(1)).insertRoleMemberIfAbsent(7L, 12L);
        verify(tokenService).invalidateLoginUserSafely(11L);
        verify(tokenService).invalidateLoginUserSafely(12L);
    }

    @Test
    void existingRoleMemberDoesNotInvalidateAgain() {
        when(roleMapper.selectRoleForUpdate(7L, 1L)).thenReturn(role(7L, 1L));
        when(userMapper.selectBatchIds(List.of(11L))).thenReturn(List.of(user(11L, 1L)));
        when(roleMapper.insertRoleMemberIfAbsent(7L, 11L)).thenReturn(0);

        assertThat(service.addRoleMembers(7L, List.of(11L))).isZero();

        verify(tokenService, never()).invalidateLoginUserSafely(anyLong());
    }

    @Test
    void removingExistingMemberInvalidatesOnlyThatUser() {
        when(roleMapper.selectRoleForUpdate(7L, 1L)).thenReturn(role(7L, 1L));
        when(userMapper.selectBatchIds(List.of(12L))).thenReturn(List.of(user(12L, 1L)));
        when(roleMapper.deleteRoleMember(7L, 12L)).thenReturn(1);

        service.removeRoleMember(7L, 12L);

        verify(tokenService).invalidateLoginUserSafely(12L);
    }

    @Test
    void removingMissingMemberDoesNotInvalidate() {
        when(roleMapper.selectRoleForUpdate(7L, 1L)).thenReturn(role(7L, 1L));
        when(userMapper.selectBatchIds(List.of(12L))).thenReturn(List.of(user(12L, 1L)));
        when(roleMapper.deleteRoleMember(7L, 12L)).thenReturn(0);

        service.removeRoleMember(7L, 12L);

        verify(tokenService, never()).invalidateLoginUserSafely(anyLong());
    }

    @Test
    void removingRoleMemberRejectsForeignTenantUserBeforeDeleting() {
        when(roleMapper.selectRoleForUpdate(7L, 1L)).thenReturn(role(7L, 1L));
        when(userMapper.selectBatchIds(List.of(12L))).thenReturn(List.of(user(12L, 2L)));

        assertThatThrownBy(() -> service.removeRoleMember(7L, 12L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("不属于当前租户");

        verify(roleMapper, never()).deleteRoleMember(anyLong(), anyLong());
    }

    @Test
    void tenantBossCannotGrantPrivilegedBossRoleToAnotherUser() {
        SysRole bossRole = role(9L, 1L);
        bossRole.setRoleKey("boss");
        when(roleMapper.selectRoleForUpdate(9L, 1L)).thenReturn(bossRole);
        login(22L, 1L);

        assertThatThrownBy(() -> service.addRoleMembers(9L, List.of(88L)))
                .isInstanceOf(org.springframework.security.access.AccessDeniedException.class)
                .hasMessageContaining("超级管理员");

        verify(userMapper, never()).selectBatchIds(any());
        verify(roleMapper, never()).insertRoleMemberIfAbsent(anyLong(), anyLong());
    }

    @Test
    void exactSuperAdminCanAddMemberToCanonicalRole() {
        SysRole superAdmin = role(1L, 1L);
        superAdmin.setRoleKey("super_admin");
        when(roleMapper.selectRoleForUpdate(1L, 1L)).thenReturn(superAdmin);
        when(userMapper.selectBatchIds(List.of(88L))).thenReturn(List.of(user(88L, 1L)));
        when(roleMapper.insertRoleMemberIfAbsent(1L, 88L)).thenReturn(1);
        login(22L, 1L, List.of("super_admin"));

        assertThat(service.addRoleMembers(1L, List.of(88L))).isEqualTo(1);

        verify(roleMapper).insertRoleMemberIfAbsent(1L, 88L);
        verify(tokenService).invalidateLoginUserSafely(88L);
    }

    @Test
    void copiedSuperAdminKeyCannotManageCanonicalRole() {
        SysRole superAdmin = role(1L, 1L);
        superAdmin.setRoleKey("super_admin");
        when(roleMapper.selectRoleForUpdate(1L, 1L)).thenReturn(superAdmin);
        login(22L, 1L, List.of("super_admin__copy"));

        assertThatThrownBy(() -> service.addRoleMembers(1L, List.of(88L)))
                .isInstanceOf(org.springframework.security.access.AccessDeniedException.class)
                .hasMessageContaining("超级管理员");

        verify(userMapper, never()).selectBatchIds(any());
    }

    @Test
    void impersonatedSuperAdminCannotManageCanonicalRole() {
        SysRole superAdmin = role(1L, 1L);
        superAdmin.setRoleKey("super_admin");
        when(roleMapper.selectRoleForUpdate(1L, 1L)).thenReturn(superAdmin);
        login(22L, 1L, List.of("super_admin"), "imp-session-1");

        assertThatThrownBy(() -> service.addRoleMembers(1L, List.of(88L)))
                .isInstanceOf(org.springframework.security.access.AccessDeniedException.class);

        verify(userMapper, never()).selectBatchIds(any());
    }

    @Test
    void canonicalSuperAdminRoleCannotBeDeleted() {
        SysRole superAdmin = role(1L, 1L);
        superAdmin.setRoleKey("super_admin");
        when(roleMapper.selectRoleForUpdate(1L, 1L)).thenReturn(superAdmin);

        assertThatThrownBy(() -> service.deleteRole(1L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("不允许删除");

        verify(roleMapper, never()).deleteById(anyLong());
    }

    @Test
    void noRolesResolveToEmptyNavigationInsteadOfUnlimited() {
        assertThat(service.resolveVisibleModules(List.of())).isEmpty();
        verify(roleMapper, never()).selectList(any());
    }

    private RoleDTO editableRole() {
        RoleDTO dto = new RoleDTO();
        dto.setId(7L);
        dto.setRoleName("测试角色");
        dto.setRoleKey("tester");
        dto.setStatus(0);
        dto.setDataScope(5);
        return dto;
    }

    private SysRole role(Long id, Long tenantId) {
        SysRole role = new SysRole();
        role.setId(id);
        role.setTenantId(tenantId);
        return role;
    }

    private SysMenu menu(Long id, Long tenantId) {
        SysMenu menu = new SysMenu();
        menu.setId(id);
        menu.setTenantId(tenantId);
        return menu;
    }

    private RolePermissionSettingsDTO permissionSettings(Long roleId, Integer dataScope, String visibleModules) {
        RolePermissionSettingsDTO dto = new RolePermissionSettingsDTO();
        dto.setRoleId(roleId);
        dto.setDataScope(dataScope);
        dto.setVisibleModules(visibleModules);
        dto.setMenuIds(List.of());
        return dto;
    }

    private SysUser user(Long id, Long tenantId) {
        SysUser user = new SysUser();
        user.setId(id);
        user.setTenantId(tenantId);
        return user;
    }

    private void login(Long userId, Long tenantId) {
        login(userId, tenantId, List.of());
    }

    private void login(Long userId, Long tenantId, List<String> roleKeys) {
        login(userId, tenantId, roleKeys, null);
    }

    private void login(Long userId, Long tenantId, List<String> roleKeys, String impersonationSessionId) {
        LoginUser loginUser = new LoginUser();
        loginUser.setUserId(userId);
        loginUser.setUsername("user-" + userId);
        loginUser.setTenantId(tenantId);
        loginUser.setRoleKeys(roleKeys);
        loginUser.setImpersonationSessionId(impersonationSessionId);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(loginUser, null, List.of()));
    }
}
