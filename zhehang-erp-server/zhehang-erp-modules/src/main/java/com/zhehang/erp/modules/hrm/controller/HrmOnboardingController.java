package com.zhehang.erp.modules.hrm.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.annotation.DenyDuringImpersonation;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.hrm.domain.entity.HrmOnboarding;
import com.zhehang.erp.modules.hrm.service.IHrmOnboardingService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/hrm/onboarding")
@RequiredArgsConstructor
@DenyDuringImpersonation(reason = "员工入职资料包含个人敏感信息")
public class HrmOnboardingController {

    private final IHrmOnboardingService onboardingService;

    @GetMapping("/list")
    @PreAuthorize("@perm.hasModule('hrm')")
    public R<IPage<HrmOnboarding>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer status) {
        return R.ok(onboardingService.selectPage(pageNum, pageSize, keyword, status));
    }

    @GetMapping("/{id}")
    @PreAuthorize("@perm.hasModule('hrm')")
    public R<HrmOnboarding> getInfo(@PathVariable Long id) {
        return R.ok(onboardingService.getById(id));
    }

    @PostMapping("/from-resume/{resumeId}")
    @PreAuthorize("@perm.hasModule('hrm')")
    @Log(module = "待入职管理", type = Log.OperationType.INSERT)
    public R<HrmOnboarding> createFromResume(@PathVariable Long resumeId) {
        return R.ok(onboardingService.createFromResume(resumeId));
    }

    @PutMapping
    @PreAuthorize("@perm.hasModule('hrm')")
    @Log(module = "待入职管理", type = Log.OperationType.UPDATE)
    public R<Void> edit(@RequestBody HrmOnboarding onboarding) {
        onboardingService.updateById(onboarding);
        return R.ok();
    }

    @PostMapping("/{id}/confirm-form")
    @PreAuthorize("@perm.hasModule('hrm')")
    @Log(module = "待入职管理", type = Log.OperationType.UPDATE)
    public R<Void> confirmForm(@PathVariable Long id) {
        onboardingService.confirmForm(id);
        return R.ok();
    }

    @PostMapping("/{id}/generate-offer")
    @PreAuthorize("@perm.hasModule('hrm')")
    @Log(module = "待入职管理", type = Log.OperationType.UPDATE)
    public R<HrmOnboarding> generateOffer(@PathVariable Long id, @RequestBody(required = false) HrmOnboarding payload) {
        return R.ok(onboardingService.generateOffer(id, payload));
    }

    @PostMapping("/{id}/mark-offer-sent")
    @PreAuthorize("@perm.hasModule('hrm')")
    @Log(module = "待入职管理", type = Log.OperationType.UPDATE)
    public R<Void> markOfferSent(@PathVariable Long id) {
        onboardingService.markOfferSent(id);
        return R.ok();
    }

    @PostMapping("/{id}/employee-draft")
    @PreAuthorize("@perm.hasModule('hrm')")
    @Log(module = "待入职管理", type = Log.OperationType.INSERT)
    public R<HrmOnboarding> createEmployeeDraft(@PathVariable Long id) {
        return R.ok(onboardingService.createEmployeeDraft(id));
    }

    @PostMapping("/{id}/onboarded")
    @PreAuthorize("@perm.hasModule('hrm')")
    @Log(module = "待入职管理", type = Log.OperationType.UPDATE)
    public R<Void> markOnboarded(@PathVariable Long id) {
        onboardingService.markOnboarded(id);
        return R.ok();
    }

    @PostMapping("/{id}/refresh-token")
    @PreAuthorize("@perm.hasModule('hrm')")
    @Log(module = "待入职管理", type = Log.OperationType.UPDATE)
    public R<HrmOnboarding> refreshPublicToken(@PathVariable Long id) {
        return R.ok(onboardingService.refreshPublicToken(id));
    }

    @GetMapping("/public/{token}")
    public R<HrmOnboarding> publicInfo(@PathVariable String token) {
        return R.ok(onboardingService.publicInfo(token));
    }

    @PostMapping("/public/{token}/submit")
    public R<Void> submitPublicForm(@PathVariable String token, @RequestBody Map<String, Object> payload, HttpServletRequest request) {
        onboardingService.submitPublicForm(token, payload, clientIp(request));
        return R.ok();
    }

    private String clientIp(HttpServletRequest request) {
        if (request == null) {
            return "unknown";
        }
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isBlank() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isBlank() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isBlank() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isBlank() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip == null || ip.isBlank() ? "unknown" : ip;
    }
}
