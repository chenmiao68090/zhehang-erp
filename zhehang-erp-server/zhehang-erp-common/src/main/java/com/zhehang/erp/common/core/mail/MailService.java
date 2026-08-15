package com.zhehang.erp.common.core.mail;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * 邮件发送服务。
 * <p>SMTP 连接信息来自 spring.mail.*(由服务器环境变量 MAIL_HOST/MAIL_PORT/MAIL_USERNAME/MAIL_PASSWORD 提供)。
 * 未配置(无 JavaMailSender 或 username 为空)时 {@link #isConfigured()} 返回 false、{@link #send} 抛出明确异常,
 * 调用方据此优雅降级,绝不静默谎报"已发送"。
 */
@Service
public class MailService {

    private final ObjectProvider<JavaMailSender> mailSenderProvider;

    /** 发件人地址,默认等于 SMTP 登录账号(spring.mail.username)。 */
    @Value("${spring.mail.username:}")
    private String from;

    /** 发件人显示名称(可选)。 */
    @Value("${spring.mail.from-name:浙杭集团}")
    private String fromName;

    public MailService(ObjectProvider<JavaMailSender> mailSenderProvider) {
        this.mailSenderProvider = mailSenderProvider;
    }

    /** 邮件服务是否已配置可用。 */
    public boolean isConfigured() {
        return mailSenderProvider.getIfAvailable() != null && StringUtils.hasText(from);
    }

    /**
     * 发送一封邮件。content 含 HTML 标签时按 HTML 发送,否则按纯文本。
     * 失败抛 RuntimeException(含原因),调用方负责记录/提示。
     */
    public void send(String to, String subject, String content) {
        JavaMailSender sender = mailSenderProvider.getIfAvailable();
        if (sender == null || !StringUtils.hasText(from)) {
            throw new IllegalStateException("邮件服务未配置:请在服务器设置 MAIL_HOST/MAIL_PORT/MAIL_USERNAME/MAIL_PASSWORD 环境变量后重启后端");
        }
        if (!StringUtils.hasText(to)) {
            throw new IllegalArgumentException("收件人邮箱为空");
        }
        try {
            MimeMessage message = sender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");
            try {
                helper.setFrom(from, fromName);
            } catch (Exception ignore) {
                helper.setFrom(from);
            }
            helper.setTo(to);
            helper.setSubject(subject == null ? "" : subject);
            boolean html = content != null && content.contains("<") && content.contains(">");
            helper.setText(content == null ? "" : content, html);
            sender.send(message);
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException(e.getMessage(), e);
        }
    }
}
