package com.zhehang.erp.modules.dashboard.service;

import com.baomidou.mybatisplus.core.MybatisConfiguration;
import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.dashboard.domain.entity.DashboardMemo;
import com.zhehang.erp.modules.dashboard.mapper.DashboardMemoMapper;
import com.zhehang.erp.modules.dashboard.service.impl.DashboardMemoServiceImpl;
import com.zhehang.erp.modules.system.service.GovernedFieldValueValidator;
import org.apache.ibatis.builder.MapperBuilderAssistant;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardMemoGovernedCategoryTest {

    @Mock
    private DashboardMemoMapper mapper;

    @Mock
    private GovernedFieldValueValidator validator;

    private DashboardMemoServiceImpl service;

    @BeforeEach
    void setUp() {
        TableInfoHelper.initTableInfo(
                new MapperBuilderAssistant(new MybatisConfiguration(), ""), DashboardMemo.class);
        service = new DashboardMemoServiceImpl(validator);
        ReflectionTestUtils.setField(service, "baseMapper", mapper);
    }

    @Test
    void addCannotBypassCategoryValidatorThroughDirectServiceCall() {
        DashboardMemo memo = new DashboardMemo();
        memo.setContent("跟进重点客户");
        memo.setCategory("任意分类");
        when(validator.validateNewValue(
                GovernedFieldValueValidator.MEMO_CATEGORY,
                "备忘分类", "任意分类", false))
                .thenThrow(new BusinessException(400, "备忘分类包含未启用或不存在的值：任意分类"));

        assertThatThrownBy(() -> service.add(memo))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("任意分类");
        verify(mapper, never()).insert(any(DashboardMemo.class));
    }

    @Test
    void updateLoadsOnlyCurrentUsersOldValueAndPreservesUnchangedHistory() {
        DashboardMemo existing = new DashboardMemo();
        existing.setId(31L);
        existing.setUserId(9L);
        existing.setCategory("旧分类");
        when(mapper.selectOne(any(Wrapper.class))).thenReturn(existing);
        when(validator.validateChangedValue(
                GovernedFieldValueValidator.MEMO_CATEGORY,
                "备忘分类", "旧分类", "旧分类", false)).thenReturn("旧分类");
        when(mapper.update(any(DashboardMemo.class), any(Wrapper.class))).thenReturn(1);

        DashboardMemo patch = new DashboardMemo();
        patch.setId(31L);
        patch.setContent("修改备忘内容");
        patch.setCategory("旧分类");

        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(SecurityUtils::getCurrentUserId).thenReturn(9L);
            assertThat(service.updateMine(patch)).isTrue();
        }

        @SuppressWarnings("unchecked")
        ArgumentCaptor<Wrapper<DashboardMemo>> query = ArgumentCaptor.forClass(Wrapper.class);
        verify(mapper).selectOne(query.capture());
        assertThat(query.getValue().getSqlSegment()).contains("id", "user_id");
        verify(validator).validateChangedValue(
                GovernedFieldValueValidator.MEMO_CATEGORY,
                "备忘分类", "旧分类", "旧分类", false);
    }

    @Test
    void updateOfAnotherUsersMemoFailsBeforeCategoryValidation() {
        when(mapper.selectOne(any(Wrapper.class))).thenReturn(null);
        DashboardMemo patch = new DashboardMemo();
        patch.setId(32L);
        patch.setContent("越权修改");
        patch.setCategory("客户跟进");

        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(SecurityUtils::getCurrentUserId).thenReturn(9L);
            assertThatThrownBy(() -> service.updateMine(patch))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("不存在或无权");
        }

        verify(validator, never()).validateChangedValue(any(), any(), any(), any(), eq(false));
        verify(mapper, never()).update(any(DashboardMemo.class), any(Wrapper.class));
    }
}
