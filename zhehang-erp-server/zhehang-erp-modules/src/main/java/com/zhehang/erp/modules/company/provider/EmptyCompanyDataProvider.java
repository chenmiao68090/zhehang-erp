package com.zhehang.erp.modules.company.provider;

import com.zhehang.erp.modules.company.domain.CompanyInfo;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

/**
 * 未配置经授权的工商数据源时使用的默认实现。
 *
 * <p>该实现按“无数据”收口，不生成、猜测或返回任何企业及联系人信息，
 * 避免示例数据进入线索、订单等真实业务流程。</p>
 */
@Component
@ConditionalOnProperty(name = "company.data.provider", havingValue = "empty", matchIfMissing = true)
public class EmptyCompanyDataProvider implements CompanyDataProvider {

    @Override
    public List<CompanyInfo> suggest(String keyword, int limit) {
        return Collections.emptyList();
    }

    @Override
    public CompanyInfo detail(String keyword) {
        return null;
    }

    @Override
    public List<CompanyInfo> all() {
        return Collections.emptyList();
    }
}
