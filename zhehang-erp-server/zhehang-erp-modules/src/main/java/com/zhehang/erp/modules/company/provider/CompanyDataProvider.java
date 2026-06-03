package com.zhehang.erp.modules.company.provider;

import com.zhehang.erp.modules.company.domain.CompanyInfo;

import java.util.List;

/**
 * 工商数据源抽象。
 *
 * <p>默认实现是 {@link MockCompanyDataProvider}（内置示例库，免密钥、可演示）。
 * 接入真实数据时，只需新增实现类（如 TianyanchaCompanyDataProvider / QccCompanyDataProvider），
 * 通过配置项 {@code company.data.provider} 切换，前端与上层 Service 无需改动。</p>
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
