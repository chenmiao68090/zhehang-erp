package com.zhehang.erp.modules.system.service;

import com.zhehang.erp.modules.system.domain.vo.FieldDefinitionVO;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Modifier;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;

class SettingsGovernanceCatalogTest {

    private final SettingsGovernanceCatalog catalog = new SettingsGovernanceCatalog();

    @Test
    void ruleCatalogIsReadOnlyMetadataWithoutGenericMutationApi() {
        Set<String> publicMethods = Arrays.stream(SettingsGovernanceCatalog.class.getDeclaredMethods())
                .filter(method -> Modifier.isPublic(method.getModifiers()))
                .map(method -> method.getName())
                .collect(Collectors.toSet());

        assertThat(publicMethods).containsExactlyInAnyOrder(
                "rules", "fields", "fieldByDictType", "isBoundDictionary", "isWritableDictionary",
                "fallbackValues", "optionValueMaxLength", "storageValueMaxLength");
        assertThat(catalog.rules()).hasSize(18);
        assertThat(catalog.fields()).hasSize(29);
        assertThat(publicMethods).noneMatch(this::isMutationName);
    }

    @Test
    void onlyConnectedGovernedDictionariesAreWritable() {
        List<FieldDefinitionVO> writableFields = catalog.fields().stream()
                .filter(field -> catalog.isWritableDictionary(field.getDictType()))
                .toList();

        assertThat(writableFields)
                .extracting(FieldDefinitionVO::getKey)
                .containsExactly("crm.consultBusiness", "memo.category", "hr.contractType");
        assertThat(writableFields).allSatisfy(field -> {
            assertThat(field.getSourceKind()).isEqualTo("DICTIONARY");
            assertThat(field.getIntegrationState()).isEqualTo("CONNECTED");
            assertThat(field.getEditPolicy()).isEqualTo("ADD_DISABLE_LOCK_VALUE");
            assertThat(field.getDictType()).isNotBlank();
        });
    }

    @Test
    void entitiesAndStateMachinesStayReadOnlyInTheSettingsCenter() {
        List<FieldDefinitionVO> entities = fieldsWithSource("ENTITY");
        assertThat(entities).isNotEmpty().allSatisfy(field -> {
            assertThat(field.getIntegrationState()).isEqualTo("DOMAIN_MANAGED");
            assertThat(field.getEditPolicy()).isEqualTo("DOMAIN_MANAGED");
            assertThat(catalog.isWritableDictionary(field.getDictType())).isFalse();
        });

        List<FieldDefinitionVO> stateMachines = fieldsWithSource("STATE_MACHINE");
        assertThat(stateMachines).isNotEmpty().allSatisfy(field -> {
            assertThat(field.getEditPolicy()).isEqualTo("DISPLAY_ONLY");
            assertThat(field.getDictType()).isNull();
            assertThat(catalog.isWritableDictionary(field.getDictType())).isFalse();
        });
        assertThat(stateMachines.stream()
                .filter(field -> List.of("crm.validity", "crm.followStage").contains(field.getKey()))
                .toList()).hasSize(2)
                .allSatisfy(field -> assertThat(field.getIntegrationState()).isEqualTo("CONNECTED"));
    }

    @Test
    void connectedDictionaryFallbacksMatchPhysicalBusinessContracts() {
        assertThat(catalog.fallbackValues("crm_consult_business"))
                .hasSize(10).contains("刻章业务");
        assertThat(catalog.fallbackValues("memo_category"))
                .containsExactly("客户跟进", "财务协同", "团队管理", "系统优化", "学习成长", "个人事项");
        assertThat(catalog.fallbackValues("hr_labor_contract_type"))
                .containsExactly("固定期限", "无固定期限", "以完成一定工作为期限");
        assertThat(catalog.optionValueMaxLength("crm_consult_business")).isEqualTo(32);
        assertThat(catalog.storageValueMaxLength("crm_consult_business", true)).isEqualTo(255);
    }

    private List<FieldDefinitionVO> fieldsWithSource(String sourceKind) {
        return catalog.fields().stream()
                .filter(field -> sourceKind.equals(field.getSourceKind()))
                .toList();
    }

    private boolean isMutationName(String methodName) {
        String normalized = methodName.toLowerCase();
        return normalized.contains("save")
                || normalized.contains("create")
                || normalized.contains("update")
                || normalized.contains("delete")
                || normalized.contains("remove")
                || normalized.contains("publish");
    }
}
