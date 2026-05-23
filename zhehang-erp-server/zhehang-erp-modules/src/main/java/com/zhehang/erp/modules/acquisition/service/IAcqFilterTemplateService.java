package com.zhehang.erp.modules.acquisition.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.zhehang.erp.modules.acquisition.domain.entity.AcqFilterTemplate;

import java.util.List;

public interface IAcqFilterTemplateService extends IService<AcqFilterTemplate> {

    /**
     * 查询用户的筛选模板列表
     */
    List<AcqFilterTemplate> listByUser(Long userId);

    /**
     * 保存筛选模板
     */
    void saveTemplate(AcqFilterTemplate template);
}
