package com.zhehang.erp.modules.hrm.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.hrm.domain.entity.HrmTraining;
import com.zhehang.erp.modules.hrm.mapper.HrmTrainingMapper;
import com.zhehang.erp.modules.hrm.service.IHrmTrainingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class HrmTrainingServiceImpl extends ServiceImpl<HrmTrainingMapper, HrmTraining> implements IHrmTrainingService {

    private final HrmTrainingMapper trainingMapper;

    @Override
    public IPage<HrmTraining> selectPage(int pageNum, int pageSize, String title, Integer status) {
        LambdaQueryWrapper<HrmTraining> wrapper = new LambdaQueryWrapper<>();
        wrapper.like(StringUtils.hasText(title), HrmTraining::getTitle, title)
               .eq(status != null, HrmTraining::getStatus, status)
               .orderByDesc(HrmTraining::getCreateTime);
        return trainingMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
    }

    @Override
    public void enroll(Long trainingId, Long employeeId) {
        HrmTraining training = trainingMapper.selectById(trainingId);
        if (training == null) {
            throw new BusinessException("培训不存在");
        }
        if (training.getStatus() != 1) {
            throw new BusinessException("该培训未开放报名");
        }
    }
}