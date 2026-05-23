package com.zhehang.erp.modules.hrm.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.zhehang.erp.modules.hrm.domain.entity.HrmPerformance;

import java.util.Map;

public interface IHrmPerformanceService extends IService<HrmPerformance> {
    IPage<HrmPerformance> selectPage(int pageNum, int pageSize, Long employeeId, String period, Integer type, Integer status);
    void evaluate(Long id, java.math.BigDecimal selfScore, java.math.BigDecimal leaderScore, String evaluation);
    Map<String, Object> statistics(String period, Integer type);
}
