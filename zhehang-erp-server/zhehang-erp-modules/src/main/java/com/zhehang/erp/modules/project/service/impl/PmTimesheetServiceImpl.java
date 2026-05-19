package com.zhehang.erp.modules.project.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.modules.project.domain.entity.PmTimesheet;
import com.zhehang.erp.modules.project.mapper.PmTimesheetMapper;
import com.zhehang.erp.modules.project.service.IPmTimesheetService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PmTimesheetServiceImpl extends ServiceImpl<PmTimesheetMapper, PmTimesheet> implements IPmTimesheetService {

    @Override
    public IPage<PmTimesheet> selectPage(int pageNum, int pageSize, Long projectId, Long taskId, Long employeeId) {
        LambdaQueryWrapper<PmTimesheet> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(projectId != null, PmTimesheet::getProjectId, projectId)
               .eq(taskId != null, PmTimesheet::getTaskId, taskId)
               .eq(employeeId != null, PmTimesheet::getEmployeeId, employeeId)
               .orderByDesc(PmTimesheet::getWorkDate);
        return page(new Page<>(pageNum, pageSize), wrapper);
    }

    @Override
    public Map<String, BigDecimal> getStats(Long projectId) {
        List<PmTimesheet> list = list(new LambdaQueryWrapper<PmTimesheet>()
            .eq(PmTimesheet::getProjectId, projectId));
        BigDecimal totalHours = list.stream()
            .map(t -> t.getHours() != null ? t.getHours() : BigDecimal.ZERO)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        Map<String, BigDecimal> stats = new HashMap<>();
        stats.put("totalHours", totalHours);
        stats.put("records", BigDecimal.valueOf(list.size()));
        return stats;
    }
}
