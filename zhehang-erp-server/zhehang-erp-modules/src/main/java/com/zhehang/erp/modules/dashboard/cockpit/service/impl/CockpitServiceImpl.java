package com.zhehang.erp.modules.dashboard.cockpit.service.impl;

import com.zhehang.erp.modules.ai.service.AiService;
import com.zhehang.erp.modules.dashboard.cockpit.domain.vo.*;
import com.zhehang.erp.modules.dashboard.cockpit.service.CockpitService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class CockpitServiceImpl implements CockpitService {

    private final AiService aiService;

    @Override
    @Cacheable(value = "cockpit:kpi", unless = "#result == null")
    public CockpitKpiVO getKpi() {
        CockpitKpiVO vo = new CockpitKpiVO();
        vo.setTotalCustomers(1286);
        vo.setCustomerGrowthRate(12.5);
        vo.setNewCustomersMonth(68);
        vo.setNewCustomerGrowthRate(8.3);
        vo.setTotalRevenue(new BigDecimal("18560000"));
        vo.setRevenueGrowthRate(15.2);
        vo.setMonthReceipt(new BigDecimal("2680000"));
        vo.setReceiptGrowthRate(-3.1);
        vo.setPendingContracts(23);
        vo.setPendingContractsRate(5.0);
        vo.setTotalEmployees(186);
        vo.setEmployeeGrowthRate(2.8);
        return vo;
    }

    @Override
    @Cacheable(value = "cockpit:revenue-trend", unless = "#result == null")
    public List<RevenueTrendVO> getRevenueTrend() {
        List<RevenueTrendVO> list = new ArrayList<>();
        LocalDate now = LocalDate.now();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM");
        Random rand = new Random(42);
        for (int i = 11; i >= 0; i--) {
            LocalDate d = now.minusMonths(i);
            BigDecimal revenue = BigDecimal.valueOf(120 + rand.nextInt(80)).multiply(BigDecimal.valueOf(10000));
            BigDecimal receipt = BigDecimal.valueOf(80 + rand.nextInt(60)).multiply(BigDecimal.valueOf(10000));
            list.add(new RevenueTrendVO(d.format(fmt), revenue, receipt));
        }
        return list;
    }

    @Override
    @Cacheable(value = "cockpit:customer-source", unless = "#result == null")
    public List<CustomerSourceVO> getCustomerSource() {
        return Arrays.asList(
            new CustomerSourceVO("\u7f51\u7edc\u63a8\u5e7f", 320),
            new CustomerSourceVO("\u8001\u5ba2\u6237\u8f6c\u4ecb\u7ecd", 256),
            new CustomerSourceVO("\u7535\u8bdd\u8425\u9500", 198),
            new CustomerSourceVO("\u5c55\u4f1a\u6d3b\u52a8", 145),
            new CustomerSourceVO("\u5408\u4f5c\u4f19\u4f34", 112),
            new CustomerSourceVO("\u81ea\u4e3b\u62dc\u8bbf", 89),
            new CustomerSourceVO("\u5176\u4ed6", 166)
        );
    }

    @Override
    @Cacheable(value = "cockpit:sales-rank", unless = "#result == null")
    public List<SalesRankVO> getSalesRank() {
        return Arrays.asList(
            new SalesRankVO(1, "\u5f20\u4f1f", "\u9500\u552e\u4e00\u90e8", new BigDecimal("2860000"), 18.5),
            new SalesRankVO(2, "\u674e\u5a1c", "\u9500\u552e\u4e00\u90e8", new BigDecimal("2450000"), 12.3),
            new SalesRankVO(3, "\u738b\u660e", "\u9500\u552e\u4e8c\u90e8", new BigDecimal("2180000"), 22.1),
            new SalesRankVO(4, "\u8d75\u9759", "\u9500\u552e\u4e00\u90e8", new BigDecimal("1960000"), -5.2),
            new SalesRankVO(5, "\u5218\u5f3a", "\u9500\u552e\u4e09\u90e8", new BigDecimal("1850000"), 8.7),
            new SalesRankVO(6, "\u9648\u82b3", "\u9500\u552e\u4e8c\u90e8", new BigDecimal("1720000"), 15.4),
            new SalesRankVO(7, "\u5468\u6d77", "\u9500\u552e\u4e09\u90e8", new BigDecimal("1580000"), 3.2),
            new SalesRankVO(8, "\u6768\u96ea", "\u9500\u552e\u4e00\u90e8", new BigDecimal("1460000"), -2.1),
            new SalesRankVO(9, "\u5434\u78ca", "\u9500\u552e\u4e8c\u90e8", new BigDecimal("1320000"), 9.8),
            new SalesRankVO(10, "\u5b59\u4eae", "\u9500\u552e\u4e09\u90e8", new BigDecimal("1180000"), 6.5)
        );
    }

    @Override
    @Cacheable(value = "cockpit:recent-events", unless = "#result == null")
    public List<RecentEventVO> getRecentEvents() {
        return Arrays.asList(
            new RecentEventVO("sign", "\u4e0e\u676d\u5dde\u667a\u8054\u79d1\u6280\u7b7e\u7ea6\u5e74\u5ea6\u670d\u52a1\u5408\u540c\uff0c\u91d1\u989d\uffe5128\u4e07", "2\u5206\u949f\u524d", "\u5f20\u4f1f"),
            new RecentEventVO("receipt", "\u6536\u5230\u5b81\u6ce2\u6d77\u7eb3\u8d38\u6613\u56de\u6b3e\uffe545.6\u4e07", "15\u5206\u949f\u524d", "\u674e\u5a1c"),
            new RecentEventVO("follow", "\u8ddf\u8fdb\u6e29\u5dde\u6c38\u5609\u673a\u68b0\u5546\u673a\uff0c\u5ba2\u6237\u610f\u5411\u79ef\u6781", "30\u5206\u949f\u524d", "\u738b\u660e"),
            new RecentEventVO("lead", "\u65b0\u7ebf\u7d22\uff1a\u53f0\u5dde\u5929\u8fbe\u7535\u5b50\u6709\u91c7\u8d2d\u610f\u5411", "1\u5c0f\u65f6\u524d", "\u7cfb\u7edf"),
            new RecentEventVO("sign", "\u4e0e\u7ecd\u5174\u534e\u7f8e\u7eba\u7ec7\u7b7e\u8ba2\u8bbe\u5907\u91c7\u8d2d\u5408\u540c\uffe586\u4e07", "1.5\u5c0f\u65f6\u524d", "\u8d75\u9759"),
            new RecentEventVO("receipt", "\u6536\u5230\u91d1\u534e\u7f8e\u8fbe\u5de5\u5177\u56de\u6b3e\uffe532.8\u4e07", "2\u5c0f\u65f6\u524d", "\u5218\u5f3a"),
            new RecentEventVO("alert", "\u5ba2\u6237\u300c\u5609\u5174\u5b9d\u5229\u300d\u5df2\u8d85\u8fc730\u5929\u672a\u8ddf\u8fdb\uff0c\u5b58\u5728\u6d41\u5931\u98ce\u9669", "3\u5c0f\u65f6\u524d", "\u7cfb\u7edf"),
            new RecentEventVO("follow", "\u5b8c\u6210\u6e56\u5dde\u5357\u6d54\u96c6\u56e2\u9700\u6c42\u8c03\u7814", "4\u5c0f\u65f6\u524d", "\u9648\u82b3")
        );
    }

    @Override
    @Cacheable(value = "cockpit:region", unless = "#result == null")
    public List<RegionDistributionVO> getRegionDistribution() {
        return Arrays.asList(
            new RegionDistributionVO("\u6d59\u6c5f", 386),
            new RegionDistributionVO("\u6c5f\u82cf", 215),
            new RegionDistributionVO("\u5e7f\u4e1c", 178),
            new RegionDistributionVO("\u4e0a\u6d77", 156),
            new RegionDistributionVO("\u5c71\u4e1c", 98),
            new RegionDistributionVO("\u5317\u4eac", 87),
            new RegionDistributionVO("\u798f\u5efa", 76),
            new RegionDistributionVO("\u56db\u5ddd", 52),
            new RegionDistributionVO("\u6e56\u5317", 45),
            new RegionDistributionVO("\u6cb3\u5357", 42),
            new RegionDistributionVO("\u5b89\u5fbd", 38),
            new RegionDistributionVO("\u6e56\u5357", 35),
            new RegionDistributionVO("\u8fbd\u5b81", 28),
            new RegionDistributionVO("\u91cd\u5e86", 22),
            new RegionDistributionVO("\u5929\u6d25", 18)
        );
    }

    @Override
    @Cacheable(value = "cockpit:alerts", unless = "#result == null")
    public AlertVO getAlerts() {
        AlertVO vo = new AlertVO();
        vo.setOverdueReceiptCount(7);
        vo.setOverdueReceiptAmount(new BigDecimal("456000"));
        vo.setRiskCustomerCount(12);
        vo.setExpiringContractCount(5);
        vo.setStockWarningCount(3);
        vo.setAbnormalApprovalCount(2);
        return vo;
    }

    @Override
    public AiSummaryVO getAiSummary() {
        String prompt = "\u8bf7\u6839\u636e\u4ee5\u4e0b\u7ecf\u8425\u6570\u636e\u751f\u6210\u4e00\u4efd\u7b80\u6d01\u7684CEO\u7ecf\u8425\u5206\u6790\u6458\u8981\uff08Markdown\u683c\u5f0f\uff09\uff1a\n"
            + "\u5ba2\u6237\u603b\u65701286\u5bb6\uff0c\u672c\u6708\u65b0\u589e68\u5bb6\uff0c\u5e74\u5ea6\u8425\u65361856\u4e07\uff0c\u672c\u6708\u56de\u6b3e268\u4e07\uff0c"
            + "\u5f85\u7b7e\u5408\u540c23\u4efd\uff0c\u5458\u5de5186\u4eba\uff0c\u903e\u671f\u56de\u6b3e7\u7b14\uff0c\u6d41\u5931\u98ce\u9669\u5ba2\u624312\u5bb6\u3002";
        try {
            String reply = aiService.chat(prompt, new HashMap<>());
            AiSummaryVO vo = new AiSummaryVO();
            vo.setContent(reply);
            vo.setGeneratedAt(java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
            vo.setProvider(aiService.getProviderName());
            return vo;
        } catch (Exception e) {
            AiSummaryVO vo = new AiSummaryVO();
            vo.setContent("## \u7ecf\u8425\u6458\u8981\n\n### \u6838\u5fc3\u6307\u6807\n- \u5ba2\u6237\u603b\u6570\uff1a**1,286\u5bb6** (\u2191 12.5%)\n- \u5e74\u5ea6\u8425\u6536\uff1a**\uffe51,856\u4e07** (\u2191 15.2%)\n- \u672c\u6708\u56de\u6b3e\uff1a**\uffe5268\u4e07** (\u2193 3.1%)\n\n### \u98ce\u9669\u63d0\u793a\n- \u903e\u671f\u56de\u6b3e **7\u7b14**\uff0c\u91d1\u989d\uffe545.6\u4e07\uff0c\u5efa\u8bae\u52a0\u5feb\u50ac\u6536\n- \u6d41\u5931\u98ce\u9669\u5ba2\u6237 **12\u5bb6**\uff0c\u5efa\u8bae\u5b89\u6392\u4e13\u4eba\u56de\u8bbf\n\n### \u5efa\u8bae\u884c\u52a8\n1. \u672c\u5468\u91cd\u70b9\u63a8\u8fdb23\u4efd\u5f85\u7b7e\u5408\u540c\n2. \u5173\u6ce8\u56de\u6b3e\u4e0b\u964d\u8d8b\u52bf\uff0c\u4f18\u5316\u6536\u6b3e\u7b56\u7565");
            vo.setGeneratedAt(java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
            vo.setProvider("fallback");
            return vo;
        }
    }
}
