package com.zhehang.erp.modules.hrm.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.hrm.domain.entity.HrmSalary;
import com.zhehang.erp.modules.hrm.mapper.HrmSalaryMapper;
import com.zhehang.erp.modules.hrm.service.IHrmSalaryService;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class HrmSalaryServiceImpl extends ServiceImpl<HrmSalaryMapper, HrmSalary> implements IHrmSalaryService {

    private final HrmSalaryMapper salaryMapper;
    private final DataScopeHelper dataScopeHelper;

    @Override
    public IPage<HrmSalary> selectPage(int pageNum, int pageSize, Long employeeId, String salaryMonth, Integer status) {
        // 数据范围:HR/管理员看全部;其余员工只看自己的工资条(经 org_employee 映射当前用户)
        if (!dataScopeHelper.isHrOrAdmin()) {
            Long myEmp = dataScopeHelper.currentEmployeeId();
            employeeId = (myEmp != null ? myEmp : -1L); // 无员工档案映射→看不到(失败收紧)
        }
        LambdaQueryWrapper<HrmSalary> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(employeeId != null, HrmSalary::getEmployeeId, employeeId)
               .eq(StringUtils.hasText(salaryMonth), HrmSalary::getSalaryMonth, salaryMonth)
               .eq(status != null, HrmSalary::getStatus, status)
               .orderByDesc(HrmSalary::getSalaryMonth);
        return salaryMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
    }

    @Override
    public void calculate(String salaryMonth) {
        LambdaQueryWrapper<HrmSalary> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(HrmSalary::getSalaryMonth, salaryMonth).eq(HrmSalary::getStatus, 0);
        List<HrmSalary> list = salaryMapper.selectList(wrapper);
        for (HrmSalary salary : list) {
            BigDecimal actual = BigDecimal.ZERO;
            actual = actual.add(salary.getBaseSalary() != null ? salary.getBaseSalary() : BigDecimal.ZERO);
            actual = actual.add(salary.getPerformanceBonus() != null ? salary.getPerformanceBonus() : BigDecimal.ZERO);
            actual = actual.add(salary.getOvertimePay() != null ? salary.getOvertimePay() : BigDecimal.ZERO);
            actual = actual.add(salary.getAllowance() != null ? salary.getAllowance() : BigDecimal.ZERO);
            // 奖惩细分(新增,默认0不影响存量):补发+提成+其他奖金 加;考勤扣款+其他扣款 减
            actual = actual.add(salary.getBackpay() != null ? salary.getBackpay() : BigDecimal.ZERO);
            actual = actual.add(salary.getCommission() != null ? salary.getCommission() : BigDecimal.ZERO);
            actual = actual.add(salary.getOtherBonus() != null ? salary.getOtherBonus() : BigDecimal.ZERO);
            actual = actual.subtract(salary.getDeduction() != null ? salary.getDeduction() : BigDecimal.ZERO);
            actual = actual.subtract(salary.getAttendDeduction() != null ? salary.getAttendDeduction() : BigDecimal.ZERO);
            actual = actual.subtract(salary.getOtherDeduction() != null ? salary.getOtherDeduction() : BigDecimal.ZERO);
            actual = actual.subtract(salary.getSocialInsurance() != null ? salary.getSocialInsurance() : BigDecimal.ZERO);
            actual = actual.subtract(salary.getHousingFund() != null ? salary.getHousingFund() : BigDecimal.ZERO);
            actual = actual.subtract(salary.getTax() != null ? salary.getTax() : BigDecimal.ZERO);
            salary.setActualSalary(actual);
            salary.setStatus(1);
            salaryMapper.updateById(salary);
        }
    }

    @Override
    public void pay(String salaryMonth) {
        LambdaQueryWrapper<HrmSalary> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(HrmSalary::getSalaryMonth, salaryMonth).eq(HrmSalary::getStatus, 1);
        List<HrmSalary> list = salaryMapper.selectList(wrapper);
        for (HrmSalary salary : list) {
            salary.setStatus(2);
            salaryMapper.updateById(salary);
        }
    }

    @Override
    public Map<String, Object> paySlip(Long id) {
        HrmSalary salary = salaryMapper.selectById(id);
        if (salary == null) {
            throw new BusinessException("薪资记录不存在");
        }
        Map<String, Object> slip = new HashMap<>();
        slip.put("salary", salary);
        // 应发(含V77奖惩:补发/提成/其他奖金),与 calculate() 口径一致,否则工资条小计≠实发
        BigDecimal income = (salary.getBaseSalary() != null ? salary.getBaseSalary() : BigDecimal.ZERO)
            .add(salary.getPerformanceBonus() != null ? salary.getPerformanceBonus() : BigDecimal.ZERO)
            .add(salary.getOvertimePay() != null ? salary.getOvertimePay() : BigDecimal.ZERO)
            .add(salary.getAllowance() != null ? salary.getAllowance() : BigDecimal.ZERO)
            .add(salary.getBackpay() != null ? salary.getBackpay() : BigDecimal.ZERO)
            .add(salary.getCommission() != null ? salary.getCommission() : BigDecimal.ZERO)
            .add(salary.getOtherBonus() != null ? salary.getOtherBonus() : BigDecimal.ZERO);
        slip.put("income", income);
        // 应扣(含V77:考勤扣款/其他扣款)
        BigDecimal deductions = (salary.getDeduction() != null ? salary.getDeduction() : BigDecimal.ZERO)
            .add(salary.getAttendDeduction() != null ? salary.getAttendDeduction() : BigDecimal.ZERO)
            .add(salary.getOtherDeduction() != null ? salary.getOtherDeduction() : BigDecimal.ZERO)
            .add(salary.getSocialInsurance() != null ? salary.getSocialInsurance() : BigDecimal.ZERO)
            .add(salary.getHousingFund() != null ? salary.getHousingFund() : BigDecimal.ZERO)
            .add(salary.getTax() != null ? salary.getTax() : BigDecimal.ZERO);
        slip.put("deductions", deductions);
        return slip;
    }
}