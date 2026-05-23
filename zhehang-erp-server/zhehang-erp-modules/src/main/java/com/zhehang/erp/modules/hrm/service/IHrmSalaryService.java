package com.zhehang.erp.modules.hrm.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.zhehang.erp.modules.hrm.domain.entity.HrmSalary;

import java.util.Map;

public interface IHrmSalaryService extends IService<HrmSalary> {
    IPage<HrmSalary> selectPage(int pageNum, int pageSize, Long employeeId, String salaryMonth, Integer status);
    void calculate(String salaryMonth);
    void pay(String salaryMonth);
    Map<String, Object> paySlip(Long id);
}
