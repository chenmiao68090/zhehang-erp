package com.zhehang.erp.modules.task.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.task.domain.BizTask;
import com.zhehang.erp.modules.task.domain.BizTaskHandover;
import com.zhehang.erp.modules.task.domain.BizTaskHandoverItem;
import com.zhehang.erp.modules.task.mapper.BizTaskHandoverItemMapper;
import com.zhehang.erp.modules.task.mapper.BizTaskHandoverMapper;
import com.zhehang.erp.modules.task.mapper.BizTaskMapper;
import com.zhehang.erp.modules.task.service.IBizTaskService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class BizTaskServiceImpl extends ServiceImpl<BizTaskMapper, BizTask> implements IBizTaskService {

    private final BizTaskMapper taskMapper;
    private final BizTaskHandoverMapper handoverMapper;
    private final BizTaskHandoverItemMapper handoverItemMapper;

    @Override
    public IPage<BizTask> selectPage(int pageNum, int pageSize, String taskType, Integer status, Long executorId) {
        LambdaQueryWrapper<BizTask> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(StringUtils.hasText(taskType), BizTask::getTaskType, taskType)
                .eq(status != null, BizTask::getStatus, status)
                .eq(executorId != null, BizTask::getExecutorId, executorId)
                .orderByDesc(BizTask::getCreateTime);
        return taskMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
    }

    @Override
    public Long createTask(BizTask task) {
        if (!StringUtils.hasText(task.getTaskNo())) {
            task.setTaskNo("TSK" + System.currentTimeMillis());
        }
        if (task.getStatus() == null) {
            task.setStatus(task.getExecutorId() != null ? 2 : 1);
        }
        if (task.getPriority() == null) {
            task.setPriority(2);
        }
        taskMapper.insert(task);
        return task.getId();
    }

    @Override
    public void assign(Long id, Long executorId, String executorName) {
        BizTask task = taskMapper.selectById(id);
        if (task == null) {
            throw new BusinessException("任务不存在");
        }
        task.setExecutorId(executorId);
        task.setExecutorName(executorName);
        if (task.getStatus() != null && task.getStatus() == 1) {
            task.setStatus(2);
        }
        taskMapper.updateById(task);
    }

    @Override
    public void start(Long id, Long operatorId) {
        BizTask task = taskMapper.selectById(id);
        if (task == null) {
            throw new BusinessException("任务不存在");
        }
        if (task.getStatus() == null || task.getStatus() != 2) {
            throw new BusinessException("任务状态不正确");
        }
        task.setStatus(3);
        task.setActualStartTime(LocalDateTime.now());
        taskMapper.updateById(task);
    }

    @Override
    public void complete(Long id, String result, Long operatorId) {
        BizTask task = taskMapper.selectById(id);
        if (task == null) {
            throw new BusinessException("任务不存在");
        }
        task.setStatus(4);
        task.setResult(result);
        task.setActualEndTime(LocalDateTime.now());
        taskMapper.updateById(task);
    }

    @Override
    public void review(Long id, boolean pass, String comment, Long reviewerId) {
        BizTask task = taskMapper.selectById(id);
        if (task == null) {
            throw new BusinessException("任务不存在");
        }
        task.setStatus(pass ? 5 : 6);
        task.setReviewComment(comment);
        task.setReviewerId(reviewerId);
        task.setReviewTime(LocalDateTime.now());
        taskMapper.updateById(task);
    }

    @Override
    public IPage<BizTask> myTasks(int pageNum, int pageSize, Long userId) {
        LambdaQueryWrapper<BizTask> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(BizTask::getExecutorId, userId)
                .in(BizTask::getStatus, 2, 3, 4)
                .orderByAsc(BizTask::getPriority)
                .orderByAsc(BizTask::getPlanEndTime);
        return taskMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
    }

    @Override
    public List<BizTask> overdueTasks() {
        LambdaQueryWrapper<BizTask> wrapper = new LambdaQueryWrapper<>();
        wrapper.lt(BizTask::getPlanEndTime, LocalDateTime.now())
                .notIn(BizTask::getStatus, 5, 7)
                .orderByAsc(BizTask::getPlanEndTime);
        return taskMapper.selectList(wrapper);
    }

    @Override
    public Map<String, Object> stats() {
        Map<String, Object> result = new HashMap<>();
        for (int s = 1; s <= 7; s++) {
            LambdaQueryWrapper<BizTask> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(BizTask::getStatus, s);
            result.put("status_" + s, taskMapper.selectCount(wrapper));
        }
        result.put("overdue", overdueTasks().size());
        return result;
    }

    @Override
    public IPage<BizTaskHandover> handoverList(int pageNum, int pageSize, Long customerId, Integer status) {
        LambdaQueryWrapper<BizTaskHandover> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(customerId != null, BizTaskHandover::getCustomerId, customerId)
                .eq(status != null, BizTaskHandover::getStatus, status)
                .orderByDesc(BizTaskHandover::getCreateTime);
        return handoverMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long createHandover(BizTaskHandover handover, List<BizTaskHandoverItem> items) {
        if (!StringUtils.hasText(handover.getHandoverNo())) {
            handover.setHandoverNo("HOV" + System.currentTimeMillis());
        }
        if (handover.getStatus() == null) {
            handover.setStatus(1);
        }
        handoverMapper.insert(handover);
        if (items != null) {
            for (BizTaskHandoverItem item : items) {
                item.setHandoverId(handover.getId());
                if (item.getStatus() == null) {
                    item.setStatus(0);
                }
                handoverItemMapper.insert(item);
            }
        }
        return handover.getId();
    }

    @Override
    public void updateHandoverItem(Long handoverId, BizTaskHandoverItem item) {
        item.setHandoverId(handoverId);
        if (item.getId() == null) {
            handoverItemMapper.insert(item);
        } else {
            handoverItemMapper.updateById(item);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void completeHandover(Long handoverId) {
        BizTaskHandover handover = handoverMapper.selectById(handoverId);
        if (handover == null) {
            throw new BusinessException("交接单不存在");
        }
        LambdaQueryWrapper<BizTaskHandoverItem> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(BizTaskHandoverItem::getHandoverId, handoverId)
                .eq(BizTaskHandoverItem::getStatus, 0);
        Long pending = handoverItemMapper.selectCount(wrapper);
        if (pending != null && pending > 0) {
            throw new BusinessException("仍有未完成的交接子项");
        }
        handover.setStatus(3);
        handover.setCompleteTime(LocalDateTime.now());
        handoverMapper.updateById(handover);
    }
}
