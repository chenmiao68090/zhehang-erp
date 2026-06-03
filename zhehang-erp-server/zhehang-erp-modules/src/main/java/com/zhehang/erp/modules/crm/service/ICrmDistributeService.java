package com.zhehang.erp.modules.crm.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.zhehang.erp.modules.crm.domain.entity.CrmDistributeLog;

import java.util.List;

public interface ICrmDistributeService extends IService<CrmDistributeLog> {
    /** 加权轮询自动分配 */
    Long autoDistribute(Long leadId, Long poolId);

    /** 主管手动分配 */
    void manualDistribute(Long leadId, Long toUserId, Long operatorId);

    /** 抢单领取 */
    boolean grabLead(Long leadId, Long userId);

    /** 计算用户权重 */
    int calculateWeight(Long userId);

    /** 查询分配日志 */
    List<CrmDistributeLog> getDistributeLog(Long leadId);
}
