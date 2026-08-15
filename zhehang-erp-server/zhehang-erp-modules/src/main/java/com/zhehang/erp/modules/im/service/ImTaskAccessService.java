package com.zhehang.erp.modules.im.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.im.domain.ImEntities;
import com.zhehang.erp.modules.im.mapper.ImTaskDetailMapper;
import com.zhehang.erp.modules.im.mapper.ImTaskParticipantMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

/** 待办详情、操作和凭证下载共用同一套后端范围校验。 */
@Service
@RequiredArgsConstructor
public class ImTaskAccessService {
    private final ImAccessService imAccess;
    private final ImTaskDetailMapper detailMapper;
    private final ImTaskParticipantMapper participantMapper;
    private final DataScopeHelper dataScopeHelper;

    public ImEntities.TaskDetail requireView(Long taskId) {
        ImEntities.TaskDetail detail = requireTask(taskId);
        Long userId = imAccess.currentUserId();
        if (isBoss()
                || Objects.equals(detail.getCreatorId(), userId)
                || Objects.equals(detail.getReviewerId(), userId)
                || isParticipant(taskId, userId)
                || isDepartmentManager(detail.getDeptId())) {
            return detail;
        }
        throw new BusinessException("无权查看该待办");
    }

    public ImEntities.TaskDetail requireResponsible(Long taskId) {
        ImEntities.TaskDetail detail = requireTask(taskId);
        Long userId = imAccess.currentUserId();
        long count = participantMapper.selectCount(new LambdaQueryWrapper<ImEntities.TaskParticipant>()
                .eq(ImEntities.TaskParticipant::getTaskId, taskId)
                .eq(ImEntities.TaskParticipant::getUserId, userId)
                .eq(ImEntities.TaskParticipant::getParticipantRole, "responsible"));
        if (count == 0) throw new BusinessException("只有待办责任人可以执行该操作");
        return detail;
    }

    public ImEntities.TaskDetail requireReviewer(Long taskId) {
        ImEntities.TaskDetail detail = requireTask(taskId);
        Long userId = imAccess.currentUserId();
        if (isBoss() || Objects.equals(detail.getReviewerId(), userId) || isDepartmentManager(detail.getDeptId())) {
            return detail;
        }
        throw new BusinessException("只有创建人、验收人或本部门主管可以验收");
    }

    public ImEntities.TaskDetail requireCanceller(Long taskId) {
        ImEntities.TaskDetail detail = requireTask(taskId);
        Long userId = imAccess.currentUserId();
        if (isBoss() || Objects.equals(detail.getCreatorId(), userId) || isDepartmentManager(detail.getDeptId())) {
            return detail;
        }
        throw new BusinessException("只有创建人、主管或老板可以取消待办");
    }

    public boolean isParticipant(Long taskId, Long userId) {
        if (taskId == null || userId == null) return false;
        return participantMapper.selectCount(new LambdaQueryWrapper<ImEntities.TaskParticipant>()
                .eq(ImEntities.TaskParticipant::getTaskId, taskId)
                .eq(ImEntities.TaskParticipant::getUserId, userId)) > 0;
    }

    public boolean isResponsible(Long taskId, Long userId) {
        if (taskId == null || userId == null) return false;
        return participantMapper.selectCount(new LambdaQueryWrapper<ImEntities.TaskParticipant>()
                .eq(ImEntities.TaskParticipant::getTaskId, taskId)
                .eq(ImEntities.TaskParticipant::getUserId, userId)
                .eq(ImEntities.TaskParticipant::getParticipantRole, "responsible")) > 0;
    }

    public boolean isBoss() {
        return SecurityUtils.isCurrentAdmin() || SecurityUtils.hasAnyRole("boss", "super_admin");
    }

    public boolean isDepartmentManager(Long taskDeptId) {
        if (taskDeptId == null || !SecurityUtils.hasAnyRole("dept_manager", "manager")) return false;
        Long myDeptId = SecurityUtils.getCurrentDeptId();
        if (myDeptId == null) return false;
        Integer scope = SecurityUtils.getCurrentDataScope();
        if (scope != null && scope == 3) return Objects.equals(myDeptId, taskDeptId);
        return dataScopeHelper.deptSelfAndChildren(myDeptId).contains(taskDeptId);
    }

    public List<Long> departmentScopeIds() {
        if (!SecurityUtils.hasAnyRole("dept_manager", "manager")) {
            throw new BusinessException("无权查看部门待办");
        }
        Long deptId = SecurityUtils.getCurrentDeptId();
        if (deptId == null) throw new BusinessException("当前账号未关联部门");
        Integer scope = SecurityUtils.getCurrentDataScope();
        return scope != null && scope == 3 ? List.of(deptId) : dataScopeHelper.deptSelfAndChildren(deptId);
    }

    private ImEntities.TaskDetail requireTask(Long taskId) {
        if (taskId == null) throw new BusinessException("待办不能为空");
        ImEntities.TaskDetail detail = detailMapper.selectOne(new LambdaQueryWrapper<ImEntities.TaskDetail>()
                .eq(ImEntities.TaskDetail::getTaskId, taskId)
                .last("LIMIT 1"));
        if (detail == null) throw new BusinessException("待办不存在");
        return detail;
    }
}
