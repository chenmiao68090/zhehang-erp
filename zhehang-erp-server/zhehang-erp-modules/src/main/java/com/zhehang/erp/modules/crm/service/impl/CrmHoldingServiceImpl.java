package com.zhehang.erp.modules.crm.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.crm.domain.entity.CrmHoldingConfig;
import com.zhehang.erp.modules.crm.domain.entity.CrmLead;
import com.zhehang.erp.modules.crm.mapper.CrmHoldingConfigMapper;
import com.zhehang.erp.modules.crm.mapper.CrmLeadMapper;
import com.zhehang.erp.modules.crm.service.ICrmHoldingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CrmHoldingServiceImpl extends ServiceImpl<CrmHoldingConfigMapper, CrmHoldingConfig>
        implements ICrmHoldingService {

    /** 无任何配置时的默认持有上限 */
    private static final int DEFAULT_MAX_HOLDING = 100;

    private final CrmHoldingConfigMapper holdingConfigMapper;
    private final CrmLeadMapper leadMapper;

    @Override
    public List<CrmHoldingConfig> listEnabled() {
        LambdaQueryWrapper<CrmHoldingConfig> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CrmHoldingConfig::getStatus, 0)
               .orderByAsc(CrmHoldingConfig::getMaxHolding);
        return holdingConfigMapper.selectList(wrapper);
    }

    @Override
    public Map<String, Object> currentHolding(Long userId) {
        Long uid = userId != null ? userId : SecurityUtils.getCurrentUserId();
        long current = countPrivateLeads(uid);
        int max = resolveMaxHolding();
        Map<String, Object> result = new HashMap<>();
        result.put("current", current);
        result.put("max", max);
        result.put("rate", max <= 0 ? BigDecimal.ZERO
                : BigDecimal.valueOf(current).divide(BigDecimal.valueOf(max), 2, RoundingMode.HALF_UP));
        return result;
    }

    @Override
    public Map<String, Object> checkLimit(Long userId) {
        Long uid = userId != null ? userId : SecurityUtils.getCurrentUserId();
        long current = countPrivateLeads(uid);
        int max = resolveMaxHolding();
        Map<String, Object> result = new HashMap<>();
        boolean canClaim = current < max;
        result.put("canClaim", canClaim);
        if (!canClaim) {
            result.put("reason", "已达持有上限(" + max + "),请先跟进或释放部分客资");
        }
        return result;
    }

    private long countPrivateLeads(Long userId) {
        if (userId == null) {
            return 0L;
        }
        LambdaQueryWrapper<CrmLead> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CrmLead::getOwnerId, userId)
               .eq(CrmLead::getOwnership, "private");
        return leadMapper.selectCount(wrapper);
    }

    /**
     * 解析持有上限:取启用配置中的最大值。
     * TODO: 接入用户岗位与 roleType 的映射后,按用户实际角色取对应上限。
     */
    private int resolveMaxHolding() {
        return listEnabled().stream()
                .map(CrmHoldingConfig::getMaxHolding)
                .filter(java.util.Objects::nonNull)
                .max(Integer::compareTo)
                .orElse(DEFAULT_MAX_HOLDING);
    }
}
