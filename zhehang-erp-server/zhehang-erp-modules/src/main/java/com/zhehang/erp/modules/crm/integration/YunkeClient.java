package com.zhehang.erp.modules.crm.integration;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.crm.domain.YunkeConfig;
import com.zhehang.erp.modules.crm.mapper.YunkeConfigMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * 云客开放平台调用底座。
 *
 * <p>统一封装:读凭证(biz_yunke_config)→ 算签名 → 组 Header → POST JSON → 返回 JsonNode。</p>
 * <p>签名规则:sign = MD5(签名KEY + company + partnerId + timestamp).toUpperCase();
 *    Header 带 company / partnerId / timestamp / sign,Content-Type application/json。</p>
 * <p>partnerId 分两种:管理员级(查全公司数据,用 {@link #call})、员工级
 *    (如外呼,partnerId=员工云客userId,用 {@link #callAs})。</p>
 * <p>前置:云客后台需把我方服务器公网IP加入安全IP白名单,否则会被拦截。</p>
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class YunkeClient {

    private final YunkeConfigMapper configMapper;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10)).build();

    /** 读取当前登录租户配置，禁止退化为“数据库第一条配置”。 */
    public YunkeConfig getConfig() {
        Long tenantId = SecurityUtils.getCurrentTenantId();
        if (tenantId == null) {
            throw new BusinessException("当前登录身份缺少租户，无法读取云客配置");
        }
        return getConfig(tenantId);
    }

    /** 按明确租户读取唯一配置，供受控定时任务使用。 */
    public YunkeConfig getConfig(Long tenantId) {
        if (tenantId == null) {
            throw new BusinessException("云客配置缺少租户归属");
        }
        return configMapper.selectOne(new LambdaQueryWrapper<YunkeConfig>()
                .eq(YunkeConfig::getTenantId, tenantId)
                .last("limit 1"));
    }

    /** 定时任务只遍历已明确归属租户且已启用的配置。 */
    public List<YunkeConfig> listEnabledConfigs() {
        return configMapper.selectList(new LambdaQueryWrapper<YunkeConfig>()
                .isNotNull(YunkeConfig::getTenantId)
                .eq(YunkeConfig::getEnabled, 1)
                .orderByAsc(YunkeConfig::getTenantId, YunkeConfig::getId));
    }

    /** 管理员级调用(partnerId = 管理员ID,查全公司数据) */
    public JsonNode call(String path, Map<String, Object> body) {
        YunkeConfig c = requireConfig();
        return doCall(c, c.getPartnerId(), path, body);
    }

    /** 使用调用方已按租户选定的配置，防止后台任务串租户。 */
    public JsonNode call(YunkeConfig config, String path, Map<String, Object> body) {
        YunkeConfig c = requireConfig(config);
        return doCall(c, c.getPartnerId(), path, body);
    }

    /** 员工级调用(partnerId = 员工云客userId,如外呼/查某员工数据) */
    public JsonNode callAs(String employeePartnerId, String path, Map<String, Object> body) {
        YunkeConfig c = requireConfig();
        return callAs(c, employeePartnerId, path, body);
    }

    /** 使用指定租户配置执行员工级调用。 */
    public JsonNode callAs(YunkeConfig config, String employeePartnerId, String path, Map<String, Object> body) {
        YunkeConfig c = requireConfig(config);
        if (!StringUtils.hasText(employeePartnerId)) {
            throw new RuntimeException("该操作需要员工的云客用户ID(partnerId),当前为空");
        }
        return doCall(c, employeePartnerId, path, body);
    }

    private YunkeConfig requireConfig() {
        return requireConfig(getConfig());
    }

    private YunkeConfig requireConfig(YunkeConfig c) {
        if (c == null || !StringUtils.hasText(c.getSignKey()) || !StringUtils.hasText(c.getCompany())
                || !StringUtils.hasText(c.getPartnerId())) {
            throw new RuntimeException("云客凭证未配置,请先到「云客集成配置」填写企业串码/管理员ID/签名KEY");
        }
        if (c.getTenantId() == null) {
            throw new BusinessException("云客配置未绑定租户，已拒绝调用");
        }
        if (c.getEnabled() != null && c.getEnabled() == 0) {
            throw new RuntimeException("云客集成已停用,请在「云客集成配置」中启用");
        }
        return c;
    }

    private JsonNode doCall(YunkeConfig c, String partnerId, String path, Map<String, Object> body) {
        try {
            long ts = System.currentTimeMillis();
            String sign = md5Upper(c.getSignKey() + c.getCompany() + partnerId + ts);
            String base = StringUtils.hasText(c.getBaseUrl()) ? c.getBaseUrl().trim() : "https://phone.yunkecn.com";
            String url = base + path;
            String json = objectMapper.writeValueAsString(body == null ? Collections.emptyMap() : body);
            HttpRequest req = HttpRequest.newBuilder(URI.create(url))
                    .header("Content-Type", "application/json")
                    .header("company", c.getCompany())
                    .header("partnerId", partnerId)
                    .header("timestamp", String.valueOf(ts))
                    .header("sign", sign)
                    .timeout(Duration.ofSeconds(20))
                    .POST(HttpRequest.BodyPublishers.ofString(json, StandardCharsets.UTF_8))
                    .build();
            HttpResponse<String> resp = httpClient.send(req, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
            log.info("[云客] POST {} status={} result={}", path, resp.statusCode(), summarizeResponse(resp.body()));
            return objectMapper.readTree(resp.body() == null || resp.body().isBlank() ? "{}" : resp.body());
        } catch (Exception e) {
            log.warn("[云客] 调用失败 path={} type={}", path, e.getClass().getSimpleName());
            throw new RuntimeException("云客服务暂时不可用", e);
        }
    }

    private String md5Upper(String s) throws Exception {
        MessageDigest md = MessageDigest.getInstance("MD5");
        byte[] d = md.digest(s.getBytes(StandardCharsets.UTF_8));
        StringBuilder sb = new StringBuilder();
        for (byte b : d) sb.append(String.format("%02X", b));
        return sb.toString();
    }

    private String summarizeResponse(String body) {
        try {
            JsonNode root = objectMapper.readTree(body == null || body.isBlank() ? "{}" : body);
            JsonNode data = root.path("data");
            int records = 0;
            if (data.path("records").isArray()) records = data.path("records").size();
            else if (data.path("messages").isArray()) records = data.path("messages").size();
            else if (data.path("data").isArray()) records = data.path("data").size();
            return "success=" + root.path("success").asBoolean(false)
                    + ",code=" + root.path("code").asText("")
                    + ",total=" + data.path("total").asInt(data.path("totalElements").asInt(0))
                    + ",size=" + data.path("size").asInt(records)
                    + ",records=" + records
                    + ",batchIdPresent=" + !data.path("batchId").asText("").isBlank();
        } catch (Exception e) {
            return "unparseable-response";
        }
    }
}
