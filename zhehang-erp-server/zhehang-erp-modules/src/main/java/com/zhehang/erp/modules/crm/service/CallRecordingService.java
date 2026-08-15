package com.zhehang.erp.modules.crm.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.crm.domain.BizCallRecord;
import com.zhehang.erp.modules.crm.domain.BizYunkeUserMap;
import com.zhehang.erp.modules.crm.domain.entity.CrmLead;
import com.zhehang.erp.modules.crm.domain.vo.CallRecordingVO;
import com.zhehang.erp.modules.crm.mapper.BizCallRecordMapper;
import com.zhehang.erp.modules.crm.mapper.BizYunkeUserMapMapper;
import com.zhehang.erp.modules.crm.mapper.CrmLeadMapper;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.system.domain.entity.SysDept;
import com.zhehang.erp.modules.system.domain.entity.SysUser;
import com.zhehang.erp.modules.system.mapper.SysDeptMapper;
import com.zhehang.erp.modules.system.mapper.SysUserMapper;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

/** 通话录音列表、数据范围和短时代理播放。 */
@Service
@RequiredArgsConstructor
public class CallRecordingService {

    private static final String TICKET_PREFIX = "sales:call-recording:play:";
    private static final int MAX_RANGE_DAYS = 31;
    private static final int MAX_PAGE_SIZE = 100;
    private static final int STREAM_BUFFER_SIZE = 64 * 1024;
    private static final Set<String> DEFAULT_ALLOWED_HOSTS = Set.of(
            "yunke-pcfile.oss-cn-beijing.aliyuncs.com",
            "yunke-sip-call.oss-cn-beijing.aliyuncs.com"
    );

    private final BizCallRecordMapper callRecordMapper;
    private final BizYunkeUserMapMapper yunkeUserMapMapper;
    private final CrmLeadMapper leadMapper;
    private final SysUserMapper userMapper;
    private final SysDeptMapper deptMapper;
    private final DataScopeHelper dataScopeHelper;
    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    @Value("${yunke.recording.play-ticket-minutes:10}")
    private long configuredTicketMinutes;

    public CallRecordingVO.Options options() {
        ScopeContext scope = loadScope();
        List<CallRecordingVO.UserOption> users = scope.users().values().stream()
                .sorted((left, right) -> displayName(left).compareToIgnoreCase(displayName(right)))
                .map(user -> CallRecordingVO.UserOption.builder()
                        .id(user.getId())
                        .name(displayName(user))
                        .deptId(user.getDeptId())
                        .deptName(scope.depts().containsKey(user.getDeptId())
                                ? scope.depts().get(user.getDeptId()).getDeptName() : "未设置部门")
                        .currentUser(Objects.equals(user.getId(), SecurityUtils.getCurrentUserId()))
                        .build())
                .toList();
        Set<Long> usedDeptIds = users.stream().map(CallRecordingVO.UserOption::getDeptId)
                .filter(Objects::nonNull).collect(Collectors.toSet());
        List<CallRecordingVO.DeptOption> departments = scope.depts().values().stream()
                .filter(dept -> usedDeptIds.contains(dept.getId()))
                .sorted((left, right) -> Integer.compare(orZero(left.getOrderNum()), orZero(right.getOrderNum())))
                .map(dept -> CallRecordingVO.DeptOption.builder()
                        .id(dept.getId()).parentId(dept.getParentId()).name(dept.getDeptName()).build())
                .toList();
        String mode = scopeMode();
        return CallRecordingVO.Options.builder()
                .scopeMode(mode)
                .canSelectUser(!"self".equals(mode))
                .canSelectDepartment("company".equals(mode))
                .currentUserId(SecurityUtils.getCurrentUserId())
                .users(users)
                .departments(departments)
                .build();
    }

