package com.zhehang.erp.modules.marketing.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.modules.crm.domain.entity.CrmLead;
import com.zhehang.erp.modules.crm.domain.entity.CrmCustomer;
import com.zhehang.erp.modules.crm.mapper.CrmLeadMapper;
import com.zhehang.erp.modules.crm.mapper.CrmCustomerMapper;
import com.zhehang.erp.modules.contract.domain.BizContract;
import com.zhehang.erp.modules.contract.mapper.BizContractMapper;
import com.zhehang.erp.modules.marketing.domain.entity.MktCampaign;
import com.zhehang.erp.modules.marketing.mapper.MktCampaignMapper;
import com.zhehang.erp.modules.marketing.service.IMktCampaignService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class MktCampaignServiceImpl extends ServiceImpl<MktCampaignMapper, MktCampaign>
        implements IMktCampaignService {

    private final MktCampaignMapper campaignMapper;
    private final CrmLeadMapper crmLeadMapper;
    private final CrmCustomerMapper crmCustomerMapper;
    private final BizContractMapper bizContractMapper;

    @Override
    public IPage<MktCampaign> selectPage(int pageNum, int pageSize, String keyword, String channel, Integer status) {
        LambdaQueryWrapper<MktCampaign> wrapper = new LambdaQueryWrapper<>();
        wrapper.like(StringUtils.hasText(keyword), MktCampaign::getCampaignName, keyword)
               .eq(StringUtils.hasText(channel), MktCampaign::getChannel, channel)
               .eq(status != null, MktCampaign::getStatus, status)
               .orderByDesc(MktCampaign::getCreateTime);
        return campaignMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
    }

    @Override
    public List<Map<String, Object>> roi() {
        List<MktCampaign> campaigns = this.list(
                new LambdaQueryWrapper<MktCampaign>().orderByDesc(MktCampaign::getCreateTime));
        List<Map<String, Object>> result = new ArrayList<>();
        if (campaigns.isEmpty()) {
            return result;
        }
        List<Long> campaignIds = campaigns.stream().map(MktCampaign::getId)
                .collect(java.util.stream.Collectors.toList());

        // 批量化,消除原 4N+1:(1) 一次 GROUP BY 取每活动线索数+转化数
        java.util.Map<Long, long[]> leadStats = new java.util.HashMap<>();
        com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<CrmLead> lqw =
                new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<>();
        lqw.select("campaign_id AS cid", "COUNT(*) AS total",
                   "SUM(CASE WHEN status = 3 THEN 1 ELSE 0 END) AS conv")
           .in("campaign_id", campaignIds).groupBy("campaign_id");
        for (java.util.Map<String, Object> row : crmLeadMapper.selectMaps(lqw)) {
            Object cid = row.get("cid");
            if (cid == null) continue;
            long total = row.get("total") == null ? 0L : ((Number) row.get("total")).longValue();
            long conv = row.get("conv") == null ? 0L : ((Number) row.get("conv")).longValue();
            leadStats.put(((Number) cid).longValue(), new long[]{total, conv});
        }
        // (2) 一次 IN 取每活动归因客户
        java.util.Map<Long, java.util.List<Long>> campaignCusts = new java.util.HashMap<>();
        java.util.List<Long> allCustIds = new java.util.ArrayList<>();
        for (CrmCustomer cu : crmCustomerMapper.selectList(new LambdaQueryWrapper<CrmCustomer>()
                .select(CrmCustomer::getId, CrmCustomer::getCampaignId)
                .in(CrmCustomer::getCampaignId, campaignIds))) {
            if (cu.getCampaignId() == null) continue;
            campaignCusts.computeIfAbsent(cu.getCampaignId(), k -> new java.util.ArrayList<>()).add(cu.getId());
            allCustIds.add(cu.getId());
        }
        // (3) 一次 IN 取这些客户的已签合同金额,按客户聚合
        java.util.Map<Long, BigDecimal> custDealAmount = new java.util.HashMap<>();
        java.util.Map<Long, Integer> custDealCount = new java.util.HashMap<>();
        if (!allCustIds.isEmpty()) {
            for (BizContract bc : bizContractMapper.selectList(new LambdaQueryWrapper<BizContract>()
                    .in(BizContract::getCustomerId, allCustIds).ge(BizContract::getStatus, 4))) {
                Long cu = bc.getCustomerId();
                custDealAmount.merge(cu, bc.getAmount() == null ? BigDecimal.ZERO : bc.getAmount(), BigDecimal::add);
                custDealCount.merge(cu, 1, Integer::sum);
            }
        }
        // (4) 内存计算,ROI/CAC/转化率逻辑与原逐条完全一致
        for (MktCampaign c : campaigns) {
            long[] ls = leadStats.getOrDefault(c.getId(), new long[]{0L, 0L});
            long leadsCount = ls[0];
            long convertedCount = ls[1];
            double conversionRate = leadsCount > 0
                    ? Math.round(convertedCount * 10000.0 / leadsCount) / 100.0 : 0.0;
            BigDecimal cost = c.getActualCost() == null ? BigDecimal.ZERO : c.getActualCost();
            BigDecimal cac = leadsCount > 0
                    ? cost.divide(BigDecimal.valueOf(leadsCount), 2, RoundingMode.HALF_UP) : null;
            BigDecimal dealAmount = BigDecimal.ZERO;
            int dealCount = 0;
            for (Long cu : campaignCusts.getOrDefault(c.getId(), java.util.Collections.emptyList())) {
                dealAmount = dealAmount.add(custDealAmount.getOrDefault(cu, BigDecimal.ZERO));
                dealCount += custDealCount.getOrDefault(cu, 0);
            }
            BigDecimal roi = cost.compareTo(BigDecimal.ZERO) > 0
                    ? dealAmount.subtract(cost).multiply(new BigDecimal("100"))
                        .divide(cost, 2, RoundingMode.HALF_UP)
                    : null;
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", c.getId());
            m.put("campaignName", c.getCampaignName());
            m.put("channel", c.getChannel());
            m.put("budget", c.getBudget());
            m.put("actualCost", cost);
            m.put("impressions", c.getImpressions());
            m.put("clicks", c.getClicks());
            m.put("leadsCount", leadsCount);
            m.put("convertedCount", convertedCount);
            m.put("conversionRate", conversionRate);
            m.put("cac", cac);
            m.put("dealCount", dealCount);
            m.put("dealAmount", dealAmount);
            m.put("roi", roi);
            m.put("status", c.getStatus());
            result.add(m);
        }
        return result;
    }
}
