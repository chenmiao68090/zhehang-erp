package com.zhehang.erp.modules.crm.support;

import com.baomidou.mybatisplus.core.MybatisConfiguration;
import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import com.zhehang.erp.modules.org.mapper.OrgEmployeeMapper;
import com.zhehang.erp.modules.system.domain.entity.SysDept;
import com.zhehang.erp.modules.system.domain.entity.SysUser;
import com.zhehang.erp.modules.system.mapper.SysDeptMapper;
import com.zhehang.erp.modules.system.mapper.SysUserMapper;
import com.zhehang.erp.security.domain.LoginUser;
import org.apache.ibatis.builder.MapperBuilderAssistant;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class DataScopeHelperTest {

    private final SysDeptMapper deptMapper = mock(SysDeptMapper.class);
    private final SysUserMapper userMapper = mock(SysUserMapper.class);
    private final DataScopeHelper helper = new DataScopeHelper(
            deptMapper,
            userMapper,
            mock(OrgEmployeeMapper.class));

    @BeforeEach
    void initializeTableMetadata() {
        MybatisConfiguration configuration = new MybatisConfiguration();
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(configuration, ""), SysDept.class);
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(configuration, ""), SysUser.class);
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void managerCanAlwaysAccessOwnLeadWhenStoredDepartmentIsStale() {
        LoginUser manager = new LoginUser();
        manager.setUserId(18L);
        manager.setUsername("manager");
        manager.setDeptId(12L);
        manager.setDataScope(4);
        manager.setAdmin(false);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(manager, null, manager.getAuthorities()));

        assertThat(helper.canAccess(18L, 4L)).isTrue();
    }

    @Test
    void ordinarySalesStillCannotAccessAnotherOwnersLead() {
        LoginUser sales = new LoginUser();
        sales.setUserId(18L);
        sales.setUsername("sales");
        sales.setDeptId(12L);
        sales.setDataScope(5);
        sales.setAdmin(false);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(sales, null, sales.getAuthorities()));

        assertThat(helper.canAccess(22L, 4L)).isFalse();
    }

    @Test
    void managerUsesOwnersCurrentDepartmentInsteadOfStaleRecordDepartment() {
        authenticate(18L, 12L, 4);
        SysDept salesDept = new SysDept();
        salesDept.setId(12L);
        SysUser manager = user(18L, 12L);
        SysUser teammate = user(22L, 12L);
        when(deptMapper.selectList(any())).thenReturn(List.of(salesDept));
        when(userMapper.selectList(any())).thenReturn(List.of(manager, teammate));

        assertThat(helper.canAccess(22L, 4L)).isTrue();
        assertThat(helper.canAccess(99L, 12L)).isFalse();
    }

    private void authenticate(Long userId, Long deptId, Integer dataScope) {
        LoginUser user = new LoginUser();
        user.setUserId(userId);
        user.setUsername("user-" + userId);
        user.setDeptId(deptId);
        user.setDataScope(dataScope);
        user.setAdmin(false);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities()));
    }

    private SysUser user(Long userId, Long deptId) {
        SysUser user = new SysUser();
        user.setId(userId);
        user.setDeptId(deptId);
        return user;
    }
}
