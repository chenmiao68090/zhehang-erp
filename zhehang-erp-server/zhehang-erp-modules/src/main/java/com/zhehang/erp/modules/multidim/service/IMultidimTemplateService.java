package com.zhehang.erp.modules.multidim.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.zhehang.erp.modules.multidim.domain.entity.MultidimTemplate;

import java.util.List;

public interface IMultidimTemplateService extends IService<MultidimTemplate> {
    List<MultidimTemplate> listByCategory(String category);
}
