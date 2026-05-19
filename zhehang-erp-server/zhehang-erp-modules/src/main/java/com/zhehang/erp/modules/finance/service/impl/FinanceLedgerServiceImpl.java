package com.zhehang.erp.modules.finance.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.modules.finance.domain.entity.FinanceLedger;
import com.zhehang.erp.modules.finance.mapper.FinanceLedgerMapper;
import com.zhehang.erp.modules.finance.service.IFinanceLedgerService;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
public class FinanceLedgerServiceImpl extends ServiceImpl<FinanceLedgerMapper, FinanceLedger> implements IFinanceLedgerService {

    public List<FinanceLedger> queryGeneral(String subjectCode, String startPeriod, String endPeriod) {
        LambdaQueryWrapper<FinanceLedger> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(StringUtils.hasText(subjectCode), FinanceLedger::getSubjectCode, subjectCode)
               .ge(StringUtils.hasText(startPeriod), FinanceLedger::getPeriod, startPeriod)
               .le(StringUtils.hasText(endPeriod), FinanceLedger::getPeriod, endPeriod)
               .orderByAsc(FinanceLedger::getSubjectCode)
               .orderByAsc(FinanceLedger::getPeriod);
        return list(wrapper);
    }

    public List<FinanceLedger> queryBalance(String startPeriod, String endPeriod) {
        LambdaQueryWrapper<FinanceLedger> wrapper = new LambdaQueryWrapper<>();
        wrapper.ge(StringUtils.hasText(startPeriod), FinanceLedger::getPeriod, startPeriod)
               .le(StringUtils.hasText(endPeriod), FinanceLedger::getPeriod, endPeriod)
               .orderByAsc(FinanceLedger::getSubjectCode);
        return list(wrapper);
    }
}
