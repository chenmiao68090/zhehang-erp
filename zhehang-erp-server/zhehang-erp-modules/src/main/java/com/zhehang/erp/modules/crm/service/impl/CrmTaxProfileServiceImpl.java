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

import java.time.YearMonth;
import java.util.ArrayList;
import java.util.LinkedHashMap;
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
        YearMonth ym;
        try {
            ym = StringUtils.hasText(month) ? YearMonth.parse(month) : YearMonth.now();
        } catch (Exception e) {
            ym = YearMonth.now();
        }
        int m = ym.getMonthValue();
        // 申报截止日：简化为当月 15 日提醒（实务多为次月 15 日前申报上期）
        String deadline = ym.atDay(15).toString();

        List<CrmTaxProfile> profiles = taxProfileMapper.selectList(
                new LambdaQueryWrapper<CrmTaxProfile>().orderByDesc(CrmTaxProfile::getUpdateTime));
        List<Map<String, Object>> result = new ArrayList<>();
        for (CrmTaxProfile p : profiles) {
            if (!shouldFile(p.getFilingCycle(), m)) {
                continue;
            }
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("creditCode", p.getCreditCode());
            item.put("companyName", p.getCompanyName());
            item.put("taxpayerType", p.getTaxpayerType());
            item.put("collectionType", p.getCollectionType());
            item.put("taxAuthority", p.getTaxAuthority());
            item.put("taxTypes", p.getTaxTypes());
            item.put("filingCycle", p.getFilingCycle());
            item.put("taxOfficer", p.getTaxOfficer());
            item.put("month", ym.toString());
            item.put("deadline", deadline);
            item.put("status", "待申报");
            result.add(item);
        }
        return result;
    }

    /** 按申报周期判断该月是否需要申报：月报=每月；季报=1/4/7/10月；年报/汇算=5月 */
    private boolean shouldFile(String cycle, int month) {
        if (!StringUtils.hasText(cycle)) {
            return false;
        }
        if (cycle.contains("月")) {
            return true;
        }
        if (cycle.contains("季")) {
            return month == 1 || month == 4 || month == 7 || month == 10;
        }
        if (cycle.contains("年")) {
            return month == 5;
        }
        return false;
    }
}
