package com.zhehang.erp.modules.finance.service.impl;

import java.util.Locale;

/** 收款推荐、别名和渠道对账共用的名称标准化口径。 */
public final class CashNameNormalizer {
    private CashNameNormalizer() {
    }

    public static String text(String value) {
        return value == null ? "" : value.toLowerCase(Locale.ROOT)
                .replaceAll("[\\s\\p{P}]+", "");
    }

    public static String company(String value) {
        return text(value)
                .replace("有限责任公司", "")
                .replace("股份有限公司", "")
                .replace("有限公司", "")
                .replace("工作室", "")
                .replace("个体工商户", "");
    }
}
