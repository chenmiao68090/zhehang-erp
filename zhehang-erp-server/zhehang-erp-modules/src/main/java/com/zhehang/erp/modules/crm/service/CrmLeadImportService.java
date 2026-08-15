package com.zhehang.erp.modules.crm.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.crm.domain.dto.CrmLeadImportConfirmRequest;
import com.zhehang.erp.modules.crm.domain.dto.CrmLeadImportRequest;
import com.zhehang.erp.modules.crm.domain.dto.CrmLeadImportRowDTO;
import com.zhehang.erp.modules.crm.domain.entity.CrmContact;
import com.zhehang.erp.modules.crm.domain.entity.CrmCustomer;
import com.zhehang.erp.modules.crm.domain.entity.CrmLead;
import com.zhehang.erp.modules.crm.domain.entity.CrmPoolConfig;
import com.zhehang.erp.modules.crm.domain.vo.CrmLeadImportPreviewVO;
import com.zhehang.erp.modules.crm.domain.vo.CrmLeadImportResultVO;
import com.zhehang.erp.modules.crm.domain.vo.CrmLeadImportRowVO;
import com.zhehang.erp.modules.crm.domain.vo.CrmLeadImportSummaryVO;
import com.zhehang.erp.modules.crm.mapper.CrmContactMapper;
import com.zhehang.erp.modules.crm.mapper.CrmCustomerMapper;
import com.zhehang.erp.modules.crm.mapper.CrmLeadMapper;
import com.zhehang.erp.modules.crm.mapper.CrmPoolConfigMapper;
import com.zhehang.erp.modules.crm.support.CrmLeadSource;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.text.Normalizer;
import java.time.Duration;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;
import java.util.regex.Pattern;

/**
 * 公司资源批量导入的唯一写入口。
 *
 * <p>预检和确认都批量读取当前租户的线索、正式客户及联系人索引；确认还会在租户级
 * Redis 互斥锁内重新检查并执行独立事务。该服务直接调用 mapper.insert，刻意绕过
 * {@link com.zhehang.erp.modules.crm.service.impl.CrmLeadServiceImpl#save(CrmLead)} 的隐式工商补全，
 * 防止内置示例工商 Provider 污染真实导入数据。</p>
 */
@Slf4j
@Service
public class CrmLeadImportService {

    public static final int MAX_ROWS = CrmPoolRuleService.MAX_SINGLE_IMPORT_LIMIT;
    private static final long MAX_BATCH_CHARACTERS = 2_000_000L;
    private static final Duration PREVIEW_TTL = Duration.ofMinutes(20);
    private static final Duration CONFIRM_LOCK_TTL = Duration.ofMinutes(15);
    private static final String PREVIEW_KEY = "crm:lead:import:preview:";
    private static final String LOCK_KEY = "crm:lead:import:confirm:lock:";
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");
    private static final Pattern CLOSED_STATUS = Pattern.compile(".*(注销|吊销|撤销).*");
    private static final Pattern CAPITAL_PATTERN = Pattern.compile(
            "^([0-9]+(?:\\.[0-9]+)?)(亿(?:元)?|万(?:元)?|元)?$");
    /** crm_lead.registered_capital 为 DECIMAL(12,2)，数据库口径是万元。 */
    private static final BigDecimal MAX_REGISTERED_CAPITAL_WAN = new BigDecimal("9999999999.99");
    private static final DefaultRedisScript<Long> RELEASE_LOCK_SCRIPT = new DefaultRedisScript<>(
            "if redis.call('get', KEYS[1]) == ARGV[1] then "
                    + "return redis.call('del', KEYS[1]) else return 0 end", Long.class);

    private static final String READY = "READY";
    private static final String DUPLICATE = "DUPLICATE";
    private static final String CONFLICT = "CONFLICT";
    private static final String ERROR = "ERROR";

    private final CrmLeadMapper leadMapper;
    private final CrmCustomerMapper customerMapper;
    private final CrmContactMapper contactMapper;
    private final CrmPoolConfigMapper poolConfigMapper;
    private final CrmLeadStageRecorder stageRecorder;
    private final CrmPoolRuleService ruleService;
    private final DataScopeHelper dataScopeHelper;
    private final StringRedisTemplate redisTemplate;
    private final TransactionTemplate transactionTemplate;

    public CrmLeadImportService(CrmLeadMapper leadMapper,
                                CrmCustomerMapper customerMapper,
                                CrmContactMapper contactMapper,
                                CrmPoolConfigMapper poolConfigMapper,
                                CrmLeadStageRecorder stageRecorder,
                                CrmPoolRuleService ruleService,
                                DataScopeHelper dataScopeHelper,
                                StringRedisTemplate redisTemplate,
                                PlatformTransactionManager transactionManager) {
        this.leadMapper = leadMapper;
        this.customerMapper = customerMapper;
        this.contactMapper = contactMapper;
        this.poolConfigMapper = poolConfigMapper;
        this.stageRecorder = stageRecorder;
        this.ruleService = ruleService;
        this.dataScopeHelper = dataScopeHelper;
        this.redisTemplate = redisTemplate;
        this.transactionTemplate = new TransactionTemplate(transactionManager);
    }

    public CrmLeadImportPreviewVO preflight(CrmLeadImportRequest request) {
        RequestContext context = requireContext();
        validateRequest(request, context.tenantId());
        Evaluation evaluation = evaluate(request);
        int readyCount = (int) evaluation.rows().stream().filter(row -> READY.equals(row.getStatus())).count();
        ruleService.assertDailyCapacity(CrmPoolRuleService.BATCH_IMPORT, readyCount);

        String token = UUID.randomUUID().toString();
        String hash = requestHash(request, context);
        redisTemplate.opsForValue().set(PREVIEW_KEY + token, tokenValue(context, hash), PREVIEW_TTL);

        CrmLeadImportPreviewVO result = new CrmLeadImportPreviewVO();
        result.setPreviewToken(token);
        result.setRows(evaluation.rows());
        result.setSummary(summaryOf(evaluation.rows(), false));
        return result;
    }

