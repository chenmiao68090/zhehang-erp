package com.zhehang.erp.modules.finance.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.modules.finance.domain.entity.FinExpense;

/** 业务支出 Service(独立 Service,参照 IBizChannelPartnerService) */
public interface IFinExpenseService {

    IPage<FinExpense> expenseList(int pageNum, int pageSize,
                                  String keyword, String category, String status);

    Long saveExpense(FinExpense entity);

    void removeExpense(Long id);

    void changeStatus(Long id, String status);
}
