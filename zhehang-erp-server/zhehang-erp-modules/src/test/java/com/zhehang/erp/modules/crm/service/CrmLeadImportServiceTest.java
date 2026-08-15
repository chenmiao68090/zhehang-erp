package com.zhehang.erp.modules.crm.service;

import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.crm.domain.dto.CrmLeadImportConfirmRequest;
import com.zhehang.erp.modules.crm.domain.dto.CrmLeadImportRequest;
import com.zhehang.erp.modules.crm.domain.dto.CrmLeadImportRowDTO;
import com.zhehang.erp.modules.crm.domain.entity.CrmContact;
import com.zhehang.erp.modules.crm.domain.entity.CrmCustomer;
import com.zhehang.erp.modules.crm.domain.entity.CrmLead;
import com.zhehang.erp.modules.crm.domain.entity.CrmPoolConfig;
import com.zhehang.erp.modules.crm.domain.entity.CrmPoolRuleVersion;
import com.zhehang.erp.modules.crm.domain.vo.CrmLeadImportPreviewVO;
import com.zhehang.erp.modules.crm.domain.vo.CrmLeadImportResultVO;
import com.zhehang.erp.modules.crm.mapper.CrmContactMapper;
import com.zhehang.erp.modules.crm.mapper.CrmCustomerMapper;
import com.zhehang.erp.modules.crm.mapper.CrmLeadMapper;
import com.zhehang.erp.modules.crm.mapper.CrmPoolConfigMapper;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.security.domain.LoginUser;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionStatus;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class CrmLeadImportServiceTest {

    @Mock private CrmLeadMapper leadMapper;
    @Mock private CrmCustomerMapper customerMapper;
    @Mock private CrmContactMapper contactMapper;
    @Mock private CrmPoolConfigMapper poolConfigMapper;
    @Mock private CrmLeadStageRecorder stageRecorder;
    @Mock private CrmPoolRuleService ruleService;
    @Mock private DataScopeHelper dataScopeHelper;
    @Mock private StringRedisTemplate redisTemplate;
    @Mock private ValueOperations<String, String> valueOperations;
    @Mock private PlatformTransactionManager transactionManager;
    @Mock private TransactionStatus transactionStatus;

    private final Map<String, String> redisValues = new HashMap<>();
    private CrmLeadImportService service;

    @BeforeEach
    void setUp() {
        LoginUser user = new LoginUser();
        user.setUserId(101L);
        user.setTenantId(9L);
        user.setUsername("import-manager");
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(user, null, List.of()));

        lenient().when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        lenient().doAnswer(invocation -> {
            redisValues.put(invocation.getArgument(0), invocation.getArgument(1));
            return null;
        }).when(valueOperations).set(anyString(), anyString(), any(Duration.class));
        lenient().when(valueOperations.getAndDelete(anyString()))
                .thenAnswer(invocation -> redisValues.remove(invocation.getArgument(0)));
        lenient().when(valueOperations.setIfAbsent(anyString(), anyString(), any(Duration.class)))
                .thenAnswer(invocation -> redisValues.putIfAbsent(
                        invocation.getArgument(0), invocation.getArgument(1)) == null);

        lenient().when(transactionManager.getTransaction(any())).thenReturn(transactionStatus);
        lenient().when(customerMapper.selectList(any())).thenReturn(List.of());
        lenient().when(contactMapper.selectList(any())).thenReturn(List.of());
        lenient().when(leadMapper.selectList(any())).thenReturn(List.of());
        lenient().when(dataScopeHelper.resolveUserNames(any())).thenReturn(Map.of());
        lenient().when(dataScopeHelper.canAccess(any(), any())).thenReturn(true);
        lenient().when(dataScopeHelper.isManagerOrAdmin()).thenReturn(true);
        CrmPoolRuleVersion rules = new CrmPoolRuleVersion();
        rules.setSingleImportLimit(1000);
        rules.setDailyImportLimit(10000);
        lenient().when(ruleService.current()).thenReturn(rules);

        service = new CrmLeadImportService(leadMapper, customerMapper, contactMapper,
                poolConfigMapper, stageRecorder, ruleService, dataScopeHelper, redisTemplate, transactionManager);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void customerLevelAlwaysInsertsNullInsteadOfDatabaseLegacyDefault() throws Exception {
        var tableField = CrmLead.class.getDeclaredField("customerLevel")
                .getAnnotation(com.baomidou.mybatisplus.annotation.TableField.class);

        assertThat(tableField).isNotNull();
        assertThat(tableField.insertStrategy())
                .isEqualTo(com.baomidou.mybatisplus.annotation.FieldStrategy.ALWAYS);
    }

    @Test
    void rejectsMoreThanOneThousandRows() {
        CrmLeadImportRequest request = baseRequest(validRow("企业A", "13800138000", null));
        request.setRows(new ArrayList<>());
        for (int i = 0; i < 1001; i++) {
            request.getRows().add(validRow("企业" + i, "138" + String.format("%08d", i), null));
        }

        assertThatThrownBy(() -> service.preflight(request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("1000");
    }

    @Test
    void acceptsMoreThanOneThousandRowsWhenPublishedRuleAllowsIt() {
        CrmPoolRuleVersion rules = new CrmPoolRuleVersion();
        rules.setSingleImportLimit(10000);
        rules.setDailyImportLimit(100000);
        when(ruleService.current()).thenReturn(rules);
        CrmLeadImportRequest request = baseRequest(validRow("企业A", "13800138000", null));
        request.setRows(new ArrayList<>());
        for (int i = 0; i < 1001; i++) {
            CrmLeadImportRowDTO row = validRow("企业" + i, "138" + String.format("%08d", i), null);
            row.setRowNumber(i + 2);
            request.getRows().add(row);
        }

        assertThatCode(() -> service.preflight(request)).doesNotThrowAnyException();
        verify(ruleService).assertDailyCapacity(CrmPoolRuleService.BATCH_IMPORT, 1001);
    }

    @Test
    void rejectsCrossTenantDisabledAndForbiddenPools() {
        CrmLeadImportRequest request = baseRequest(validRow("企业A", "13800138000", null));
        request.setPoolId(77L);

        CrmPoolConfig crossTenant = pool(8L, 0, "telemarketing");
        CrmPoolConfig disabled = pool(9L, 1, "telemarketing");
        CrmPoolConfig treasure = pool(9L, 0, "treasure");
        when(poolConfigMapper.selectById(77L)).thenReturn(crossTenant, disabled, treasure);

        assertThatThrownBy(() -> service.preflight(request)).hasMessageContaining("不属于当前公司");
        assertThatThrownBy(() -> service.preflight(request)).hasMessageContaining("已禁用");
        assertThatThrownBy(() -> service.preflight(request)).hasMessageContaining("不允许批量导入");
    }

    @Test
    void exactFormalCustomerCreditIsDuplicateAndGuidesToMyCustomers() {
        CrmCustomer customer = customer(12L, "存量客户", "91330100MA2A123456");
        when(customerMapper.selectList(any())).thenReturn(List.of(customer));
        CrmLeadImportRequest request = baseRequest(validRow("上传名称可不同", "13800138000",
                "91330100MA2A123456"));

        CrmLeadImportPreviewVO preview = service.preflight(request);

        assertThat(preview.getRows().get(0).getStatus()).isEqualTo("DUPLICATE");
        assertThat(preview.getRows().get(0).getReasonCodes()).containsExactly("EXISTING_CUSTOMER_CREDIT_CODE");
        assertThat(preview.getRows().get(0).getReasons().get(0)).contains("已是正式客户", "我的客户");
        assertThat(preview.getRows().get(0).getExistingLocation()).isEqualTo("正式客户");
        assertThat(preview.getRows().get(0).getExistingRecordId()).isEqualTo(12L);
        assertThat(preview.getRows().get(0).getExistingTarget()).isEqualTo("CUSTOMER");
    }

    @Test
    void invalidLeadDuplicatePointsToHistoryInsteadOfBecomingInvisible() {
        CrmLead invalid = lead(21L, "历史企业", null, "13800138000", null);
        invalid.setOwnership("private");
        invalid.setStatus(4);
        invalid.setOwnerId(101L);
        invalid.setDeptId(7L);
        when(leadMapper.selectList(any())).thenReturn(List.of(invalid));

        CrmLeadImportPreviewVO preview = service.preflight(baseRequest(
                validRow("历史企业", "13800138000", null)));

        assertThat(preview.getRows().get(0).getStatus()).isEqualTo("DUPLICATE");
        assertThat(preview.getRows().get(0).getExistingLocation()).isEqualTo("历史客资");
        assertThat(preview.getRows().get(0).getExistingRecordId()).isEqualTo(21L);
        assertThat(preview.getRows().get(0).getExistingTarget()).isEqualTo("HISTORY");
    }

    @Test
    void inaccessiblePrivateLeadNeverExposesRecordIdOrOwner() {
        CrmLead other = lead(22L, "其他销售客户", null, "13900139000", null);
        other.setOwnership("private");
        other.setStatus(2);
        other.setOwnerId(202L);
        other.setDeptId(8L);
        when(leadMapper.selectList(any())).thenReturn(List.of(other));
        when(dataScopeHelper.canAccess(202L, 8L)).thenReturn(false);
        when(dataScopeHelper.isManagerOrAdmin()).thenReturn(false);

        CrmLeadImportPreviewVO preview = service.preflight(baseRequest(
                validRow("其他销售客户", "13900139000", null)));

        assertThat(preview.getRows().get(0).getExistingLocation()).isEqualTo("其他销售跟进中");
        assertThat(preview.getRows().get(0).getExistingOwnerName()).isEqualTo("其他销售");
        assertThat(preview.getRows().get(0).getExistingRecordId()).isNull();
        assertThat(preview.getRows().get(0).getExistingTarget()).isEqualTo("NONE");
    }

    @Test
    void convertedLeadAndFormalCustomerAreOneDuplicateSubjectWithoutCreditCode() {
        CrmCustomer customer = customer(12L, "存量客户", null);
        CrmLead convertedLead = lead(21L, "存量客户", null, "13800138000", null);
        convertedLead.setConvertedCustomerId(12L);
        when(customerMapper.selectList(any())).thenReturn(List.of(customer));
        when(leadMapper.selectList(any())).thenReturn(List.of(convertedLead));

        CrmLeadImportPreviewVO preview = service.preflight(baseRequest(
                validRow("存量客户", "13800138000", null)));

        assertThat(preview.getRows().get(0).getStatus()).isEqualTo("DUPLICATE");
        assertThat(preview.getRows().get(0).getReasonCodes())
                .containsExactly("EXISTING_CUSTOMER_COMPANY");
        assertThat(preview.getRows().get(0).getReasons().get(0)).contains("已是正式客户", "我的客户");
    }

    @Test
    void sameCreditRemainsDuplicateButCreditAndPhonePointingToDifferentSubjectsConflict() {
        CrmCustomer formal = customer(12L, "存量客户", "91330100MA2A123456");
        CrmLead sameCreditLead = lead(21L, "历史重复线索", "91330100MA2A123456", null, null);
        when(customerMapper.selectList(any())).thenReturn(List.of(formal));
        when(leadMapper.selectList(any())).thenReturn(List.of(sameCreditLead));
        CrmLeadImportPreviewVO duplicate = service.preflight(baseRequest(
                validRow("上传公司", "13800138000", "91330100MA2A123456")));
        assertThat(duplicate.getRows().get(0).getStatus()).isEqualTo("DUPLICATE");
        assertThat(duplicate.getRows().get(0).getReasonCodes())
                .containsExactly("EXISTING_CUSTOMER_CREDIT_CODE");

        CrmLead otherPhoneOwner = lead(22L, "另一公司", null, "13900139000", null);
        when(leadMapper.selectList(any())).thenReturn(List.of(sameCreditLead, otherPhoneOwner));
        CrmLeadImportPreviewVO conflict = service.preflight(baseRequest(
                validRow("上传公司", "13900139000", "91330100MA2A123456")));
        assertThat(conflict.getRows().get(0).getStatus()).isEqualTo("CONFLICT");
        assertThat(conflict.getRows().get(0).getReasonCodes()).containsExactly("EXISTING_MULTIPLE_SUBJECTS");
    }

    @Test
    void sameCompanyWithDifferentNonEmptyCreditIsConflict() {
        when(customerMapper.selectList(any())).thenReturn(List.of(
                customer(12L, "杭州浙杭企业服务有限公司", "91330100MA2A123456")));
        CrmLeadImportRequest request = baseRequest(validRow("杭州 浙杭企业服务有限公司", "13800138000",
                "91330100MA2B123456"));

        CrmLeadImportPreviewVO preview = service.preflight(request);

        assertThat(preview.getRows().get(0).getStatus()).isEqualTo("CONFLICT");
        assertThat(preview.getRows().get(0).getReasonCodes())
                .containsExactly("EXISTING_CUSTOMER_COMPANY_CREDIT_CODE_CONFLICT");
    }

    @Test
    void phoneAndCompanyPhoneHittingDifferentSubjectsIsConflict() {
        CrmLead first = lead(21L, "企业甲", null, "13800138000", null);
        CrmLead second = lead(22L, "企业乙", null, null, "057112345678");
        when(leadMapper.selectList(any())).thenReturn(List.of(first, second));
        CrmLeadImportRowDTO row = validRow("企业丙", "13800138000", null);
        row.setCompanyPhone("0571-12345678");

        CrmLeadImportPreviewVO preview = service.preflight(baseRequest(row));

        assertThat(preview.getRows().get(0).getStatus()).isEqualTo("CONFLICT");
        assertThat(preview.getRows().get(0).getReasonCodes()).containsExactly("EXISTING_MULTIPLE_SUBJECTS");
    }

    @Test
    void contactMobileAlsoParticipatesInCrossColumnDeduplication() {
        CrmCustomer customer = customer(12L, "企业甲", null);
        CrmContact contact = new CrmContact();
        contact.setCustomerId(12L);
        contact.setMobile("13800138000");
        when(customerMapper.selectList(any())).thenReturn(List.of(customer));
        when(contactMapper.selectList(any())).thenReturn(List.of(contact));
        CrmLeadImportRowDTO row = validRow("企业乙", null, null);
        row.setCompanyPhone("+86 138-0013-8000");

        CrmLeadImportPreviewVO preview = service.preflight(baseRequest(row));

        assertThat(preview.getRows().get(0).getStatus()).isEqualTo("CONFLICT");
        assertThat(preview.getRows().get(0).getReasonCodes())
                .containsExactly("EXISTING_CUSTOMER_PHONE_OTHER_COMPANY");
    }

    @Test
    void everyRowInFileCompanyCreditConflictGroupIsBlocked() {
        // 即使第一行信用代码已命中旧库，文件自身的身份冲突仍必须让整组 CONFLICT。
        when(customerMapper.selectList(any())).thenReturn(List.of(
                customer(12L, "同名企业", "91330100MA2A123456")));
        CrmLeadImportRowDTO first = validRow("同名企业", "13800138000", "91330100MA2A123456");
        CrmLeadImportRowDTO second = validRow("同 名 企 业", "13900139000", "91330100MA2B123456");
        second.setRowNumber(3);
        CrmLeadImportRequest request = baseRequest(first);
        request.setRows(List.of(first, second));

        CrmLeadImportPreviewVO preview = service.preflight(request);

        assertThat(preview.getRows()).extracting(row -> row.getStatus())
                .containsExactly("CONFLICT", "CONFLICT");
        assertThat(preview.getRows()).allSatisfy(row -> assertThat(row.getReasonCodes())
                .containsExactly("FILE_COMPANY_CREDIT_CODE_CONFLICT"));
    }

    @Test
    void everyRowInCrossColumnFilePhoneConflictGroupIsBlocked() {
        when(leadMapper.selectList(any())).thenReturn(List.of(
                lead(21L, "企业甲", null, "13800138000", null)));
        CrmLeadImportRowDTO first = validRow("企业甲", "13800138000", null);
        CrmLeadImportRowDTO second = validRow("企业乙", null, null);
        second.setRowNumber(3);
        second.setCompanyPhone("+86 13800138000");
        CrmLeadImportRequest request = baseRequest(first);
        request.setRows(List.of(first, second));

        CrmLeadImportPreviewVO preview = service.preflight(request);

        assertThat(preview.getRows()).extracting(row -> row.getStatus())
                .containsExactly("CONFLICT", "CONFLICT");
        assertThat(preview.getSummary().getConflict()).isEqualTo(2);
    }

    @Test
    void nullRowStillReservesItsDefaultRowNumber() {
        CrmLeadImportRowDTO explicitDuplicate = validRow("企业乙", "13900139000", null);
        explicitDuplicate.setRowNumber(2);
        CrmLeadImportRequest request = baseRequest(explicitDuplicate);
        request.setRows(java.util.Arrays.asList(null, explicitDuplicate));

        assertThatThrownBy(() -> service.preflight(request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("行号不能重复");
    }

    @Test
    void wechatOnlyRowRemainsReadyWithWeakDedupeWarning() {
        CrmLeadImportRowDTO row = validRow("企业甲", null, null);
        row.setWechatNo("wx-company-a");

        CrmLeadImportPreviewVO preview = service.preflight(baseRequest(row));

        assertThat(preview.getRows().get(0).getStatus()).isEqualTo("READY");
        assertThat(preview.getRows().get(0).getWarningCodes())
                .containsExactly("WECHAT_ONLY_WEAK_DEDUPE");
        assertThat(preview.getSummary().getWarning()).isEqualTo(1);
    }

    @Test
    void confirmRejectsChangedRequestBoundToPreviewToken() {
        CrmLeadImportRequest request = baseRequest(validRow("企业甲", "13800138000", null));
        CrmLeadImportPreviewVO preview = service.preflight(request);
        CrmLeadImportConfirmRequest confirm = confirmOf(request, preview.getPreviewToken());
        confirm.setBatchName("被篡改的批次");

        assertThatThrownBy(() -> service.confirm(confirm))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("数据已变化");
        verify(leadMapper, never()).insert(any());
    }

    @Test
    void confirmRechecksDatabaseAndSkipsNewFormalCustomer() {
        CrmCustomer appearedAfterPreflight = customer(12L, "企业甲", "91330100MA2A123456");
        when(customerMapper.selectList(any())).thenReturn(List.of(), List.of(appearedAfterPreflight));
        CrmLeadImportRequest request = baseRequest(validRow("企业甲", "13800138000",
                "91330100MA2A123456"));
        CrmLeadImportPreviewVO preview = service.preflight(request);

        CrmLeadImportResultVO result = service.confirm(confirmOf(request, preview.getPreviewToken()));

        assertThat(preview.getRows().get(0).getStatus()).isEqualTo("READY");
        assertThat(result.getRows().get(0).getStatus()).isEqualTo("SKIPPED_DUPLICATE");
        assertThat(result.getSummary().getDuplicate()).isEqualTo(1);
        verify(leadMapper, never()).insert(any());
    }

    @Test
    @SuppressWarnings("unchecked")
    void redisLockReleaseFailureDoesNotHideCommittedImportResult() {
        CrmLeadImportRequest request = baseRequest(validRow("企业甲", "13800138000", null));
        when(leadMapper.insert(any())).thenReturn(1);
        CrmLeadImportPreviewVO preview = service.preflight(request);
        when(redisTemplate.execute(any(RedisScript.class), anyList(), any()))
                .thenThrow(new IllegalStateException("redis release unavailable"));

        CrmLeadImportResultVO result = service.confirm(confirmOf(request, preview.getPreviewToken()));

        assertThat(result.getSummary().getImported()).isEqualTo(1);
        assertThat(result.getRows().get(0).getStatus()).isEqualTo("IMPORTED");
        verify(leadMapper).insert(any());
    }

    @Test
    void registeredCapitalIsRoundedAndInvalidRangeOrFormatIsRejectedInPreflight() {
        CrmLeadImportRowDTO rounded = validRow("企业甲", "13800138000", null);
        rounded.setRegisteredCapital("12345元");

        CrmLeadImportPreviewVO roundedPreview = service.preflight(baseRequest(rounded));

        assertThat(roundedPreview.getRows().get(0).getStatus()).isEqualTo("READY");
        assertThat(roundedPreview.getRows().get(0).getRow().getRegisteredCapital()).isEqualTo("1.23");

        CrmLeadImportRowDTO formatted = validRow("格式正常企业", "13500135000", null);
        formatted.setRegisteredCapital("人民币 1,234.56 万元");
        CrmLeadImportPreviewVO formattedPreview = service.preflight(baseRequest(formatted));
        assertThat(formattedPreview.getRows().get(0).getStatus()).isEqualTo("READY");
        assertThat(formattedPreview.getRows().get(0).getRow().getRegisteredCapital()).isEqualTo("1234.56");

        CrmLeadImportRowDTO overflow = validRow("企业乙", "13900139000", null);
        overflow.setRegisteredCapital("10000000000万元");
        CrmLeadImportPreviewVO overflowPreview = service.preflight(baseRequest(overflow));
        assertThat(overflowPreview.getRows().get(0).getStatus()).isEqualTo("ERROR");
        assertThat(overflowPreview.getRows().get(0).getReasonCodes())
                .containsExactly("INVALID_REGISTERED_CAPITAL");

        CrmLeadImportRowDTO negative = validRow("企业丙", "13700137000", null);
        negative.setRegisteredCapital("-1万元");
        CrmLeadImportPreviewVO negativePreview = service.preflight(baseRequest(negative));
        assertThat(negativePreview.getRows().get(0).getStatus()).isEqualTo("ERROR");
        assertThat(negativePreview.getRows().get(0).getReasonCodes())
                .containsExactly("INVALID_REGISTERED_CAPITAL");

        for (String malformedCapital : List.of("1e10万元", "1.2.3万元", "100万元左右")) {
            CrmLeadImportRowDTO malformed = validRow("格式异常企业", "13600136000", null);
            malformed.setRegisteredCapital(malformedCapital);
            CrmLeadImportPreviewVO malformedPreview = service.preflight(baseRequest(malformed));
            assertThat(malformedPreview.getRows().get(0).getStatus()).isEqualTo("ERROR");
            assertThat(malformedPreview.getRows().get(0).getReasonCodes())
                    .containsExactly("INVALID_REGISTERED_CAPITAL");
        }
    }

    @Test
    void confirmMapsBusinessFieldsAndAllocatesNonNullUniqueLeadNumbersWithoutNPlusOne() {
        CrmLeadImportRowDTO first = validRow("企业甲", "13800138000", null);
        first.setRegisteredCapital("1亿元");
        first.setIndustry("软件和信息技术服务业");
        CrmLeadImportRowDTO second = validRow("企业乙", "13900139000", null);
        second.setRowNumber(3);
        CrmLeadImportRequest request = baseRequest(first);
        request.setSourceType(8);
        request.setSourcePlatform("渠道伙伴");
        request.setSourceDetail("园区商会");
        request.setRows(List.of(first, second));
        when(leadMapper.insert(any())).thenReturn(1);
        CrmLeadImportPreviewVO preview = service.preflight(request);

        CrmLeadImportResultVO result = service.confirm(confirmOf(request, preview.getPreviewToken()));

        ArgumentCaptor<CrmLead> captor = ArgumentCaptor.forClass(CrmLead.class);
        verify(leadMapper, org.mockito.Mockito.times(2)).insert(captor.capture());
        List<CrmLead> inserted = captor.getAllValues();
        assertThat(result.getSummary().getImported()).isEqualTo(2);
        assertThat(inserted).extracting(CrmLead::getLeadNo)
                .doesNotContainNull()
                .doesNotHaveDuplicates()
                .allMatch(value -> value.matches("TL\\d{8}\\d{6}"));
        assertThat(inserted.get(0).getRegisteredCapital()).isEqualByComparingTo(new BigDecimal("10000"));
        assertThat(inserted.get(0).getSource()).isEqualTo(8);
        assertThat(inserted.get(0).getSourcePlatform()).isEqualTo("渠道伙伴");
        assertThat(inserted.get(0).getSourceDetail()).isEqualTo("园区商会");
        assertThat(inserted.get(0).getChannel()).isEqualTo("导入验收批次");
        assertThat(inserted.get(0).getRemark()).contains("行业门类: 软件和信息技术服务业");
        assertThat(inserted.get(0).getStatus()).isEqualTo(1);
        assertThat(inserted.get(0).getOwnership()).isEqualTo("pool");
        assertThat(inserted.get(0).getCustomerLevel()).isNull();
        assertThat(inserted.get(0).getIntentLevel()).isNull();
        assertThat(inserted.get(0).getOwnerId()).isNull();
        assertThat(inserted.get(0).getDeptId()).isNull();
    }

    private CrmLeadImportRequest baseRequest(CrmLeadImportRowDTO row) {
        CrmLeadImportRequest request = new CrmLeadImportRequest();
        request.setSourceType(1);
        request.setSourcePlatform("天眼查");
        request.setSourceDetail("工商公开查询");
        request.setBatchName("导入验收批次");
        request.setRows(List.of(row));
        return request;
    }

    private CrmLeadImportConfirmRequest confirmOf(CrmLeadImportRequest request, String token) {
        CrmLeadImportConfirmRequest confirm = new CrmLeadImportConfirmRequest();
        confirm.setPreviewToken(token);
        confirm.setSourceType(request.getSourceType());
        confirm.setSourcePlatform(request.getSourcePlatform());
        confirm.setSourceDetail(request.getSourceDetail());
        confirm.setBatchName(request.getBatchName());
        confirm.setPoolId(request.getPoolId());
        confirm.setRows(request.getRows());
        return confirm;
    }

    private CrmLeadImportRowDTO validRow(String company, String phone, String creditCode) {
        CrmLeadImportRowDTO row = new CrmLeadImportRowDTO();
        row.setRowNumber(2);
        row.setCompany(company);
        row.setPhone(phone);
        row.setCreditCode(creditCode);
        return row;
    }

    private CrmCustomer customer(Long id, String company, String creditCode) {
        CrmCustomer customer = new CrmCustomer();
        customer.setId(id);
        customer.setName(company);
        customer.setCreditCode(creditCode);
        return customer;
    }

    private CrmLead lead(Long id, String company, String creditCode, String phone, String companyPhone) {
        CrmLead lead = new CrmLead();
        lead.setId(id);
        lead.setCompany(company);
        lead.setCreditCode(creditCode);
        lead.setPhone(phone);
        lead.setCompanyPhone(companyPhone);
        return lead;
    }

    private CrmPoolConfig pool(Long tenantId, Integer status, String type) {
        CrmPoolConfig pool = new CrmPoolConfig();
        pool.setTenantId(tenantId);
        pool.setStatus(status);
        pool.setPoolType(type);
        return pool;
    }
}
