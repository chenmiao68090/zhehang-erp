package com.zhehang.erp.modules.im.mapper;

import com.zhehang.erp.modules.im.domain.ImModels;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ImTaskQueryMapper {
    ImModels.WorkTask taskById(@Param("taskId") Long taskId,
                               @Param("tenantId") Long tenantId);

    List<ImModels.WorkTask> tasksByIds(@Param("taskIds") List<Long> taskIds,
                                       @Param("tenantId") Long tenantId);

    List<ImModels.WorkTask> listTasks(@Param("userId") Long userId,
                                      @Param("tenantId") Long tenantId,
                                      @Param("scope") String scope,
                                      @Param("state") String state,
                                      @Param("deptIds") List<Long> deptIds,
                                      @Param("cursorTime") LocalDateTime cursorTime,
                                      @Param("cursorTaskId") Long cursorTaskId,
                                      @Param("limit") int limit);

    List<ImModels.TaskParticipant> participantsByTaskIds(@Param("taskIds") List<Long> taskIds,
                                                         @Param("tenantId") Long tenantId);

    List<ImModels.TaskTimeline> timeline(@Param("taskId") Long taskId,
                                         @Param("tenantId") Long tenantId);

    List<ImModels.Attachment> taskAttachments(@Param("taskId") Long taskId,
                                              @Param("tenantId") Long tenantId);

    ImModels.TaskStats taskStats(@Param("userId") Long userId,
                                 @Param("tenantId") Long tenantId,
                                 @Param("scope") String scope,
                                 @Param("deptIds") List<Long> deptIds);

    List<Long> departmentManagerIds(@Param("deptId") Long deptId,
                                    @Param("tenantId") Long tenantId);

    /** 查询租户内有效角色成员；普通角色支持模板克隆，特权角色只认原始 key。 */
    List<Long> activeUserIdsByRoleKeys(@Param("roleKeys") List<String> roleKeys,
                                       @Param("tenantId") Long tenantId);

    int syncSentReminderStatus();

    int syncFailedReminderStatus();
}
