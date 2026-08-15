package com.zhehang.erp.modules.crm.controller;

import com.baomidou.mybatisplus.core.MybatisConfiguration;
import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.zhehang.erp.common.core.domain.AuthUser;
import com.zhehang.erp.modules.crm.domain.BizWechatFriendInfo;
import com.zhehang.erp.modules.crm.domain.vo.WechatFriendVO;
import com.zhehang.erp.modules.crm.mapper.BizWechatFriendInfoMapper;
import org.apache.ibatis.builder.MapperBuilderAssistant;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class WechatFriendControllerTest {

    private BizWechatFriendInfoMapper mapper;
    private WechatFriendController controller;

    @BeforeEach
    void setUp() {
        MybatisConfiguration configuration = new MybatisConfiguration();
        MapperBuilderAssistant assistant = new MapperBuilderAssistant(configuration, "wechat-friend-test");
        TableInfoHelper.initTableInfo(assistant, BizWechatFriendInfo.class);
        mapper = mock(BizWechatFriendInfoMapper.class);
        controller = new WechatFriendController(mapper);

        AuthUser authUser = mock(AuthUser.class);
        when(authUser.getUserId()).thenReturn(20L);
        when(authUser.getTenantId()).thenReturn(1L);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(authUser, null));
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @SuppressWarnings("unchecked")
    void listReadsActivePullTableAndKeepsExistingFrontendFieldNames() {
        BizWechatFriendInfo source = friend(7L, "staff-wx-1", "friend-wx-1", "客户甲");
        source.setAlias("customer-a");
        source.setRemark("重点客户");
        source.setPhone("13800000000");
        source.setRegion("杭州");
        source.setGender(1);
        source.setHeadUrl("https://example.invalid/avatar");
        source.setUpdateTime(LocalDateTime.of(2026, 7, 14, 4, 0));
        Page<BizWechatFriendInfo> sourcePage = new Page<>(1, 20, 1);
        sourcePage.setRecords(List.of(source));
        when(mapper.selectPage(any(Page.class), any(Wrapper.class))).thenReturn(sourcePage);

        IPage<WechatFriendVO> page = controller.list(1, 20, "客户", "staff-wx-1").getData();

        assertThat(page.getTotal()).isEqualTo(1);
        assertThat(page.getRecords()).singleElement().satisfies(row -> {
            assertThat(row.getId()).isEqualTo(7L);
            assertThat(row.getWxId()).isEqualTo("staff-wx-1");
            assertThat(row.getFriendWxId()).isEqualTo("friend-wx-1");
            assertThat(row.getFriendNickname()).isEqualTo("客户甲");
            assertThat(row.getFriendRemark()).isEqualTo("重点客户");
            assertThat(row.getFriendAlias()).isEqualTo("customer-a");
            assertThat(row.getFriendWxPhone()).isEqualTo("13800000000");
            assertThat(row.getFromType()).isEqualTo("云客主动同步");
        });
        verify(mapper).selectPage(any(Page.class), any(Wrapper.class));
    }

    @Test
    @SuppressWarnings("unchecked")
    void statsCountsPulledFriendsAndDistinctEmployeeWechatIds() {
        when(mapper.selectList(any(Wrapper.class))).thenReturn(List.of(
                friend(1L, "staff-wx-1", "friend-1", "客户甲"),
                friend(2L, "staff-wx-1", "friend-2", "客户乙"),
                friend(3L, "staff-wx-2", "friend-3", "客户丙")));

        assertThat(controller.stats().getData())
                .containsEntry("total", 3)
                .containsEntry("staffCount", 2)
                .containsEntry("staffWxIds", List.of("staff-wx-1", "staff-wx-2"));
        verify(mapper).selectList(any(Wrapper.class));
    }

    private BizWechatFriendInfo friend(Long id, String staffWechatId, String friendWechatId,
                                        String nickname) {
        BizWechatFriendInfo friend = new BizWechatFriendInfo();
        friend.setId(id);
        friend.setSalesWechatId(staffWechatId);
        friend.setFriendWxId(friendWechatId);
        friend.setNickname(nickname);
        friend.setFriendType(1);
        return friend;
    }
}
