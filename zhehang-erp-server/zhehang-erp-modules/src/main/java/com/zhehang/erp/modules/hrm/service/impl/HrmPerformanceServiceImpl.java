package com.zhehang.erp.modules.hrm.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.hrm.domain.entity.HrmPerformance;
import com.zhehang.erp.modules.hrm.mapper.HrmPerformanceMapper;
import com.zhehang.erp.modules.hrm.service.IHrmPerformanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class HrmPerformanceServiceImpl extends ServiceImpl<HrmPerformanceMapper, HrmPerformance> implements IHrmPerformanceService {

    private final HrmPerformanceMapper performanceMapper;

    @Override
    public IPage<HrmPerformance> selectPage(int pageNum, int pageSize, Long employeeId, String period, Integer type, Integer status) {
        LambdaQueryWrapper<HrmPerformance> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(employeeId != null, HrmPerformance::getEmployeeId, employeeId)
               .eq(StringUtils.hasText(period), HrmPerformance::getPeriod, period)
               .eq(type != null, HrmPerformance::getType, type)
               .eq(status != null, HrmPerformance::getStatus, status)
               .orderByDesc(HrmPerformance::getCreateTime);
        return performanceMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
    }

    @Override
    public void evaluate(Long id, BigDecimal selfScore, BigDecimal leaderScore, String evaluation) {
        HrmPerformance perf = performanceMapper.selectById(id);
        if (perf == null) {
            throw new BusinessException("绩效记录不存在");
        }
        BigDecimal finalScore = selfScore.multiply(BigDecimal.valueOf(0.3))
                .add(leaderScore.multiply(BigDecimal.valueOf(0.7)))
                .setScale(1, RoundingMode.HALF_UP);
        perf.setScore(finalScore);
        perf.setLeaderEvaluation(evaluation);
        perf.setLevel(calculateLevel(finalScore));
        perf.setStatus(2);
        performanceMapper.updateById(perf);
    }

    private String calculateLevel(BigDecimal score) {
        if (score.compareTo(BigDecimal.valueOf(90)) >= 0) return "A";
        if (score.compareTo(BigDecimal.valueOf(80)) >= 0) return "B";
        if (score.compareTo(BigDecimal.valueOf(70)) >= 0) return "C";
        if (score.compareTo(BigDecimal.valueOf(60)) >= 0) return "D";
        return "E";
    }

    @Override
    public Map<String, Object> statistics(String period, Integer type) {
        LambdaQueryWrapper<HrmPerformance> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(StringUtils.hasText(period), HrmPerformance::getPeriod, period)
               .eq(type != null, HrmPerformance::getType, type)
               .eq(HrmPerformance::getStatus, 2);
        List<HrmPerformance> list = performanceMapper.selectList(wrapper);
        int a = 0, b = 0, c = 0, d = 0, e = 0;
        for (HrmPerformance p : list) {
            switch (p.getLevel()) {
                case "A": a++; break;
                case "B": b++; break;
                case "C": c++; break;
                case "D": d++; break;
                case "E": e++; break;
            }
        }
        Map<String, Object> stats = new HashMap<>();
        stats.put("total", list.size());
        stats.put("levelA", a);
        stats.put("levelB", b);
        stats.put("levelC", c);
        stats.put("levelD", d);
        stats.put("levelE", e);
        return stats;
    }
}