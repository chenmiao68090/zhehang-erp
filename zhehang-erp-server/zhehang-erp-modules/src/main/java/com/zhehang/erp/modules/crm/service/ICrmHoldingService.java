package com.zhehang.erp.modules.crm.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.zhehang.erp.modules.crm.domain.entity.CrmHoldingConfig;

import java.util.List;
import java.util.Map;

public interface ICrmHoldingService extends IService<CrmHoldingConfig> {

    /** 启用中的持有上限配置列表 */
    List<CrmHoldingConfig> listEnabled();

    /** 当前持有情况:{ current, max, rate }(userId 为空取当前登录人) */
    Map<String, Object> currentHolding(Long userId);

    /** 领取上限校验:{ canClaim, reason? } */
    Map<String, Object> checkLimit(Long userId);
}
