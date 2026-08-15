package com.zhehang.erp.modules.security;

import com.zhehang.erp.common.core.utils.SafeHtmlSanitizer;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class SafeHtmlSanitizerTest {

    @Test
    void removesExecutableMarkupAndDangerousUrls() {
        String input = "<p onclick=alert(1)>ok</p><script>alert(1)</script>"
                + "<a href=javascript:alert(1)>bad</a><img src=x onerror=alert(1)>";

        String sanitized = SafeHtmlSanitizer.sanitize(input);

        assertThat(sanitized).contains("<p>ok</p>");
        assertThat(sanitized).doesNotContain("script", "onclick", "onerror", "javascript:");
    }

    @Test
    void keepsBusinessFormattingAndSafeLinks() {
        String sanitized = SafeHtmlSanitizer.sanitize(
                "<h2>标题</h2><table><tr><td colspan=2>内容</td></tr></table>"
                        + "<a href=https://example.com target=_blank>链接</a>");

        assertThat(sanitized).contains("<h2>标题</h2>", "<table>", "colspan=\"2\"", "https://example.com");
    }
}