    public CallRecordingVO.PageResult page(LocalDate startDate,
                                           LocalDate endDate,
                                           Long userId,
                                           Long deptId,
                                           Integer connected,
                                           String result,
                                           Boolean hasRecording,
                                           String keyword,
                                           Integer pageNum,
                                           Integer pageSize) {
        DateRange range = validateRange(startDate, endDate);
        ScopeContext scope = narrowedScope(loadScope(), userId, deptId);
        if (scope.users().isEmpty()) {
            return CallRecordingVO.PageResult.builder().records(List.of()).total(0).pageNum(1).pageSize(20).build();
        }

        QueryWrapper<BizCallRecord> query = new QueryWrapper<>();
        query.eq("tenant_id", requireTenantId())
                .in("call_type", List.of("manual", "platform"))
                .ge("call_time", range.start().atStartOfDay())
                .lt("call_time", range.end().plusDays(1).atStartOfDay());
        applyIdentityScope(query, scope);
        if (connected != null && (connected == 0 || connected == 1)) {
            query.eq("connected", connected);
        }
        if (StringUtils.hasText(result)) {
            query.like("result", result.trim());
        }
        if (hasRecording != null) {
            if (hasRecording) {
                query.isNotNull("record_url").ne("record_url", "");
            } else {
                query.and(w -> w.isNull("record_url").or().eq("record_url", ""));
            }
        }
        if (StringUtils.hasText(keyword)) {
            String safeKeyword = keyword.trim();
            query.and(w -> w.like("customer_name", safeKeyword).or().like("phone", safeKeyword));
        }
        query.orderByDesc("call_time").orderByDesc("id");

        long safePageNum = Math.max(1, pageNum == null ? 1 : pageNum);
        long safePageSize = Math.max(10, Math.min(MAX_PAGE_SIZE, pageSize == null ? 20 : pageSize));
        Page<BizCallRecord> page = callRecordMapper.selectPage(new Page<>(safePageNum, safePageSize), query);
        Map<Long, CrmLead> leads = loadVisibleLeads(page.getRecords());
        Map<String, CrmLead> leadsByPhone = loadUniqueVisibleLeadsByPhone(page.getRecords());
        List<CallRecordingVO.Row> rows = page.getRecords().stream()
                .map(record -> {
                    CrmLead lead = record.getLeadId() == null ? null : leads.get(record.getLeadId());
                    if (lead == null && !StringUtils.hasText(record.getCustomerName())) {
                        lead = leadsByPhone.get(normalizePhone(record.getPhone()));
                    }
                    return toRow(record, scope, lead);
                })
                .filter(Objects::nonNull)
                .toList();
        return CallRecordingVO.PageResult.builder()
                .records(rows).total(page.getTotal()).pageNum(page.getCurrent()).pageSize(page.getSize()).build();
    }

    public CallRecordingVO.PlaybackTicket issueTicket(Long recordId, String userAgent) {
        Long tenantId = requireTenantId();
        BizCallRecord record = callRecordMapper.selectOne(new LambdaQueryWrapper<BizCallRecord>()
                .eq(BizCallRecord::getId, recordId)
                .eq(BizCallRecord::getTenantId, tenantId)
                .last("LIMIT 1"));
        if (record == null) {
            throw new AccessDeniedException("无权访问该通话录音");
        }
        if (!StringUtils.hasText(record.getRecordUrl())) {
            throw new BusinessException("平台暂未生成录音");
        }
        ScopeContext scope = loadScope();
        if (resolveUserId(record, scope) == null && !canAccessLinkedLead(record)) {
            throw new AccessDeniedException("无权播放该通话录音");
        }
        validatedRecordingUri(record.getRecordUrl());
        String token = UUID.randomUUID().toString().replace("-", "")
                + UUID.randomUUID().toString().replace("-", "");
        long ticketMinutes = Math.max(3, Math.min(30, configuredTicketMinutes));
        long expiresAt = Instant.now().plusSeconds(ticketMinutes * 60).toEpochMilli();
        TicketPayload payload = new TicketPayload(record.getId(), null, SecurityUtils.getCurrentUserId(),
                tenantId, userAgentHash(userAgent), expiresAt);
        storeTicket(token, payload, ticketMinutes);
        return CallRecordingVO.PlaybackTicket.builder().token(token).expiresAt(expiresAt).build();
    }

    /**
     * 统一话单对象归属校验。列表可见、播放和 AI 转写都必须经过同一套租户、坐席和线索范围判断。
     */
    public void assertCanAccessRecord(Long recordId) {
        Long tenantId = requireTenantId();
        BizCallRecord record = callRecordMapper.selectOne(new LambdaQueryWrapper<BizCallRecord>()
                .eq(BizCallRecord::getId, recordId)
                .eq(BizCallRecord::getTenantId, tenantId)
                .last("LIMIT 1"));
        if (record == null) {
            throw new AccessDeniedException("无权访问该通话记录");
        }
        ScopeContext scope = loadScope();
        if (resolveUserId(record, scope) == null && !canAccessLinkedLead(record)) {
            throw new AccessDeniedException("无权访问该通话记录");
        }
    }

