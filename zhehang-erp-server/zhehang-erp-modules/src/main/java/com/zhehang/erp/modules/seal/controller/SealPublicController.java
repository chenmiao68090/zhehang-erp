package com.zhehang.erp.modules.seal.controller;

import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.seal.domain.BizSealOrder;
import com.zhehang.erp.modules.seal.mapper.BizSealOrderMapper;
import com.zhehang.erp.modules.seal.service.SealPublicTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 刻章客户自助端点。经办人登录后生成短时随机链接，客户凭票据填写基本信息。
 * 只有带有效票据的 options/submit 公开，不返回内部列表，也不接收身份证等敏感附件。
 */
@RestController
@RequestMapping("/seal/public")
@RequiredArgsConstructor
public class SealPublicController {

    private final BizSealOrderMapper orderMapper;
    private final SealPublicTokenService tokenService;

    /** 印章状态可选项(与后台登记保持一致) */
    private static final List<String> SEAL_STATUSES =
            List.of("新设刻章", "变更刻章", "损坏重刻", "遗失声明", "遗失登报", "仅备案");
    /** 刻章城市可选项 */
    private static final List<String> SEAL_CITIES =
            List.of("杭州", "台州", "温州", "金华", "宁波", "湖州", "绍兴", "嘉兴", "衢州", "丽水", "舟山");
    /** 印章材质可选项 */
    private static final List<String> SEAL_MATERIALS = List.of("光敏", "牛角", "回墨");
    /** 印章类型可选项 */
    private static final List<String> SEAL_TYPES =
            List.of("法定名称章", "财务专用章", "法定代表人名章", "合同专用章", "发票专用章", "某某专用章");
    /** 备案状态可选项(与后台登记一致) */
    private static final List<String> RECORD_STATUSES =
            List.of("备案刻章", "仅备案", "萝卜章", "仅登报");

    /**
     * 登录经办人生成绑定当前租户、24小时有效的一次性客户链接。
     */
    @PostMapping("/token")
    @PreAuthorize("@perm.hasAnyRole('boss', 'manager', 'dept_manager', 'finance', 'finance_hq', 'sales', 'online_sales')")
    public R<SealPublicTokenService.IssuedToken> issueToken() {
        return R.ok(tokenService.issue());
    }

    /** 返回刻章自助表单的下拉选项。只对持有有效安全票据的客户公开。 */
    @GetMapping("/options")
    public R<Map<String, List<String>>> options(
            @RequestHeader(value = "X-Seal-Ticket", required = false) String token) {
        tokenService.require(token);
        Map<String, List<String>> options = new LinkedHashMap<>();
        options.put("sealStatuses", SEAL_STATUSES);
        options.put("sealCities", SEAL_CITIES);
        options.put("sealMaterials", SEAL_MATERIALS);
        options.put("sealTypes", SEAL_TYPES);
        options.put("recordStatuses", RECORD_STATUSES);
        return R.ok(options);
    }

    /**
     * 客户自助提交基本信息，落库为刻章提单草稿(status=pending, bizType=new, regDate=今天)。
     * 只接收客户可见的基本字段,金额/收款/内部流转字段不开放,由后台人员后续补全。
     */
    @PostMapping("/submit")
    @Log(module = "刻章客户自助", type = Log.OperationType.INSERT)
    @Transactional(rollbackFor = Exception.class)
    public R<Void> submit(@RequestHeader(value = "X-Seal-Ticket", required = false) String token,
                          @RequestBody BizSealOrder payload) {
        SealPublicTokenService.Ticket ticket = tokenService.beginSubmission(token);
        boolean completed = false;
        try {
            BizSealOrder order = toSafeOrder(payload, ticket);
            if (orderMapper.insert(order) != 1) {
                throw new BusinessException("刻章资料保存失败，请稍后重试");
            }
            tokenService.completeSubmission(token);
            completed = true;
            return R.ok();
        } finally {
            if (!completed) {
                tokenService.releaseSubmission(token);
            }
        }
    }

    private BizSealOrder toSafeOrder(BizSealOrder payload, SealPublicTokenService.Ticket ticket) {
        if (payload == null) {
            throw new BusinessException(400, "请填写刻章资料");
        }
        BizSealOrder order = new BizSealOrder();
        order.setCompanyName(required(payload.getCompanyName(), "公司名称", 128));
        order.setLegalPerson(optional(payload.getLegalPerson(), "法人姓名", 64));
        order.setPhone(required(payload.getPhone(), "联系电话", 32));
        order.setSealStatus(choice(payload.getSealStatus(), SEAL_STATUSES, "印章状态"));
        order.setSealCity(choice(payload.getSealCity(), SEAL_CITIES, "刻章城市"));
        order.setSealMaterial(multiple(payload.getSealMaterial(), SEAL_MATERIALS, "印章材质", 16));
        order.setSealTypes(multiple(payload.getSealTypes(), SEAL_TYPES, "印章类型", 128));
        order.setRecordStatus(choice(payload.getRecordStatus(), RECORD_STATUSES, "备案状态"));
        // 公网页不接收身份证等敏感附件；由经办人通过已确认渠道收取后在登录页补录。
        order.setRecipient(optional(payload.getRecipient(), "收件人", 64));
        order.setAddress(optional(payload.getAddress(), "收件地址", 255));
        order.setRemark(optional(payload.getRemark(), "备注", 255));

        LocalDate today = LocalDate.now();
        order.setRegDate(today);
        order.setBillYear(String.valueOf(today.getYear()));
        order.setBillMonth(String.format("%02d", today.getMonthValue()));
        order.setBizType("new");
        order.setStatus("pending");
        order.setTenantId(ticket.tenantId());
        order.setCreateBy(ticket.issuedBy());
        order.setUpdateBy(ticket.issuedBy());
        return order;
    }

    private String required(String value, String label, int maxLength) {
        String result = optional(value, label, maxLength);
        if (!StringUtils.hasText(result)) {
            throw new BusinessException(400, "请填写" + label);
        }
        return result;
    }

    private String optional(String value, String label, int maxLength) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        String result = value.trim();
        if (result.length() > maxLength) {
            throw new BusinessException(400, label + "不能超过" + maxLength + "个字符");
        }
        return result;
    }

    private String choice(String value, List<String> allowed, String label) {
        String result = optional(value, label, 32);
        if (result != null && !allowed.contains(result)) {
            throw new BusinessException(400, label + "不在可选范围内，请重新选择");
        }
        return result;
    }

    private String multiple(String value, List<String> allowed, String label, int maxLength) {
        String result = optional(value, label, maxLength);
        if (result == null) {
            return null;
        }
        java.util.LinkedHashSet<String> normalized = new java.util.LinkedHashSet<>();
        for (String item : result.split(",")) {
            String choice = item.trim();
            if (!allowed.contains(choice)) {
                throw new BusinessException(400, label + "不在可选范围内，请重新选择");
            }
            normalized.add(choice);
        }
        return String.join(",", normalized);
    }

}
