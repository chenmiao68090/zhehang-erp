package com.zhehang.erp.modules.hrm.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.hrm.domain.entity.HrmSalary;
import com.zhehang.erp.modules.hrm.mapper.HrmSalaryMapper;
import com.zhehang.erp.modules.hrm.service.IHrmSalaryService;
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

    @Override
    public IPage<HrmSalary> selectPage(int pageNum, int pageSize, Long employeeId, String salaryMonth, Integer status) {
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
            actual = actual.subtract(salary.getDeduction() != null ? salary.getDeduction() : BigDecimal.ZERO);
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
        BigDecimal income = (salary.getBaseSalary() != null ? salary.getBaseSalary() : BigDecimal.ZERO)
            .add(salary.getPerformanceBonus() != null ? salary.getPerformanceBonus() : BigDecimal.ZERO)
            .add(salary.getOvertimePay() != null ? salary.getOvertimePay() : BigDecimal.ZERO)
            .add(salary.getAllowance() != null ? salary.getAllowance() : BigDecimal.ZERO);
        slip.put("income", income);
        BigDecimal deductions = (salary.getDeduction() != null ? salary.getDeduction() : BigDecimal.ZERO)
            .add(salary.getSocialInsurance() != null ? salary.getSocialInsurance() : BigDecimal.ZERO)
            .add(salary.getHousingFund() != null ? salary.getHousingFund() : BigDecimal.ZERO)
            .add(salary.getTax() != null ? salary.getTax() : BigDecimal.ZERO);
        slip.put("deductions", deductions);
        return slip;
    }
}