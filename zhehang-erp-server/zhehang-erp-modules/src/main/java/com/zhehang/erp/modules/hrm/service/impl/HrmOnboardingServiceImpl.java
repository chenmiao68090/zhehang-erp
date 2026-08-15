package com.zhehang.erp.modules.hrm.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.mail.MailService;
import com.zhehang.erp.modules.hrm.domain.entity.HrmOnboarding;
import com.zhehang.erp.modules.hrm.domain.entity.HrmRecruit;
import com.zhehang.erp.modules.hrm.domain.entity.HrmResume;
import com.zhehang.erp.modules.hrm.mapper.HrmOnboardingMapper;
import com.zhehang.erp.modules.hrm.mapper.HrmRecruitMapper;
import com.zhehang.erp.modules.hrm.mapper.HrmResumeMapper;
import com.zhehang.erp.modules.hrm.service.IHrmOnboardingService;
import com.zhehang.erp.modules.org.domain.entity.OrgEmployee;
import com.zhehang.erp.modules.org.mapper.OrgEmployeeMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class HrmOnboardingServiceImpl extends ServiceImpl<HrmOnboardingMapper, HrmOnboarding> implements IHrmOnboardingService {

    private static final int TOKEN_VALID_HOURS = 48;
    private static final int SUBMIT_LIMIT_WINDOW_MINUTES = 10;
    private static final int SUBMIT_LIMIT_MAX_ATTEMPTS = 8;
    private static final int MAX_FORM_VALUE_LENGTH = 1000;

    private final HrmOnboardingMapper onboardingMapper;
    private final HrmResumeMapper resumeMapper;
    private final HrmRecruitMapper recruitMapper;
    private final OrgEmployeeMapper employeeMapper;
    private final ObjectMapper objectMapper;
    private final MailService mailService;
    private final Map<String, SubmitWindow> submitWindows = new ConcurrentHashMap<>();

    @Override
    public IPage<HrmOnboarding> selectPage(int pageNum, int pageSize, String keyword, Integer status) {
        LambdaQueryWrapper<HrmOnboarding> wrapper = new LambdaQueryWrapper<HrmOnboarding>()
                .eq(HrmOnboarding::getDeleted, 0)
                // 未显式按状态筛选时,排除「已取消」(7)记录:候选人在流转里被淘汰/未入职后不再出现在待入职列表(飞书 217)。
                .ne(status == null, HrmOnboarding::getStatus, 7)
                .eq(status != null, HrmOnboarding::getStatus, status)
                .and(StringUtils.hasText(keyword), w -> w
                        .like(HrmOnboarding::getName, keyword)
                        .or().like(HrmOnboarding::getPhone, keyword)
                        .or().like(HrmOnboarding::getEmail, keyword)
                        .or().like(HrmOnboarding::getPositionName, keyword))
                .orderByDesc(HrmOnboarding::getCreateTime);
        return onboardingMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public HrmOnboarding createFromResume(Long resumeId) {
        if (resumeId == null) {
            throw new BusinessException("候选人不能为空");
        }
        HrmOnboarding existing = onboardingMapper.selectOne(new LambdaQueryWrapper<HrmOnboarding>()
                .eq(HrmOnboarding::getResumeId, resumeId)
                .eq(HrmOnboarding::getDeleted, 0)
                .last("LIMIT 1"));
        if (existing != null) {
            return existing;
        }

        HrmResume resume = resumeMapper.selectById(resumeId);
        if (resume == null) {
            throw new BusinessException("候选人不存在");
        }
        HrmRecruit recruit = resume.getRecruitId() == null ? null : recruitMapper.selectById(resume.getRecruitId());

        HrmOnboarding onboarding = new HrmOnboarding();
        onboarding.setResumeId(resume.getId());
        onboarding.setRecruitId(resume.getRecruitId());
        onboarding.setName(resume.getName());
        onboarding.setPhone(resume.getPhone());
        onboarding.setEmail(resume.getEmail());
        onboarding.setPositionName(StringUtils.hasText(resume.getPositionName())
                ? resume.getPositionName()
                : (recruit != null ? recruit.getTitle() : null));
        onboarding.setStatus(0);
        onboarding.setFormToken(newFormToken());
        onboarding.setTokenExpiresAt(LocalDateTime.now().plusHours(TOKEN_VALID_HOURS));
        onboarding.setPublicSubmitCount(0);
        onboarding.setFormSchema(defaultFormSchema());
        onboarding.setOfferTemplate(defaultOfferTemplate());
        onboarding.setOfferSendStatus(0);
        onboardingMapper.insert(onboarding);

        resume.setStatus(7);
        resumeMapper.updateById(resume);
        return onboarding;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void cancelByResume(Long resumeId) {
        if (resumeId == null) {
            return;
        }
        // 只取消尚未真正入职(status < 6)的待入职记录:已入职(6)保持不动,已取消(7)无需重复处理。
        List<HrmOnboarding> pending = onboardingMapper.selectList(new LambdaQueryWrapper<HrmOnboarding>()
                .eq(HrmOnboarding::getResumeId, resumeId)
                .eq(HrmOnboarding::getDeleted, 0)
                .lt(HrmOnboarding::getStatus, 6));
        for (HrmOnboarding onboarding : pending) {
            onboarding.setStatus(7);
            onboardingMapper.updateById(onboarding);
        }
    }

    @Override
    public HrmOnboarding publicInfo(String token) {
        HrmOnboarding onboarding = requireActiveToken(token);
        HrmOnboarding safe = new HrmOnboarding();
        safe.setId(onboarding.getId());
        safe.setName(onboarding.getName());
        safe.setPhone(onboarding.getPhone());
        safe.setEmail(onboarding.getEmail());
        safe.setPositionName(onboarding.getPositionName());
        safe.setStatus(onboarding.getStatus());
        safe.setFormSchema(onboarding.getFormSchema());
        safe.setFormData(onboarding.getFormData());
        safe.setExpectedHireDate(onboarding.getExpectedHireDate());
        safe.setTokenExpiresAt(onboarding.getTokenExpiresAt());
        return safe;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void submitPublicForm(String token, Map<String, Object> payload, String clientIp) {
        checkSubmitRate(token, clientIp);
        HrmOnboarding onboarding = requireActiveToken(token);
        Map<String, Object> formData = extractFormData(payload);
        validateFormData(onboarding, formData);
        LocalDateTime now = LocalDateTime.now();
        onboarding.setFormData(writeJson(formData));
        onboarding.setSubmittedTime(now);
        onboarding.setExpectedHireDate(parseDate(valueOf(formData.get("expectedHireDate")), onboarding.getExpectedHireDate()));
        onboarding.setStatus(1);
        onboarding.setTokenUsedTime(now);
        onboarding.setPublicLastSubmitTime(now);
        onboarding.setPublicLastSubmitIp(sanitizeClientIp(clientIp));
        onboarding.setPublicSubmitCount((onboarding.getPublicSubmitCount() == null ? 0 : onboarding.getPublicSubmitCount()) + 1);
        onboardingMapper.updateById(onboarding);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public HrmOnboarding refreshPublicToken(Long id) {
        HrmOnboarding onboarding = requireById(id);
        if (onboarding.getStatus() != null && onboarding.getStatus() >= 2) {
            throw new BusinessException("资料已确认或流程已推进，如需重开登记表请先由 HR 核对当前状态");
        }
        String newToken = newFormToken();
        LocalDateTime expires = LocalDateTime.now().plusHours(TOKEN_VALID_HOURS);
        onboarding.setFormToken(newToken);
        onboarding.setTokenExpiresAt(expires);
        onboarding.setTokenUsedTime(null);
        onboarding.setSubmittedTime(null);
        onboarding.setStatus(0);
        onboarding.setPublicSubmitCount(0);
        onboarding.setPublicLastSubmitTime(null);
        onboarding.setPublicLastSubmitIp(null);
        // MyBatis-Plus updateById 默认跳过 null 字段,这里必须用 LambdaUpdateWrapper 强制清空 tokenUsedTime/submittedTime 等,否则重发链接对已提交过的单子会因 tokenUsedTime!=null 立即失效
        onboardingMapper.update(null, new LambdaUpdateWrapper<HrmOnboarding>()
                .eq(HrmOnboarding::getId, id)
                .set(HrmOnboarding::getFormToken, newToken)
                .set(HrmOnboarding::getTokenExpiresAt, expires)
                .set(HrmOnboarding::getTokenUsedTime, null)
                .set(HrmOnboarding::getSubmittedTime, null)
                .set(HrmOnboarding::getStatus, 0)
                .set(HrmOnboarding::getPublicSubmitCount, 0)
                .set(HrmOnboarding::getPublicLastSubmitTime, null)
                .set(HrmOnboarding::getPublicLastSubmitIp, null));
        return onboarding;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void confirmForm(Long id) {
        HrmOnboarding onboarding = requireById(id);
        onboarding.setConfirmedTime(LocalDateTime.now());
        onboarding.setStatus(Math.max(onboarding.getStatus() == null ? 0 : onboarding.getStatus(), 2));
        onboardingMapper.updateById(onboarding);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public HrmOnboarding generateOffer(Long id, HrmOnboarding payload) {
        HrmOnboarding onboarding = requireById(id);
        if (payload != null) {
            if (StringUtils.hasText(payload.getOfferTemplate())) {
                onboarding.setOfferTemplate(payload.getOfferTemplate());
            }
            if (payload.getExpectedHireDate() != null) {
                onboarding.setExpectedHireDate(payload.getExpectedHireDate());
            }
            if (StringUtils.hasText(payload.getRemark())) {
                onboarding.setRemark(payload.getRemark());
            }
        }
        if (!StringUtils.hasText(onboarding.getOfferTemplate())) {
            onboarding.setOfferTemplate(defaultOfferTemplate());
        }
        onboarding.setOfferContent(renderTemplate(onboarding));
        onboarding.setStatus(Math.max(onboarding.getStatus() == null ? 0 : onboarding.getStatus(), 3));
        onboardingMapper.updateById(onboarding);
        return onboarding;
    }

    @Override
    /**
     * 发送 Offer 邮件。真发:成功才置"已发送",失败把原因写入 offer_send_error 并抛出业务异常(前端据此提示)。
     * 不加 @Transactional——失败分支需把 offerSendError 落库后再抛错,事务回滚会把这条错误记录也撤销。
     */
    public void markOfferSent(Long id) {
        HrmOnboarding onboarding = requireById(id);
        if (!StringUtils.hasText(onboarding.getOfferContent())) {
            onboarding.setOfferContent(renderTemplate(onboarding));
        }
        // 先真发邮件;邮箱为空或发送失败都不谎报"已发送"。
        String error = null;
        if (!StringUtils.hasText(onboarding.getEmail())) {
            error = "候选人邮箱为空,无法发送 Offer";
        } else {
            try {
                String subject = "【浙杭集团】录用通知 Offer"
                        + (StringUtils.hasText(onboarding.getPositionName()) ? " - " + onboarding.getPositionName() : "");
                mailService.send(onboarding.getEmail(), subject, onboarding.getOfferContent());
            } catch (Exception e) {
                error = e.getMessage();
            }
        }
        if (error != null) {
            onboarding.setOfferSendError(error);
            onboardingMapper.updateById(onboarding); // 立即落库错误原因(无事务,不会被回滚)
            throw new BusinessException("Offer 邮件发送失败:" + error);
        }
        int newStatus = Math.max(onboarding.getStatus() == null ? 0 : onboarding.getStatus(), 4);
        // updateById 默认跳过 null 字段,这里必须用 LambdaUpdateWrapper 强制把 offerSendError 清空,否则前端会持续显示过时的"Offer 发送失败"
        onboardingMapper.update(null, new LambdaUpdateWrapper<HrmOnboarding>()
                .eq(HrmOnboarding::getId, onboarding.getId())
                .set(HrmOnboarding::getOfferSendStatus, 1)
                .set(HrmOnboarding::getOfferSentTime, LocalDateTime.now())
                .set(HrmOnboarding::getOfferSendError, null)
                .set(HrmOnboarding::getStatus, newStatus));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public HrmOnboarding createEmployeeDraft(Long id) {
        HrmOnboarding onboarding = requireById(id);
        if (onboarding.getEmployeeId() != null) {
            OrgEmployee linkedEmployee = employeeMapper.selectById(onboarding.getEmployeeId());
            if (linkedEmployee != null) {
                rejectResignedEmployeeReactivation(linkedEmployee);
                return onboarding;
            }
        }

        HrmRecruit recruit = onboarding.getRecruitId() == null ? null : recruitMapper.selectById(onboarding.getRecruitId());
        Map<String, Object> data = parseJson(onboarding.getFormData());
        OrgEmployee employee = new OrgEmployee();
        employee.setEmpCode("DRAFT-ONB-" + onboarding.getId());
        employee.setName(firstText(data, "name", onboarding.getName()));
        employee.setPhone(firstText(data, "phone", onboarding.getPhone()));
        employee.setEmail(firstText(data, "email", onboarding.getEmail()));
        employee.setGender(parseGender(valueOf(data.get("gender"))));
        employee.setBirthDate(parseDate(valueOf(data.get("birthDate")), null));
        employee.setIdCard(valueOf(data.get("idCard")));
        employee.setAddress(valueOf(data.get("address")));
        employee.setDeptId(recruit != null ? recruit.getDeptId() : null);
        employee.setPostId(recruit != null ? recruit.getPostId() : null);
        employee.setHireDate(onboarding.getExpectedHireDate());
        employee.setEducation(firstText(data, "education", null));
        employee.setUniversity(valueOf(data.get("university")));
        employee.setMajor(valueOf(data.get("major")));
        employee.setEmergencyContact(valueOf(data.get("emergencyContact")));
        employee.setEmergencyPhone(valueOf(data.get("emergencyPhone")));
        employee.setStatus(0);
        employee.setRemark("由招聘待入职记录生成草稿: " + onboarding.getPositionName());
        employeeMapper.insert(employee);

        onboarding.setEmployeeId(employee.getId());
        onboarding.setStatus(Math.max(onboarding.getStatus() == null ? 0 : onboarding.getStatus(), 5));
        onboardingMapper.updateById(onboarding);
        return onboarding;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void markOnboarded(Long id) {
        HrmOnboarding onboarding = createEmployeeDraft(id);
        OrgEmployee employee = employeeMapper.selectById(onboarding.getEmployeeId());
        if (employee != null) {
            rejectResignedEmployeeReactivation(employee);
            // 只把真正的待入职草稿(0)推进到试用；重复点击不会把已转正员工降回试用。
            if (Integer.valueOf(0).equals(employee.getStatus())) {
                OrgEmployee patch = new OrgEmployee();
                patch.setStatus(2);
                if (employee.getHireDate() == null) {
                    patch.setHireDate(onboarding.getExpectedHireDate() != null
                            ? onboarding.getExpectedHireDate() : LocalDate.now());
                }
                if (employeeMapper.update(patch, new LambdaUpdateWrapper<OrgEmployee>()
                        .eq(OrgEmployee::getId, employee.getId())
                        .eq(OrgEmployee::getStatus, 0)) <= 0) {
                    OrgEmployee latest = employeeMapper.selectById(employee.getId());
                    rejectResignedEmployeeReactivation(latest);
                    if (latest == null || (!Integer.valueOf(1).equals(latest.getStatus())
                            && !Integer.valueOf(2).equals(latest.getStatus()))) {
                        throw new BusinessException("员工入职状态已变化，请刷新后重试");
                    }
                }
            }
        }
        if (onboarding.getResumeId() != null) {
            HrmResume resume = resumeMapper.selectById(onboarding.getResumeId());
            if (resume != null) {
                resume.setStatus(5);
                resumeMapper.updateById(resume);
            }
        }
        onboarding.setStatus(6);
        onboardingMapper.updateById(onboarding);
    }

    private void rejectResignedEmployeeReactivation(OrgEmployee employee) {
        if (employee != null && Integer.valueOf(3).equals(employee.getStatus())) {
            throw new BusinessException("离职员工不能通过待入职流程恢复，请先按返聘流程恢复员工档案");
        }
    }

    private HrmOnboarding requireById(Long id) {
        HrmOnboarding onboarding = onboardingMapper.selectById(id);
        if (onboarding == null) {
            throw new BusinessException("待入职记录不存在");
        }
        return onboarding;
    }

    private HrmOnboarding requireActiveToken(String token) {
        if (!StringUtils.hasText(token) || token.length() < 16) {
            throw new BusinessException("登记链接无效");
        }
        HrmOnboarding onboarding = onboardingMapper.selectOne(new LambdaQueryWrapper<HrmOnboarding>()
                .eq(HrmOnboarding::getFormToken, token)
                .eq(HrmOnboarding::getDeleted, 0)
                .last("LIMIT 1"));
        if (onboarding == null) {
            throw new BusinessException("登记链接无效或已失效");
        }
        if (onboarding.getStatus() != null && onboarding.getStatus() >= 6) {
            throw new BusinessException("登记表已关闭，请联系 HR 处理");
        }
        if (onboarding.getTokenUsedTime() != null || (onboarding.getStatus() != null && onboarding.getStatus() >= 1)) {
            throw new BusinessException("登记表已提交，链接已失效；如需修改请联系 HR 重新发送");
        }
        LocalDateTime expiresAt = onboarding.getTokenExpiresAt();
        if (expiresAt == null || expiresAt.isBefore(LocalDateTime.now())) {
            throw new BusinessException("登记链接已过期，请联系 HR 重新发送");
        }
        return onboarding;
    }

    private String newFormToken() {
        for (int i = 0; i < 5; i++) {
            String token = UUID.randomUUID().toString().replace("-", "");
            Long count = onboardingMapper.selectCount(new LambdaQueryWrapper<HrmOnboarding>().eq(HrmOnboarding::getFormToken, token));
            if (count == null || count == 0) {
                return token;
            }
        }
        throw new BusinessException("生成登记链接失败，请重试");
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> extractFormData(Map<String, Object> payload) {
        if (payload == null) {
            return new HashMap<>();
        }
        Object formData = payload.get("formData");
        if (formData instanceof Map<?, ?> map) {
            return (Map<String, Object>) map;
        }
        return payload;
    }

    private Map<String, Object> parseJson(String json) {
        if (!StringUtils.hasText(json)) {
            return new HashMap<>();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {});
        } catch (Exception ignored) {
            return new HashMap<>();
        }
    }

    private String writeJson(Map<String, Object> data) {
        try {
            return objectMapper.writeValueAsString(data == null ? new HashMap<>() : data);
        } catch (Exception e) {
            throw new BusinessException("登记表数据格式错误");
        }
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> readFormSchema(String schema) {
        if (!StringUtils.hasText(schema)) {
            return List.of();
        }
        try {
            return objectMapper.readValue(schema, new TypeReference<List<Map<String, Object>>>() {});
        } catch (Exception e) {
            throw new BusinessException("登记表模板配置错误，请联系 HR 处理");
        }
    }

    private void validateFormData(HrmOnboarding onboarding, Map<String, Object> formData) {
        List<Map<String, Object>> fields = readFormSchema(onboarding.getFormSchema());
        for (Map<String, Object> field : fields) {
            String key = valueOf(field.get("key"));
            String label = firstNonBlank(valueOf(field.get("label")), key, "字段");
            if (!StringUtils.hasText(key)) {
                continue;
            }
            Object raw = formData.get(key);
            String value = valueOf(raw);
            if (isRequired(field.get("required")) && !StringUtils.hasText(value)) {
                throw new BusinessException("请填写" + label);
            }
            if (StringUtils.hasText(value) && value.length() > MAX_FORM_VALUE_LENGTH) {
                throw new BusinessException(label + "内容过长，请控制在 " + MAX_FORM_VALUE_LENGTH + " 字以内");
            }
            if (!StringUtils.hasText(value)) {
                continue;
            }
            String type = valueOf(field.get("type"));
            if ("date".equals(type)) {
                try {
                    LocalDate.parse(value);
                } catch (DateTimeParseException e) {
                    throw new BusinessException(label + "日期格式不正确");
                }
            }
            validateCommonField(key, label, value);
        }
    }

    private void validateCommonField(String key, String label, String value) {
        String lowerKey = key.toLowerCase();
        if (lowerKey.contains("phone") && !value.matches("^1\\d{10}$|^\\+?\\d{6,20}$")) {
            throw new BusinessException(label + "格式不正确");
        }
        if (lowerKey.contains("email") && !value.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            throw new BusinessException(label + "格式不正确");
        }
        if (lowerKey.contains("idcard") && !value.matches("^[0-9Xx]{15,18}$")) {
            throw new BusinessException(label + "格式不正确");
        }
    }

    private boolean isRequired(Object required) {
        return Boolean.TRUE.equals(required) || "true".equalsIgnoreCase(valueOf(required)) || "1".equals(valueOf(required));
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (StringUtils.hasText(value)) {
                return value;
            }
        }
        return "";
    }

    private void checkSubmitRate(String token, String clientIp) {
        String key = sanitizeClientIp(clientIp) + ":" + (StringUtils.hasText(token) ? token : "empty");
        LocalDateTime now = LocalDateTime.now();
        SubmitWindow window = submitWindows.compute(key, (_key, current) -> {
            if (current == null || current.start.plusMinutes(SUBMIT_LIMIT_WINDOW_MINUTES).isBefore(now)) {
                return new SubmitWindow(now, 1);
            }
            current.attempts++;
            return current;
        });
        if (window.attempts > SUBMIT_LIMIT_MAX_ATTEMPTS) {
            throw new BusinessException("提交过于频繁，请稍后再试");
        }
        submitWindows.entrySet().removeIf(entry -> entry.getValue().start.plusMinutes(SUBMIT_LIMIT_WINDOW_MINUTES).isBefore(now));
    }

    private String sanitizeClientIp(String clientIp) {
        if (!StringUtils.hasText(clientIp)) {
            return "unknown";
        }
        String ip = clientIp.trim();
        if (ip.length() > 64) {
            return ip.substring(0, 64);
        }
        return ip;
    }

    private String renderTemplate(HrmOnboarding onboarding) {
        Map<String, Object> data = parseJson(onboarding.getFormData());
        Map<String, String> vars = new HashMap<>();
        vars.put("name", firstText(data, "name", onboarding.getName()));
        vars.put("positionName", firstText(data, "positionName", onboarding.getPositionName()));
        vars.put("phone", firstText(data, "phone", onboarding.getPhone()));
        vars.put("email", firstText(data, "email", onboarding.getEmail()));
        vars.put("expectedHireDate", onboarding.getExpectedHireDate() != null ? onboarding.getExpectedHireDate().toString() : "待确认");
        vars.put("companyName", "浙杭集团");
        String content = StringUtils.hasText(onboarding.getOfferTemplate()) ? onboarding.getOfferTemplate() : defaultOfferTemplate();
        for (Map.Entry<String, String> entry : vars.entrySet()) {
            content = content.replace("{{" + entry.getKey() + "}}", entry.getValue() == null ? "" : entry.getValue());
        }
        return content;
    }

    private String valueOf(Object value) {
        return value == null ? null : String.valueOf(value).trim();
    }

    private String firstText(Map<String, Object> data, String key, String fallback) {
        String value = valueOf(data.get(key));
        return StringUtils.hasText(value) ? value : fallback;
    }

    private LocalDate parseDate(String value, LocalDate fallback) {
        if (!StringUtils.hasText(value)) {
            return fallback;
        }
        try {
            return LocalDate.parse(value);
        } catch (DateTimeParseException ignored) {
            return fallback;
        }
    }

    private Integer parseGender(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        if ("女".equals(value) || "1".equals(value)) {
            return 1;
        }
        if ("男".equals(value) || "0".equals(value)) {
            return 0;
        }
        return null;
    }

    private String defaultFormSchema() {
        return """
                [
                  {"key":"name","label":"姓名","type":"text","required":true},
                  {"key":"phone","label":"手机号","type":"text","required":true},
                  {"key":"email","label":"邮箱","type":"text","required":false},
                  {"key":"gender","label":"性别","type":"select","required":false,"options":["男","女"]},
                  {"key":"birthDate","label":"出生日期","type":"date","required":false},
                  {"key":"idCard","label":"身份证号","type":"text","required":true},
                  {"key":"politicalStatus","label":"政治面貌","type":"select","required":false,"options":["群众","共青团员","中共党员","中共预备党员","民主党派","无党派人士"]},
                  {"key":"maritalStatus","label":"婚育状况","type":"select","required":false,"options":["未婚","已婚未育","已婚已育","离异","其他"]},
                  {"key":"education","label":"最高学历","type":"select","required":false,"options":["高中/中专","大专","本科","硕士","博士"]},
                  {"key":"university","label":"毕业院校","type":"text","required":false},
                  {"key":"major","label":"专业","type":"text","required":false},
                  {"key":"address","label":"现居住地址","type":"textarea","required":false},
                  {"key":"bankAccount","label":"银行卡号","type":"text","required":false},
                  {"key":"bankName","label":"开户行","type":"text","required":false},
                  {"key":"emergencyContact","label":"紧急联系人姓名","type":"text","required":true},
                  {"key":"emergencyRelation","label":"与本人关系","type":"select","required":false,"options":["父母","配偶","子女","兄弟姐妹","朋友","其他"]},
                  {"key":"emergencyPhone","label":"紧急联系人电话","type":"text","required":true},
                  {"key":"expectedHireDate","label":"预计入职日期","type":"date","required":true}
                ]
                """;
    }

    private String defaultOfferTemplate() {
        return """
                亲爱的 {{name}}：

                恭喜你通过浙杭集团 {{positionName}} 岗位面试。我们诚挚邀请你加入浙杭集团，预计入职日期为 {{expectedHireDate}}。

                请入职当天携带身份证原件、银行卡信息、学历/证书材料，并保持电话 {{phone}} 畅通。如有疑问，请及时联系招聘负责人。

                浙杭集团
                """;
    }

    private static class SubmitWindow {
        private final LocalDateTime start;
        private int attempts;

        private SubmitWindow(LocalDateTime start, int attempts) {
            this.start = start;
            this.attempts = attempts;
        }
    }
}
