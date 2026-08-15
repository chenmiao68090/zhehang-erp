package com.zhehang.erp.modules.finance.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.modules.finance.domain.entity.FinBookkeepingLedger;

import java.util.Map;

/** 代账客户台账 Service(会计体系·代理记账业务线,独立 Service) */
public interface IFinBookkeepingLedgerService {

    IPage<FinBookkeepingLedger> ledgerList(int pageNum, int pageSize,
                                           String keyword, String period,
                                           Integer bookkeepingStatus, Integer taxFilingStatus);

    /** 按当前筛选口径统计各记账/报税状态的数量(供状态统计卡)。 */
    Map<String, Long> statusCount(String keyword, String period);

    Long saveLedger(FinBookkeepingLedger entity);

    void removeLedger(Long id);
}