    public CrmLeadImportResultVO confirm(CrmLeadImportConfirmRequest request) {
        RequestContext context = requireContext();
        validateBasicRequest(request);
        String lockKey = LOCK_KEY + context.tenantId();
        String lockValue = UUID.randomUUID().toString();
        Boolean locked = redisTemplate.opsForValue().setIfAbsent(lockKey, lockValue, CONFIRM_LOCK_TTL);
        if (!Boolean.TRUE.equals(locked)) {
            throw new BusinessException(409, "另一批公司资源正在导入，请稍后重新预检");
        }

        try {
            CrmLeadImportResultVO result = transactionTemplate.execute(status -> confirmInTransaction(request, context));
            if (result == null) {
                throw new BusinessException(500, "公司资源导入事务未返回结果");
            }
            CrmLeadImportSummaryVO summary = result.getSummary();
            // 审计只记录租户、操作者和数量，不记录批次名、企业、联系人或来源明细。
            log.info("CRM公司资源导入完成 tenantId={}, operatorId={}, total={}, imported={}, duplicate={}, conflict={}, error={}",
                    context.tenantId(), context.userId(), summary.getTotal(), summary.getImported(),
                    summary.getDuplicate(), summary.getConflict(), summary.getError());
            return result;
        } finally {
            // Lua compare-delete：锁过期并被其他请求续占时，旧请求不能误删新锁。
            // 业务事务可能已经提交，释放锁失败不能反向伪装成“导入失败”；15分钟TTL负责兜底。
            try {
                redisTemplate.execute(RELEASE_LOCK_SCRIPT, List.of(lockKey), lockValue);
            } catch (Exception releaseError) {
                log.warn("CRM公司资源导入锁释放失败，等待TTL自动回收 tenantId={}, errorType={}",
                        context.tenantId(), releaseError.getClass().getSimpleName());
            }
        }
    }

    private CrmLeadImportResultVO confirmInTransaction(CrmLeadImportConfirmRequest request, RequestContext context) {
        validateRequest(request, context.tenantId());
        consumePreviewToken(request, context);

        // 锁内重新查库。预检后新增的线索/正式客户在这里会降级为重复或冲突，绝不覆盖。
        Evaluation evaluation = evaluate(request);
        List<CrmLeadImportRowVO> resultRows = new ArrayList<>(evaluation.rows().size());
        Set<String> reservedLeadNos = new HashSet<>(evaluation.existingLeadNos());
        for (CrmLeadImportRowVO checked : evaluation.rows()) {
            CrmLeadImportRowVO outcome = copyOutcome(checked);
            if (READY.equals(checked.getStatus())) {
                CrmLead lead = toEntity(request, checked.getRow(), context);
                lead.setLeadNo(allocateLeadNo(reservedLeadNos));
                int inserted = leadMapper.insert(lead);
                if (inserted == 1) {
                    stageRecorder.recordCreation(lead, "IMPORT", lead.getId());
                    outcome.setStatus("IMPORTED");
                } else {
                    outcome.setStatus("FAILED");
                    addReason(outcome, "INSERT_FAILED", "该行未能写入，请重新预检后再试");
                }
            } else if (DUPLICATE.equals(checked.getStatus())) {
                outcome.setStatus("SKIPPED_DUPLICATE");
            } else if (CONFLICT.equals(checked.getStatus())) {
                outcome.setStatus("SKIPPED_CONFLICT");
            } else {
                outcome.setStatus("FAILED");
            }
            outcome.setRow(null);
            resultRows.add(outcome);
        }

        CrmLeadImportResultVO result = new CrmLeadImportResultVO();
        result.setRows(resultRows);
        result.setSummary(summaryOf(resultRows, true));
        ruleService.consumeDaily(CrmPoolRuleService.BATCH_IMPORT, result.getSummary().getImported());
        return result;
    }

    private void consumePreviewToken(CrmLeadImportConfirmRequest request, RequestContext context) {
        String token = clean(request.getPreviewToken());
        if (token.isEmpty() || token.length() > 64) {
            throw new BusinessException(400, "缺少有效的预检令牌，请重新预检");
        }
        String stored = redisTemplate.opsForValue().getAndDelete(PREVIEW_KEY + token);
        String expected = tokenValue(context, requestHash(request, context));
        if (stored == null || !MessageDigest.isEqual(
                stored.getBytes(StandardCharsets.UTF_8), expected.getBytes(StandardCharsets.UTF_8))) {
            throw new BusinessException(409, "预检已过期或数据已变化，请重新预检");
        }
    }

    private String tokenValue(RequestContext context, String hash) {
        return context.tenantId() + ":" + context.userId() + ":" + hash;
    }

    private Evaluation evaluate(CrmLeadImportRequest request) {
        ExistingIndex existing = loadExistingIndex();
        List<CrmLeadImportRowVO> results = new ArrayList<>(request.getRows().size());
        for (int i = 0; i < request.getRows().size(); i++) {
            CrmLeadImportRowDTO sanitized = sanitizeRow(request.getRows().get(i), i);
            CrmLeadImportRowVO row = new CrmLeadImportRowVO();
            row.setRowNumber(sanitized.getRowNumber());
            row.setRow(sanitized);
            validateRow(sanitized, row);
            if (!row.getReasonCodes().isEmpty()) {
                row.setStatus(ERROR);
            }
            results.add(row);
        }

        // 文件内同一电话对应不同公司时，该电话组所有可校验行都必须冲突，不能让首行先入库。
        Map<String, Set<String>> allFilePhoneCompanies = new HashMap<>();
        // 同一规范化公司名却出现多个非空信用代码时，整个公司组都暂停导入。
        Map<String, Set<String>> allFileCompanyCredits = new HashMap<>();
        for (CrmLeadImportRowVO row : results) {
            if (ERROR.equals(row.getStatus())) {
                continue;
            }
            String companyKey = normalizeCompanyKey(row.getRow().getCompany());
            String creditKey = normalizeCreditCode(row.getRow().getCreditCode());
            if (!companyKey.isEmpty() && !creditKey.isEmpty()) {
                allFileCompanyCredits.computeIfAbsent(companyKey, ignored -> new HashSet<>()).add(creditKey);
            }
            for (String phone : phoneKeys(row.getRow())) {
                allFilePhoneCompanies.computeIfAbsent(phone, ignored -> new HashSet<>()).add(companyKey);
            }
        }

        FileIndex file = new FileIndex();
        for (CrmLeadImportRowVO row : results) {
            if (ERROR.equals(row.getStatus())) {
                continue;
            }
            CrmLeadImportRowDTO sanitized = row.getRow();

            String companyKey = normalizeCompanyKey(sanitized.getCompany());
            String creditKey = normalizeCreditCode(sanitized.getCreditCode());
            Set<String> phones = phoneKeys(sanitized);

            DuplicateMatch match = null;
            // 文件组冲突先于旧库重复：整组都必须保持 CONFLICT，避免部分行被误当成可忽略的重复。
            if (allFileCompanyCredits.getOrDefault(companyKey, Set.of()).size() > 1) {
                match = conflict("FILE_COMPANY_CREDIT_CODE_CONFLICT",
                        "文件内同一公司名对应不同信用代码，该公司组全部暂停导入，请人工核实");
            }
            if (match == null && phones.stream()
                    .anyMatch(phone -> allFilePhoneCompanies.getOrDefault(phone, Set.of()).size() > 1)) {
                match = conflict("FILE_PHONE_OTHER_COMPANY",
                        "文件内同一联系电话对应不同公司，该电话组全部暂停导入，请人工核实");
            }
            if (match == null) {
                match = findExistingMatch(existing, companyKey, creditKey, phones);
            }
            if (match == null) {
                match = findFileIdentityMatch(file, companyKey, creditKey);
            }
            if (match == null) {
                match = findFilePhoneMatch(file, companyKey, phones);
            }
            if (match != null) {
                row.setStatus(match.status());
                addReason(row, match.code(), match.reason());
                applyExistingLocation(row, match.existing());
            } else {
                row.setStatus(READY);
            }
            addWarnings(sanitized, phones, creditKey, row);
            file.remember(companyKey, creditKey, phones);
        }
        return new Evaluation(results, new HashSet<>(existing.leadNos));
    }

