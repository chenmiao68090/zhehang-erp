package com.zhehang.erp.modules.im.service;

import com.zhehang.erp.common.core.exception.BusinessException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.Set;

/** 消息正文只按纯文本保存和展示，不接受客户端 HTML。 */
@Component
public class ImContentPolicy {
    private static final Set<String> MESSAGE_TYPES = Set.of(
            "text", "image", "file", "forward", "task", "business", "system", "announcement");
    private static final Set<String> REACTIONS = Set.of("like", "ok", "thanks", "done", "eyes", "support");

    @Value("${im.max-text-length:10000}")
    private int maxTextLength;

    public String normalizeText(String text) {
        String value = text == null ? "" : text.replace("\r\n", "\n").replace('\r', '\n');
        value = value.replace("\u0000", "");
        if (value.length() > maxTextLength) {
            throw new BusinessException("消息内容不能超过" + maxTextLength + "个字符");
        }
        return value;
    }

    public String requireEditableText(String text) {
        String value = normalizeText(text);
        if (!StringUtils.hasText(value)) {
            throw new BusinessException("消息内容不能为空");
        }
        return value;
    }

    public String requireMessageType(String type) {
        String value = StringUtils.hasText(type) ? type.trim().toLowerCase() : "text";
        if (!MESSAGE_TYPES.contains(value)) {
            throw new BusinessException("暂不支持该消息类型");
        }
        return value;
    }

    public String requireReaction(String code) {
        String value = code == null ? "" : code.trim().toLowerCase();
        if (!REACTIONS.contains(value)) {
            throw new BusinessException("不支持该表情回应");
        }
        return value;
    }
}
