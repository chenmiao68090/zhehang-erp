package com.zhehang.erp.modules.im.service;

import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.im.domain.ImEntities;
import com.zhehang.erp.modules.im.domain.ImModels;
import com.zhehang.erp.modules.im.mapper.ImConversationMapper;
import com.zhehang.erp.modules.im.mapper.ImMemberMapper;
import com.zhehang.erp.modules.im.mapper.ImQueryMapper;
import com.zhehang.erp.security.domain.LoginUser;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ImAccessServiceTest {
    @Mock private ImConversationMapper conversationMapper;
    @Mock private ImMemberMapper memberMapper;
    @Mock private ImQueryMapper queryMapper;
    private ImAccessService service;

    @BeforeEach
    void setUp() {
        service = new ImAccessService(conversationMapper, memberMapper, queryMapper);
        LoginUser user = new LoginUser();
        user.setUserId(100L);
        user.setTenantId(9L);
        user.setUsername("tester");
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(user, null, List.of()));
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void rejectsConversationWhenCurrentUserIsNotAnActiveMember() {
        when(memberMapper.selectOne(any())).thenReturn(null);
        assertThatThrownBy(() -> service.requireMember(88L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("无权访问");
    }

    @Test
    void returnsMemberOnlyForAuthenticatedParticipant() {
        ImEntities.Member member = new ImEntities.Member();
        member.setConversationId(88L);
        member.setUserId(100L);
        member.setStatus("active");
        when(memberMapper.selectOne(any())).thenReturn(member);
        assertThat(service.requireMember(88L)).isSameAs(member);
        assertThat(service.currentTenantId()).isEqualTo(9L);
    }

    @Test
    void rejectsDisabledOrCrossCompanyRecipients() {
        ImModels.Contact onlyOne = new ImModels.Contact();
        onlyOne.setUserId(101L);
        when(queryMapper.contactsByIds(any())).thenReturn(List.of(onlyOne));
        assertThatThrownBy(() -> service.requireActiveUsers(List.of(101L, 102L)))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("已停用");
    }
}