    /** 一次查出当前租户的线索、正式客户和联系人撞单键，避免逐行N+1。 */
    private ExistingIndex loadExistingIndex() {
        ExistingIndex index = new ExistingIndex();

        QueryWrapper<CrmCustomer> customerQuery = new QueryWrapper<>();
        customerQuery.select("id", "name", "credit_code", "status", "owner_id", "dept_id");
        List<CrmCustomer> customers = customerMapper.selectList(customerQuery);
        Map<Long, String> customerOwnerNames = dataScopeHelper.resolveUserNames(customers.stream()
                .map(CrmCustomer::getOwnerId)
                .filter(java.util.Objects::nonNull)
                .collect(java.util.stream.Collectors.toSet()));
        Map<Long, IdentityOwner> customerOwners = new HashMap<>();
        int customerSequence = 0;
        for (CrmCustomer customer : customers) {
            String companyKey = normalizeCompanyKey(customer.getName());
            IdentityOwner owner = new IdentityOwner(subjectKey(Origin.CUSTOMER, customer.getId(), customerSequence++),
                    companyKey, normalizeCreditCode(customer.getCreditCode()), Origin.CUSTOMER,
                    customer.getId(), customer.getName(), null, customer.getStatus(), customer.getOwnerId(),
                    customer.getDeptId(), ownerName(customerOwnerNames, customer.getOwnerId()));
            if (customer.getId() != null) {
                customerOwners.put(customer.getId(), owner);
            }
            index.remember(owner);
        }

        QueryWrapper<CrmContact> contactQuery = new QueryWrapper<>();
        contactQuery.select("customer_id", "phone", "mobile");
        int orphanContactSequence = 0;
        for (CrmContact contact : contactMapper.selectList(contactQuery)) {
            IdentityOwner owner = customerOwners.get(contact.getCustomerId());
            if (owner == null) {
                owner = new IdentityOwner(subjectKey(Origin.CUSTOMER, contact.getCustomerId(),
                        customers.size() + orphanContactSequence++), "", "", Origin.CUSTOMER,
                        contact.getCustomerId(), null, null, null, null, null, null);
            }
            for (String phone : phoneKeys(contact.getPhone(), contact.getMobile())) {
                index.rememberPhone(phone, owner);
            }
        }

        QueryWrapper<CrmLead> leadQuery = new QueryWrapper<>();
        leadQuery.select("id", "company", "name", "credit_code", "phone", "company_phone", "lead_no",
                "converted_customer_id", "ownership", "status", "owner_id", "dept_id");
        List<CrmLead> leads = leadMapper.selectList(leadQuery);
        Map<Long, String> leadOwnerNames = dataScopeHelper.resolveUserNames(leads.stream()
                .map(CrmLead::getOwnerId)
                .filter(java.util.Objects::nonNull)
                .collect(java.util.stream.Collectors.toSet()));
        int leadSequence = 0;
        for (CrmLead lead : leads) {
            String company = StringUtils.hasText(lead.getCompany()) ? lead.getCompany() : lead.getName();
            String companyKey = normalizeCompanyKey(company);
            IdentityOwner convertedCustomer = lead.getConvertedCustomerId() == null
                    ? null : customerOwners.get(lead.getConvertedCustomerId());
            // 已转化线索与它的正式客户是同一业务主体；保留线索自身的旧名称/号码作为撞单键，
            // 但统一复用正式客户subjectKey，避免同一转化链被误判成“多个主体冲突”。
            IdentityOwner owner = convertedCustomer == null
                    ? new IdentityOwner(subjectKey(Origin.LEAD, lead.getId(), leadSequence++),
                    companyKey, normalizeCreditCode(lead.getCreditCode()), Origin.LEAD,
                    lead.getId(), company, lead.getOwnership(), lead.getStatus(), lead.getOwnerId(),
                    lead.getDeptId(), ownerName(leadOwnerNames, lead.getOwnerId()))
                    : new IdentityOwner(convertedCustomer.subjectKey(), companyKey,
                    normalizeCreditCode(lead.getCreditCode()), Origin.CUSTOMER,
                    convertedCustomer.id(), convertedCustomer.displayName(), null, convertedCustomer.status(),
                    convertedCustomer.ownerId(), convertedCustomer.deptId(), convertedCustomer.ownerName());
            index.remember(owner);
            if (StringUtils.hasText(lead.getLeadNo())) {
                index.leadNos.add(clean(lead.getLeadNo()));
            }
            for (String phone : phoneKeys(lead.getPhone(), lead.getCompanyPhone())) {
                index.rememberPhone(phone, owner);
            }
        }
        return index;
    }

    private DuplicateMatch findExistingMatch(ExistingIndex index, String companyKey,
                                                 String creditKey, Set<String> phones) {
        List<IdentityOwner> creditHits = creditKey.isEmpty()
                ? List.of() : index.creditOwners.getOrDefault(creditKey, List.of());
        List<IdentityOwner> companyHits = companyKey.isEmpty()
                ? List.of() : index.companyOwners.getOrDefault(companyKey, List.of());
        List<IdentityOwner> phoneHits = new ArrayList<>();
        for (String phone : phones) {
            phoneHits.addAll(index.phoneOwners.getOrDefault(phone, List.of()));
        }

        Map<String, IdentityOwner> matchedSubjects = new LinkedHashMap<>();
        rememberSubjects(matchedSubjects, creditHits);
        rememberSubjects(matchedSubjects, companyHits);
        rememberSubjects(matchedSubjects, phoneHits);
        if (!creditHits.isEmpty()) {
            Set<String> creditSubjects = new HashSet<>();
            for (IdentityOwner owner : creditHits) {
                creditSubjects.add(owner.subjectKey());
            }
            boolean otherFieldHitsDifferentSubject = companyHits.stream()
                    .anyMatch(owner -> !creditSubjects.contains(owner.subjectKey()))
                    || phoneHits.stream().anyMatch(owner -> !creditSubjects.contains(owner.subjectKey()));
            if (otherFieldHitsDifferentSubject) {
                return conflict("EXISTING_MULTIPLE_SUBJECTS",
                        "本行的信用代码与公司名或联系电话命中不同主体，请人工核实后处理");
            }
            // 同一强身份键即使历史库里有多条存量记录，也应判重而不再导入；正式客户优先给出业务引导。
            IdentityOwner creditOwner = creditHits.stream()
                    .filter(owner -> owner.origin() == Origin.CUSTOMER)
                    .findFirst().orElse(creditHits.get(0));
            return existingDuplicate(creditOwner, "CREDIT_CODE");
        }
        if (matchedSubjects.size() > 1) {
            return conflict("EXISTING_MULTIPLE_SUBJECTS",
                    "本行的公司名、信用代码或联系电话分别命中不同主体，请人工核实后处理");
        }
        if (matchedSubjects.isEmpty()) {
            return null;
        }

        IdentityOwner owner = matchedSubjects.values().iterator().next();
        if (!companyHits.isEmpty()) {
            if (!creditKey.isEmpty() && !owner.creditKey().isEmpty() && !creditKey.equals(owner.creditKey())) {
                return conflict(owner.origin() == Origin.CUSTOMER
                                ? "EXISTING_CUSTOMER_COMPANY_CREDIT_CODE_CONFLICT"
                                : "EXISTING_LEAD_COMPANY_CREDIT_CODE_CONFLICT",
                        "公司名称已存在，但统一社会信用代码不一致，请人工核实后处理");
            }
            return existingDuplicate(owner, "COMPANY");
        }
        if (!companyKey.isEmpty() && companyKey.equals(owner.companyKey())) {
            return existingDuplicate(owner, "PHONE");
        }
        return conflict(owner.origin() == Origin.CUSTOMER
                        ? "EXISTING_CUSTOMER_PHONE_OTHER_COMPANY" : "EXISTING_LEAD_PHONE_OTHER_COMPANY",
                "该联系电话已被另一家公司使用，请人工核实后处理");
    }

