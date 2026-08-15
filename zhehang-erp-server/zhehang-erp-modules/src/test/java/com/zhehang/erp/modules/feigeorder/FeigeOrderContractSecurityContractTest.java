package com.zhehang.erp.modules.feigeorder;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.modules.feigeorder.controller.FeigeOrderContractController;
import com.zhehang.erp.modules.feigeorder.domain.entity.FeigeAccountingContract;
import com.zhehang.erp.modules.feigeorder.domain.entity.FeigeContractChangeLog;
import com.zhehang.erp.modules.feigeorder.domain.entity.FeigeContractHandover;
import com.zhehang.erp.modules.feigeorder.domain.entity.FeigeContractRenewal;
import com.zhehang.erp.modules.feigeorder.domain.entity.FeigeOrder;
import com.zhehang.erp.modules.feigeorder.domain.entity.FeigeOrderOperationLog;
import com.zhehang.erp.modules.feigeorder.domain.entity.FeigeOrderPayment;
import com.zhehang.erp.modules.feigeorder.domain.entity.FeigeOrderRefund;
import com.zhehang.erp.modules.feigeorder.domain.entity.FeigeOrderStep;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestMapping;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class FeigeOrderContractSecurityContractTest {

    @Test
    void controllerUsesIndependentRouteAndBackendRoleGuard() {
        RequestMapping mapping = FeigeOrderContractController.class.getAnnotation(RequestMapping.class);
        PreAuthorize authorize = FeigeOrderContractController.class.getAnnotation(PreAuthorize.class);

        assertNotNull(mapping);
        assertEquals("/feige-order-contract", mapping.value()[0]);
        assertNotNull(authorize);
        assertTrue(authorize.value().contains("sales"));
        assertTrue(authorize.value().contains("finance"));
    }

    @Test
    void everyBusinessEntityUsesAFeigeOnlyTable() {
        List<Class<?>> entities = List.of(
                FeigeOrder.class,
                FeigeOrderPayment.class,
                FeigeOrderRefund.class,
                FeigeAccountingContract.class,
                FeigeOrderOperationLog.class,
                FeigeOrderStep.class,
                FeigeContractRenewal.class,
                FeigeContractChangeLog.class,
                FeigeContractHandover.class
        );
        for (Class<?> entity : entities) {
            TableName tableName = entity.getAnnotation(TableName.class);
            assertNotNull(tableName);
            assertTrue(tableName.value().startsWith("feige_"));
            assertFalse(tableName.value().startsWith("biz_"));
        }
    }

    @Test
    void serviceEnforcesDataScopeAndDoesNotDoubleSubtractCompletedRefunds() throws Exception {
        Path source = Path.of("src/main/java/com/zhehang/erp/modules/feigeorder/service/FeigeOrderContractService.java");
        String text = Files.readString(source);

        assertTrue(text.contains("dataScopeHelper.applyFinancial"));
        assertTrue(text.contains("dataScopeHelper.canAccess("));
        assertTrue(text.contains("throw new AccessDeniedException"));
        assertTrue(text.contains("BigDecimal available = money(order.getReceivedAmount())"));
        assertFalse(text.contains("subtract(completed)"));
    }

    @Test
    void sealOrdersCannotCreateASecondFeigeFact() throws Exception {
        Path source = Path.of("src/main/java/com/zhehang/erp/modules/feigeorder/service/FeigeOrderContractService.java");
        String text = Files.readString(source);

        assertTrue(text.contains("rejectSealOrderCreation(request);"));
        assertTrue(text.contains("BUSINESS_TYPE_SEAL = \"seal\""));
        assertTrue(text.contains("刻章业务请使用订单管理中的完整刻章提单"));
        assertTrue(text.contains("不能与通用订单互转"));
    }

    @Test
    void parityEndpointsAndMigrationRemainInsideTheIndependentModule() throws Exception {
        Path controllerPath = Path.of("src/main/java/com/zhehang/erp/modules/feigeorder/controller/FeigeOrderContractController.java");
        Path migrationPath = Path.of("../../zhehang-erp-db/migration/V202_feige_order_parity.sql");
        String controller = Files.readString(controllerPath);
        String migration = Files.readString(migrationPath);

        for (String endpoint : List.of(
                "/audit-orders", "/audit", "/reject", "/confirm", "/steps",
                "/renewals", "/restore", "/handover/preview", "/contracts/handover",
                "/handover/history", "/handover/{id}/revoke")) {
            assertTrue(controller.contains(endpoint));
        }
        for (String table : List.of(
                "feige_order_step", "feige_contract_renewal",
                "feige_contract_change_log", "feige_contract_handover")) {
            assertTrue(migration.contains(table));
        }
        assertFalse(migration.matches("(?s).*(ALTER|UPDATE|DELETE FROM|INSERT INTO)\\s+(biz_|crm_|sys_).*"));
    }
}
