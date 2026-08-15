package com.zhehang.erp.modules.crm.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.crm.domain.entity.CrmTaxProfile;
import com.zhehang.erp.modules.crm.mapper.CrmTaxProfileMapper;
import com.zhehang.erp.modules.crm.service.ICrmTaxProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CrmTaxProfileServiceImpl extends ServiceImpl<CrmTaxProfileMapper, CrmTaxProfile>
        implements ICrmTaxProfileService {

    private final CrmTaxProfileMapper taxProfileMapper;

    @Override
    public CrmTaxProfile getByCreditCode(String creditCode) {
        if (!StringUtils.hasText(creditCode)) {
            return null;
        }
        return taxProfileMapper.selectOne(new LambdaQueryWrapper<CrmTaxProfile>()
                .eq(CrmTaxProfile::getCreditCode, creditCode)
                .last("limit 1"));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public CrmTaxProfile saveOrUpdateByCreditCode(CrmTaxProfile profile) {
        if (profile == null || !StringUtils.hasText(profile.getCreditCode())) {
            throw new BusinessException("统一社会信用代码不能为空");
        }
        CrmTaxProfile exist = getByCreditCode(profile.getCreditCode());
        if (exist != null) {
            profile.setId(exist.getId());
            updateById(profile);
        } else {
            save(profile);
        }
        return getByCreditCode(profile.getCreditCode());
    }

    @Override
    public List<Map<String, Object>> taxCalendar(String month) {
        throw new BusinessException(503,
                "报税日历暂不可用：系统尚未接入可核验的申报期限和真实申报结果，请以电子税务局为准");
    }
}
