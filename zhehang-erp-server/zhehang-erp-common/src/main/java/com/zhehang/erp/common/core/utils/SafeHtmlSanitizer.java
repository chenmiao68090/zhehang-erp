package com.zhehang.erp.common.core.utils;

import org.owasp.html.HtmlPolicyBuilder;
import org.owasp.html.PolicyFactory;
import org.owasp.html.Sanitizers;

/** Shared server-side HTML boundary for rich-text fields. */
public final class SafeHtmlSanitizer {

    private static final PolicyFactory STRUCTURE = new HtmlPolicyBuilder()
            .allowElements("h1", "h2", "h3", "h4", "h5", "h6", "hr", "pre", "code",
                    "table", "thead", "tbody", "tr", "th", "td", "colgroup", "col")
            .allowAttributes("class").globally()
            .allowAttributes("colspan", "rowspan").onElements("th", "td")
            .allowAttributes("target", "rel").onElements("a")
            .toFactory();

    private static final PolicyFactory POLICY = Sanitizers.FORMATTING
            .and(Sanitizers.BLOCKS)
            .and(Sanitizers.TABLES)
            .and(Sanitizers.LINKS)
            .and(Sanitizers.IMAGES)
            .and(STRUCTURE);

    private SafeHtmlSanitizer() {
    }

    public static String sanitize(String value) {
        return value == null ? null : POLICY.sanitize(value);
    }
}
