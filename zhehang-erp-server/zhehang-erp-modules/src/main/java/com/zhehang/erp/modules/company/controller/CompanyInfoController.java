package com.zhehang.erp.modules.company.controller;

import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.company.domain.CompanyInfo;
import com.zhehang.erp.modules.company.service.CompanyInfoService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 工商企业信息查询（「填公司名自动带出工商信息」）。
 *
 * <p>仅返回经授权数据源提供的真实结果；未配置数据源时返回空结果，详见
 * {@link com.zhehang.erp.modules.company.provider.CompanyDataProvider}。</p>
 */
@RestController
@RequestMapping("/company")
@RequiredArgsConstructor
public class CompanyInfoController {

    private final CompanyInfoService companyInfoService;

    /** 输入联想：返回候选企业 */
    @GetMapping("/suggest")
    public R<List<CompanyInfo>> suggest(@RequestParam String keyword,
                                        @RequestParam(defaultValue = "8") Integer limit) {
        return R.ok(companyInfoService.suggest(keyword, limit));
    }

    /** 自动带出：按公司名/信用代码返回单个企业完整工商信息 */
    @GetMapping("/detail")
    public R<CompanyInfo> detail(@RequestParam String keyword) {
        return R.ok(companyInfoService.detail(keyword));
    }

    /** 企业主体库分页 */
    @GetMapping("/list")
    public R<Map<String, Object>> list(@RequestParam(required = false) String keyword,
                                       @RequestParam(required = false) String region,
                                       @RequestParam(required = false) String risk,
                                       @RequestParam(defaultValue = "1") Integer pageNum,
                                       @RequestParam(defaultValue = "10") Integer pageSize) {
        return R.ok(companyInfoService.page(keyword, region, risk, pageNum, pageSize));
    }

    /** 企业主体库概览统计 */
    @GetMapping("/stats")
    public R<Map<String, Object>> stats() {
        return R.ok(companyInfoService.stats());
    }
}
