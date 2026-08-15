package com.zhehang.erp.modules.task.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.zhehang.erp.modules.task.domain.BizTaskProgressReport;

import java.util.List;

public interface IBizTaskProgressReportService extends IService<BizTaskProgressReport> {
    /** 查询任务汇报 */
    List<BizTaskProgressReport> listByTaskId(Long taskId);

    /** 新增任务汇报 */
    BizTaskProgressReport addReport(Long taskId, String content);
}
