package com.zhehang.erp.modules.finance.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.modules.finance.domain.entity.FinPettyCash;

/** 备用金 Service(独立 Service,参照 IBizChannelPartnerService) */
public interface IFinPettyCashService {

    IPage<FinPettyCash> pettyCashList(int pageNum, int pageSize,
                                      String keyword, String status);

    /** 新增/更新二合一,id==null 走 insert 否则 updateById */
    Long savePettyCash(FinPettyCash entity);

    void removePettyCash(Long id);

    void changeStatus(Long id, String status);
}
