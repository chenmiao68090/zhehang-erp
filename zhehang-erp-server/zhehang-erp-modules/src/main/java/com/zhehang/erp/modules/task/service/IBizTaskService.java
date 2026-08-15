package com.zhehang.erp.modules.task.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.zhehang.erp.modules.task.domain.BizTask;
import com.zhehang.erp.modules.task.domain.BizTaskHandover;
import com.zhehang.erp.modules.task.domain.dto.HandoverCreateDTO;
import com.zhehang.erp.modules.task.domain.dto.HandoverItemUpdateDTO;

import java.util.List;
import java.util.Map;

public interface IBizTaskService extends IService<BizTask> {

    /** 任务列表 */
    IPage<BizTask> selectPage(int pageNum, int pageSize, String taskType, Integer status, Long executorId);

    /** 创建任务 */
    Long createTask(BizTask task);

    /** 指派任务 */
    void assign(Long id, Long executorId, String executorName);

    /** 开始执行 */
    void start(Long id, Long operatorId);

    /** 提交完成 */
    void complete(Long id, String result, Long operatorId);

    /** 验收 */
    void review(Long id, boolean pass, String comment, Long reviewerId);

    /** 我的待办 */
    IPage<BizTask> myTasks(int pageNum, int pageSize, Long userId);

    /** 逾期任务 */
    List<BizTask> overdueTasks();

    /** 任务统计 */
    Map<String, Object> stats();

    /** 交接列表 */
    IPage<BizTaskHandover> handoverList(int pageNum, int pageSize, Long customerId, String status, String keyword);

    /** 交接详情 */
    BizTaskHandover handoverDetail(Long handoverId);

    /** 交接看板统计 */
    Map<String, Object> handoverStats();

    /** 创建交接 */
    Long createHandover(HandoverCreateDTO dto);

    /** 接收交接 */
    void acceptHandover(Long handoverId);

    /** 更新交接子项 */
    void updateHandoverItem(Long handoverId, HandoverItemUpdateDTO dto);

    /** 完成交接 */
    void completeHandover(Long handoverId);
}
