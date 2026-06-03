package com.zhehang.erp.modules.marketing.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.modules.marketing.domain.entity.MktCampaign;
import com.zhehang.erp.modules.marketing.mapper.MktCampaignMapper;
import com.zhehang.erp.modules.marketing.service.IMktCampaignService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class MktCampaignServiceImpl extends ServiceImpl<MktCampaignMapper, MktCampaign>
        implements IMktCampaignService {

    private final MktCampaignMapper campaignMapper;

    @Override
    public IPage<MktCampaign> selectPage(int pageNum, int pageSize, String keyword, String channel, Integer status) {
        LambdaQueryWrapper<MktCampaign> wrapper = new LambdaQueryWrapper<>();
        wrapper.like(StringUtils.hasText(keyword), MktCampaign::getCampaignName, keyword)
               .eq(StringUtils.hasText(channel), MktCampaign::getChannel, channel)
               .eq(status != null, MktCampaign::getStatus, status)
               .orderByDesc(MktCampaign::getCreateTime);
        return campaignMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
    }
}
