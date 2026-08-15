package com.zhehang.erp.modules.crm.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.crm.domain.BizCallRecord;
import com.zhehang.erp.modules.crm.domain.BizYunkeUserMap;
import com.zhehang.erp.modules.crm.domain.YunkeConfig;
import com.zhehang.erp.modules.crm.integration.YunkeClient;
import com.zhehang.erp.modules.crm.mapper.BizCallRecordMapper;
import com.zhehang.erp.modules.crm.mapper.BizYunkeUserMapMapper;
import com.zhehang.erp.modules.crm.mapper.CrmLeadMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 云客手机通话记录同步服务。
 *
 * <p>云客完整话单有两条路径:回调推送和"未同步数据获取"补拉。两边统一走这里 upsert,
 * 避免同一通电话重复写入,也避免长备注/长手机号把数据库字段撑爆。</p>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class YunkeCallRecordSyncService {

    private static final DateTimeFormatter YMD_HMS = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final YunkeClient yunkeClient;
    private final BizCallRecordMapper callRecordMapper;
    private final BizYunkeUserMapMapper yunkeUserMapMapper;
    private final CrmLeadMapper crmLeadMapper;
    private final ObjectMapper objectMapper;

    /**
     * 从云客"未同步通话记录"队列分批补拉。
     *
     * @param maxBatches 最多拉多少批,云客单批最大 100 条
     * @param batchSize  单批条数,最大 100
     * @param deleteAfterSave 落库成功后是否删除云客未同步队列里的对应批次
     */
    public Map<String, Object> syncFailedRecords(int maxBatches, int batchSize, boolean deleteAfterSave) {
        return syncFailedRecords(yunkeClient.getConfig(), maxBatches, batchSize, deleteAfterSave);
    }

    /** 后台任务必须传入已经按租户选定的配置。 */
    public Map<String, Object> syncFailedRecords(YunkeConfig cfg, int maxBatches, int batchSize,
                                                  boolean deleteAfterSave) {
        Map<String, Object> out = new LinkedHashMap<>();
        if (cfg == null || (cfg.getEnabled() != null && cfg.getEnabled() == 0)
                || !StringUtils.hasText(cfg.getCompany())
                || !StringUtils.hasText(cfg.getPartnerId())
                || !StringUtils.hasText(cfg.getSignKey())) {
            out.put("skipped", true);
            out.put("message", "云客未启用或凭证不完整");
            return out;
        }
        Long tenantId = requireTenant(cfg.getTenantId());

        int limitBatches = Math.max(1, Math.min(maxBatches, 100));
        int size = Math.max(1, Math.min(batchSize, 100));
        int inserted = 0;
        int updated = 0;
        int skipped = 0;
        int failed = 0;
        int returned = 0;
        int batches = 0;
        int deletedBatches = 0;
        int yunkeTotal = 0;
        String lastBatchId = null;

        for (int i = 0; i < limitBatches; i++) {
            JsonNode resp = yunkeClient.call(cfg, "/open/sync/getFailedCallRecords",
                    Map.of("autoDelete", false, "size", size, "sort", true));
            if (!resp.path("success").asBoolean(false)) {
                throw new RuntimeException("云客未同步通话记录获取失败: " + resp.path("message").asText(""));
            }

            JsonNode data = resp.path("data");
            if (data == null || data.isMissingNode() || data.isNull()) break;
            yunkeTotal = Math.max(yunkeTotal, data.path("total").asInt(0));
            JsonNode records = data.path("records");
            if (!records.isArray() || records.size() == 0) break;

            batches++;
            returned += records.size();
            String batchId = text(data, "batchId");
            boolean batchOk = true;
            for (JsonNode n : records) {
                try {
                    Map<String, Object> record = objectMapper.convertValue(n, new TypeReference<Map<String, Object>>() {});
                    UpsertResult r = upsertFromYunkeRecord(tenantId, record);
                    if (r == UpsertResult.INSERTED) inserted++;
                    else if (r == UpsertResult.UPDATED) updated++;
                    else skipped++;
                } catch (Exception e) {
                    failed++;
                    batchOk = false;
                    log.warn("[云客通话补同步] 单条落库失败 type={}", e.getClass().getSimpleName());
                }
            }

            if (!deleteAfterSave) break;
            if (!batchOk) {
                log.warn("[云客通话补同步] 本批存在落库失败,不删除云客 batchId={}", batchId);
                break;
            }
            if (!StringUtils.hasText(batchId)) {
                log.warn("[云客通话补同步] 云客未返回 batchId,停止继续补拉以避免重复循环");
                break;
            }
            removeFailedBatch(cfg, batchId);
            deletedBatches++;
            if (batchId.equals(lastBatchId)) break;
            lastBatchId = batchId;
            if (records.size() < size) break;
        }

        out.put("yunkeTotal", yunkeTotal);
        out.put("returned", returned);
        out.put("inserted", inserted);
        out.put("updated", updated);
        out.put("skipped", skipped);
        out.put("failed", failed);
        out.put("batches", batches);
        out.put("deletedBatches", deletedBatches);
        return out;
    }

    /** 按云客话单 id upsert 一条完整通话记录。 */
    public UpsertResult upsertFromYunkeRecord(Map<String, Object> m) {
        return upsertFromYunkeRecord(requireTenant(SecurityUtils.getCurrentTenantId()), m);
    }

    /** 按明确租户 upsert 一条完整通话记录。 */
    public UpsertResult upsertFromYunkeRecord(Long tenantId, Map<String, Object> m) {
        tenantId = requireTenant(tenantId);
        String platformId = str(m, "id", "callRecordId", "recordId", "uuid", "voiceId", "callId");
        if (!StringUtils.hasText(platformId)) return UpsertResult.SKIPPED;
        platformId = limit(platformId, 64);
        String dialCallId = limit(str(m, "callId"), 64);

        BizCallRecord record = callRecordMapper.selectOne(new LambdaQueryWrapper<BizCallRecord>()
                .eq(BizCallRecord::getTenantId, tenantId)
                .eq(BizCallRecord::getPlatformCallId, platformId)
                .last("limit 1"));
        if (record == null && StringUtils.hasText(dialCallId) && !dialCallId.equals(platformId)) {
            record = callRecordMapper.selectOne(new LambdaQueryWrapper<BizCallRecord>()
                    .eq(BizCallRecord::getTenantId, tenantId)
                    .eq(BizCallRecord::getPlatformCallId, dialCallId)
                    .last("limit 1"));
        }
        boolean isNew = record == null;
        if (isNew) record = new BizCallRecord();

        String yunkeUserId = str(m, "userId", "yunkeUserId", "staffId", "partnerId");
        String userPhone = str(m, "userPhone", "staffPhone", "agentPhone", "simPhone");
        String agentName = str(m, "userName", "agentName", "staffName", "salesName", "nickname");
        BizYunkeUserMap userMap = resolveUserMap(tenantId, yunkeUserId, userPhone, agentName);
        String customerName = str(m, "customerName", "customer", "companyName");
        String phone = str(m, "phone", "customerNumber", "calledNumber", "customerPhone", "otherNumber", "clientNumber", "mobile");
        Integer duration = intVal(m, "duration", "callDuration", "talkTime", "billSec", "timeLength", "talkDuration");
        String recordUrl = str(m, "recordUrl", "recordFileUrl", "voiceUrl", "fileUrl", "recordPath", "url", "recordingUrl");
        LocalDateTime callTime = parseTime(str(m, "createTime", "startCallTime", "callTime", "beginTime", "time", "ringTime"));
        Integer connected = connected(m, duration);
        String directionText = directionText(str(m, "direction", "callType", "callWay", "type"));

        record.setCallType("platform");
        record.setTenantId(tenantId);
        if (!StringUtils.hasText(record.getPlatformCallId())) {
            record.setPlatformCallId(platformId);
        }
        if (StringUtils.hasText(customerName)) {
            record.setCustomerName(limit(customerName, 200));
        }
        if (StringUtils.hasText(phone)) {
            record.setPhone(limit(phone, 32));
        }
        // 自动关联线索:按客户手机号取最新一条线索,让云客话单(含录音)能进入客户360时间线。
        // 只在尚未关联时补,绝不覆盖已有关联;查询失败不影响话单落库。
        if (record.getLeadId() == null && StringUtils.hasText(phone)) {
            try {
                record.setLeadId(crmLeadMapper.selectLatestLeadIdByPhone(tenantId, limit(phone, 32)));
            } catch (Exception e) {
                log.debug("[云客话单] 按手机号关联线索失败 type={}", e.getClass().getSimpleName());
            }
        }
        if (userMap != null) {
            record.setAgentId(userMap.getUserId());
            record.setAgentName(limit(StringUtils.hasText(userMap.getUserName())
                    ? userMap.getUserName() : agentName, 64));
        } else if (StringUtils.hasText(agentName) || StringUtils.hasText(yunkeUserId)) {
            record.setAgentName(limit(StringUtils.hasText(agentName) ? agentName : yunkeUserId, 64));
        }
        if (callTime != null) record.setCallTime(callTime);
        if (duration != null) record.setDuration(duration);
        if (recordUrl != null) record.setRecordUrl(limit(recordUrl, 1000));
        if (connected != null) record.setConnected(connected);
        // 系统外呼小结已先写入时,云客补同步只补时长/录音,不能覆盖销售填写的结果与小结。
        boolean hasSalesSummary = !isNew && StringUtils.hasText(record.getRemark())
                && !record.getRemark().startsWith("云客通话记录同步");
        if (!hasSalesSummary) {
            record.setResult(limit(directionText + (connected != null && connected == 1 ? "·已接通" : "·未接通"), 32));
            record.setRemark(buildRemark(m));
        }

        if (isNew) {
            try {
                callRecordMapper.insert(record);
                return UpsertResult.INSERTED;
            } catch (DuplicateKeyException e) {
                BizCallRecord existing = callRecordMapper.selectOne(new LambdaQueryWrapper<BizCallRecord>()
                        .eq(BizCallRecord::getTenantId, tenantId)
                        .eq(BizCallRecord::getPlatformCallId, platformId)
                        .last("limit 1"));
                if (existing == null) throw e;
                record.setId(existing.getId());
                callRecordMapper.updateById(record);
                return UpsertResult.UPDATED;
            }
        }
        callRecordMapper.updateById(record);
        return UpsertResult.UPDATED;
    }

    private void removeFailedBatch(YunkeConfig cfg, String batchId) {
        JsonNode resp = yunkeClient.call(cfg, "/open/sync/removeFailedCallRecordsByBatchId", Map.of("batchId", batchId));
        if (!resp.path("success").asBoolean(false)) {
            throw new RuntimeException("云客未同步批次删除失败: " + resp.path("message").asText(""));
        }
    }

    private BizYunkeUserMap resolveUserMap(Long tenantId, String yunkeUserId, String userPhone, String agentName) {
        BizYunkeUserMap result = findUserMap(tenantId, BizYunkeUserMap::getYunkeUserId, yunkeUserId);
        if (result != null) return result;
        result = findUserMap(tenantId, BizYunkeUserMap::getYunkePhone, userPhone);
        if (result != null) return result;
        result = findUserMap(tenantId, BizYunkeUserMap::getUserPhone, userPhone);
        if (result != null) return result;
        result = findUserMap(tenantId, BizYunkeUserMap::getYunkeNickname, agentName);
        if (result != null) return result;
        return findUserMap(tenantId, BizYunkeUserMap::getUserName, agentName);
    }

    private BizYunkeUserMap findUserMap(
            Long tenantId,
            com.baomidou.mybatisplus.core.toolkit.support.SFunction<BizYunkeUserMap, ?> column,
            String value) {
        if (!StringUtils.hasText(value)) return null;
        return yunkeUserMapMapper.selectOne(new LambdaQueryWrapper<BizYunkeUserMap>()
                .eq(BizYunkeUserMap::getTenantId, tenantId)
                .eq(column, value.trim()).last("LIMIT 1"));
    }

    private Long requireTenant(Long tenantId) {
        if (tenantId == null) {
            throw new BusinessException("云客数据缺少明确租户归属，已拒绝同步");
        }
        return tenantId;
    }

    private String buildRemark(Map<String, Object> m) {
        StringBuilder sb = new StringBuilder("云客通话记录同步");
        append(sb, "客户备注", str(m, "remark"));
        append(sb, "通话备注", str(m, "remarkRecord"));
        append(sb, "标签", str(m, "tipTypeString", "tipName"));
        append(sb, "号码状态", str(m, "statusName"));
        append(sb, "外呼ID", str(m, "callId"));
        append(sb, "员工手机", str(m, "userPhone"));
        append(sb, "SIM", str(m, "simPhone"));
        return limit(sb.toString(), 500);
    }

    private void append(StringBuilder sb, String label, String value) {
        if (!StringUtils.hasText(value)) return;
        sb.append('|').append(label).append('=').append(value);
    }

    private Integer connected(Map<String, Object> m, Integer duration) {
        Boolean through = boolVal(m, "through", "connected", "answered", "isConnected");
        if (through != null) return through ? 1 : 0;
        Integer v = intVal(m, "connected", "answered", "isConnected");
        if (v != null) return v == 1 ? 1 : 0;
        return duration != null && duration > 0 ? 1 : 0;
    }

    private String directionText(String raw) {
        if (!StringUtils.hasText(raw)) return "通话";
        try {
            int v = (int) Double.parseDouble(raw.trim());
            if (v == 0 || v == 2) return "呼出";
            if (v == 1) return "呼入";
        } catch (Exception ignore) {
            if (raw.contains("呼出")) return "呼出";
            if (raw.contains("呼入")) return "呼入";
        }
        return "通话";
    }

    private LocalDateTime parseTime(String s) {
        if (!StringUtils.hasText(s)) return null;
        s = s.trim().replace('T', ' ');
        if (s.matches("\\d{10,13}")) {
            try {
                long v = Long.parseLong(s);
                if (s.length() == 10) v *= 1000;
                return LocalDateTime.ofInstant(Instant.ofEpochMilli(v), ZoneId.systemDefault());
            } catch (Exception ignore) { }
        }
        try { return LocalDateTime.parse(s, YMD_HMS); }
        catch (Exception ignore) { return null; }
    }

    private String str(Map<String, Object> m, String... keys) {
        for (String k : keys) {
            Object v = m.get(k);
            if (v != null && !String.valueOf(v).isBlank()) return String.valueOf(v);
        }
        return null;
    }

    private String text(JsonNode n, String key) {
        JsonNode v = n.get(key);
        if (v == null || v.isNull()) return null;
        String s = v.asText("");
        return StringUtils.hasText(s) ? s : null;
    }

    private Integer intVal(Map<String, Object> m, String... keys) {
        String s = str(m, keys);
        if (!StringUtils.hasText(s)) return null;
        try { return (int) Double.parseDouble(s.trim()); } catch (Exception e) { return null; }
    }

    private Boolean boolVal(Map<String, Object> m, String... keys) {
        String s = str(m, keys);
        if (!StringUtils.hasText(s)) return null;
        if ("true".equalsIgnoreCase(s) || "1".equals(s)) return true;
        if ("false".equalsIgnoreCase(s) || "0".equals(s)) return false;
        return null;
    }

    private String limit(String value, int max) {
        if (value == null) return null;
        return value.length() <= max ? value : value.substring(0, max);
    }

    public enum UpsertResult {
        INSERTED, UPDATED, SKIPPED
    }
}
