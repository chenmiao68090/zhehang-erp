package com.zhehang.erp.modules.crm.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.MybatisConfiguration;
import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import com.zhehang.erp.common.core.domain.AuthUser;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.crm.domain.BizCallRecord;
import com.zhehang.erp.modules.crm.domain.BizYunkeUserMap;
import com.zhehang.erp.modules.crm.domain.vo.CallLeaderboardVO;
import com.zhehang.erp.modules.crm.mapper.BizCallRecordMapper;
import com.zhehang.erp.modules.crm.mapper.BizYunkeUserMapMapper;
import com.zhehang.erp.modules.system.domain.entity.SysDept;
import com.zhehang.erp.modules.system.domain.entity.SysUser;
import com.zhehang.erp.modules.system.mapper.SysDeptMapper;
import com.zhehang.erp.modules.system.mapper.SysUserMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.apache.ibatis.builder.MapperBuilderAssistant;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CallLeaderboardServiceTest {

    @Mock
    private BizCallRecordMapper callRecordMapper;
    @Mock
    private BizYunkeUserMapMapper yunkeUserMapMapper;
    @Mock
    private SysUserMapper userMapper;
    @Mock
    private SysDeptMapper deptMapper;

    private CallLeaderboardService service;

    @BeforeEach
    void setUp() {
        MapperBuilderAssistant assistant = new MapperBuilderAssistant(new MybatisConfiguration(), "");
        TableInfoHelper.initTableInfo(assistant, SysUser.class);
        TableInfoHelper.initTableInfo(assistant, SysDept.class);
        service = new CallLeaderboardService(callRecordMapper, yunkeUserMapMapper, userMapper, deptMapper);

        AuthUser authUser = org.mockito.Mockito.mock(AuthUser.class);
        when(authUser.getUserId()).thenReturn(20L);
        when(authUser.getTenantId()).thenReturn(1L);
        org.mockito.Mockito.lenient().when(authUser.getUsername()).thenReturn("sales20");
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(authUser, null));

        when(userMapper.selectList(any(LambdaQueryWrapper.class))).thenReturn(List.of(
                user(10L, "sales10", "王雷", 1L),
                user(20L, "sales20", "陈晨", 2L)
        ));
        when(deptMapper.selectList(any(LambdaQueryWrapper.class))).thenReturn(List.of(
                dept(1L, "销售一部"),
                dept(2L, "销售二部")
        ));
        BizYunkeUserMap mapping = new BizYunkeUserMap();
        mapping.setUserId(20L);
        mapping.setUserName("陈晨");
        mapping.setYunkeNickname("陈晨坐席");
        when(yunkeUserMapMapper.selectList(any(LambdaQueryWrapper.class))).thenReturn(List.of(mapping));
        when(callRecordMapper.selectMaps(any(QueryWrapper.class))).thenReturn(aggregateRows());
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void allCompanyRankingIncludesSameTenantUsersAndMergesHistoricalAlias() {
        CallLeaderboardVO result = service.getLeaderboard("today", "calls");

        assertEquals(400L, result.getTargetCount());
        assertEquals(2, result.getRows().size());
        assertEquals("王雷", result.getRows().get(0).getAgentName());
        assertEquals(568L, result.getRows().get(0).getCallCount());

        CallLeaderboardVO.Row self = result.getSelf();
        assertEquals(20L, self.getUserId());
        assertEquals(296L, self.getCallCount());
        assertEquals(2, self.getRank());
        assertEquals(272D, result.getGapToPrevious());
        assertEquals("销售二部", self.getDeptName());
        assertTrue(self.getCurrentUser());

        Set<String> names = result.getRows().stream().map(CallLeaderboardVO.Row::getAgentName).collect(Collectors.toSet());
        assertFalse(names.contains("外部租户坐席"));
    }

    @Test
    void rankingMetricChangesOrderAndResponseContainsNoCustomerPrivacyFields() {
        CallLeaderboardVO result = service.getLeaderboard("today", "effective");

        assertEquals(20L, result.getRows().get(0).getUserId());
        assertEquals(1, result.getSelf().getRank());
        assertEquals(15D, result.getGapToPrevious());

        Set<String> fields = Arrays.stream(CallLeaderboardVO.Row.class.getDeclaredFields())
                .map(java.lang.reflect.Field::getName)
                .collect(Collectors.toSet());
        assertFalse(fields.contains("phone"));
        assertFalse(fields.contains("customerName"));
        assertFalse(fields.contains("recordUrl"));
        assertFalse(fields.contains("remark"));
    }

    @Test
    void customDateRangeUsesFourHundredCallsPerCalendarDay() {
        LocalDate endDate = LocalDate.now().minusDays(1);
        LocalDate startDate = endDate.minusDays(2);

        CallLeaderboardVO result = service.getLeaderboard("custom", "calls", startDate, endDate);

        assertEquals("custom", result.getPeriod());
        assertEquals(startDate, result.getStartDate());
        assertEquals(endDate, result.getEndDate());
        assertEquals(3, result.getPeriodDays());
        assertEquals(400, result.getTargetPerDay());
        assertEquals(1200L, result.getTargetCount());
        assertEquals(1200L, result.getSelf().getTargetCount());
    }

    @Test
    void customDateRangeRejectsFutureAndOversizedRanges() {
        LocalDate today = LocalDate.now();
        service.getLeaderboard("today", "calls");

        assertThrows(BusinessException.class,
                () -> service.getLeaderboard("custom", "calls", today, today.plusDays(1)));
        assertThrows(BusinessException.class,
                () -> service.getLeaderboard("custom", "calls", today.minusDays(366), today));
    }

    private List<Map<String, Object>> aggregateRows() {
        List<Map<String, Object>> rows = new ArrayList<>();
        rows.add(row(10L, "王雷", 568L, 128L, 90L, 20538L));
        rows.add(row(20L, "陈晨", 286L, 112L, 100L, 9693L));
        rows.add(row(null, "陈晨坐席", 10L, 5L, 5L, 320L));
        rows.add(row(999L, "外部租户坐席", 999L, 999L, 999L, 999L));
        return rows;
    }

    private Map<String, Object> row(Long agentId, String agentName, long calls,
                                    long connected, long valid, long duration) {
        Map<String, Object> row = new HashMap<>();
        row.put("agentId", agentId);
        row.put("agentName", agentName);
        row.put("callCount", calls);
        row.put("connectedCount", connected);
        row.put("validCount", valid);
        row.put("totalDuration", duration);
        return row;
    }

    private SysUser user(long id, String username, String nickname, long deptId) {
        SysUser user = new SysUser();
        user.setId(id);
        user.setUsername(username);
        user.setNickname(nickname);
        user.setDeptId(deptId);
        user.setStatus(0);
        return user;
    }

    private SysDept dept(long id, String name) {
        SysDept dept = new SysDept();
        dept.setId(id);
        dept.setDeptName(name);
        return dept;
    }
}
