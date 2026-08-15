package com.zhehang.erp.modules.hrm.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.zhehang.erp.modules.hrm.domain.entity.HrmLeaveBalance;

import java.util.List;

public interface IHrmLeaveBalanceService extends IService<HrmLeaveBalance> {
    /** 全部额度 */
    List<HrmLeaveBalance> listAll();

    /** 某员工的额度 */
    List<HrmLeaveBalance> listByEmployee(Long employeeId);

    /** 当前登录人的额度 */
    List<HrmLeaveBalance> listByCurrentUser();

    /** 新增/修改额度(按 员工+假期类型 upsert,保留已用天数) */
    void saveBalance(HrmLeaveBalance dto);
}
