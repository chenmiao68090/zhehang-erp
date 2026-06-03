package com.zhehang.erp.modules.crm.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.zhehang.erp.modules.crm.domain.entity.CrmContract;

import java.util.List;
import java.util.Map;

public interface ICrmContractService extends IService<CrmContract> {
    IPage<CrmContract> selectPage(int pageNum, int pageSize, String contractNo, Long customerId, Integer status);
    void changeStatus(Long id, Integer status);

    /**
     * 销售业绩(按签订人聚合):合同数量 + 合同金额。
     * 数据源为真实 crm_contract,自动租户隔离;可按签约年份/状态过滤。
     * 返回每行 { ownerId, ownerName, contractCount, contractAmount }。
     */
    List<Map<String, Object>> performanceByOwner(Integer year, Integer status);

    /**
     * 合同月度趋势:按签约月份聚合 合同数量 + 合同金额(1~12 月补零)。
     * 返回 12 行 { month, contractCount, contractAmount }。
     */
    List<Map<String, Object>> monthlyTrend(Integer year);
}