    /**
     * 服务端 AI 转写专用读取。复用播放接口的租户、人员范围、线索归属和云客域名校验，
     * 录音原始地址不会离开服务端，且用硬上限避免超大文件挤占内存。
     */
    public AccessibleRecording loadAccessibleRecording(Long recordId, long requestedMaxBytes) {
        Long tenantId = requireTenantId();
        BizCallRecord record = callRecordMapper.selectOne(new LambdaQueryWrapper<BizCallRecord>()
                .eq(BizCallRecord::getId, recordId)
                .eq(BizCallRecord::getTenantId, tenantId)
                .last("LIMIT 1"));
        if (record == null) {
            throw new AccessDeniedException("无权访问该通话录音");
        }
        if (!StringUtils.hasText(record.getRecordUrl())) {
            throw new BusinessException("平台暂未生成录音");
        }
        ScopeContext scope = loadScope();
        if (resolveUserId(record, scope) == null && !canAccessLinkedLead(record)) {
            throw new AccessDeniedException("无权读取该通话录音");
        }

        URI uri = validatedRecordingUri(record.getRecordUrl());
        long maxBytes = Math.max(1024L * 1024L, Math.min(25L * 1024L * 1024L, requestedMaxBytes));
        HttpRequest request = HttpRequest.newBuilder(uri)
                .timeout(Duration.ofSeconds(30))
                .GET()
                .build();
        try {
            HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(8)).build();
            HttpResponse<InputStream> upstream = client.send(request, HttpResponse.BodyHandlers.ofInputStream());
            if (upstream.statusCode() != 200) {
                throw new BusinessException("录音服务暂时不可用");
            }
            long declaredLength = upstream.headers().firstValueAsLong(HttpHeaders.CONTENT_LENGTH).orElse(-1L);
            if (declaredLength > maxBytes) {
                throw new BusinessException("录音文件过大，暂不支持自动转写");
            }
            String contentType = upstream.headers().firstValue(HttpHeaders.CONTENT_TYPE).orElse("audio/mpeg");
            String normalizedType = contentType.split(";", 2)[0].trim().toLowerCase(Locale.ROOT);
            if (!normalizedType.startsWith("audio/") && !"application/octet-stream".equals(normalizedType)) {
                throw new BusinessException("录音文件格式不受支持");
            }
            try (InputStream input = upstream.body(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
                byte[] buffer = new byte[STREAM_BUFFER_SIZE];
                long total = 0L;
                int read;
                while ((read = input.read(buffer)) >= 0) {
                    total += read;
                    if (total > maxBytes) {
                        throw new BusinessException("录音文件过大，暂不支持自动转写");
                    }
                    output.write(buffer, 0, read);
                }
                return new AccessibleRecording(record.getId(), record.getLeadId(), record.getPlatformCallId(),
                        contentType, recordingFileName(uri, normalizedType), output.toByteArray());
            }
        } catch (BusinessException | AccessDeniedException e) {
            throw e;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new BusinessException("录音转写已中断，请稍后重试");
        } catch (Exception e) {
            throw new BusinessException("录音服务暂时不可用");
        }
    }

    private static String recordingFileName(URI uri, String contentType) {
        String path = uri.getPath();
        String name = path == null ? "" : path.substring(path.lastIndexOf('/') + 1);
        if (StringUtils.hasText(name) && name.matches("[A-Za-z0-9._-]{1,120}")) return name;
        if (contentType.contains("wav")) return "recording.wav";
        if (contentType.contains("m4a") || contentType.contains("mp4")) return "recording.m4a";
        if (contentType.contains("ogg")) return "recording.ogg";
        return "recording.mp3";
    }

    /** 为云客微信语音接口返回的临时地址签发系统内票据，原地址不返回浏览器。 */
    public CallRecordingVO.PlaybackTicket issueExternalTicket(String recordingUrl, String userAgent) {
        Long tenantId = requireTenantId();
        validatedRecordingUri(recordingUrl);
        String token = UUID.randomUUID().toString().replace("-", "")
                + UUID.randomUUID().toString().replace("-", "");
        long ticketMinutes = Math.max(3, Math.min(30, configuredTicketMinutes));
        long expiresAt = Instant.now().plusSeconds(ticketMinutes * 60).toEpochMilli();
        TicketPayload payload = new TicketPayload(null, recordingUrl, SecurityUtils.getCurrentUserId(),
                tenantId, userAgentHash(userAgent), expiresAt);
        storeTicket(token, payload, ticketMinutes);
        return CallRecordingVO.PlaybackTicket.builder().token(token).expiresAt(expiresAt).build();
    }

