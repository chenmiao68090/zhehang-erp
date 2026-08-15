package com.zhehang.erp.modules.crm.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.zhehang.erp.modules.crm.domain.entity.CrmTaxProfile;

import java.util.List;
import java.util.Map;

public interface ICrmTaxProfileService extends IService<CrmTaxProfile> {

    /** 按统一社会信用代码获取税务档案（无则返回 null） */
    CrmTaxProfile getByCreditCode(String creditCode);

    /** 按统一社会信用代码 upsert（存在则更新，否则新增） */
    CrmTaxProfile saveOrUpdateByCreditCode(CrmTaxProfile profile);

    /**
     * 报税日历入口。接入可核验的期限与申报结果数据源前必须明确拒绝，
     * 不能根据税务档案里的主申报周期推算截止日或申报状态。
     */
    List<Map<String, Object>> taxCalendar(String month);
}
