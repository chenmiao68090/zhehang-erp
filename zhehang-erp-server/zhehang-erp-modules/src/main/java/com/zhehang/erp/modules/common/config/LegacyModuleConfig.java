package com.zhehang.erp.modules.common.config;

import com.zhehang.erp.modules.common.interceptor.LegacyReadOnlyInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/** 注册旧模块（旧订单/旧任务）的写入冻结闸门，只读放行。 */
@Configuration
public class LegacyModuleConfig implements WebMvcConfigurer {

    private final LegacyReadOnlyInterceptor legacyReadOnlyInterceptor;

    public LegacyModuleConfig(LegacyReadOnlyInterceptor legacyReadOnlyInterceptor) {
        this.legacyReadOnlyInterceptor = legacyReadOnlyInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(legacyReadOnlyInterceptor)
                // 拦截旧订单和旧任务的写入路径
                .addPathPatterns("/order/**", "/task/**")
                // 排除仍在使用的子路径。基础路径与 /** 两种写法都列出：
                // BizAddressOrderController.save() 等挂在裸路径（POST /order/address-order），
                // 显式列全避免依赖 /** 是否匹配零层级的匹配器差异。
                .excludePathPatterns(
                        "/order/address-order", "/order/address-order/**",   // 地址提单仍在用
                        "/order/renewal-order", "/order/renewal-order/**",   // 续费提单仍在用
                        // 审单中心：上面两类提单的真人审核节点（合同审理/到款确认/分配/接单/完成）。
                        // 提单还在用，审单链路就必须能写，否则提交的单子无人可审。
                        // 另有 /business-review 业务消息深链，办事人员无菜单也会直接进来操作。
                        "/order/review", "/order/review/**",
                        "/task/handover", "/task/handover/**",               // 交接流程仍在用
                        "/task-workbench/**"                                 // 飞哥任务工作台（路径不同，但防万一）
                );
        // 注意：以下路径不在 addPathPatterns 范围内，天然不受影响：
        // /workflow/** (审批引擎)
        // /seal/** (印章体系，含 /seal/order)
        // /gs/** (工商业务，含 /gs/order)
        // /bookkeeping-order/** (代账提单)
        // /feige-order-contract/** (飞哥订单)
        // /feige-task/** (飞哥任务)
    }
}