    public void stream(Long recordId,
                       String ticket,
                       String range,
                       String userAgent,
                       HttpServletResponse response) {
        TicketPayload payload = readTicket(recordId, ticket, userAgent);
        BizCallRecord record = callRecordMapper.selectOne(new LambdaQueryWrapper<BizCallRecord>()
                .eq(BizCallRecord::getId, payload.recordId())
                .eq(BizCallRecord::getTenantId, payload.tenantId())
                .last("LIMIT 1"));
        if (record == null || !StringUtils.hasText(record.getRecordUrl())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "录音不存在或已无权访问");
        }
        proxyStream(validatedRecordingUri(record.getRecordUrl()), range, response);
    }

    public void streamExternal(String ticket,
                               String range,
                               String userAgent,
                               HttpServletResponse response) {
        TicketPayload payload = readExternalTicket(ticket, userAgent);
        proxyStream(validatedRecordingUri(payload.externalUrl()), range, response);
    }

    private void proxyStream(URI uri, String range, HttpServletResponse response) {
        HttpRequest.Builder requestBuilder = HttpRequest.newBuilder(uri)
                .timeout(Duration.ofSeconds(20))
                .GET();
        if (StringUtils.hasText(range)) {
            requestBuilder.header(HttpHeaders.RANGE, range);
        }
        try {
            HttpClient client = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(8))
                    .build();
            HttpResponse<InputStream> upstream = client.send(requestBuilder.build(), HttpResponse.BodyHandlers.ofInputStream());
            if (upstream.statusCode() != 200 && upstream.statusCode() != 206) {
                response.setStatus(HttpStatus.BAD_GATEWAY.value());
                return;
            }
            response.setStatus(upstream.statusCode());
            copyHeader(upstream, response, HttpHeaders.CONTENT_TYPE, "audio/mpeg");
            copyHeader(upstream, response, HttpHeaders.CONTENT_LENGTH, null);
            copyHeader(upstream, response, HttpHeaders.CONTENT_RANGE, null);
            copyHeader(upstream, response, HttpHeaders.ACCEPT_RANGES, "bytes");
            response.setHeader(HttpHeaders.CACHE_CONTROL, "private, no-store, max-age=0");
            response.setHeader(HttpHeaders.CONTENT_DISPOSITION, "inline");
            response.setHeader("X-Content-Type-Options", "nosniff");
            response.setHeader("Content-Security-Policy", "sandbox");
            response.setHeader("Cross-Origin-Resource-Policy", "same-origin");
            try (InputStream input = upstream.body()) {
                byte[] buffer = new byte[STREAM_BUFFER_SIZE];
                int read;
                while ((read = input.read(buffer)) >= 0) {
                    response.getOutputStream().write(buffer, 0, read);
                }
                response.getOutputStream().flush();
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            if (!response.isCommitted()) response.setStatus(HttpStatus.BAD_GATEWAY.value());
        } catch (Exception e) {
            if (!response.isCommitted()) response.setStatus(HttpStatus.BAD_GATEWAY.value());
        }
    }

    private void storeTicket(String token, TicketPayload payload, long ticketMinutes) {
        try {
            redisTemplate.opsForValue().set(TICKET_PREFIX + token,
                    objectMapper.writeValueAsString(payload), ticketMinutes, TimeUnit.MINUTES);
        } catch (Exception e) {
            throw new BusinessException("录音播放凭证生成失败，请稍后重试");
        }
    }

    private ScopeContext loadScope() {
        Long tenantId = requireTenantId();
        List<SysUser> tenantUsers = userMapper.selectList(new LambdaQueryWrapper<SysUser>()
                .select(SysUser::getId, SysUser::getUsername, SysUser::getNickname,
                        SysUser::getPhone, SysUser::getDeptId, SysUser::getStatus)
                .eq(SysUser::getTenantId, tenantId)
                .eq(SysUser::getStatus, 0));
        List<Long> visibleUserIds = dataScopeHelper.getVisibleUserIds();
        Set<Long> visibleSet = visibleUserIds == null ? null : new HashSet<>(visibleUserIds);
        Map<Long, SysUser> users = tenantUsers.stream()
                .filter(user -> user.getId() != null
                        && Objects.equals(user.getStatus(), 0)
                        && (visibleSet == null || visibleSet.contains(user.getId())))
                .collect(Collectors.toMap(SysUser::getId, user -> user, (left, right) -> left, LinkedHashMap::new));
        List<SysDept> departments = deptMapper.selectList(new LambdaQueryWrapper<SysDept>()
                .select(SysDept::getId, SysDept::getParentId, SysDept::getAncestors,
                        SysDept::getDeptName, SysDept::getOrderNum)
                .eq(SysDept::getTenantId, tenantId));
        Map<Long, SysDept> depts = departments.stream().filter(dept -> dept.getId() != null)
                .collect(Collectors.toMap(SysDept::getId, dept -> dept, (left, right) -> left, LinkedHashMap::new));
        List<BizYunkeUserMap> mappings = yunkeUserMapMapper.selectList(new LambdaQueryWrapper<BizYunkeUserMap>()
                .eq(BizYunkeUserMap::getTenantId, tenantId));
        return buildScope(users, depts, mappings);
    }

    private ScopeContext buildScope(Map<Long, SysUser> users,
                                    Map<Long, SysDept> depts,
                                    List<BizYunkeUserMap> mappings) {
        Map<Long, LinkedHashSet<String>> aliasesByUser = new LinkedHashMap<>();
        users.values().forEach(user -> {
            LinkedHashSet<String> aliases = aliasesByUser.computeIfAbsent(user.getId(), key -> new LinkedHashSet<>());
            addAlias(aliases, user.getUsername());
            addAlias(aliases, user.getNickname());
            addAlias(aliases, user.getPhone());
        });
        for (BizYunkeUserMap mapping : mappings) {
            if (mapping.getUserId() == null || !users.containsKey(mapping.getUserId())) continue;
            LinkedHashSet<String> aliases = aliasesByUser.computeIfAbsent(mapping.getUserId(), key -> new LinkedHashSet<>());
            addAlias(aliases, mapping.getUserName());
            addAlias(aliases, mapping.getUserPhone());
            addAlias(aliases, mapping.getYunkeUserId());
            addAlias(aliases, mapping.getYunkePhone());
            addAlias(aliases, mapping.getYunkeNickname());
        }
        Map<String, Long> owners = new HashMap<>();
        Set<String> collisions = new HashSet<>();
        aliasesByUser.forEach((userId, aliases) -> aliases.forEach(alias -> {
            String normalized = normalize(alias);
            Long previous = owners.putIfAbsent(normalized, userId);
            if (previous != null && !previous.equals(userId)) collisions.add(normalized);
        }));
        collisions.forEach(owners::remove);
        Map<Long, Set<String>> uniqueAliases = new LinkedHashMap<>();
        aliasesByUser.forEach((userId, aliases) -> uniqueAliases.put(userId, aliases.stream()
                .filter(alias -> userId.equals(owners.get(normalize(alias))))
                .collect(Collectors.toCollection(LinkedHashSet::new))));
        return new ScopeContext(users, depts, uniqueAliases, owners);
    }

    private ScopeContext narrowedScope(ScopeContext scope, Long requestedUserId, Long requestedDeptId) {
        Set<Long> allowedIds = new LinkedHashSet<>(scope.users().keySet());
        if (requestedDeptId != null) {
            if (!"company".equals(scopeMode())) {
                throw new AccessDeniedException("无权按部门查看通话录音");
            }
            Set<Long> deptIds = descendantDeptIds(requestedDeptId, scope.depts());
            boolean known = scope.depts().containsKey(requestedDeptId);
            if (!known) throw new AccessDeniedException("无权查看该部门录音");
            allowedIds.removeIf(id -> !deptIds.contains(scope.users().get(id).getDeptId()));
        }
        if (requestedUserId != null) {
            if (!allowedIds.contains(requestedUserId)) {
                throw new AccessDeniedException("无权查看该人员录音");
            }
            allowedIds.retainAll(Set.of(requestedUserId));
        }
        Map<Long, SysUser> narrowedUsers = scope.users().entrySet().stream()
                .filter(entry -> allowedIds.contains(entry.getKey()))
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue,
                        (left, right) -> left, LinkedHashMap::new));
        Map<Long, Set<String>> narrowedAliases = scope.aliasesByUser().entrySet().stream()
                .filter(entry -> allowedIds.contains(entry.getKey()))
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue,
                        (left, right) -> left, LinkedHashMap::new));
        Map<String, Long> narrowedOwners = scope.aliasOwners().entrySet().stream()
                .filter(entry -> allowedIds.contains(entry.getValue()))
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
        return new ScopeContext(narrowedUsers, scope.depts(), narrowedAliases, narrowedOwners);
    }

    private void applyIdentityScope(QueryWrapper<BizCallRecord> query, ScopeContext scope) {
        Set<Long> userIds = scope.users().keySet();
        Set<String> aliases = scope.aliasesByUser().values().stream()
                .flatMap(Collection::stream).collect(Collectors.toCollection(LinkedHashSet::new));
        query.and(wrapper -> {
            boolean hasIds = !userIds.isEmpty();
            if (hasIds) wrapper.in("agent_id", userIds);
            if (!aliases.isEmpty()) {
                if (hasIds) {
                    wrapper.or(legacy -> legacy.isNull("agent_id").in("agent_name", aliases));
                } else {
                    wrapper.isNull("agent_id").in("agent_name", aliases);
                }
            }
        });
    }

    /**
     * 播放鉴权兜底:话单已关联线索时,能访问该线索(客户360可见)的人即可听录音,
     * 与时间线"听录音"按钮的可见口径对齐,避免看得见按钮点开却403。
     */
    private boolean canAccessLinkedLead(BizCallRecord record) {
        if (record.getLeadId() == null) return false;
        CrmLead lead = leadMapper.selectOne(new LambdaQueryWrapper<CrmLead>()
                .eq(CrmLead::getId, record.getLeadId())
                .eq(CrmLead::getTenantId, requireTenantId())
                .last("LIMIT 1"));
        return lead != null && dataScopeHelper.canAccess(lead.getOwnerId(), lead.getDeptId());
    }

    private Long resolveUserId(BizCallRecord record, ScopeContext scope) {
        if (record.getAgentId() != null && scope.users().containsKey(record.getAgentId())) {
            return record.getAgentId();
        }
        if (!StringUtils.hasText(record.getAgentName())) return null;
        return scope.aliasOwners().get(normalize(record.getAgentName()));
    }

    private CallRecordingVO.Row toRow(BizCallRecord record, ScopeContext scope, CrmLead lead) {
        Long userId = resolveUserId(record, scope);
        if (userId == null) return null;
        SysUser user = scope.users().get(userId);
        SysDept dept = user.getDeptId() == null ? null : scope.depts().get(user.getDeptId());
        boolean hasRecording = StringUtils.hasText(record.getRecordUrl());
        return CallRecordingVO.Row.builder()
                .id(record.getId()).callTime(record.getCallTime()).userId(userId)
                .agentName(displayName(user)).deptId(user.getDeptId())
                .deptName(dept == null ? "未设置部门" : dept.getDeptName())
                .customerName(resolveCustomerName(record, lead))
                .contactName(lead == null || !StringUtils.hasText(lead.getLegalPerson()) ? "—" : lead.getLegalPerson())
                .maskedPhone(maskPhone(record.getPhone())).callType(record.getCallType())
                .connected(record.getConnected()).result(record.getResult())
                .duration(orZero(record.getDuration())).durationText(formatDuration(orZero(record.getDuration())))
                .effective(Integer.valueOf(1).equals(record.getConnected()) && orZero(record.getDuration()) >= 60)
                .remark(cleanRemark(record.getRemark()))
                .recordingStatus(hasRecording ? "available" : "missing")
                .build();
    }

    private Map<Long, CrmLead> loadVisibleLeads(List<BizCallRecord> records) {
        List<Long> ids = records.stream().map(BizCallRecord::getLeadId).filter(Objects::nonNull).distinct().toList();
        if (ids.isEmpty()) return Map.of();
        Map<Long, CrmLead> result = new HashMap<>();
        for (CrmLead lead : leadMapper.selectList(new LambdaQueryWrapper<CrmLead>()
                .in(CrmLead::getId, ids)
                .eq(CrmLead::getTenantId, requireTenantId()))) {
            if (dataScopeHelper.canAccess(lead.getOwnerId(), lead.getDeptId())) result.put(lead.getId(), lead);
        }
        return result;
    }

    private Map<String, CrmLead> loadUniqueVisibleLeadsByPhone(List<BizCallRecord> records) {
        Set<String> phones = records.stream()
                .filter(record -> record.getLeadId() == null && !StringUtils.hasText(record.getCustomerName()))
                .map(BizCallRecord::getPhone)
                .map(CallRecordingService::normalizePhone)
                .filter(StringUtils::hasText)
                .collect(Collectors.toCollection(LinkedHashSet::new));
        Long tenantId = SecurityUtils.getCurrentTenantId();
        if (phones.isEmpty() || tenantId == null) return Map.of();

        List<CrmLead> candidates = leadMapper.selectByNormalizedPhones(tenantId, phones);
        if (candidates == null || candidates.isEmpty()) return Map.of();
        Map<String, CrmLead> unique = new HashMap<>();
        Set<String> ambiguous = new HashSet<>();
        for (CrmLead lead : candidates) {
            if (lead == null || !dataScopeHelper.canAccess(lead.getOwnerId(), lead.getDeptId())) continue;
            registerPhoneCandidate(phones, unique, ambiguous, normalizePhone(lead.getPhone()), lead);
            registerPhoneCandidate(phones, unique, ambiguous, normalizePhone(lead.getCompanyPhone()), lead);
        }
        ambiguous.forEach(unique::remove);
        return unique;
    }

    private static void registerPhoneCandidate(Set<String> requestedPhones,
                                               Map<String, CrmLead> unique,
                                               Set<String> ambiguous,
                                               String phone,
                                               CrmLead lead) {
        if (!StringUtils.hasText(phone) || !requestedPhones.contains(phone) || ambiguous.contains(phone)) return;
        CrmLead previous = unique.putIfAbsent(phone, lead);
        if (previous != null && !Objects.equals(previous.getId(), lead.getId())) ambiguous.add(phone);
    }

    private static String resolveCustomerName(BizCallRecord record, CrmLead lead) {
        if (StringUtils.hasText(record.getCustomerName())) return record.getCustomerName().trim();
        if (lead != null && StringUtils.hasText(lead.getCompany())) return lead.getCompany().trim();
        if (lead != null && StringUtils.hasText(lead.getName())) return lead.getName().trim();
        return "未关联客户";
    }

    static DateRange validateRange(LocalDate requestedStart, LocalDate requestedEnd) {
        LocalDate today = LocalDate.now();
        LocalDate start = requestedStart == null ? today : requestedStart;
        LocalDate end = requestedEnd == null ? start : requestedEnd;
        if (start.isAfter(end)) throw new BusinessException("开始日期不能晚于结束日期");
        if (end.isAfter(today)) throw new BusinessException("不能查询未来日期");
        if (ChronoUnit.DAYS.between(start, end) + 1 > MAX_RANGE_DAYS) {
            throw new BusinessException("单次最多查询31天录音");
        }
        return new DateRange(start, end);
    }

    private TicketPayload readTicket(Long recordId, String ticket, String userAgent) {
        if (recordId == null || !StringUtils.hasText(ticket) || !ticket.matches("[a-fA-F0-9]{64}")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "录音播放凭证无效");
        }
        try {
            String json = redisTemplate.opsForValue().get(TICKET_PREFIX + ticket);
            if (!StringUtils.hasText(json)) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "录音播放凭证已过期");
            TicketPayload payload = objectMapper.readValue(json, TicketPayload.class);
            if (!recordId.equals(payload.recordId()) || StringUtils.hasText(payload.externalUrl())
                    || payload.expiresAt() < System.currentTimeMillis()
                    || payload.tenantId() == null || payload.tenantId() <= 0
                    || payload.viewerId() == null || payload.viewerId() <= 0
                    || !Objects.equals(payload.userAgentHash(), userAgentHash(userAgent))) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "录音播放凭证无效");
            }
            return payload;
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "录音播放凭证无效");
        }
    }

    private TicketPayload readExternalTicket(String ticket, String userAgent) {
        if (!StringUtils.hasText(ticket) || !ticket.matches("[a-fA-F0-9]{64}")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "录音播放凭证无效");
        }
        try {
            String json = redisTemplate.opsForValue().get(TICKET_PREFIX + ticket);
            if (!StringUtils.hasText(json)) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "录音播放凭证已过期");
            }
            TicketPayload payload = objectMapper.readValue(json, TicketPayload.class);
            if (payload.recordId() != null || !StringUtils.hasText(payload.externalUrl())
                    || payload.expiresAt() < System.currentTimeMillis()
                    || payload.tenantId() == null || payload.tenantId() <= 0
                    || payload.viewerId() == null || payload.viewerId() <= 0
                    || !Objects.equals(payload.userAgentHash(), userAgentHash(userAgent))) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "录音播放凭证无效");
            }
            return payload;
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "录音播放凭证无效");
        }
    }

    private URI validatedRecordingUri(String rawUrl) {
        try {
            URI uri = URI.create(rawUrl.trim());
            String scheme = uri.getScheme() == null ? "" : uri.getScheme().toLowerCase(Locale.ROOT);
            String host = uri.getHost() == null ? "" : uri.getHost().toLowerCase(Locale.ROOT);
            if (!"https".equals(scheme) || !DEFAULT_ALLOWED_HOSTS.contains(host)
                    || (uri.getPort() != -1 && uri.getPort() != 443)
                    || uri.getUserInfo() != null) {
                throw new BusinessException("录音来源不受信任");
            }
            return uri;
        } catch (IllegalArgumentException e) {
            throw new BusinessException("录音地址无效");
        }
    }

    private void copyHeader(HttpResponse<?> upstream, HttpServletResponse response, String name, String fallback) {
        String value = upstream.headers().firstValue(name).orElse(fallback);
        if (StringUtils.hasText(value)) response.setHeader(name, value);
    }

    private String scopeMode() {
        if (SecurityUtils.isCurrentAdmin() || Integer.valueOf(1).equals(SecurityUtils.getCurrentDataScope())) return "company";
        Integer scope = SecurityUtils.getCurrentDataScope();
        return Integer.valueOf(3).equals(scope) || Integer.valueOf(4).equals(scope) ? "department" : "self";
    }

    private Set<Long> descendantDeptIds(Long deptId, Map<Long, SysDept> depts) {
        Set<Long> result = new HashSet<>();
        result.add(deptId);
        String needle = String.valueOf(deptId);
        depts.values().forEach(dept -> {
            String ancestors = dept.getAncestors();
            if (StringUtils.hasText(ancestors) && List.of(ancestors.split(",")).contains(needle)) result.add(dept.getId());
        });
        return result;
    }

    private static String displayName(SysUser user) {
        return StringUtils.hasText(user.getNickname()) ? user.getNickname() : user.getUsername();
    }

    private static void addAlias(Set<String> aliases, String value) {
        if (StringUtils.hasText(value)) aliases.add(value.trim());
    }

    private static String normalize(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
    }

    private static String normalizePhone(String phone) {
        if (!StringUtils.hasText(phone)) return "";
        String digits = phone.replaceAll("[^0-9]", "");
        if (digits.length() < 7) return "";
        return digits.length() > 11 ? digits.substring(digits.length() - 11) : digits;
    }

    private static String maskPhone(String phone) {
        if (!StringUtils.hasText(phone)) return "—";
        String value = phone.trim();
        if (value.length() <= 7) return value;
        return value.substring(0, 3) + "****" + value.substring(value.length() - 4);
    }

    private static String cleanRemark(String remark) {
        if (!StringUtils.hasText(remark) || remark.startsWith("云客通话记录同步")) return "—";
        return remark.trim();
    }

    private static String formatDuration(int seconds) {
        int safe = Math.max(0, seconds);
        return String.format("%02d:%02d:%02d", safe / 3600, (safe % 3600) / 60, safe % 60);
    }

    private static int orZero(Integer value) {
        return value == null ? 0 : value;
    }

    private Long requireTenantId() {
        Long tenantId = SecurityUtils.getCurrentTenantId();
        if (tenantId == null || tenantId <= 0) {
            throw new AccessDeniedException("缺少租户上下文");
        }
        return tenantId;
    }

    private static String userAgentHash(String userAgent) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(String.valueOf(userAgent).getBytes(StandardCharsets.UTF_8));
            StringBuilder builder = new StringBuilder();
            for (byte value : digest) builder.append(String.format("%02x", value));
            return builder.toString();
        } catch (Exception e) {
            throw new IllegalStateException("无法生成播放凭证", e);
        }
    }

    record DateRange(LocalDate start, LocalDate end) {
    }

    public record AccessibleRecording(Long recordId,
                                      Long leadId,
                                      String platformCallId,
                                      String contentType,
                                      String fileName,
                                      byte[] content) {
    }

    private record ScopeContext(Map<Long, SysUser> users,
                                Map<Long, SysDept> depts,
                                Map<Long, Set<String>> aliasesByUser,
                                Map<String, Long> aliasOwners) {
    }

    private record TicketPayload(Long recordId,
                                 String externalUrl,
                                 Long viewerId,
                                 Long tenantId,
                                 String userAgentHash,
                                 long expiresAt) {
    }
}
