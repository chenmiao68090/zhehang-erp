package com.zhehang.erp.modules.acquisition.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.zhehang.erp.modules.acquisition.domain.dto.EnterpriseCardVO;
import com.zhehang.erp.modules.acquisition.domain.dto.EnterpriseQueryDTO;
import com.zhehang.erp.modules.acquisition.domain.dto.EnterpriseStatsVO;
import com.zhehang.erp.modules.acquisition.domain.entity.AcqEnterprise;

import java.util.List;

public interface IAcqEnterpriseService extends IService<AcqEnterprise> {

    /**
     * 分页查询企业卡片列表
     */
    IPage<EnterpriseCardVO> queryEnterprisePage(EnterpriseQueryDTO query);

    /**
     * 查询统计信息
     */
    EnterpriseStatsVO getStats(EnterpriseQueryDTO query);

    /**
     * 获取企业详情
     */
    AcqEnterprise getDetail(Long id);

    /**
     * 批量解锁联系方式
     */
    void batchUnlock(List<Long> enterpriseIds, Long userId);

    /**
     * 批量添加到CRM
     */
    void batchAddToCrm(List<Long> enterpriseIds, String crmType, Long userId);
}
