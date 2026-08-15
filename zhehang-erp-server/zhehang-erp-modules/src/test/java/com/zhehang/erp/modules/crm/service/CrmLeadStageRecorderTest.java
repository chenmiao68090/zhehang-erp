package com.zhehang.erp.modules.crm.service;

import com.zhehang.erp.modules.crm.domain.entity.CrmLead;
import com.zhehang.erp.modules.crm.domain.entity.CrmLeadStageEvent;
import com.zhehang.erp.modules.crm.mapper.CrmLeadStageEventMapper;
import com.zhehang.erp.security.domain.LoginUser;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class CrmLeadStageRecorderTest {

    @Mock private CrmLeadStageEventMapper mapper;
    private CrmLeadStageRecorder recorder;

    @BeforeEach
    void setUp() {
        LoginUser user = new LoginUser();
        user.setUserId(18L);
        user.setTenantId(9L);
        user.setUsername("sales-user");
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(user, null, List.of()));
        recorder = new CrmLeadStageRecorder(mapper);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void writesCreationEventWithCurrentTenantAndOperator() {
        CrmLead lead = new CrmLead();
        lead.setId(101L);
        lead.setStatus(1);
        lead.setOwnerId(18L);
        lead.setDeptId(3L);

        recorder.recordCreation(lead, "IMPORT", 101L);

        ArgumentCaptor<CrmLeadStageEvent> captor = ArgumentCaptor.forClass(CrmLeadStageEvent.class);
        verify(mapper).insertIgnore(captor.capture());
        assertThat(captor.getValue().getTenantId()).isEqualTo(9L);
        assertThat(captor.getValue().getOperatorId()).isEqualTo(18L);
        assertThat(captor.getValue().getToStageCode()).isEqualTo("LEAD_RECEIVED");
        assertThat(captor.getValue().getEventKey()).isEqualTo("create:101");
    }

    @Test
    void doesNotWriteWhenStageDidNotChange() {
        CrmLead lead = new CrmLead();
        lead.setId(101L);
        lead.setStatus(2);
        lead.setFollowStatus("需求沟通");

        recorder.recordTransition(lead, "需求沟通", 2, 18L, 3L,
                "FOLLOW", "FOLLOW", 99L, "follow:99");

        verify(mapper, never()).insertIgnore(org.mockito.ArgumentMatchers.any());
    }
}
