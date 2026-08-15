package com.zhehang.erp.modules.system.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.system.domain.entity.SysDictData;
import com.zhehang.erp.modules.system.domain.entity.SysDictType;
import com.zhehang.erp.modules.system.mapper.SysDictDataMapper;
import com.zhehang.erp.modules.system.mapper.SysDictTypeMapper;
import com.zhehang.erp.modules.system.service.ISysDictDataService;
import com.zhehang.erp.modules.system.service.SettingsGovernanceCatalog;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.BadSqlGrammarException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class SysDictDataServiceImpl extends ServiceImpl<SysDictDataMapper, SysDictData>
        implements ISysDictDataService {

    private final SysDictTypeMapper dictTypeMapper;
    private final SettingsGovernanceCatalog governanceCatalog;

    @Override
    public List<SysDictData> listByType(String dictType) {
        return this.list(new LambdaQueryWrapper<SysDictData>()
                .eq(SysDictData::getDictType, dictType)
                .orderByAsc(SysDictData::getDictSort)
                .orderByAsc(SysDictData::getId));
    }

    @Override
    public List<SysDictData> listEnabledByType(String dictType) {
        try {
            return this.list(new LambdaQueryWrapper<SysDictData>()
                    .eq(SysDictData::getDictType, dictType)
                    .eq(SysDictData::getStatus, 0)
                    .orderByAsc(SysDictData::getDictSort)
                    .orderByAsc(SysDictData::getId));
        } catch (BadSqlGrammarException ex) {
            if (ex.getSQLException() == null || ex.getSQLException().getErrorCode() != 1146) {
                throw ex;
            }
            log.warn("字典项表尚未建立，启用项接口返回空列表: dictType={}", dictType);
            return List.of();
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void addData(SysDictData data) {
        validateBasic(data);
        validateMutableValues(data);
        ensureGovernedType(data.getDictType());
        data.setDictType(data.getDictType().trim());
        data.setDictLabel(data.getDictLabel().trim());
        data.setDictValue(data.getDictValue().trim());
        if (existsValue(data.getDictType(), data.getDictValue(), null)) {
            throw new BusinessException(400, "该字段的存储值已存在");
        }
        if (data.getDictSort() == null) {
            data.setDictSort(0);
        }
        if (data.getIsDefault() == null) {
            data.setIsDefault(0);
        }
        if (data.getStatus() == null) {
            data.setStatus(0);
        }
        if (data.getIsDefault() == 1) {
            clearOtherDefaults(data.getDictType(), null);
        }
        clearClientControlledBaseFields(data);
        data.setId(null);
        this.save(data);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateData(SysDictData data) {
        if (data.getId() == null) {
            throw new BusinessException(400, "选项ID不能为空");
        }
        SysDictData old = this.getById(data.getId());
        if (old == null) {
            throw new BusinessException(404, "字段选项不存在");
        }
        ensureGovernedType(old.getDictType());
        if (StringUtils.hasText(data.getDictType()) && !old.getDictType().equals(data.getDictType())) {
            throw new BusinessException(400, "选项不能移动到其他字段");
        }
        if (StringUtils.hasText(data.getDictValue()) && !old.getDictValue().equals(data.getDictValue())) {
            throw new BusinessException(400, "存储值已进入历史数据契约，不能修改；请新增选项并停用旧项");
        }
        if (!StringUtils.hasText(data.getDictLabel())) {
            throw new BusinessException(400, "展示名称不能为空");
        }
        if (data.getDictLabel().trim().length() > 100) {
            throw new BusinessException(400, "展示名称不能超过100个字符");
        }
        validateMutableValues(data);
        data.setDictType(old.getDictType());
        data.setDictValue(old.getDictValue());
        data.setDictLabel(data.getDictLabel().trim());
        clearClientControlledBaseFields(data);
        if (data.getIsDefault() != null && data.getIsDefault() == 1) {
            clearOtherDefaults(old.getDictType(), old.getId());
        }
        this.updateById(data);
    }

    @Override
    public void removeDataSafely(Long id) {
        SysDictData old = this.getById(id);
        if (old == null) {
            return;
        }
        if (governanceCatalog.isBoundDictionary(old.getDictType())) {
            throw new BusinessException(400, "该选项所属字段已被业务使用，请改为停用，历史数据仍需回显");
        }
        this.removeById(id);
    }

    private void validateBasic(SysDictData data) {
        if (data == null || !StringUtils.hasText(data.getDictType())) {
            throw new BusinessException(400, "字段类型不能为空");
        }
        if (!StringUtils.hasText(data.getDictLabel())) {
            throw new BusinessException(400, "展示名称不能为空");
        }
        if (!StringUtils.hasText(data.getDictValue())) {
            throw new BusinessException(400, "稳定存储值不能为空");
        }
        String label = data.getDictLabel().trim();
        String value = data.getDictValue().trim();
        if (label.length() > 100 || value.length() > 100) {
            throw new BusinessException(400, "展示名称和稳定存储值不能超过100个字符");
        }
        Integer businessMaxLength = governanceCatalog.optionValueMaxLength(data.getDictType().trim());
        if (businessMaxLength != null && value.length() > businessMaxLength) {
            throw new BusinessException(400,
                    "稳定存储值不能超过该业务字段的" + businessMaxLength + "个字符");
        }
        if (value.chars().anyMatch(Character::isWhitespace) || value.contains(",") || value.contains("，")) {
            throw new BusinessException(400, "稳定存储值不能包含空白或逗号");
        }
    }

    private void ensureGovernedType(String dictType) {
        if (!governanceCatalog.isWritableDictionary(dictType)) {
            throw new BusinessException(400, "字段尚未在治理目录登记");
        }
        // 锁住所属类型行，使同一字段的“清旧默认 -> 写新默认”并发串行化。
        SysDictType type = dictTypeMapper.selectOne(new LambdaQueryWrapper<SysDictType>()
                .eq(SysDictType::getDictType, dictType)
                .last("LIMIT 1 FOR UPDATE"));
        if (type == null) {
            throw new BusinessException(400, "字段类型不存在");
        }
        if (!Integer.valueOf(0).equals(type.getStatus())) {
            throw new BusinessException(400, "字段类型已停用，请先启用字段后再维护选项");
        }
    }

    private void validateMutableValues(SysDictData data) {
        if (data.getStatus() != null && data.getStatus() != 0 && data.getStatus() != 1) {
            throw new BusinessException(400, "选项状态只能是启用或停用");
        }
        if (data.getIsDefault() != null && data.getIsDefault() != 0 && data.getIsDefault() != 1) {
            throw new BusinessException(400, "默认标记只能是是或否");
        }
        if (data.getDictSort() != null && (data.getDictSort() < 0 || data.getDictSort() > 9999)) {
            throw new BusinessException(400, "排序必须在0到9999之间");
        }
        if (data.getRemark() != null && data.getRemark().length() > 255) {
            throw new BusinessException(400, "备注不能超过255个字符");
        }
    }

    private boolean existsValue(String dictType, String value, Long excludeId) {
        return this.baseMapper.selectCount(new LambdaQueryWrapper<SysDictData>()
                .eq(SysDictData::getDictType, dictType)
                .eq(SysDictData::getDictValue, value)
                .ne(excludeId != null, SysDictData::getId, excludeId)) > 0;
    }

    private void clearOtherDefaults(String dictType, Long excludeId) {
        SysDictData patch = new SysDictData();
        patch.setIsDefault(0);
        this.baseMapper.update(patch, new LambdaQueryWrapper<SysDictData>()
                .eq(SysDictData::getDictType, dictType)
                .eq(SysDictData::getIsDefault, 1)
                .ne(excludeId != null, SysDictData::getId, excludeId));
    }

    private void clearClientControlledBaseFields(SysDictData data) {
        // 租户、逻辑删除和审计字段只能由服务端拦截器/填充器维护，不能从JSON请求覆盖。
        data.setTenantId(null);
        data.setDeleted(null);
        data.setCreateTime(null);
        data.setUpdateTime(null);
        data.setCreateBy(null);
        data.setUpdateBy(null);
    }
}
