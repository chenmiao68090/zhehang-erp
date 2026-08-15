package com.zhehang.erp.modules.hrm.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.zhehang.erp.common.core.annotation.DenyDuringImpersonation;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.hrm.domain.entity.HrmSocialFund;
import com.zhehang.erp.modules.hrm.mapper.HrmSocialFundMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 人力组织-社保公积金台账。
 */
@RestController
@RequestMapping("/hrm/social-fund")
@RequiredArgsConstructor
@DenyDuringImpersonation(reason = "社保、身份证及手机号信息")
public class HrmSocialFundController {

    private final HrmSocialFundMapper mapper;
    private final DataScopeHelper dataScopeHelper;

    @GetMapping("/list")
    public R<Map<String, Object>> list(@RequestParam(defaultValue = "1") Integer pageNum,
                                       @RequestParam(defaultValue = "10") Integer pageSize,
                                       @RequestParam(required = false) String recordMonth,
                                       @RequestParam(required = false) Long employeeId,
                                       @RequestParam(required = false) String keyword) {
        assertHr();
        LambdaQueryWrapper<HrmSocialFund> wrapper = baseWrapper(recordMonth, employeeId, keyword)
                .orderByDesc(HrmSocialFund::getRecordMonth)
                .orderByAsc(HrmSocialFund::getEmployeeName)
                .orderByDesc(HrmSocialFund::getId);
        IPage<HrmSocialFund> page = mapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
        Map<String, Object> result = new HashMap<>();
        result.put("page", page);
        result.put("stats", buildStats(recordMonth, employeeId, keyword));
        return R.ok(result);
    }

    @PostMapping("/save")
    @Log(module = "社保公积金", type = Log.OperationType.UPDATE)
    public R<Void> save(@RequestBody HrmSocialFund entity) {
        assertHr();
        normalize(entity);
        if (entity.getId() == null) {
            mapper.insert(entity);
        } else {
            mapper.updateById(entity);
        }
        return R.ok();
    }

    @PostMapping("/batch-save")
    @Log(module = "社保公积金", type = Log.OperationType.INSERT)
    public R<Integer> batchSave(@RequestBody List<HrmSocialFund> list) {
        assertHr();
        if (list == null || list.isEmpty()) {
            return R.ok(0);
        }
        int count = 0;
        for (HrmSocialFund item : list) {
            if (item == null) {
                continue;
            }
            normalize(item);
            item.setId(null);
            mapper.insert(item);
            count++;
        }
        return R.ok(count);
    }

    @DeleteMapping("/{id}")
    @Log(module = "社保公积金", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        assertHr();
        mapper.deleteById(id);
        return R.ok();
    }

    private LambdaQueryWrapper<HrmSocialFund> baseWrapper(String recordMonth, Long employeeId, String keyword) {
        return new LambdaQueryWrapper<HrmSocialFund>()
                .eq(StringUtils.hasText(recordMonth), HrmSocialFund::getRecordMonth, recordMonth)
                .eq(employeeId != null, HrmSocialFund::getEmployeeId, employeeId)
                .and(StringUtils.hasText(keyword), w -> w
                        .like(HrmSocialFund::getEmployeeName, keyword)
                        .or().like(HrmSocialFund::getIdCard, keyword)
                        .or().like(HrmSocialFund::getPhone, keyword));
    }

    private Map<String, Object> buildStats(String recordMonth, Long employeeId, String keyword) {
        List<HrmSocialFund> list = mapper.selectList(baseWrapper(recordMonth, employeeId, keyword));
        BigDecimal socialCompany = BigDecimal.ZERO;
        BigDecimal fundCompany = BigDecimal.ZERO;
        long socialPeople = 0;
        long fundPeople = 0;
        for (HrmSocialFund item : list) {
            BigDecimal social = money(item.getPensionCompany())
                    .add(money(item.getUnemploymentCompany()))
                    .add(money(item.getWorkInjuryCompany()))
                    .add(money(item.getMedicalCompany()));
            BigDecimal fund = money(item.getHousingFundCompany());
            socialCompany = socialCompany.add(social);
            fundCompany = fundCompany.add(fund);
            if (social.compareTo(BigDecimal.ZERO) > 0) {
                socialPeople++;
            }
            if (fund.compareTo(BigDecimal.ZERO) > 0) {
                fundPeople++;
            }
        }
        Map<String, Object> stats = new HashMap<>();
        stats.put("socialPeople", socialPeople);
        stats.put("fundPeople", fundPeople);
        stats.put("socialCompanyTotal", socialCompany);
        stats.put("fundCompanyTotal", fundCompany);
        return stats;
    }

    private void normalize(HrmSocialFund item) {
        if (item == null) {
            throw new BusinessException("社保公积金记录不能为空");
        }
        if (!StringUtils.hasText(item.getRecordMonth())) {
            throw new BusinessException("请选择月份");
        }
        item.setRecordMonth(item.getRecordMonth().trim());
        if (!StringUtils.hasText(item.getEmployeeName())) {
            throw new BusinessException("请填写或选择员工");
        }
        item.setEmployeeName(item.getEmployeeName().trim());
    }

    private BigDecimal money(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private void assertHr() {
        if (!dataScopeHelper.isHrAdminOrBoss()) {
            throw new BusinessException("无权限,仅HR/管理员/老板可维护社保公积金");
        }
    }
}
