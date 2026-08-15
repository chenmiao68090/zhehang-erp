package com.zhehang.erp.common.config;

import com.baomidou.mybatisplus.extension.plugins.inner.OptimisticLockerInnerInterceptor;
import com.baomidou.mybatisplus.extension.plugins.inner.PaginationInnerInterceptor;
import com.baomidou.mybatisplus.extension.plugins.inner.TenantLineInnerInterceptor;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class MybatisPlusConfigTest {

    @Test
    void registersTenantOptimisticLockAndPaginationInSafeOrder() {
        var interceptors = new MybatisPlusConfig().mybatisPlusInterceptor().getInterceptors();

        assertThat(interceptors)
                .hasSize(3)
                .element(0).isInstanceOf(TenantLineInnerInterceptor.class);
        assertThat(interceptors)
                .element(1).isInstanceOf(OptimisticLockerInnerInterceptor.class);
        assertThat(interceptors)
                .element(2).isInstanceOf(PaginationInnerInterceptor.class);
    }
}
