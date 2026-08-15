package com.zhehang.erp.modules.crm.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.crm.domain.BizYunkeUserMap;
import com.zhehang.erp.modules.crm.integration.YunkeClient;
import com.zhehang.erp.modules.crm.mapper.BizWechatChatMapper;
import com.zhehang.erp.modules.crm.mapper.BizWechatFriendInfoMapper;
import com.zhehang.erp.modules.crm.mapper.BizWechatMsgStatMapper;
import com.zhehang.erp.modules.crm.mapper.BizYunkeUserMapMapper;
import com.zhehang.erp.modules.crm.mapper.YunkeConfigMapper;
import com.zhehang.erp.modules.crm.domain.vo.CallRecordingVO;
import com.zhehang.erp.modules.crm.service.CallRecordingService;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.org.mapper.OrgEmployeeMapper;
import com.zhehang.erp.modules.system.mapper.SysUserMapper;
import com.zhehang.erp.modules.system.domain.entity.SysUser;
import com.zhehang.erp.security.domain.LoginUser;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class YunkePrivacySecurityTest {

    @Mock private YunkeConfigMapper configMapper;
    @Mock private YunkeClient yunkeClient;
    @Mock private ObjectMapper objectMapper;
    @Mock private BizWechatChatMapper chatMapper;
    @Mock private BizYunkeUserMapMapper mapMapper;
    @Mock private SysUserMapper sysUserMapper;
    @Mock private BizWechatFriendInfoMapper friendInfoMapper;
    @Mock private BizWechatMsgStatMapper msgStatMapper;
    @Mock private OrgEmployeeMapper orgEmployeeMapper;
    @Mock private DataScopeHelper dataScopeHelper;
    @Mock private CallRecordingService callRecordingService;

    @InjectMocks private YunkeController controller;

    @BeforeEach
    void loginAsBossWithOwnWechat() {
        LoginUser loginUser = new LoginUser();
        loginUser.setUserId(9L);
        loginUser.setUsername("tenant-boss");
        loginUser.setTenantId(1L);
        loginUser.setRoleKeys(List.of("boss"));
        loginUser.setPermissions(Set.of("crm:list"));
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(loginUser, null, loginUser.getAuthorities()));

    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void evenBossCannotReadAnotherEmployeesChatByTamperingWechatId() {
        assertThrows(AccessDeniedException.class,
                () -> controller.wechatChat("wx-other", null, null, null, null, null, null));

        verifyNoInteractions(chatMapper, friendInfoMapper);
    }

    @Test
    void evenBossCannotReadAnotherEmployeesMomentsByTamperingWechatId() {
        assertThrows(AccessDeniedException.class,
                () -> controller.moments("wx-other", null, null));

        verifyNoInteractions(yunkeClient);
    }

    @Test
    void managerCannotEditCloudMappingOutsideVisibleEmployeeScope() {
        BizYunkeUserMap tampered = new BizYunkeUserMap();
        tampered.setUserId(88L);
        tampered.setYunkeWechatId("wx-other");
        when(dataScopeHelper.canAccessOwner(88L)).thenReturn(false);

        assertThrows(AccessDeniedException.class, () -> controller.saveUserMap(List.of(tampered)));
    }

    @Test
    void mappingCannotTargetAnEmployeeOutsideCurrentTenant() {
        BizYunkeUserMap tampered = new BizYunkeUserMap();
        tampered.setUserId(88L);
        tampered.setYunkeUserId("seat-88");
        when(dataScopeHelper.canAccessOwner(88L)).thenReturn(true);
        when(sysUserMapper.selectOne(any())).thenReturn(null);

        assertThrows(AccessDeniedException.class, () -> controller.saveUserMap(List.of(tampered)));

        verify(mapMapper, never()).insert(any());
    }

    @Test
    void duplicateCloudSeatInsideTenantIsRejectedBeforeWrite() {
        BizYunkeUserMap input = new BizYunkeUserMap();
        input.setUserId(9L);
        input.setYunkeUserId("shared-seat");
        BizYunkeUserMap conflict = new BizYunkeUserMap();
        conflict.setUserId(10L);
        conflict.setYunkeUserId("shared-seat");
        when(dataScopeHelper.canAccessOwner(9L)).thenReturn(true);
        when(sysUserMapper.selectOne(any())).thenReturn(systemUser(9L));
        when(mapMapper.selectOne(any())).thenReturn(null, conflict);

        assertThrows(BusinessException.class, () -> controller.saveUserMap(List.of(input)));

        verify(mapMapper, never()).insert(any());
    }

    @Test
    void mappingUsesCanonicalEmployeeIdentityAndCurrentTenant() {
        BizYunkeUserMap input = new BizYunkeUserMap();
        input.setUserId(9L);
        input.setUserName("伪造姓名");
        input.setUserPhone("伪造手机");
        input.setYunkeUserId("  seat-9  ");
        when(dataScopeHelper.canAccessOwner(9L)).thenReturn(true);
        when(sysUserMapper.selectOne(any())).thenReturn(systemUser(9L));
        when(mapMapper.selectOne(any())).thenReturn(null);

        controller.saveUserMap(List.of(input));

        org.mockito.ArgumentCaptor<BizYunkeUserMap> captor =
                org.mockito.ArgumentCaptor.forClass(BizYunkeUserMap.class);
        verify(mapMapper).insert(captor.capture());
        assertEquals(1L, captor.getValue().getTenantId());
        assertEquals("本租户员工", captor.getValue().getUserName());
        assertEquals("13800000000", captor.getValue().getUserPhone());
        assertEquals("seat-9", captor.getValue().getYunkeUserId());
    }

    @Test
    void voiceListReplacesPlatformRecordingUrlWithShortTicket() throws Exception {
        var upstream = new ObjectMapper().readTree("""
                {"data":{"total":1,"data":[{"ossFileName":"https://yunke-sip-call.oss-cn-beijing.aliyuncs.com/private/a.mp3","userName":"销售甲"}]}}
                """);
        LinkedHashMap<String, Object> converted = new LinkedHashMap<>();
        converted.put("ossFileName", "https://yunke-sip-call.oss-cn-beijing.aliyuncs.com/private/a.mp3");
        converted.put("userName", "销售甲");
        when(yunkeClient.call(eq("/open/wechat/queryWeChatVoiceList"), any())).thenReturn(upstream);
        when(objectMapper.convertValue(any(com.fasterxml.jackson.databind.JsonNode.class), eq(LinkedHashMap.class)))
                .thenReturn(converted);
        when(callRecordingService.issueExternalTicket(any(), any())).thenReturn(
                CallRecordingVO.PlaybackTicket.builder().token("a".repeat(64)).expiresAt(123L).build());
        jakarta.servlet.http.HttpServletRequest request = org.mockito.Mockito.mock(jakarta.servlet.http.HttpServletRequest.class);
        when(request.getHeader(any())).thenReturn("test-agent");

        var response = controller.voiceList(null, null, null, null, 1, 50, request);
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> rows = (List<Map<String, Object>>) response.getData().get("list");

        assertEquals(1, rows.size());
        assertEquals("a".repeat(64), rows.get(0).get("recordingToken"));
        assertFalse(rows.get(0).containsKey("ossFileName"));
        assertFalse(rows.get(0).containsKey("recordUrl"));
        verify(callRecordingService).issueExternalTicket(any(), eq("test-agent"));
    }

    private BizYunkeUserMap ownMap() {
        BizYunkeUserMap own = new BizYunkeUserMap();
        own.setUserId(9L);
        own.setYunkeWechatId("wx-own");
        return own;
    }

    private SysUser systemUser(Long id) {
        SysUser user = new SysUser();
        user.setId(id);
        user.setTenantId(1L);
        user.setUsername("tenant-user");
        user.setNickname("本租户员工");
        user.setPhone("13800000000");
        return user;
    }
}
