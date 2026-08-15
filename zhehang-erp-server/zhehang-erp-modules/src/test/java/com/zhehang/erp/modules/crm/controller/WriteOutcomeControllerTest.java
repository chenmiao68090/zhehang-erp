package com.zhehang.erp.modules.crm.controller;

import com.zhehang.erp.modules.finance.controller.FinanceInvoiceController;
import com.zhehang.erp.modules.finance.domain.entity.FinanceInvoice;
import com.zhehang.erp.modules.finance.service.impl.FinanceInvoiceServiceImpl;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class WriteOutcomeControllerTest {

    @Test
    void financeInvoiceControllerNeverReportsSuccessWhenPersistenceReturnsFalse() {
        FinanceInvoiceServiceImpl service = mock(FinanceInvoiceServiceImpl.class);
        FinanceInvoiceController controller = new FinanceInvoiceController(service);
        FinanceInvoice invoice = new FinanceInvoice();
        invoice.setId(20L);
        when(service.save(invoice)).thenReturn(false);
        when(service.updateById(invoice)).thenReturn(false);
        when(service.removeById(20L)).thenReturn(false);

        assertThat(controller.add(invoice).getCode()).isNotEqualTo(200);
        assertThat(controller.update(invoice).getCode()).isNotEqualTo(200);
        assertThat(controller.remove(20L).getCode()).isNotEqualTo(200);
    }
}
