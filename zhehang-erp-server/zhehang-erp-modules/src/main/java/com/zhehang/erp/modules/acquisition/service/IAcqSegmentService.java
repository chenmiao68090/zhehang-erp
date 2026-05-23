package com.zhehang.erp.modules.acquisition.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.zhehang.erp.modules.acquisition.domain.entity.AcqSegment;

import java.util.List;

public interface IAcqSegmentService extends IService<AcqSegment> {

    /**
     * 列出所有启用客群
     */
    List<AcqSegment> listSegments();
}
