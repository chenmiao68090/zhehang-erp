package com.zhehang.erp.common.i18n;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.context.NoSuchMessageException;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Component;

import java.util.Locale;

/**
 * Message resolution utility for i18n error codes and prompts.
 * Reads messages from i18n/messages_{locale}.properties via Spring MessageSource.
 * Locale is resolved from the current request's Accept-Language header.
 */
@Component
public class MessageUtils {

    private static MessageSource messageSource;

    @Autowired
    public MessageUtils(MessageSource messageSource) {
        MessageUtils.messageSource = messageSource;
    }

    /**
     * Resolve a message by code using the current request locale.
     *
     * @param code message key (e.g. error.user.not.found)
     * @param args optional placeholder arguments
     * @return resolved message; falls back to the code itself if not found
     */
    public static String getMessage(String code, Object... args) {
        return getMessage(code, LocaleContextHolder.getLocale(), args);
    }

    /**
     * Resolve a message by code using the supplied locale.
     */
    public static String getMessage(String code, Locale locale, Object... args) {
        if (messageSource == null) {
            return code;
        }
        try {
            return messageSource.getMessage(code, args, locale);
        } catch (NoSuchMessageException e) {
            return code;
        }
    }

    /**
     * Resolve a message and fall back to a default if missing.
     */
    public static String getMessageOrDefault(String code, String defaultMessage, Object... args) {
        if (messageSource == null) {
            return defaultMessage;
        }
        return messageSource.getMessage(code, args, defaultMessage, LocaleContextHolder.getLocale());
    }
}
