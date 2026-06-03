package com.zhehang.erp.modules.company.service;

import com.zhehang.erp.modules.company.domain.CompanyInfo;
import com.zhehang.erp.modules.company.provider.CompanyDataProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 工商企业信息查询服务。具体数据来源由注入的 {@link CompanyDataProvider} 决定。
 */
@Service
@RequiredArgsConstructor
public class CompanyInfoService {

    private final CompanyDataProvider provider;

    /** 输入联想 */
    public List<CompanyInfo> suggest(String keyword, int limit) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return Collections.emptyList();
        }
        return provider.suggest(keyword.trim(), limit <= 0 ? 8 : limit);
    }

    /** 自动带出（精确/模糊匹配单个企业） */
    public CompanyInfo detail(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return null;
        }
        return provider.detail(keyword.trim());
    }

    /** 企业主体库分页（支持关键字 / 区域 / 风险标签过滤） */
    public Map<String, Object> page(String keyword, String region, String risk, int pageNum, int pageSize) {
        String kw = keyword == null ? "" : keyword.trim();
        String rg = region == null ? "" : region.trim();
        String rk = risk == null ? "" : risk.trim();

        List<CompanyInfo> filtered = provider.all().stream()
                .filter(e -> kw.isEmpty()
                        || str(e.getName()).contains(kw)
                        || str(e.getShortName()).contains(kw)
                        || str(e.getCreditCode()).contains(kw)
                        || str(e.getLegalPerson()).contains(kw))
                .filter(e -> rg.isEmpty()
                        || (str(e.getProvince()) + str(e.getCity()) + str(e.getDistrict())).contains(rg))
                .filter(e -> rk.isEmpty()
                        || (e.getRiskTags() != null && e.getRiskTags().stream().anyMatch(t -> t.contains(rk))))
                .collect(Collectors.toList());

        int pn = pageNum <= 0 ? 1 : pageNum;
        int ps = pageSize <= 0 ? 10 : pageSize;
        int from = Math.min((pn - 1) * ps, filtered.size());
        int to = Math.min(from + ps, filtered.size());

        Map<String, Object> res = new HashMap<>();
        res.put("list", filtered.subList(from, to));
        res.put("total", filtered.size());
        return res;
    }

    /** 企业主体库概览统计 */
    public Map<String, Object> stats() {
        List<CompanyInfo> all = provider.all();
        Map<String, Object> m = new HashMap<>();
        m.put("total", all.size());
        m.put("risky", all.stream()
                .filter(e -> e.getRiskTags() != null && !e.getRiskTags().isEmpty()).count());
        m.put("newCompany", all.stream()
                .filter(e -> e.getRiskTags() != null && e.getRiskTags().stream().anyMatch(t -> t.contains("新企"))).count());
        m.put("contactRich", all.stream()
                .filter(e -> e.getContactCount() != null && e.getContactCount() >= 8).count());
        return m;
    }

    private static String str(String s) {
        return s == null ? "" : s;
    }
}
