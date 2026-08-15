package com.zhehang.erp.common.core.annotation;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 代登录期间禁止访问。
 *
 * <p>用于标记即使是只读请求也不能通过员工视角查看的敏感控制器或方法，
 * 例如私人消息、工资、身份证件、银行卡、密钥和受保护附件。</p>
 */
@Target({ElementType.TYPE, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface DenyDuringImpersonation {

    /** 仅用于代码审计说明，不向客户端暴露敏感细节。 */
    String reason() default "敏感能力";
}
