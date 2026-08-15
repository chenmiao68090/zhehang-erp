package com.zhehang.erp.modules.system;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.system.controller.SettingsGovernanceController;
import com.zhehang.erp.modules.system.domain.entity.SysDictData;
import com.zhehang.erp.modules.system.domain.entity.SysDictType;
import com.zhehang.erp.modules.system.domain.vo.FieldOptionsVO;
import com.zhehang.erp.modules.system.service.ISysDictDataService;
import com.zhehang.erp.modules.system.service.ISysDictTypeService;
import com.zhehang.erp.modules.system.service.SettingsGovernanceCatalog;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.BadSqlGrammarException;

import java.sql.SQLException;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SettingsGovernanceControllerTest {

    @Mock
    private ISysDictTypeService dictTypeService;

    @Mock
    private ISysDictDataService dictDataService;

    @Test
    void optionsKeepDisabledLabelsForHistoryButMarkThemUnavailableForNewSelection() {
        SysDictType type = new SysDictType();
        type.setDictType("memo_category");
        type.setDictName("备忘分类");
        type.setStatus(0);
        when(dictTypeService.getOne(any(Wrapper.class))).thenReturn(type);
        when(dictDataService.listByType("memo_category")).thenReturn(List.of(
                option("客户跟进", "客户跟进", 0),
                option("旧分类名称", "legacy_category", 1)
        ));

        SettingsGovernanceController controller = new SettingsGovernanceController(
                new SettingsGovernanceCatalog(), dictTypeService, dictDataService);

        R<FieldOptionsVO> response = controller.options("memo_category");

        assertThat(response.getData().isConfigured()).isTrue();
        assertThat(response.getData().getItems()).hasSize(2);
        assertThat(response.getData().getItems().get(0).isEnabled()).isTrue();
        assertThat(response.getData().getItems().get(1).isEnabled()).isFalse();
        assertThat(response.getData().getItems().get(1).getLabel()).isEqualTo("旧分类名称");
        assertThat(response.getData().getItems().get(1).getValue()).isEqualTo("legacy_category");
    }

    @Test
    void disablingAFieldTypeMakesEveryHistoricalItemUnavailableForNewSelection() {
        SysDictType type = new SysDictType();
        type.setDictType("hr_labor_contract_type");
        type.setDictName("劳动合同类型");
        type.setStatus(1);
        when(dictTypeService.getOne(any(Wrapper.class))).thenReturn(type);
        when(dictDataService.listByType("hr_labor_contract_type"))
                .thenReturn(List.of(option("固定期限", "固定期限", 0)));

        SettingsGovernanceController controller = new SettingsGovernanceController(
                new SettingsGovernanceCatalog(), dictTypeService, dictDataService);

        FieldOptionsVO result = controller.options("hr_labor_contract_type").getData();

        assertThat(result.isConfigured()).isTrue();
        assertThat(result.getItems()).singleElement().satisfies(item -> {
            assertThat(item.getLabel()).isEqualTo("固定期限");
            assertThat(item.isEnabled()).isFalse();
        });
    }

    @Test
    void missingTypeTableReturnsExplicitUnconfiguredContract() {
        when(dictTypeService.getOne(any(Wrapper.class))).thenThrow(missingTable("sys_dict_type"));
        SettingsGovernanceController controller = new SettingsGovernanceController(
                new SettingsGovernanceCatalog(), dictTypeService, dictDataService);

        FieldOptionsVO result = controller.options("crm_consult_business").getData();

        assertThat(result.isConfigured()).isFalse();
        assertThat(result.getItems()).isEmpty();
    }

    @Test
    void missingDataTableReturnsExplicitUnconfiguredContract() {
        SysDictType type = new SysDictType();
        type.setDictType("crm_consult_business");
        type.setDictName("咨询/成交业务");
        when(dictTypeService.getOne(any(Wrapper.class))).thenReturn(type);
        when(dictDataService.listByType("crm_consult_business")).thenThrow(missingTable("sys_dict_data"));
        SettingsGovernanceController controller = new SettingsGovernanceController(
                new SettingsGovernanceCatalog(), dictTypeService, dictDataService);

        FieldOptionsVO result = controller.options("crm_consult_business").getData();

        assertThat(result.isConfigured()).isFalse();
        assertThat(result.getItems()).isEmpty();
    }

    private SysDictData option(String label, String value, int status) {
        SysDictData data = new SysDictData();
        data.setDictLabel(label);
        data.setDictValue(value);
        data.setStatus(status);
        data.setDictSort(10);
        data.setIsDefault(0);
        return data;
    }

    private BadSqlGrammarException missingTable(String table) {
        return new BadSqlGrammarException("governance options", "SELECT * FROM " + table,
                new SQLException("table missing", "42S02", 1146));
    }
}
