package com.zhehang.erp.modules.im.controller;

import com.zhehang.erp.common.core.annotation.DenyDuringImpersonation;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.im.realtime.ImRealtimeTicketService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/im/realtime")
@RequiredArgsConstructor
@DenyDuringImpersonation(reason = "私人消息实时连接")
public class ImRealtimeController {
    private final ImRealtimeTicketService ticketService;

    @PostMapping("/ticket")
    public R<Map<String, Object>> ticket(HttpServletRequest request) {
        return R.ok(Map.of(
                "ticket", ticketService.issue(request),
                "expiresIn", 60,
                "webSocketPath", "/ws/im"));
    }
}
