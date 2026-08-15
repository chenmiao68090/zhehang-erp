package com.zhehang.erp.modules.finance.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.modules.finance.domain.entity.FinCost;

/** 管理成本 Service(独立 Service,参照 IBizChannelPartnerService) */
public interface IFinCostService {

    IPage<FinCost> costList(int pageNum, int pageSize,
                            String keyword, String ownerDept, String period, String status);

    Long saveCost(FinCost entity);

    void removeCost(Long id);

    void changeStatus(Long id, String status);
}
