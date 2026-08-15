package com.zhehang.erp.modules.crm.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.MybatisConfiguration;
import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.zhehang.erp.common.core.domain.AuthUser;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.crm.domain.BizCallRecord;
import com.zhehang.erp.modules.crm.domain.entity.CrmLead;
import com.zhehang.erp.modules.crm.mapper.BizCallRecordMapper;
import com.zhehang.erp.modules.crm.mapper.BizYunkeUserMapMapper;
import com.zhehang.erp.modules.crm.mapper.CrmLeadMapper;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.system.domain.entity.SysDept;
import com.zhehang.erp.modules.system.domain.entity.SysUser;
import com.zhehang.erp.modules.system.mapper.SysDeptMapper;
import com.zhehang.erp.modules.system.mapper.SysUserMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.apache.ibatis.builder.MapperBuilderAssistant;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDate;
import java.util.List;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class CallRecordingServiceTest {

    @Mock private BizCallRecordMapper callRecordMapper;
    @Mock private BizYunkeUserMapMapper yunkeUserMapMapper;
    @Mock private CrmLeadMapper leadMapper;
    @Mock private SysUserMapper userMapper;
    @Mock private SysDeptMapper deptMapper;
    @Mock private DataScopeHelper dataScopeHelper;
    @Mock private StringRedisTemplate redisTemplate;
    @Mock private ValueOperations<String, String> valueOperations;

    private CallRecordingService service;

    @BeforeEach
    void setUp() {
        MapperBuilderAssistant assistant = new MapperBuilderAssistant(new MybatisConfiguration(), "");
        TableInfoHelper.initTableInfo(assistant, SysUser.class);
        TableInfoHelper.initTableInfo(assistant, SysDept.class);
        TableInfoHelper.initTableInfo(assistant, BizCallRecord.class);
        TableInfoHelper.initTableInfo(assistant, com.zhehang.erp.modules.crm.domain.BizYunkeUserMap.class);
        service = new CallRecordingService(callRecordMapper, yunkeUserMapMapper, leadMapper,
                userMapper, deptMapper, dataScopeHelper, redisTemplate, new ObjectMapper());
        authenticate(20L, 2L, 5, false, List.of("sales__copy"));
        when(dataScopeHelper.getVisibleUserIds()).thenReturn(List.of(20L));
        when(userMapper.selectList(any())).thenReturn(List.of(user(20L, "sales20", "陈晨", 2L)));
        when(deptMapper.selectList(any())).thenReturn(List.of(dept(2L, "销售二部")));
        when(yunkeUserMapMapper.selectList(any())).thenReturn(List.of());
        when(leadMapper.selectByNormalizedPhones(anyLong(), any())).thenReturn(List.of());
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void ordinarySalesOptionsAreLockedToSelf() {
        var options = service.options();

        assertEquals("self", options.getScopeMode());
        assertFalse(options.getCanSelectUser());
        assertFalse(options.getCanSelectDepartment());
        assertEquals(List.of(20L), options.getUsers().stream().map(item -> item.getId()).toList());
    }

    @Test
    void supervisorCanSeeDepartmentUsersButCannotForgeDepartmentFilter() {
        authenticate(20L, 2L, 4, false, List.of("dept_manager__copy"));
        when(dataScopeHelper.getVisibleUserIds()).thenReturn(List.of(20L, 21L));
        when(userMapper.selectList(any())).thenReturn(List.of(
                user(20L, "manager20", "主管", 2L), user(21L, "sales21", "销售甲", 3L)));
        when(deptMapper.selectList(any())).thenReturn(List.of(dept(2L, "销售二部"), dept(3L, "销售二部一组")));

        var options = service.options();

        assertEquals("department", options.getScopeMode());
        assertEquals(2, options.getUsers().size());
        assertEquals(true, options.getCanSelectUser());
        assertEquals(false, options.getCanSelectDepartment());
        assertThrows(AccessDeniedException.class, () -> service.page(LocalDate.now(), LocalDate.now(),
                null, 3L, null, null, null, null, 1, 20));
    }

    @Test
    void bossReceivesCompanyScopeAndDepartmentFilter() {
        authenticate(10L, 1L, 1, false, List.of("boss"));
        when(dataScopeHelper.getVisibleUserIds()).thenReturn(null);
        when(userMapper.selectList(any())).thenReturn(List.of(
                user(10L, "boss10", "老板", 1L), user(20L, "sales20", "销售乙", 2L)));
        when(deptMapper.selectList(any())).thenReturn(List.of(dept(1L, "总部"), dept(2L, "销售部")));

        var options = service.options();

        assertEquals("company", options.getScopeMode());
        assertEquals(true, options.getCanSelectDepartment());
        assertEquals(2, options.getUsers().size());
    }

    @Test
    void disabledAccountIsExcludedFromRecordingPeople() {
        authenticate(10L, 1L, 1, false, List.of("boss"));
        when(dataScopeHelper.getVisibleUserIds()).thenReturn(null);
        SysUser disabled = user(14L, "former14", "停用员工", 2L);
        disabled.setStatus(1);
        when(userMapper.selectList(any())).thenReturn(List.of(
                user(10L, "boss10", "老板", 1L), disabled));
        when(deptMapper.selectList(any())).thenReturn(List.of(dept(1L, "总部"), dept(2L, "销售部")));

        var options = service.options();

        assertEquals(List.of(10L), options.getUsers().stream().map(item -> item.getId()).toList());
    }

    @Test
    void forgedUserFilterIsRejectedBeforeDatabasePageQuery() {
        assertThrows(AccessDeniedException.class, () -> service.page(LocalDate.now(), LocalDate.now(),
                999L, null, null, null, null, null, 1, 20));
        verify(callRecordMapper, never()).selectPage(any(), any());
    }

    @Test
    void legacyAgentNameFallbackOnlyMatchesRowsWithoutBoundAgentId() {
        doAnswer(invocation -> {
            com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<BizCallRecord> query = invocation.getArgument(1);
            String sql = query.getCustomSqlSegment().toLowerCase();
            assertTrue(sql.contains("agent_id is null"));
            assertTrue(sql.contains("agent_name in"));
            assertTrue(sql.contains("agent_id in") && sql.contains(" or "));
            return new Page<BizCallRecord>(1, 20);
        }).when(callRecordMapper).selectPage(any(), any());

        service.page(LocalDate.now(), LocalDate.now(), null, null,
                null, null, null, null, 1, 20);
    }

    @Test
    void callWithoutLeadStillAppearsInRecordingList() {
        BizCallRecord record = recording(68L, 20L, "陈晨", null);
        record.setCustomerName(null);
        record.setLeadId(null);
        Page<BizCallRecord> resultPage = new Page<>(1, 20);
        resultPage.setRecords(List.of(record));
        resultPage.setTotal(1);
        when(callRecordMapper.selectPage(any(), any())).thenReturn(resultPage);

        var result = service.page(LocalDate.now(), LocalDate.now(), null, null,
                null, null, null, null, 1, 20);

        assertEquals(1, result.getTotal());
        assertEquals(1, result.getRecords().size());
        assertEquals("未关联客户", result.getRecords().get(0).getCustomerName());
        assertEquals("—", result.getRecords().get(0).getContactName());
        verify(leadMapper, never()).selectBatchIds(any());
    }

    @Test
    void uniqueVisiblePhoneMatchSuppliesCustomerAndContactName() {
        BizCallRecord record = recording(69L, 20L, "陈晨", null);
        record.setCustomerName(null);
        record.setLeadId(null);
        record.setPhone("+86 138-0013-8000");
        Page<BizCallRecord> resultPage = new Page<>(1, 20);
        resultPage.setRecords(List.of(record));
        resultPage.setTotal(1);
        when(callRecordMapper.selectPage(any(), any())).thenReturn(resultPage);
        when(leadMapper.selectByNormalizedPhones(anyLong(), any())).thenReturn(List.of(
                lead(101L, "杭州示例科技有限公司", "王经理", "13800138000", 20L, 2L)));
        when(dataScopeHelper.canAccess(20L, 2L)).thenReturn(true);

        var result = service.page(LocalDate.now(), LocalDate.now(), null, null,
                null, null, null, null, 1, 20);

        assertEquals("杭州示例科技有限公司", result.getRecords().get(0).getCustomerName());
        assertEquals("王经理", result.getRecords().get(0).getContactName());
    }

    @Test
    void duplicatePhoneDoesNotGuessCustomerName() {
        BizCallRecord record = recording(70L, 20L, "陈晨", null);
        record.setCustomerName(null);
        record.setLeadId(null);
        record.setPhone("13800138000");
        Page<BizCallRecord> resultPage = new Page<>(1, 20);
        resultPage.setRecords(List.of(record));
        resultPage.setTotal(1);
        when(callRecordMapper.selectPage(any(), any())).thenReturn(resultPage);
        when(leadMapper.selectByNormalizedPhones(anyLong(), any())).thenReturn(List.of(
                lead(101L, "客户甲", "联系人甲", "13800138000", 20L, 2L),
                lead(102L, "客户乙", "联系人乙", "13800138000", 20L, 2L)));
        when(dataScopeHelper.canAccess(20L, 2L)).thenReturn(true);

        var result = service.page(LocalDate.now(), LocalDate.now(), null, null,
                null, null, null, null, 1, 20);

        assertEquals("未关联客户", result.getRecords().get(0).getCustomerName());
        assertEquals("—", result.getRecords().get(0).getContactName());
    }

    @Test
    void inaccessiblePhoneMatchIsNotExposed() {
        BizCallRecord record = recording(71L, 20L, "陈晨", null);
        record.setCustomerName(null);
        record.setLeadId(null);
        record.setPhone("13800138000");
        Page<BizCallRecord> resultPage = new Page<>(1, 20);
        resultPage.setRecords(List.of(record));
        resultPage.setTotal(1);
        when(callRecordMapper.selectPage(any(), any())).thenReturn(resultPage);
        when(leadMapper.selectByNormalizedPhones(anyLong(), any())).thenReturn(List.of(
                lead(103L, "其他部门客户", "其他联系人", "13800138000", 99L, 9L)));
        when(dataScopeHelper.canAccess(99L, 9L)).thenReturn(false);

        var result = service.page(LocalDate.now(), LocalDate.now(), null, null,
                null, null, null, null, 1, 20);

        assertEquals("未关联客户", result.getRecords().get(0).getCustomerName());
        assertEquals("—", result.getRecords().get(0).getContactName());
    }

    @Test
    void phoneFallbackMapperQueryIsTenantBound() throws Exception {
        var method = CrmLeadMapper.class.getMethod("selectByNormalizedPhones", Long.class, java.util.Collection.class);
        var select = method.getAnnotation(org.apache.ibatis.annotations.Select.class);
        String sql = String.join(" ", select.value());

        assertTrue(sql.contains("tenant_id = #{tenantId}"));
        assertTrue(sql.contains("deleted = 0"));
        assertTrue(sql.contains("REGEXP_REPLACE"));
    }

    @Test
    void changingRecordIdCannotPlayAnotherSalesRecording() {
        BizCallRecord other = recording(99L, 30L, "其他坐席",
                "https://yunke-pcfile.oss-cn-beijing.aliyuncs.com/example.mp3");
        when(callRecordMapper.selectOne(any())).thenReturn(other);

        assertThrows(AccessDeniedException.class, () -> service.issueTicket(99L, "test-agent"));
        verify(redisTemplate, never()).opsForValue();
    }

    @Test
    void playbackLookupAlwaysIncludesCurrentTenant() {
        doAnswer(invocation -> {
            LambdaQueryWrapper<BizCallRecord> query = invocation.getArgument(0);
            String sql = query.getSqlSegment().toLowerCase();
            assertTrue(sql.contains("tenant_id"));
            assertTrue(sql.contains("id"));
            return null;
        }).when(callRecordMapper).selectOne(any());

        assertThrows(AccessDeniedException.class, () -> service.issueTicket(999L, "test-agent"));
        verify(redisTemplate, never()).opsForValue();
    }

    @Test
    void trustedRecordingIssuesShortTicketWithoutReturningOriginalUrl() {
        BizCallRecord own = recording(88L, 20L, "陈晨",
                "https://yunke-pcfile.oss-cn-beijing.aliyuncs.com/example.mp3");
        when(callRecordMapper.selectOne(any())).thenReturn(own);
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);

        var ticket = service.issueTicket(88L, "test-agent");

        assertNotNull(ticket.getToken());
        assertEquals(64, ticket.getToken().length());
        assertFalse(java.util.Arrays.stream(ticket.getClass().getDeclaredFields())
                .anyMatch(field -> field.getName().toLowerCase().contains("url")));
        verify(valueOperations).set(any(), any(), anyLong(), any(TimeUnit.class));
    }

    @Test
    void legacyCallRecordResponseCannotSerializeOriginalRecordingUrl() throws Exception {
        BizCallRecord record = recording(66L, 20L, "陈晨",
                "https://yunke-pcfile.oss-cn-beijing.aliyuncs.com/secret.mp3");
        record.setRecordingAvailable(true);

        String json = new ObjectMapper().writeValueAsString(record);

        assertFalse(json.contains("secret.mp3"));
        assertFalse(json.contains("recordUrl"));
        assertEquals(true, BizCallRecord.class.getDeclaredField("recordUrl").isAnnotationPresent(JsonIgnore.class));
    }

    @Test
    void untrustedRecordingHostIsRejected() {
        BizCallRecord own = recording(77L, 20L, "陈晨", "https://example.com/fake.mp3");
        when(callRecordMapper.selectOne(any())).thenReturn(own);

        assertThrows(BusinessException.class, () -> service.issueTicket(77L, "test-agent"));
    }

    @Test
    void externalRecordingTicketDoesNotExposeOriginalUrl() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);

        var ticket = service.issueExternalTicket(
                "https://yunke-sip-call.oss-cn-beijing.aliyuncs.com/private/example.mp3", "test-agent");

        assertNotNull(ticket.getToken());
        assertFalse(new ObjectMapper().valueToTree(ticket).toString().contains("oss-cn-beijing"));
        verify(valueOperations).set(any(), any(), anyLong(), any(TimeUnit.class));
    }

    @Test
    void externalRecordingRequiresHttpsTrustedHost() {
        assertThrows(BusinessException.class, () -> service.issueExternalTicket(
                "http://yunke-sip-call.oss-cn-beijing.aliyuncs.com/example.mp3", "test-agent"));
        assertThrows(BusinessException.class, () -> service.issueExternalTicket(
                "https://example.com/example.mp3", "test-agent"));
        verify(redisTemplate, never()).opsForValue();
    }

    @Test
    void dateRangeRejectsFutureReverseAndMoreThanThirtyOneDays() {
        LocalDate today = LocalDate.now();
        assertThrows(BusinessException.class, () -> CallRecordingService.validateRange(today, today.plusDays(1)));
        assertThrows(BusinessException.class, () -> CallRecordingService.validateRange(today, today.minusDays(1)));
        assertThrows(BusinessException.class, () -> CallRecordingService.validateRange(today.minusDays(31), today));
        assertEquals(31, java.time.temporal.ChronoUnit.DAYS.between(
                CallRecordingService.validateRange(today.minusDays(30), today).start(), today) + 1);
    }

    private void authenticate(Long userId, Long deptId, Integer dataScope, boolean admin, List<String> roles) {
        AuthUser authUser = org.mockito.Mockito.mock(AuthUser.class);
        when(authUser.getUserId()).thenReturn(userId);
        when(authUser.getTenantId()).thenReturn(1L);
        when(authUser.getUsername()).thenReturn("sales20");
        when(authUser.getDeptId()).thenReturn(deptId);
        when(authUser.getDataScope()).thenReturn(dataScope);
        when(authUser.isAdmin()).thenReturn(admin);
        when(authUser.getRoleKeys()).thenReturn(roles);
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(authUser, null));
    }

    private SysUser user(Long id, String username, String nickname, Long deptId) {
        SysUser user = new SysUser();
        user.setId(id);
        user.setUsername(username);
        user.setNickname(nickname);
        user.setDeptId(deptId);
        user.setStatus(0);
        return user;
    }

    private SysDept dept(Long id, String name) {
        SysDept dept = new SysDept();
        dept.setId(id);
        dept.setDeptName(name);
        dept.setOrderNum(1);
        return dept;
    }

    private BizCallRecord recording(Long id, Long agentId, String agentName, String url) {
        BizCallRecord record = new BizCallRecord();
        record.setId(id);
        record.setTenantId(1L);
        record.setAgentId(agentId);
        record.setAgentName(agentName);
        record.setRecordUrl(url);
        return record;
    }

    private CrmLead lead(Long id,
                         String company,
                         String legalPerson,
                         String phone,
                         Long ownerId,
                         Long deptId) {
        CrmLead lead = new CrmLead();
        lead.setId(id);
        lead.setCompany(company);
        lead.setLegalPerson(legalPerson);
        lead.setPhone(phone);
        lead.setOwnerId(ownerId);
        lead.setDeptId(deptId);
        return lead;
    }
}
