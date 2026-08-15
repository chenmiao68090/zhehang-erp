package com.zhehang.erp.modules.crm.service.impl;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.crm.domain.entity.CrmCollisionLog;
import com.zhehang.erp.modules.crm.mapper.CrmCollisionLogMapper;
import com.zhehang.erp.modules.crm.mapper.CrmLeadMapper;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class CrmCollisionServiceImplTest {

    private CrmCollisionLogMapper collisionLogMapper;
    private DataScopeHelper dataScopeHelper;
    private CrmCollisionServiceImpl service;

    @BeforeEach
    void setUp() {
        collisionLogMapper = mock(CrmCollisionLogMapper.class);
        dataScopeHelper = mock(DataScopeHelper.class);
        when(dataScopeHelper.isManagerOrAdmin()).thenReturn(true);
        when(dataScopeHelper.getVisibleUserIds()).thenReturn(null);
        service = new CrmCollisionServiceImpl(collisionLogMapper, mock(CrmLeadMapper.class), dataScopeHelper);
    }

    @Test
    void rejectsUnimplementedResolutionAndBlankDetailBeforeWriting() {
        assertThatThrownBy(() -> service.resolveCollision(1L, "auto_transfer", "说明"))
                .isInstanceOf(BusinessException.class)
                .hasMessage("仲裁结论不正确");
        assertThatThrownBy(() -> service.resolveCollision(1L, "keep_a", "  "))
                .isInstanceOf(BusinessException.class)
                .hasMessage("请填写处理说明");

        verify(collisionLogMapper, never()).selectById(any());
        verify(collisionLogMapper, never()).update(isNull(), any(Wrapper.class));
    }

    @Test
    void recordsDecisionWithStatusGuardInsteadOfClaimingOwnershipWasChanged() {
        CrmCollisionLog log = new CrmCollisionLog();
        log.setId(8L);
        log.setStatus(0);
        when(collisionLogMapper.selectById(8L)).thenReturn(log);
        when(collisionLogMapper.update(isNull(), any(Wrapper.class))).thenReturn(1);

        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(SecurityUtils::getCurrentUserId).thenReturn(99L);
            service.resolveCollision(8L, "keep_b", "  主管已线下核实  ");
        }

        verify(collisionLogMapper).update(isNull(), any(Wrapper.class));
    }

    @Test
    void rejectsAlreadyResolvedRecord() {
        CrmCollisionLog log = new CrmCollisionLog();
        log.setId(9L);
        log.setStatus(1);
        when(collisionLogMapper.selectById(9L)).thenReturn(log);

        assertThatThrownBy(() -> service.resolveCollision(9L, "keep_a", "已经处理"))
                .isInstanceOf(BusinessException.class)
                .extracting("code").isEqualTo(409);

        verify(collisionLogMapper, never()).update(isNull(), any(Wrapper.class));
    }
}
