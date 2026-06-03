package com.zhehang.erp.modules.marketing.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.zhehang.erp.modules.marketing.domain.entity.MktCampaign;

public interface IMktCampaignService extends IService<MktCampaign> {
    IPage<MktCampaign> selectPage(int pageNum, int pageSize, String keyword, String channel, Integer status);
}
