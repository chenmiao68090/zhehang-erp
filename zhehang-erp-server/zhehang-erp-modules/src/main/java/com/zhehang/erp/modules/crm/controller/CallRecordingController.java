package com.zhehang.erp.modules.crm.controller;

import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.crm.domain.vo.CallRecordingVO;
import com.zhehang.erp.modules.crm.service.CallRecordingService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;

/** 销售“我的结果-通话录音”。 */
@RestController
@RequestMapping("/call-record/recordings")
@RequiredArgsConstructor
public class CallRecordingController {

    private final CallRecordingService callRecordingService;

    @GetMapping("/options")
    @PreAuthorize("@perm.hasAnyRole('sales', 'online_sales', 'dept_manager', 'manager', 'boss', 'super_admin')")
    public R<CallRecordingVO.Options> options() {
        return R.ok(callRecordingService.options());
    }

    @GetMapping
    @PreAuthorize("@perm.hasAnyRole('sales', 'online_sales', 'dept_manager', 'manager', 'boss', 'super_admin')")
    public R<CallRecordingVO.PageResult> page(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) Long deptId,
            @RequestParam(required = false) Integer connected,
            @RequestParam(required = false) String result,
            @RequestParam(required = false) Boolean hasRecording,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "20") Integer pageSize) {
        return R.ok(callRecordingService.page(startDate, endDate, userId, deptId, connected,
                result, hasRecording, keyword, pageNum, pageSize));
    }

    @GetMapping("/{recordId}/play-ticket")
    @PreAuthorize("@perm.hasAnyRole('sales', 'online_sales', 'dept_manager', 'manager', 'boss', 'super_admin')")
    @Log(module = "销售通话录音", type = Log.OperationType.QUERY)
    public R<CallRecordingVO.PlaybackTicket> playTicket(@PathVariable Long recordId,
                                                         HttpServletRequest request) {
        return R.ok(callRecordingService.issueTicket(recordId, request.getHeader(HttpHeaders.USER_AGENT)));
    }

    @GetMapping("/stream/{recordId}")
    public void stream(@PathVariable Long recordId,
                       @RequestParam String ticket,
                       @RequestHeader(value = HttpHeaders.RANGE, required = false) String range,
                       HttpServletRequest request,
                       HttpServletResponse response) {
        callRecordingService.stream(recordId, ticket, range,
                request.getHeader(HttpHeaders.USER_AGENT), response);
    }

    @GetMapping("/stream/external")
    public void streamExternal(@RequestParam String ticket,
                               @RequestHeader(value = HttpHeaders.RANGE, required = false) String range,
                               HttpServletRequest request,
                               HttpServletResponse response) {
        callRecordingService.streamExternal(ticket, range,
                request.getHeader(HttpHeaders.USER_AGENT), response);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<R<Void>> handleStreamStatus(ResponseStatusException exception) {
        String message = exception.getReason() == null ? "录音播放失败" : exception.getReason();
        return ResponseEntity.status(exception.getStatusCode())
                .body(R.fail(exception.getStatusCode().value(), message));
    }
}
