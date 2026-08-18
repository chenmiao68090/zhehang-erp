package com.zhehang.erp.modules.feigesuite.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.feigesuite.domain.dto.FeigeSuiteRequests;
import com.zhehang.erp.modules.feigesuite.domain.entity.FeigeSuiteAuditLog;
import com.zhehang.erp.modules.feigesuite.domain.entity.FeigeSuiteRecord;
import com.zhehang.erp.modules.feigesuite.mapper.FeigeSuiteAuditLogMapper;
import com.zhehang.erp.modules.feigesuite.mapper.FeigeSuiteRecordMapper;
import com.zhehang.erp.modules.system.domain.entity.SysUser;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FeigeSuiteRecordService {
    private static final int MAX_PAGE_SIZE = 100;
    private static final int MAX_JSON_LENGTH = 64 * 1024;

    private final FeigeSuiteRecordMapper recordMapper;
    private final FeigeSuiteAuditLogMapper auditLogMapper;
    private final FeigeSuitePageRegistry registry;
    private final FeigeSuiteAccessService access;
    private final ObjectMapper objectMapper;

    public Map<String, Object> page(String pageCode, Integer pageNum, Integer pageSize,
                                    String keyword, String status, String categoryCode, Long ownerId,
                                    String filters, LocalDate startDate, LocalDate endDate) {
        FeigeSuitePageRegistry.PageDefinition definition = registry.require(pageCode);
        int current = Math.max(1, pageNum == null ? 1 : pageNum);
        int size = Math.max(1, Math.min(MAX_PAGE_SIZE, pageSize == null ? 20 : pageSize));
        if (startDate != null && endDate != null && startDate.isAfter(endDate)) {
            throw new BusinessException("开始日期不能晚于结束日期");
        }
        LambdaQueryWrapper<FeigeSuiteRecord> wrapper = baseWrapper(definition);
        if (StringUtils.hasText(keyword)) {
            String value = keyword.trim();
            wrapper.and(w -> w.like(FeigeSuiteRecord::getTitle, value)
                    .or().like(FeigeSuiteRecord::getRecordNo, value)
                    .or().like(FeigeSuiteRecord::getOwnerName, value)
                    .or().like(FeigeSuiteRecord::getSearchText, value));
        }
        wrapper.eq(StringUtils.hasText(status), FeigeSuiteRecord::getStatus, status)
                .eq(StringUtils.hasText(categoryCode), FeigeSuiteRecord::getCategoryCode, categoryCode)
                .eq(ownerId != null, FeigeSuiteRecord::getOwnerId, ownerId)
                .ge(startDate != null, FeigeSuiteRecord::getBizDate, startDate)
                .le(endDate != null, FeigeSuiteRecord::getBizDate, endDate)
                .orderByAsc(FeigeSuiteRecord::getSortNo)
                .orderByDesc(FeigeSuiteRecord::getBizDate)
                .orderByDesc(FeigeSuiteRecord::getCreateTime)
                .orderByDesc(FeigeSuiteRecord::getId);
        applyCustomFilters(wrapper, filters);
        IPage<FeigeSuiteRecord> result = recordMapper.selectPage(new Page<>(current, size), wrapper);
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("records", result.getRecords().stream().map(this::view).toList());
        response.put("total", result.getTotal());
        response.put("current", result.getCurrent());
        response.put("size", result.getSize());
        response.put("pages", result.getPages());
        return response;
    }

    public Map<String, Object> detail(String pageCode, Long id) {
        FeigeSuitePageRegistry.PageDefinition definition = registry.require(pageCode);
        FeigeSuiteRecord record = requireRecord(pageCode, id);
        access.requireReadRecord(definition, record);
        Map<String, Object> result = view(record);
        result.put("logs", logs(pageCode, id));
        return result;
    }

    public Map<String, Object> summary(String pageCode) {
        FeigeSuitePageRegistry.PageDefinition definition = registry.require(pageCode);
        Map<String, Object> result = new LinkedHashMap<>();
        long total = recordMapper.selectCount(baseWrapper(definition));
        result.put("total", total);
        Map<String, Long> statusCounts = new LinkedHashMap<>();
        for (String status : definition.statuses()) {
            LambdaQueryWrapper<FeigeSuiteRecord> wrapper = baseWrapper(definition)
                    .eq(FeigeSuiteRecord::getStatus, status);
            statusCounts.put(status, recordMapper.selectCount(wrapper));
        }
        result.put("statuses", statusCounts);
        result.put("pageCode", pageCode);
        return result;
    }

    @Transactional(rollbackFor = Exception.class)
    public Long create(String pageCode, FeigeSuiteRequests.RecordUpsert request) {
        FeigeSuitePageRegistry.PageDefinition definition = registry.require(pageCode);
        Long ownerId = request.getOwnerId() == null ? access.currentUserId() : request.getOwnerId();
        access.requireCreate(definition, ownerId);
        SysUser owner = access.requireVisibleOwner(ownerId);
        String status = normalizeStatus(definition, request.getStatus());
        String dataJson = encodeData(request.getData());

        FeigeSuiteRecord record = new FeigeSuiteRecord();
        record.setPageCode(pageCode);
        record.setRecordNo(generateRecordNo(pageCode));
        record.setTitle(request.getTitle().trim());
        record.setCategoryCode(trimToNull(request.getCategoryCode()));
        record.setStatus(status);
        record.setOwnerId(owner.getId());
        record.setOwnerName(access.displayName(owner));
        record.setDeptId(owner.getDeptId());
        record.setDeptName(access.deptName(owner.getDeptId()));
        record.setAmount(nonNegative(request.getAmount()));
        record.setBizDate(request.getBizDate() == null ? LocalDate.now() : request.getBizDate());
        record.setDueDate(request.getDueDate());
        record.setSource("manual");
        record.setSortNo(request.getSortNo() == null ? 0 : request.getSortNo());
        record.setDataJson(dataJson);
        record.setSearchText(buildSearchText(record, request.getData()));
        record.setVersion(0);
        recordMapper.insert(record);
        writeLog(record, "create", null, status, "新建记录");
        return record.getId();
    }

    @Transactional(rollbackFor = Exception.class)
    public void update(String pageCode, Long id, FeigeSuiteRequests.RecordUpsert request) {
        FeigeSuitePageRegistry.PageDefinition definition = registry.require(pageCode);
        FeigeSuiteRecord record = requireRecord(pageCode, id);
        access.requireWriteRecord(definition, record);
        if (request.getVersion() != null && !Objects.equals(request.getVersion(), record.getVersion())) {
            throw new BusinessException("记录已被他人更新，请刷新后重试");
        }
        Long ownerId = request.getOwnerId() == null ? record.getOwnerId() : request.getOwnerId();
        access.requireOwnerAssignment(definition, record.getOwnerId(), ownerId);
        SysUser owner = access.requireVisibleOwner(ownerId);
        String oldStatus = record.getStatus();
        String status = normalizeStatus(definition, request.getStatus() == null ? oldStatus : request.getStatus());
        String dataJson = encodeData(request.getData());

        record.setTitle(request.getTitle().trim());
        record.setCategoryCode(trimToNull(request.getCategoryCode()));
        record.setStatus(status);
        record.setOwnerId(owner.getId());
        record.setOwnerName(access.displayName(owner));
        record.setDeptId(owner.getDeptId());
        record.setDeptName(access.deptName(owner.getDeptId()));
        record.setAmount(nonNegative(request.getAmount()));
        record.setBizDate(request.getBizDate() == null ? record.getBizDate() : request.getBizDate());
        record.setDueDate(request.getDueDate());
        record.setSortNo(request.getSortNo() == null ? record.getSortNo() : request.getSortNo());
        record.setDataJson(dataJson);
        record.setSearchText(buildSearchText(record, request.getData()));
        if (recordMapper.updateById(record) != 1) {
            throw new BusinessException("记录已被他人更新，请刷新后重试");
        }
        writeLog(record, "update", oldStatus, status, "修改记录");
    }

    @Transactional(rollbackFor = Exception.class)
    public void action(String pageCode, Long id, FeigeSuiteRequests.RecordAction request) {
        FeigeSuitePageRegistry.PageDefinition definition = registry.require(pageCode);
        FeigeSuiteRecord record = requireRecord(pageCode, id);
        access.requireWriteRecord(definition, record);
        if (!registry.isActionAllowed(definition, record.getStatus(), request.getAction())) {
            throw new BusinessException("当前状态不支持该操作，请刷新后重试");
        }
        if (request.getVersion() != null && !Objects.equals(request.getVersion(), record.getVersion())) {
            throw new BusinessException("记录已被他人更新，请刷新后重试");
        }
        String oldStatus = record.getStatus();
        String targetStatus = registry.targetStatus(definition, request.getAction());
        if (!definition.statuses().contains(targetStatus)) {
            throw new BusinessException("当前业务状态不支持该操作");
        }
        record.setStatus(targetStatus);
        if (recordMapper.updateById(record) != 1) {
            throw new BusinessException("记录已被他人更新，请刷新后重试");
        }
        writeLog(record, request.getAction(), oldStatus, targetStatus, trimToNull(request.getRemark()));
    }

    @Transactional(rollbackFor = Exception.class)
    public void delete(String pageCode, Long id) {
        FeigeSuitePageRegistry.PageDefinition definition = registry.require(pageCode);
        FeigeSuiteRecord record = requireRecord(pageCode, id);
        access.requireWriteRecord(definition, record);
        writeLog(record, "delete", record.getStatus(), record.getStatus(), "删除记录");
        recordMapper.deleteById(record.getId());
    }

    public List<Map<String, Object>> logs(String pageCode, Long id) {
        return auditLogMapper.selectList(new LambdaQueryWrapper<FeigeSuiteAuditLog>()
                        .eq(FeigeSuiteAuditLog::getPageCode, pageCode)
                        .eq(FeigeSuiteAuditLog::getRecordId, id)
                        .orderByDesc(FeigeSuiteAuditLog::getCreateTime)
                        .orderByDesc(FeigeSuiteAuditLog::getId))
                .stream().map(log -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("id", log.getId());
                    row.put("action", log.getAction());
                    row.put("fromStatus", log.getFromStatus());
                    row.put("toStatus", log.getToStatus());
                    row.put("operatorName", log.getOperatorName());
                    row.put("remark", log.getRemark());
                    row.put("createTime", log.getCreateTime());
                    return row;
                }).toList();
    }

    private LambdaQueryWrapper<FeigeSuiteRecord> baseWrapper(FeigeSuitePageRegistry.PageDefinition definition) {
        LambdaQueryWrapper<FeigeSuiteRecord> wrapper = new LambdaQueryWrapper<FeigeSuiteRecord>()
                .eq(FeigeSuiteRecord::getPageCode, definition.code());
        access.applyScope(definition, wrapper);
        return wrapper;
    }

    private FeigeSuiteRecord requireRecord(String pageCode, Long id) {
        if (id == null) throw new BusinessException("缺少记录ID");
        FeigeSuiteRecord record = recordMapper.selectById(id);
        if (record == null || !Objects.equals(pageCode, record.getPageCode())) {
            throw new BusinessException("记录不存在或已删除");
        }
        return record;
    }

    private String normalizeStatus(FeigeSuitePageRegistry.PageDefinition definition, String requested) {
        String status = StringUtils.hasText(requested) ? requested.trim() : definition.defaultStatus();
        if (!definition.statuses().contains(status)) {
            throw new BusinessException("无效的业务状态");
        }
        return status;
    }

    private void applyCustomFilters(LambdaQueryWrapper<FeigeSuiteRecord> wrapper, String filters) {
        if (!StringUtils.hasText(filters)) return;
        Map<String, Object> values;
        try {
            values = objectMapper.readValue(filters, new TypeReference<LinkedHashMap<String, Object>>() { });
        } catch (JsonProcessingException e) {
            throw new BusinessException("筛选条件格式无效");
        }
        if (values.size() > 12) throw new BusinessException("筛选条件过多");
        values.forEach((key, rawValue) -> {
            if (!key.matches("[A-Za-z][A-Za-z0-9_]{0,63}")) {
                throw new BusinessException("筛选字段无效");
            }
            if (rawValue == null || !StringUtils.hasText(String.valueOf(rawValue))) return;
            String value = String.valueOf(rawValue);
            if (value.length() > 200) throw new BusinessException("筛选内容过长");
            wrapper.apply("JSON_UNQUOTE(JSON_EXTRACT(data_json, {0})) = {1}", "$." + key, value);
        });
    }

    private Map<String, Object> view(FeigeSuiteRecord record) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", record.getId());
        row.put("pageCode", record.getPageCode());
        row.put("recordNo", record.getRecordNo());
        row.put("title", record.getTitle());
        row.put("categoryCode", record.getCategoryCode());
        row.put("status", record.getStatus());
        row.put("ownerId", record.getOwnerId());
        row.put("ownerName", record.getOwnerName());
        row.put("deptId", record.getDeptId());
        row.put("deptName", record.getDeptName());
        row.put("amount", record.getAmount());
        row.put("bizDate", record.getBizDate());
        row.put("dueDate", record.getDueDate());
        row.put("source", record.getSource());
        row.put("sortNo", record.getSortNo());
        row.put("version", record.getVersion());
        row.put("createTime", record.getCreateTime());
        row.put("updateTime", record.getUpdateTime());
        row.put("data", decodeData(record.getDataJson()));
        return row;
    }

    private String encodeData(Map<String, Object> data) {
        try {
            String json = objectMapper.writeValueAsString(data == null ? Map.of() : data);
            if (json.length() > MAX_JSON_LENGTH) {
                throw new BusinessException("页面明细内容过长，请精简后再保存");
            }
            return json;
        } catch (JsonProcessingException e) {
            throw new BusinessException("页面明细格式无效");
        }
    }

    private Map<String, Object> decodeData(String json) {
        if (!StringUtils.hasText(json)) return new LinkedHashMap<>();
        try {
            return objectMapper.readValue(json, new TypeReference<LinkedHashMap<String, Object>>() { });
        } catch (JsonProcessingException e) {
            return new LinkedHashMap<>();
        }
    }

    private String buildSearchText(FeigeSuiteRecord record, Map<String, Object> data) {
        List<String> parts = new ArrayList<>();
        parts.add(record.getTitle());
        parts.add(record.getRecordNo());
        parts.add(record.getOwnerName());
        parts.add(record.getDeptName());
        parts.add(record.getCategoryCode());
        flattenSearchValues(data, parts, 0);
        String result = String.join(" ", parts.stream().filter(StringUtils::hasText).toList());
        return result.length() > 4000 ? result.substring(0, 4000) : result;
    }

    private void flattenSearchValues(Object value, List<String> parts, int depth) {
        if (value == null || depth > 3 || parts.size() > 100) return;
        if (value instanceof Map<?, ?> map) {
            map.values().forEach(item -> flattenSearchValues(item, parts, depth + 1));
        } else if (value instanceof Iterable<?> iterable) {
            iterable.forEach(item -> flattenSearchValues(item, parts, depth + 1));
        } else if (value instanceof CharSequence || value instanceof Number || value instanceof Boolean) {
            parts.add(String.valueOf(value));
        }
    }

    private void writeLog(FeigeSuiteRecord record, String action, String fromStatus, String toStatus, String remark) {
        FeigeSuiteAuditLog log = new FeigeSuiteAuditLog();
        log.setPageCode(record.getPageCode());
        log.setRecordId(record.getId());
        log.setAction(action);
        log.setFromStatus(fromStatus);
        log.setToStatus(toStatus);
        log.setOperatorId(access.currentUserId());
        log.setOperatorName(access.displayName(access.currentUser()));
        log.setRemark(remark);
        try {
            log.setSnapshotJson(objectMapper.writeValueAsString(view(record)));
        } catch (JsonProcessingException e) {
            log.setSnapshotJson("{}");
        }
        auditLogMapper.insert(log);
    }

    private String generateRecordNo(String pageCode) {
        String prefix = pageCode.replaceAll("[^A-Za-z0-9]", "").toUpperCase(Locale.ROOT);
        if (prefix.length() > 8) prefix = prefix.substring(0, 8);
        String day = LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE);
        return "FG-" + prefix + "-" + day + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(Locale.ROOT);
    }

    private BigDecimal nonNegative(BigDecimal value) {
        if (value != null && value.signum() < 0) throw new BusinessException("金额不能小于0");
        return value;
    }

    private String trimToNull(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }
}
