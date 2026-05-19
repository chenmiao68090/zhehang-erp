package com.zhehang.erp.modules.multidim.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.zhehang.erp.modules.multidim.domain.dto.FieldDef;
import com.zhehang.erp.modules.multidim.domain.dto.ViewDef;
import com.zhehang.erp.modules.multidim.domain.entity.MultidimTable;

public interface IMultidimTableService extends IService<MultidimTable> {
    IPage<MultidimTable> selectPage(int pageNum, int pageSize, String name, String category);
    MultidimTable createFromTemplate(Long templateId, String name);
    MultidimTable copyTable(Long id);
    void addField(Long tableId, FieldDef field);
    void updateField(Long tableId, FieldDef field);
    void deleteField(Long tableId, String fieldId);
    void addView(Long tableId, ViewDef view);
    void updateView(Long tableId, ViewDef view);
    void deleteView(Long tableId, String viewId);
}
