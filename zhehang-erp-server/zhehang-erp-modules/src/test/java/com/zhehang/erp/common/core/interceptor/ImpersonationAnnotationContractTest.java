package com.zhehang.erp.common.core.interceptor;

import com.zhehang.erp.common.core.annotation.AllowDuringImpersonationRead;
import com.zhehang.erp.common.core.annotation.DenyDuringImpersonation;
import com.zhehang.erp.modules.crm.controller.CrmCollisionController;
import com.zhehang.erp.modules.crm.controller.WechatFriendController;
import com.zhehang.erp.modules.crm.controller.YunkeController;
import com.zhehang.erp.modules.file.controller.FileInfoController;
import com.zhehang.erp.modules.finance.controller.CashJournalController;
import com.zhehang.erp.modules.finance.controller.CompanyJournalController;
import com.zhehang.erp.modules.gs.controller.BizGsOrderController;
import com.zhehang.erp.modules.hrm.controller.HrmLaborContractController;
import com.zhehang.erp.modules.hrm.controller.HrmOnboardingController;
import com.zhehang.erp.modules.hrm.controller.HrmPayslipController;
import com.zhehang.erp.modules.hrm.controller.HrmResumeController;
import com.zhehang.erp.modules.hrm.controller.HrmSalaryController;
import com.zhehang.erp.modules.hrm.controller.HrmSalaryTemplateController;
import com.zhehang.erp.modules.hrm.controller.HrmSocialFundController;
import com.zhehang.erp.modules.im.controller.ImAttachmentController;
import com.zhehang.erp.modules.im.controller.ImController;
import com.zhehang.erp.modules.im.controller.ImRealtimeController;
import com.zhehang.erp.modules.im.controller.ImTaskController;
import com.zhehang.erp.modules.org.controller.OrgEmployeeController;
import com.zhehang.erp.modules.order.controller.BizAddressOrderController;
import com.zhehang.erp.modules.review.controller.OrderReviewController;
import com.zhehang.erp.modules.seal.controller.BizSealOrderController;
import com.zhehang.erp.modules.supply.controller.SupplyVendorController;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;

class ImpersonationAnnotationContractTest {

    @Test
    void onlyReviewedNonGetQueriesHaveReadOnlyException() {
        Set<String> exceptions = Arrays.stream(new Class<?>[]{
                        CrmCollisionController.class,
                        CashJournalController.class
                })
                .flatMap(type -> Arrays.stream(type.getDeclaredMethods())
                        .filter(method -> method.isAnnotationPresent(AllowDuringImpersonationRead.class))
                        .map(method -> type.getSimpleName() + "#" + method.getName()))
                .collect(Collectors.toSet());

        assertThat(exceptions).containsExactlyInAnyOrder(
                "CrmCollisionController#check",
                "CashJournalController#simulateMatchRules",
                "CashJournalController#reconcilePreview",
                "CashJournalController#importPreview"
        );
    }

    @Test
    void sensitiveControllersRemainDeniedAsAClassContract() {
        List<Class<?>> sensitiveControllers = List.of(
                YunkeController.class,
                HrmLaborContractController.class,
                HrmOnboardingController.class,
                HrmPayslipController.class,
                HrmResumeController.class,
                HrmSalaryController.class,
                HrmSalaryTemplateController.class,
                HrmSocialFundController.class,
                ImAttachmentController.class,
                ImController.class,
                ImRealtimeController.class,
                ImTaskController.class,
                BizGsOrderController.class,
                BizAddressOrderController.class,
                BizSealOrderController.class,
                SupplyVendorController.class,
                CompanyJournalController.class,
                FileInfoController.class,
                WechatFriendController.class
        );

        assertThat(sensitiveControllers)
                .allMatch(type -> type.isAnnotationPresent(DenyDuringImpersonation.class));
    }

    @Test
    void sensitiveDownloadsAndEmployeeProfilesRemainDeniedAsAMethodContract() {
        assertDenied(OrderReviewController.class, "downloadAttachment");
        assertDenied(OrgEmployeeController.class, "contractExpiring");
        assertDenied(OrgEmployeeController.class, "list");
        assertDenied(OrgEmployeeController.class, "me");
        assertDenied(OrgEmployeeController.class, "getInfo");
    }

    private void assertDenied(Class<?> type, String methodName) {
        Method method = Arrays.stream(type.getDeclaredMethods())
                .filter(candidate -> candidate.getName().equals(methodName))
                .findFirst()
                .orElseThrow(() -> new AssertionError(type.getSimpleName() + "#" + methodName + " 不存在"));
        assertThat(method.isAnnotationPresent(DenyDuringImpersonation.class))
                .as(type.getSimpleName() + "#" + methodName + " 必须显式禁止代登录访问")
                .isTrue();
    }
}
