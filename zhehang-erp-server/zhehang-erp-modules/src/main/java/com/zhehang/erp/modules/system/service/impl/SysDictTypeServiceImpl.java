package com.zhehang.erp.modules.system.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.system.domain.entity.SysDictData;
import com.zhehang.erp.modules.system.domain.entity.SysDictType;
import com.zhehang.erp.modules.system.mapper.SysDictDataMapper;
import com.zhehang.erp.modules.system.mapper.SysDictTypeMapper;
import com.zhehang.erp.modules.system.service.ISysDictTypeService;
import com.zhehang.erp.modules.system.service.SettingsGovernanceCatalog;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class SysDictTypeServiceImpl extends ServiceImpl<SysDictTypeMapper, SysDictType>
        implements ISysDictTypeService {

    private final SysDictDataMapper dictDataMapper;
    private final SettingsGovernanceCatalog governanceCatalog;

    @Override
    public IPage<SysDictType> selectPage(int pageNum, int pageSize, String dictName, String dictType, Integer status) {
        LambdaQueryWrapper<SysDictType> wrapper = new LambdaQueryWrapper<>();
        wrapper.like(StringUtils.hasText(dictName), SysDictType::getDictName, dictName)
               .like(StringUtils.hasText(dictType), SysDictType::getDictType, dictType)
               .eq(status != null, SysDictType::getStatus, status)
               .orderByAsc(SysDictType::getDictType);
        return this.baseMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
    }

    @Override
    public void addType(SysDictType type) {
        validateType(type);
        type.setDictType(type.getDictType().trim());
        type.setDictName(type.getDictName().trim());
        if (!StringUtils.hasText(type.getDictType())) {
            throw new BusinessException("字典类型编码不能为空");
        }
        if (existsCode(type.getDictType(), null)) {
            throw new BusinessException("字典类型编码已存在:" + type.getDictType());
        }
        if (!governanceCatalog.isWritableDictionary(type.getDictType())) {
            throw new BusinessException(400, "该字段尚未完成真实消费方登记，不能创建无效字典");
        }
        if (type.getStatus() == null) {
            type.setStatus(0);
        }
        clearClientControlledBaseFields(type);
        type.setId(null);
        this.save(type);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateType(SysDictType type) {
        if (type == null || type.getId() == null) {
            throw new BusinessException(400, "字段类型ID不能为空");
        }
        SysDictType old = this.getById(type.getId());
        if (old == null) {
            throw new BusinessException("字典类型不存在");
        }
        if (!governanceCatalog.isWritableDictionary(old.getDictType())) {
            throw new BusinessException(400, "该字段不是已接入的可维护目录，只能在真实业务来源中调整");
        }
        if (StringUtils.hasText(type.getDictType()) && existsCode(type.getDictType(), type.getId())) {
            throw new BusinessException("字典类型编码已存在:" + type.getDictType());
        }
        if (StringUtils.hasText(type.getDictType()) && !type.getDictType().equals(old.getDictType())) {
            throw new BusinessException(400, "字段类型编码是历史数据契约，不能修改");
        }
        if (!StringUtils.hasText(type.getDictName())) {
            throw new BusinessException(400, "字段名称不能为空");
        }
        if (type.getDictName().trim().length() > 100) {
            throw new BusinessException(400, "字段名称不能超过100个字符");
        }
        validateRemark(type.getRemark());
        validateStatus(type.getStatus());
        type.setDictType(old.getDictType());
        type.setDictName(type.getDictName().trim());
        clearClientControlledBaseFields(type);
        this.updateById(type);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void removeTypeCascade(Long id) {
        SysDictType type = this.getById(id);
        if (type == null) {
            return;
        }
        if (governanceCatalog.isBoundDictionary(type.getDictType())) {
            throw new BusinessException(400, "该字段已被业务页面登记使用，请停用类型，不能删除");
        }
        if (dictDataMapper.selectCount(new LambdaQueryWrapper<SysDictData>()
                .eq(SysDictData::getDictType, type.getDictType())) > 0) {
            throw new BusinessException(400, "该类型仍有选项，请先完成影响审计，不能级联删除");
        }
        this.removeById(id);
    }

    /** 编码是否已被其他记录占用(excludeId 为空表示新增校验) */
    private boolean existsCode(String dictType, Long excludeId) {
        return this.baseMapper.selectCount(new LambdaQueryWrapper<SysDictType>()
                .eq(SysDictType::getDictType, dictType)
                .ne(excludeId != null, SysDictType::getId, excludeId)) > 0;
    }

    private void validateType(SysDictType type) {
        if (type == null || !StringUtils.hasText(type.getDictType())) {
            throw new BusinessException(400, "字典类型编码不能为空");
        }
        if (!StringUtils.hasText(type.getDictName())) {
            throw new BusinessException(400, "字段名称不能为空");
        }
        if (type.getDictType().trim().length() > 100 || type.getDictName().trim().length() > 100) {
            throw new BusinessException(400, "字段名称和类型编码不能超过100个字符");
        }
        validateRemark(type.getRemark());
        validateStatus(type.getStatus());
    }

    private void validateRemark(String remark) {
        if (remark != null && remark.length() > 255) {
            throw new BusinessException(400, "备注不能超过255个字符");
        }
    }

    private void validateStatus(Integer status) {
        if (status != null && status != 0 && status != 1) {
            throw new BusinessException(400, "字段类型状态只能是启用或停用");
        }
    }

    private void clearClientControlledBaseFields(SysDictType type) {
        type.setTenantId(null);
        type.setDeleted(null);
        type.setCreateTime(null);
        type.setUpdateTime(null);
        type.setCreateBy(null);
        type.setUpdateBy(null);
    }
}
