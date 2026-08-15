package com.zhehang.erp.common.core.audit;

/**
 * 代登录请求的同步审计持久化端口。
 *
 * <p>接口位于 common，具体数据库实现位于 modules，避免公共 Web 闸门反向依赖业务模块。
 * {@link #begin(Entry)} 必须在业务处理前完成并提交；如果不能可靠落库，调用方必须
 * fail-closed，不得继续执行被模拟身份下的业务请求。</p>
 */
public interface ImpersonationAuditSink {

    int STATUS_SUCCESS = 0;
    int STATUS_FAILURE = 1;
    int STATUS_PROCESSING = 2;

    /**
     * 同步预写一条“处理中”记录并返回其数据库主键。
     *
     * @throws RuntimeException 预写未成功或无法取得主键时抛出
     */
    Long begin(Entry entry);

    /**
     * 精确更新同一条预写记录的最终状态。
     *
     * @throws RuntimeException 目标记录不存在、已经结束或更新失败时抛出
     */
    void complete(Long auditId, int status, String errorMessage, long costTime);

    /**
     * 只保存追责所需的最小字段，不保存请求体、响应体或任何员工敏感资料。
     */
    record Entry(
            String module,
            String operationType,
            String operator,
            Long operatorId,
            Long actorUserId,
            String actorUsername,
            Long effectiveUserId,
            String effectiveUsername,
            String impersonationSessionId,
            Long tenantId,
            String method,
            String requestUri,
            String requestMethod,
            String ipAddress) {
    }
}
