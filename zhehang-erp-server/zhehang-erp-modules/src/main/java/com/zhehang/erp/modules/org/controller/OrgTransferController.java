package com.zhehang.erp.modules.org.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.annotation.DenyDuringImpersonation;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.org.domain.dto.TransferDTO;
import com.zhehang.erp.modules.org.domain.vo.TransferVO;
import com.zhehang.erp.modules.org.service.IOrgTransferService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/org/transfer")
@RequiredArgsConstructor
public class OrgTransferController {

    private final IOrgTransferService transferService;

    @GetMapping("/list")
    public R<IPage<TransferVO>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) Integer transferType,
            @RequestParam(required = false) Integer status) {
        return R.ok(transferService.selectTransferPage(pageNum, pageSize, employeeId, transferType, status));
    }

    @PostMapping
    @DenyDuringImpersonation(reason = "员工视角禁止替员工发起人事异动")
    @Log(module = "人事异动", type = Log.OperationType.INSERT)
    public R<Void> add(@Valid @RequestBody TransferDTO dto) {
        transferService.createTransfer(dto);
        return R.ok();
    }

    // 原 PUT /approve 孤儿口已下线(2026-07-12 审批收编):
    // 前端无调用方且参数形态(query vs body)从未匹配;审批一律走审批中心 transfer 流程,
    // 通过后由 OrgTransferApprovalHandler 回调 approveTransfer 执行变更。
}
