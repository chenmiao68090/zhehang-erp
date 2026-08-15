package com.zhehang.erp.common.core.annotation;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 显式声明非 GET 接口在代登录期间仅执行只读查询。
 *
 * <p>代登录闸门对 POST/PUT/PATCH/DELETE 默认失败收紧；只有完成真实调用链审计、
 * 确认不写数据库、不发外部指令且不签发凭据的接口才能使用本注解。</p>
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface AllowDuringImpersonationRead {

    /** 必填式审计备注，说明为何该非 GET 接口仍属于只读。 */
    String value();
}
