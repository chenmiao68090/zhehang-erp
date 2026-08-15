package com.zhehang.erp.modules.finance.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.finance.domain.entity.FinBookkeepingLedger;
import com.zhehang.erp.modules.finance.mapper.FinBookkeepingLedgerMapper;
import com.zhehang.erp.modules.finance.service.IFinBookkeepingLedgerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 代账客户台账 Service 实现。默认按创建人收敛(同其他财务表);
 * data_scope=1 的角色(财务/管理层)由 DataScopeHelper 放行全量。
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FinBookkeepingLedgerServiceImpl implements IFinBookkeepingLedgerService {

    private final FinBookkeepingLedgerMapper ledgerMapper;
    private final DataScopeHelper dataScopeHelper;

    private LambdaQueryWrapper<FinBookkeepingLedger> baseWrapper(String keyword, String period) {
        LambdaQueryWrapper<FinBookkeepingLedger> wrapper = new LambdaQueryWrapper<>();
        dataScopeHelper.applyCreatorScope(wrapper, FinBookkeepingLedger::getCreateBy);
        wrapper.and(StringUtils.hasText(keyword), w -> w
                        .like(FinBookkeepingLedger::getClientName, keyword)
                        .or().like(FinBookkeepingLedger::getAccountantName, keyword))
                .eq(StringUtils.hasText(period), FinBookkeepingLedger::getPeriod, period);
        return wrapper;
    }

    @Override
    public IPage<FinBookkeepingLedger> ledgerList(int pageNum, int pageSize,
                                                  String keyword, String period,
                                                  Integer bookkeepingStatus, Integer taxFilingStatus) {
        LambdaQueryWrapper<FinBookkeepingLedger> wrapper = baseWrapper(keyword, period);
        wrapper.eq(bookkeepingStatus != null, FinBookkeepingLedger::getBookkeepingStatus, bookkeepingStatus)
                .eq(taxFilingStatus != null, FinBookkeepingLedger::getTaxFilingStatus, taxFilingStatus)
                .orderByDesc(FinBookkeepingLedger::getPeriod)
                .orderByDesc(FinBookkeepingLedger::getCreateTime);
        return ledgerMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
    }

    @Override
    public Map<String, Long> statusCount(String keyword, String period) {
        List<FinBookkeepingLedger> list = ledgerMapper.selectList(baseWrapper(keyword, period));
        Map<String, Long> map = new LinkedHashMap<>();
        map.put("total", (long) list.size());
        // 记账状态计数
        map.put("bkTodo", list.stream().filter(it -> Integer.valueOf(0).equals(it.getBookkeepingStatus())).count());
        map.put("bkDoing", list.stream().filter(it -> Integer.valueOf(1).equals(it.getBookkeepingStatus())).count());
        map.put("bkDone", list.stream().filter(it -> Integer.valueOf(2).equals(it.getBookkeepingStatus())).count());
        // 报税状态计数
        map.put("taxTodo", list.stream().filter(it -> Integer.valueOf(0).equals(it.getTaxFilingStatus())).count());
        map.put("taxDone", list.stream().filter(it -> Integer.valueOf(1).equals(it.getTaxFilingStatus())).count());
        map.put("taxNone", list.stream().filter(it -> Integer.valueOf(2).equals(it.getTaxFilingStatus())).count());
        return map;
    }

    @Override
    public Long saveLedger(FinBookkeepingLedger entity) {
        if (entity.getId() == null) {
            if (entity.getBookkeepingStatus() == null) {
                entity.setBookkeepingStatus(0);
            }
            if (entity.getTaxFilingStatus() == null) {
                entity.setTaxFilingStatus(0);
            }
            ledgerMapper.insert(entity);
        } else {
            ledgerMapper.updateById(entity);
        }
        return entity.getId();
    }

    @Override
    public void removeLedger(Long id) {
        ledgerMapper.deleteById(id);
    }
}
