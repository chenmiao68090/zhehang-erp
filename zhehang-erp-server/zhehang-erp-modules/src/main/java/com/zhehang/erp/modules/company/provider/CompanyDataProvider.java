package com.zhehang.erp.modules.company.provider;

import com.zhehang.erp.modules.company.domain.CompanyInfo;

import java.util.List;

/**
 * 工商数据源抽象。
 *
 * <p>未配置经授权的真实数据源时，默认使用 {@link EmptyCompanyDataProvider} 并返回空结果。
 * 接入真实数据时，应新增对应实现并通过 {@code company.data.provider} 显式切换；
 * 禁止以示例、随机或推测数据替代真实工商信息。</p>
 */
public interface CompanyDataProvider {

    /**
     * 按关键字（企业名 / 简称 / 信用代码 / 法人）联想，返回候选列表。
     *
     * @param keyword 关键字
     * @param limit   最多返回条数
     */
    List<CompanyInfo> suggest(String keyword, int limit);

    /**
     * 按关键字精确 / 模糊匹配单个企业（用于「自动带出」）。
     *
     * @param keyword 企业全称或统一社会信用代码
     * @return 命中的企业；无命中返回 {@code null}
     */
    CompanyInfo detail(String keyword);

    /** 全量企业（用于列表分页与统计）。 */
    List<CompanyInfo> all();
}
