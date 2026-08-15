package com.zhehang.erp.modules.system.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.system.domain.entity.SysDictData;
import com.zhehang.erp.modules.system.domain.entity.SysDictType;
import com.zhehang.erp.modules.system.domain.vo.FieldDefinitionVO;
import com.zhehang.erp.modules.system.domain.vo.FieldOptionsVO;
import com.zhehang.erp.modules.system.domain.vo.RuleDefinitionVO;
import com.zhehang.erp.modules.system.service.ISysDictDataService;
import com.zhehang.erp.modules.system.service.ISysDictTypeService;
import com.zhehang.erp.modules.system.service.SettingsGovernanceCatalog;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.BadSqlGrammarException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** 系统设置中的规则目录与字段来源目录。 */
@RestController
@RequestMapping("/system/settings-governance")
@RequiredArgsConstructor
public class SettingsGovernanceController {

    private static final String SETTINGS_ADMIN_GATE = "@perm.hasAnyRole('boss', 'super_admin')";

    private final SettingsGovernanceCatalog catalog;
    private final ISysDictTypeService dictTypeService;
    private final ISysDictDataService dictDataService;

    /**
     * 规则中心只返回治理目录，不复制领域规则值，也不提供绕过领域校验的通用保存接口。
     */
    @GetMapping("/rules")
    @PreAuthorize(SETTINGS_ADMIN_GATE)
    public R<List<RuleDefinitionVO>> rules() {
        return R.ok(catalog.rules());
    }

    /** 字段来源、引用位置、风险和允许动作的统一目录。 */
    @GetMapping("/fields")
    @PreAuthorize(SETTINGS_ADMIN_GATE)
    public R<List<FieldDefinitionVO>> fields() {
        return R.ok(catalog.fields());
    }

    /**
     * 已接入业务页面读取选项的唯一入口。
     * configured=false 才允许前端使用随版本发布的兜底项；configured=true 时即使所有 items
     * 都是 enabled=false，也表示管理员已明确停用全部新选项，前端不能偷偷恢复旧常量。
     * 停用项仍返回脱敏后的标签和值，仅用于历史记录回显，不能作为新选择。
    */
    @GetMapping("/options/{dictType}")
    @PreAuthorize("isAuthenticated()")
    public R<FieldOptionsVO> options(@PathVariable String dictType) {
        FieldDefinitionVO field = catalog.fieldByDictType(dictType)
                .orElseThrow(() -> new BusinessException(404, "字段选项未在治理目录登记"));
        try {
            SysDictType type = dictTypeService.getOne(new LambdaQueryWrapper<SysDictType>()
                    .eq(SysDictType::getDictType, dictType)
                    .last("LIMIT 1"));
            if (type == null) {
                return R.ok(notConfigured(field));
            }
            boolean typeEnabled = type.getStatus() == null || type.getStatus() == 0;
            List<FieldOptionsVO.OptionItem> items = dictDataService.listByType(dictType).stream()
                    .map(data -> toOptionItem(data, typeEnabled))
                    .toList();
            return R.ok(FieldOptionsVO.builder()
                    .configured(true)
                    .dictType(dictType)
                    .dictName(type.getDictName())
                    .editPolicy(field.getEditPolicy())
                    .historyPolicy(field.getHistoryPolicy())
                    .items(items)
                    .build());
        } catch (BadSqlGrammarException ex) {
            if (!isMissingTable(ex)) {
                throw ex;
            }
            return R.ok(notConfigured(field));
        }
    }

    private FieldOptionsVO notConfigured(FieldDefinitionVO field) {
        return FieldOptionsVO.builder()
                .configured(false)
                .dictType(field.getDictType())
                .dictName(field.getName())
                .editPolicy(field.getEditPolicy())
                .historyPolicy(field.getHistoryPolicy())
                .items(List.of())
                .build();
    }

    private FieldOptionsVO.OptionItem toOptionItem(SysDictData data, boolean typeEnabled) {
        return FieldOptionsVO.OptionItem.builder()
                .label(data.getDictLabel())
                .value(data.getDictValue())
                .sort(data.getDictSort())
                .defaultValue(data.getIsDefault() != null && data.getIsDefault() == 1)
                .enabled(typeEnabled && (data.getStatus() == null || data.getStatus() == 0))
                .build();
    }

    private boolean isMissingTable(BadSqlGrammarException ex) {
        return ex.getSQLException() != null && ex.getSQLException().getErrorCode() == 1146;
    }
}
