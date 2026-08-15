package com.zhehang.erp.modules.crm.controller;

import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.crm.service.CallRecordingService;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

class CallRecordingControllerTest {

    @Test
    void invalidPlaybackTicketKeepsUnauthorizedHttpStatus() {
        CallRecordingController controller = new CallRecordingController(mock(CallRecordingService.class));

        ResponseEntity<R<Void>> response = controller.handleStreamStatus(
                new ResponseStatusException(HttpStatus.UNAUTHORIZED, "录音播放凭证无效"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getCode()).isEqualTo(401);
        assertThat(response.getBody().getMessage()).isEqualTo("录音播放凭证无效");
    }
}