    private void rememberSubjects(Map<String, IdentityOwner> target, List<IdentityOwner> owners) {
        for (IdentityOwner owner : owners) {
            target.putIfAbsent(owner.subjectKey(), owner);
        }
    }

    private String subjectKey(Origin origin, Long id, int fallbackSequence) {
        return origin.name() + ":" + (id == null ? "missing-" + fallbackSequence : id);
    }

    private DuplicateMatch existingDuplicate(IdentityOwner owner, String field) {
        if (owner.origin() == Origin.CUSTOMER) {
            String label = switch (field) {
                case "CREDIT_CODE" -> "统一社会信用代码";
                case "PHONE" -> "该公司联系电话";
                default -> "公司名称";
            };
            return duplicate("EXISTING_CUSTOMER_" + field,
                    label + "已是正式客户，请到“我的客户”处理", owner);
        }
        String reason = switch (field) {
            case "CREDIT_CODE" -> "统一社会信用代码已有线索，已跳过且不会覆盖旧记录";
            case "PHONE" -> "该公司联系电话已有线索，已跳过且不会覆盖旧记录";
            default -> "公司名称已有线索，已跳过且不会覆盖旧记录";
        };
        return duplicate("EXISTING_LEAD_" + field, reason, owner);
    }

    private DuplicateMatch findFileIdentityMatch(FileIndex file, String companyKey, String creditKey) {
        if (!creditKey.isEmpty() && file.creditKeys.contains(creditKey)) {
            return duplicate("FILE_DUPLICATE_CREDIT_CODE", "文件内统一社会信用代码重复，保留首次出现行");
        }
        if (!companyKey.isEmpty() && file.companyKeys.contains(companyKey)) {
            return duplicate("FILE_DUPLICATE_COMPANY", "文件内公司名称重复，保留首次出现行");
        }
        return null;
    }

    private DuplicateMatch findFilePhoneMatch(FileIndex file, String companyKey, Set<String> phones) {
        for (String phone : phones) {
            Set<String> companies = file.phoneCompanies.get(phone);
            if (companies == null || companies.isEmpty()) {
                continue;
            }
            if (companies.contains(companyKey)) {
                return duplicate("FILE_DUPLICATE_PHONE", "文件内同一公司的联系电话重复，保留首次出现行");
            }
            return conflict("FILE_PHONE_OTHER_COMPANY", "文件内同一联系电话对应不同公司，请人工核实");
        }
        return null;
    }

    private void validateRequest(CrmLeadImportRequest request, Long tenantId) {
        validateBasicRequest(request);
        if (request.getPoolId() == null) {
            return;
        }
        CrmPoolConfig pool = poolConfigMapper.selectById(request.getPoolId());
        if (pool == null || pool.getTenantId() == null || !pool.getTenantId().equals(tenantId)) {
            throw new BusinessException(400, "目标公海池不存在或不属于当前公司");
        }
        // 当前运行代码的权威口径：status=0启用，status=1禁用。
        if (!Integer.valueOf(0).equals(pool.getStatus())) {
            throw new BusinessException(400, "目标公海池已禁用，请重新选择");
        }
        Set<String> importablePoolTypes = Set.of("telemarketing", "online", "collaboration", "new_leads");
        if (!StringUtils.hasText(pool.getPoolType()) || !importablePoolTypes.contains(pool.getPoolType().trim())) {
            throw new BusinessException(400, "该公海池不允许批量导入，请选择公司公海或可导入业务池");
        }
    }

