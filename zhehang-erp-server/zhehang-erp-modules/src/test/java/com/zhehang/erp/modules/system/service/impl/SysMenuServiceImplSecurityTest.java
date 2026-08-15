package com.zhehang.erp.modules.system.service.impl;

import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.system.domain.entity.SysMenu;
import com.zhehang.erp.modules.system.mapper.SysMenuMapper;
import com.zhehang.erp.security.domain.LoginUser;
import com.zhehang.erp.security.service.TokenService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InOrder;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SysMenuServiceImplSecurityTest {

    @Mock private SysMenuMapper menuMapper;
    @Mock private TokenService tokenService;

    private SysMenuServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new SysMenuServiceImpl(menuMapper, tokenService);
        LoginUser loginUser = new LoginUser();
        loginUser.setUserId(22L);
        loginUser.setTenantId(1L);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(loginUser, null, List.of()));
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void createForcesCurrentTenantAndDoesNotInvalidateExistingSessions() {
        SysMenu input = menu(null, 99L, 0L);
        when(menuMapper.insert(any(SysMenu.class))).thenReturn(1);

        service.createMenu(input);

        ArgumentCaptor<SysMenu> inserted = ArgumentCaptor.forClass(SysMenu.class);
        verify(menuMapper).insert(inserted.capture());
        assertThat(inserted.getValue().getTenantId()).isEqualTo(1L);
        assertThat(inserted.getValue().getDeleted()).isZero();
        verifyNoInteractions(tokenService);
    }

    @Test
    void failedMenuCreateIsReportedWithoutSessionInvalidation() {
        when(menuMapper.insert(any(SysMenu.class))).thenReturn(0);

        assertThatThrownBy(() -> service.createMenu(menu(null, 99L, 0L)))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("创建失败");

        verifyNoInteractions(tokenService);
    }

    @Test
    void createRejectsUnknownStatusBeforeAnyLockOrWrite() {
        SysMenu input = menu(null, 99L, 0L);
        input.setStatus(2);

        assertThatThrownBy(() -> service.createMenu(input))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("正常或停用");

        verifyNoInteractions(menuMapper, tokenService);
    }

    @Test
    void createRejectsParentOutsideCurrentTenantBeforeInsert() {
        SysMenu input = menu(null, 99L, 7L);
        when(menuMapper.selectMenuForUpdate(7L, 1L)).thenReturn(null);

        assertThatThrownBy(() -> service.createMenu(input))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("上级菜单不存在或不属于当前租户");

        verify(menuMapper, never()).insert(any(SysMenu.class));
        verifyNoInteractions(tokenService);
    }

    @Test
    void updateLocksTargetAndParentInAscendingOrderThenInvalidatesDistinctAffectedUsers() {
        SysMenu parent = menu(3L, 1L, 0L);
        SysMenu existing = menu(9L, 1L, 0L);
        existing.setDeleted(0);
        SysMenu input = menu(9L, 99L, 3L);
        input.setDeleted(1);
        when(menuMapper.selectMenuForUpdate(3L, 1L)).thenReturn(parent);
        when(menuMapper.selectMenuForUpdate(9L, 1L)).thenReturn(existing);
        when(menuMapper.selectActiveUserIdsByMenuId(9L, 1L))
                .thenReturn(Arrays.asList(21L, 21L, null, 22L));
        when(menuMapper.updateById(any(SysMenu.class))).thenReturn(1);

        service.updateMenu(input);

        InOrder ordered = inOrder(menuMapper, tokenService);
        ordered.verify(menuMapper).selectMenuForUpdate(3L, 1L);
        ordered.verify(menuMapper).selectMenuForUpdate(9L, 1L);
        ordered.verify(menuMapper).selectActiveUserIdsByMenuId(9L, 1L);
        ordered.verify(menuMapper).updateById(any(SysMenu.class));
        ordered.verify(tokenService).invalidateLoginUserSafely(21L);
        ordered.verify(tokenService).invalidateLoginUserSafely(22L);
        assertThat(input.getTenantId()).isEqualTo(1L);
        assertThat(input.getDeleted()).isZero();
    }

    @Test
    void updateRejectsSelfParentBeforeAnyLockOrWrite() {
        SysMenu input = menu(7L, 1L, 7L);

        assertThatThrownBy(() -> service.updateMenu(input))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("不能选择自身");

        verifyNoInteractions(menuMapper, tokenService);
    }

    @Test
    void updateRejectsUnknownMenuTypeBeforeAnyLockOrWrite() {
        SysMenu input = menu(7L, 1L, 0L);
        input.setMenuType("X");

        assertThatThrownBy(() -> service.updateMenu(input))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("菜单类型");

        verifyNoInteractions(menuMapper, tokenService);
    }

    @Test
    void exactSameMenuUpdateDoesNotWriteOrInvalidateSessions() {
        SysMenu existing = menu(7L, 1L, 0L);
        when(menuMapper.selectMenuForUpdate(7L, 1L)).thenReturn(existing);

        service.updateMenu(menu(7L, 99L, 0L));

        verify(menuMapper, never()).selectActiveUserIdsByMenuId(anyLong(), anyLong());
        verify(menuMapper, never()).updateById(any(SysMenu.class));
        verifyNoInteractions(tokenService);
    }

    @Test
    void failedMenuUpdateDoesNotInvalidateAffectedUsers() {
        SysMenu existing = menu(7L, 1L, 0L);
        when(menuMapper.selectMenuForUpdate(7L, 1L)).thenReturn(existing);
        when(menuMapper.selectActiveUserIdsByMenuId(7L, 1L)).thenReturn(List.of(21L));
        when(menuMapper.updateById(any(SysMenu.class))).thenReturn(0);

        SysMenu input = menu(7L, 1L, 0L);
        input.setMenuName("已修改菜单");

        assertThatThrownBy(() -> service.updateMenu(input))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("无权修改");

        verify(tokenService, never()).invalidateLoginUserSafely(anyLong());
    }

    @Test
    void deleteStopsBeforeMutationWhenChildMenuExists() {
        when(menuMapper.selectMenuForUpdate(7L, 1L)).thenReturn(menu(7L, 1L, 0L));
        when(menuMapper.selectCount(any())).thenReturn(1L);

        assertThatThrownBy(() -> service.deleteMenu(7L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("存在子菜单");

        verify(menuMapper, never()).selectActiveUserIdsByMenuId(anyLong(), anyLong());
        verify(menuMapper, never()).deleteById(anyLong());
        verify(menuMapper, never()).deleteRoleMenuRelations(anyLong());
        verifyNoInteractions(tokenService);
    }

    @Test
    void failedMenuDeleteKeepsRoleRelationsAndSessionsUntouched() {
        when(menuMapper.selectMenuForUpdate(7L, 1L)).thenReturn(menu(7L, 1L, 0L));
        when(menuMapper.selectCount(any())).thenReturn(0L);
        when(menuMapper.selectActiveUserIdsByMenuId(7L, 1L)).thenReturn(List.of(21L));
        when(menuMapper.deleteById(7L)).thenReturn(0);

        assertThatThrownBy(() -> service.deleteMenu(7L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("无权删除");

        verify(menuMapper, never()).deleteRoleMenuRelations(anyLong());
        verify(tokenService, never()).invalidateLoginUserSafely(anyLong());
    }

    @Test
    void deleteCleansRoleRelationsBeforeInvalidatingDistinctAffectedUsers() {
        when(menuMapper.selectMenuForUpdate(7L, 1L)).thenReturn(menu(7L, 1L, 0L));
        when(menuMapper.selectCount(any())).thenReturn(0L);
        when(menuMapper.selectActiveUserIdsByMenuId(7L, 1L))
                .thenReturn(Arrays.asList(21L, 21L, 22L));
        when(menuMapper.deleteById(7L)).thenReturn(1);
        when(menuMapper.deleteRoleMenuRelations(7L)).thenReturn(3);

        service.deleteMenu(7L);

        InOrder ordered = inOrder(menuMapper, tokenService);
        ordered.verify(menuMapper).selectMenuForUpdate(7L, 1L);
        ordered.verify(menuMapper).selectCount(any());
        ordered.verify(menuMapper).selectActiveUserIdsByMenuId(7L, 1L);
        ordered.verify(menuMapper).deleteById(7L);
        ordered.verify(menuMapper).deleteRoleMenuRelations(7L);
        ordered.verify(tokenService).invalidateLoginUserSafely(21L);
        ordered.verify(tokenService).invalidateLoginUserSafely(22L);
    }

    @Test
    void menuMutationsKeepRollbackTransactionsForTwoPhaseInvalidation() throws Exception {
        assertRollbackTransaction("createMenu", SysMenu.class);
        assertRollbackTransaction("updateMenu", SysMenu.class);
        assertRollbackTransaction("deleteMenu", Long.class);
    }

    @Test
    void mapperContractsLockMenusFilterActiveTenantRelationsAndIgnoreDisabledPermissions() throws Exception {
        String menuXml = resource("mapper/system/SysMenuMapper.xml").toLowerCase();
        assertThat(menuXml).contains(
                "<select id=\"selectmenuforupdate\"",
                "tenant_id = #{tenantid}",
                "for update",
                "<select id=\"selectactiveuseridsbymenuid\"",
                "r.status = 0",
                "r.deleted = 0",
                "u.tenant_id = #{tenantid}",
                "<delete id=\"deleterolemenurelations\"");

        String userXml = resource("mapper/system/SysUserMapper.xml").toLowerCase();
        String permissionQuery = selectStatement(userXml, "selectpermsbyuserid");
        assertThat(permissionQuery).contains("m.status = 0", "m.deleted = 0", "r.status = 0");
    }

    private SysMenu menu(Long id, Long tenantId, Long parentId) {
        SysMenu menu = new SysMenu();
        menu.setId(id);
        menu.setTenantId(tenantId);
        menu.setParentId(parentId);
        menu.setMenuName("菜单" + id);
        menu.setMenuType("C");
        menu.setVisible(1);
        menu.setStatus(0);
        return menu;
    }

    private void assertRollbackTransaction(String methodName, Class<?>... parameterTypes) throws Exception {
        Transactional transactional = SysMenuServiceImpl.class
                .getDeclaredMethod(methodName, parameterTypes)
                .getAnnotation(Transactional.class);
        assertThat(transactional).isNotNull();
        assertThat(transactional.rollbackFor()).contains(Exception.class);
    }

    private String resource(String path) throws Exception {
        try (InputStream input = getClass().getClassLoader().getResourceAsStream(path)) {
            assertThat(input).as(path + " must exist").isNotNull();
            return new String(input.readAllBytes(), StandardCharsets.UTF_8);
        }
    }

    private String selectStatement(String xml, String statementId) {
        String startMarker = "<select id=\"" + statementId + "\"";
        int start = xml.indexOf(startMarker);
        int end = xml.indexOf("</select>", start);
        assertThat(start).as(statementId + " must exist").isGreaterThanOrEqualTo(0);
        assertThat(end).as(statementId + " must close").isGreaterThan(start);
        return xml.substring(start, end);
    }
}
