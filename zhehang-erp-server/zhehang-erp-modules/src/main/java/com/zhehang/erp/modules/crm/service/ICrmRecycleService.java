package com.zhehang.erp.modules.crm.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.zhehang.erp.modules.crm.domain.entity.CrmLead;
import com.zhehang.erp.modules.crm.domain.entity.CrmRecycleRule;

import java.util.List;

public interface ICrmRecycleService extends IService<CrmRecycleRule> {
    /** 扫描回收(定时任务调用) */
    int scanAndRecycle();

    /** 检查回收条件 */
    boolean checkRecycleCondition(Long leadId);

    /** 手动回收 */
    int manualRecycle(List<Long> leadIds, String reason);

    /** 获取预警列表 */
    List<CrmLead> getWarningList(String level);

    /** 获取规则列表 */
    List<CrmRecycleRule> getRules();

    /** 保存规则 */
    boolean saveRule(CrmRecycleRule rule);
}
