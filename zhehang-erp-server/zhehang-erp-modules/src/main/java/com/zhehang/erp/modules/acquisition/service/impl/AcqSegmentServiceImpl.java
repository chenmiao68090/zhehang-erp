package com.zhehang.erp.modules.acquisition.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.modules.acquisition.domain.entity.AcqSegment;
import com.zhehang.erp.modules.acquisition.mapper.AcqSegmentMapper;
import com.zhehang.erp.modules.acquisition.service.IAcqSegmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AcqSegmentServiceImpl extends ServiceImpl<AcqSegmentMapper, AcqSegment> implements IAcqSegmentService {

    @Override
    public List<AcqSegment> listSegments() {
        LambdaQueryWrapper<AcqSegment> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(AcqSegment::getStatus, 1)
                .orderByAsc(AcqSegment::getSortOrder);
        return list(wrapper);
    }
}
