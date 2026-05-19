package com.zhehang.erp.modules.multidim.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.multidim.domain.dto.FieldDef;
import com.zhehang.erp.modules.multidim.domain.dto.ViewDef;
import com.zhehang.erp.modules.multidim.domain.entity.MultidimTable;
import com.zhehang.erp.modules.multidim.domain.entity.MultidimTemplate;
import com.zhehang.erp.modules.multidim.mapper.MultidimTableMapper;
import com.zhehang.erp.modules.multidim.mapper.MultidimTemplateMapper;
import com.zhehang.erp.modules.multidim.service.IMultidimTableService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MultidimTableServiceImpl extends ServiceImpl<MultidimTableMapper, MultidimTable> implements IMultidimTableService {

    private final MultidimTableMapper tableMapper;
    private final MultidimTemplateMapper templateMapper;
    private final ObjectMapper objectMapper;

    @Override
    public IPage<MultidimTable> selectPage(int pageNum, int pageSize, String name, String category) {
        LambdaQueryWrapper<MultidimTable> wrapper = new LambdaQueryWrapper<>();
        wrapper.like(StringUtils.hasText(name), MultidimTable::getName, name)
               .eq(StringUtils.hasText(category), MultidimTable::getCategory, category)
               .orderByDesc(MultidimTable::getUpdateTime);
        return tableMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
    }

    @Override
    public MultidimTable createFromTemplate(Long templateId, String name) {
        MultidimTemplate tpl = templateMapper.selectById(templateId);
        if (tpl == null) {
            throw new BusinessException("模板不存在");
        }
        MultidimTable table = new MultidimTable();
        table.setName(StringUtils.hasText(name) ? name : tpl.getName());
        table.setDescription(tpl.getDescription());
        table.setIcon(tpl.getIcon());
        table.setCategory(tpl.getCategory());
        table.setFieldSchema(tpl.getFieldSchema());
        table.setViewConfig(tpl.getViewConfig());
        table.setTemplateId(templateId);
        tableMapper.insert(table);
        return table;
    }

    @Override
    public MultidimTable copyTable(Long id) {
        MultidimTable src = tableMapper.selectById(id);
        if (src == null) {
            throw new BusinessException("表格不存在");
        }
        MultidimTable copy = new MultidimTable();
        copy.setName(src.getName() + " (副本)");
        copy.setDescription(src.getDescription());
        copy.setIcon(src.getIcon());
        copy.setCategory(src.getCategory());
        copy.setFieldSchema(src.getFieldSchema());
        copy.setViewConfig(src.getViewConfig());
        copy.setTemplateId(src.getTemplateId());
        tableMapper.insert(copy);
        return copy;
    }

    @Override
    public void addField(Long tableId, FieldDef field) {
        MultidimTable table = getTableOrThrow(tableId);
        List<FieldDef> fields = parseFields(table.getFieldSchema());
        if (field.getId() == null || field.getId().isEmpty()) {
            field.setId("f" + UUID.randomUUID().toString().replace("-", "").substring(0, 8));
        }
        fields.add(field);
        table.setFieldSchema(toJson(fields));
        tableMapper.updateById(table);
    }

    @Override
    public void updateField(Long tableId, FieldDef field) {
        MultidimTable table = getTableOrThrow(tableId);
        List<FieldDef> fields = parseFields(table.getFieldSchema());
        fields.removeIf(f -> f.getId().equals(field.getId()));
        fields.add(field);
        table.setFieldSchema(toJson(fields));
        tableMapper.updateById(table);
    }

    @Override
    public void deleteField(Long tableId, String fieldId) {
        MultidimTable table = getTableOrThrow(tableId);
        List<FieldDef> fields = parseFields(table.getFieldSchema());
        fields.removeIf(f -> f.getId().equals(fieldId));
        table.setFieldSchema(toJson(fields));
        tableMapper.updateById(table);
    }

    @Override
    public void addView(Long tableId, ViewDef view) {
        MultidimTable table = getTableOrThrow(tableId);
        List<ViewDef> views = parseViews(table.getViewConfig());
        if (view.getId() == null || view.getId().isEmpty()) {
            view.setId("v" + UUID.randomUUID().toString().replace("-", "").substring(0, 8));
        }
        views.add(view);
        table.setViewConfig(toJson(views));
        tableMapper.updateById(table);
    }

    @Override
    public void updateView(Long tableId, ViewDef view) {
        MultidimTable table = getTableOrThrow(tableId);
        List<ViewDef> views = parseViews(table.getViewConfig());
        views.removeIf(v -> v.getId().equals(view.getId()));
        views.add(view);
        table.setViewConfig(toJson(views));
        tableMapper.updateById(table);
    }

    @Override
    public void deleteView(Long tableId, String viewId) {
        MultidimTable table = getTableOrThrow(tableId);
        List<ViewDef> views = parseViews(table.getViewConfig());
        views.removeIf(v -> v.getId().equals(viewId));
        table.setViewConfig(toJson(views));
        tableMapper.updateById(table);
    }

    private MultidimTable getTableOrThrow(Long tableId) {
        MultidimTable table = tableMapper.selectById(tableId);
        if (table == null) throw new BusinessException("表格不存在");
        return table;
    }

    private List<FieldDef> parseFields(String json) {
        if (!StringUtils.hasText(json)) return new ArrayList<>();
        try {
            return objectMapper.readValue(json, new TypeReference<List<FieldDef>>() {});
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    private List<ViewDef> parseViews(String json) {
        if (!StringUtils.hasText(json)) return new ArrayList<>();
        try {
            return objectMapper.readValue(json, new TypeReference<List<ViewDef>>() {});
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    private String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            throw new BusinessException("JSON序列化失败");
        }
    }
}
