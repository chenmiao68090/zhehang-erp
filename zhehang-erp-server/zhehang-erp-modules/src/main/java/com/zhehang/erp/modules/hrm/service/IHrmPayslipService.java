package com.zhehang.erp.modules.hrm.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.zhehang.erp.modules.hrm.domain.entity.HrmPayslip;

import java.util.List;
import java.util.Map;

/**
 * 薪酬核算·工资条 service。
 */
public interface IHrmPayslipService extends IService<HrmPayslip> {

    /** HR 端分页 + 各状态计数(全部/待确认/已确认/有异议)。返回 {page, counts}。 */
    Map<String, Object> hrPage(int pageNum, int pageSize, String payMonth, Long employeeId,
                               String deptName, Integer confirmStatus);

    /** 批量落库(前端把 Excel 解析成数组传来,后端只管新增)。返回成功条数。 */
    int batchSave(List<HrmPayslip> list);

    /** 发放:把指定条(ids)或某月(payMonth)confirm_status 从 0 改为 1「已发放待确认」,并通知员工。返回发放条数。 */
    int distribute(List<Long> ids, String payMonth);

    /** 员工自助:当前登录用户按 employee_id 查自己的工资条列表。 */
    List<HrmPayslip> myList(String payMonth);

    /** 员工确认(只能确认自己的,状态须为1已发放待确认)。 */
    void confirm(Long id);

    /** 员工异常反馈(只能反馈自己的,带内容)。 */
    void feedback(Long id, String content);
}
