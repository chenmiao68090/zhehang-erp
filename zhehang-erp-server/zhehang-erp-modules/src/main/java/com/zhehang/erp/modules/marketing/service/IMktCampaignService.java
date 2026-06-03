package com.zhehang.erp.modules.marketing.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.zhehang.erp.modules.marketing.domain.entity.MktCampaign;

import java.util.List;
import java.util.Map;

public interface IMktCampaignService extends IService<MktCampaign> {
    IPage<MktCampaign> selectPage(int pageNum, int pageSize, String keyword, String channel, Integer status);

    /** 各营销活动的获客 ROI/CAC 统计（实时统计关联线索数） */
    List<Map<String, Object>> roi();
}
