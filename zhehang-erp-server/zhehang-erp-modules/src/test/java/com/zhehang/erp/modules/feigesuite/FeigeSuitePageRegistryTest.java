package com.zhehang.erp.modules.feigesuite;

import com.zhehang.erp.modules.feigesuite.service.FeigeSuitePageRegistry;
import org.junit.jupiter.api.Test;

import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class FeigeSuitePageRegistryTest {

    private final FeigeSuitePageRegistry registry = new FeigeSuitePageRegistry();

    @Test
    void registersEveryLegacyBusinessPageExactlyOnce() {
        assertEquals(55, registry.all().size());
        assertEquals(55, registry.all().stream().map(FeigeSuitePageRegistry.PageDefinition::code).distinct().count());

        Map<String, Long> counts = registry.all().stream().collect(Collectors.groupingBy(
                FeigeSuitePageRegistry.PageDefinition::group,
                Collectors.counting()));
        assertEquals(Map.of(
                "learning", 11L,
                "consultant", 4L,
                "management", 9L,
                "finance", 7L,
                "knowledge", 4L,
                "hr", 5L,
                "salary", 8L,
                "reimbursement", 2L,
                "notice", 5L), counts);
    }

    @Test
    void rejectsStatusShortcutsAndRestoresByBusinessType() {
        FeigeSuitePageRegistry.PageDefinition approval = registry.require("renewal-audit");
        assertTrue(registry.isActionAllowed(approval, "draft", "submit"));
        assertTrue(registry.isActionAllowed(approval, "pending", "approve"));
        assertFalse(registry.isActionAllowed(approval, "draft", "approve"));
        assertFalse(registry.isActionAllowed(approval, "approved", "reject"));
        assertEquals("draft", registry.targetStatus(approval, "restore"));

        FeigeSuitePageRegistry.PageDefinition exam = registry.require("knowledge-exam");
        assertTrue(registry.isActionAllowed(exam, "pending", "start"));
        assertFalse(registry.isActionAllowed(exam, "completed", "start"));
        assertEquals("pending", registry.targetStatus(exam, "restore"));

        FeigeSuitePageRegistry.PageDefinition salary = registry.require("salary-payment");
        assertTrue(registry.isActionAllowed(salary, "approved", "pay"));
        assertFalse(registry.isActionAllowed(salary, "draft", "pay"));
        assertTrue(salary.statuses().contains("rejected"));
    }
}
