package com.zhehang.erp.modules.task.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.org.domain.entity.OrgEmployee;
import com.zhehang.erp.modules.org.mapper.OrgEmployeeMapper;
import com.zhehang.erp.modules.task.domain.BizTask;
import com.zhehang.erp.modules.task.domain.BizTaskProgressReport;
import com.zhehang.erp.modules.task.mapper.BizTaskMapper;
import com.zhehang.erp.modules.task.mapper.BizTaskProgressReportMapper;
import com.zhehang.erp.modules.task.service.IBizTaskProgressReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BizTaskProgressReportServiceImpl
        extends ServiceImpl<BizTaskProgressReportMapper, BizTaskProgressReport>
        implements IBizTaskProgressReportService {

    private final BizTaskMapper taskMapper;
    private final BizTaskProgressReportMapper reportMapper;
    private final OrgEmployeeMapper employeeMapper;

    @Override
    public List<BizTaskProgressReport> listByTaskId(Long taskId) {
        if (taskId == null) {
            throw new BusinessException("任务ID不能为空");
        }
        ensureTaskExists(taskId);
        return reportMapper.selectList(new LambdaQueryWrapper<BizTaskProgressReport>()
                .eq(BizTaskProgressReport::getTaskId, taskId)
                .orderByDesc(BizTaskProgressReport::getReportTime)
                .orderByDesc(BizTaskProgressReport::getId));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public BizTaskProgressReport addReport(Long taskId, String content) {
        if (taskId == null) {
            throw new BusinessException("任务ID不能为空");
        }
        if (!StringUtils.hasText(content)) {
            throw new BusinessException("汇报内容不能为空");
        }
        String safeContent = content.trim();
        if (safeContent.length() > 2000) {
            throw new BusinessException("汇报内容不能超过2000字");
        }
        ensureTaskExists(taskId);

        Long userId = SecurityUtils.getCurrentUserId();
        BizTaskProgressReport report = new BizTaskProgressReport();
        report.setTaskId(taskId);
        report.setReporterId(userId);
        report.setReporterName(resolveReporterName(userId));
        report.setContent(safeContent);
        report.setReportTime(LocalDateTime.now());
        reportMapper.insert(report);
        return report;
    }

    private void ensureTaskExists(Long taskId) {
        BizTask task = taskMapper.selectById(taskId);
        if (task == null) {
            throw new BusinessException("任务不存在");
        }
    }

    private String resolveReporterName(Long userId) {
        if (userId != null) {
            OrgEmployee employee = employeeMapper.selectOne(new LambdaQueryWrapper<OrgEmployee>()
                    .eq(OrgEmployee::getUserId, userId)
                    .last("LIMIT 1"));
            if (employee != null && StringUtils.hasText(employee.getName())) {
                return employee.getName();
            }
        }
        String username = SecurityUtils.getCurrentUsername();
        return StringUtils.hasText(username) ? username : "当前用户";
    }
}
