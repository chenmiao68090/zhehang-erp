package com.zhehang.erp.modules.multidim.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.modules.multidim.domain.dto.RecordQueryDTO;
import com.zhehang.erp.modules.multidim.domain.entity.MultidimRecord;
import com.zhehang.erp.modules.multidim.mapper.MultidimRecordMapper;
import com.zhehang.erp.modules.multidim.service.IMultidimRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MultidimRecordServiceImpl extends ServiceImpl<MultidimRecordMapper, MultidimRecord> implements IMultidimRecordService {

    private final MultidimRecordMapper recordMapper;

    @Override
    public IPage<MultidimRecord> queryRecords(RecordQueryDTO query) {
        LambdaQueryWrapper<MultidimRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MultidimRecord::getTableId, query.getTableId());
        if (StringUtils.hasText(query.getKeyword())) {
            wrapper.like(MultidimRecord::getData, query.getKeyword());
        }
        wrapper.orderByDesc(MultidimRecord::getCreateTime);
        return recordMapper.selectPage(
            new Page<>(query.getPageNum(), query.getPageSize()), wrapper);
    }

    @Override
    public void batchDelete(List<Long> ids) {
        if (ids != null && !ids.isEmpty()) {
            recordMapper.deleteBatchIds(ids);
        }
    }
}
