package com.zhehang.erp.modules.crm.controller;

import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.crm.domain.dto.CrmLeadImportConfirmRequest;
import com.zhehang.erp.modules.crm.domain.dto.CrmLeadImportRequest;
import com.zhehang.erp.modules.crm.domain.vo.CrmLeadImportPreviewVO;
import com.zhehang.erp.modules.crm.domain.vo.CrmLeadImportResultVO;
import com.zhehang.erp.modules.crm.service.CrmCustomer360Service;
import com.zhehang.erp.modules.crm.service.CrmLeadImportService;
import com.zhehang.erp.modules.crm.service.ICrmLeadService;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.lang.reflect.Method;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CrmLeadImportControllerTest {

    @Mock private ICrmLeadService leadService;
    @Mock private CrmCustomer360Service customer360Service;
    @Mock private CrmLeadImportService leadImportService;
    @Mock private DataScopeHelper dataScopeHelper;

    private CrmLeadController controller;

    @BeforeEach
    void setUp() {
        controller = new CrmLeadController(leadService, customer360Service, leadImportService, dataScopeHelper);
    }

    @Test
    void ordinarySalespersonCannotPreflightOrConfirmAndServiceIsNeverCalled() {
        when(dataScopeHelper.isManagerOrAdmin()).thenReturn(false);

        assertThatThrownBy(() -> controller.importPreflight(new CrmLeadImportRequest()))
                .isInstanceOfSatisfying(BusinessException.class, error -> assertThat(error.getCode()).isEqualTo(403));
        assertThatThrownBy(() -> controller.importConfirm(new CrmLeadImportConfirmRequest()))
                .isInstanceOfSatisfying(BusinessException.class, error -> assertThat(error.getCode()).isEqualTo(403));
        verifyNoInteractions(leadImportService);
    }

    @Test
    void confirmAuditExplicitlyDisablesRequestAndResponsePayloads() throws Exception {
        Method method = CrmLeadController.class.getDeclaredMethod("importConfirm", CrmLeadImportConfirmRequest.class);
        Log annotation = method.getAnnotation(Log.class);

        assertThat(annotation).isNotNull();
        assertThat(annotation.type()).isEqualTo(Log.OperationType.IMPORT);
        assertThat(annotation.saveRequestData()).isFalse();
        assertThat(annotation.saveResponseData()).isFalse();
    }

    @Test
    void companyLibraryImportAuditAlsoOmitsSearchKeywordAndResultPayloads() throws Exception {
        Method method = CrmLeadController.class.getDeclaredMethod("importCompanies", Map.class);
        Log annotation = method.getAnnotation(Log.class);

        assertThat(annotation).isNotNull();
        assertThat(annotation.saveRequestData()).isFalse();
        assertThat(annotation.saveResponseData()).isFalse();
    }

    @Test
    void managerRequestsAreDelegatedToDedicatedImportService() {
        when(dataScopeHelper.isManagerOrAdmin()).thenReturn(true);
        CrmLeadImportRequest preflightRequest = new CrmLeadImportRequest();
        CrmLeadImportConfirmRequest confirmRequest = new CrmLeadImportConfirmRequest();
        CrmLeadImportPreviewVO preview = new CrmLeadImportPreviewVO();
        CrmLeadImportResultVO result = new CrmLeadImportResultVO();
        when(leadImportService.preflight(preflightRequest)).thenReturn(preview);
        when(leadImportService.confirm(confirmRequest)).thenReturn(result);

        assertThat(controller.importPreflight(preflightRequest).getData()).isSameAs(preview);
        assertThat(controller.importConfirm(confirmRequest).getData()).isSameAs(result);
    }
}