    private void validateBasicRequest(CrmLeadImportRequest request) {
        if (request == null) {
            throw new BusinessException(400, "导入请求不能为空");
        }
        if (!CrmLeadSource.isSupported(request.getSourceType())) {
            throw new BusinessException(400, "来源类型必须是1至10中的有效值");
        }
        String batchName = clean(request.getBatchName());
        if (batchName.isEmpty()) {
            throw new BusinessException(400, "批次名称不能为空");
        }
        if (batchName.length() > 32) {
            throw new BusinessException(400, "批次名称最多32个字符");
        }
        String platform = clean(request.getSourcePlatform());
        String detail = clean(request.getSourceDetail());
        if (platform.isEmpty() && detail.isEmpty()) {
            throw new BusinessException(400, "来源平台和来源说明至少填写一项");
        }
        if (platform.length() > 32) {
            throw new BusinessException(400, "来源平台最多32个字符");
        }
        if (detail.length() > 50) {
            throw new BusinessException(400, "来源说明最多50个字符");
        }
        if (Set.of(CrmLeadSource.PUBLIC_COMPANY_LIST, CrmLeadSource.PAID_OPERATION_MEITUAN,
                CrmLeadSource.PAID_OPERATION_DOUYIN, CrmLeadSource.PAID_OPERATION_OTHER)
                .contains(request.getSourceType()) && platform.isEmpty()) {
            throw new BusinessException(400, "该来源类型必须填写来源平台");
        }
        if (CrmLeadSource.PAID_OPERATION_MEITUAN == request.getSourceType()
                && !(platform.contains("美团") || platform.contains("大众点评"))) {
            throw new BusinessException(400, "来源类型3只接受美团或大众点评平台");
        }
        if (CrmLeadSource.PAID_OPERATION_DOUYIN == request.getSourceType() && !platform.contains("抖音")) {
            throw new BusinessException(400, "来源类型4必须使用抖音平台");
        }
        if (CrmLeadSource.PAID_OPERATION_OTHER == request.getSourceType()
                && (platform.contains("美团") || platform.contains("大众点评") || platform.contains("抖音"))) {
            throw new BusinessException(400, "美团/大众点评请选择来源类型3，抖音请选择来源类型4");
        }
        if (Set.of(CrmLeadSource.PURCHASED_OR_TELEMARKETING, CrmLeadSource.CHANNEL_PARTNER)
                .contains(request.getSourceType()) && detail.isEmpty()) {
            throw new BusinessException(400, "该来源类型必须填写来源说明");
        }
        if (CrmLeadSource.OTHER == request.getSourceType() && detail.isEmpty()) {
            throw new BusinessException(400, "其他来源必须填写来源说明");
        }
        if (request.getRows() == null || request.getRows().isEmpty()) {
            throw new BusinessException(400, "导入数据不能为空");
        }
        int configuredLimit = Math.min(MAX_ROWS, ruleService.current().getSingleImportLimit());
        if (request.getRows().size() > configuredLimit) {
            throw new BusinessException(400, "单次最多导入" + configuredLimit + "行");
        }
        Set<Integer> rowNumbers = new HashSet<>();
        long totalCharacters = 0L;
        for (int i = 0; i < request.getRows().size(); i++) {
            CrmLeadImportRowDTO row = request.getRows().get(i);
            int rowNumber = row == null || row.getRowNumber() == null ? i + 2 : row.getRowNumber();
            if (rowNumber < 2) {
                throw new BusinessException(400, "行号必须从2开始");
            }
            if (!rowNumbers.add(rowNumber)) {
                throw new BusinessException(400, "同一批次的行号不能重复");
            }
            if (row != null) {
                totalCharacters += rowCharacterCount(row);
            }
            if (totalCharacters > MAX_BATCH_CHARACTERS) {
                throw new BusinessException(400, "本批文本内容超过200万字符，请拆分文件或精简经营范围和备注");
            }
        }
    }

    private void validateRow(CrmLeadImportRowDTO row, CrmLeadImportRowVO result) {
        if (!StringUtils.hasText(row.getCompany())) {
            addReason(result, "MISSING_COMPANY", "公司名称不能为空");
        }
        Set<String> phones = phoneKeys(row);
        if (!StringUtils.hasText(row.getPhone()) && !StringUtils.hasText(row.getCompanyPhone())
                && !StringUtils.hasText(row.getWechatNo()) && !StringUtils.hasText(row.getCreditCode())) {
            addReason(result, "MISSING_CONTACT_KEY", "手机号、企业电话、微信或统一社会信用代码至少填写一项");
        }
        if (StringUtils.hasText(row.getPhone()) && phonesFromValue(row.getPhone()).isEmpty()) {
            addReason(result, "INVALID_PHONE", "手机号格式不正确");
        }
        if (StringUtils.hasText(row.getCompanyPhone()) && phonesFromValue(row.getCompanyPhone()).isEmpty()) {
            addReason(result, "INVALID_COMPANY_PHONE", "企业电话格式不正确");
        }
        if (StringUtils.hasText(row.getCreditCode()) && normalizeCreditCode(row.getCreditCode()).length() != 18) {
            addReason(result, "INVALID_CREDIT_CODE", "统一社会信用代码应为18位字母或数字");
        }
        if (StringUtils.hasText(row.getEmail()) && !EMAIL_PATTERN.matcher(row.getEmail()).matches()) {
            addReason(result, "INVALID_EMAIL", "邮箱格式不正确");
        }
        if (StringUtils.hasText(row.getRegisterStatus()) && CLOSED_STATUS.matcher(row.getRegisterStatus()).matches()) {
            addReason(result, "CLOSED_COMPANY", "登记状态为注销、吊销或撤销，不进入公海");
        }
        validateDate(row.getEstablishedDate(), "成立日期", "INVALID_ESTABLISHED_DATE", result);
        validateDate(row.getApprovedDate(), "核准日期", "INVALID_APPROVED_DATE", result);
        if (StringUtils.hasText(row.getRegisteredCapital()) && parseCapitalWan(row.getRegisteredCapital()) == null) {
            addReason(result, "INVALID_REGISTERED_CAPITAL", "注册资本无法识别、为负数或超出系统可保存范围");
        }

        checkLength(row.getCompany(), 200, "公司名称", result);
        checkLength(row.getLegalPerson(), 100, "法定代表人", result);
        checkLength(row.getPhone(), 20, "手机号", result);
        checkLength(row.getCompanyPhone(), 50, "企业电话", result);
        checkLength(row.getWechatNo(), 64, "微信", result);
        checkLength(row.getCreditCode(), 64, "统一社会信用代码", result);
        checkLength(row.getEmail(), 128, "邮箱", result);
        checkLength(row.getRegisterStatus(), 50, "登记状态", result);
        checkLength(row.getRegion(), 50, "地区", result);
        checkLength(row.getEnterpriseScale(), 20, "企业规模", result);
        checkLength(row.getEnterpriseType(), 100, "企业类型", result);
        checkLength(row.getPaidCapital(), 100, "实缴资本", result);
        checkLength(row.getInsuredCount(), 20, "参保人数", result);
        checkLength(row.getInsuredYear(), 20, "参保年份", result);
        checkLength(row.getRegisterAddress(), 500, "注册地址", result);
        checkLength(row.getLatestAddress(), 500, "最新地址", result);
        checkLength(row.getIndustry(), 100, "行业门类", result);
        checkLength(row.getBusinessScope(), 5000, "经营范围", result);
        checkLength(row.getRemark(), 2000, "备注", result);
        checkLength(mergeRemark(row.getRemark(), row.getIndustry()), 2208, "备注与行业门类合计", result);
    }

    private void addWarnings(CrmLeadImportRowDTO row, Set<String> phones, String creditKey,
                             CrmLeadImportRowVO result) {
        if (phones.isEmpty() && !StringUtils.hasText(row.getWechatNo()) && !creditKey.isEmpty()) {
            addWarning(result, "NO_DIRECT_CONTACT", "可按信用代码查重，但暂不可直接联系");
        }
        if (phones.isEmpty() && StringUtils.hasText(row.getWechatNo()) && creditKey.isEmpty()) {
            addWarning(result, "WECHAT_ONLY_WEAK_DEDUPE",
                    "仅有微信号，系统无法用微信可靠查重，建议补手机号或信用代码");
        }
        if (StringUtils.hasText(row.getRegion()) && !row.getRegion().contains("杭州")) {
            addWarning(result, "NON_HANGZHOU", "企业地区不是杭州，请确认是否纳入本批拓客范围");
        }
    }

