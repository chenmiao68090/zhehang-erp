package com.zhehang.erp.modules.hrm.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.hrm.domain.entity.HrmLeave;
import com.zhehang.erp.modules.hrm.mapper.HrmLeaveMapper;
import com.zhehang.erp.modules.hrm.service.IHrmLeaveService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class HrmLeaveServiceImpl extends ServiceImpl<HrmLeaveMapper, HrmLeave> implements IHrmLeaveService {

    private final HrmLeaveMapper leaveMapper;

    @Override
    public IPage<HrmLeave> selectPage(int pageNum, int pageSize, Long employeeId, Integer leaveType, Integer status) {
        LambdaQueryWrapper<HrmLeave> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(employeeId != null, HrmLeave::getEmployeeId, employeeId)
               .eq(leaveType != null, HrmLeave::getLeaveType, leaveType)
               .eq(status != null, HrmLeave::getStatus, status)
               .orderByDesc(HrmLeave::getCreateTime);
        return leaveMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
    }

    @Override
    public void approve(Long id, Long approverId, boolean approved) {
        HrmLeave leave = leaveMapper.selectById(id);
        if (leave == null) {
            throw new BusinessException("请假记录不存在");
        }
        if (leave.getStatus() != 0) {
            throw new BusinessException("该申请已处理");
        }
        leave.setApproverId(approverId);
        leave.setStatus(approved ? 1 : 2);
        leaveMapper.updateById(leave);
    }
}