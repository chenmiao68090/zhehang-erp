package com.zhehang.erp.modules.im.controller;

import com.zhehang.erp.common.core.annotation.DenyDuringImpersonation;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.im.domain.ImModels;
import com.zhehang.erp.modules.im.service.ImAttachmentService;
import com.zhehang.erp.modules.im.service.ImTaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/im")
@RequiredArgsConstructor
@DenyDuringImpersonation(reason = "消息关联待办及附件")
public class ImTaskController {
    private final ImTaskService taskService;
    private final ImAttachmentService attachmentService;

    @PostMapping("/messages/{messageId}/tasks")
    @Log(module = "消息待办", type = Log.OperationType.INSERT)
    public R<ImModels.WorkTask> create(@PathVariable Long messageId,
                                       @Valid @RequestBody ImModels.CreateTaskRequest request) {
        return R.ok(taskService.createFromMessage(messageId, request));
    }

    @GetMapping("/tasks")
    public R<ImModels.CursorPage<ImModels.WorkTask>> list(
            @RequestParam(defaultValue = "all_mine") String scope,
            @RequestParam(defaultValue = "all") String state,
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "40") int pageSize) {
        return R.ok(taskService.list(scope, state, cursor, pageSize));
    }

    @GetMapping("/tasks/stats")
    public R<ImModels.TaskStats> stats(@RequestParam(defaultValue = "all_mine") String scope) {
        return R.ok(taskService.stats(scope));
    }

    @GetMapping("/tasks/{taskId}")
    public R<ImModels.WorkTask> detail(@PathVariable Long taskId) {
        return R.ok(taskService.detail(taskId));
    }

    @PostMapping("/tasks/{taskId}/accept")
    @Log(module = "消息待办", type = Log.OperationType.UPDATE)
    public R<ImModels.WorkTask> accept(@PathVariable Long taskId) {
        return R.ok(taskService.accept(taskId));
    }

    @PostMapping("/tasks/{taskId}/submit")
    @Log(module = "消息待办", type = Log.OperationType.UPDATE)
    public R<ImModels.WorkTask> submit(@PathVariable Long taskId,
                                       @RequestBody ImModels.TaskActionRequest request) {
        return R.ok(taskService.submit(taskId, request));
    }

    @PostMapping("/tasks/{taskId}/attachments")
    public R<ImModels.Attachment> uploadAttachment(@PathVariable Long taskId,
                                                   @RequestParam("file") MultipartFile file) {
        return R.ok(attachmentService.uploadForTask(taskId, file));
    }

    @PostMapping("/tasks/{taskId}/review")
    @Log(module = "消息待办", type = Log.OperationType.UPDATE)
    public R<ImModels.WorkTask> review(@PathVariable Long taskId,
                                       @RequestBody ImModels.TaskActionRequest request) {
        return R.ok(taskService.review(taskId, request));
    }

    @PostMapping("/tasks/{taskId}/cancel")
    @Log(module = "消息待办", type = Log.OperationType.UPDATE)
    public R<ImModels.WorkTask> cancel(@PathVariable Long taskId,
                                       @RequestBody ImModels.TaskActionRequest request) {
        return R.ok(taskService.cancel(taskId, request));
    }
}
