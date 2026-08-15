package com.zhehang.erp.modules.hrm.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.hrm.domain.entity.HrmLeaveBalance;
import com.zhehang.erp.modules.hrm.mapper.HrmLeaveBalanceMapper;
import com.zhehang.erp.modules.hrm.service.IHrmLeaveBalanceService;
import com.zhehang.erp.modules.org.domain.entity.OrgEmployee;
import com.zhehang.erp.modules.org.mapper.OrgEmployeeMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HrmLeaveBalanceServiceImpl extends ServiceImpl<HrmLeaveBalanceMapper, HrmLeaveBalance> implements IHrmLeaveBalanceService {

    private final OrgEmployeeMapper orgEmployeeMapper;

    @Override
    public List<HrmLeaveBalance> listAll() {
        return list(new LambdaQueryWrapper<HrmLeaveBalance>()
                .orderByAsc(HrmLeaveBalance::getEmployeeId)
                .orderByAsc(HrmLeaveBalance::getLeaveType));
    }

    @Override
    public List<HrmLeaveBalance> listByEmployee(Long employeeId) {
        if (employeeId == null) {
            return Collections.emptyList();
        }
        return list(new LambdaQueryWrapper<HrmLeaveBalance>()
                .eq(HrmLeaveBalance::getEmployeeId, employeeId)
                .orderByAsc(HrmLeaveBalance::getLeaveType));
    }

    @Override
    public List<HrmLeaveBalance> listByCurrentUser() {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            return Collections.emptyList();
        }
        OrgEmployee emp = orgEmployeeMapper.selectOne(new LambdaQueryWrapper<OrgEmployee>()
                .eq(OrgEmployee::getUserId, userId)
                .orderByDesc(OrgEmployee::getId)
                .last("limit 1"));
        if (emp == null) {
            return Collections.emptyList();
        }
        return listByEmployee(emp.getId());
    }

    @Override
    public void saveBalance(HrmLeaveBalance dto) {
        if (dto.getEmployeeId() == null || !StringUtils.hasText(dto.getLeaveType())) {
            throw new BusinessException("请选择员工与假期类型");
        }
        if (dto.getTotalDays() == null || dto.getTotalDays() < 0) {
            dto.setTotalDays(0.0);
        }
        HrmLeaveBalance existing = getOne(new LambdaQueryWrapper<HrmLeaveBalance>()
                .eq(HrmLeaveBalance::getEmployeeId, dto.getEmployeeId())
                .eq(HrmLeaveBalance::getLeaveType, dto.getLeaveType())
                .last("limit 1"));
        if (existing != null) {
            existing.setTotalDays(dto.getTotalDays());
            existing.setRemark(dto.getRemark());
            updateById(existing);
        } else {
            if (dto.getUsedDays() == null) {
                dto.setUsedDays(0.0);
            }
            save(dto);
        }
    }
}
