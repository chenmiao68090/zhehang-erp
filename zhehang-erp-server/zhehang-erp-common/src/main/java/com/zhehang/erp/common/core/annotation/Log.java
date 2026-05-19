package com.zhehang.erp.common.core.annotation;

import java.lang.annotation.*;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface Log {
    /** Module name */
    String module() default "";

    /** Operation type */
    OperationType type() default OperationType.OTHER;

    enum OperationType {
        INSERT,
        UPDATE,
        DELETE,
        QUERY,
        EXPORT,
        IMPORT,
        OTHER
    }
}