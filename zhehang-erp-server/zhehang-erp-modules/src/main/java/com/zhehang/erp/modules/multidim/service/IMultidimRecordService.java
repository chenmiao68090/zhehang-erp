package com.zhehang.erp.modules.multidim.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.zhehang.erp.modules.multidim.domain.dto.RecordQueryDTO;
import com.zhehang.erp.modules.multidim.domain.entity.MultidimRecord;

import java.util.List;

public interface IMultidimRecordService extends IService<MultidimRecord> {
    IPage<MultidimRecord> queryRecords(RecordQueryDTO query);
    void batchDelete(List<Long> ids);
}
