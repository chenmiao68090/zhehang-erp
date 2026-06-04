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

    /** 报税日历：某月各客户应申报的税种与截止日 */
    List<Map<String, Object>> taxCalendar(String month);
}
