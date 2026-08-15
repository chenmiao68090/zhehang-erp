package com.zhehang.erp.modules.admin.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.admin.domain.AdminSealUse;
import com.zhehang.erp.modules.admin.mapper.AdminSealUseMapper;
import com.zhehang.erp.modules.org.domain.entity.OrgEmployee;
import com.zhehang.erp.modules.org.mapper.OrgEmployeeMapper;
import com.zhehang.erp.modules.system.domain.entity.SysUser;
import com.zhehang.erp.modules.system.mapper.SysUserMapper;
import com.zhehang.erp.modules.workflow.domain.entity.WfInstance;
import com.zhehang.erp.modules.workflow.service.ApprovalCallbackHandler;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.Map;

/**
 * 用章(seal 流程)审批联动:审批通过后自动写一条印章使用登记(admin_seal_use),
 * 让"用印审批"与"用印登记台账"闭环(此前 admin_seal_use 全靠手工录入,与审批无关)。
 * 登记默认 userConfirm=0(待用印人现场确认),驳回/撤销不留登记。
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class SealApprovalHandler implements ApprovalCallbackHandler {

    public static final String BIZ_TYPE = "admin_seal_use";

    private final AdminSealUseMapper sealUseMapper;
    private final OrgEmployeeMapper orgEmployeeMapper;
    private final SysUserMapper userMapper;
    private final ObjectMapper objectMapper;

    @Override
    public String bizType() {
        return BIZ_TYPE;
    }

    // onStarted 不建登记:用印记录只在审批通过后落台账,避免半途单据污染登记表

    @Override
    public void onApproved(WfInstance instance) {
        Map<String, Object> form = parseForm(instance);
        AdminSealUse u = new AdminSealUse();
        u.setUseDate(LocalDate.now());
        u.setSerialNo("YZ" + instance.getId() + System.nanoTime() % 100000);
        u.setApplicant(resolveName(instance.getInitiatorId()));
        u.setSealType(str(form.get("sealType")));
        u.setReason(str(form.get("usage")));
        u.setPageCount(parseInt(form.get("copies")));
        u.setUserConfirm(0); // 待用印人确认
        u.setRemark("审批通过自动登记(审批单#" + instance.getId() + ")");
        sealUseMapper.insert(u);
        // 用印登记ID回填 bizId(此前发起时未建单,onApproved 才有 id)
        instance.setBizId(u.getId());
    }

    private String resolveName(Long userId) {
        if (userId == null) {
            return null;
        }
        OrgEmployee emp = orgEmployeeMapper.selectOne(new LambdaQueryWrapper<OrgEmployee>()
                .eq(OrgEmployee::getUserId, userId).orderByDesc(OrgEmployee::getId).last("limit 1"));
        if (emp != null && StringUtils.hasText(emp.getName())) {
            return emp.getName();
        }
        SysUser su = userMapper.selectById(userId);
        return su == null ? null : (StringUtils.hasText(su.getNickname()) ? su.getNickname() : su.getUsername());
    }

    private Map<String, Object> parseForm(WfInstance instance) {
        try {
            return objectMapper.readValue(instance.getFormData(), new TypeReference<Map<String, Object>>() {});
        } catch (Exception ex) {
            throw new BusinessException("用章表单数据解析失败,无法生成用印登记");
        }
    }

    private Integer parseInt(Object o) {
        try {
            return (int) Double.parseDouble(o.toString().trim());
        } catch (Exception e) {
            return null;
        }
    }

    private String str(Object o) {
        return o == null || !StringUtils.hasText(o.toString()) ? null : o.toString();
    }
}
