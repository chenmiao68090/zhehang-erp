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
            new CustomerSourceVO("抖音信息流", 286),
            new CustomerSourceVO("百度搜索", 238),
            new CustomerSourceVO("电销拓客", 216),
            new CustomerSourceVO("同行转介绍", 168),
            new CustomerSourceVO("企查工商库", 142),
            new CustomerSourceVO("老客户复购", 126),
            new CustomerSourceVO("自然咨询", 110)
        );
    }

    @Override
    @Cacheable(value = "cockpit:sales-rank", unless = "#result == null")
    public List<SalesRankVO> getSalesRank() {
        return Arrays.asList(
            new SalesRankVO(1, "张星", "网销一组", new BigDecimal("2860000"), 18.5),
            new SalesRankVO(2, "李娜", "电销一组", new BigDecimal("2450000"), 12.3),
            new SalesRankVO(3, "王明", "渠道销售组", new BigDecimal("2180000"), 22.1),
            new SalesRankVO(4, "赵静", "网销二组", new BigDecimal("1960000"), -5.2),
            new SalesRankVO(5, "刘强", "企业服务组", new BigDecimal("1850000"), 8.7),
            new SalesRankVO(6, "陈芳", "客户成功组", new BigDecimal("1720000"), 15.4),
            new SalesRankVO(7, "周海", "渠道销售组", new BigDecimal("1580000"), 3.2),
            new SalesRankVO(8, "杨雪", "网销一组", new BigDecimal("1460000"), -2.1),
            new SalesRankVO(9, "吴磊", "电销二组", new BigDecimal("1320000"), 9.8),
            new SalesRankVO(10, "孙亮", "企业服务组", new BigDecimal("1180000"), 6.5)
        );
    }

    @Override
    @Cacheable(value = "cockpit:recent-events", unless = "#result == null")
    public List<RecentEventVO> getRecentEvents() {
        return Arrays.asList(
            new RecentEventVO("sign", "与杭州松柏科技签约代理记账+税务顾问年度服务，金额￥12.8万", "2分钟前", "张星"),
            new RecentEventVO("receipt", "收到同行渠道「杭企伙伴」挂靠地址批量订单回款￥45.6万", "15分钟前", "李娜"),
            new RecentEventVO("follow", "跟进滨江新注册企业工商注册+银行开户需求，客户意向积极", "30分钟前", "王明"),
            new RecentEventVO("lead", "新线索：浙江两杉生物科技自动带出工商信息并进入电销队列", "1小时前", "系统"),
            new RecentEventVO("sign", "与杭州华锋智康签订税务异常解除专项服务￥8.6万", "1.5小时前", "赵静"),
            new RecentEventVO("receipt", "收到金华美达商贸代理记账续费回款￥3.28万", "2小时前", "刘强"),
            new RecentEventVO("alert", "渠道「杭企伙伴」应收超过账期 9 天，建议冻结新增订单", "3小时前", "系统"),
            new RecentEventVO("follow", "完成西湖区挂靠地址资源补充沟通，预计新增 20 套", "4小时前", "陈芳")
        );
    }

    @Override
    @Cacheable(value = "cockpit:region", unless = "#result == null")
    public List<RegionDistributionVO> getRegionDistribution() {
        return Arrays.asList(
            new RegionDistributionVO("西湖区", 186),
            new RegionDistributionVO("滨江区", 165),
            new RegionDistributionVO("上城区", 142),
            new RegionDistributionVO("拱墅区", 128),
            new RegionDistributionVO("萧山区", 116),
            new RegionDistributionVO("余杭区", 98),
            new RegionDistributionVO("钱塘区", 86),
            new RegionDistributionVO("临平区", 72),
            new RegionDistributionVO("宁波", 65),
            new RegionDistributionVO("嘉兴", 52),
            new RegionDistributionVO("绍兴", 46),
            new RegionDistributionVO("湖州", 38),
            new RegionDistributionVO("金华", 32),
            new RegionDistributionVO("台州", 28),
            new RegionDistributionVO("温州", 24)
        );
    }

    @Override
    @Cacheable(value = "cockpit:alerts", unless = "#result == null")
    public AlertVO getAlerts() {
        AlertVO vo = new AlertVO();
        vo.setOverdueReceiptCount(4);
        vo.setOverdueReceiptAmount(new BigDecimal("186000"));
        vo.setRiskCustomerCount(18);
        vo.setExpiringContractCount(11);
        vo.setStockWarningCount(2);
        vo.setAbnormalApprovalCount(9);
        return vo;
    }

    @Override
    public AiSummaryVO getAiSummary() {
        String prompt = "请根据以下财税公司经营数据生成一份简洁的CEO经营分析摘要（Markdown格式）：\n"
            + "服务客户1286家，本月新签客户68家，本月签约额1856万，本月回款268万，"
            + "待签订单23份，服务人员186人，同行渠道逾期应收4笔，代理记账续费风险客户18家，"
            + "地址资源低库存区域2个，工商注册材料异常9单，网销ROI为2.8，目标ROI为3.2。";
        try {
            String reply = aiService.chat(prompt, new HashMap<>());
            AiSummaryVO vo = new AiSummaryVO();
            vo.setContent(reply);
            vo.setGeneratedAt(java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
            vo.setProvider(aiService.getProviderName());
            return vo;
        } catch (Exception e) {
            AiSummaryVO vo = new AiSummaryVO();
            vo.setContent("## 经营摘要\n\n### 核心指标\n- 服务客户：**1,286家**（↑ 12.5%）\n- 本月签约额：**￥1,856万**（↑ 15.2%）\n- 本月回款：**￥268万**（↓ 3.1%）\n- 网销ROI：**2.8**，低于目标 **3.2**\n\n### 风险提示\n- 同行渠道逾期应收 **4笔**，金额￥18.6万，建议冻结超账期渠道新增订单\n- 代理记账续费风险客户 **18家**，建议客户成功当天完成分层回访\n- 地址资源低库存区域 **2个**，建议提前补充西湖区、滨江区资源\n\n### 建议行动\n1. 先处理网销ROI和渠道应收，避免增长质量下滑\n2. 建立线索入库工商信息自动补全，提升销售跟进效率\n3. 将地址资源库存预警前置到订单创建环节");
            vo.setGeneratedAt(java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
            vo.setProvider("fallback");
            return vo;
        }
    }
}