    private CrmLeadImportRowDTO sanitizeRow(CrmLeadImportRowDTO raw, int index) {
        CrmLeadImportRowDTO source = raw == null ? new CrmLeadImportRowDTO() : raw;
        CrmLeadImportRowDTO row = new CrmLeadImportRowDTO();
        row.setRowNumber(source.getRowNumber() != null && source.getRowNumber() > 0
                ? source.getRowNumber() : index + 2);
        row.setCompany(cleanDisplay(source.getCompany()));
        row.setLegalPerson(cleanDisplay(source.getLegalPerson()));
        row.setPhone(normalizePhoneList(source.getPhone()));
        row.setCompanyPhone(normalizePhoneList(source.getCompanyPhone()));
        row.setWechatNo(clean(source.getWechatNo()));
        row.setCreditCode(normalizeCreditCode(source.getCreditCode()));
        row.setEmail(clean(source.getEmail()));
        row.setRegisterStatus(cleanDisplay(source.getRegisterStatus()));
        row.setRegion(cleanDisplay(source.getRegion()));
        row.setEnterpriseScale(cleanDisplay(source.getEnterpriseScale()));
        row.setEnterpriseType(cleanDisplay(source.getEnterpriseType()));
        BigDecimal capital = parseCapitalWan(source.getRegisteredCapital());
        row.setRegisteredCapital(capital == null ? clean(source.getRegisteredCapital())
                : capital.stripTrailingZeros().toPlainString());
        row.setPaidCapital(cleanDisplay(source.getPaidCapital()));
        row.setEstablishedDate(normalizeDate(source.getEstablishedDate()));
        row.setApprovedDate(normalizeDate(source.getApprovedDate()));
        row.setInsuredCount(cleanDisplay(source.getInsuredCount()));
        row.setInsuredYear(cleanDisplay(source.getInsuredYear()));
        row.setRegisterAddress(cleanDisplay(source.getRegisterAddress()));
        row.setLatestAddress(cleanDisplay(source.getLatestAddress()));
        row.setBusinessScope(cleanDisplay(source.getBusinessScope()));
        row.setIndustry(cleanDisplay(source.getIndustry()));
        row.setRemark(cleanDisplay(source.getRemark()));
        return row;
    }

    private CrmLead toEntity(CrmLeadImportRequest request, CrmLeadImportRowDTO row, RequestContext context) {
        CrmLead lead = new CrmLead();
        lead.setName(StringUtils.hasText(row.getLegalPerson()) ? row.getLegalPerson()
                : row.getCompany().substring(0, Math.min(100, row.getCompany().length())));
        lead.setCompany(row.getCompany());
        lead.setLegalPerson(emptyToNull(row.getLegalPerson()));
        lead.setPhone(emptyToNull(row.getPhone()));
        lead.setCompanyPhone(emptyToNull(row.getCompanyPhone()));
        lead.setWechatNo(emptyToNull(row.getWechatNo()));
        lead.setCreditCode(emptyToNull(row.getCreditCode()));
        lead.setEmail(emptyToNull(row.getEmail()));
        lead.setRegisterStatus(emptyToNull(row.getRegisterStatus()));
        lead.setRegion(emptyToNull(row.getRegion()));
        lead.setEnterpriseScale(emptyToNull(row.getEnterpriseScale()));
        lead.setEnterpriseType(emptyToNull(row.getEnterpriseType()));
        lead.setRegisteredCapital(parseCapitalWan(row.getRegisteredCapital()));
        lead.setPaidCapital(emptyToNull(row.getPaidCapital()));
        lead.setEstablishedDate(parseLocalDate(row.getEstablishedDate()));
        lead.setApprovedDate(parseLocalDate(row.getApprovedDate()));
        lead.setInsuredCount(emptyToNull(row.getInsuredCount()));
        lead.setInsuredYear(emptyToNull(row.getInsuredYear()));
        lead.setRegisterAddress(emptyToNull(row.getRegisterAddress()));
        lead.setLatestAddress(emptyToNull(row.getLatestAddress()));
        lead.setBusinessScope(emptyToNull(row.getBusinessScope()));
        lead.setRemark(emptyToNull(mergeRemark(row.getRemark(), row.getIndustry())));

        lead.setSource(request.getSourceType());
        lead.setSourcePlatform(emptyToNull(clean(request.getSourcePlatform())));
        lead.setSourceDetail(emptyToNull(clean(request.getSourceDetail())));
        lead.setChannel(clean(request.getBatchName()));
        lead.setPoolId(request.getPoolId());
        lead.setStatus(1);
        lead.setOwnership("pool");
        // 导入只是登记客资，不代表销售已判断意向；首次有效沟通后再选择A-E。
        lead.setCustomerLevel(null);
        lead.setIntentLevel(null);
        lead.setOwnerId(null);
        lead.setDeptId(null);
        lead.setTenantId(context.tenantId());
        lead.setCreateBy(context.userId());
        lead.setUpdateBy(context.userId());
        return lead;
    }

    /**
     * 在确认阶段已经一次读取当前租户全部 lead_no，这里只在内存中分配，
     * 避免每行 selectCount 形成 N+1。租户级 Redis 锁保证同一租户的批量导入不并发。
     */
    private String allocateLeadNo(Set<String> reservedLeadNos) {
        String prefix = "TL" + LocalDate.now().format(java.time.format.DateTimeFormatter.BASIC_ISO_DATE);
        for (int i = 0; i < 10_000; i++) {
            String candidate = prefix + String.format("%06d", ThreadLocalRandom.current().nextInt(1_000_000));
            if (reservedLeadNos.add(candidate)) {
                return candidate;
            }
        }
        throw new BusinessException(409, "当日客户编号暂时无法分配，请稍后重新预检");
    }

    private CrmLeadImportSummaryVO summaryOf(List<CrmLeadImportRowVO> rows, boolean confirmed) {
        CrmLeadImportSummaryVO summary = new CrmLeadImportSummaryVO();
        summary.setTotal(rows.size());
        for (CrmLeadImportRowVO row : rows) {
            switch (row.getStatus()) {
                case READY -> summary.setImportable(summary.getImportable() + 1);
                case "IMPORTED" -> summary.setImported(summary.getImported() + 1);
                case DUPLICATE, "SKIPPED_DUPLICATE" -> summary.setDuplicate(summary.getDuplicate() + 1);
                case CONFLICT, "SKIPPED_CONFLICT" -> summary.setConflict(summary.getConflict() + 1);
                case ERROR, "FAILED" -> summary.setError(summary.getError() + 1);
                default -> summary.setError(summary.getError() + 1);
            }
            if ((!confirmed && READY.equals(row.getStatus()))
                    || (confirmed && "IMPORTED".equals(row.getStatus()))) {
                if (!row.getWarningCodes().isEmpty()) {
                    summary.setWarning(summary.getWarning() + 1);
                }
            }
        }
        return summary;
    }

