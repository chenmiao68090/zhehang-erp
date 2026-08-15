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

    /** 是否把方法请求参数写入操作日志。批量导入等含客户明细的接口必须关闭。 */
    boolean saveRequestData() default true;

    /** 是否把方法返回值写入操作日志。返回客户明细或敏感结果的接口必须关闭。 */
    boolean saveResponseData() default true;

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
