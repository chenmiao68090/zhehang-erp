package com.zhehang.erp.modules.hrm.service.impl;

import com.baomidou.mybatisplus.core.MybatisConfiguration;
import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.hrm.domain.entity.HrmLaborContract;
import com.zhehang.erp.modules.hrm.mapper.HrmLaborContractMapper;
import com.zhehang.erp.modules.im.service.ImBusinessNotificationPublisher;
import com.zhehang.erp.modules.org.mapper.OrgEmployeeMapper;
import com.zhehang.erp.modules.system.service.GovernedFieldValueValidator;
import org.apache.ibatis.builder.MapperBuilderAssistant;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class HrmLaborContractGovernedTypeTest {

    @Mock
    private HrmLaborContractMapper contractMapper;
    @Mock
    private DataScopeHelper dataScopeHelper;
    @Mock
    private OrgEmployeeMapper employeeMapper;
    @Mock
    private ImBusinessNotificationPublisher publisher;
    @Mock
    private GovernedFieldValueValidator validator;

    private HrmLaborContractServiceImpl service;

    @BeforeEach
    void setUp() {
        TableInfoHelper.initTableInfo(
                new MapperBuilderAssistant(new MybatisConfiguration(), ""), HrmLaborContract.class);
        service = new HrmLaborContractServiceImpl(
                contractMapper, dataScopeHelper, employeeMapper, publisher, validator);
        when(dataScopeHelper.isHrAdminOrBoss()).thenReturn(true);
    }

    @Test
    void createCannotBypassContractTypeValidatorThroughDirectServiceCall() {
        HrmLaborContract contract = new HrmLaborContract();
        contract.setContractType("任意合同");
        when(validator.validateNewValue(
                GovernedFieldValueValidator.HR_LABOR_CONTRACT_TYPE,
                "劳动合同类型", "任意合同", false))
                .thenThrow(new BusinessException(400, "劳动合同类型包含未启用或不存在的值：任意合同"));

        assertThatThrownBy(() -> service.saveOrUpdateContract(contract))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("任意合同");
        verify(contractMapper, never()).insert(any(HrmLaborContract.class));
    }

    @Test
    void updateComparesDatabaseOldValueAndKeepsUnchangedHistoricalType() {
        HrmLaborContract existing = new HrmLaborContract();
        existing.setId(41L);
        existing.setContractType("历史合同类型");
        when(contractMapper.selectById(41L)).thenReturn(existing);
        when(validator.validateChangedValue(
                GovernedFieldValueValidator.HR_LABOR_CONTRACT_TYPE,
                "劳动合同类型", "历史合同类型", "历史合同类型", false))
                .thenReturn("历史合同类型");
        when(contractMapper.updateById(any(HrmLaborContract.class))).thenReturn(1);

        HrmLaborContract patch = new HrmLaborContract();
        patch.setId(41L);
        patch.setContractType("历史合同类型");
        service.saveOrUpdateContract(patch);

        assertThat(patch.getContractType()).isEqualTo("历史合同类型");
        verify(contractMapper).updateById(patch);
    }
}
