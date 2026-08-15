package com.zhehang.erp.modules.finance.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.zhehang.erp.modules.finance.domain.dto.FinReceivableCollectionDTO;
import com.zhehang.erp.modules.finance.domain.dto.FinReceivablePaymentDTO;
import com.zhehang.erp.modules.finance.domain.entity.FinReceivableCollectionLog;
import com.zhehang.erp.modules.finance.domain.entity.FinReceivableRenewal;

import java.util.List;
import java.util.Map;

public interface IFinReceivableRenewalService extends IService<FinReceivableRenewal> {
    IPage<FinReceivableRenewal> selectPage(Integer pageNum,
                                           Integer pageSize,
                                           String keyword,
                                           String serviceType,
                                           String receivableMonth,
                                           Integer receivableStatus,
                                           String collectionStatus,
                                           Long collectorId,
                                           Boolean overdueOnly,
                                           Boolean badRiskOnly);

    Map<String, Object> summary();

    FinReceivableRenewal detail(Long id);

    Long saveReceivable(FinReceivableRenewal entity);

    void receive(FinReceivablePaymentDTO dto);

    void collect(FinReceivableCollectionDTO dto);

    List<FinReceivableCollectionLog> logs(Long id);

    void removeReceivable(Long id);
}
