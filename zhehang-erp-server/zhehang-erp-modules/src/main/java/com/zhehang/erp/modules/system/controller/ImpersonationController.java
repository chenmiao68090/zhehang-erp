package com.zhehang.erp.modules.system.controller;

import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.system.domain.dto.ImpersonationEndRequest;
import com.zhehang.erp.modules.system.domain.dto.ImpersonationStartRequest;
import com.zhehang.erp.modules.system.domain.vo.ImpersonationCandidateVO;
import com.zhehang.erp.modules.system.domain.vo.ImpersonationSessionVO;
import com.zhehang.erp.modules.system.service.ImpersonationService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/system/impersonation")
@RequiredArgsConstructor
public class ImpersonationController {

    private final ImpersonationService impersonationService;

    @GetMapping("/candidates")
    public R<List<ImpersonationCandidateVO>> candidates(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long deptId) {
        return R.ok(impersonationService.candidates(keyword, deptId));
    }

    @PostMapping("/start")
    @Log(module = "超级管理员员工视角", type = Log.OperationType.OTHER)
    public R<ImpersonationSessionVO> start(@Valid @RequestBody ImpersonationStartRequest request,
                                           HttpServletRequest httpRequest) {
        return R.ok(impersonationService.start(request, httpRequest));
    }

    @GetMapping("/current")
    public R<ImpersonationSessionVO> current(HttpServletRequest request) {
        return R.ok(impersonationService.current(request));
    }

    @PostMapping("/end")
    @Log(module = "超级管理员员工视角", type = Log.OperationType.OTHER)
    public R<Void> end(@Valid @RequestBody(required = false) ImpersonationEndRequest request,
                       HttpServletRequest httpRequest) {
        impersonationService.end(request, httpRequest);
        return R.ok();
    }
}
