package com.zhehang.erp.modules.company.provider;

import com.zhehang.erp.modules.company.service.CompanyInfoService;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class EmptyCompanyDataProviderTest {

    private final EmptyCompanyDataProvider provider = new EmptyCompanyDataProvider();

    @Test
    void defaultProviderNeverReturnsSampleCompanyOrContactData() {
        assertThat(provider.suggest("杭州", 8)).isEmpty();
        assertThat(provider.detail("任意企业名称")).isNull();
        assertThat(provider.all()).isEmpty();
    }

    @Test
    void companyServiceKeepsListAndStatisticsHonestWhenProviderIsUnavailable() {
        CompanyInfoService service = new CompanyInfoService(provider);

        assertThat(service.page(null, null, null, 1, 10))
                .containsEntry("total", 0);
        assertThat(service.stats())
                .containsEntry("total", 0)
                .containsEntry("risky", 0L)
                .containsEntry("newCompany", 0L)
                .containsEntry("contactRich", 0L);
    }
}
