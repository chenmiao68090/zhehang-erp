package com.zhehang.erp.modules.crm.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.zhehang.erp.modules.crm.domain.dto.DuplicateCheckResult;
import com.zhehang.erp.modules.crm.domain.entity.CrmCollisionLog;
import com.zhehang.erp.modules.crm.domain.entity.CrmLead;

import java.util.List;

public interface ICrmCollisionService extends IService<CrmCollisionLog> {
    /** 4级查重(信用代码/名称/电话/联系人) */
    List<CrmLead> checkDuplicate(String creditCode, String name, String phone, String contactName);

    /** 结构化查重:按优先级返回命中等级 P0~P3 与已存在线索信息(前端契约) */
    DuplicateCheckResult checkDuplicateDetail(String creditCode, String name, String phone, String contactName);

    /** 领取锁(防止并发抢单) */
    boolean lockForClaim(Long leadId, Long userId);

    /** 处理撞单 */
    void resolveCollision(Long logId, String resolution, String detail);

    /** 查询撞单记录 */
    IPage<CrmCollisionLog> getCollisionLogs(int pageNum, int pageSize);
}
