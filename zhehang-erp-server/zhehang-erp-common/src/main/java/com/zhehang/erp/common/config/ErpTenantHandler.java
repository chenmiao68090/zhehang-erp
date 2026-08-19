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

    /**
     * 不做租户过滤的表。两类:
     * <ol>
     *   <li>不含 tenant_id 列的系统/RBAC 表,否则查询会报 unknown column;</li>
     *   <li>确实不含 tenant_id 或明确属于平台公共配置的数据表。</li>
     * </ol>
     */
    private static final Set<String> IGNORE_TABLES = Set.of(
            "sys_error_log",
            "sys_login_log",
            "sys_oper_log",
            "sys_role_menu",
            "sys_user_role",
            "sys_role_permission",    // 角色-权限点关联(与 sys_role_menu 同口径,不含 tenant_id)
            "fin_pay_channel",        // 收款中心渠道(全公司共享;阶段2支付回调免登录读取)
            "fin_pay_transaction",    // 收款中心流水(阶段2微信/支付宝回调免登录写入,防租户过滤坑)
            "fin_pay_import_batch"    // 收款中心导入批次(与流水同口径)
    );

    @Override
    public Expression getTenantId() {
        Long tenantId = SecurityUtils.getCurrentTenantId();
        if (tenantId != null) {
            return new LongValue(tenantId);
        }
        if (SecurityUtils.hasAuthenticatedUser()) {
            // 已认证却没有租户的 token 必须失败收紧，不能退化成全表查询。
            throw new IllegalStateException("已认证账号缺少租户上下文");
        }
        return new NullValue();
    }

    @Override
    public String getTenantIdColumn() {
        return "tenant_id";
    }

    @Override
    public boolean ignoreTable(String tableName) {
        String normalized = tableName.replace("`", "").trim().toLowerCase();
        if (IGNORE_TABLES.contains(normalized)) {
            return true;
        }
        // 只有未鉴权的登录查询/受控系统任务可在无租户上下文时运行。
        // 已鉴权但 tenantId 为 null 时返回 false，随后 getTenantId() 会直接拒绝。
        return SecurityUtils.getCurrentTenantId() == null && !SecurityUtils.hasAuthenticatedUser();
    }
}
