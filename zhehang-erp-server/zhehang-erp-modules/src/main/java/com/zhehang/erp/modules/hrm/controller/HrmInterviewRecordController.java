package com.zhehang.erp.modules.hrm.controller;

import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.hrm.domain.entity.HrmInterviewRecord;
import com.zhehang.erp.modules.hrm.service.IHrmInterviewRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/hrm/interview-record")
@RequiredArgsConstructor
@org.springframework.security.access.prepost.PreAuthorize("@perm.hasModule('hrm')")
public class HrmInterviewRecordController {

    private final IHrmInterviewRecordService interviewRecordService;

    @GetMapping("/list")
    public R<List<HrmInterviewRecord>> list(@RequestParam Long resumeId) {
        return R.ok(interviewRecordService.listByResumeId(resumeId));
    }

    @PostMapping
    @Log(module = "面试流转", type = Log.OperationType.INSERT)
    public R<Void> add(@RequestBody HrmInterviewRecord record) {
        interviewRecordService.createAndApply(record);
        return R.ok();
    }
}
