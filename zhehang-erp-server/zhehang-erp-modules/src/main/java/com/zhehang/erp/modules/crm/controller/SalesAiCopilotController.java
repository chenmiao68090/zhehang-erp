package com.zhehang.erp.modules.crm.controller;

import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.crm.domain.dto.SalesAiDraftRequest;
import com.zhehang.erp.modules.crm.domain.dto.SalesAiFeedbackRequest;
import com.zhehang.erp.modules.crm.domain.dto.SalesAiManagementRequest;
import com.zhehang.erp.modules.crm.domain.vo.SalesAiDraftVO;
import com.zhehang.erp.modules.crm.domain.vo.SalesAiManagementInsightVO;
import com.zhehang.erp.modules.crm.service.SalesAiCopilotService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/crm/sales-ai")
@RequiredArgsConstructor
@PreAuthorize("@perm.hasAnyRole('sales', 'online_sales', 'dept_manager', 'manager', 'boss', 'super_admin')")
public class SalesAiCopilotController {

    private final SalesAiCopilotService service;

    @PostMapping("/follow-draft")
    public R<SalesAiDraftVO> followDraft(@Valid @RequestBody SalesAiDraftRequest request) {
        return R.ok(service.followDraft(request));
    }

    @PostMapping("/management-insight")
    @PreAuthorize("@perm.hasAnyRole('dept_manager', 'manager', 'boss', 'super_admin')")
    public R<SalesAiManagementInsightVO> managementInsight(
            @Valid @RequestBody(required = false) SalesAiManagementRequest request) {
        return R.ok(service.managementInsight(request == null ? new SalesAiManagementRequest() : request));
    }

    @PostMapping("/feedback")
    public R<Void> feedback(@Valid @RequestBody SalesAiFeedbackRequest request) {
        service.feedback(request);
        return R.ok();
    }
}
