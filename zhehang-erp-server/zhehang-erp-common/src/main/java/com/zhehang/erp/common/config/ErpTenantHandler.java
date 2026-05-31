package com.zhehang.erp.common.config;

import com.baomidou.mybatisplus.extension.plugins.handler.TenantLineHandler;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import net.sf.jsqlparser.expression.Expression;
import net.sf.jsqlparser.expression.LongValue;
import net.sf.jsqlparser.expression.NullValue;

import java.util.Set;

/**
 * 多租户处理器。
 *
 * <p>为含 {@code tenant_id} 列的表自动追加 {@code tenant_id = ?} 过滤条件,实现数据隔离。</p>
 *
 * <p>两类放行场景:</p>
 * <ul>
 *   <li><b>无登录租户上下文</b>(登录、刷新 token、系统启动、定时任务等):此时
 *       {@link SecurityUtils#getCurrentTenantId()} 为 null,直接忽略租户过滤,
 *       否则登录查询 sys_user 会被错误地拼上 {@code tenant_id IS NULL} 而失败。</li>
 *   <li><b>不含 tenant_id 列的表</b>:日志表与 RBAC 关联表,见 {@link #IGNORE_TABLES}。</li>
 * </ul>
 */
public class ErpTenantHandler implements TenantLineHandler {

    /** 不含 tenant_id 列的表,必须忽略,否则查询会报 unknown column */
    private static final Set<String> IGNORE_TABLES = Set.of(
            "sys_error_log",
            "sys_login_log",
            "sys_oper_log",
            "sys_role_menu",
            "sys_user_role"
    );

    @Override
    public Expression getTenantId() {
        Long tenantId = SecurityUtils.getCurrentTenantId();
        return tenantId != null ? new LongValue(tenantId) : new NullValue();
    }

    @Override
    public String getTenantIdColumn() {
        return "tenant_id";
    }

    @Override
    public boolean ignoreTable(String tableName) {
        // 无租户上下文时(登录/系统任务)全部放行,避免污染未鉴权查询
        if (SecurityUtils.getCurrentTenantId() == null) {
            return true;
        }
        String normalized = tableName.replace("`", "").trim().toLowerCase();
        return IGNORE_TABLES.contains(normalized);
    }
}
