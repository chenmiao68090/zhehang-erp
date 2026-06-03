package com.zhehang.erp.modules.marketing.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.modules.crm.domain.entity.CrmLead;
import com.zhehang.erp.modules.crm.mapper.CrmLeadMapper;
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
            BigDecimal cost = c.getActualCost() == null ? BigDecimal.ZERO : c.getActualCost();
            BigDecimal cac = leadsCount > 0
                    ? cost.divide(BigDecimal.valueOf(leadsCount), 2, RoundingMode.HALF_UP)
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
            m.put("cac", cac);
            m.put("status", c.getStatus());
            result.add(m);
        }
        return result;
    }
}