    private CrmLeadImportRowVO copyOutcome(CrmLeadImportRowVO source) {
        CrmLeadImportRowVO target = new CrmLeadImportRowVO();
        target.setRowNumber(source.getRowNumber());
        target.setStatus(source.getStatus());
        target.setReasonCodes(new ArrayList<>(source.getReasonCodes()));
        target.setReasons(new ArrayList<>(source.getReasons()));
        target.setWarningCodes(new ArrayList<>(source.getWarningCodes()));
        target.setWarnings(new ArrayList<>(source.getWarnings()));
        target.setExistingRecordType(source.getExistingRecordType());
        target.setExistingRecordId(source.getExistingRecordId());
        target.setExistingLocation(source.getExistingLocation());
        target.setExistingOwnerName(source.getExistingOwnerName());
        target.setExistingTarget(source.getExistingTarget());
        return target;
    }

    private String requestHash(CrmLeadImportRequest request, RequestContext context) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            digestValue(digest, context.tenantId());
            digestValue(digest, context.userId());
            digestValue(digest, request.getSourceType());
            digestValue(digest, request.getSourcePlatform());
            digestValue(digest, request.getSourceDetail());
            digestValue(digest, request.getBatchName());
            digestValue(digest, request.getPoolId());
            digestValue(digest, request.getRows().size());
            for (CrmLeadImportRowDTO row : request.getRows()) {
                CrmLeadImportRowDTO value = row == null ? new CrmLeadImportRowDTO() : row;
                digestValue(digest, value.getRowNumber());
                digestValue(digest, value.getCompany());
                digestValue(digest, value.getLegalPerson());
                digestValue(digest, value.getPhone());
                digestValue(digest, value.getCompanyPhone());
                digestValue(digest, value.getWechatNo());
                digestValue(digest, value.getCreditCode());
                digestValue(digest, value.getEmail());
                digestValue(digest, value.getRegisterStatus());
                digestValue(digest, value.getRegion());
                digestValue(digest, value.getEnterpriseScale());
                digestValue(digest, value.getEnterpriseType());
                digestValue(digest, value.getRegisteredCapital());
                digestValue(digest, value.getPaidCapital());
                digestValue(digest, value.getEstablishedDate());
                digestValue(digest, value.getApprovedDate());
                digestValue(digest, value.getInsuredCount());
                digestValue(digest, value.getInsuredYear());
                digestValue(digest, value.getRegisterAddress());
                digestValue(digest, value.getLatestAddress());
                digestValue(digest, value.getBusinessScope());
                digestValue(digest, value.getIndustry());
                digestValue(digest, value.getRemark());
            }
            return java.util.HexFormat.of().formatHex(digest.digest());
        } catch (Exception e) {
            throw new IllegalStateException("无法生成导入预检摘要", e);
        }
    }

    private void digestValue(MessageDigest digest, Object value) {
        byte[] bytes = clean(value == null ? "" : value.toString()).getBytes(StandardCharsets.UTF_8);
        digest.update(ByteBuffer.allocate(4).putInt(bytes.length).array());
        digest.update(bytes);
    }

    private RequestContext requireContext() {
        Long tenantId = SecurityUtils.getCurrentTenantId();
        Long userId = SecurityUtils.getCurrentUserId();
        if (tenantId == null || userId == null) {
            throw new BusinessException(401, "当前登录缺少公司或用户信息");
        }
        return new RequestContext(tenantId, userId);
    }

    private String normalizeCompanyKey(String value) {
        return cleanDisplay(value).replaceAll("\\s+", "").toLowerCase(Locale.ROOT);
    }

    private String normalizeCreditCode(String value) {
        return clean(value).toUpperCase(Locale.ROOT).replaceAll("[^0-9A-Z]", "");
    }

    private Set<String> phoneKeys(CrmLeadImportRowDTO row) {
        return phoneKeys(row.getPhone(), row.getCompanyPhone());
    }

    private Set<String> phoneKeys(String... values) {
        Set<String> result = new LinkedHashSet<>();
        if (values != null) {
            for (String value : values) {
                result.addAll(phonesFromValue(value));
            }
        }
        return result;
    }

    private List<String> phonesFromValue(String value) {
        List<String> result = new ArrayList<>();
        if (!StringUtils.hasText(value)) {
            return result;
        }
        for (String part : Normalizer.normalize(value, Normalizer.Form.NFKC).split("[，,;；、/|]+")) {
            String digits = part.replaceAll("[^0-9]", "");
            if (digits.startsWith("0086") && digits.length() == 15) {
                digits = digits.substring(4);
            } else if (digits.startsWith("86") && digits.length() == 13) {
                digits = digits.substring(2);
            }
            if (digits.length() >= 5 && digits.length() <= 20 && !result.contains(digits)) {
                result.add(digits);
            }
        }
        return result;
    }

    private String normalizePhoneList(String value) {
        if (!StringUtils.hasText(value)) {
            return "";
        }
        List<String> phones = phonesFromValue(value);
        return phones.isEmpty() ? clean(value) : String.join("/", phones);
    }

    private String normalizeDate(String value) {
        if (!StringUtils.hasText(value)) {
            return "";
        }
        String normalized = clean(value).replace('/', '-').replace('.', '-')
                .replace("年", "-").replace("月", "-").replace("日", "");
        try {
            String[] parts = normalized.split("-");
            if (parts.length != 3) {
                return clean(value);
            }
            return LocalDate.of(Integer.parseInt(parts[0]), Integer.parseInt(parts[1]), Integer.parseInt(parts[2])).toString();
        } catch (Exception e) {
            return clean(value);
        }
    }

    private LocalDate parseLocalDate(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        try {
            return LocalDate.parse(value);
        } catch (Exception e) {
            return null;
        }
    }

    private void validateDate(String value, String label, String code, CrmLeadImportRowVO result) {
        if (StringUtils.hasText(value) && parseLocalDate(value) == null) {
            addReason(result, code, label + "格式不正确，应为YYYY-MM-DD");
        }
    }

    /**
     * 注册资本数据库口径为“万元”：纯数字/含“万”按万元，含“亿”乘10000，
     * 仅含“元”则除以10000。最终按 DECIMAL(12,2) 显式四舍五入；负数、溢出或
     * 无法识别时返回null并由预检逐行报错，避免确认插入时拖垮整批事务。
     */
    private BigDecimal parseCapitalWan(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        String source = clean(value)
                .replace(",", "")
                .replace("，", "")
                .replace("人民币", "")
                .replaceAll("\\s+", "");
        if (source.startsWith("-") || source.contains("负")) {
            return null;
        }
        java.util.regex.Matcher matcher = CAPITAL_PATTERN.matcher(source);
        if (!matcher.matches()) {
            return null;
        }
        try {
            BigDecimal amount = new BigDecimal(matcher.group(1));
            String unit = matcher.group(2);
            BigDecimal amountWan;
            if (unit != null && unit.startsWith("亿")) {
                amountWan = amount.multiply(BigDecimal.valueOf(10_000));
            } else if (unit != null && unit.startsWith("万")) {
                amountWan = amount;
            } else if ("元".equals(unit)) {
                amountWan = amount.divide(BigDecimal.valueOf(10_000), 8, java.math.RoundingMode.HALF_UP);
            } else {
                amountWan = amount;
            }
            amountWan = amountWan.setScale(2, java.math.RoundingMode.HALF_UP);
            if (amountWan.signum() < 0 || amountWan.compareTo(MAX_REGISTERED_CAPITAL_WAN) > 0) {
                return null;
            }
            return amountWan.stripTrailingZeros();
        } catch (Exception e) {
            return null;
        }
    }

    private String mergeRemark(String remark, String industry) {
        String base = cleanDisplay(remark);
        String industryText = cleanDisplay(industry);
        if (industryText.isEmpty()) {
            return base;
        }
        String line = "行业门类: " + industryText;
        return base.isEmpty() ? line : base + "\n" + line;
    }

    private void checkLength(String value, int max, String label, CrmLeadImportRowVO result) {
        if (value != null && value.length() > max) {
            addReason(result, "FIELD_TOO_LONG", label + "最多" + max + "个字符");
        }
    }

    private long rowCharacterCount(CrmLeadImportRowDTO row) {
        String[] values = {
                row.getCompany(), row.getLegalPerson(), row.getPhone(), row.getCompanyPhone(),
                row.getWechatNo(), row.getCreditCode(), row.getEmail(), row.getRegisterStatus(),
                row.getRegion(), row.getEnterpriseScale(), row.getEnterpriseType(), row.getRegisteredCapital(),
                row.getPaidCapital(), row.getEstablishedDate(), row.getApprovedDate(), row.getInsuredCount(),
                row.getInsuredYear(), row.getRegisterAddress(), row.getLatestAddress(), row.getBusinessScope(),
                row.getIndustry(), row.getRemark()
        };
        long total = 0L;
        for (String value : values) {
            if (value != null) {
                total += value.length();
            }
        }
        return total;
    }

    private String cleanDisplay(String value) {
        return clean(value).replaceAll("\\s+", " ");
    }

    private String clean(String value) {
        return value == null ? "" : Normalizer.normalize(value, Normalizer.Form.NFKC).trim();
    }

    private String emptyToNull(String value) {
        return StringUtils.hasText(value) ? value : null;
    }

    private void addReason(CrmLeadImportRowVO row, String code, String reason) {
        row.getReasonCodes().add(code);
        row.getReasons().add(reason);
    }

    private void addWarning(CrmLeadImportRowVO row, String code, String warning) {
        row.getWarningCodes().add(code);
        row.getWarnings().add(warning);
    }

    private void applyExistingLocation(CrmLeadImportRowVO row, IdentityOwner owner) {
        if (owner == null) {
            return;
        }
        row.setExistingRecordType(owner.origin().name());
        boolean publicLead = owner.origin() == Origin.LEAD && "pool".equalsIgnoreCase(owner.ownership());
        boolean accessible = publicLead
                || (owner.ownerId() == null && dataScopeHelper.isManagerOrAdmin())
                || dataScopeHelper.canAccess(owner.ownerId(), owner.deptId());
        if (!accessible) {
            row.setExistingLocation("其他销售跟进中");
            row.setExistingOwnerName("其他销售");
            row.setExistingTarget("NONE");
            return;
        }

        row.setExistingRecordId(owner.id());
        row.setExistingOwnerName(owner.ownerName());
        if (owner.origin() == Origin.CUSTOMER) {
            row.setExistingLocation("正式客户");
            row.setExistingTarget("CUSTOMER");
        } else if (publicLead) {
            row.setExistingLocation("公司公海");
            row.setExistingTarget("PUBLIC_POOL");
        } else if (Integer.valueOf(4).equals(owner.status())) {
            row.setExistingLocation("历史客资");
            row.setExistingTarget("HISTORY");
        } else {
            row.setExistingLocation("我的客户");
            row.setExistingTarget("ACTIVE");
        }
    }

    private String ownerName(Map<Long, String> ownerNames, Long ownerId) {
        return ownerId == null ? null : ownerNames.get(ownerId);
    }

    private DuplicateMatch duplicate(String code, String reason) {
        return new DuplicateMatch(DUPLICATE, code, reason, null);
    }

    private DuplicateMatch duplicate(String code, String reason, IdentityOwner existing) {
        return new DuplicateMatch(DUPLICATE, code, reason, existing);
    }

    private DuplicateMatch conflict(String code, String reason) {
        return new DuplicateMatch(CONFLICT, code, reason, null);
    }

    private enum Origin { LEAD, CUSTOMER }

    private record RequestContext(Long tenantId, Long userId) { }

    private record Evaluation(List<CrmLeadImportRowVO> rows, Set<String> existingLeadNos) { }

    private record DuplicateMatch(String status, String code, String reason, IdentityOwner existing) { }

    private record IdentityOwner(String subjectKey, String companyKey, String creditKey, Origin origin,
                                 Long id, String displayName, String ownership, Integer status,
                                 Long ownerId, Long deptId, String ownerName) { }

    private static final class ExistingIndex {
        private final Map<String, List<IdentityOwner>> creditOwners = new HashMap<>();
        private final Map<String, List<IdentityOwner>> companyOwners = new HashMap<>();
        private final Map<String, List<IdentityOwner>> phoneOwners = new HashMap<>();
        private final Set<String> leadNos = new HashSet<>();

        private void remember(IdentityOwner owner) {
            if (!owner.creditKey().isEmpty()) {
                creditOwners.computeIfAbsent(owner.creditKey(), ignored -> new ArrayList<>()).add(owner);
            }
            if (!owner.companyKey().isEmpty()) {
                companyOwners.computeIfAbsent(owner.companyKey(), ignored -> new ArrayList<>()).add(owner);
            }
        }

        private void rememberPhone(String key, IdentityOwner owner) {
            if (!key.isEmpty()) {
                phoneOwners.computeIfAbsent(key, ignored -> new ArrayList<>()).add(owner);
            }
        }
    }

    private static final class FileIndex {
        private final Set<String> creditKeys = new HashSet<>();
        private final Set<String> companyKeys = new HashSet<>();
        private final Map<String, Set<String>> phoneCompanies = new HashMap<>();

        private void remember(String companyKey, String creditKey, Set<String> phones) {
            if (!creditKey.isEmpty()) {
                creditKeys.add(creditKey);
            }
            if (!companyKey.isEmpty()) {
                companyKeys.add(companyKey);
            }
            for (String phone : phones) {
                phoneCompanies.computeIfAbsent(phone, ignored -> new HashSet<>()).add(companyKey);
            }
        }
    }
}
