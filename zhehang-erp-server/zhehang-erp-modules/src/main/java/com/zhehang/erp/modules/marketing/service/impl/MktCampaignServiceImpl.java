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
        for (MktCampaign c : campaigns) {
            Number cnt = crmLeadMapper.selectCount(
                    new LambdaQueryWrapper<CrmLead>().eq(CrmLead::getCampaignId, c.getId()));
            long leadsCount = cnt == null ? 0L : cnt.longValue();
            // 本活动已转化(成交)线索数与转化率
            Number convNum = crmLeadMapper.selectCount(new LambdaQueryWrapper<CrmLead>()
                    .eq(CrmLead::getCampaignId, c.getId()).eq(CrmLead::getStatus, 3));
            long convertedCount = convNum == null ? 0L : convNum.longValue();
            double conversionRate = leadsCount > 0
                    ? Math.round(convertedCount * 10000.0 / leadsCount) / 100.0 : 0.0;
            BigDecimal cost = c.getActualCost() == null ? BigDecimal.ZERO : c.getActualCost();
            BigDecimal cac = leadsCount > 0
                    ? cost.divide(BigDecimal.valueOf(leadsCount), 2, RoundingMode.HALF_UP)
                    : null;
            // 成交额归因:本活动 → 客户(campaign_id) → 该客户已签合同(status>=4)金额合计
            List<Long> custIds = crmCustomerMapper.selectList(new LambdaQueryWrapper<CrmCustomer>()
                    .select(CrmCustomer::getId).eq(CrmCustomer::getCampaignId, c.getId()))
                    .stream().map(CrmCustomer::getId).collect(java.util.stream.Collectors.toList());
            BigDecimal dealAmount = BigDecimal.ZERO;
            int dealCount = 0;
            if (!custIds.isEmpty()) {
                List<BizContract> contracts = bizContractMapper.selectList(new LambdaQueryWrapper<BizContract>()
                        .in(BizContract::getCustomerId, custIds).ge(BizContract::getStatus, 4));
                dealCount = contracts.size();
                for (BizContract bc : contracts) {
                    dealAmount = dealAmount.add(bc.getAmount() == null ? BigDecimal.ZERO : bc.getAmount());
                }
            }
            // 投资回报率 ROI(%) = (成交额 - 成本) / 成本 × 100;成本为0时不计
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
