package com.zhehang.erp.common.core.exception;

import com.zhehang.erp.common.core.domain.R;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.AccessDeniedException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class GlobalExceptionHandlerSecurityTest {

    @Test
    void accessDeniedUsesRealHttp403AndBusinessEnvelope403() {
        HttpServletRequest request = mock(HttpServletRequest.class);
        HttpServletResponse response = mock(HttpServletResponse.class);
        when(request.getRequestURI()).thenReturn("/contract-mgmt/99/terminate");

        R<?> result = new GlobalExceptionHandler().handleAccessDenied(
                new AccessDeniedException("cross-scope"), request, response);

        verify(response).setStatus(HttpServletResponse.SC_FORBIDDEN);
        assertThat(result.getCode()).isEqualTo(403);
    }
}
