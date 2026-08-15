package com.zhehang.erp.modules.feigetask;

import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.feigetask.domain.dto.FeigeTaskRequests;
import com.zhehang.erp.modules.feigetask.domain.entity.FeigeGoal;
import com.zhehang.erp.modules.feigetask.mapper.FeigeGoalMapper;
import com.zhehang.erp.modules.feigetask.mapper.FeigeGoalPlanMapper;
import com.zhehang.erp.modules.feigetask.mapper.FeigeGoalPlanUserMapper;
import com.zhehang.erp.modules.feigetask.service.FeigeGoalService;
import com.zhehang.erp.modules.feigetask.service.FeigeTaskAccessService;
import com.zhehang.erp.modules.system.domain.entity.SysRole;
import com.zhehang.erp.modules.system.domain.entity.SysUser;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FeigeGoalUpdateTest {

    @Mock private FeigeGoalMapper goalMapper;
    @Mock private FeigeGoalPlanMapper planMapper;
    @Mock private FeigeGoalPlanUserMapper planUserMapper;
    @Mock private DataScopeHelper dataScopeHelper;
    @Mock private FeigeTaskAccessService access;

    private FeigeGoalService service;

    @BeforeEach
    void setUp() {
        service = new FeigeGoalService(goalMapper, planMapper, planUserMapper,
                dataScopeHelper, access);
    }

    @Test
    void baseGoalEditDoesNotDeletePlansWhenPlansAreOmitted() {
        FeigeGoal row = new FeigeGoal();
        row.setId(1L);
        row.setStatus("draft");
        row.setOwnerId(7L);
        row.setDeptId(2L);
        SysRole role = new SysRole();
        role.setId(3L);
        role.setRoleName("销售");
        SysUser current = new SysUser();
        current.setId(7L);
        current.setDeptId(2L);
        when(goalMapper.selectById(1L)).thenReturn(row);
        when(goalMapper.updateById(any())).thenReturn(1);
        when(access.canAccess(7L, 2L)).thenReturn(true);
        when(access.requireActiveRole(3L)).thenReturn(role);
        when(access.currentUserId()).thenReturn(7L);
        when(access.currentUser()).thenReturn(current);

        FeigeTaskRequests.GoalUpsert request = new FeigeTaskRequests.GoalUpsert();
        request.setTitle("年度新增目标");
        request.setCycleType("month");
        request.setYear(2026);
        request.setPeriodKey("2026-08");
        request.setRoleId(3L);
        request.setTargetValue(new BigDecimal("100"));
        request.setPlans(null);

        service.update(1L, request);

        verify(planMapper, never()).delete(any());
        verify(planUserMapper, never()).delete(any());
    }
}
