package com.zhehang.erp.modules.im.service;

import com.zhehang.erp.common.core.exception.BusinessException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ImContentPolicyTest {
    private ImContentPolicy policy;

    @BeforeEach
    void setUp() {
        policy = new ImContentPolicy();
        ReflectionTestUtils.setField(policy, "maxTextLength", 20);
    }

    @Test
    void normalizesLineBreaksAndRemovesNullByte() {
        assertThat(policy.normalizeText("第一行\r\n第二行\u0000")).isEqualTo("第一行\n第二行");
    }

    @Test
    void keepsMarkupAsPlainTextInsteadOfTrustingHtml() {
        assertThat(policy.normalizeText("<b>仅作为文字</b>")).isEqualTo("<b>仅作为文字</b>");
    }

    @Test
    void rejectsOversizedAndUnknownContent() {
        assertThatThrownBy(() -> policy.normalizeText("123456789012345678901"))
                .isInstanceOf(BusinessException.class);
        assertThatThrownBy(() -> policy.requireMessageType("html"))
                .isInstanceOf(BusinessException.class);
        assertThatThrownBy(() -> policy.requireReaction("script"))
                .isInstanceOf(BusinessException.class);
    }
}
