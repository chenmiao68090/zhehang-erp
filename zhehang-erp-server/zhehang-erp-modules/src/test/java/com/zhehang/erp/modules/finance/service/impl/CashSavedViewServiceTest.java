package com.zhehang.erp.modules.finance.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.finance.domain.dto.CashSavedViewRequest;
import com.zhehang.erp.modules.finance.domain.entity.FinCashSavedView;
import com.zhehang.erp.modules.finance.mapper.FinCashSavedViewMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;

import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.when;

class CashSavedViewServiceTest {

    private FinCashSavedViewMapper viewMapper;
    private CashSavedViewService service;

    @BeforeEach
    void setUp() {
        viewMapper = mock(FinCashSavedViewMapper.class);
        service = new CashSavedViewService(viewMapper, new ObjectMapper());
    }

    @Test
    void rejectsArrayOrBrokenJsonConfiguration() {
        CashSavedViewRequest request = request("[]", "personal");
        assertThatThrownBy(() -> service.save(null, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("JSON 对象");

        request.setConfigJson("{broken");
        assertThatThrownBy(() -> service.save(null, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("格式不正确");

        request.setConfigJson("{\"filters\":{\"__proto__\":{\"polluted\":true}}}");
        assertThatThrownBy(() -> service.save(null, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("不支持的字段");
    }

    @Test
    void savesPersonalViewForCurrentUser() {
        AtomicReference<FinCashSavedView> inserted = new AtomicReference<>();
        when(viewMapper.insert(any())).thenAnswer(invocation -> {
            FinCashSavedView entity = invocation.getArgument(0);
            entity.setId(10L);
            inserted.set(entity);
            return 1;
        });
        when(viewMapper.selectById(10L)).thenAnswer(invocation -> inserted.get());

        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(SecurityUtils::getCurrentUserId).thenReturn(7L);
            FinCashSavedView result = service.save(null, request("{\"filters\":{\"matchStatus\":\"waiting\"}}", "personal"));

            assertThat(result.getId()).isEqualTo(10L);
            assertThat(result.getOwnerId()).isEqualTo(7L);
            assertThat(result.getVisibility()).isEqualTo("personal");
            assertThat(result.getVersion()).isZero();
        }
    }

    @Test
    void regularFinanceUserCannotCreatePublicView() {
        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(SecurityUtils::getCurrentUserId).thenReturn(7L);
            security.when(SecurityUtils::isCurrentAdmin).thenReturn(false);
            security.when(() -> SecurityUtils.hasAnyRole("finance_hq", "boss")).thenReturn(false);

            assertThatThrownBy(() -> service.save(null, request("{}", "public")))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("公共视图");
        }
    }

    private CashSavedViewRequest request(String config, String visibility) {
        CashSavedViewRequest request = new CashSavedViewRequest();
        request.setViewName("待核销大额收款");
        request.setVisibility(visibility);
        request.setConfigJson(config);
        request.setDefaultView(false);
        request.setSortOrder(100);
        return request;
    }
}
